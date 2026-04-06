from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    hotel_admin = "hotel_admin"
    hotel_manager = "hotel_manager"
    front_desk = "front_desk"
    housekeeping = "housekeeping"
    guest = "guest"


class User(BaseModel):
    __tablename__ = "users"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    profile_photo = Column(String(500))
    role = Column(
        Enum(UserRole), 
        nullable=False, 
        default=UserRole.guest,
        index=True
    )
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    is_vip = Column(Boolean, nullable=False, default=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    bookings = relationship("Booking", back_populates="guest", foreign_keys="Booking.guest_id")
    reviews = relationship("Review", back_populates="guest", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("email", "tenant_id", name="uq_email_tenant"),
        Index("idx_tenant_role", "tenant_id", "role"),
    )
