#!/bin/bash

# StayOS Health Check Script
# This script checks if all components are running correctly

set -e

echo "🏨 StayOS Health Check"
echo "======================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_GOOD=true

# Check 1: PostgreSQL
echo -n "Checking PostgreSQL... "
if sudo systemctl is-active --quiet postgresql 2>/dev/null || pg_isready &>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "   Fix: sudo systemctl start postgresql"
    ALL_GOOD=false
fi

# Check 2: Backend (port 8000)
echo -n "Checking Backend (port 8000)... "
if lsof -i :8000 &>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    
    # Test health endpoint
    if curl -s http://localhost:8000/health &>/dev/null; then
        echo "   └─ ${GREEN}Health endpoint OK${NC}"
    else
        echo "   └─ ${YELLOW}Health endpoint not responding${NC}"
    fi
else
    echo -e "${YELLOW}✗ Not running${NC}"
    echo "   Fix: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
    ALL_GOOD=false
fi

# Check 3: Frontend (port 3000)
echo -n "Checking Frontend (port 3000)... "
if lsof -i :3000 &>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    
    # Test if page loads
    if curl -s http://localhost:3000 &>/dev/null; then
        echo "   └─ ${GREEN}Page loads OK${NC}"
    else
        echo "   └─ ${YELLOW}Page not loading properly${NC}"
    fi
else
    echo -e "${YELLOW}✗ Not running${NC}"
    echo "   Fix: cd frontend && npm run dev"
    ALL_GOOD=false
fi

# Check 4: Python virtual environment
echo -n "Checking Python venv... "
if [ -f "backend/venv/bin/activate" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
    echo "   Fix: cd backend && python3 -m venv venv"
    ALL_GOOD=false
fi

# Check 5: Node modules
echo -n "Checking Node modules... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "   Fix: cd frontend && npm install"
    ALL_GOOD=false
fi

# Check 6: Environment files
echo -n "Checking backend/.env... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${YELLOW}⚠ Missing${NC}"
    echo "   Fix: cp backend/.env.example backend/.env"
fi

echo -n "Checking frontend/.env.local... "
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${YELLOW}⚠ Missing${NC}"
    echo "   Fix: cp frontend/.env.local.example frontend/.env.local"
fi

# Check 7: Database exists
echo -n "Checking database stayos_db... "
if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw stayos_db; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${YELLOW}⚠ Not found${NC}"
    echo "   Fix: createdb stayos_db"
fi

echo ""
echo "======================"

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Access the application:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
else
    echo -e "${RED}❌ Some checks failed!${NC}"
    echo ""
    echo "Follow the fixes above to resolve issues."
    echo ""
    echo "Quick start commands:"
    echo ""
    echo "1. Start PostgreSQL:"
    echo "   sudo systemctl start postgresql"
    echo ""
    echo "2. Start Backend:"
    echo "   cd backend"
    echo "   source venv/bin/activate"
    echo "   uvicorn app.main:app --reload"
    echo ""
    echo "3. Start Frontend (new terminal):"
    echo "   cd frontend"
    echo "   npm run dev"
fi

echo ""
