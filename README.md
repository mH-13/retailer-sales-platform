# Retailer Sales Platform

> A scalable backend system for managing field sales operations across Bangladesh, serving 1M+ retailers through Sales Representatives.

## 📋 Overview

This backend API is built for a field sales application where Sales Representatives (SRs) manage their assigned retailers (~70 each) from a nationwide pool of 1 million retailers. Admins can perform bulk operations and territory management.

**Built with**: NestJS, PostgreSQL, Prisma, Redis, Docker

## 🚧 Development Status

**Current Phase**: Core implementation in progress

### ✅ Completed
- Docker environment setup (PostgreSQL, Redis)
- Database schema with strategic indexing for 1M retailers
- Database migrations and seed data (210 retailers, 4 test users)
- Prisma service module (database access layer)
- Redis caching module (cache-aside pattern)
- JWT authentication with role-based access control
- Guards and decorators for route protection

### 🔄 In Progress
- Retailers module (list, detail, update endpoints)
- Search and filtering capabilities
- Admin CRUD operations

### ⏳ Planned
- CSV bulk import functionality
- Swagger API documentation
- Unit and integration tests
- Performance optimizations

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running the Application

```bash
# Navigate to backend folder
cd backend

# Start all services (PostgreSQL, Redis)
docker-compose up -d

# The API will be available at:
# http://localhost:3000

# View database visually with Prisma Studio
npx prisma studio  # Opens at http://localhost:5555
```

### Test Users

| Username | Password | Role | Assigned Retailers |
|----------|----------|------|-------------------|
| `admin` | `password123` | ADMIN | All (management access) |
| `karim_sr` | `password123` | SR | 70 retailers |
| `fatima_sr` | `password123` | SR | 70 retailers |
| `john_sr` | `password123` | SR | 70 retailers |

## 🎯 Key Features (Design)

### For Sales Representatives
- View assigned retailers with pagination and filters
- Search by name, phone, or UID
- Update retailer information (points, routes, notes)
- Fast queries optimized for mobile networks

### For Admins
- CRUD operations for regions, areas, territories, distributors
- Bulk CSV import for large datasets
- Bulk retailer assignment to SRs
- Territory management

### Technical Highlights
- **Offset pagination** with cursor-based upgrade path
- **Redis caching** with manual invalidation strategy
- **9 strategic indexes** on retailers table for performance
- **Data isolation** ensures SRs only see their assignments
- **JWT authentication** with guards and role-based access

## 🏛️ Architecture

```
Mobile App / Web Client
         ↓
    NestJS API (Stateless)
         ↓
    ┌────┴────┐
PostgreSQL  Redis
(Primary DB) (Cache)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | NestJS | Enterprise TypeScript framework |
| Database | PostgreSQL 15 | ACID compliance, complex queries |
| ORM | Prisma | Type-safe database access |
| Cache | Redis 7 | In-memory caching |
| Auth | JWT | Stateless authentication |
| API Docs | Swagger | Auto-generated documentation |
| Container | Docker | Reproducible environment |

## 📈 Scaling Strategy

### Current Capacity
Designed to handle **~1,000 concurrent users** with current setup.

### Scaling to 100K Concurrent Users

**1. Application Layer**
- Horizontal scaling: Multiple NestJS instances behind load balancer
- Containerization ready: Docker makes deployment easy
- Stateless architecture: JWT auth enables any instance to handle requests

**2. Database Layer**
- Read replicas: 90% of traffic is SR read queries
- Connection pooling: Already configured via Prisma
- Partitioning: Shard retailers table by region if needed

**3. Caching Layer**
- Redis Cluster: High availability and distributed caching
- CDN: For static assets (if frontend added)
- Cache warming: Preload frequently accessed data

**4. Performance Optimizations**
- Cursor-based pagination: For deep pagination beyond page 1000
- PostgreSQL COPY: Bulk import 100K+ rows in seconds
- Background jobs: Use Bull queue for async operations (CSV import)

**5. Monitoring & Reliability**
- APM tools: Track slow queries and bottlenecks
- Rate limiting: Prevent abuse (100 req/min per user)
- Circuit breakers: Graceful degradation if services fail

## 🧪 Testing

```bash
cd backend

# Unit tests (coming soon)
npm run test

# E2E tests (coming soon)
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `POST` | `/auth/login` | Login & receive JWT token | ✅ Implemented |

### Retailers (In Progress)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/retailers` | List assigned retailers | 🔄 In Progress |
| `GET` | `/retailers/:uid` | Get retailer details | 🔄 In Progress |
| `PATCH` | `/retailers/:uid` | Update retailer | 🔄 In Progress |

### Admin (Planned)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET/POST/PUT/DELETE` | `/admin/regions` | CRUD regions | ⏳ Planned |
| `GET/POST/PUT/DELETE` | `/admin/areas` | CRUD areas | ⏳ Planned |
| `GET/POST/PUT/DELETE` | `/admin/distributors` | CRUD distributors | ⏳ Planned |
| `GET/POST/PUT/DELETE` | `/admin/territories` | CRUD territories | ⏳ Planned |
| `POST` | `/admin/assignments/bulk` | Bulk assign retailers | ⏳ Planned |
| `POST` | `/admin/retailers/import` | CSV import | ⏳ Planned |

## 🏗️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (1M retailers)
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Test data (210 retailers)
│
├── src/
│   ├── auth/                  # ✅ JWT authentication
│   ├── common/                # ✅ Guards, decorators
│   ├── prisma/                # ✅ Database service
│   ├── redis/                 # ✅ Caching service
│   ├── retailers/             # 🔄 In progress
│   └── admin/                 # ⏳ Planned
│
├── docker-compose.yml         # PostgreSQL + Redis
└── Dockerfile                 # NestJS container
```

## 🤝 Contributing

This is a take-home assignment project. Not accepting external contributions.

---

**Status**: 🚧 In Development (Core modules complete, features in progress)
**Tech Stack**: NestJS + PostgreSQL + Prisma + Redis + Docker + TypeScript
