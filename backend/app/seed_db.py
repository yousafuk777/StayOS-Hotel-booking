import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.core.security import hash_password

async def seed_super_admin(db: AsyncSession):
    """
    Check for existing super-admin and create one if not found.
    This ensures all teammates can access the platform dashboard.
    """
    result = await db.execute(
        select(User).where(
            User.role == UserRole.super_admin,
            User.tenant_id == None
        )
    )
    existing_admin = result.scalar_one_or_none()

    if not existing_admin:
        new_admin = User(
            email="admin@stayos.com",
            hashed_password=hash_password("admin123"),
            first_name="Super",
            last_name="Admin",
            role=UserRole.super_admin,
            tenant_id=None,
            is_active=True,
            is_verified=True
        )
        db.add(new_admin)
        await db.commit()
        print("INFO: Super-Admin created successfully (admin@stayos.com / admin123)")
    else:
        print(f"INFO: Super-Admin already exists ({existing_admin.email})")
