from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.tenant import Tenant
from typing import List, Optional


class TenantRepository:
    """Repository for Tenant-related database operations."""

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Tenant:
        """Create a new tenant."""
        tenant = Tenant(**data)
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)
        return tenant

    @staticmethod
    async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Tenant]:
        """Get all tenants."""
        query = select(Tenant).where(Tenant.is_deleted == False).offset(skip).limit(limit)
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
        """Get tenant by slug."""
        query = select(Tenant).where(Tenant.slug == slug, Tenant.is_deleted == False)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, tenant_id: int) -> Optional[Tenant]:
        """Get tenant by ID."""
        query = select(Tenant).where(Tenant.id == tenant_id, Tenant.is_deleted == False)
        result = await db.execute(query)
        return result.scalar_one_or_none()
