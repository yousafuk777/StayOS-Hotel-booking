from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.tenant import Tenant
from app.repositories.base import TenantScopedRepository


class TenantRepository(TenantScopedRepository):
    """Repository for Tenant model operations."""

    model = Tenant

    @classmethod
    async def get_by_slug(cls, db: AsyncSession, slug: str):
        """Get tenant by slug."""
        result = await db.execute(
            select(Tenant).where(Tenant.slug == slug)
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_id(cls, db: AsyncSession, tenant_id: int):
        """Get tenant by ID."""
        result = await db.execute(
            select(Tenant).where(Tenant.id == tenant_id)
        )
        return result.scalar_one_or_none()
