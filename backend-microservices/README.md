# PetPro Microservices

This repository contains the microservices implementation for the PetPro platform using NestJS and Sequelize.

## Architecture Overview

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
