# 08 — System Architecture

## High-Level System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                  │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Guest Portal    │  │  Hotel Admin     │  │  Super Admin     │    │
│  │  (Next.js SSR)   │  │  Dashboard       │  │  Dashboard       │    │
│  │  Booking UI      │  │  (Next.js CSR)   │  │  (Next.js CSR)   │    │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘    │
└───────────┼──────────────────────┼──────────────────────┼─────────────┘
            │                      │                      │
            └──────────────────────┴──────────────────────┘
                                   │ HTTPS / REST API
┌──────────────────────────────────▼──────────────────────────────────┐
│                          API GATEWAY LAYER                           │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                nginx Reverse Proxy                           │    │
│  │  • SSL termination        • Rate limiting                    │    │
│  │  • Load balancing         • Request logging                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                        APPLICATION LAYER                             │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │  FastAPI     │ │  FastAPI     │ │  FastAPI     │                │
│  │  Instance 1  │ │  Instance 2  │ │  Instance N  │                │
│  │              │ │              │ │              │                │
│  │  Middlewares │ │  Middlewares │ │  Middlewares │                │
│  │  ├ Tenant    │ │  ├ Tenant    │ │  ├ Tenant    │                │
│  │  ├ Auth      │ │  ├ Auth      │ │  ├ Auth      │                │
│  │  └ CORS      │ │  └ CORS      │ │  └ CORS      │                │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘                │
│         └────────────────┴────────────────┘                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼────────┐    ┌───────▼────────┐
│  MySQL        │    │  Redis Cache     │    │  S3 Storage    │
│  Primary DB   │    │  ├ Search cache  │    │  ├ Images      │
│  + Replica    │    │  ├ Session data  │    │  ├ Documents   │
│               │    │  └ Rate limits   │    │  └ Invoices    │
└───────────────┘    └──────────────────┘    └────────────────┘

        ┌──────────────────────┬──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼────────┐    ┌───────▼────────┐
│  Celery       │    │  SendGrid        │    │  Stripe        │
│  Workers      │    │  (Email)         │    │  (Payments)    │
│  (Async jobs) │    │                  │    │                │
└───────────────┘    └──────────────────┘    └────────────────┘
```

---

## Request Lifecycle

```
1. Browser / Mobile Client
   └── HTTPS Request → nginx

2. nginx
   └── SSL termination
   └── Rate limit check (fail → 429)
   └── Forward to FastAPI instance

3. FastAPI Application
   ├── TenantMiddleware
   │   └── Resolve tenant from subdomain
   │   └── Inject tenant_id into request.state
   │
   ├── AuthMiddleware (for protected routes)
   │   └── Extract JWT from Authorization header
   │   └── Validate and decode token
   │   └── Inject current_user into request.state
   │
   ├── Route Handler
   │   └── Pydantic input validation
   │   └── Call Service layer
   │
   ├── Service Layer
   │   └── Business logic
   │   └── Call Repository layer
   │
   ├── Repository Layer
   │   └── SQLAlchemy queries (tenant-scoped)
   │   └── Redis cache check/set
   │
   └── Response serialization (Pydantic)
       └── Return JSON to client
```

---

## Component Responsibilities

### nginx
- SSL/TLS termination
- Wildcard subdomain routing (`*.stayos.com`)
- Static file serving
- Gzip compression
- Rate limiting (using `limit_req_zone`)

### FastAPI Application
- REST API endpoint handling
- Request validation (Pydantic)
- Authentication (JWT)
- Tenant resolution middleware
- Business logic via services
- Background task dispatching

### SQLAlchemy ORM
- Database connection pooling
- Async queries (using asyncpg/aiomysql)
- Model definitions with relationships
- Migration management (Alembic)

### Redis
- Search result caching (TTL: 5 min)
- Tenant data caching (TTL: 5 min)
- Rate limit counters
- Background task queue (Celery broker)

### Celery Workers
- Async email sending
- PDF invoice generation
- Booking reminder scheduling
- Report generation

### S3 / Object Storage
- Hotel and room images
- User profile photos
- Invoice PDFs
- Backup files

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS / GCP Deployment                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              VPC (Virtual Private Cloud)         │   │
│  │                                                  │   │
│  │  Public Subnet:                                  │   │
│  │  ├── EC2 / ALB (Application Load Balancer)       │   │
│  │  └── CloudFront CDN (static assets)             │   │
│  │                                                  │   │
│  │  Private Subnet:                                 │   │
│  │  ├── EC2 Auto Scaling Group (FastAPI)            │   │
│  │  ├── EC2 (Celery Workers)                        │   │
│  │  ├── RDS MySQL (Multi-AZ)                        │   │
│  │  └── ElastiCache Redis                           │   │
│  │                                                  │   │
│  │  Other Services:                                 │   │
│  │  ├── S3 (Media Storage)                          │   │
│  │  ├── SES / SendGrid (Email)                      │   │
│  │  ├── Route 53 (DNS + Wildcard)                   │   │
│  │  └── ACM (Wildcard SSL Certificate)              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

```bash
# .env.example

# App
APP_ENV=production
APP_SECRET_KEY=your-secret-key-here
APP_DEBUG=false

# Database
DATABASE_URL=mysql+aiomysql://user:pass@localhost:3306/stayos_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=stayos-media
AWS_REGION=us-east-1
CDN_BASE_URL=https://cdn.stayos.com

# Email
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@stayos.com
EMAIL_FROM_NAME=StayOS

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_COMMISSION_PERCENT=3.0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.stayos.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Docker Compose (Development)

```yaml
# docker-compose.yml

version: '3.9'

services:
  api:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    env_file: .env
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"

  worker:
    build: ./backend
    command: celery -A app.worker worker --loglevel=info
    volumes:
      - ./backend:/app
    env_file: .env
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: stayos_db
      MYSQL_USER: stayos
      MYSQL_PASSWORD: stayos_pass
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```
