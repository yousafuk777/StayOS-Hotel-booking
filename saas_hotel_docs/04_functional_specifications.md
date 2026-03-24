# 04 — Functional Specifications

## Overview

This document defines the detailed functional behavior of each major subsystem in StayOS.

---

## 1. Authentication System

### Sign Up Flow
1. User submits email, password, name
2. System checks email uniqueness within tenant
3. Password is hashed with bcrypt
4. User record created with `is_verified = false`
5. Verification email sent with token (expires 24h)
6. User clicks link → `is_verified = true`
7. JWT access + refresh tokens issued

### Sign In Flow
1. User submits email + password
2. System verifies credentials against DB
3. Checks `is_active` and `is_verified`
4. Issues JWT access token (15 min TTL)
5. Issues JWT refresh token (7 days TTL, stored in httpOnly cookie)

### Password Reset Flow
1. User submits email
2. System generates reset token (UUID, expires 1h)
3. Email sent with reset link
4. User submits new password + token
5. Token validated, password updated, all sessions invalidated

---

## 2. Multi-Tenant Routing

### Tenant Resolution Middleware
```
Incoming Request
    │
    ├── Extract host header (e.g., grand-hotel.stayos.com)
    ├── Parse subdomain slug ("grand-hotel")
    ├── Query tenants table WHERE slug = "grand-hotel"
    ├── Inject tenant object into request state
    └── Proceed (or 404 if not found)
```

### Tenant Context
Every service function receives `tenant_id` as a scoping parameter. No cross-tenant data leaks are possible.

---

## 3. Hotel Search & Availability

### Search Algorithm
1. Accept parameters: `destination`, `check_in`, `check_out`, `guests`, `rooms`
2. Query hotels in destination with `is_active = true`
3. For each hotel, query available rooms:
   - Exclude rooms with confirmed bookings overlapping date range
   - Exclude rooms in `maintenance` status
4. Calculate lowest nightly rate per hotel
5. Return paginated results with filters applied

### Availability Check Logic
```sql
SELECT r.id FROM rooms r
WHERE r.hotel_id = :hotel_id
  AND r.status = 'available'
  AND r.id NOT IN (
    SELECT br.room_id FROM booking_rooms br
    JOIN bookings b ON b.id = br.booking_id
    WHERE b.status IN ('confirmed', 'checked_in')
      AND b.check_in_date < :check_out
      AND b.check_out_date > :check_in
  )
  AND r.capacity >= :guests
```

---

## 4. Booking Engine

### Booking States
```
PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT → COMPLETED
    │
    └──→ CANCELLED
    └──→ REJECTED (by hotel)
    └──→ NO_SHOW
```

### Booking Flow Specification

**Step 1 — Room Selection**
- User selects dates, number of rooms
- System returns available rooms with pricing
- Pricing = base_price × nights + add-on prices

**Step 2 — Guest Details**
- Primary guest: name, email, phone
- Additional guests: name, age (optional)
- Special requests (text field)

**Step 3 — Add-ons**
- Hotel-defined add-ons displayed
- Each has name, price, description
- User selects any combination

**Step 4 — Promo Code**
- User can optionally enter promo code
- System validates: active, not expired, usage_limit not exceeded
- Discount applied to subtotal

**Step 5 — Payment**
- Total displayed: room cost + add-ons - discount + taxes
- Payment via Stripe (card) or saved payment method
- Payment intent created before confirmation

**Step 6 — Confirmation**
- On successful payment: booking status → CONFIRMED
- Booking reference number generated (format: `SOS-XXXXX`)
- Confirmation email to guest
- Notification to hotel admin

---

## 5. Pricing Engine

### Price Calculation
```
nightly_rate = room.base_price
IF weekend(date): nightly_rate *= room.weekend_multiplier (default 1.0)
IF seasonal_pricing EXISTS for date: nightly_rate = seasonal_price

room_total = nightly_rate × number_of_nights × number_of_rooms
addon_total = SUM(selected_addons.price)
subtotal = room_total + addon_total
discount = promo_code.discount_amount OR (subtotal × promo_code.discount_percent)
tax = (subtotal - discount) × hotel.tax_rate
TOTAL = subtotal - discount + tax
```

---

## 6. Review System

### Review Eligibility
- Only guests who have a `COMPLETED` booking may leave a review
- One review per booking
- Review period: within 30 days of checkout

### Review Moderation
- Reviews are published immediately (auto-moderated)
- Hotels can flag a review for Super Admin review
- Super Admin can remove reviews violating policy

### Rating Calculation
```
hotel.overall_rating = AVG(reviews.overall_score) WHERE hotel_id = X
hotel.cleanliness_rating = AVG(reviews.cleanliness_score)
(etc.)
```

---

## 7. Notification System

### Trigger Events
| Event | Recipients | Channel |
|-------|-----------|---------|
| Booking confirmed | Guest, Hotel Admin | Email, In-app |
| Booking cancelled | Guest, Hotel Admin | Email, In-app |
| Check-in reminder | Guest | Email |
| New review | Hotel Admin | In-app |
| Payment received | Guest | Email |
| Tenant subscription renewing | Hotel Admin | Email |
| Platform announcement | All Hotel Admins | In-app |

### Delivery Mechanism
- Async background task (FastAPI BackgroundTasks or Celery)
- Email via SendGrid
- In-app: stored in `notifications` table, polled by frontend

---

## 8. Theme System

### User-Level Theme
- Each user stores `theme_preference` in `user_theme_preferences` table
- Settings: `mode` (light/dark), `color_scheme`, `font_size`
- Applied via React ThemeProvider on login

### Tenant-Level Branding
- Each hotel configures brand settings in `tenant_settings`
- Settings: logo, primary_color, secondary_color, font_family, header_style
- CSS variables injected at runtime based on tenant slug

### Theme Switching
```typescript
// CSS Variables set by ThemeProvider
:root {
  --color-primary: var(--tenant-primary, #1a56db);
  --color-bg: #ffffff;
  --color-text: #111827;
}
[data-theme="dark"] {
  --color-bg: #111827;
  --color-text: #f9fafb;
}
```

---

## 9. Super Admin Functions

### Tenant Onboarding
1. Hotel submits registration form
2. Super Admin reviews application
3. Approval creates: tenant record, admin user, default settings
4. Welcome email with credentials sent

### Subscription Management
1. Hotel plan stored in `tenant_subscriptions`
2. Stripe subscription created on approval
3. Webhook updates subscription status on payment events
4. Failed payment → grace period (7 days) → suspension

### Commission Collection
1. Each booking payment is split:
   - Platform commission deducted at source
   - Remainder transferred to hotel's Stripe connected account
2. Commission rate configurable per tenant

---

## 10. Admin Dashboard Features

### Booking Calendar
- Monthly/weekly calendar view
- Color-coded by booking status
- Click booking to view/edit details
- Drag-and-drop date changes (subject to availability)

### Housekeeping Module
- Room list with current status: Clean, Dirty, In Progress, Out of Service
- Staff assignment per room
- Status updated by housekeeping staff via their dashboard

### Revenue Dashboard
- Total revenue (today, this week, this month, YTD)
- Revenue by room category
- Occupancy rate chart
- Booking source breakdown
- Top guest segments
