# 07 — User Roles & Permissions

## Role Hierarchy

```
┌─────────────────────────────────────────────┐
│              SUPER ADMIN                     │
│  (Platform Owner — no tenant scope)         │
└──────────────────────┬──────────────────────┘
                       │ manages
┌──────────────────────▼──────────────────────┐
│         HOTEL ADMIN (per tenant)            │
│  Full control over their hotel/tenant       │
└──────┬──────────────────────────────────────┘
       │ manages
┌──────▼──────┐    ┌───────────────┐    ┌──────────────┐
│ FRONT DESK  │    │ HOUSEKEEPING  │    │ HOTEL MANAGER│
│   STAFF     │    │    STAFF      │    │  (read-only) │
└─────────────┘    └───────────────┘    └──────────────┘
       │
   (serves)
┌──────▼──────────────────────────────────────┐
│                  GUEST                       │
│  (public + authenticated)                   │
└─────────────────────────────────────────────┘
```

---

## Role Definitions

| Role | Code | Scope | Description |
|------|------|-------|-------------|
| Super Admin | `super_admin` | Platform | Full platform control |
| Hotel Admin | `hotel_admin` | Tenant | Full hotel management |
| Hotel Manager | `hotel_manager` | Tenant | View-only + reports |
| Front Desk | `front_desk` | Tenant | Reservations, check-in/out |
| Housekeeping | `housekeeping` | Tenant | Room status updates |
| Guest | `guest` | Tenant | Booking and profile |

---

## Permission Matrix

### Guest Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Profile | ✅ | ✅ | ✅ | ✅ |
| Hotel Details | - | ✅ | - | - |
| Room Details | - | ✅ | - | - |
| Bookings (own) | ✅ | ✅ | ✅ (modify) | ✅ (cancel) |
| Reviews (own) | ✅ | ✅ | ✅ | ✅ |
| Payments (own) | ✅ | ✅ | - | - |

### Hotel Admin Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Hotel Profile | - | ✅ | ✅ | - |
| Rooms | ✅ | ✅ | ✅ | ✅ |
| Room Categories | ✅ | ✅ | ✅ | ✅ |
| Bookings (all) | ✅ | ✅ | ✅ | ✅ |
| Staff Users | ✅ | ✅ | ✅ | ✅ |
| Pricing | ✅ | ✅ | ✅ | ✅ |
| Promotions | ✅ | ✅ | ✅ | ✅ |
| Reviews | - | ✅ | ✅ (respond) | - |
| Reports | - | ✅ | - | - |
| Tenant Settings | - | ✅ | ✅ | - |
| Theme/Branding | ✅ | ✅ | ✅ | - |

### Front Desk Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Bookings | ✅ | ✅ | ✅ | - |
| Check-in/out | - | ✅ | ✅ | - |
| Guests | - | ✅ | - | - |
| Rooms (view) | - | ✅ | - | - |
| Messages | ✅ | ✅ | - | - |

### Housekeeping Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Room Status | - | ✅ | ✅ | - |
| Assigned Rooms | - | ✅ | - | - |

### Super Admin Permissions

| Resource | Access |
|----------|--------|
| All Tenants | Full CRUD |
| All Users | Full CRUD |
| Subscriptions | Full CRUD |
| Payments / Payouts | Full CRUD |
| Platform Settings | Full CRUD |
| Audit Logs | Read |
| System Health | Read |

---

## Implementation: FastAPI Permission Decorators

```python
# app/core/permissions.py

from functools import wraps
from fastapi import HTTPException, Depends
from app.core.auth import get_current_user

# Role constants
SUPER_ADMIN = "super_admin"
HOTEL_ADMIN = "hotel_admin"
HOTEL_MANAGER = "hotel_manager"
FRONT_DESK = "front_desk"
HOUSEKEEPING = "housekeeping"
GUEST = "guest"

def require_roles(*allowed_roles: str):
    """Dependency factory that checks user has one of the allowed roles."""
    async def _check(current_user = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {list(allowed_roles)}"
            )
        return current_user
    return _check

def require_tenant_match():
    """Ensures the user belongs to the same tenant as the resource."""
    async def _check(
        tenant_id: int,
        current_user = Depends(get_current_user)
    ):
        if current_user.role == SUPER_ADMIN:
            return current_user  # Super admin bypasses tenant check
        if current_user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Cross-tenant access denied")
        return current_user
    return _check


# Usage in route handlers:

@router.get("/admin/rooms")
async def list_rooms(
    request: Request,
    current_user = Depends(require_roles(HOTEL_ADMIN, HOTEL_MANAGER, FRONT_DESK))
):
    tenant_id = request.state.tenant_id
    return await RoomService.get_all(tenant_id)


@router.post("/admin/rooms")
async def create_room(
    room_data: RoomCreate,
    request: Request,
    current_user = Depends(require_roles(HOTEL_ADMIN))  # Only admin can create
):
    tenant_id = request.state.tenant_id
    return await RoomService.create(tenant_id, room_data)


@router.put("/admin/rooms/{room_id}/status")
async def update_room_status(
    room_id: int,
    status: RoomStatusUpdate,
    request: Request,
    current_user = Depends(require_roles(HOTEL_ADMIN, FRONT_DESK, HOUSEKEEPING))
):
    ...
```

---

## User Model with Role

```python
# app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from app.models.base import BaseModel
import enum

class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    hotel_admin = "hotel_admin"
    hotel_manager = "hotel_manager"
    front_desk = "front_desk"
    housekeeping = "housekeeping"
    guest = "guest"

class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # NULL for super_admin
    email = Column(String(255), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    role = Column(Enum(UserRole), default=UserRole.guest, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint("email", "tenant_id"),  # Unique email per tenant
    )
```

---

## JWT Token Payload

```json
{
  "sub": "42",
  "email": "admin@grandhotel.com",
  "role": "hotel_admin",
  "tenant_id": 1,
  "tenant_slug": "grand-hotel",
  "exp": 1735000000,
  "iat": 1734999100,
  "type": "access"
}
```

Super Admin tokens have `tenant_id: null` and `role: "super_admin"`.

---

## Frontend Role-Based Rendering

```typescript
// hooks/usePermissions.ts

import { useAuthStore } from '@/store/auth'

export const usePermissions = () => {
  const { user } = useAuthStore()

  return {
    isSuperAdmin: user?.role === 'super_admin',
    isHotelAdmin: user?.role === 'hotel_admin',
    isGuest: user?.role === 'guest',
    canManageRooms: ['super_admin', 'hotel_admin'].includes(user?.role ?? ''),
    canViewReports: ['super_admin', 'hotel_admin', 'hotel_manager'].includes(user?.role ?? ''),
    canUpdateRoomStatus: ['hotel_admin', 'front_desk', 'housekeeping'].includes(user?.role ?? ''),
  }
}

// Usage in component:
const { canManageRooms } = usePermissions()
{canManageRooms && <Button>Add Room</Button>}
```
