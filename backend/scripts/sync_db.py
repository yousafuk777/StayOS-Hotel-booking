import asyncio
from sqlalchemy import text
from app.core.database import engine

async def sync_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Checking for missing column 'is_vip' in 'users' table...")
        # Check if the column exists
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='users' AND column_name='is_vip'"
        ))
        column_exists = result.scalar_one_or_none()
        
        if not column_exists:
            print("Adding column 'is_vip' to 'users' table...")
            # Use standard PostgreSQL syntax
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;"))
            print("Successfully added 'is_vip' column.")
        else:
            print("Column 'is_vip' already exists.")

if __name__ == "__main__":
    asyncio.run(sync_db())
