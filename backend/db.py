import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_conn():
    # Paste your URL here
    # The format is: user:password@host:port/database
    url = "postgresql+asyncpg://postgres:92276336@localhost:5432/stayos"
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            print("✅ Successfully connected to stayos!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

asyncio.run(test_conn())