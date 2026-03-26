from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DECIMAL, TIME, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class TenantSettings(BaseModel):
    __tablename__ = "tenant_settings"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    timezone = Column(String(50), nullable=False, default="UTC")
    check_in_time = Column(TIME, nullable=False, default="15:00:00")
    check_out_time = Column(TIME, nullable=False, default="11:00:00")
    tax_rate = Column(DECIMAL(5, 4), nullable=False, default=0.1000)
    cancellation_hours = Column(Integer, nullable=False, default=48)
    booking_requires_approval = Column(Boolean, nullable=False, default=False)
    default_theme = Column(String(20), nullable=False, default="light")
    primary_color = Column(String(7), nullable=False, default="#1a56db")
    secondary_color = Column(String(7), nullable=False, default="#6b7280")
    logo_url = Column(String(500))
    font_family = Column(String(100), default="Inter")

    # Relationship
    tenant = relationship("Tenant", back_populates="settings")
