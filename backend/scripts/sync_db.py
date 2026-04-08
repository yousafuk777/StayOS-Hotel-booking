import asyncio
from sqlalchemy import text
from app.core.database import engine

async def sync_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Checking for missing column 'is_vip' in 'users' table...")
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='users' AND column_name='is_vip'"
        ))
        column_exists = result.scalar_one_or_none()
        
        if not column_exists:
            print("Adding column 'is_vip' to 'users' table...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;"))
            print("Successfully added 'is_vip' column.")
        else:
            print("Column 'is_vip' already exists.")

        housekeeping_columns = {
            "housekeeping_status": "VARCHAR(20) NOT NULL DEFAULT 'clean'",
            "housekeeping_priority": "VARCHAR(20) NOT NULL DEFAULT 'normal'",
            "housekeeping_progress": "INTEGER DEFAULT 100",
            "assigned_staff_id": "INTEGER",
            "housekeeping_task": "VARCHAR(100) DEFAULT 'Clean room'",
        }

        for column_name, column_type in housekeeping_columns.items():
            print(f"Checking for missing column '{column_name}' in 'rooms' table...")
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='rooms' AND column_name = :column_name"
            ), {"column_name": column_name})
            if result.scalar_one_or_none() is None:
                print(f"Adding column '{column_name}' to 'rooms' table...")
                await conn.execute(text(
                    f"ALTER TABLE rooms ADD COLUMN IF NOT EXISTS {column_name} {column_type};"
                ))
                print(f"Successfully added '{column_name}' column.")
            else:
                print(f"Column '{column_name}' already exists.")

if __name__ == "__main__":
    asyncio.run(sync_db())
