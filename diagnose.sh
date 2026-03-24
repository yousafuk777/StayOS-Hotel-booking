#!/bin/bash

# Simple diagnostic script - no sudo required

echo "🔍 StayOS Diagnostic Check"
echo "=========================="
echo ""

# Check PostgreSQL
echo -n "PostgreSQL client available... "
if command -v psql &> /dev/null; then
    echo "✓ Yes"
else
    echo "✗ No (Install: sudo apt install postgresql-client)"
fi

# Check if ports are in use
echo -n "Port 8000 (Backend)... "
if lsof -i :8000 &>/dev/null; then
    echo "✓ In use (Backend running)"
else
    echo "✗ Not in use (Start backend)"
fi

echo -n "Port 3000 (Frontend)... "
if lsof -i :3000 &>/dev/null; then
    echo "✓ In use (Frontend running)"
else
    echo "✗ Not in use (Start frontend)"
fi

echo -n "Port 5432 (PostgreSQL)... "
if lsof -i :5432 &>/dev/null; then
    echo "✓ In use (PostgreSQL running)"
else
    echo "✗ Not in use (Start PostgreSQL)"
fi

# Check virtual environment
echo -n "Python venv exists... "
if [ -f "backend/venv/bin/activate" ]; then
    echo "✓ Yes"
else
    echo "✗ No (Run: cd backend && python3 -m venv venv)"
fi

# Check node modules
echo -n "Node modules installed... "
if [ -d "frontend/node_modules" ]; then
    echo "✓ Yes"
else
    echo "✗ No (Run: cd frontend && npm install)"
fi

# Check environment files
echo -n "backend/.env exists... "
if [ -f "backend/.env" ]; then
    echo "✓ Yes"
else
    echo "✗ No (Run: cp backend/.env.example backend/.env)"
fi

echo -n "frontend/.env.local exists... "
if [ -f "frontend/.env.local" ]; then
    echo "✓ Yes"
else
    echo "✗ No (Run: cp frontend/.env.local.example frontend/.env.local)"
fi

echo ""
echo "=========================="
echo ""

# Quick start commands
echo "To start the application:"
echo ""
echo "1. Start PostgreSQL (if not running):"
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
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
