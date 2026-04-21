import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.database import async_session_maker
from sqlalchemy import select
from app.models.user import User, UserRole

async def add_guest():
    email = 'bushubalti@gmail.com'
    tenant_id = 1
    print(f"Ensuring guest user {email} exists in Tenant ID {tenant_id}...")
    
    async with async_session_maker() as session:
        # Check if already exists
        result = await session.execute(
            select(User).where(User.email == email, User.tenant_id == tenant_id)
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"User already exists in Tenant {tenant_id}. Role: {existing.role}")
            if existing.role != UserRole.guest:
                print(f"Updating role to guest...")
                existing.role = UserRole.guest
                await session.commit()
            return

        # Create new guest user in Tenant 1
        print("Creating new guest user in Tenant 1...")
        new_user = User(
            email=email,
            tenant_id=tenant_id,
            role=UserRole.guest,
            first_name="Alee",
            last_name="Bushu",
            is_active=True,
            is_verified=True
        )
        session.add(new_user)
        try:
            await session.commit()
            print("Successfully created guest user in Tenant 1.")
        except Exception as e:
            print(f"Error creating user: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(add_guest())
