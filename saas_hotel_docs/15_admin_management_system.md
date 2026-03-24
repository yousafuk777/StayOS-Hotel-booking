# 15 — Admin Management System

## Hotel Admin Dashboard Overview

The Hotel Admin Panel is accessible at `/admin` and is scoped to the current tenant. Only users with `hotel_admin`, `hotel_manager`, `front_desk`, or `housekeeping` roles can access relevant sections.

---

## Admin Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  Logo  │  Hotel Name  │  Notifications  │  Admin Avatar  │
├────────┼─────────────────────────────────────────────────┤
│        │                                                  │
│  MENU  │              CONTENT AREA                       │
│        │                                                  │
│ ▶ Dashboard             ┌──────────────────────────────┐ │
│ ▶ Bookings              │  Today's Stats               │ │
│ ▶ Calendar              │  Revenue / Bookings /        │ │
│ ▶ Rooms                 │  Occupancy / Check-ins       │ │
│ ▶ Housekeeping          └──────────────────────────────┘ │
│ ▶ Staff                                                   │
│ ▶ Guests                ┌────────────┐ ┌───────────────┐ │
│ ▶ Analytics             │  Rev Chart │ │ Today Arrivals│ │
│ ▶ Promotions            └────────────┘ └───────────────┘ │
│ ▶ Reviews                                                 │
│ ▶ Settings              ┌──────────────────────────────┐ │
│   ├ Hotel Profile        │  Pending Bookings Table     │ │
│   ├ Rooms Setup          └──────────────────────────────┘ │
│   ├ Policies                                              │
│   └ Theme/Branding                                        │
└────────┴─────────────────────────────────────────────────┘
```

---

## Dashboard Stats API

```python
# app/api/v1/admin/hotel_admin.py

from fastapi import APIRouter, Depends, Request
from app.core.permissions import RequireHotelAdmin
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin)
):
    tenant_id = request.state.tenant_id
    hotel = await HotelService.get_by_tenant(db, tenant_id)

    today = date.today()
    return {
        "today": {
            "revenue": await AnalyticsService.daily_revenue(db, hotel.id, today),
            "bookings": await AnalyticsService.daily_bookings(db, hotel.id, today),
            "check_ins": await AnalyticsService.daily_check_ins(db, hotel.id, today),
            "check_outs": await AnalyticsService.daily_check_outs(db, hotel.id, today),
        },
        "occupancy": {
            "current": await AnalyticsService.current_occupancy(db, hotel.id),
            "this_month": await AnalyticsService.monthly_occupancy(db, hotel.id),
        },
        "pending_bookings": await BookingRepository.get_all(
            db, tenant_id, status="pending", limit=5
        ),
        "recent_reviews": await ReviewRepository.get_all(
            db, tenant_id, hotel.id, limit=3
        ),
    }
```

---

## Room Management

```python
# app/api/v1/admin/hotel_admin.py (continued)

@router.get("/rooms")
async def list_rooms(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireStaff),
    status: Optional[str] = None,
    category_id: Optional[int] = None,
):
    tenant_id = request.state.tenant_id
    rooms = await RoomRepository.get_all(
        db, tenant_id,
        filters={"status": status, "category_id": category_id}
    )
    return rooms


@router.post("/rooms", status_code=201)
async def create_room(
    body: RoomCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin)
):
    tenant_id = request.state.tenant_id
    room = await RoomService.create(db, tenant_id, body)
    return room


@router.put("/rooms/{room_id}")
async def update_room(
    room_id: int,
    body: RoomUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin)
):
    tenant_id = request.state.tenant_id
    room = await RoomService.update(db, tenant_id, room_id, body)
    return room


@router.put("/rooms/{room_id}/status")
async def update_room_status(
    room_id: int,
    body: RoomStatusUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_roles("hotel_admin", "front_desk", "housekeeping"))
):
    tenant_id = request.state.tenant_id
    await RoomService.update_status(db, tenant_id, room_id, body.status)
    return {"message": "Room status updated"}


@router.post("/rooms/{room_id}/images")
async def upload_room_image(
    room_id: int,
    file: UploadFile = File(...),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin)
):
    tenant_id = request.state.tenant_id
    url = await StorageService.upload_image(file, f"{request.state.tenant_slug}/rooms/{room_id}")
    image = await RoomImageRepository.create(db, tenant_id, {
        "room_id": room_id,
        "hotel_id": current_user.hotel_id,
        "url": url,
    })
    return image
