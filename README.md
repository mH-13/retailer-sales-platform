# Retailer Sales Platform

> A scalable backend system for managing field sales operations across Bangladesh, serving 1M+ retailers through Sales Representatives.

## 📋 Overview

This is a production-ready backend API built for a field sales application. It enables Sales Representatives (SRs) to efficiently manage their assigned retailers (~70 each) from a nationwide pool of 1 million retailers, while admins can perform bulk operations and territory management.

**Built with**: NestJS, PostgreSQL, Prisma, Redis, Docker

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running the Application

```bash
# Navigate to backend folder
cd backend

# Start all services (PostgreSQL, Redis, NestJS)
docker-compose up

# The API will be available at:
# http://localhost:3000
# Swagger docs: http://localhost:3000/api
```

That's it! Docker handles everything - database setup, migrations, and seeding.

## 🎯 Key Features

### For Sales Representatives
- View assigned retailers (paginated, filtered, searched)
- Update retailer information (points, routes, notes)
- Fast queries (<200ms) optimized for mobile networks

### For Admins
- CRUD operations for regions, areas, territories, distributors
- Bulk CSV import (handles 100K+ rows efficiently)
- Bulk retailer assignment to SRs

### Technical Highlights
- **Cursor-based pagination** for consistent performance at scale
- **Redis caching** with intelligent invalidation
- **PostgreSQL** with optimized indexes
- **Row-level security** ensures strict data isolation
- **JWT authentication** with role-based access control

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

Current architecture supports ~1,000 concurrent users. To scale to 100K:

1. **Horizontal scaling** - Deploy multiple NestJS instances behind load balancer
2. **Database replicas** - Read replicas for SR queries (90% of traffic)
3. **Redis cluster** - High-availability caching
4. **Connection pooling** - Limit DB connections per instance

See [backend/README.md](backend/README.md) for detailed implementation and API documentation.

## 🧪 Testing

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3000/api
- **OpenAPI JSON**: http://localhost:3000/api-json

---

**Status**: ✅ In Development
**Tech Stack**: NestJS + PostgreSQL + Prisma + Redis + Docker
