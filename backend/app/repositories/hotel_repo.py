from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.hotel import Hotel
from typing import List, Optional


class HotelRepository:
    """Repository for Hotel-related database operations."""

    @staticmethod
    async def get_by_tenant_id(db: AsyncSession, tenant_id: int) -> Optional[Hotel]:
        """Get hotel by tenant ID."""
        query = select(Hotel).where(Hotel.tenant_id == tenant_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, hotel_id: int) -> Optional[Hotel]:
        """Get hotel by ID."""
        query = select(Hotel).where(Hotel.id == hotel_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, hotel_id: int, data: dict) -> Optional[Hotel]:
        """Update hotel by ID."""
        hotel = await HotelRepository.get_by_id(db, hotel_id)
        if not hotel:
            return None
        
        for key, value in data.items():
            if hasattr(hotel, key):
                setattr(hotel, key, value)
        
        db.add(hotel)
        await db.commit()
        await db.refresh(hotel)
        return hotel
