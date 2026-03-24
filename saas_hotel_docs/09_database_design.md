# 09 — Database Design

## Overview

StayOS uses MySQL 8.x with SQLAlchemy ORM. The schema is designed for multi-tenant row-level isolation. Every tenant-scoped table includes a `tenant_id` foreign key.

---

## Entity Relationship Diagram (Text)

```
tenants ────────────────────────────────────────────────────────┐
    │                                                            │
    ├──< hotels                                                  │
    │       ├──< rooms                                          │
    │       │       ├──< room_images                           │
    │       │       └──< booking_rooms                         │
    │       ├──< room_categories                               │
    │       ├──< hotel_amenities >── amenities                 │
    │       └──< promotions                                    │
    │                                                          │
    ├──< users ─────────────────────────────────────────────── │
    │       ├──< bookings                                      │
    │       │       ├──< booking_rooms                        │
    │       │       ├──< payments                             │
    │       │       └──< invoices                             │
    │       ├──< reviews                                      │
    │       ├──< messages                                     │
    │       ├──< notifications                                │
    │       └──< user_theme_preferences                       │
    │                                                         │
    ├──< tenant_settings                                      │
    └──< themes                                              │
```

---

## Table Schemas

### `tenants`
```sql
CREATE TABLE tenants (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    plan            ENUM('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
    status          ENUM('pending','active','suspended','terminated') NOT NULL DEFAULT 'pending',
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0300,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status)
);
```

### `tenant_settings`
```sql
CREATE TABLE tenant_settings (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id           INT UNSIGNED NOT NULL UNIQUE,
    currency            VARCHAR(10) NOT NULL DEFAULT 'USD',
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    check_in_time       TIME NOT NULL DEFAULT '15:00:00',
    check_out_time      TIME NOT NULL DEFAULT '11:00:00',
    tax_rate            DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    cancellation_hours  INT NOT NULL DEFAULT 48,
    booking_requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    default_theme       ENUM('light','dark') NOT NULL DEFAULT 'light',
    primary_color       VARCHAR(7) NOT NULL DEFAULT '#1a56db',
    secondary_color     VARCHAR(7) NOT NULL DEFAULT '#6b7280',
    logo_url            VARCHAR(500),
    font_family         VARCHAR(100) DEFAULT 'Inter',
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

### `users`
```sql
CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED,       -- NULL for super_admin
    email           VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    phone           VARCHAR(20),
    profile_photo   VARCHAR(500),
    role            ENUM('super_admin','hotel_admin','hotel_manager',
                         'front_desk','housekeeping','guest') NOT NULL DEFAULT 'guest',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email_tenant (email, tenant_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    INDEX idx_tenant_role (tenant_id, role),
    INDEX idx_email (email)
);
```

### `hotels`
```sql
CREATE TABLE hotels (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    star_rating     TINYINT UNSIGNED DEFAULT 3,
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    postal_code     VARCHAR(20),
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    website         VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_city (city),
    INDEX idx_location (latitude, longitude)
);
```

### `room_categories`
```sql
CREATE TABLE room_categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id   INT UNSIGNED NOT NULL,
    hotel_id    INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,    -- 'Standard', 'Deluxe', 'Suite'
    description TEXT,
    base_price  DECIMAL(10,2) NOT NULL,
    capacity    TINYINT UNSIGNED NOT NULL DEFAULT 2,
    bed_type    VARCHAR(50),              -- 'King', 'Queen', 'Twin'
    size_sqm    DECIMAL(6,2),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    INDEX idx_hotel (hotel_id)
);
```

### `rooms`
```sql
CREATE TABLE rooms (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    hotel_id        INT UNSIGNED NOT NULL,
    category_id     INT UNSIGNED NOT NULL,
    room_number     VARCHAR(20) NOT NULL,
    floor           TINYINT UNSIGNED,
    status          ENUM('available','occupied','maintenance','out_of_service')
                    NOT NULL DEFAULT 'available',
    custom_price    DECIMAL(10,2),       -- Override category base_price if set
    notes           TEXT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (category_id) REFERENCES room_categories(id),
    UNIQUE KEY uq_room_number_hotel (hotel_id, room_number),
    INDEX idx_hotel_status (hotel_id, status)
);
```

### `room_images`
```sql
CREATE TABLE room_images (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id   INT UNSIGNED NOT NULL,
    room_id     INT UNSIGNED,            -- NULL if hotel-level image
    hotel_id    INT UNSIGNED NOT NULL,
    url         VARCHAR(500) NOT NULL,
    caption     VARCHAR(255),
    sort_order  TINYINT UNSIGNED DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);
```

### `amenities`
```sql
CREATE TABLE amenities (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    icon        VARCHAR(50),     -- icon identifier (e.g., 'wifi', 'pool')
    category    VARCHAR(50)      -- 'bathroom', 'connectivity', 'recreation'
);

CREATE TABLE hotel_amenities (
    hotel_id    INT UNSIGNED NOT NULL,
    amenity_id  INT UNSIGNED NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id)
);

