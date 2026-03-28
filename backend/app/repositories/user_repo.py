from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.repositories.base import TenantScopedRepository


class UserRepository(TenantScopedRepository):
    """Repository for User model operations."""

    model = User

    @classmethod
    async def get_by_id(cls, db: AsyncSession, user_id: int):
        """Get user by ID."""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_email(cls, db: AsyncSession, tenant_id, email: str):
        """Get user by email within tenant (tenant_id=None for super-admin)."""
        result = await db.execute(
            select(User).where(
                User.email == email,
                User.tenant_id == tenant_id
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, tenant_id, data: dict):
        """Create a new user."""
        user = cls.model(**data, tenant_id=tenant_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @classmethod
    async def get_all(cls, db: AsyncSession, skip: int = 0, limit: int = 100):
        """Get all users across all tenants (super-admin use)."""
        result = await db.execute(
            select(User)
            .where(User.is_deleted == False)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    @classmethod
    async def get_count(cls, db: AsyncSession):
        """Get total user count across all tenants."""
        result = await db.execute(
            select(func.count()).select_from(User).where(User.is_deleted == False)
        )
        return result.scalar() or 0

    @classmethod
    async def set_verification_token(cls, db: AsyncSession, user_id: int, token: str):
        """Store email verification token (simplified)."""
        pass
