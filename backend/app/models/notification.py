from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # booking_confirmed, new_review, etc.
    title = Column(String(255), nullable=False)
    body = Column(Text)
    data = Column(Text)  # JSON string for extra payload
    is_read = Column(Boolean, nullable=False, default=False, index=True)

    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("idx_user_unread", "user_id", "is_read"),
        Index("idx_created", "created_at"),
    )
