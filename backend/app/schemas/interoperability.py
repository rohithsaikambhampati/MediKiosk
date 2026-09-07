from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class FHIRValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class FHIRBundleResponse(BaseModel):
    resourceType: str = "Bundle"
    type: str = "collection"
    id: str
    timestamp: str
    meta: Dict[str, Any]
    entry: List[Dict[str, Any]]
    validation: FHIRValidationResult


class DemoSubmissionRequest(BaseModel):
    patient_id: str
    bundle: Dict[str, Any]


class DemoSubmissionResponse(BaseModel):
    status: str = "accepted"
    mode: str = "demo"
    reference_id: str
    message: str = "Simulated interoperability submission."
    timestamp: str
    resource_count: int = 0
