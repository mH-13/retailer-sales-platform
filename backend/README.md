# Backend Development Guide

> Development setup and commands for the NestJS backend

## 🚀 Development Setup

### Docker Development (Recommended)

```bash
# Start services (from backend/ directory)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Local Development (Alternative)

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed test data
npm run prisma:seed

# Start dev server
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

## 🗄️ Development Database

### Seeded Test Data

- **210 retailers** (70 per SR)
- **4 test users** (all password: `password123`):
  - `admin` (ADMIN role)
  - `karim_sr`, `fatima_sr`, `john_sr` (SR roles)







## 🔗 Quick Access

- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555

### Test Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

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

---

**For complete project documentation, see the main README.md**
