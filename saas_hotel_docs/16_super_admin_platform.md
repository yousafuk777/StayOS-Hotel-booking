# 16 — Super Admin Platform

## Overview

The Super Admin panel is accessible at `admin.stayos.com` (separate subdomain, no tenant context). Only users with `role = super_admin` can access it.

---

## Super Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  StayOS  Super Admin Console                    ◉ Admin User   │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  ▶ Overview         ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  ▶ Tenants          │ Tenants │ │  Users  │ │ Revenue │       │
│  ▶ Users            │  142    │ │  8,450  │ │ $94,200 │       │
│  ▶ Subscriptions    └─────────┘ └─────────┘ └─────────┘       │
│  ▶ Transactions                                                  │
│  ▶ Analytics        ┌───────────────────────────────────────┐  │
│  ▶ System Health    │  Monthly Recurring Revenue (MRR)      │  │
│  ▶ Audit Logs       │  [   Area Chart                    ]  │  │
│  ▶ Settings         └───────────────────────────────────────┘  │
│  ▶ CMS                                                          │
│                     ┌───────────────────────────────────────┐  │
│                     │  New Tenant Applications (pending)    │  │
│                     └───────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## Super Admin API — Tenants

```python
# app/api/v1/super_admin/tenants.py

from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.permissions import RequireSuperAdmin
from app.services.tenant_service import TenantService

router = APIRouter()

@router.get("/tenants")
async def list_tenants(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireSuperAdmin),
    status: Optional[str] = None,
    page: int = Query(default=1),
    page_size: int = Query(default=20),
):
    return await TenantService.get_all(db, status=status, page=page, page_size=page_size)


@router.post("/tenants", status_code=201)
async def create_tenant(
    body: TenantCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireSuperAdmin),
):
    """
    Onboard a new hotel tenant.
    Creates tenant record, default settings, and admin user.
    """
    tenant = await TenantService.create_tenant(db, body)
    return tenant


@router.put("/tenants/{tenant_id}/status")
async def update_tenant_status(
    tenant_id: int,
    body: TenantStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireSuperAdmin),
):
    """Activate, suspend, or terminate a tenant."""
    await TenantService.update_status(db, tenant_id, body.status, body.reason)
    return {"message": f"Tenant status updated to {body.status}"}


@router.get("/tenants/{tenant_id}/analytics")
async def tenant_analytics(
    tenant_id: int,
    period: str = Query(default="month"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireSuperAdmin),
):
    return await AnalyticsService.tenant_stats(db, tenant_id, period)
```

---

## Tenant Service (Creation Flow)

```python
# app/services/tenant_service.py

import secrets
from app.repositories.tenant_repo import TenantRepository
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password
from app.tasks.email_tasks import send_tenant_welcome_email
import stripe

class TenantService:

    @staticmethod
    async def create_tenant(db: AsyncSession, data: TenantCreate) -> dict:
        # 1. Create tenant record
        tenant = await TenantRepository.create(db, {
            "name": data.name,
            "slug": data.slug,
            "plan": data.plan,
            "status": "active",
        })

        # 2. Create default tenant settings
        await TenantSettingsRepository.create(db, tenant.id, {
            "currency": data.currency or "USD",
            "timezone": data.timezone or "UTC",
            "commission_rate": data.commission_rate or 0.03,
        })

        # 3. Create Stripe customer
        customer = stripe.Customer.create(
            name=data.name,
            email=data.admin_email,
            metadata={"tenant_id": str(tenant.id)}
        )
        await TenantRepository.update(db, tenant.id, {
            "stripe_customer_id": customer.id
        })

        # 4. Create admin user
        temp_password = secrets.token_urlsafe(12)
        admin = await UserRepository.create(db, tenant.id, {
            "email": data.admin_email,
            "hashed_password": hash_password(temp_password),
            "first_name": data.admin_first_name,
            "last_name": data.admin_last_name,
            "role": "hotel_admin",
            "is_active": True,
            "is_verified": True,
        })

        # 5. Create hotel record
        hotel = await HotelRepository.create(db, tenant.id, {
            "name": data.name,
            "is_active": True,
        })

        # 6. Send welcome email with login credentials
        send_tenant_welcome_email.delay(
            tenant_id=tenant.id,
            admin_email=data.admin_email,
            temp_password=temp_password,
            login_url=f"https://{data.slug}.stayos.com/admin/login"
        )

        return {"tenant": tenant, "admin": admin, "hotel": hotel}
```

---

## Platform Analytics Endpoint

