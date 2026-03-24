from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Booking(BaseModel):
    __tablename__ = "bookings"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reference_number = Column(String(20), nullable=False, unique=True, index=True)
    check_in_date = Column(DateTime, nullable=False, index=True)
    check_out_date = Column(DateTime, nullable=False, index=True)
    nights = Column(Integer, nullable=False)
    num_guests = Column(Integer, nullable=False, default=1)
    status = Column(
        String(20), 
        nullable=False, 
        default="pending",  # pending, confirmed, checked_in, checked_out, completed, cancelled, rejected, no_show
        index=True
    )
    room_total = Column(DECIMAL(10, 2), nullable=False)
    addon_total = Column(DECIMAL(10, 2), nullable=False, default=0)
    discount_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    tax_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    special_requests = Column(Text)
    cancellation_reason = Column(Text)
    cancelled_at = Column(DateTime)
    confirmed_at = Column(DateTime)

    # Relationships
    tenant = relationship("Tenant")
    hotel = relationship("Hotel", back_populates="bookings")
    guest = relationship("User", foreign_keys=[guest_id], back_populates="bookings")
    rooms = relationship("BookingRoom", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_tenant_status", "tenant_id", "status"),
        Index("idx_dates", "check_in_date", "check_out_date"),
    )


class BookingRoom(BaseModel):
    __tablename__ = "booking_rooms"

    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    nightly_rate = Column(DECIMAL(10, 2), nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="rooms")
    room = relationship("Room", back_populates="booking_rooms")
