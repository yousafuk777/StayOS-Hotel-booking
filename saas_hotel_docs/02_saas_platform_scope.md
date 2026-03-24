# 02 — SaaS Platform Scope

## What is a Multi-Tenant SaaS Platform?

A multi-tenant SaaS platform is a single software deployment that serves multiple customers (tenants). Each tenant's data is isolated, but they all share the same application code and infrastructure.

In StayOS:
- Each **hotel** is a **tenant**
- All hotels share the same backend application and database
- Data is isolated using a `tenant_id` column strategy
- Each tenant can have **custom branding**, **themes**, and **configurations**

---

## Tenancy Model

StayOS uses a **Shared Database, Shared Schema** multi-tenancy model with row-level isolation.

```
┌──────────────────────────────────────────────────────┐
│                  Single MySQL Database                │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  Table: bookings                             │    │
│  │  ┌──────────┬───────────┬────────────────┐  │    │
│  │  │ id       │ tenant_id │ guest_name ...  │  │    │
│  │  ├──────────┼───────────┼────────────────┤  │    │
│  │  │ 1        │ hotel_A   │ John Doe        │  │    │
│  │  │ 2        │ hotel_B   │ Jane Smith      │  │    │
│  │  │ 3        │ hotel_A   │ Bob Wilson      │  │    │
│  │  └──────────┴───────────┴────────────────┘  │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

**Every table** (except `tenants` itself) includes a `tenant_id` foreign key.
All queries in the application are automatically scoped to the current tenant.

---

## Tenant Lifecycle

```
[Hotel Registration Request]
        │
        ▼
[Super Admin Reviews & Approves]
        │
        ▼
[Tenant Record Created in DB]
[Subdomain / Slug Assigned]
[Default Settings Provisioned]
        │
        ▼
[Hotel Admin Invited via Email]
        │
        ▼
[Hotel Admin Sets Up Profile]
[Adds Rooms, Pricing, Policies]
        │
        ▼
[Hotel Goes Live — Bookings Enabled]
        │
        ▼
[Ongoing Operations & Billing]
        │
        ▼
[Suspension / Termination if needed]
```

---

## Tenant Identification Strategy

Tenants are identified via:

### Option A: Subdomain (Recommended for Production)
```
hotel-grand.stayos.com     → tenant_slug = "hotel-grand"
seaside-resort.stayos.com  → tenant_slug = "seaside-resort"
```

### Option B: Path Prefix (Simpler for Development)
```
stayos.com/t/hotel-grand/
stayos.com/t/seaside-resort/
```

### Option C: Custom Domain (Premium Feature)
```
booking.grandhotel.com   → mapped to tenant_id via DNS CNAME
```

**Middleware resolves tenant from request host/path before every API call.**

---

## Tenant Data Isolation

```python
# FastAPI Dependency — resolves current tenant on every request
async def get_current_tenant(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Tenant:
    host = request.headers.get("host", "")
    slug = host.split(".")[0]  # e.g., "hotel-grand"
    tenant = await TenantRepository.get_by_slug(db, slug)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

# All repository queries include tenant_id
async def get_rooms(db: AsyncSession, tenant_id: int):
    result = await db.execute(
        select(Room).where(Room.tenant_id == tenant_id)
    )
    return result.scalars().all()
```

---

## SaaS Platform Scope Boundaries

### In Scope (MVP)

| Area | Features |
|------|----------|
| Multi-Tenancy | Tenant registration, isolation, subdomain routing |
| Booking Engine | Search, availability, booking flow, confirmation |
| Hotel Management | Rooms, pricing, amenities, policies |
| Payments | Stripe integration, invoices, refunds |
| Authentication | JWT, role-based access, password reset |
| Notifications | Email confirmations, booking updates |
| Reviews | Guest reviews and hotel responses |
| Admin Dashboard | Per-tenant admin panel |
| Super Admin | Platform management, analytics |
| Theming | Per-tenant branding, user theme preferences |

### Out of Scope (Future Phases)

| Area | Notes |
|------|-------|
| Native Mobile App | iOS/Android — Phase 6+ |
| Channel Manager | OTA integrations (Booking.com, Expedia) |
| POS System | Restaurant/spa billing integration |
| AI Recommendations | ML-based personalization |
| Multi-Currency | Single currency MVP |

---

## Subscription Plans for Hotels (Tenants)

| Plan | Price | Rooms | Staff | Features |
|------|-------|-------|-------|----------|
| Starter | $49/mo | Up to 20 | 3 | Basic booking, no analytics |
| Professional | $149/mo | Up to 100 | 15 | Full features, analytics |
| Enterprise | Custom | Unlimited | Unlimited | White-label, API access, SLA |

---

## Platform Revenue Model (Super Admin)

- **Subscription fees** from hotels (monthly/annual)
- **Commission** per booking (e.g., 2–5%)
- **Premium features** (custom domains, advanced analytics)
- **Setup fees** for Enterprise clients

---

## Tenant Settings & Configuration

Each tenant can configure:

```json
{
  "tenant_id": 1,
  "slug": "grand-hotel",
  "settings": {
    "currency": "USD",
    "timezone": "America/New_York",
    "check_in_time": "15:00",
    "check_out_time": "11:00",
    "cancellation_policy": "48h",
    "commission_rate": 0.03,
    "booking_confirmation_required": true,
    "theme": {
      "primary_color": "#1a56db",
      "logo_url": "https://cdn.stayos.com/grand-hotel/logo.png",
      "font": "Inter"
    }
  }
}
```
