# 🐾 PetPro Backend Microservices

Sistem microservices lengkap untuk platform pet care dengan Kafka communication, admin dashboard, dan manajemen inventory.

## 📋 Daftar Isi

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Service Details](#service-details)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Pastikan sudah terinstall di sistem:

- **Node.js** v18+ dan npm
- **Docker** v20+ dan Docker Compose
- **PostgreSQL** v14+ (opsional, bisa pakai Docker)
- **Git**

```bash
# Cek versi
node --version
npm --version
docker --version
docker-compose --version
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│  Admin Frontend │    │  User Frontend  │
│   (Port 3010)   │    │   (Port 8080)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Admin Gateway  │    │   API Gateway   │
│   (Port 3004)   │    │   (Port 3000)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │      Kafka      │
            │   (Port 9092)   │
            └─────────┬───────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│  Admin  │    │ Inventory│    │ Booking │
│ Service │    │ Service  │    │ Service │
│ (3005)  │    │ (3003)   │    │ (3002)  │
└─────────┘    └─────────┘    └─────────┘
    │                │                │
    ▼                ▼                ▼
┌─────────────────────────────────────────┐
│           PostgreSQL Database           │
│             (Port 5432)                 │
└─────────────────────────────────────────┘
```

### Services & Ports:

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| Admin Gateway | 3004 | - | Gateway untuk admin dashboard |
| Admin Service | 3005 | petpro_admin_dev | User management, analytics |
| API Gateway | 3000 | - | Main gateway untuk frontend |
| Auth Service | 3001 | petpro_auth_dev | Authentication & authorization |
| Booking Service | 3002 | petpro_booking_dev | Appointments & reservations |
| Inventory Service | 3003 | petpro_product_dev | Products & stock management |
| Vendor Service | 3006 | petpro_vendor_dev | Vendor management |

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd backend-microservices
```

### 2. Environment Setup

Copy environment template untuk semua services:

```bash
# Copy untuk setiap service
cp .env.example admin-service/.env
cp .env.example admin-gateway/.env
cp .env.example auth-service/.env
cp .env.example api-gateway/.env
cp .env.example booking-service/.env
cp .env.example inventory-service/.env
cp .env.example vendor-service/.env
```

Edit setiap `.env` file sesuai kebutuhan (sudah ada default values).

### 3. Start Infrastructure (Docker)

```bash
# Start PostgreSQL, Kafka, Redis
docker-compose up -d postgres kafka redis
```

### 4. Install Dependencies

```bash
# Install semua dependencies
npm run install:all

# Atau manual per service
cd admin-service && npm install
cd ../admin-gateway && npm install
cd ../auth-service && npm install
cd ../api-gateway && npm install
cd ../booking-service && npm install
cd ../inventory-service && npm install
cd ../vendor-service && npm install
```

### 5. Database Setup

```bash
# Run migrations
npm run db:migrate:all

# Seed initial data
npm run db:seed:all
```

### 6. Start All Services

```bash
# Option 1: Docker (Recommended)
docker-compose up

# Option 2: Manual development
npm run dev:all
```

### 7. Verify Installation

Buka di browser:

- **Admin Dashboard**: http://localhost:3004/api/admin/docs
- **API Gateway**: http://localhost:3000/api/docs
- **Kafka UI**: http://localhost:9000

## 🔨 Development Setup

### Development Mode (Individual Services)

```bash
# Terminal 1: Infrastructure
docker-compose up -d postgres kafka redis

# Terminal 2: Admin Service
cd admin-service
npm run start:dev

# Terminal 3: Admin Gateway
cd admin-gateway
npm run start:dev

# Terminal 4: Auth Service
cd auth-service
npm run start:dev

# Dan seterusnya...
```

### Package.json Scripts (Root)

Tambahkan di `package.json` root:

```json
{
  "scripts": {
    "install:all": "cd admin-service && npm install && cd ../admin-gateway && npm install && cd ../auth-service && npm install && cd ../api-gateway && npm install && cd ../booking-service && npm install && cd ../inventory-service && npm install && cd ../vendor-service && npm install",
    "dev:all": "concurrently \"cd admin-service && npm run start:dev\" \"cd admin-gateway && npm run start:dev\" \"cd auth-service && npm run start:dev\" \"cd api-gateway && npm run start:dev\" \"cd booking-service && npm run start:dev\" \"cd inventory-service && npm run start:dev\" \"cd vendor-service && npm run start:dev\"",
    "build:all": "cd admin-service && npm run build && cd ../admin-gateway && npm run build && cd ../auth-service && npm run build && cd ../api-gateway && npm run build && cd ../booking-service && npm run build && cd ../inventory-service && npm run build && cd ../vendor-service && npm run build",
    "db:migrate:all": "cd admin-service && npm run db:migrate && cd ../auth-service && npm run db:migrate && cd ../booking-service && npm run db:migrate",
    "db:seed:all": "cd admin-service && npm run db:seed && cd ../auth-service && npm run db:seed && cd ../booking-service && npm run db:seed && cd ../inventory-service && npm run seed"
  }
}
```

### Kafka Topics

Services akan otomatis create topics, tapi bisa manual:

```bash
# Masuk ke Kafka container
docker exec -it petpro-kafka bash

# Create topics
kafka-topics.sh --create --bootstrap-server localhost:9092 --topic admin-events
kafka-topics.sh --create --bootstrap-server localhost:9092 --topic inventory-events
kafka-topics.sh --create --bootstrap-server localhost:9092 --topic booking-events
```

## 🧪 Testing

### Health Checks

```bash
# Check semua services
curl http://localhost:3004/health  # Admin Gateway
curl http://localhost:3005/health  # Admin Service
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Booking Service
curl http://localhost:3003/health  # Inventory Service
curl http://localhost:3006/health  # Vendor Service
```

### API Testing

```bash
# Login admin
curl -X POST http://localhost:3004/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@petpro.com", "password": "admin123"}'

# Get products
curl http://localhost:3004/api/admin/inventory/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Default Credentials

**Admin Users** (seeder):
- Super Admin: `superadmin@petpro.com` / `admin123`
- Admin: `admin@petpro.com` / `admin123`
- Moderator: `moderator@petpro.com` / `admin123`

## 🐛 Troubleshooting

### Common Issues

**1. Port sudah digunakan**
```bash
# Check ports
netstat -tulpn | grep :3004
lsof -i :3004

# Kill process
kill -9 $(lsof -t -i:3004)
```

**2. Database connection error**
```bash
# Check PostgreSQL
docker logs petpro-postgres

# Connect manual
docker exec -it petpro-postgres psql -U postgres
```

**3. Kafka connection error**
```bash
# Check Kafka
docker logs petpro-kafka

# List topics
docker exec petpro-kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

**4. Service tidak start**
```bash
# Check logs
docker logs petpro-admin-service
docker logs petpro-admin-gateway

# Rebuild
docker-compose build admin-service
docker-compose up -d admin-service
```

### Reset Everything

```bash
# Stop semua
docker-compose down -v

# Remove volumes
docker volume prune

# Rebuild
docker-compose build --no-cache
docker-compose up
```

### Database Issues

```bash
# Reset databases
docker exec petpro-postgres psql -U postgres -c "DROP DATABASE IF EXISTS petpro_admin_dev;"
docker exec petpro-postgres psql -U postgres -c "CREATE DATABASE petpro_admin_dev;"

# Run migrations again
cd admin-service && npm run db:migrate
```

### Environment Variables

Pastikan semua `.env` files ada dan nilai-nilainya benar:

```bash
# Check admin service env
cat admin-service/.env

# Validate database connectivity
cd admin-service
node -e "console.log(require('./src/modules/database/database.module.js'))"
```

## 📚 API Documentation

Setelah services running, dokumentasi API tersedia di:

- **Admin API**: http://localhost:3004/api/admin/docs
- **Public API**: http://localhost:3000/api/docs
- **Auth API**: http://localhost:3001/api/docs
- **Booking API**: http://localhost:3002/api/docs
- **Inventory API**: http://localhost:3003/api/docs

## 🛠️ Development Tools

### VS Code Extensions (Recommended)

- **NestJS Files** - Code generator
- **REST Client** - API testing
- **Kafka** - Kafka topic management
- **Docker** - Container management
- **PostgreSQL** - Database management

### Useful Commands

```bash
# Generate NestJS components
npx @nestjs/cli generate module users
npx @nestjs/cli generate service users
npx @nestjs/cli generate controller users

# Docker commands
docker-compose logs -f admin-service
docker-compose restart admin-service
docker-compose build --no-cache admin-service

# Database commands
npm run db:migrate:undo
npm run db:seed:undo
npm run db:reset
```

## 🚀 Production Deployment

Untuk production, update environment variables:

```bash
NODE_ENV=production
JWT_SECRET=strong_production_secret
DB_PASSWORD=strong_production_password
KAFKA_BROKERS=production-kafka-cluster
```

Dan gunakan Docker production builds:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support

Jika ada masalah:

1. Check [Troubleshooting](#troubleshooting) section
2. Check service logs: `docker-compose logs service-name`
3. Verify environment variables
4. Create GitHub issue dengan log errors

**Happy Coding! 🐾**

The PetPro platform is built using a microservices architecture with the following components:

- **API Gateway**: Entry point for all client requests, handles routing, authentication, and request aggregation
- **Auth Service**: Manages user authentication, registration, and token management
- **User Service**: Handles user profile management and permissions
- **Booking Service**: Manages appointment scheduling and availability
- **Product Service**: Handles product catalog and inventory management
- **Order Service**: Processes customer orders and manages order lifecycle
- **Payment Service**: Handles payment processing and financial transactions
- **Notification Service**: Manages all notifications (email, SMS, push notifications)

## Technology Stack

- **Framework**: NestJS
- **ORM**: Sequelize with PostgreSQL
- **Message Broker**: Kafka for event-driven communication
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- PostgreSQL (or use the Docker container)
- Redis (or use the Docker container)
- Kafka (or use the Docker container)

### Installation & Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd pet-clinic/backend-microservices
```

2. **Start the infrastructure services**

```bash
docker-compose up -d postgres redis kafka kafdrop
```

3. **Install dependencies for each service**

```bash
cd api-gateway && npm install
cd ../auth-service && npm install
# Repeat for other services
```

4. **Setup environment variables**

Copy the example environment files:

```bash
cp auth-service/.env.example auth-service/.env.development
# Repeat for other services
```

5. **Run database migrations**

```bash
cd auth-service
npm run db:migrate
npm run db:seed
# Repeat for other services
```

6. **Start the services**

```bash
# Using Docker Compose (recommended for local development):
docker-compose up

# Or start services individually:
cd api-gateway && npm run start:dev
cd auth-service && npm run start:dev
# Repeat for other services
```

## API Documentation

Swagger documentation is available for each service:

- API Gateway: http://localhost:3000/api/docs
- Auth Service: http://localhost:3001/api/v1/docs
- User Service: http://localhost:3002/api/v1/docs
- etc.

## Development Workflow

1. Make changes to the required service
2. Run tests: `npm test`
3. If database schema changes are needed, create a migration:
   ```bash
   cd <service-directory>
   npx sequelize-cli migration:generate --name add-new-field
   ```
4. Update the migration file in the `src/database/migrations` directory
5. Run the migration: `npm run db:migrate`

## Event-Driven Communication

Services communicate asynchronously via Kafka topics. Each service publishes events that other services can consume.

Key events include:
- `user.created`: Published when a new user is created
- `user.login`: Published when a user logs in
- `booking.created`: Published when a new appointment is booked
- etc.

You can view Kafka topics and messages using Kafdrop at http://localhost:9000

## Deployment

Each service can be deployed independently. Docker images are built for each service, which can be deployed to Kubernetes or any container orchestration platform.

## Testing

- Unit Tests: `npm test`
- E2E Tests: `npm run test:e2e`
- Test Coverage: `npm run test:cov`

## License

[License information]
