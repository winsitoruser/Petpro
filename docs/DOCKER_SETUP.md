# PetPro Docker Setup

This document provides an overview of the Docker configuration for the PetPro application.

## Docker Architecture

The PetPro application is containerized using Docker for both development and production environments. The configuration consists of:

1. **Backend Services**: Node.js API server
2. **Frontend Services**: Web Vendor, Web Admin, and Mobile App
3. **Supporting Services**: PostgreSQL, Redis, MinIO (S3-compatible storage), and MailHog (email testing)

## Development Environment

### Setup

To start the development environment, run:

```bash
docker-compose up
```

For specific services, you can specify them:

```bash
docker-compose up backend postgres redis
```

### Key Features

- **Hot Reloading**: Code changes are reflected immediately via volume mounts
- **Debuggable**: Node.js debugging enabled on port 9229
- **Database Management**: PgAdmin included for database management (http://localhost:5050)
- **Email Testing**: MailHog interface available at http://localhost:8025
- **MinIO Browser**: S3-compatible storage interface at http://localhost:9001

### Environment Variables

Development environment variables are loaded from `.env` file. A sample `.env.example` file is provided in the root directory.

## Production Environment

The production environment uses the base docker-compose.yml with docker-compose.production.yml overrides.

### Deployment

To deploy to production:

```bash
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

### Key Features

- **Multi-stage Builds**: Optimized container sizes
- **Security Hardening**:
  - Non-root users inside containers
  - Security options like no-new-privileges
  - Improved PostgreSQL auth with scram-sha-256
- **Health Checks**: All services include health checks for robust orchestration
- **Resource Limits**: CPU and memory constraints to prevent resource abuse
- **Swarm Ready**: Includes placement constraints and update policies for Docker Swarm
- **Improved Reliability**: Automatic retries, failure actions, and restart policies

## Container Health Monitoring

All services include health checks that verify the service is operating correctly:

- **Backend**: HTTP request to `/health` endpoint
- **Web Services**: HTTP request to service health endpoint
- **PostgreSQL**: Uses `pg_isready` to verify database availability
- **Redis**: Simple PING command
- **MinIO**: HTTP request to MinIO health endpoint
- **MailHog**: HTTP request to web interface

## Data Persistence

The following volumes are used for data persistence:

- **postgres_data**: PostgreSQL database files
- **redis_data**: Redis persistence files
- **minio_data**: MinIO object storage
- **backend_node_modules**: Backend npm dependencies
- **backend_logs**: Backend log files

## Network Configuration

The application uses a custom bridge network named `petpro_network` for service-to-service communication.

## Initialization Scripts

- **PostgreSQL**: Scripts in `./docker-init/postgres/` run on first startup
- **MinIO**: Scripts in `./docker-init/minio/` create buckets and users
- **Redis**: Uses custom configuration from `./docker-config/redis/redis.conf`

## Docker Security Best Practices

This setup implements several Docker security best practices:

1. Using specific image versions instead of `latest`
2. Multi-stage builds to reduce attack surface
3. Non-root users inside containers
4. Volume permissions properly set
5. Security options like no-new-privileges
6. Resource limits to prevent DoS attacks
7. Health checks for improved reliability
8. Named volumes for better management

## Troubleshooting

### Service Dependencies

Services are configured with explicit healthcheck-based dependencies to ensure they start in the correct order.

### Logs

All service logs are available via:

```bash
docker-compose logs [service_name]
```

### Container Inspection

To inspect a running container:

```bash
docker-compose exec [service_name] sh
```
