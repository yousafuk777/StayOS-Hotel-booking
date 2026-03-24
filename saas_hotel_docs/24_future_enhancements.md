# 24 — Future Enhancements

## Overview

This document outlines planned improvements and feature expansions beyond the MVP. Each item includes a priority rating, estimated complexity, and implementation approach.

---

## Roadmap Summary

```
Phase 1 (MVP) ── COMPLETE in current documentation
    Auth, Multi-tenant, Hotels, Rooms, Bookings, Payments,
    Reviews, Notifications, Admin Panel, Super Admin, Themes

Phase 2 ─── Near-term (3–6 months post-launch)
    Channel Manager, Mobile App, AI Assistant, Advanced Analytics

Phase 3 ─── Mid-term (6–12 months)
    POS Integration, Loyalty Program, Multi-language, Multi-currency

Phase 4 ─── Long-term (12+ months)
    Marketplace, Open API, White-label SaaS reseller program
```

---

## 1. Channel Manager Integration

**Priority:** High | **Complexity:** High

Connect StayOS with major Online Travel Agencies (OTAs) to sync availability and bookings in real-time.

### Target Channels
- Booking.com
- Expedia
- Airbnb
- Agoda
- Hotels.com

### Architecture Approach

```
StayOS Backend
    │
    ├── Channel Manager Module
    │       ├── Availability Sync (push to OTAs when rooms booked/freed)
    │       ├── Rate Sync (push pricing updates to all channels)
    │       └── Booking Pull (receive bookings from OTAs via webhook)
    │
    └── Integration Layer
            ├── SiteMinder API
            ├── RoomCloud API
            └── Direct OTA APIs (where available)
```

```python
# Future: app/services/channel_manager_service.py

class ChannelManagerService:

    @staticmethod
    async def push_availability_update(hotel_id: int, room_id: int, dates: list[date]):
        """Notify all connected OTAs of availability change."""
        connections = await ChannelConnectionRepository.get_active(hotel_id)
        for conn in connections:
            adapter = get_channel_adapter(conn.channel_type)
            await adapter.update_availability(
                hotel_external_id=conn.external_hotel_id,
                room_type_id=conn.room_type_mapping[str(room_id)],
                availability_updates=dates,
            )

    @staticmethod
    async def receive_ota_booking(channel: str, payload: dict):
        """Handle incoming booking from an OTA channel."""
        adapter = get_channel_adapter(channel)
        normalized = adapter.normalize_booking(payload)
        # Create booking in StayOS with source="ota:{channel}"
        await BookingService.create_from_channel(normalized)
```

### New DB Tables
```sql
CREATE TABLE channel_connections (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    hotel_id        INT UNSIGNED NOT NULL,
    channel_type    VARCHAR(50) NOT NULL,   -- 'booking_com', 'expedia', etc.
    external_hotel_id VARCHAR(100) NOT NULL,
    api_key         VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    room_type_mapping JSON                  -- maps StayOS room_category_id to OTA room_type_id
);
```

---

## 2. Native Mobile Application

**Priority:** High | **Complexity:** High

React Native app for iOS and Android, sharing business logic with the web frontend.

### Tech Stack
- **React Native** + Expo
- **Shared types** from a `@stayos/shared` monorepo package
- **React Query** (same as web)
- **Zustand** (same as web)
- **Stripe React Native SDK** for payments

### Key Mobile Features
- Push notifications (FCM/APNs)
- Offline booking history (SQLite)
- Biometric authentication
- Camera upload for profile photo
- Deep links for booking confirmations

### Push Notification Architecture
```python
# Backend addition: app/services/push_notification_service.py

import firebase_admin
from firebase_admin import messaging

class PushNotificationService:

    @staticmethod
    async def send(device_token: str, title: str, body: str, data: dict = None):
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=device_token,
        )
        messaging.send(message)
```

---

## 3. AI-Powered Assistant

**Priority:** Medium | **Complexity:** Medium

An AI chatbot embedded in the booking portal to help guests find rooms, answer FAQs, and complete bookings via conversation.

### Use Cases
- "Find me a room for 2 adults next weekend under $200"
- "What amenities does the hotel have?"
- "Can I bring my dog?"
- "What's the cancellation policy?"
- "Help me book the Deluxe room"

