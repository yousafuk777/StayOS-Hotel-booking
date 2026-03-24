# 🔧 Troubleshooting Guide - StayOS Not Running

## Common Issues & Solutions

### Issue 1: Frontend Won't Start

#### Symptoms
- `npm run dev` fails
- Port 3000 errors
- Module not found errors

#### Solutions

**Check Node.js version:**
```bash
node --version
# Should be 18.x or higher
```

**Install dependencies:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Fix TypeScript errors (if any):**
```bash
cd frontend
npx tsc --noEmit
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

---

### Issue 2: Backend Won't Start

#### Symptoms
- `uvicorn app.main:app` fails
- Import errors
- Database connection errors

#### Solutions

**Check Python version:**
```bash
python3 --version
# Should be 3.11 or higher
```

**Activate virtual environment:**
```bash
cd backend
source venv/bin/activate
```

**Reinstall dependencies:**
```bash
pip uninstall -y -r requirements.txt
pip install -r requirements.txt
```

**Check PostgreSQL connection:**
```bash
# Test database connection
psql -U postgres -d stayos_db -c "\conninfo"
```

**Fix import errors:**
```bash
# Make sure you're in the right directory
cd backend
python -c "from app.main import app; print('OK')"
```

---

### Issue 3: Browser Shows Blank Page

#### Symptoms
- Frontend loads but shows blank/white page
- Console errors in browser DevTools

#### Solutions

**Check browser console:**
1. Open browser DevTools (F12)
2. Look for errors in Console tab
3. Check Network tab for failed requests

**Common fixes:**

1. **API not reachable:**
   ```bash
   # Check if backend is running
   curl http://localhost:8000/health
   
   # If not running, start it:
   cd backend && source venv/bin/activate && uvicorn app.main:app --reload
   ```

2. **Environment variables missing:**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with correct values
   ```

3. **Build errors:**
   ```bash
   cd frontend
   npm run build
   # Fix any errors shown
   ```

---

### Issue 4: API Endpoints Return 404

#### Symptoms
- Frontend can't find API endpoints
- 404 errors in network tab

#### Solutions

**Check backend is running:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","version":"1.0.0"}
```

**Verify API routes:**
```bash
# Test auth endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=test123"
```

**Check CORS settings:**
In `backend/.env`:
```env
CORS_ORIGINS=["http://localhost:3000"]
```

---

### Issue 5: Database Connection Failed

#### Symptoms
- Backend crashes on startup
- "Connection refused" errors

#### Solutions

**PostgreSQL not running:**
```bash
# Check status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Enable on boot
sudo systemctl enable postgresql
```

**Database doesn't exist:**
```bash
# Create database
createdb stayos_db

# Or using psql
psql -U postgres -c "CREATE DATABASE stayos_db;"
```

**Wrong credentials in .env:**
Edit `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/stayos_db
```

Test connection:
```bash
cd backend
python -c "from app.core.database import engine; print('DB OK')"
```

---

### Issue 6: TypeScript Errors in Frontend

#### Symptoms
- Red underlines in VS Code
- Build fails with TS errors

#### Solutions

**Install types:**
```bash
cd frontend
npm install --save-dev @types/node @types/react @types/react-dom
```

**Check tsconfig.json:**
Ensure paths are correct:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Reload TypeScript server:**
In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

### Issue 7: Module Not Found (Frontend)

#### Symptoms
- `Cannot find module 'axios'`
- `Cannot find module 'next'`

#### Solutions

```bash
cd frontend
npm install
```

If still failing:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 8: Backend Starts But Pages Don't Load

#### Symptoms
- Backend runs without errors
- Browser shows loading forever
- No content displayed

#### Solutions

**Check tenant middleware:**
The tenant middleware might be blocking requests. For local development, you can:

1. Add exempt paths in `backend/app/middleware/tenant.py`:
```python
EXEMPT_PATHS = ["/health", "/docs", "/openapi.json", "/api/v1/super-admin", "/"]
```

2. Or send proper host header:
```bash
curl -H "Host: grand-hotel.stayos.com" http://localhost:8000/health
```

**Test without middleware temporarily:**
Comment out in `backend/app/main.py`:
```python
# app.add_middleware(TenantMiddleware)
```

---

## Quick Health Check

Run these commands to verify everything is working:

### 1. Check Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload &
sleep 3
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"1.0.0"}
```

### 2. Check Frontend
```bash
cd frontend
npm run dev &
sleep 5
curl http://localhost:3000
# Expected: HTML content
```

### 3. Check Database
```bash
psql -U postgres -d stayos_db -c "SELECT 1;"
# Expected: Row with ? column
```

### 4. Check All Services
```bash
# PostgreSQL
sudo systemctl status postgresql

# Backend (port 8000)
lsof -i :8000

# Frontend (port 3000)
lsof -i :3000
```

---

## Development Mode Checklist

Before running in development:

- [ ] PostgreSQL is running (`sudo systemctl status postgresql`)
- [ ] Database exists (`createdb stayos_db`)
- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] Virtual environment activated (`source venv/bin/activate`)
- [ ] Dependencies installed (`pip install -r requirements.txt`, `npm install`)
- [ ] No port conflicts (8000, 3000, 5432)

---

## Production Build Issues

If development works but production build fails:

```bash
cd frontend
npm run build

# Common issues:
# 1. API URL not set
# Fix: Set NEXT_PUBLIC_API_BASE_URL in .env.local

# 2. TypeScript errors
# Fix: Run npx tsc --noEmit first

# 3. ESLint errors
# Fix: Run npm run lint and fix issues
```

---

## Still Having Issues?

1. **Check logs:**
   - Backend: Look at terminal output
   - Frontend: Check browser console (F12)
   - Database: `sudo tail -f /var/log/postgresql/postgresql-*.log`

2. **Clean restart:**
   ```bash
   # Stop all services
   pkill -f uvicorn
   pkill -f "next dev"
   
   # Clear caches
   cd frontend && rm -rf .next
   cd backend && find . -type d -name __pycache__ -exec rm -rf {} +
   
   # Restart
   ```

3. **Verify system requirements:**
   - Python 3.11+
   - Node.js 18+
   - PostgreSQL 14+
   - At least 2GB free RAM

4. **Check file permissions:**
   ```bash
   # Ensure you can read/write project files
   ls -la
   ```

---

## Error Messages & Quick Fixes

| Error Message | Quick Fix |
|--------------|-----------|
| `Address already in use` | Kill process: `lsof -ti:PORT \| xargs kill -9` |
| `ModuleNotFoundError` | Install: `pip install` or `npm install` |
| `Connection refused` | Start service: `sudo systemctl start postgresql` |
| `SyntaxError` (frontend) | Check TypeScript: `npx tsc --noEmit` |
| `OperationalError` (backend) | Check DB connection string in .env |
| `CORS error` | Add origin to CORS_ORIGINS in backend/.env |

---

## Getting Help

If none of these solutions work:

1. Check the full documentation in `/saas_hotel_docs/`
2. Review API docs at `http://localhost:8000/docs`
3. Check PostgreSQL logs
4. Verify all environment variables are set correctly
