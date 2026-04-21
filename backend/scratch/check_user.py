import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.database import async_session_maker
from sqlalchemy import select
from app.models.user import User, UserRole

async def check():
    email = 'bushubalti@gmail.com'
    print(f"Checking for guest users with email: {email}")
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        users = result.scalars().all()
        if not users:
            print(f"No users found with email {email}")
        else:
            for u in users:
                print(f"User: ID={u.id}, Email={u.email}, Role={u.role}, Tenant={u.tenant_id}, Active={u.is_active}")

if __name__ == "__main__":
    asyncio.run(check())
