import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

def get_database_url():
    # Try to find .env file in parent directories
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if not os.path.exists(dotenv_path):
        dotenv_path = os.path.join(os.getcwd(), '.env')
    
    if os.path.exists(dotenv_path):
        with open(dotenv_path, 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    return os.getenv("DATABASE_URL")

async def run_migration():
    url = get_database_url()
    if not url:
        print("DATABASE_URL not found")
        return

    print(f"Connecting to database...")
    engine = create_async_engine(url)
    
    async with engine.begin() as conn:
        print("Starting Phase 1 Booking Flow migrations...")
        
        # 1. Add columns to bookings
        print("Adding columns to bookings table...")
        columns_to_add = [
            ("room_id", "INTEGER REFERENCES rooms(id) ON DELETE SET NULL"),
            ("guest_access_token", "VARCHAR(255) UNIQUE"),
            ("guest_access_token_expires_at", "TIMESTAMP"),
            ("expires_at", "TIMESTAMP"),
            ("payment_status", "VARCHAR(20) DEFAULT 'unpaid'")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE bookings ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
                print(f"  - Added {col_name}")
            except Exception as e:
                print(f"  - Failed to add {col_name}: {e}")

        # 2. Make hashed_password nullable in users
        print("Updating users table (hashed_password nullable)...")
        try:
            await conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
            print("  - Updated hashed_password to be nullable")
        except Exception as e:
            print(f"  - Failed to update users table: {e}")

        # 3. Create room overlap index
        print("Creating room overlap index...")
        try:
            await conn.execute(text("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_no_room_overlap
                ON bookings (room_id, check_in_date, check_out_date)
                WHERE status NOT IN ('cancelled', 'expired');
            """))
            print("  - Created idx_no_room_overlap")
        except Exception as e:
            print(f"  - Failed to create index: {e}")

        print("Migration completed.")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
