# 🚀 Quick Start Guide - StayOS

Get your hotel booking platform running in 5 minutes!

## Prerequisites

- ✅ Python 3.11+
- ✅ Node.js 18+
- ✅ PostgreSQL 14+ (optional for initial run)
- ✅ Redis (optional for initial run)

## Step-by-Step Setup

### Option 1: Automated Setup (Recommended)

```bash
# Navigate to project directory
cd "/home/uk-bai/C_file/Hotel project/1"

# Run the setup script
./setup.sh
```

This will:
- Install all backend dependencies
- Install all frontend dependencies
- Create environment files
- Check your system requirements

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

## Configuration

### Backend (.env)

Minimum required settings:

```env
APP_SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/stayos_db
JWT_SECRET_KEY=your-jwt-secret-here
```

For development without database, you can use SQLite temporarily:

```env
DATABASE_URL=sqlite+aiosqlite:///./stayos.db
```

**Create PostgreSQL database:**
```bash
# Using createdb
createdb stayos_db

# Or using psql
psql -U postgres -c "CREATE DATABASE stayos_db;"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Running the Platform

### Terminal 1 - Backend API

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at: http://localhost:8000  
📚 API Docs at: http://localhost:8000/docs

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

✅ Frontend running at: http://localhost:3000

## Testing the Setup

1. **Open browser**: Go to http://localhost:3000
2. **View landing page**: You should see the StayOS homepage
3. **Check API docs**: Go to http://localhost:8000/docs
4. **Test auth endpoint**: Try POST /api/v1/auth/register

## Next Steps

### Phase 1: Core Features
1. Set up MySQL database
2. Create database tables (auto-created on startup in dev mode)
3. Implement hotel search endpoints
4. Build room management APIs

### Phase 2: Booking Flow
1. Implement booking creation
2. Add payment integration (Stripe)
3. Build checkout pages
4. Create user dashboard

### Phase 3: Admin Features
1. Build admin dashboard
2. Add room management UI
3. Implement booking calendar
4. Create analytics reports

## Troubleshooting

### Backend won't start

**Error: Module not found**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Error: Database connection failed**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL in .env
- Create database: `psql -U postgres -c "CREATE DATABASE stayos_db;"`

### Frontend won't start

**Error: Module not found**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: Port 3000 in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Can't access API

- Ensure backend is running
- Check CORS_ORIGINS in backend/.env includes http://localhost:3000
- Verify NEXT_PUBLIC_API_BASE_URL in frontend/.env.local

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- Backend: uvicorn with `--reload` flag
- Frontend: Next.js dev server auto-reloads

### Database Changes

In development, tables are auto-created on startup. For migrations in production:

```bash
cd backend
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

**PostgreSQL specific notes:**
- PostgreSQL uses SERIAL or IDENTITY for auto-increment columns
- Boolean defaults work the same as MySQL
- String types use VARCHAR without length limits by default

### Testing Authentication

Use the API docs to test:

1. Register: POST /api/v1/auth/register
2. Login: POST /api/v1/auth/login
3. Use returned access_token in Authorization header

## Useful Commands

### Backend

```bash
# Run tests
pytest

# Format code
black app/

# Type checking
mypy app/

# View logs
tail -f backend.log
```

### Frontend

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Run production server
npm run start

# Type checking
npx tsc --noEmit
```

## Resources

- 📚 Full Documentation: `saas_hotel_docs/`
- 🔧 Backend README: `backend/README.md`
- 🎨 Frontend README: `frontend/README.md`
- 📋 Project Summary: `PROJECT_SUMMARY.md`
- 🌐 Main README: `README.md`

## Getting Help

1. Check the documentation in `saas_hotel_docs/`
2. View API documentation at `/docs` endpoint
3. Review example code in repository pattern
4. Check error logs in console

---

**Happy Coding! 🎉**

Your multi-tenant SaaS hotel booking platform is ready for development.
