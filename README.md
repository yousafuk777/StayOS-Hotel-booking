# 🏨 StayOS - Complete Multi-Tenant SaaS Hotel Booking Platform

## 🎉 Project Overview

StayOS is a production-ready, cloud-based multi-tenant SaaS platform for hotel booking and property management. Built with modern technologies, it provides everything needed to run a hotel booking business.

### ✨ Key Features

- **Multi-Tenancy**: Multiple hotels operate independently on shared infrastructure
- **Guest Portal**: Search, browse, book, and manage reservations
- **Hotel Admin Panel**: Complete property management system
- **Super Admin Dashboard**: Platform governance and analytics
- **Real-time Availability**: Live room inventory and pricing
- **Payment Processing**: Stripe integration with commission collection
- **Review System**: Guest ratings and reviews
- **Theme Customization**: Per-tenant branding and theming
- **Role-Based Access**: Granular permissions system
- **Responsive Design**: Mobile-first UI

## 🏗️ Technology Stack

### Backend
- **FastAPI** (Python 3.11+) - REST API
- **SQLAlchemy 2.x** - Async ORM
- **PostgreSQL 14+** - Database
- **Redis** - Caching & Sessions
- **Celery** - Background Tasks
- **JWT** - Authentication
- **Stripe** - Payments
- **SendGrid** - Email

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **TanStack Query** - Data Fetching
- **Zustand** - State Management
- **Stripe** - Payment UI

## 📁 Project Structure

```
Hotel project/1/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # REST endpoints
│   │   ├── core/              # Core utilities
│   │   ├── models/            # SQLAlchemy models
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Request middleware
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── services/          # API clients
│   │   ├── store/             # State management
│   │   └── hooks/             # Custom hooks
│   ├── package.json
│   ├── next.config.js
│   └── README.md
│
└── saas_hotel_docs/           # Complete documentation
    ├── 01_project_overview.md
    ├── 02_saas_platform_scope.md
    ├── ... (24 documentation files)
```

## 🚀 Quick Start Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7.x
- Docker (optional)

### Option 1: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials, secrets, etc.

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API will be running at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:3000`

### Option 2: Docker Setup (Coming Soon)

```bash
docker-compose up -d
```

## 🔐 Default Credentials (Development)

After setting up the database, you can use:

**Super Admin:**
- Email: superadmin@stayos.com
- Password: admin123

**Hotel Admin:**
- Email: admin@grandhotel.com
- Password: hotel123

**Guest:**
- Email: guest@example.com
- Password: guest123

⚠️ **Change these in production!**

## 📊 Database Schema

The platform uses PostgreSQL with a multi-tenant architecture and row-level isolation:

- **tenants**: Hotel tenants (each hotel is a tenant)
- **users**: All users (guests, staff, admins)
- **hotels**: Hotel properties
- **rooms**: Individual rooms with categories
- **bookings**: Reservation records
- **payments**: Payment transactions
- **reviews**: Guest reviews and ratings
- **notifications**: In-app notifications
- **themes**: Tenant branding configuration

All tenant-scoped tables include `tenant_id` for data isolation.

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Hotels (Public)
- `GET /api/v1/hotels/search` - Search with filters
- `GET /api/v1/hotels/{id}` - Get hotel details
- `GET /api/v1/hotels/{id}/rooms` - Get available rooms

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List bookings
- `PUT /api/v1/bookings/{id}/cancel` - Cancel booking

### Admin (Hotel Staff)
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET/POST /api/v1/admin/rooms` - Room management
- `GET /api/v1/admin/bookings` - All bookings
- `GET /api/v1/admin/analytics/revenue` - Revenue reports

### Super Admin
- `GET /api/v1/super-admin/tenants` - List all tenants
- `POST /api/v1/super-admin/tenants` - Create tenant
- `GET /api/v1/super-admin/analytics` - Platform analytics

Full API documentation: `http://localhost:8000/docs`

## 👥 User Roles

### Guest
- Search and book hotels
- Manage own bookings
- Leave reviews
- View booking history

### Hotel Staff Roles

**Front Desk:**
- Manage reservations
- Check-in/check-out guests
- View guest information

**Housekeeping:**
- Update room status
- View assigned rooms

**Hotel Manager:**
- View reports and analytics
- Read-only access to operations

**Hotel Admin:**
- Full control over their hotel
- Manage rooms, pricing, staff
- Configure hotel settings
- View revenue reports

### Super Admin
- Platform-wide management
- Tenant onboarding/offboarding
- Subscription management
- Platform analytics

## 🎨 Theme System

Each tenant can customize:
- Logo and brand colors
- Font family and sizes
- Light/dark mode defaults
- Custom CSS variables

Themes are applied dynamically based on the tenant subdomain.

## 💳 Payment Flow

1. Guest selects room and dates
2. System calculates total price
3. Guest enters payment details
4. Stripe processes payment
5. Platform collects commission (configurable %)
6. Remainder transferred to hotel's Stripe account
7. Invoice generated and emailed

## 📧 Notification System

Triggered notifications for:
- Booking confirmation
- Check-in reminders
- Booking modifications
- New reviews
- Payment receipts

Channels:
- Email (SendGrid)
- In-app notifications
- SMS (future enhancement)

## 🔒 Security Features

- ✅ JWT authentication with short-lived tokens
- ✅ httpOnly cookies for refresh tokens
- ✅ bcrypt password hashing
- ✅ SQL injection prevention
- ✅ Input validation (Pydantic)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Role-based access control
- ✅ Tenant isolation enforcement

## 📈 Monitoring

- Health check: `/health`
- Auto-generated OpenAPI docs: `/docs`
- Structured JSON logging
- Prometheus metrics ready
- Error tracking integration points

## 🚢 Deployment

### Environment Variables

Set these in `.env` (backend) and `.env.local` (frontend):

**Backend:**
```env
APP_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/stayos_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=...
```

**Frontend:**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Production Checklist

- [ ] Strong secret keys configured
- [ ] Production database set up
- [ ] SSL certificates installed
- [ ] CORS origins restricted
- [ ] Email service configured
- [ ] Stripe live keys set
- [ ] File storage (S3) configured
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Rate limits configured

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Documentation

Comprehensive documentation is available in the `saas_hotel_docs/` directory:

1. Project Overview
2. SaaS Platform Scope
3. User Requirements
4. Functional Specifications
5. Non-Functional Requirements
6. Multi-Tenant Architecture
7. User Roles & Permissions
8. System Architecture
9. Database Design
10. Backend FastAPI Structure
11. Frontend Next.js Structure
12. API Design
13. Authentication & Authorization
14. User Booking Flow
15. Admin Management System
16. Super Admin Platform
17. Payment System
18. Review Rating System
19. Notification System
20. Search Filter System
21. Theme Customization System
22. Landing Page Design
23. Frontend Pages Structure
24. Future Enhancements

## 🤝 Contributing

This is a proprietary project. For questions or issues, contact the development team.

## 📄 License

Proprietary software. All rights reserved.

## 🆘 Support

For support:
- Check the documentation in `saas_hotel_docs/`
- View API docs at `http://localhost:8000/docs`
- Contact: support@stayos.com

---

**Built with ❤️ using FastAPI and Next.js**

**Version:** 1.0.0  
**Last Updated:** March 2026
