import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User
from app.core.config import settings

async def check_user():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        SessionLocal = sessionmaker(bind=conn, class_=AsyncSession)
        async with SessionLocal() as db:
            # Check for existing user
            result = await db.execute(
                select(User).where(
                    User.tenant_id == 1,
                    User.email == "youasfuk777@gmail.com"
                )
            )
            user = result.scalar_one_or_none()
            print(f"User exists: {user}")
            if user:
                print(f"User ID: {user.id}, Role: {user.role}, Email: {user.email}")

if __name__ == "__main__":
    asyncio.run(check_user())