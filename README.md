# Retailer Sales Platform

> Full-stack platform for Sales Representatives to manage their assigned retailers. Built with NestJS, PostgreSQL, Redis, React, and TypeScript.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Testing](#testing)
- [Scaling Strategy](#scaling-strategy)
- [Features](#features)

## Overview

Full-stack web platform enabling Sales Representatives (SRs) to manage their assigned retailers (~70 each) from a nationwide pool of 1 million retailers. Admins can perform bulk operations, CSV imports, and territory management.

**Backend**: NestJS 11, PostgreSQL 15, Prisma 6, Redis 7, Docker  
**Frontend**: React 19, TypeScript, Material-UI 7, TanStack Query, Zustand  
**Database**: 7 tables with strategic indexes on foreign keys and search fields  
**Caching**: Redis with 5-minute TTL for frequently accessed data  
**Testing**: 21 unit tests passing across 5 test suites

## Project Structure

```
retailer-sales-platform/
├── backend/          # NestJS API (see backend/README.md)
│   ├── src/          # Source code
│   ├── prisma/       # Database schema & migrations
│   └── test/         # Unit tests
├── frontend/         # React web app (see frontend/README.md)
│   ├── src/          # Source code
│   └── public/       # Static assets
└── docs/             # Documentation
```


## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### Setup Instructions

**1. Clone repository**
```bash
git clone <repository-url>
cd retailer-sales-platform
```

**2. Start backend** (see [backend/README.md](backend/README.md) for details)
```bash
cd backend
cp .env.example .env
docker-compose up -d
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

**3. Start frontend** (see [frontend/README.md](frontend/README.md) for details)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**4. Access**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api

### Backend Setup (Detailed)

**1. Navigate to backend**
```bash
cd backend
```

**2. Create environment file** (or copy from .env.example)
```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/retailer_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
EOF
```

**3. Start services**
```bash
docker-compose up -d
```

**4. Install dependencies**
```bash
npm install
```

**5. Run migrations and seed**
```bash
npx prisma migrate deploy
npx prisma db seed
```

**6. Start application**
```bash
npm run start:dev
```

**7. Verify backend is running**
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555

### Test Users

| Username | Password | Role | Assigned Retailers |
|----------|----------|------|-------------------|
| `admin` | `password123` | ADMIN | All (full access) |
| `karim_sr` | `password123` | SR | 70 retailers |
| `fatima_sr` | `password123` | SR | 70 retailers |
| `john_sr` | `password123` | SR | 70 retailers |


## Usage

### Swagger UI (Recommended)

1. Open http://localhost:3000/api
2. Login: **POST /auth/login** → `{"username": "admin", "password": "password123"}`
3. Copy `access_token` from response
4. Click **Authorize** (top right) → Paste token
5. Test all endpoints interactively

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Get Retailers:**
```bash
curl -X GET "http://localhost:3000/retailers?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Import CSV:**
```bash
curl -X POST http://localhost:3000/admin/retailers/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample-import.csv"
```


## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login & receive JWT token |

### Retailers (Sales Rep Endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/retailers` | List assigned retailers (paginated) | JWT |
| `GET` | `/retailers/:uid` | Get single retailer details | JWT |
| `PATCH` | `/retailers/:uid` | Update retailer (points, routes, notes) | JWT |

**Query Parameters for GET /retailers:**
- `page` (default: 1), `limit` (default: 20, max: 100)
- `search` - Search by name, phone, or UID
- `region`, `area`, `distributor`, `territory` - Filter by ID

### Admin - CRUD Operations (All require ADMIN role)
| Resource | Endpoints |
|----------|-----------|
| **Regions** | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` at `/admin/regions` |
| **Areas** | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` at `/admin/areas` |
| **Territories** | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` at `/admin/territories` |
| **Distributors** | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` at `/admin/distributors` |

### Admin - Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/assignments/bulk` | Bulk assign retailers to SRs |
| `POST` | `/admin/retailers/import` | Import retailers from CSV |


## Architecture

```
Mobile App / Web Client
         ↓
    NestJS API (Stateless)
         ↓
    ┌────┴────┐
PostgreSQL  Redis
(Primary)   (Cache)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | NestJS 11 | Enterprise TypeScript framework with DI |
| Database | PostgreSQL 15 | ACID compliance, 1M+ rows, complex queries |
| ORM | Prisma 6 | Type-safe database access, migrations |
| Cache | Redis 7 | In-memory caching (5-min TTL) |
| Auth | JWT | Stateless authentication (7-day expiry) |
| Validation | class-validator | DTO validation with decorators |
| API Docs | Swagger/OpenAPI | Interactive API documentation |
| Container | Docker | Reproducible environment |
| Testing | Jest | Unit testing framework |

### Database Design

**7 Tables:**
- `sales_reps` - Users (Admin, SR roles)
- `retailers` - 1M retailers with geographic data
- `regions`, `areas`, `territories`, `distributors` - Reference data
- `sales_rep_retailers` - Many-to-many assignment mapping

**Strategic Indexes:**
- Primary keys on all tables
- Foreign keys: `regionId`, `areaId`, `distributorId`, `territoryId`
- Search fields: `uid` (unique), `name`, `phone`
- Composite: `(salesRepId, retailerId)` for assignments

## Testing

```bash
# Run all tests (21 tests)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

**Coverage:**
- ✅ AuthService: Login scenarios, error handling (4 tests)
- ✅ AdminService: CRUD operations, duplicate prevention (5 tests)
- ✅ RetailersService: Authorization, caching (4 tests)
- ✅ RolesGuard: Role-based access control (5 tests)
- ✅ AppController: Health check (3 tests)

**Total: 21 tests across 5 suites** (all passing)


## Scaling Strategy

### What I Built & Why

I'm relatively new to backend development, so I focused on building something that works well and is easy to understand, rather than over-engineering. The current system handles ~15,000 Sales Reps managing 1 million retailers, which should work fine for the stated requirements.

**Some decisions I made while learning:**

**Pagination** - I went with offset pagination (`page` and `limit`). I read about cursor-based pagination which is supposedly faster for large datasets, but honestly, each SR only sees ~70 retailers (like 3-4 pages max). Offset pagination is way simpler to implement and understand. If we had thousands of pages, I'd reconsider.

**Caching** - I used manual `redis.get()` and `redis.set()` calls instead of fancy caching decorators. Yeah, it's more code, but I can actually SEE what's being cached and when. Made debugging much easier while learning. I set 5-minute TTL because that felt reasonable - data doesn't change that often.

**CSV Import** - I initially looked at PapaParse but ended up using the `csv-parser` library because it's simpler and does the job. For bulk inserts, I stuck with Prisma's `createMany()` wrapped in transactions. I know PostgreSQL's `COPY` command is much faster, but that requires raw SQL and I wanted to keep things consistent with Prisma. If we ever need to import 100K+ rows regularly, I'd switch to COPY.

**Database** - I used Prisma ORM throughout. Prisma prevents so many bugs (like SQL injection, typos, schema mismatches). Plus the auto-generated types are really helpful. I added indexes on all the foreign keys and the fields people search by (name, phone, uid).

### How This Could Scale

I tried to make choices that won't completely break if the system needs to grow:

**More users (10K → 100K concurrent):**
- The app is stateless (JWT tokens, no sessions), so we can just run multiple instances behind a load balancer
- Might need to add connection pooling (PgBouncer) so we don't run out of database connections
- Redis is already there for caching the most common queries

**More data (1M → 10M retailers):**
- The indexes I added should still work
- Might need to partition the retailers table by region if queries get slow
- Could switch to cursor-based pagination for admin views (the index structure supports it)

**Faster imports:**
- Current CSV import handles 10K rows in ~2 seconds, which is fine for now
- If we need to import 100K+ rows, I'd switch to PostgreSQL's COPY command (apparently 10-50x faster)
- Could also move it to a background job queue so it doesn't block the API

**Better reliability:**
- Add read replicas for PostgreSQL - most queries are reads anyway (SRs viewing retailers)
- Use Redis Cluster instead of single Redis instance
- Add monitoring to catch slow queries before they become problems

I saw there are fancier patterns (microservices, event sourcing, etc.) but for this assignment, I wanted to build something clean and functional that actually works, rather than something over-complicated that I don't fully understand. Everything I used here, I can explain and debug confidently.


## Features

### For Sales Representatives
- View assigned retailers with pagination (20 per page)
- Search by name, phone, or UID
- Filter by region, area, distributor, territory
- Update retailer information (points, routes, notes only)
- Responsive web interface with Material-UI

### For Admins
- CRUD operations for all reference data
- Bulk CSV import (handles 10K+ rows efficiently)
- Bulk retailer assignment to SRs (transaction-safe)
- Full system access and management

### Technical Highlights

**Backend:**
- JWT Authentication with role-based access control
- Redis caching with 5-minute TTL
- Database indexing on all foreign keys and search fields
- Data isolation - SRs only see assigned retailers
- Transaction-based bulk operations for consistency
- DTO validation on all inputs
- No N+1 queries - Prisma includes for relations
- Swagger documentation for easy API testing

**Frontend:**
- Modern React 19 with TypeScript
- Material-UI components for professional design
- TanStack Query for server state management
- Zustand for client state (auth)
- Protected routes with automatic redirects
- Optimistic UI updates with rollback on error
- Session persistence with localStorage

---

**Status**: Production Ready - Full-Stack Platform
