# 23 — Frontend Pages Structure

## Complete Pages Inventory

| Route | Component | Type | Auth |
|-------|-----------|------|------|
| `/` | Landing Page | SSR | Public |
| `/search` | Hotel Search Results | CSR | Public |
| `/hotels/[slug]` | Hotel Detail | SSR | Public |
| `/hotels/[slug]/rooms/[id]` | Room Detail | SSR | Public |
| `/checkout` | Checkout Flow | CSR | Guest |
| `/checkout/confirmation` | Booking Confirmation | SSR | Guest |
| `/login` | Login | CSR | Public |
| `/register` | Register | CSR | Public |
| `/reset-password` | Reset Password | CSR | Public |
| `/dashboard` | Guest Dashboard | CSR | Guest |
| `/dashboard/bookings` | My Bookings | CSR | Guest |
| `/dashboard/bookings/[id]` | Booking Detail | CSR | Guest |
| `/dashboard/profile` | Profile Settings | CSR | Guest |
| `/dashboard/saved` | Saved Hotels | CSR | Guest |
| `/admin` | Admin Overview | CSR | Hotel Admin |
| `/admin/rooms` | Room Management | CSR | Hotel Admin |
| `/admin/bookings` | Bookings List | CSR | Hotel Admin+ |
| `/admin/calendar` | Booking Calendar | CSR | Hotel Admin+ |
| `/admin/housekeeping` | Room Status Board | CSR | Hotel Admin+ |
| `/admin/staff` | Staff Management | CSR | Hotel Admin |
| `/admin/analytics` | Revenue & Stats | CSR | Hotel Admin+ |
| `/admin/promotions` | Promo Codes | CSR | Hotel Admin |
| `/admin/reviews` | Review Management | CSR | Hotel Admin |
| `/admin/settings` | Hotel Settings | CSR | Hotel Admin |
| `/admin/settings/theme` | Theme & Branding | CSR | Hotel Admin |
| `/super-admin` | SA Overview | CSR | Super Admin |
| `/super-admin/tenants` | Tenant Management | CSR | Super Admin |
| `/super-admin/users` | User Management | CSR | Super Admin |
| `/super-admin/subscriptions` | Subscriptions | CSR | Super Admin |
| `/super-admin/analytics` | Platform Analytics | CSR | Super Admin |
| `/super-admin/health` | System Health | CSR | Super Admin |

---

## Guest Dashboard Pages

### My Bookings Page

```typescript
// src/app/(dashboard)/dashboard/bookings/page.tsx

'use client'
import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  checked_in: 'bg-green-100 text-green-700',
  completed:  'bg-gray-100 text-gray-600',
  cancelled:  'bg-red-100 text-red-600',
}

export default function BookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: bookingService.getMyBookings,
  })

  if (isLoading) return <BookingsSkeleton />

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {data?.bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏨</div>
          <p className="text-text-secondary">No bookings yet.</p>
          <Link href="/search" className="mt-4 inline-block text-primary-600 font-medium">
            Browse Hotels →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white border rounded-2xl p-5 flex gap-4 hover:shadow-md transition-shadow"
            >
              <img
                src={booking.hotel.thumbnail}
                alt={booking.hotel.name}
                className="w-24 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <h3 className="font-semibold text-lg truncate">{booking.hotel.name}</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize
                    ${STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  {formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}
                  <span className="mx-1.5">·</span>
                  {booking.nights} night{booking.nights > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-text-secondary mt-1 font-mono">
                  Ref: {booking.reference_number}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary-600">
                  {formatCurrency(booking.total_amount)}
                </p>
                <Link
                  href={`/dashboard/bookings/${booking.id}`}
                  className="text-xs text-primary-600 hover:underline mt-1 block"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Booking Detail Page

```typescript
// src/app/(dashboard)/dashboard/bookings/[id]/page.tsx

'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'
import { useParams } from 'next/navigation'

