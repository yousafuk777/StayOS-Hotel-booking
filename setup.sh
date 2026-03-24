#!/bin/bash

# StayOS Setup Script
# This script helps you set up the complete StayOS platform

set -e

echo "🏨 Welcome to StayOS - Multi-Tenant SaaS Hotel Booking Platform"
echo "=============================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -n "Checking Python installation... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Found $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3.11+ not found${NC}"
    echo "Please install Python 3.11 or higher"
    exit 1
fi

# Check if Node.js is installed
echo -n "Checking Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Found $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js 18+ not found${NC}"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

# Check if PostgreSQL is running
echo -n "Checking PostgreSQL connection... "
if command -v psql &> /dev/null; then
    if psql -U postgres -c '\q' &> /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL is not accessible (will use default config)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL client not found (optional for setup)${NC}"
fi

# Check if Redis is available
echo -n "Checking Redis connection... "
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠ Redis is not running (will use default config)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Redis not found (optional for initial setup)${NC}"
fi

echo ""
echo "📦 Setting up Backend..."
echo "------------------------"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

cd ..

echo ""
echo "📦 Setting up Frontend..."
echo "-------------------------"

cd frontend

# Install Node dependencies
echo "Installing Node dependencies..."
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from template..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Next Steps:"
echo "-----------"
echo ""
echo "1. ${YELLOW}Configure Backend:${NC}"
echo "   - Edit backend/.env with your database credentials"
echo "   - Set APP_SECRET_KEY and JWT_SECRET_KEY"
echo "   - Configure Stripe and SendGrid keys (optional)"
echo ""
echo "2. ${YELLOW}Start Backend:${NC}"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "3. ${YELLOW}Start Frontend:${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. ${YELLOW}Access the Application:${NC}"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "📚 Documentation:"
echo "   - Main README: README.md"
echo "   - Backend Docs: backend/README.md"
echo "   - Frontend Docs: frontend/README.md"
echo "   - Full Specs: saas_hotel_docs/"
echo ""
echo "🎉 Happy coding with StayOS!"
echo ""
