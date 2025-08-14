# Docker Environment Setup

This document provides detailed instructions for setting up and using the Docker-based development environment for the PetPro project.

## Prerequisites

- Docker (20.10.x or higher)
- Docker Compose (v2.x or higher)
- Git
- Bash shell (for Mac/Linux) or Git Bash/WSL (for Windows)

## Environment Configuration

The project uses a multi-environment setup with separate configurations for development, staging, and production environments. The configurations are stored in the following files:

- `.env.development`: Development environment configuration
- `.env.staging`: Staging environment configuration
- `.env.production`: Production environment configuration

These files contain environment-specific variables that configure services in the Docker Compose setup.

## Available Services

The Docker Compose setup includes the following services:

| Service | Description | Port |
|---------|-------------|------|
| backend | Node.js/Express backend API | 8080 |
| web-vendor | Vendor web portal (Next.js) | 3000 |
| web-admin | Admin web portal (React) | 3001 |
| postgres | PostgreSQL database | 5432 |
| redis | Redis cache and session store | 6379 |
| minio | S3-compatible object storage | 9000, 9001 (UI) |
| mailhog | Email testing service | 1025 (SMTP), 8025 (UI) |

## Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/petpro.git
   cd petpro
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env.development
   ```

3. Edit the development environment file if needed:
   ```bash
   # Open with your editor
   vim .env.development
   ```

4. Switch to the development environment:
   ```bash
   ./env.sh development
   ```

5. Start the Docker services:
   ```bash
   docker-compose up -d
   ```

6. Verify that all services are running:
   ```bash
   docker-compose ps
   ```

## Switching Environments

The project includes a utility script (`env.sh`) to easily switch between environments:

```bash
# Switch to development environment
./env.sh development

# Switch to staging environment
./env.sh staging

# Switch to production environment
./env.sh production
```

The script will:
1. Validate the requested environment
2. Create a symbolic link from the environment-specific file to `.env`
3. Offer to restart Docker services with the new environment

## Service URLs

After starting the Docker services, you can access them at the following URLs:

- Backend API: http://localhost:8080
- Web Vendor Portal: http://localhost:3000
- Web Admin Portal: http://localhost:3001
- MinIO Console: http://localhost:9001 (login with the S3 credentials in your .env file)
- MailHog UI: http://localhost:8025 (for viewing test emails)

## Database Management

### Connecting to PostgreSQL

You can connect to the PostgreSQL database using the following connection details:

- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `petpro_development` (or `petpro_staging`/`petpro_production` based on environment)

Example using `psql`:
```bash
psql -h localhost -U postgres -d petpro_development
```

### Running Migrations

Migrations should be run through the backend service:

```bash
docker-compose exec backend npm run db:migrate
```

### Seeding Data

To seed the database with initial data:

```bash
docker-compose exec backend npm run db:seed
```

## File Storage with MinIO

The environment uses MinIO as an S3-compatible object storage service. You can access the MinIO console at http://localhost:9001.

Default credentials (for development):
- Access Key: `minio-access-key`
- Secret Key: `minio-secret-key`

The S3 endpoint URL for services is: http://minio:9000

## Email Testing with MailHog

All emails sent by the application in non-production environments are captured by MailHog. You can view these emails in the MailHog UI at http://localhost:8025.

## Common Commands

### Starting the Environment

```bash
docker-compose up -d
```

### Stopping the Environment

```bash
docker-compose down
```

### Viewing Service Logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuilding Services

If you make changes to a Dockerfile or service configuration:

```bash
docker-compose build
# or to rebuild and restart a specific service
docker-compose up -d --build backend
```

### Executing Commands in Services

```bash
# Run a command in the backend service
docker-compose exec backend npm install new-package

# Open a shell in the backend service
docker-compose exec backend sh
```

## Troubleshooting

### Service Won't Start

Check the service logs:
```bash
docker-compose logs [service-name]
```

### Database Connection Issues

Ensure the database service is running:
```bash
docker-compose ps postgres
```

Check if the database has been initialized correctly:
```bash
docker-compose exec postgres psql -U postgres -c "\l"
```

### Port Conflicts

If a service fails to start due to a port conflict, you can modify the port mapping in your `.env` file.

For example, to change the API port from 8080 to 9090:
```
API_PORT=9090
```

## Environment Variables Reference

Here are the key environment variables you may need to configure:

### General
- `NODE_ENV`: Environment name (development, staging, production)
- `API_PORT`: Port for the backend API
- `API_URL`: External URL for the API
- `CORS_ORIGIN`: Allowed origins for CORS

### Database
- `DATABASE_URL`: PostgreSQL connection URL
- `DATABASE_SSL`: Whether to use SSL for database connection

### Authentication
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: JWT expiration time
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration time

### Storage
- `S3_ENDPOINT`: MinIO/S3 endpoint URL
- `S3_ACCESS_KEY`: MinIO/S3 access key
- `S3_SECRET_KEY`: MinIO/S3 secret key
- `S3_BUCKET`: MinIO/S3 bucket name

### Email
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP server username
- `SMTP_PASS`: SMTP server password
- `EMAIL_FROM`: Default sender email address

For a complete list of environment variables, refer to the `.env.example` file.
