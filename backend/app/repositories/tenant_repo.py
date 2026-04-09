from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.tenant import Tenant
from typing import List, Optional


class TenantRepository:
    """Repository for Tenant-related database operations."""

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Tenant:
        """Create a new tenant, initialize a default hotel, and return with data loaded."""
        from app.models.hotel import Hotel
        
        tenant = Tenant(**data)
        db.add(tenant)
        await db.flush() # Get tenant ID without committing yet
        
        # Initialize default hotel for the tenant
        default_hotel = Hotel(
            tenant_id=tenant.id,
            name=tenant.name,
            star_rating=3,
            is_active=True
        )
        db.add(default_hotel)
        
        await db.commit()
        
        # Re-fetch with selectinload to avoid MissingGreenlet error during serialization
        from sqlalchemy.orm import selectinload
        query = select(Tenant).options(selectinload(Tenant.hotels)).where(Tenant.id == tenant.id)
        result = await db.execute(query)
        return result.scalar_one()

    @staticmethod
    async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Tenant]:
        """Get all tenants with associated hotels."""
        from sqlalchemy.orm import selectinload
        query = (
            select(Tenant)
            .options(selectinload(Tenant.hotels))
            .where(Tenant.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_count(db: AsyncSession) -> int:
        """Get total count of tenants."""
        from sqlalchemy import func
        query = select(func.count()).select_from(Tenant).where(Tenant.is_deleted == False)
        result = await db.execute(query)
        return result.scalar() or 0

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> Optional[Tenant]:
        """Get tenant by slug with hotels loaded."""
        from sqlalchemy.orm import selectinload
        query = (
            select(Tenant)
            .options(selectinload(Tenant.hotels))
            .where(Tenant.slug == slug, Tenant.is_deleted == False)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, tenant_id: int) -> Optional[Tenant]:
        """Get tenant by ID with hotels loaded."""
        from sqlalchemy.orm import selectinload
        query = (
            select(Tenant)
            .options(selectinload(Tenant.hotels))
            .where(Tenant.id == tenant_id, Tenant.is_deleted == False)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, tenant_id: int, data: dict) -> Optional[Tenant]:
        """Update tenant by ID, including its primary hotel details."""
        from sqlalchemy.orm import selectinload
        query = select(Tenant).options(selectinload(Tenant.hotels)).where(Tenant.id == tenant_id, Tenant.is_deleted == False)
        result = await db.execute(query)
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            return None
        
        # Handle Hotel updates if present
        hotel_data = {}
        if "hotel_name" in data:
            hotel_data["name"] = data.pop("hotel_name")
        if "star_rating" in data:
            hotel_data["star_rating"] = data.pop("star_rating")
            
        if hotel_data and tenant.hotels:
            primary_hotel = tenant.hotels[0]
            for key, value in hotel_data.items():
                setattr(primary_hotel, key, value)
            db.add(primary_hotel)
        
        # Handle Tenant updates
        for key, value in data.items():
            setattr(tenant, key, value)
        
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)
        return tenant

    @staticmethod
    async def delete(db: AsyncSession, tenant_id: int) -> bool:
        """Soft delete tenant by ID."""
        tenant = await TenantRepository.get_by_id(db, tenant_id)
        if not tenant:
            return False
            
        tenant.is_deleted = True
        db.add(tenant)
        await db.commit()
        return True
