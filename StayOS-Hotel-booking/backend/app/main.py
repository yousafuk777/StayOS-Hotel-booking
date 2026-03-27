from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.middleware.tenant import TenantMiddleware
from app.core.config import settings
from app.core.database import Base, engine


app = FastAPI(
    title="StayOS API",
    description="Multi-Tenant SaaS Hotel Booking & Management Platform",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)

# Middlewares (order matters — outermost first)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(TenantMiddleware)

# Routes
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_db_client():
    """Create database tables on startup (for development only)."""
    if settings.APP_DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}
