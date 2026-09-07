from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.evidence import EvidenceResponse
from app.schemas.common import ApiResponse
from app.repositories.evidence_repository import EvidenceRepository

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get("/fact/{fact_id}", response_model=ApiResponse[List[EvidenceResponse]])
def get_evidence_for_fact(fact_id: str, db: Session = Depends(get_db)):
    repo = EvidenceRepository(db)
    evidence_list = repo.get_by_fact_id(fact_id)
    return ApiResponse(data=[EvidenceResponse.model_validate(e) for e in evidence_list])


@router.get("/document/{document_id}", response_model=ApiResponse[List[EvidenceResponse]])
def get_evidence_for_document(document_id: str, db: Session = Depends(get_db)):
    repo = EvidenceRepository(db)
    evidence_list = repo.get_by_document_id(document_id)
    return ApiResponse(data=[EvidenceResponse.model_validate(e) for e in evidence_list])
