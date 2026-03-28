from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.cache import redis_client
import json


from fastapi.responses import JSONResponse

class TenantMiddleware(BaseHTTPMiddleware):
    """
    Resolves the current tenant from the request host.
    Injects tenant into request.state for use in route handlers.
    """

    # Paths that don't require tenant resolution
    EXEMPT_PATHS = ["/health", "/docs", "/openapi.json", "/api/v1/super-admin", "/api/v1/bookings"]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip tenant resolution for exempt paths
        if path == "/" or any(path.startswith(p) for p in self.EXEMPT_PATHS):
            return await call_next(request)

        host = request.headers.get("host", "")
        slug = self._extract_slug(host)

        if not slug:
            return JSONResponse(status_code=400, content={"detail": "Invalid host"})

        # Try cache first
        try:
            tenant = await self._get_tenant_cached(slug)
        except Exception:
            tenant = None
            
        if not tenant:
            return JSONResponse(status_code=404, content={"detail": "Tenant not found"})

        if not tenant.get("is_active"):
            return JSONResponse(status_code=403, content={"detail": "Tenant is inactive"})

        request.state.tenant_id = tenant["id"]
        request.state.tenant_slug = tenant["slug"]
        request.state.tenant = tenant

        return await call_next(request)

    def _extract_slug(self, host: str) -> str | None:
        """Extract subdomain slug from host header."""
        parts = host.split(".")
        if len(parts) >= 3:
            return parts[0]  # e.g., "grand-hotel" from "grand-hotel.stayos.com"
        return None

    async def _get_tenant_cached(self, slug: str) -> dict | None:
        """Get tenant from cache or database."""
        cache_key = f"tenant:{slug}"
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        # Fetch from DB would go here (implemented after models are created)
        # For now, return None to indicate tenant not found
        return None
