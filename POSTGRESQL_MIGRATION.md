# 🐘 PostgreSQL Migration Guide

This guide covers the migration from MySQL to PostgreSQL for the StayOS platform.

## ✅ What Changed

### Dependencies
- **Removed**: `aiomysql==0.2.0`
- **Added**: `asyncpg==0.29.0`

### System Libraries (Dockerfile)
- **Removed**: `default-libmysqlclient-dev`
- **Added**: `libpq-dev`

### Database URL Format
```bash
# Old (MySQL)
DATABASE_URL=mysql+aiomysql://user:pass@localhost:3306/stayos_db

# New (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/stayos_db
```

### Connection Settings
- Added `pool_pre_ping=True` for connection health checks
- Default port changed from 3306 to 5432

## 📋 Prerequisites

Install PostgreSQL 14 or higher:

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib libpq-dev
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Docker
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stayos_db \
  -p 5432:5432 \
  postgres:14
```

## 🚀 Setup Instructions

### 1. Create Database

```bash
# Method 1: Using createdb
createdb stayos_db

# Method 2: Using psql
psql -U postgres -c "CREATE DATABASE stayos_db;"

# Method 3: With specific user
psql -U postgres -c "CREATE USER stayos WITH PASSWORD 'stayos_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE stayos_db TO stayos;"
```

### 2. Update Environment

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/stayos_db
```

### 3. Install New Dependencies

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Verify Connection

```bash
# Test PostgreSQL connection
psql -U postgres -d stayos_db -c "\conninfo"

# Test from Python
python -c "from app.core.database import engine; print('Connection successful!')"
```

## 🔧 Configuration Differences

### Data Type Mappings

| MySQL | PostgreSQL | Notes |
|-------|-----------|-------|
| INT AUTO_INCREMENT | SERIAL or INTEGER GENERATED ALWAYS AS IDENTITY | Auto-increment primary keys |
| TINYINT(1) | BOOLEAN | Boolean values |
| DATETIME | TIMESTAMP | Date and time |
| TEXT | TEXT | Long text (no length limit) |
| VARCHAR(n) | VARCHAR(n) | String with length limit |
| DECIMAL(p,s) | NUMERIC(p,s) | Precise decimal numbers |
| ENUM | ENUM | Requires custom type creation |

### SQLAlchemy Model Adjustments

The existing models work as-is with PostgreSQL. However, for new models:

```python
# MySQL style (works but not optimal for PostgreSQL)
id = Column(Integer, primary_key=True, autoincrement=True)

# PostgreSQL style (recommended)
id = Column(Integer, primary_key=True, autoincrement=True)
# or
id = Column(Integer, Identity(always=False), primary_key=True)
```

### Enum Types in PostgreSQL

PostgreSQL requires explicit ENUM type creation:

```python
# In your model
from sqlalchemy import Enum

class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    hotel_admin = "hotel_admin"
    # ... other roles

# PostgreSQL will auto-create ENUM types on first migration
```

## 🗄️ Database Schema Creation

### Development (Auto-Created)

In development mode, tables are created automatically on startup:

```python
# app/main.py
@app.on_event("startup")
async def startup_db_client():
    if settings.APP_DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
```

### Production (Using Alembic)

1. **Initialize Alembic** (if not already done):
```bash
cd backend
alembic init alembic
```

2. **Configure alembic.ini**:
```ini
[alembic]
script_location = alembic

[post_write_hooks]

# Logging configuration
[loggers]
keys = root,sqlalchemy,alembic
```

3. **Set up env.py** (in alembic directory):
```python
from app.models import Base
target_metadata = Base.metadata
```

4. **Create initial migration**:
```bash
alembic revision --autogenerate -m "Initial migration"
```

5. **Apply migration**:
```bash
alembic upgrade head
```

## 🔄 Migration from Existing MySQL Data

If you have existing MySQL data to migrate:

### 1. Export MySQL Data

```bash
mysqldump -u root -p stayos_db > mysql_dump.sql
```

### 2. Convert Schema

Use tools like `pgloader` for automated migration:

```bash
# Install pgloader
sudo apt install pgloader

# Migrate database
pgloader mysql://user:pass@localhost/stayos_db \
         postgresql://user:pass@localhost/stayos_db
```

