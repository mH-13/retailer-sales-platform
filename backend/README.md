# Retailer Sales Platform - Backend

> NestJS backend API for managing field sales operations across Bangladesh

## 🚀 Quick Start

### With Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, NestJS)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

The API will be available at **http://localhost:3000**

### Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with test data
npm run prisma:seed

# Start development server
npm run start:dev
```

## 📊 Database Management

### Prisma Studio (Visual Database Browser)

```bash
# Open Prisma Studio
npx prisma studio

# Opens at http://localhost:5555
```

### Common Prisma Commands

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database schema
npx prisma db pull

# Format schema file
npx prisma format
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Development Scripts

```bash
# Development mode (hot reload)
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build

# Production mode
npm run start:prod

# Linting
npm run lint

# Format code
npm run format
```

## 🗄️ Database Schema

### Key Tables

- **retailers** - 1M retailers with 9 strategic indexes
- **sales_reps** - Users (Admin + SRs) with authentication
- **sales_rep_retailers** - Assignment junction table
- **regions, areas, territories, distributors** - Reference data

### Test Data (from seed.ts)

- **210 retailers** (70 per SR)
- **4 users**:
  - `admin` / `password123` (ADMIN)
  - `karim_sr` / `password123` (SR)
  - `fatima_sr` / `password123` (SR)
  - `john_sr` / `password123` (SR)

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Version-controlled migrations
│   └── seed.ts                # Test data generator
│
├── src/
│   ├── auth/                  # ✅ JWT authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   │
│   ├── common/                # ✅ Shared utilities
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   │
│   ├── prisma/                # ✅ Database access layer
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── redis/                 # ✅ Caching layer
│   │   ├── redis.service.ts
│   │   └── redis.module.ts
│   │
│   ├── retailers/             # 🔄 In Progress
│   ├── admin/                 # ⏳ Planned
│   │
│   ├── app.module.ts          # Root module
│   └── main.ts                # Entry point
│
├── test/                      # Test files
├── docker-compose.yml         # Service orchestration
├── Dockerfile                 # Container configuration
└── .env                       # Environment variables
```

## 🌍 Environment Variables

Create `.env` file in backend folder:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/retailer_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
```

## 🐳 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching layer |
| NestJS | 3000 | API server |
| Prisma Studio | 5555 | Database GUI (manual start) |

## 📝 API Endpoints

### Authentication

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "karim_sr",
  "password": "password123"
}

# Response:
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": 2,
    "username": "karim_sr",
    "name": "Karim Ahmed",
    "role": "SR"
  }
}
```

### Protected Routes (Requires JWT)

```bash
# Add to headers:
Authorization: Bearer <your_jwt_token>
```

### Retailers (In Progress)
- `GET /retailers` - List assigned retailers (paginated, filtered)
- `GET /retailers/:uid` - Get retailer details
- `PATCH /retailers/:uid` - Update retailer (points, routes, notes)

### Admin (Planned)
- `GET/POST/PUT/DELETE /admin/regions` - CRUD regions
- `GET/POST/PUT/DELETE /admin/areas` - CRUD areas
- `GET/POST/PUT/DELETE /admin/distributors` - CRUD distributors
- `GET/POST/PUT/DELETE /admin/territories` - CRUD territories
- `POST /admin/assignments/bulk` - Bulk assign retailers to SRs
- `POST /admin/retailers/import` - CSV bulk import

## 🔐 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Password Hashing** - bcrypt with salt (10 rounds)
- **Role-Based Access Control** - Admin vs SR permissions
- **Input Validation** - DTOs with class-validator
- **SQL Injection Protection** - Prisma parameterized queries
- **Data Isolation** - SRs can only access assigned retailers

## 🚀 Performance Features

- **Redis Caching** - Cache-aside pattern for frequent queries
- **Database Indexing** - 9 strategic indexes on retailers table
- **Connection Pooling** - Prisma manages DB connections
- **N+1 Prevention** - Prisma includes for relation fetching
- **Offset Pagination** - Efficient data retrieval

## 📚 Learning Resources

For detailed explanations and learning materials, see the `docs/` folder (private, not in git):
- **LEARNING_GUIDE.md** - Complete walkthrough with Q&A
- **ENGINEERING_JOURNAL.md** - All technical decisions
- **NODEJS_NESTJS_GUIDE.md** - Learning path
- **DOCKER_GUIDE.md** - Docker understanding
- **QUICK_TIPS.md** - Productivity shortcuts

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Stop Docker containers
docker-compose down

# Or stop local PostgreSQL
sudo systemctl stop postgresql
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check connection
docker-compose exec postgres psql -U postgres -d retailer_db
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild Docker
docker-compose up --build
```

## 📞 Support

- NestJS Docs: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs
- Redis Docs: https://redis.io/docs

---

**Built with**: NestJS 11 + Prisma 6 + PostgreSQL 15 + Redis 7 + TypeScript 5
