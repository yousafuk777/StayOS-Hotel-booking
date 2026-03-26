from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Index, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Review(BaseModel):
    __tablename__ = "reviews"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Integer, nullable=False)  # 1-10
    cleanliness_score = Column(Integer)
    service_score = Column(Integer)
    location_score = Column(Integer)
    value_score = Column(Integer)
    title = Column(String(255))
    body = Column(Text)
    hotel_response = Column(Text)
    responded_at = Column(DateTime)
    is_flagged = Column(Boolean, nullable=False, default=False)
    is_published = Column(Boolean, nullable=False, default=True)

    # Relationships
    tenant = relationship("Tenant")
    hotel = relationship("Hotel", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")
    guest = relationship("User", back_populates="reviews")

    __table_args__ = (
        Index("idx_hotel_published", "hotel_id", "is_published"),
    )
