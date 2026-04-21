from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import async_session_maker
from app.models.tenant import Tenant
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Resolves the current tenant from the request.
    Priority: Header > Host (Subdomain) > Dev Fallback (if APP_DEBUG=True).
    """

    EXEMPT_PATHS = ["/health", "/docs", "/openapi.json", "/redoc", "/api/v1/super-admin", "/api/v1/auth", "/api/v1/hotels", "/uploads"]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Safe defaults
        request.state.tenant_id = None
        request.state.tenant = None

        # 1. Skip tenant resolution for exempt paths and OPTIONS (CORS)
        if request.method == "OPTIONS" or path == "/" or any(path.startswith(p) for p in self.EXEMPT_PATHS):
            return await call_next(request)

        # 2. Extract Tenant ID from Header (X-Tenant-ID)
        tenant_id = request.headers.get("X-Tenant-ID")

        # 3. Fallback: Host-based extraction (Subdomain slug)
        slug = None
        if not tenant_id:
            host = request.headers.get("host", "")
            slug = self._extract_slug(host)

        # 4. Dev Fallback: Default to Tenant ID 1 if APP_DEBUG is True
        if not tenant_id and not slug and settings.APP_DEBUG:
            tenant_id = "1"

        # 5. Resolution Logic
        if not tenant_id and not slug:
            return JSONResponse(
                status_code=400, 
                content={"detail": "Tenant identification missing (Header or Host required)"}
            )

        # Logged/Resolved Tenant fetch
        try:
            resolved_tenant = await self._get_tenant(id=tenant_id, slug=slug)
            if not resolved_tenant:
                return JSONResponse(status_code=404, content={"detail": f"Tenant not found (ID: {tenant_id} or Slug: {slug})"})
            
            request.state.tenant_id = resolved_tenant.id
            request.state.tenant = resolved_tenant
            
        except Exception as e:
            import traceback
            print(f"❌ [TenantMiddleware] CRITICAL ERROR:")
            traceback.print_exc()
            response = JSONResponse(status_code=500, content={"detail": f"Tenant resolution error: {str(e)}"})
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            return response

        return await call_next(request)

    def _extract_slug(self, host: str) -> str | None:
        parts = host.split(".")
        if len(parts) >= 3:
            return parts[0]
        return None

    async def _get_tenant(self, id: str = None, slug: str = None) -> Tenant | None:
        """Fetch tenant from DB by ID or Slug."""
        async with async_session_maker() as session:
            if id:
                try:
                    result = await session.execute(select(Tenant).where(Tenant.id == int(id)))
                except (ValueError, TypeError):
                    return None
            else:
                result = await session.execute(select(Tenant).where(Tenant.slug == slug))
            tenant = result.scalar_one_or_none()
            
        return tenant