### Architecture
```typescript
// AI Chat Widget — calls backend which uses LLM with hotel context

POST /api/v1/ai/chat
{
  "message": "Find me a room for next Friday",
  "conversation_id": "abc123",
  "context": {
    "check_in": null,
    "check_out": null,
    "guests": 1
  }
}
```

```python
# app/services/ai_service.py (future)

from openai import AsyncOpenAI

class AIAssistantService:

    @staticmethod
    async def chat(tenant_id: int, hotel_id: int, message: str, history: list):
        # Fetch hotel context
        hotel = await HotelRepository.get_with_details(db, tenant_id, hotel_id)
        system_prompt = f"""
        You are the booking assistant for {hotel.name}.
        Hotel info: {hotel.description}
        Amenities: {', '.join(a.name for a in hotel.amenities)}
        Policies: check-in {hotel.check_in_time}, check-out {hotel.check_out_time}
        Help guests find rooms and answer questions about the hotel.
        """

        client = AsyncOpenAI()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                *history,
                {"role": "user", "content": message}
            ]
        )
        return response.choices[0].message.content
```

---

## 4. Advanced Analytics & Reporting

**Priority:** Medium | **Complexity:** Medium

Enhanced analytics dashboards beyond basic revenue tracking.

### New Metrics
- **RevPAR** (Revenue Per Available Room)
- **ADR** (Average Daily Rate)
- **Booking lead time** distribution
- **Guest demographics** (age, location, repeat rate)
- **Channel performance** (direct vs OTA)
- **Cancellation rate** by room type and season
- **Upsell conversion rate**

### Implementation: Dedicated Analytics DB
For high-volume reporting, consider moving analytics to a separate read-optimized store:

```python
# Nightly job: aggregate stats into analytics_daily_snapshots table

@celery_app.task
def compute_daily_snapshot(hotel_id: int, snapshot_date: date):
    """Precompute daily analytics to avoid slow queries in dashboards."""
    stats = {
        "hotel_id": hotel_id,
        "date": snapshot_date,
        "total_rooms": count_total_rooms(hotel_id),
        "occupied_rooms": count_occupied_rooms(hotel_id, snapshot_date),
        "revenue": sum_revenue(hotel_id, snapshot_date),
        "bookings_created": count_bookings(hotel_id, snapshot_date),
        "cancellations": count_cancellations(hotel_id, snapshot_date),
        "adr": compute_adr(hotel_id, snapshot_date),
        "revpar": compute_revpar(hotel_id, snapshot_date),
    }
    AnalyticsRepository.upsert_daily_snapshot(stats)
```

---

## 5. Loyalty & Rewards Program

**Priority:** Medium | **Complexity:** Medium

A points-based rewards system to incentivize repeat bookings.

```sql
CREATE TABLE loyalty_accounts (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id   INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL UNIQUE,
    points      INT UNSIGNED NOT NULL DEFAULT 0,
    tier        ENUM('bronze','silver','gold','platinum') DEFAULT 'bronze',
    total_nights INT UNSIGNED NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loyalty_transactions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    account_id      INT UNSIGNED NOT NULL,
    booking_id      INT UNSIGNED,
    points_delta    INT NOT NULL,             -- positive = earned, negative = redeemed
    type            ENUM('earned','redeemed','expired','bonus'),
    description     VARCHAR(255),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Points Logic
```python
POINTS_PER_DOLLAR_SPENT = 10
TIER_THRESHOLDS = {
    "silver": 5_000,
    "gold": 20_000,
    "platinum": 50_000,
}

def calculate_points_earned(booking_total: float) -> int:
    return int(booking_total * POINTS_PER_DOLLAR_SPENT)
```

---

## 6. Multi-Language Support (i18n)

**Priority:** Medium | **Complexity:** Low–Medium

```typescript
// next.config.ts
const config: NextConfig = {
  i18n: {
    locales: ['en', 'fr', 'es', 'de', 'ar', 'zh'],
    defaultLocale: 'en',
    localeDetection: true,
  },
}

// src/app/[locale]/layout.tsx  — locale-based routing
// Translation files in: src/locales/en.json, fr.json, etc.
```

RTL support for Arabic:
```css
[dir="rtl"] .sidebar { right: 0; left: auto; }
[dir="rtl"] .flex-row { flex-direction: row-reverse; }
```

---

## 7. Multi-Currency Support

**Priority:** Medium | **Complexity:** Medium

```python
# Exchange rate service (updated daily)
class CurrencyService:

    @staticmethod
    async def convert(amount: float, from_currency: str, to_currency: str) -> float:
        rate = await ExchangeRateRepository.get_rate(from_currency, to_currency)
        return round(amount * rate, 2)

    @staticmethod
    async def refresh_rates():
        """Celery Beat daily task to update exchange rates."""
        rates = await fetch_from_openexchangerates()
        await ExchangeRateRepository.bulk_upsert(rates)
