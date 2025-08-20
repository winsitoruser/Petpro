# 🚀 PetPro Backend Microservices - Development Guide

Panduan lengkap untuk setup awal, development, dan menjalankan PetPro backend microservices dengan arsitektur sederhana dan **Redis** sebagai cache & message broker.

## 📋 Daftar Isi

1. [Setup Awal untuk Pemula](#1-setup-awal-untuk-pemula)
2. [Arsitektur Sistem Baru](#2-arsitektur-sistem-baru)
3. [Menjalankan Semua Services](#3-menjalankan-semua-services)
4. [Docker Setup](#4-docker-setup)
5. [Testing & Debugging](#5-testing--debugging)
6. [Production Deployment](#6-production-deployment)

---

## 1. Setup Awal untuk Pemula

### Prasyarat

Pastikan sudah terinstall:
- **Node.js** v18+ dan npm
- **Docker** dan Docker Compose  
- **Git**
- **PostgreSQL** (opsional, bisa pakai Docker)

### Step 1: Clone & Install

```bash
# 1. Clone repository
git clone <your-repo-url>
cd backend-microservices

# 2. Install dependencies untuk semua services
npm run install:all

# 3. Setup environment files
cp .env.example .env
cp auth-service/.env.development auth-service/.env
cp booking-service/.env.development booking-service/.env
cp admin-service/.env.development admin-service/.env
```

### Step 2: Setup Database & Redis

```bash
# 1. Start infrastructure services
docker compose up -d postgres redis

# 2. Wait for services to be ready
sleep 10

# 3. Run database migrations
npm run db:migrate:all

# 4. Seed initial data
npm run db:seed:all

# 5. Verify database setup
npm run db:check
```

### Step 3: Start All Services

```bash
# Option 1: Development mode (recommended)
npm run dev:all

# Option 2: Docker mode
docker compose up

# Option 3: Manual mode (untuk debugging)
# Terminal 1: Redis & Postgres
docker compose up -d postgres redis

# Terminal 2: Auth Service
cd auth-service && npm run start:dev

# Terminal 3: Booking Service  
cd booking-service && npm run start:dev

# Terminal 4: API Gateway
cd api-gateway && npm run start:dev

# Terminal 5: Admin Gateway
cd admin-gateway && npm run start:dev

# Terminal 6: Admin Service
cd admin-service && npm run start:dev

# Terminal 7: Inventory Service
cd inventory-service && npm run start:dev
```

### Step 4: Verify Setup

```bash
# Check all services health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Booking Service
curl http://localhost:3003/health  # Inventory Service
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3004/health  # Admin Gateway
curl http://localhost:3005/health  # Admin Service

# Check API documentation
open http://localhost:3000/api/docs   # API Gateway
open http://localhost:3004/api/docs   # Admin Gateway
open http://localhost:3001/api/v1/docs  # Auth Service (direct)
```

---

## 2. Arsitektur Sistem Baru

### Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│   API Gateway    │───▶│  Auth Service   │
│  (Mobile/Web)   │    │   (Port 3000)    │    │  (Port 3001)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
┌─────────────────┐    ┌──────────────────┐             ▼
│   Admin Panel   │───▶│  Admin Gateway   │    ┌─────────────────┐
│     (Web)       │    │   (Port 3004)    │    │ Booking Service │
└─────────────────┘    └──────────────────┘    │  (Port 3002)    │
                                │               └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Admin Service  │    │Inventory Service│
                       │   (Port 3005)   │    │  (Port 3003)    │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Redis (Optional)│    │   PostgreSQL    │
                       │  (Port 6379)    │    │  (Port 5432)    │
                       └─────────────────┘    └─────────────────┘
```

### Arsitektur Sederhana

1. **API Gateway** - Customer APIs (login, booking, vendors)
2. **Admin Gateway** - Admin management APIs  
3. **Direct Service Communication** - HTTP langsung antar service
4. **Redis (Optional)** - Cache, sessions, pub/sub events
5. **PostgreSQL** - Primary database untuk semua data

### Service Communication Flow

```
Client Request → Gateway → Direct HTTP Call → Target Service
                    ↓              ↓                    ↓
               (Optional)     Route Request →   Process Request
              Cache Check           ↓                    ↓
                    ↓        Service Response ←  Send Response
              Cache Response
```

### ✅ Keuntungan Arsitektur Baru:

- **Tidak Ada Single Point of Failure** - Jika Redis down, services tetap bisa jalan  
- **Development Lebih Mudah** - Langsung hit service URL, tidak perlu routing complex  
- **Performance Lebih Baik** - Tidak ada overhead service discovery  
- **Debugging Gampang** - Error langsung dari service, tidak lewat layer tambahan  
- **Independent Services** - Setiap service bisa jalan sendiri  

---

## 3. Menjalankan Semua Services

### Services & Ports

| Service | Port | Description | Role |
|---------|------|-------------|------|
| API Gateway | 3000 | Customer-facing APIs | Routes to services |
| Auth Service | 3001 | Authentication & Users | Direct access |
| Booking Service | 3002 | Booking & Appointments | Direct access |
| Inventory Service | 3003 | Products & Stock | Direct access |
| Admin Gateway | 3004 | Admin Dashboard APIs | Routes to admin service |
| Admin Service | 3005 | Admin Management | Direct access |
| Redis | 6379 | Cache & Message Broker | Internal |
| PostgreSQL | 5432 | Primary Database | Internal |

### Environment Variables

```bash
# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Database Configuration  
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Service URLs (for inter-service communication)
AUTH_SERVICE_URL=http://localhost:3001
BOOKING_SERVICE_URL=http://localhost:3002
INVENTORY_SERVICE_URL=http://localhost:3003
ADMIN_SERVICE_URL=http://localhost:3005

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Service Configuration
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
```

### Development Commands

```bash
# Development
npm run dev:all              # Start all services in dev mode
npm run dev:gateway          # Start only gateways
npm run dev:auth             # Start only auth service
npm run dev:booking          # Start only booking service

# Production  
npm run build:all            # Build all services
npm run start:prod:all       # Start all in production mode

# Database
npm run db:migrate:all       # Run all migrations
npm run db:seed:all          # Seed all databases
npm run db:reset:all         # Reset all databases

# Testing
npm run test:all             # Run all tests
npm run test:e2e             # Run end-to-end tests
npm run health:check         # Check all services health
```

---

## 4. Docker Setup

### Docker Compose Structure

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Infrastructure
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_MULTIPLE_DATABASES: "petpro_auth_dev,petpro_booking_dev,petpro_product_dev,petpro_admin_dev"
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker-config/postgres:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  # Gateways
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - AUTH_SERVICE_URL=http://auth-service:3001
      - BOOKING_SERVICE_URL=http://booking-service:3002
      - INVENTORY_SERVICE_URL=http://inventory-service:3003
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis

  admin-gateway:
    build: ./admin-gateway
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - PORT=3004
      - ADMIN_SERVICE_URL=http://admin-service:3005
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - admin-service
      - redis

  # Core Services
  auth-service:
    build: ./auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=petpro_auth_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis

  booking-service:
    build: ./booking-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - PORT=3002
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=petpro_booking_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis

  inventory-service:
    build: ./inventory-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - PORT=3003
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=petpro_product_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis

  admin-service:
    build: ./admin-service
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=development
      - PORT=3005
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=petpro_admin_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres-data:
  redis-data:

networks:
  petpro-network:
    driver: bridge
```

### Starting Services

```bash
# Start infrastructure only
docker compose up -d postgres redis

# Start all services
docker compose up

# Start specific services
docker compose up api-gateway auth-service

# View logs
docker compose logs -f api-gateway
docker compose logs auth-service

# Stop all services
docker compose down

# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

---

## 5. Testing & Debugging

### API Testing

```bash
# Test API Gateway endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Admin Gateway endpoints
curl -X GET http://localhost:3004/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Test direct service access
curl http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Redis Monitoring

```bash
# Check Redis connectivity
redis-cli ping

# Monitor Redis operations
redis-cli monitor

# Check cached data
redis-cli keys "*"
redis-cli get "cache:users:123"

# Monitor pub/sub
redis-cli subscribe "user.*"
redis-cli subscribe "booking.*"
```

### Service Health Checks

```bash
# Health check script
#!/bin/bash
services=("3001" "3002" "3003" "3000" "3004" "3005")
for port in "${services[@]}"; do
  if curl -f http://localhost:$port/health > /dev/null 2>&1; then
    echo "✅ Service on port $port is healthy"
  else
    echo "❌ Service on port $port is down"
  fi
done
```

### Debugging Tips

1. **Service tidak start**: Check port conflicts dengan `lsof -i :3000`
2. **Database connection failed**: Verify PostgreSQL is running `docker ps`
3. **Redis connection failed**: Check Redis status `redis-cli ping`
4. **JWT token invalid**: Verify JWT_SECRET consistency across services
5. **CORS errors**: Check CORS_ORIGIN environment variables

---

## 6. Production Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
LOG_LEVEL=warn

# Database (managed service recommended)
DB_HOST=your-postgres-host.com
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Redis (managed service recommended)  
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=strong_production_password
REDIS_TLS=true

# Security
JWT_SECRET=super_strong_production_secret_minimum_32_characters
CORS_ORIGIN=https://your-domain.com,https://admin.your-domain.com

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000
```

### Production Docker Build

```dockerfile
# Dockerfile for each service
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN npm run build

EXPOSE 3000
USER node

CMD ["npm", "run", "start:prod"]
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DB_HOST=${DB_HOST}
      - REDIS_HOST=${REDIS_HOST}
    restart: unless-stopped
    
  # ... other services with production configs

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api-gateway
      - admin-gateway
    restart: unless-stopped
```

### Nginx Configuration

```nginx
# nginx.conf
upstream api_gateway {
    server api-gateway:3000;
}

upstream admin_gateway {
    server admin-gateway:3004;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Customer API
    location /api/ {
        proxy_pass http://api_gateway/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Admin API
    location /api/ {
        proxy_pass http://admin_gateway/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Health Monitoring

```bash
# Health check endpoint for load balancer
curl https://your-domain.com/health
curl https://admin.your-domain.com/health

# Prometheus metrics (if implemented)
curl https://your-domain.com/metrics

# Log aggregation (recommended: ELK stack or similar)
docker logs api-gateway | jq '.'
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find and kill process using port
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   docker logs petpro-postgres
   
   # Test connection
   psql -h localhost -U postgres -d petpro_auth_dev
   ```

3. **Redis Connection Failed**
   ```bash
   # Check Redis status
   docker logs petpro-redis
   redis-cli ping
   
   # Restart Redis
   docker compose restart redis
   ```

4. **Gateway Timeout**
   ```bash
   # Check target service health
   curl http://localhost:3001/health
   
   # Check service logs
   docker logs auth-service
   ```

### Performance Monitoring

```bash
# Monitor Docker containers
docker stats

# Monitor Node.js services
curl http://localhost:3000/metrics

# Monitor database performance
SELECT * FROM pg_stat_activity;
```

---

## 🚀 Quick Start Commands

```bash
# Complete setup (first time)
git clone <repo>
cd backend-microservices
npm run install:all
docker compose up -d postgres redis
npm run db:migrate:all
npm run dev:all

# Daily development
docker compose up -d postgres redis  # Start infrastructure
npm run dev:all                      # Start all services

# Testing
curl http://localhost:3000/api/auth/login -d '{"email":"test@example.com","password":"password123"}' -H "Content-Type: application/json"

# Production deployment
docker compose -f docker-compose.prod.yml up -d
```

**Happy Development! 🎉**

Dokumentasi ini memberikan panduan lengkap untuk PetPro backend microservices dengan arsitektur yang simple, reliable, dan mudah di-maintain.