CREATE TABLE room_amenities (
    room_id     INT UNSIGNED NOT NULL,
    amenity_id  INT UNSIGNED NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id)
);
```

### `bookings`
```sql
CREATE TABLE bookings (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id           INT UNSIGNED NOT NULL,
    hotel_id            INT UNSIGNED NOT NULL,
    guest_id            INT UNSIGNED NOT NULL,
    reference_number    VARCHAR(20) NOT NULL UNIQUE,    -- e.g., SOS-A7B2C
    check_in_date       DATE NOT NULL,
    check_out_date      DATE NOT NULL,
    nights              TINYINT UNSIGNED NOT NULL,
    num_guests          TINYINT UNSIGNED NOT NULL DEFAULT 1,
    status              ENUM('pending','confirmed','checked_in',
                             'checked_out','completed','cancelled',
                             'rejected','no_show')
                        NOT NULL DEFAULT 'pending',
    room_total          DECIMAL(10,2) NOT NULL,
    addon_total         DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount        DECIMAL(10,2) NOT NULL,
    promotion_id        INT UNSIGNED,
    special_requests    TEXT,
    cancellation_reason TEXT,
    cancelled_at        DATETIME,
    confirmed_at        DATETIME,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (guest_id) REFERENCES users(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_guest (guest_id),
    INDEX idx_dates (check_in_date, check_out_date),
    INDEX idx_reference (reference_number)
);
```

### `booking_rooms`
```sql
CREATE TABLE booking_rooms (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT UNSIGNED NOT NULL,
    room_id     INT UNSIGNED NOT NULL,
    nightly_rate DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    UNIQUE KEY uq_booking_room (booking_id, room_id)
);
```

### `payments`
```sql
CREATE TABLE payments (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id           INT UNSIGNED NOT NULL,
    booking_id          INT UNSIGNED NOT NULL,
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    status              ENUM('pending','completed','failed','refunded','partial_refund')
                        NOT NULL DEFAULT 'pending',
    payment_method      ENUM('card','bank_transfer','wallet') NOT NULL DEFAULT 'card',
    stripe_payment_intent_id VARCHAR(100),
    stripe_charge_id    VARCHAR(100),
    platform_commission DECIMAL(10,2) NOT NULL DEFAULT 0,
    hotel_payout        DECIMAL(10,2) NOT NULL DEFAULT 0,
    payout_status       ENUM('pending','paid','failed') DEFAULT 'pending',
    paid_at             DATETIME,
    refunded_at         DATETIME,
    refund_amount       DECIMAL(10,2),
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_booking (booking_id),
    INDEX idx_stripe_intent (stripe_payment_intent_id)
);
```

### `reviews`
```sql
CREATE TABLE reviews (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    hotel_id        INT UNSIGNED NOT NULL,
    booking_id      INT UNSIGNED NOT NULL UNIQUE,
    guest_id        INT UNSIGNED NOT NULL,
    overall_score   TINYINT UNSIGNED NOT NULL,      -- 1-10
    cleanliness_score TINYINT UNSIGNED,
    service_score   TINYINT UNSIGNED,
    location_score  TINYINT UNSIGNED,
    value_score     TINYINT UNSIGNED,
    title           VARCHAR(255),
    body            TEXT,
    hotel_response  TEXT,
    responded_at    DATETIME,
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (guest_id) REFERENCES users(id),
    INDEX idx_hotel_published (hotel_id, is_published)
);
```

### `notifications`
```sql
CREATE TABLE notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id   INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL,
    type        VARCHAR(50) NOT NULL,     -- 'booking_confirmed', 'new_review', etc.
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    data        JSON,                     -- extra payload (e.g., booking_id)
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created (created_at)
);
```

### `promotions`
```sql
CREATE TABLE promotions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    hotel_id        INT UNSIGNED NOT NULL,
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    discount_type   ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
    discount_value  DECIMAL(10,2) NOT NULL,
    min_nights      TINYINT UNSIGNED DEFAULT 1,
    min_amount      DECIMAL(10,2),
    usage_limit     INT UNSIGNED,
    used_count      INT UNSIGNED NOT NULL DEFAULT 0,
    starts_at       DATETIME,
    expires_at      DATETIME,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_code_hotel (code, hotel_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    INDEX idx_hotel_active (hotel_id, is_active)
);
```

### `themes`
```sql
CREATE TABLE themes (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id   INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,
    config      JSON NOT NULL,            -- full theme configuration
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

### `user_theme_preferences`
```sql
CREATE TABLE user_theme_preferences (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL UNIQUE,
    mode        ENUM('light','dark','system') NOT NULL DEFAULT 'system',
    color_scheme VARCHAR(50) DEFAULT 'default',
    font_size   ENUM('small','medium','large') NOT NULL DEFAULT 'medium',
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `messages`
```sql
CREATE TABLE messages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id   INT UNSIGNED NOT NULL,
    booking_id  INT UNSIGNED,
    sender_id   INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    body        TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    INDEX idx_booking (booking_id),
    INDEX idx_receiver_unread (receiver_id, is_read)
);
```

### `invoices`
```sql
CREATE TABLE invoices (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED NOT NULL,
    booking_id      INT UNSIGNED NOT NULL UNIQUE,
    invoice_number  VARCHAR(30) NOT NULL UNIQUE,
    amount          DECIMAL(10,2) NOT NULL,
    pdf_url         VARCHAR(500),
    issued_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

---

## Indexing Strategy

```sql
-- Performance-critical composite indexes
CREATE INDEX idx_rooms_availability
    ON booking_rooms (room_id)
    INCLUDE (booking_id);

CREATE INDEX idx_bookings_hotel_dates
    ON bookings (hotel_id, check_in_date, check_out_date, status);

CREATE INDEX idx_hotels_search
    ON hotels (city, is_active, is_deleted);
```

---

## SQLAlchemy Base Model

```python
# app/models/base.py

from sqlalchemy import Column, Integer, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

class BaseModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
```
