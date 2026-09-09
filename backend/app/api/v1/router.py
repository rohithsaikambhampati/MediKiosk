from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    patients,
    intake,
    conversations,
    documents,
    facts,
    timeline,
    risk,
    evidence,
    verification,
    queue,
    doctor,
    nurse,
    admin,
    consents,
    handoffs,
    interoperability,
    demo,
    tts,
)

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(patients.router)
api_v1_router.include_router(intake.router)
api_v1_router.include_router(conversations.router)
api_v1_router.include_router(documents.router)
api_v1_router.include_router(facts.router)
api_v1_router.include_router(timeline.router)
api_v1_router.include_router(risk.router)
api_v1_router.include_router(evidence.router)
api_v1_router.include_router(verification.router)
api_v1_router.include_router(queue.router)
api_v1_router.include_router(doctor.router)
api_v1_router.include_router(nurse.router)
api_v1_router.include_router(admin.router)
api_v1_router.include_router(consents.router)
api_v1_router.include_router(handoffs.router)
api_v1_router.include_router(interoperability.router)
api_v1_router.include_router(demo.router)
api_v1_router.include_router(tts.router)
