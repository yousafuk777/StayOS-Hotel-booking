# StayOS - Multi-Tenant SaaS Hotel Booking Platform

## 🏨 Project Overview

StayOS is a comprehensive cloud-based, multi-tenant SaaS platform designed to power hotel booking and property management operations for multiple hotels simultaneously.

### Key Features

- **Multi-Tenancy**: Multiple hotels operate independently on shared infrastructure
- **Guest Booking Portal**: Search, browse, and book hotels online
- **Hotel Management Dashboard**: Manage rooms, pricing, staff, and reservations
- **Super Admin Panel**: Platform governance, tenant management, and analytics
- **Custom Branding**: Each hotel can brand its portal with custom themes
- **Payment Integration**: Stripe integration for secure payments
- **Review System**: Guest reviews and ratings
- **Real-time Availability**: Live room availability and pricing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Guest Portal │  │ Admin Panel  │  │ Super Admin  │      │
│  │ (Next.js)    │  │ (Next.js)    │  │ (Next.js)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │ HTTPS/REST
┌─────────▼─────────────────▼─────────────────▼──────────────┐
│                   API GATEWAY (nginx)                        │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│              APPLICATION LAYER (FastAPI)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ FastAPI  │ │ FastAPI  │ │ FastAPI  │  (Auto-scaling)   │
│  │ Inst 1   │ │ Inst 2   │ │ Inst N   │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└──────────────────────────┬─────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌──────▼──────┐
│ MySQL 8.x     │  │ Redis Cache   │  │ S3 Storage  │
│ Primary +     │  │ - Search      │  │ - Images    │
│ Replica       │  │ - Sessions    │  │ - Documents │
└───────────────┘  └───────────────┘  └─────────────┘
```

## 📁 Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── hotels.py         # Hotel CRUD + search
│   │   │   ├── rooms.py          # Room management
│   │   │   ├── bookings.py       # Booking flow
│   │   │   ├── payments.py       # Payment processing
│   │   │   ├── reviews.py        # Reviews and ratings
│   │   │   ├── admin/            # Hotel admin routes
│   │   │   └── super_admin/      # Platform management
│   │   └── deps.py               # Shared dependencies
│   │
│   ├── core/
│   │   ├── config.py             # Environment settings
│   │   ├── security.py           # JWT + password hashing
│   │   ├── database.py           # SQLAlchemy async engine
│   │   ├── cache.py              # Redis client
│   │   └── permissions.py        # RBAC system
│   │
│   ├── middleware/
│   │   ├── tenant.py             # Tenant resolution
│   │   └── logging.py            # Request logging
│   │
│   ├── models/                   # SQLAlchemy models
│   │   ├── tenant.py
│   │   ├── user.py
│   │   ├── hotel.py
│   │   ├── room.py
│   │   ├── booking.py
│   │   ├── payment.py
│   │   └── review.py
│   │
│   ├── repositories/             # Data access layer
│   │   ├── base.py
│   │   ├── user_repo.py
│   │   └── tenant_repo.py
│   │
│   ├── schemas/                  # Pydantic schemas
│   │   └── auth.py
│   │
│   ├── services/                 # Business logic
│   │   ├── auth_service.py
│   │   └── booking_service.py
│   │
│   └── main.py                   # FastAPI app entry
│
├── alembic/                       # Database migrations
│   ├── env.py
│   └── versions/
│
├── tests/
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7.x
- Docker (optional)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. **Set up database:**
```bash
# Create PostgreSQL database
createdb stayos_db
# Or using psql:
# psql -U postgres -c "CREATE DATABASE stayos_db;"
```

6. **Run database migrations:**
```bash
# For development, tables are created automatically on startup
# In production, use Alembic:
alembic upgrade head
```

6. **Start the backend server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup (Coming Next)

1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Run development server: `npm run dev`

## 🔐 Authentication System

StayOS uses JWT-based authentication:

- **Access Token**: Short-lived (15 min), sent in `Authorization: Bearer` header
- **Refresh Token**: Long-lived (7 days), stored in `httpOnly` cookie

### User Roles

- **Super Admin**: Platform owner with full access
- **Hotel Admin**: Full control over their hotel/tenant
- **Hotel Manager**: View-only + reports access
- **Front Desk**: Reservations and check-in/out
- **Housekeeping**: Room status updates
- **Guest**: Booking and profile management

## 🗄️ Database Schema

Key tables:

- `tenants`: Hotel tenants (each hotel is a tenant)
- `users`: All users (guests, staff, admins)
- `hotels`: Hotel properties
- `rooms`: Individual rooms
- `room_categories`: Room types (Standard, Deluxe, Suite)
- `bookings`: Reservation records
- `payments`: Payment transactions
- `reviews`: Guest reviews and ratings

All tenant-scoped tables include `tenant_id` for row-level isolation.

## 📊 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Reset password

### Hotels (Public)

- `GET /api/v1/hotels/search` - Search hotels
- `GET /api/v1/hotels/{id}` - Get hotel details
- `GET /api/v1/hotels/{id}/rooms` - Get available rooms
- `GET /api/v1/hotels/{id}/reviews` - Get reviews

### Bookings

- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List user's bookings
- `PUT /api/v1/bookings/{id}/cancel` - Cancel booking

## 🎨 Theme System

Each tenant can customize their portal:

- Logo and branding colors
- Font family and sizes
- Light/dark mode
- Custom CSS variables

## 💳 Payment Integration

- Stripe integration for card payments
- Platform commission collection
- Automatic payouts to hotels
- Refund processing

## 📧 Notification System

- Email notifications (SendGrid)
- In-app notifications
- Background task processing (Celery)

## 🔒 Security Features

- JWT authentication with short-lived tokens
- httpOnly cookies for refresh tokens
- bcrypt password hashing
- SQL injection prevention (parameterized queries)
- Input validation (Pydantic)
- Rate limiting
- CORS protection
- Role-based access control

## 📈 Monitoring & Observability

- Health check endpoint: `/health`
- Structured JSON logging
- Prometheus metrics
- OpenTelemetry tracing
- Error tracking

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Services:
# - API (port 8000)
# - Worker (Celery)
# - Frontend (port 3000)
# - MySQL (port 3306)
# - Redis (port 6379)
```

### Production Checklist

- [ ] Set strong `APP_SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure CORS origins
- [ ] Set up SendGrid for emails
- [ ] Configure Stripe for payments
- [ ] Set up S3 for file storage
- [ ] Enable monitoring and alerting
- [ ] Set up backups

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support, contact: support@stayos.com

---

**Built with ❤️ using FastAPI and Next.js**
