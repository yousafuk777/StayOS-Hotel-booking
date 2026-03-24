# 01 — Project Overview

## Platform Name
**StayOS** — Multi-Tenant SaaS Hotel Booking & Management Platform

---

## Executive Summary

StayOS is a cloud-based, multi-tenant Software-as-a-Service (SaaS) platform designed to power hotel booking and property management operations for multiple hotels simultaneously. Each hotel operates as an independent tenant with isolated data, custom branding, and full administrative control over its property. A central Super Admin governs the entire SaaS ecosystem.

---

## Platform Goals

| Goal | Description |
|------|-------------|
| Multi-Tenancy | Multiple hotels operate independently on a shared infrastructure |
| End-User Booking | Guests can search, browse, and book hotel rooms online |
| Hotel Management | Hotel admins manage rooms, staff, pricing, and reservations |
| SaaS Governance | Super Admin manages tenants, billing, compliance, and platform health |
| Customization | Each hotel can brand its own portal with custom themes and styles |

---

## High-Level Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        INTERNET / USERS                          │
└──────────────┬──────────────────┬───────────────────────────────┘
               │                  │
   ┌───────────▼──────┐  ┌────────▼──────────┐
   │  Guest / Booking │  │  Hotel Admin Panel │
   │  Web Application │  │  (per-tenant)      │
   └───────────┬──────┘  └────────┬──────────┘
               │                  │
        ┌──────▼──────────────────▼──────┐
        │         Next.js Frontend        │
        │  (SSR + CSR, TailwindCSS, TS)   │
        └──────────────┬─────────────────┘
                       │ REST API (HTTPS)
        ┌──────────────▼─────────────────┐
        │        FastAPI Backend           │
        │  (Python, SQLAlchemy, JWT Auth)  │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼─────────────────┐
        │         MySQL Database           │
        │  (Multi-tenant, Row-level ISO)   │
        └─────────────────────────────────┘
```

---

## Core Stakeholders

### 1. Guests (End Users)
- Browse and search hotels
- Book rooms with real-time availability
- Manage bookings, view invoices, leave reviews

### 2. Hotel Admins (Tenant Admins)
- Manage hotel profile, rooms, pricing, staff
- Process reservations and handle operations
- View analytics and revenue reports

### 3. Super Admin (SaaS Owner)
- Onboard and manage hotel tenants
- Manage subscriptions, billing, and payouts
- Monitor platform health, security, and compliance

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| State Management | Zustand / TanStack Query |
| Backend | Python 3.11+, FastAPI |
| ORM | SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Authentication | JWT (OAuth2 Password Bearer) |
| Database | MySQL 8.x |
| Payments | Stripe |

---

## Platform Modules

```
StayOS Platform
├── Public Booking Portal (Guest-facing)
│   ├── Hotel Search & Filters
│   ├── Hotel & Room Details
│   ├── Booking Flow
│   └── User Dashboard
│
├── Hotel Admin Panel (Per-tenant)
│   ├── Property Configuration
│   ├── Room & Inventory Management
│   ├── Reservation Management
│   ├── Staff & Housekeeping
│   ├── Revenue & Reports
│   └── Branding & Theme Settings
│
└── Super Admin Panel (SaaS control)
    ├── Tenant Management
    ├── Subscription & Billing
    ├── Platform Analytics
    ├── Security & Compliance
    └── CMS & Support
```

---

## Development Phases

| Phase | Scope |
|-------|-------|
| Phase 1 | Core authentication, multi-tenant setup, hotel & room management |
| Phase 2 | Booking engine, payments, guest dashboard |
| Phase 3 | Reviews, notifications, analytics |
| Phase 4 | Theme customization, marketing tools, upselling |
| Phase 5 | Super Admin panel, SaaS billing, compliance |

---

## Key Design Principles

- **Tenant Isolation**: Every DB query is scoped by `tenant_id`
- **Role-Based Access Control**: Granular permissions per role
- **API-First**: All features exposed via versioned REST APIs
- **Mobile-First**: Responsive UI built with TailwindCSS
- **Scalability**: Stateless backend, horizontally scalable
- **Security**: JWT tokens, HTTPS, input validation, rate limiting
