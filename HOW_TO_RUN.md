# 🚀 How to Run StayOS - Step by Step

## Quick Start (3 Steps)

### Step 1: Start PostgreSQL Database

```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

Create the database (first time only):
```bash
createdb stayos_db
# Or if that fails:
sudo -u postgres createdb stayos_db
```

### Step 2: Start Backend API

Open a **new terminal window** and run:

```bash
cd "/home/uk-bai/C_file/Hotel project/1/backend"

# Activate virtual environment
source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

✅ Backend is now running at **http://localhost:8000**

### Step 3: Start Frontend

Open **another terminal window** and run:

```bash
cd "/home/uk-bai/C_file/Hotel project/1/frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

✅ Frontend is now running at **http://localhost:3000**

---

## Access the Application

Open your web browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Detailed Setup Instructions

### First-Time Setup

If you haven't set up the project yet:

#### 1. Install System Dependencies

```bash
# PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib libpq-dev

# Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Python (if not installed)
sudo apt install python3 python3-pip python3-venv
```

#### 2. Set Up Backend

```bash
cd "/home/uk-bai/C_file/Hotel project/1/backend"

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

In `.env`, set at minimum:
```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/stayos_db
APP_SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
```

#### 3. Set Up Frontend

```bash
cd "/home/uk-bai/C_file/Hotel project/1/frontend"

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Troubleshooting

### Problem: "command not found: uvicorn"

**Solution:** Make sure virtual environment is activated:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Problem: "Module not found" errors in frontend

**Solution:** Install dependencies:
```bash
cd frontend
npm install
```

### Problem: "Connection refused" to database

**Solution:** 
1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Create database if it doesn't exist:
   ```bash
   createdb stayos_db
   ```

3. Verify connection string in `backend/.env`:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/stayos_db
   ```

### Problem: Port already in use

**Solution:** Kill the process using that port:
```bash
# For port 8000
lsof -ti:8000 | xargs kill -9

# For port 3000
lsof -ti:3000 | xargs kill -9
```

Or use a different port:
```bash
# Backend
uvicorn app.main:app --reload --port 8001

# Frontend
npm run dev -- -p 3001
```

### Problem: Blank page in browser

**Solutions:**

1. **Check console for errors** (F12 → Console tab)

2. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok","version":"1.0.0"}
   ```

3. **Check API URL in frontend/.env.local:**
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Clear browser cache** and reload (Ctrl+Shift+R)

### Problem: TypeScript errors

**Solution:** 
```bash
cd frontend
npx tsc --noEmit
# Fix any errors shown
```

Or temporarily disable strict checking in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

### Problem: Can't access from browser

**Checklist:**
- [ ] Both backend and frontend are running
- [ ] No firewall blocking ports 3000 and 8000
- [ ] Using http:// (not https://) for localhost
- [ ] Browser console shows no errors

---

## Verification Steps

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected output:
```json
{"status":"ok","version":"1.0.0"}
```

### 2. Test API Documentation

Open in browser: http://localhost:8000/docs

Should show interactive API documentation.

### 3. Test Frontend

Open in browser: http://localhost:3000

Should show StayOS landing page.

### 4. Test Database Connection

```bash
psql -U postgres -d stayos_db -c "SELECT 1;"
```

Should return a row with `?`.

---

## Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit files in `backend/app/`
   - Server auto-reloads (thanks to `--reload`)
   - Refresh browser to see changes

2. **Frontend changes:**
   - Edit files in `frontend/src/`
   - Next.js auto-reloads
   - Changes appear instantly

3. **Adding new dependencies:**
   - Backend: `pip install package-name`
   - Frontend: `npm install package-name`

### Stopping the Servers

Press `Ctrl+C` in each terminal.

To restart:
```bash
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

---

## Common Commands

### Backend

```bash
# Activate environment
cd backend && source venv/bin/activate

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
# Development mode
npm run dev

# Build for production
npm run build

# Production server
npm run start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## Environment Variables

### Backend (.env)

Required:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/stayos_db
APP_SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
CORS_ORIGINS=["http://localhost:3000"]
```

Optional (for production):
```env
SENDGRID_API_KEY=...
STRIPE_SECRET_KEY=...
AWS_ACCESS_KEY_ID=...
```

### Frontend (.env.local)

Required:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Optional:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_NAME=StayOS
```

---

## Need More Help?

- Check `TROUBLESHOOTING.md` for detailed troubleshooting
- Review `QUICKSTART.md` for setup instructions
- Read `README.md` for complete documentation
- View API docs at http://localhost:8000/docs

---

**Happy Coding! 🎉**

Your StayOS platform should now be running in your browser at http://localhost:3000