```

---

## Booking Calendar Component

```typescript
// src/components/admin/OccupancyCalendar.tsx

'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-200 text-blue-800',
  checked_in: 'bg-green-200 text-green-800',
  pending: 'bg-yellow-200 text-yellow-800',
  cancelled: 'bg-red-100 text-red-600',
}

export function OccupancyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: bookings } = useQuery({
    queryKey: ['admin', 'calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: () => adminService.getCalendar({
      start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
      end: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
    })
  })

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
        {days.map(day => {
          const dayBookings = bookings?.filter(b =>
            new Date(b.check_in_date) <= day && new Date(b.check_out_date) > day
          ) ?? []

          return (
            <div
              key={day.toISOString()}
              className={`min-h-20 border rounded-lg p-1 text-sm
                ${isToday(day) ? 'border-primary-500' : 'border-gray-100'}`}
            >
              <div className={`font-medium mb-1 ${isToday(day) ? 'text-primary-600' : ''}`}>
                {format(day, 'd')}
              </div>
              {dayBookings.slice(0, 3).map(b => (
                <div key={b.id} className={`text-xs px-1 rounded mb-0.5 truncate ${STATUS_COLORS[b.status]}`}>
                  {b.guest_name} · Rm {b.room_number}
                </div>
              ))}
              {dayBookings.length > 3 && (
                <div className="text-xs text-gray-400">+{dayBookings.length - 3} more</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## Housekeeping Module

```typescript
// src/app/(admin)/admin/housekeeping/page.tsx

'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'

const STATUS_CONFIG = {
  available: { label: 'Clean', color: 'bg-green-100 text-green-700' },
  occupied: { label: 'Occupied', color: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-700' },
  out_of_service: { label: 'Out of Service', color: 'bg-red-100 text-red-700' },
}

export default function HousekeepingPage() {
  const qc = useQueryClient()
  const { data: rooms } = useQuery({
    queryKey: ['admin', 'rooms', 'housekeeping'],
    queryFn: adminService.getRoomsForHousekeeping,
  })

  const updateStatus = useMutation({
    mutationFn: ({ roomId, status }: { roomId: number; status: string }) =>
      adminService.updateRoomStatus(roomId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'rooms'] }),
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Housekeeping</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms?.map(room => (
          <div key={room.id} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">Room {room.room_number}</p>
                <p className="text-sm text-text-secondary">Floor {room.floor} · {room.category}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full
                ${STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG].color}`}>
                {STATUS_CONFIG[room.status as keyof typeof STATUS_CONFIG].label}
              </span>
            </div>
            <select
              className="w-full text-sm border rounded-lg p-2 mt-2"
              value={room.status}
              onChange={e => updateStatus.mutate({ roomId: room.id, status: e.target.value })}
            >
              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Staff Management

```python
# app/api/v1/admin/staff.py

@router.post("/", status_code=201)
async def create_staff(
    body: StaffCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin)
):
    """Create staff account with assigned role."""
    tenant_id = request.state.tenant_id

    # Validate role is a staff role
    allowed_staff_roles = ["hotel_manager", "front_desk", "housekeeping"]
    if body.role not in allowed_staff_roles:
        raise HTTPException(400, "Invalid staff role")

    # Create user with temporary password
    temp_password = secrets.token_urlsafe(12)
    staff = await UserRepository.create(db, tenant_id, {
        "email": body.email,
        "first_name": body.first_name,
        "last_name": body.last_name,
        "hashed_password": hash_password(temp_password),
        "role": body.role,
        "is_verified": True,  # Staff don't need email verification
        "is_active": True,
    })

    # Send invite email with temporary password
    send_staff_invite_email.delay(staff.id, temp_password)
    return staff
```

---

## Revenue Analytics Component

```typescript
// src/components/admin/RevenueChart.tsx

'use client'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { adminService } from '@/services/admin.service'

export function RevenueChart({ period = 'month' }: { period?: string }) {
  const { data } = useQuery({
    queryKey: ['admin', 'analytics', 'revenue', period],
    queryFn: () => adminService.getRevenue({ period }),
  })

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Revenue</h2>
        <p className="text-2xl font-bold text-primary-600">
          ${data?.total_revenue?.toLocaleString()}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data?.by_period}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(val) => [`$${val}`, 'Revenue']} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```