### 3. Manual Migration

For manual migration:

1. Export data as CSV from MySQL
2. Transform data types as needed
3. Import into PostgreSQL using `COPY` command

```sql
-- Example: Import users table
COPY users(id, email, first_name, last_name, role)
FROM '/path/to/users.csv'
DELIMITER ','
CSV HEADER;
```

## ⚙️ Performance Tuning

### PostgreSQL Configuration

Edit `postgresql.conf`:

```conf
# Memory Settings
shared_buffers = 256MB          # 25% of RAM
effective_cache_size = 1GB      # 50-75% of RAM
work_mem = 16MB                 # Per-operation memory
maintenance_work_mem = 128MB    # For VACUUM, CREATE INDEX

# Connection Settings
max_connections = 100
listen_addresses = '*'

# Write Ahead Log
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64MB

# Query Planning
random_page_cost = 1.1          # Lower for SSD
effective_io_concurrency = 200  # For SSD
```

### Indexing Strategy

PostgreSQL offers advanced indexing:

```sql
-- B-Tree (default, good for most cases)
CREATE INDEX idx_users_email ON users(email);

-- GIN (for JSONB columns)
CREATE INDEX idx_tenant_settings ON tenant_settings USING GIN(config);

-- Partial Index (for filtered queries)
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- Expression Index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

## 🔍 Troubleshooting

### Connection Issues

**Error: FATAL: password authentication failed**
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change authentication method
# local   all             all                                     peer
local   all             all                                     md5
```

**Error: could not connect to server: Connection refused**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if needed
sudo systemctl start postgresql
```

### Common SQL Differences

**MySQL:**
```sql
SELECT * FROM users LIMIT 0, 10;
SHOW TABLES;
DESCRIBE users;
```

**PostgreSQL:**
```sql
SELECT * FROM users LIMIT 10 OFFSET 0;
\dt                    -- Show tables
\d users               -- Describe table
```

### SQLAlchemy Specific Issues

**Issue: ENUM types not created**

Solution: Create ENUM types explicitly in migration:

```python
# alembic migration
op.execute("CREATE TYPE userrole AS ENUM ('super_admin', 'hotel_admin', 'guest')")
```

**Issue: Auto-increment not working**

Ensure column uses SERIAL or IDENTITY:

```python
# Option 1: SERIAL (PostgreSQL specific)
id = Column(SERIAL, primary_key=True)

# Option 2: Standard SQL IDENTITY
id = Column(Integer, Identity(always=False), primary_key=True)
```

## 📊 Monitoring & Maintenance

### Useful Queries

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('stayos_db'));

-- Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries (requires pg_stat_statements extension)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Regular Maintenance

```bash
# Vacuum analyze (update statistics)
vacuumdb -U postgres -d stayos_db --analyze

# Full vacuum (reclaim storage)
vacuumdb -U postgres -d stayos_db --full --verbose

# Reindex database
reindexdb -U postgres -d stayos_db --verbose
```

## 🎯 Testing

### Run Tests with PostgreSQL

```bash
# Set test database
export TEST_DATABASE_URL=postgresql+asyncpg://postgres:pass@localhost:5432/stayos_test

# Run pytest
pytest
```

### Verify Functionality

1. ✅ User registration and login
2. ✅ Tenant creation and resolution
3. ✅ CRUD operations on all models
4. ✅ Transaction handling
5. ✅ Concurrent access
6. ✅ Index performance

## 📝 Summary

The migration from MySQL to PostgreSQL involves:

1. ✅ Updating dependencies (`asyncpg` instead of `aiomysql`)
2. ✅ Changing DATABASE_URL format
3. ✅ Installing PostgreSQL system libraries
4. ✅ Creating PostgreSQL database
5. ✅ Running migrations

All existing models and business logic remain unchanged. PostgreSQL provides better support for:

- JSONB data types
- Advanced indexing (GIN, GiST)
- Full-text search
- Window functions
- Common Table Expressions (CTEs)
- Array data types

---

**Need Help?**

- PostgreSQL Docs: https://www.postgresql.org/docs/
- SQLAlchemy PostgreSQL: https://docs.sqlalchemy.org/en/20/dialects/postgresql.html
- AsyncPG Docs: https://magicstack.github.io/asyncpg/current/
