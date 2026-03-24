# 06 — Multi-Tenant Architecture

## Multi-Tenancy Strategy

StayOS uses **Shared Database + Shared Schema** with row-level tenant isolation. This is the most cost-effective strategy for a SaaS platform at scale.

### Comparison of Strategies

| Strategy | Isolation | Cost | Complexity | StayOS |
|----------|-----------|------|------------|--------|
| Separate DB per tenant | Highest | Highest | High | No |
| Separate Schema per tenant | High | Medium | Medium | No |
| Shared DB + row-level | Medium | Low | Low | ✅ Yes |

---

## Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │          Load Balancer (nginx)        │
                    └──────────────┬──────────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
    ┌───────▼──────┐      ┌────────▼─────┐      ┌────────▼─────┐
    │  FastAPI     │      │  FastAPI     │      │  FastAPI     │
    │  Instance 1  │      │  Instance 2  │      │  Instance N  │
    └───────┬──────┘      └──────┬───────┘      └──────┬───────┘
            │                    │                      │
            └────────────────────┴──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     MySQL Primary DB     │
                    │  (all tenants, row-ISO)  │
                    └────────────┬────────────┘
                                 │ Replication
                    ┌────────────▼────────────┐
                    │     MySQL Read Replica   │
                    │  (reporting queries)     │
                    └─────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │                 Redis Cache                          │
    │  search results, session data, rate limiting         │
    └─────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │                 S3 Object Storage                    │
    │  hotel images, room photos, invoices, logos          │
    └─────────────────────────────────────────────────────┘
```

---

## Tenant Resolution Flow

```
1. Request arrives at Load Balancer
   Host: grand-hotel.stayos.com

2. nginx passes to FastAPI (any instance)

3. TenantMiddleware runs BEFORE every endpoint:
   a. Extract subdomain: "grand-hotel"
   b. Look up tenant in DB (or Redis cache)
   c. Set request.state.tenant = Tenant(id=1, slug="grand-hotel")
   d. If tenant not found or inactive: return 404/403

4. Endpoint handler uses request.state.tenant
   All DB queries include WHERE tenant_id = 1

5. Response returned to client
```

### TenantMiddleware Implementation

```python
# app/middleware/tenant.py

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.repositories.tenant import TenantRepository
from app.core.cache import redis_client
import json

class TenantMiddleware(BaseHTTPMiddleware):
    """
    Resolves the current tenant from the request host.
    Injects tenant into request.state for use in route handlers.
    """

    # Paths that don't require tenant resolution
    EXEMPT_PATHS = ["/health", "/docs", "/openapi.json", "/api/v1/super-admin"]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip tenant resolution for exempt paths
        if any(path.startswith(p) for p in self.EXEMPT_PATHS):
            return await call_next(request)

        host = request.headers.get("host", "")
        slug = self._extract_slug(host)

        if not slug:
            raise HTTPException(status_code=400, detail="Invalid host")

        # Try cache first
        tenant = await self._get_tenant_cached(slug)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")

        if not tenant.get("is_active"):
            raise HTTPException(status_code=403, detail="Tenant is inactive")

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
        cache_key = f"tenant:{slug}"
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        # Fetch from DB
        async with get_db_session() as db:
            tenant = await TenantRepository.get_by_slug(db, slug)
            if tenant:
                data = {"id": tenant.id, "slug": tenant.slug, "is_active": tenant.is_active}
                await redis_client.setex(cache_key, 300, json.dumps(data))  # cache 5 min
                return data
        return None
```

---

## Tenant-Scoped Repository Pattern

All data access goes through repositories that enforce tenant scoping:

```python
# app/repositories/base.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class TenantScopedRepository:
    """Base repository that enforces tenant isolation on all queries."""

    model = None  # Override in subclass

    @classmethod
    async def get_all(cls, db: AsyncSession, tenant_id: int, **filters):
        stmt = select(cls.model).where(
            cls.model.tenant_id == tenant_id,
            cls.model.is_deleted == False
        )
        for key, value in filters.items():
            stmt = stmt.where(getattr(cls.model, key) == value)
        result = await db.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def get_by_id(cls, db: AsyncSession, tenant_id: int, record_id: int):
        result = await db.execute(
            select(cls.model).where(
                cls.model.id == record_id,
                cls.model.tenant_id == tenant_id  # CRITICAL: always scope by tenant
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, tenant_id: int, data: dict):
        obj = cls.model(**data, tenant_id=tenant_id)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj


# app/repositories/room.py
class RoomRepository(TenantScopedRepository):
    model = Room

    @classmethod
    async def get_available(cls, db: AsyncSession, tenant_id: int,
                             hotel_id: int, check_in: date, check_out: date):
        # Availability query scoped to tenant
        ...
```

---

## Tenant Configuration Hierarchy

```
Platform Defaults (Super Admin sets)
    └── Tenant Settings (Hotel Admin overrides)
            └── User Preferences (Guest overrides their own view)
```

### Resolution Example (Theme)
```python
def resolve_theme(user_prefs, tenant_settings, platform_defaults):
    return {
        "primary_color": (
            tenant_settings.get("primary_color") or
            platform_defaults["primary_color"]
        ),
        "mode": (
            user_prefs.get("mode") or
            tenant_settings.get("default_mode") or
            "light"
        )
    }
```

---

## Tenant Isolation Verification Checklist

Every API endpoint must satisfy:

- [ ] `tenant_id` is extracted from `request.state.tenant_id`
- [ ] All DB queries filter by `tenant_id`
- [ ] Foreign key lookups verify resource belongs to tenant
- [ ] File uploads stored under tenant-prefixed path: `/{tenant_slug}/images/...`
- [ ] Emails sent using tenant's configured sender name
- [ ] Logs include `tenant_id` for traceability

---

## Subdomain Architecture (nginx config)

```nginx
# /etc/nginx/sites-available/stayos.conf

server {
    listen 443 ssl;
    server_name *.stayos.com;

    ssl_certificate     /etc/ssl/wildcard.stayos.com.crt;
    ssl_certificate_key /etc/ssl/wildcard.stayos.com.key;

    location / {
        proxy_pass http://fastapi_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

upstream fastapi_upstream {
    least_conn;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}
```

---

## Tenant Onboarding Sequence

```
Super Admin creates tenant:
POST /api/v1/super-admin/tenants
{
  "name": "Grand Hotel",
  "slug": "grand-hotel",
  "plan": "professional",
  "admin_email": "manager@grandhotel.com"
}

System actions:
1. INSERT INTO tenants (name, slug, plan, is_active=true)
2. INSERT INTO tenant_settings (tenant_id, defaults)
3. INSERT INTO users (email, role=hotel_admin, tenant_id)
4. Send welcome email with temp password + login URL
5. Create Stripe customer for subscription billing
```
