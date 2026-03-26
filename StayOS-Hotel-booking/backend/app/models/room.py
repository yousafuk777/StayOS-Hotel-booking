from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class RoomCategory(BaseModel):
    __tablename__ = "room_categories"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)  # 'Standard', 'Deluxe', 'Suite'
    description = Column(Text)
    base_price = Column(DECIMAL(10, 2), nullable=False)
    capacity = Column(Integer, nullable=False, default=2)
    bed_type = Column(String(50))  # 'King', 'Queen', 'Twin'
    size_sqm = Column(DECIMAL(6, 2))
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    tenant = relationship("Tenant")
    hotel = relationship("Hotel", back_populates="room_categories")
    rooms = relationship("Room", back_populates="category", cascade="all, delete-orphan")


class Room(BaseModel):
    __tablename__ = "rooms"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("room_categories.id", ondelete="CASCADE"), nullable=False)
    room_number = Column(String(20), nullable=False)
    floor = Column(Integer)
    status = Column(
        String(20), 
        nullable=False, 
        default="available"  # available, occupied, maintenance, out_of_service
    )
    custom_price = Column(DECIMAL(10, 2))  # Override category base_price if set
    notes = Column(Text)

    # Relationships
    tenant = relationship("Tenant")
    hotel = relationship("Hotel", back_populates="rooms")
    category = relationship("RoomCategory", back_populates="rooms")
    images = relationship("RoomImage", back_populates="room", cascade="all, delete-orphan")
    booking_rooms = relationship("BookingRoom", back_populates="room", cascade="all, delete-orphan")

    @property
    def effective_price(self):
        """Return custom_price if set, otherwise category base_price."""
        return self.custom_price if self.custom_price else self.category.base_price

    __table_args__ = (
        UniqueConstraint("hotel_id", "room_number", name="uq_room_number_hotel"),
    )


class RoomImage(BaseModel):
    __tablename__ = "room_images"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    caption = Column(String(255))
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, nullable=False, default=False)

    # Relationships
    tenant = relationship("Tenant")
    room = relationship("Room", back_populates="images")
    hotel = relationship("Hotel")
