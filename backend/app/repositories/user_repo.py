from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
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

    @staticmethod
    async def get_by_email(db: AsyncSession, tenant_id: int, email: str):
        """Get user by email within a tenant, with tenant details."""
        result = await db.execute(
            select(User)
            .options(selectinload(User.tenant))
            .where(and_(User.tenant_id == tenant_id, User.email == email))
        )
        return result.scalars().first()

    @classmethod
    async def get_by_email_global(cls, db: AsyncSession, email: str):
        """Get user by email across all tenants (Central Login)."""
        # Prioritize Super Admins (tenant_id IS NULL)
        result = await db.execute(
            select(User)
            .where(User.email == email, User.is_deleted == False)
            .order_by(User.tenant_id.is_not(None)) # NULLs first (False < True)
        )
        return result.scalars().first()

    @classmethod
    async def create(cls, db: AsyncSession, tenant_id, data: dict):
        """Create a new user."""
        # Remove tenant_id from data if it exists to avoid duplicate keyword argument errors
        data.pop('tenant_id', None)
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
    async def get_tenant_staff(cls, db: AsyncSession, tenant_id: int):
        """Get all staff members for a specific tenant (excluding guests)."""
        from app.models.user import UserRole
        # Exclude only guests and super admins for the hotel-level staff view
        excluded_roles = [UserRole.guest, UserRole.super_admin]
        result = await db.execute(
            select(User)
            .where(
                and_(
                    User.tenant_id == tenant_id,
                    User.role.not_in(excluded_roles),
                    User.is_deleted == False
                )
            )
            .order_by(User.created_at.desc())
        )
        return result.scalars().all()

    @classmethod
    async def get_all_staff_global(cls, db: AsyncSession):
        """Get all staff members across all tenants (excluding guests)."""
        from app.models.user import UserRole
        # Exclude only guests for global view, Super Admins can be seen by other Super Admins if needed
        # but usually we want to see hotel-level staff.
        excluded_roles = [UserRole.guest]
        result = await db.execute(
            select(User)
            .where(
                and_(
                    User.role.not_in(excluded_roles),
                    User.is_deleted == False
                )
            )
            .order_by(User.created_at.desc())
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
    async def update_global(cls, db: AsyncSession, user_id: int, data: dict):
        """Update user record globally (Super Admin)."""
        user = await cls.get_by_id(db, user_id)
        if user:
            for key, value in data.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            await db.commit()
            await db.refresh(user)
        return user

    @classmethod
    async def delete_global(cls, db: AsyncSession, user_id: int):
        """Soft delete user record globally (Super Admin)."""
        user = await cls.get_by_id(db, user_id)
        if user:
            user.is_deleted = True
            await db.commit()
            return True
        return False

    @classmethod
    async def set_verification_token(cls, db: AsyncSession, user_id: int, token: str):
        """Store email verification token (simplified)."""
        pass
