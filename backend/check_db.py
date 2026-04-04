import asyncio
from app.core.database import async_session_maker
from app.models.hotel import Hotel
from app.models.user import User
from sqlalchemy import select

async def main():
    async with async_session_maker() as s:
        print("USERS:")
        users = (await s.execute(select(User))).scalars().all()
        for u in users:
            print(f"User {u.email}, role={u.role}, tenant={u.tenant_id}")
            
        print("HOTELS:")
        hotels = (await s.execute(select(Hotel))).scalars().all()
        for h in hotels:
            print(f"Hotel {h.name}, tenant={h.tenant_id}")

if __name__ == "__main__":
    asyncio.run(main())
