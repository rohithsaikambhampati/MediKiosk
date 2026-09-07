from datetime import datetime, timedelta, timezone
from typing import Optional, List, Union, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate bcrypt password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token containing payload claims."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user_token_payload(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency to extract and validate current user JWT payload."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTHENTICATION_REQUIRED", "message": "Authentication token missing"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid or expired token"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_role(*allowed_roles: Union[str, List[str], Any]):
    """
    FastAPI dependency factory enforcing role-based authorization.
    Usage: Depends(require_role("DOCTOR", "ADMIN")) or Depends(require_role(["DOCTOR", "ADMIN"]))
    """
    normalized_roles = []
    for r in allowed_roles:
        if isinstance(r, (list, tuple)):
            for sub_r in r:
                normalized_roles.append(str(sub_r.value if hasattr(sub_r, "value") else sub_r).upper())
        else:
            normalized_roles.append(str(r.value if hasattr(r, "value") else r).upper())

    def role_checker(payload: dict = Depends(get_current_user_token_payload)) -> dict:
        user_role = str(payload.get("role", "")).upper()
        if user_role not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "PERMISSION_DENIED",
                    "message": f"User role '{user_role}' is not authorized to access this resource",
                },
            )
        return payload

    return role_checker

