# 03 — User Requirements

## Overview

This document captures the functional requirements from the perspective of each user type on the StayOS platform.

---

## User Types

| Type | Description |
|------|-------------|
| Guest | Public user who searches and books hotels |
| Hotel Admin | Manager of a specific hotel tenant |
| Hotel Staff | Front desk, housekeeping, etc. |
| Super Admin | SaaS platform owner/operator |

---

## 1. Guest (End User) Requirements

### 1.1 Account Management

| ID | Requirement |
|----|-------------|
| GU-01 | Guest can register with email and password |
| GU-02 | Guest can sign in with email/password |
| GU-03 | Guest can reset password via email link |
| GU-04 | Guest can update profile (name, phone, address) |
| GU-05 | Guest can upload a profile photo |
| GU-06 | Guest can view their booking history |
| GU-07 | Guest can save/favorite hotels |
| GU-08 | Guest can delete their account |

### 1.2 Hotel Search

| ID | Requirement |
|----|-------------|
| GU-10 | Guest can search hotels by destination (city, region) |
| GU-11 | Guest can search by check-in and check-out dates |
| GU-12 | Guest can search by number of guests (adults + children) |
| GU-13 | Guest can view search results on a map |
| GU-14 | Search results must show real-time availability |

### 1.3 Filters

| ID | Requirement |
|----|-------------|
| GU-20 | Guest can filter by price range (min/max per night) |
| GU-21 | Guest can filter by star rating (1–5 stars) |
| GU-22 | Guest can filter by guest rating (review score) |
| GU-23 | Guest can filter by distance from a location |
| GU-24 | Guest can filter by amenities (WiFi, pool, gym, etc.) |
| GU-25 | Guest can filter by meal plan (breakfast, all-inclusive, etc.) |
| GU-26 | Guest can filter by cancellation policy (free cancellation) |

### 1.4 Hotel Evaluation

| ID | Requirement |
|----|-------------|
| GU-30 | Guest can view hotel detail page |
| GU-31 | Guest can view hotel photo gallery |
| GU-32 | Guest can view all room types with photos |
| GU-33 | Guest can view detailed amenities list |
| GU-34 | Guest can view all guest reviews and ratings |
| GU-35 | Guest can view pricing per room per night |
| GU-36 | Guest can check room availability for specific dates |

### 1.5 Booking Flow

| ID | Requirement |
|----|-------------|
| GU-40 | Guest can select a room type |
| GU-41 | Guest can choose number of rooms |
| GU-42 | Guest can enter guest details (primary + additional guests) |
| GU-43 | Guest can select add-ons (breakfast, airport transfer, etc.) |
| GU-44 | Guest can apply promo/discount codes |
| GU-45 | Guest can choose payment method (card, wallet) |
| GU-46 | Guest receives email confirmation after booking |
| GU-47 | Guest can book in advance (up to 365 days ahead) |

### 1.6 Booking Management

| ID | Requirement |
|----|-------------|
| GU-50 | Guest can view all current and past bookings |
| GU-51 | Guest can modify booking dates (subject to policy) |
| GU-52 | Guest can cancel a booking (with refund per policy) |
| GU-53 | Guest can download PDF invoice/receipt |
| GU-54 | Guest can contact hotel support via message |
| GU-55 | Guest can submit a review after checkout |

---

## 2. Hotel Admin Requirements

### 2.1 Property Configuration

| ID | Requirement |
|----|-------------|
| HA-01 | Admin can set hotel name, description, address, contact info |
| HA-02 | Admin can upload hotel photos (gallery) |
| HA-03 | Admin can set hotel star rating and category |
| HA-04 | Admin can define hotel policies (check-in/out times, pets, smoking) |
| HA-05 | Admin can configure amenities (hotel-wide) |
| HA-06 | Admin can set cancellation and refund policies |

### 2.2 Room Management

| ID | Requirement |
|----|-------------|
| HA-10 | Admin can create room categories (Standard, Deluxe, Suite) |
| HA-11 | Admin can add individual rooms with room number |
| HA-12 | Admin can upload room photos |
| HA-13 | Admin can set base price and weekend pricing |
| HA-14 | Admin can define room capacity (max guests) |
| HA-15 | Admin can set room-specific amenities |
| HA-16 | Admin can mark rooms as maintenance/out-of-service |

### 2.3 Reservations & Operations

| ID | Requirement |
|----|-------------|
| HA-20 | Admin can view all incoming reservations |
| HA-21 | Admin can confirm or reject reservation requests |
| HA-22 | Admin can view booking calendar (month/week view) |
| HA-23 | Admin can manage check-in and check-out |
| HA-24 | Admin can track housekeeping status per room |
| HA-25 | Admin can assign housekeeping staff to rooms |

### 2.4 Staff Management

| ID | Requirement |
|----|-------------|
| HA-30 | Admin can create staff accounts |
| HA-31 | Admin can assign roles to staff (front desk, housekeeping) |
| HA-32 | Admin can deactivate staff accounts |

### 2.5 Revenue & Analytics

| ID | Requirement |
|----|-------------|
| HA-40 | Admin can view total revenue per period |
| HA-41 | Admin can view occupancy rate |
| HA-42 | Admin can view booking reports (by room, by period) |
| HA-43 | Admin can export reports as CSV/PDF |
| HA-44 | Admin can generate invoices |

### 2.6 Branding & Themes

| ID | Requirement |
|----|-------------|
| HA-50 | Admin can upload hotel logo |
| HA-51 | Admin can set brand primary and secondary colors |
| HA-52 | Admin can set default theme (light/dark) for hotel portal |
| HA-53 | Admin can configure header and footer content |
| HA-54 | Admin can set default font family |

---

## 3. Super Admin Requirements

| ID | Requirement |
|----|-------------|
| SA-01 | Super Admin can register new hotel tenants |
| SA-02 | Super Admin can approve or reject hotel applications |
| SA-03 | Super Admin can suspend or terminate tenants |
| SA-04 | Super Admin can view all platform users |
| SA-05 | Super Admin can manage global roles and permissions |
| SA-06 | Super Admin can view platform-wide analytics |
| SA-07 | Super Admin can manage subscription plans |
| SA-08 | Super Admin can view all payment transactions |
| SA-09 | Super Admin can process refunds |
| SA-10 | Super Admin can view system health and logs |
| SA-11 | Super Admin can broadcast notifications to hotels |
| SA-12 | Super Admin can manage CMS (terms, privacy, help pages) |
| SA-13 | Super Admin can configure platform-wide settings |
| SA-14 | Super Admin can manage integrations (payment, email, SMS) |
| SA-15 | Super Admin can resolve disputes between guests and hotels |
