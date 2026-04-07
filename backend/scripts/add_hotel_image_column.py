import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Load .env (simplified loader)
def get_database_url():
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    with open(dotenv_path, 'r') as f:
        for line in f:
            if line.startswith('DATABASE_URL='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    return None

async def run_migration():
    url = get_database_url()
    if not url:
        print("DATABASE_URL not found in .env")
        return

    print(f"Connecting to database...")
    engine = create_async_engine(url)
    
    async with engine.begin() as conn:
        print("Adding image_url column to hotels table...")
        try:
            await conn.execute(text("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);"))
            print("Successfully updated database schema.")
        except Exception as e:
            print(f"Migration failed: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