```python
@router.get("/analytics")
async def platform_analytics(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireSuperAdmin),
    period: str = Query(default="month")
):
    return {
        "tenants": {
            "total": await TenantRepository.count(db),
            "active": await TenantRepository.count(db, status="active"),
            "new_this_period": await TenantRepository.count_new(db, period),
        },
        "revenue": {
            "platform_commission": await PaymentRepository.total_commission(db, period),
            "subscription_revenue": await SubscriptionRepository.total_revenue(db, period),
            "total_transaction_volume": await PaymentRepository.total_volume(db, period),
        },
        "bookings": {
            "total": await BookingRepository.count_all(db, period),
            "completed": await BookingRepository.count_all(db, period, status="completed"),
            "cancelled": await BookingRepository.count_all(db, period, status="cancelled"),
        },
        "users": {
            "total_guests": await UserRepository.count_all(db, role="guest"),
            "new_this_period": await UserRepository.count_new(db, period),
        },
        "mrr": await SubscriptionRepository.mrr_trend(db),
        "top_tenants": await AnalyticsService.top_tenants_by_revenue(db, period, limit=10),
    }
```

---

## Subscription Management

```python
# app/api/v1/super_admin/subscriptions.py

@router.get("/subscriptions")
async def list_subscriptions(
    db=Depends(get_db),
    current_user=Depends(RequireSuperAdmin),
    status: Optional[str] = None,
):
    return await SubscriptionRepository.get_all(db, status=status)


@router.post("/subscriptions/{tenant_id}/change-plan")
async def change_plan(
    tenant_id: int,
    body: PlanChangeRequest,
    db=Depends(get_db),
    current_user=Depends(RequireSuperAdmin),
):
    """Change a tenant's subscription plan."""
    tenant = await TenantRepository.get_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(404, "Tenant not found")

    # Update Stripe subscription
    stripe.Subscription.modify(
        tenant.stripe_subscription_id,
        items=[{"price": STRIPE_PRICE_IDS[body.new_plan]}]
    )

    await TenantRepository.update(db, tenant_id, {"plan": body.new_plan})
    return {"message": f"Plan updated to {body.new_plan}"}


# Stripe webhook handler
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db=Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid webhook signature")

    if event.type == "invoice.payment_succeeded":
        invoice = event.data.object
        tenant_id = int(invoice.metadata.get("tenant_id"))
        await SubscriptionRepository.mark_paid(db, tenant_id, invoice.id)

    elif event.type == "customer.subscription.deleted":
        subscription = event.data.object
        tenant_id = int(subscription.metadata.get("tenant_id"))
        await TenantRepository.update(db, tenant_id, {"status": "suspended"})

    return {"received": True}
```

---

## Super Admin Frontend Pages

```typescript
// src/app/(admin)/super-admin/tenants/page.tsx

'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminService } from '@/services/super-admin.service'
import { Badge } from '@/components/ui/Badge'

export default function TenantsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin', 'tenants'],
    queryFn: superAdminService.getTenants,
  })

  const qc = useQueryClient()
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      superAdminService.updateTenantStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['super-admin', 'tenants'] }),
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hotel Tenants</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg">
          + Add Tenant
        </button>
      </div>

      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-50 text-sm text-gray-500">
          <tr>
            <th className="text-left p-4">Hotel</th>
            <th className="text-left p-4">Plan</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Revenue (MTD)</th>
            <th className="text-left p-4">Bookings</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.tenants.map(tenant => (
            <tr key={tenant.id} className="border-t">
              <td className="p-4">
                <div className="font-medium">{tenant.name}</div>
                <div className="text-sm text-gray-400">{tenant.slug}.stayos.com</div>
              </td>
              <td className="p-4 capitalize">{tenant.plan}</td>
              <td className="p-4">
                <Badge variant={tenant.status === 'active' ? 'green' : 'red'}>
                  {tenant.status}
                </Badge>
              </td>
              <td className="p-4">${tenant.mtd_revenue?.toLocaleString()}</td>
              <td className="p-4">{tenant.mtd_bookings}</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button className="text-blue-600 text-sm hover:underline">View</button>
                  {tenant.status === 'active' ? (
                    <button
                      onClick={() => updateStatus.mutate({ id: tenant.id, status: 'suspended' })}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus.mutate({ id: tenant.id, status: 'active' })}
                      className="text-green-600 text-sm hover:underline"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## System Health Endpoint

```python
@router.get("/health")
async def system_health(
    db=Depends(get_db),
    current_user=Depends(RequireSuperAdmin)
):
    # Check DB
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "degraded"

    # Check Redis
    try:
        await redis_client.ping()
        redis_status = "healthy"
    except Exception:
        redis_status = "degraded"

    return {
        "status": "healthy" if db_status == "healthy" and redis_status == "healthy" else "degraded",
        "components": {
            "database": db_status,
            "cache": redis_status,
            "celery": await get_celery_status(),
        },
        "stats": {
            "active_tenants": await TenantRepository.count(db, status="active"),
            "total_users": await UserRepository.count_all(db),
            "db_pool_size": engine.pool.size(),
            "db_pool_checked_out": engine.pool.checkedout(),
        },
        "timestamp": datetime.utcnow().isoformat()
    }
```