```

---

## 8. White-Label SaaS Reseller Program

**Priority:** Low | **Complexity:** High

Allow third-party agencies/consultants to resell StayOS under their own brand.

### Architecture
```
Reseller Account (new role: reseller_admin)
    │
    └── Manages a portfolio of hotel tenants
    └── Has custom platform domain (agency.com)
    └── Sets own commission rates on top of StayOS base rate
    └── Has white-labeled UI (custom logo, brand, no StayOS mention)
```

### New Tables
```sql
CREATE TABLE resellers (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    custom_domain   VARCHAR(255),
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0100,
    status          ENUM('active','suspended') DEFAULT 'active'
);

ALTER TABLE tenants ADD COLUMN reseller_id INT UNSIGNED,
    ADD FOREIGN KEY (reseller_id) REFERENCES resellers(id);
```

---

## 9. Open API / Webhooks for Hotels

**Priority:** Low | **Complexity:** Medium

Allow hotel admins to integrate StayOS with their own systems via:
- **REST API keys** (scoped to their tenant)
- **Webhooks** (subscribe to events like `booking.created`, `booking.cancelled`)

```python
# app/models/api_key.py

class ApiKey(BaseModel):
    __tablename__ = "api_keys"
    tenant_id   = Column(Integer, ForeignKey("tenants.id"))
    name        = Column(String(100))     # "My PMS Integration"
    key_hash    = Column(String(255))     # hashed key
    scopes      = Column(JSON)            # ["bookings:read", "rooms:read"]
    last_used_at = Column(DateTime)
    expires_at  = Column(DateTime)


class WebhookEndpoint(BaseModel):
    __tablename__ = "webhook_endpoints"
    tenant_id   = Column(Integer, ForeignKey("tenants.id"))
    url         = Column(String(500))
    events      = Column(JSON)            # ["booking.created", "booking.cancelled"]
    secret      = Column(String(100))     # for HMAC signature
    is_active   = Column(Boolean, default=True)
```

---

## 10. Review AI Moderation

**Priority:** Low | **Complexity:** Low

Automatically flag reviews with inappropriate content before publishing.

```python
# app/services/review_moderation_service.py

from openai import AsyncOpenAI

class ReviewModerationService:

    @staticmethod
    async def moderate(review_text: str) -> dict:
        client = AsyncOpenAI()
        response = await client.moderations.create(input=review_text)
        result = response.results[0]
        return {
            "is_flagged": result.flagged,
            "categories": {k: v for k, v in result.categories.__dict__.items() if v},
        }
```

---

## Enhancement Priority Matrix

| Enhancement | Business Impact | Dev Effort | Priority |
|-------------|----------------|------------|----------|
| Channel Manager | Very High | High | P1 |
| Mobile App | High | High | P1 |
| Advanced Analytics | High | Medium | P2 |
| AI Assistant | Medium | Medium | P2 |
| Loyalty Program | Medium | Medium | P2 |
| Multi-language | Medium | Low | P3 |
| Multi-currency | Medium | Medium | P3 |
| Open API / Webhooks | Medium | Medium | P3 |
| White-Label Reseller | Low | High | P4 |
| Review AI Moderation | Low | Low | P4 |

---

## Technical Debt & Improvements

Beyond features, these technical improvements are planned:

| Item | Description |
|------|-------------|
| GraphQL API | Optional GraphQL layer for flexible frontend queries |
| Event Sourcing | Audit trail via domain events for critical booking state changes |
| Rate Limiting Upgrade | Per-tenant rate limits (not just per-IP) |
| Search Upgrade | Elasticsearch for full-text hotel and room search |
| Real-time Updates | WebSocket / SSE for live room availability and booking calendar |
| Test Coverage | Increase to 90%+ with integration + E2E tests (Playwright) |
| API Versioning | `/api/v2` deprecation strategy with migration guides |
| Database Sharding | Shard by `tenant_id` for ultra-high scale (10k+ tenants) |