export default function BookingDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.getById(Number(id)),
  })

  const cancelBooking = useMutation({
    mutationFn: () => bookingService.cancel(Number(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  if (isLoading) return <Spinner />
  if (!booking) return <NotFound />

  const canCancel = ['pending', 'confirmed'].includes(booking.status)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold">Booking Details</h1>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-2xl border p-6 space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-mono text-lg font-bold">{booking.reference_number}</span>
          <StatusBadge status={booking.status} />
        </div>
        <hr />
        <InfoRow label="Hotel" value={booking.hotel.name} />
        <InfoRow label="Room" value={booking.rooms.map(r => `Room ${r.room_number}`).join(', ')} />
        <InfoRow label="Check-in" value={formatDate(booking.check_in_date)} />
        <InfoRow label="Check-out" value={formatDate(booking.check_out_date)} />
        <InfoRow label="Guests" value={`${booking.num_guests} guest(s)`} />
        <hr />
        <InfoRow label="Room Total" value={formatCurrency(booking.room_total)} />
        {booking.addon_total > 0 && (
          <InfoRow label="Add-ons" value={formatCurrency(booking.addon_total)} />
        )}
        {booking.discount_amount > 0 && (
          <InfoRow label="Discount" value={`-${formatCurrency(booking.discount_amount)}`} className="text-green-600" />
        )}
        <InfoRow label="Tax" value={formatCurrency(booking.tax_amount)} />
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total Paid</span>
          <span className="text-primary-600">{formatCurrency(booking.total_amount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <a
          href={`/api/v1/bookings/${id}/invoice`}
          target="_blank"
          className="flex-1 text-center border border-gray-300 text-text-primary
                     py-3 rounded-xl font-medium hover:bg-gray-50"
        >
          📄 Download Invoice
        </a>
        {canCancel && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to cancel this booking?')) {
                cancelBooking.mutate()
              }
            }}
            disabled={cancelBooking.isPending}
            className="flex-1 border border-red-300 text-red-600
                       py-3 rounded-xl font-medium hover:bg-red-50 disabled:opacity-60"
          >
            {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
        {booking.status === 'completed' && !booking.has_review && (
          <a
            href={`/reviews/new?booking_id=${booking.id}`}
            className="flex-1 text-center bg-primary-600 text-white
                       py-3 rounded-xl font-medium hover:bg-primary-700"
          >
            ✍️ Leave a Review
          </a>
        )}
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-medium ${className}`}>{value}</span>
    </div>
  )
}
```

---

## Hotel Detail Page

```typescript
// src/app/(public)/hotels/[slug]/page.tsx

import { hotelService } from '@/services/hotel.service'
import { HotelGallery } from '@/components/hotel/HotelGallery'
import { HotelAmenities } from '@/components/hotel/HotelAmenities'
import { ReviewsList } from '@/components/hotel/ReviewsList'
import { RoomCard } from '@/components/hotel/RoomCard'
import { Navbar } from '@/components/layout/Navbar'

interface Props {
  params: { slug: string }
  searchParams: { checkIn?: string; checkOut?: string; guests?: string }
}

export default async function HotelDetailPage({ params, searchParams }: Props) {
  const hotel = await hotelService.getBySlug(params.slug)
  const rooms = await hotelService.getRooms(hotel.id, searchParams)

  return (
    <>
      <Navbar hotel={hotel} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hotel Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <p className="text-text-secondary mt-1">
                📍 {hotel.address_line1}, {hotel.city}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-primary-600 text-white px-4 py-2 rounded-xl inline-block">
                <span className="text-2xl font-bold">{hotel.overall_rating}</span>
                <span className="text-sm ml-1 opacity-80">/ 10</span>
              </div>
              <p className="text-sm text-text-secondary mt-1">{hotel.review_count} reviews</p>
            </div>
          </div>
          <div className="flex gap-1 mt-3">
            {[...Array(hotel.star_rating)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-xl">★</span>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <HotelGallery images={hotel.images} hotelName={hotel.name} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 mt-10">
          {/* Left: Details */}
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold mb-3">About</h2>
              <p className="text-text-secondary leading-relaxed">{hotel.description}</p>
            </section>

            <HotelAmenities amenities={hotel.amenities} />

            {/* Rooms */}
            <section>
              <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {rooms.map(room => (
                  <RoomCard key={room.id} room={room} searchParams={searchParams} />
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold mb-4">Guest Reviews</h2>
              <ReviewsList hotelId={hotel.id} />
            </section>
          </div>

          {/* Right: Sticky Booking Widget */}
          <div className="lg:sticky lg:top-4 h-fit">
            <QuickBookWidget hotel={hotel} searchParams={searchParams} />
          </div>
        </div>
      </div>
    </>
  )
}
```

---

## Admin Dashboard Shell

```typescript
// src/app/(admin)/admin/layout.tsx

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { NotificationBell } from '@/components/layout/NotificationBell'
import {
  LayoutDashboard, BedDouble, CalendarDays, Users,
  BarChart3, Tag, Star, Settings, Home, Briefcase
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
  { href: '/admin/bookings', icon: Briefcase, label: 'Bookings' },
  { href: '/admin/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/admin/housekeeping', icon: Home, label: 'Housekeeping' },
  { href: '/admin/staff', icon: Users, label: 'Staff' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/promotions', icon: Tag, label: 'Promotions' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ProtectedRoute requiredRole={['hotel_admin', 'hotel_manager', 'front_desk', 'housekeeping']}>
      <div className="flex h-screen bg-surface-secondary">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-white border-r flex flex-col transition-all duration-200`}>
          <div className="p-4 border-b flex items-center justify-between">
            {sidebarOpen && <span className="font-bold text-primary-600 text-lg">StayOS Admin</span>}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              ☰
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl mb-0.5
                    text-sm font-medium transition-colors
                    ${active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-14 bg-white border-b flex items-center justify-between px-6">
            <h1 className="font-semibold text-text-primary">Hotel Management</h1>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserAvatar />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

---

## Profile Settings Page

```typescript
// src/app/(dashboard)/dashboard/profile/page.tsx

'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useMutation } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
  })

  const updateProfile = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => setUser(data),
  })

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Personal Info */}
      <section className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-semibold">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-text-secondary">First Name</label>
            <input
              className="w-full mt-1 border rounded-xl px-3 py-2"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary">Last Name</label>
            <input
              className="w-full mt-1 border rounded-xl px-3 py-2"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary">Phone</label>
          <input
            className="w-full mt-1 border rounded-xl px-3 py-2"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <button
          onClick={() => updateProfile.mutate(form)}
          disabled={updateProfile.isPending}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium
                     hover:bg-primary-700 disabled:opacity-60"
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-2xl border p-6">
        <h2 className="font-semibold mb-4">Appearance</h2>
        <ThemeToggle />
      </section>

      {/* Email - read-only */}
      <section className="bg-white rounded-2xl border p-6">
        <h2 className="font-semibold mb-3">Account</h2>
        <div>
          <label className="text-xs font-medium text-text-secondary">Email Address</label>
          <p className="mt-1 font-medium">{user?.email}</p>
          <p className="text-xs text-text-secondary mt-1">
            To change your email, contact support.
          </p>
        </div>
      </section>
    </div>
  )
}
```
