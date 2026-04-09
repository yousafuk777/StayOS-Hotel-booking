import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router
from app.middleware.tenant import TenantMiddleware
from app.core.config import settings
from app.core.database import Base, engine, async_session_maker
from app.seed_db import seed_super_admin
from fastapi.responses import RedirectResponse
from sqlalchemy import text

# Ensure upload directories exist
for folder in ["rooms", "hotels"]:
    os.makedirs(f"uploads/{folder}", exist_ok=True)

app = FastAPI(
    title="StayOS API",
    description="Multi-Tenant SaaS Hotel Booking & Management Platform",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)

# Middlewares (order matters — outermost first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TenantMiddleware)

# Routes
app.include_router(api_router, prefix="/api/v1")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


async def ensure_users_is_vip_column(conn):
    result = await conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='users' AND column_name='is_vip'"
    ))
    if result.scalar_one_or_none() is None:
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;"))

async def ensure_rooms_housekeeping_columns(conn):
    housekeeping_columns = {
        "housekeeping_status": "VARCHAR(20) NOT NULL DEFAULT 'clean'",
        "housekeeping_priority": "VARCHAR(20) NOT NULL DEFAULT 'normal'",
        "housekeeping_progress": "INTEGER DEFAULT 100",
        "assigned_staff_id": "INTEGER",
        "housekeeping_task": "VARCHAR(100) DEFAULT 'Clean room'",
    }

    for column_name, column_type in housekeeping_columns.items():
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='rooms' AND column_name = :column_name"
        ), {"column_name": column_name})
        if result.scalar_one_or_none() is None:
            await conn.execute(text(
                f"ALTER TABLE rooms ADD COLUMN IF NOT EXISTS {column_name} {column_type};"
            ))

@app.on_event("startup")
async def startup_db_client():
    """Create database tables and seed initial data on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_users_is_vip_column(conn)
        await ensure_rooms_housekeeping_columns(conn)
    
    # Create super-admin if they don't exist
    async with async_session_maker() as session:
        await seed_super_admin(session)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}

@app.get("/")
async def root():
    """Redirect root to API documentation."""
    return RedirectResponse(url="/docs")
