from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
    async def get_by_email(cls, db: AsyncSession, tenant_id: int, email: str):
        """Get user by email within tenant."""
        result = await db.execute(
            select(User).where(
                User.email == email,
                User.tenant_id == tenant_id
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, tenant_id: int, data: dict):
        """Create a new user."""
        user = cls.model(**data, tenant_id=tenant_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @classmethod
    async def set_verification_token(cls, db: AsyncSession, user_id: int, token: str):
        """Store email verification token (simplified - would use separate table in production)."""
        # In production, create a separate verification_tokens table
        pass
