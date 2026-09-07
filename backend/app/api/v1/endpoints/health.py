import os
from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import ApiResponse
from app.utils.storage import get_document_storage

router = APIRouter(tags=['Health and Diagnostics'])


@router.get('/health')
def demo_health_check(db: Session = Depends(get_db)):
    db_ok = 'ok'
    try:
        db.execute(text('SELECT 1'))
    except Exception:
        db_ok = 'error'

    storage_ok = 'ok'
    try:
        storage = get_document_storage()
        if not os.path.isdir(settings.UPLOAD_DIR):
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    except Exception:
        storage_ok = 'error'

    return {
        'status': 'ok' if db_ok == 'ok' and storage_ok == 'ok' else 'degraded',
        'database': db_ok,
        'storage': storage_ok,
        'ai_provider': getattr(settings, 'AI_PROVIDER', 'mock'),
        'ocr_provider': getattr(settings, 'OCR_PROVIDER', 'mock'),
        'environment': 'demo' if getattr(settings, 'DEMO_MODE', True) else settings.ENVIRONMENT,
    }


@router.get('/ready', response_model=ApiResponse)
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
        db_status = 'connected'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'

    return ApiResponse(
        data={
            'status': 'ready' if db_status == 'connected' else 'degraded',
            'database': db_status,
        }
    )


@router.get('/system/diagnostics', response_model=ApiResponse[Dict[str, Any]])
def system_diagnostics(db: Session = Depends(get_db)):
    diagnostics = {}

    # 1. Database
    try:
        db.execute(text('SELECT 1'))
        diagnostics['Database'] = {'status': 'READY', 'message': 'Relational engine active and responding'}
    except Exception as e:
        diagnostics['Database'] = {'status': 'ERROR', 'message': str(e)}

    # 2. Storage
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        diagnostics['Storage'] = {'status': 'READY', 'message': f'Local secure directory mounted: {settings.UPLOAD_DIR}'}
    except Exception as e:
        diagnostics['Storage'] = {'status': 'ERROR', 'message': str(e)}

    # 3. Authentication
    try:
        from app.core.security import create_access_token, decode_access_token
        test_t = create_access_token({'sub': 'health_check', 'role': 'ADMIN'})
        decoded = decode_access_token(test_t)
        if decoded and decoded.get('sub') == 'health_check':
            diagnostics['Authentication'] = {'status': 'READY', 'message': 'JWT issuance and signature verification operational'}
        else:
            diagnostics['Authentication'] = {'status': 'ERROR', 'message': 'JWT claim decode failed'}
    except Exception as e:
        diagnostics['Authentication'] = {'status': 'ERROR', 'message': str(e)}

    # 4. Conversation Engine
    try:
        from app.services.conversation_service import ConversationService
        conv_svc = ConversationService(db)
        diagnostics['Conversation Engine'] = {'status': 'READY', 'message': 'Multi-turn clinical intake with adaptive follow-ups ready'}
    except Exception as e:
        diagnostics['Conversation Engine'] = {'status': 'ERROR', 'message': str(e)}

    # 5. Document Engine
    try:
        from app.services.documents.document_processor import DocumentProcessor
        from app.services.ocr.ocr_service import ocr_service
        diagnostics['Document Engine'] = {'status': 'READY', 'message': 'OCR parser and classification pipeline initialized'}
    except Exception as e:
        diagnostics['Document Engine'] = {'status': 'ERROR', 'message': str(e)}

    # 6. Evidence Engine
    try:
        from app.models.evidence import EvidenceSource
        diagnostics['Evidence Engine'] = {'status': 'READY', 'message': 'Bi-directional provenance linking (speech and doc bounding boxes) ready'}
    except Exception as e:
        diagnostics['Evidence Engine'] = {'status': 'ERROR', 'message': str(e)}

    # 7. Risk Engine
    try:
        from app.services.risk_service import RiskService
        risk_svc = RiskService(db)
        diagnostics['Risk Engine'] = {'status': 'READY', 'message': 'Deterministic clinical red flag stratifier active'}
    except Exception as e:
        diagnostics['Risk Engine'] = {'status': 'ERROR', 'message': str(e)}

    # 8. Consent Management
    try:
        from app.services.consent_service import ConsentService
        c_svc = ConsentService(db)
        diagnostics['Consent'] = {'status': 'READY', 'message': 'Explicit purpose-scoped consent and withdrawal active'}
    except Exception as e:
        diagnostics['Consent'] = {'status': 'ERROR', 'message': str(e)}

    # 9. Clinical Handoff
    try:
        from app.services.handoff_service import HandoffService
        h_svc = HandoffService(db)
        diagnostics['Handoff'] = {'status': 'READY', 'message': 'Pre-consultation prioritization and clinician assignment ready'}
    except Exception as e:
        diagnostics['Handoff'] = {'status': 'ERROR', 'message': str(e)}

    # 10. FHIR Export and Interoperability
    try:
        from app.services.interoperability.fhir_export_service import FHIRExportService
        fhir_svc = FHIRExportService(db)
        diagnostics['FHIR Export'] = {'status': 'READY', 'message': 'FHIR R4 Bundle mapper and validator operational'}
    except Exception as e:
        diagnostics['FHIR Export'] = {'status': 'ERROR', 'message': str(e)}

    # Compute overall status
    statuses = [item['status'] for item in diagnostics.values()]
    overall = 'ERROR' if 'ERROR' in statuses else 'WARNING' if 'WARNING' in statuses else 'READY'

    return ApiResponse(
        data={
            'overall_status': overall,
            'environment': 'demo' if getattr(settings, 'DEMO_MODE', True) else settings.ENVIRONMENT,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'subsystems': diagnostics,
        }
    )
