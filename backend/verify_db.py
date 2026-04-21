import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Load .env manually if needed, but we can just use the URL
DATABASE_URL = "postgresql+asyncpg://postgres:Postgresql18%24@localhost:5432/stayos"

async def verify_tables():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result.fetchall()]
        print(f"Current tables: {tables}")
        
        if "guest_magic_links" in tables:
            print("SUCCESS: guest_magic_links table exists!")
        else:
            print("FAILED: guest_magic_links table MISSING!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_tables())
