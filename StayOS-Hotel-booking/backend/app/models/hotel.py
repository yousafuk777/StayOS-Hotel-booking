from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Hotel(BaseModel):
    __tablename__ = "hotels"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    star_rating = Column(Integer, default=3)
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100), index=True)
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="hotels")
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    room_categories = relationship("RoomCategory", back_populates="hotel", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hotel", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="hotel", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_city", "city"),
        Index("idx_location", "latitude", "longitude"),
    )
