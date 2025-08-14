# PetPro Backend API

This repository contains the backend API services for the PetPro platform, powering both web and mobile applications.

## Technology Stack

- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT
- **Testing**: Jest
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
backend/
├── src/
│   ├── config/         # Application configuration
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Data models
│   ├── repositories/   # Database access layer
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── validators/     # Request validation
│   └── index.ts        # Application entry point
├── prisma/             # Prisma schema and migrations
├── tests/              # Unit and integration tests
├── .env.example        # Example environment variables
├── .eslintrc.js        # ESLint configuration
├── jest.config.js      # Jest configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Redis 6+
- Docker and Docker Compose (for local development)

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/petpro.git
   cd petpro/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Initialize the database
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. The API will be available at http://localhost:3000

## Docker Development

You can also run the backend using Docker:

```bash
# From the root directory of the project
docker-compose up backend
```

## API Documentation

API documentation is automatically generated using Swagger. Once the server is running, you can access the documentation at:

```
http://localhost:3000/api/docs
```

## Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Generate test coverage report
npm run test:coverage
```

## Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Database Migrations

```bash
# Generate a new migration after schema changes
npm run db:migrate:generate

# Run pending migrations
npm run db:migrate

# Revert the last migration
npm run db:migrate:down
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the API server | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection URL | - |
| `REDIS_URL` | Redis connection URL | - |
| `JWT_SECRET` | Secret for JWT token signing | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. Code linting and formatting checks
2. Unit and integration tests
3. Code coverage reporting
4. Docker image building
5. Deployment to development, staging, and production environments

## Contributing

Please refer to the [Contributing Guide](../docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License.
