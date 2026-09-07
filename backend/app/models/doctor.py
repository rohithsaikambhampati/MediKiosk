from datetime import datetime, timezone
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid

class DoctorStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ON_BREAK = "ON_BREAK"
    OFFLINE = "OFFLINE"
    UNAVAILABLE = "UNAVAILABLE"

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    hospital_id = Column(String(50), nullable=True)
    specialty = Column(String(100), nullable=True)
    room_number = Column(String(50), nullable=True, default="Room #04")
    status = Column(String(20), default=DoctorStatus.ACTIVE.value, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")
    department = relationship("Department")
