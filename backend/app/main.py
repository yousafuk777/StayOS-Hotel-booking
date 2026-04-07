import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router
from app.middleware.tenant import TenantMiddleware
from app.core.config import settings
from app.core.database import Base, engine, async_session_maker
from app.seed_db import seed_super_admin

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


@app.on_event("startup")
async def startup_db_client():
    """Create database tables and seed initial data on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create super-admin if they don't exist
    async with async_session_maker() as session:
        await seed_super_admin(session)


from fastapi.responses import RedirectResponse

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}

@app.get("/")
async def root():
    """Redirect root to API documentation."""
    return RedirectResponse(url="/docs")
