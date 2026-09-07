import os
import shutil
import uuid
from abc import ABC, abstractmethod
from typing import Optional, BinaryIO, Tuple
from app.core.config import settings

class DocumentStorage(ABC):
    """Abstract interface for document file storage providers (Local, S3, GCS)."""

    @abstractmethod
    def save(self, file_obj: BinaryIO, filename: str) -> str:
        """Save a file and return internal storage path or URI."""
        pass

    @abstractmethod
    async def save_file(self, file_data: bytes, filename: str, patient_id: Optional[str] = None) -> Tuple[str, str]:
        """Save file bytes and return (storage_path, file_url)."""
        pass

    @abstractmethod
    def get(self, storage_path: str) -> Optional[bytes]:
        """Retrieve file content as bytes."""
        pass

    @abstractmethod
    def delete(self, storage_path: str) -> bool:
        """Delete file from storage."""
        pass

    @abstractmethod
    def exists(self, storage_path: str) -> bool:
        """Check if file exists in storage."""
        pass


class LocalFileStorage(DocumentStorage):
    """Local filesystem implementation of DocumentStorage."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or settings.UPLOAD_DIR
        os.makedirs(self.base_dir, exist_ok=True)
        os.makedirs(settings.TEMP_DIR, exist_ok=True)

    def save(self, file_obj: BinaryIO, filename: str) -> str:
        file_ext = os.path.splitext(filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        destination = os.path.join(self.base_dir, unique_name)
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
        return unique_name

    async def save_file(self, file_data: bytes, filename: str, patient_id: Optional[str] = None) -> Tuple[str, str]:
        folder = os.path.join(self.base_dir, patient_id) if patient_id else self.base_dir
        os.makedirs(folder, exist_ok=True)
        file_ext = os.path.splitext(filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        destination = os.path.join(folder, unique_name)
        with open(destination, "wb") as buffer:
            buffer.write(file_data)
        relative_path = f"{patient_id}/{unique_name}" if patient_id else unique_name
        return relative_path, f"/api/v1/documents/files/{relative_path}"

    def _resolve_safe_path(self, storage_path: str) -> Optional[str]:
        """Resolves target file path within base_dir, rejecting any directory traversal attempts."""
        if not storage_path or ".." in storage_path:
            return None
        base_abs = os.path.abspath(self.base_dir)
        target_abs = os.path.abspath(os.path.join(base_abs, storage_path))
        if os.path.commonpath([base_abs, target_abs]) != base_abs:
            return None
        return target_abs

    def get(self, storage_path: str) -> Optional[bytes]:
        full_path = self._resolve_safe_path(storage_path)
        if not full_path or not os.path.isfile(full_path):
            return None
        with open(full_path, "rb") as f:
            return f.read()

    def delete(self, storage_path: str) -> bool:
        full_path = self._resolve_safe_path(storage_path)
        if full_path and os.path.isfile(full_path):
            os.remove(full_path)
            return True
        return False

    def exists(self, storage_path: str) -> bool:
        full_path = self._resolve_safe_path(storage_path)
        return bool(full_path and os.path.isfile(full_path))


class SupabaseStorage(DocumentStorage):
    """Supabase Storage implementation of DocumentStorage."""

    def __init__(self, url: str, key: str, bucket_name: str = "medical-documents"):
        from supabase import create_client, Client
        self.client: Client = create_client(url, key)
        self.bucket_name = bucket_name

    def save(self, file_obj: BinaryIO, filename: str) -> str:
        file_bytes = file_obj.read()
        file_ext = os.path.splitext(filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        
        self.client.storage.from_(self.bucket_name).upload(
            file=file_bytes,
            path=unique_name,
            file_options={"content-type": "application/octet-stream"}
        )
        return unique_name

    async def save_file(self, file_data: bytes, filename: str, patient_id: Optional[str] = None) -> Tuple[str, str]:
        file_ext = os.path.splitext(filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        path = f"{patient_id}/{unique_name}" if patient_id else unique_name
        
        content_type = "application/octet-stream"
        if file_ext == ".pdf":
            content_type = "application/pdf"
        elif file_ext in [".jpg", ".jpeg"]:
            content_type = "image/jpeg"
        elif file_ext == ".png":
            content_type = "image/png"

        self.client.storage.from_(self.bucket_name).upload(
            file=file_data,
            path=path,
            file_options={"content-type": content_type}
        )
        
        public_url = self.client.storage.from_(self.bucket_name).get_public_url(path)
        return path, public_url

    def get(self, storage_path: str) -> Optional[bytes]:
        try:
            return self.client.storage.from_(self.bucket_name).download(storage_path)
        except Exception:
            return None

    def delete(self, storage_path: str) -> bool:
        res = self.client.storage.from_(self.bucket_name).remove([storage_path])
        return len(res) > 0

    def exists(self, storage_path: str) -> bool:
        path_parts = storage_path.split("/")
        folder = "/".join(path_parts[:-1]) if len(path_parts) > 1 else ""
        filename = path_parts[-1]
        
        files = self.client.storage.from_(self.bucket_name).list(folder)
        for f in files:
            if f.get("name") == filename:
                return True
        return False


# Default storage singleton
if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
    document_storage = SupabaseStorage(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
else:
    document_storage = LocalFileStorage()

def get_document_storage() -> DocumentStorage:
    return document_storage
