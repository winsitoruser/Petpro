# PostgreSQL Database Setup for PetPro

This document describes the PostgreSQL database setup, configuration, and best practices for the PetPro application.

## Overview

PetPro uses a PostgreSQL database as the primary data store with the following key features:

- Robust RDBMS with ACID compliance
- Optimized performance configuration
- Connection pooling with PgBouncer
- Role-based access control
- Automated backup mechanism
- Monitoring and metrics collection
- Development tools integration (PgAdmin)

## Architecture

```
┌─────────────┐     ┌────────────┐     ┌──────────────┐
│  Application │────▶│  PgBouncer │────▶│  PostgreSQL  │
└─────────────┘     └────────────┘     └──────────────┘
                                             │
       ┌─────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌────────────┐     ┌──────────────┐
│  Monitoring  │    │  Automated  │    │  PgAdmin UI   │
│  (Exporter)  │    │  Backups   │    │  (Dev Only)   │
└─────────────┘     └────────────┘     └──────────────┘
```

## Configuration Files

### PostgreSQL Configuration

The main PostgreSQL configuration files:

- **postgresql.conf**: Main configuration file with optimized settings for performance
- **pg_hba.conf**: Host-based authentication configuration for security
- **init.sql**: Database initialization script for creating roles, users, and permissions

## Database Roles and Users

The system uses a role-based access control model:

### Roles

1. **app_readonly**: Read-only access to database objects
2. **app_readwrite**: Read and write access to database objects
3. **app_admin**: Full access including DDL operations

### Users

1. **petpro_readonly**: Application user with read-only access
2. **petpro_app**: Main application user with read/write access
3. **petpro_admin**: Administrative user with full access
4. **replicator**: Dedicated user for replication and backup operations
5. **postgres_exporter**: Monitoring user with access to performance metrics

## Security Features

- **Authentication**: SCRAM-SHA-256 password encryption (more secure than MD5)
- **Authorization**: Fine-grained role-based access control
- **Network Security**: Host-based access restrictions
- **Connection Encryption**: SSL/TLS configuration (optional)
- **Audit Logging**: SQL query logging for critical operations

## Performance Optimizations

- **Shared Buffers**: 512MB (25% of available RAM)
- **Effective Cache Size**: 1536MB (75% of available RAM)
- **Work Memory**: 16MB per operation
- **Maintenance Work Memory**: 128MB for maintenance operations
- **Connection Pooling**: PgBouncer in transaction pooling mode
- **WAL Settings**: Optimized for performance and durability

## Backup and Recovery

Automated backup system with:

- **Daily Backups**: Retained for 7 days
- **Weekly Backups**: Retained for 30 days
- **Monthly Backups**: Retained for 365 days
- **Backup Verification**: MD5 checksums for each backup file
- **Recovery Process**: Simple restore from compressed SQL dumps

## Monitoring and Metrics

Prometheus-compatible metrics exporter with:

- **Connection Stats**: Active, idle, and waiting connections
- **Query Performance**: Execution time, rows affected
- **Database Size**: Growth trends by database and table
- **Lock Information**: Lock types, duration, and contention
- **WAL Metrics**: Write-ahead log generation and archive status
- **Index Usage**: Scan rates and efficiency

## Development Tools

### PgAdmin 4

A web-based administration tool for PostgreSQL available in development:

- **URL**: http://localhost:5050
- **Default Credentials**: 
  - Email: admin@petpro.local
  - Password: pgadminpassword (should be changed)

## Docker Setup

The PostgreSQL stack is deployed using Docker Compose with:

- **postgres**: Main database service (PostgreSQL 14)
- **pgbouncer**: Connection pooling service
- **postgres-exporter**: Metrics collection for Prometheus
- **postgres-backup**: Automated backup service
- **pgadmin**: Web-based administration (development only)

## Environment Variables

Configure the database using these environment variables:

```
# Database Connection
DATABASE_URL=postgres://postgres:postgres@postgres:5432/petpro
DATABASE_SSL=false
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=petpro
POSTGRES_CONNECTION_LIMIT=100
PGBOUNCER_DEFAULT_POOL_SIZE=50

# Database Users
PG_APP_USER=petpro_app
PG_APP_PASSWORD=app_password_changeme
PG_READONLY_USER=petpro_readonly
PG_READONLY_PASSWORD=readonly_password_changeme
PG_ADMIN_USER=petpro_admin
PG_ADMIN_PASSWORD=admin_password_changeme

# PgAdmin
PGADMIN_EMAIL=admin@petpro.local
PGADMIN_PASSWORD=pgadminpassword

# Backup
BACKUP_RETENTION_DAYS=7
```

## Starting the Database Stack

To start the standard database stack:

```bash
docker-compose up -d postgres pgbouncer
```

To include monitoring:

```bash
docker-compose --profile monitoring up -d
```

To include automated backups:

```bash
docker-compose --profile backup up -d
```

To include development tools:

```bash
docker-compose --profile development up -d
```

## Manual Backup and Restore

### Manual Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres petpro | gzip > backup_$(date +%Y%m%d).sql.gz

# Verify backup
gunzip -c backup_YYYYMMDD.sql.gz | head -n 20
```

### Manual Restore

```bash
# Restore from backup
gunzip -c backup_YYYYMMDD.sql.gz | docker-compose exec -T postgres psql -U postgres petpro
```

## Production Recommendations

1. **Separate Database Server**: For production, consider using a dedicated database server
2. **Resource Allocation**: Allocate at least 2GB RAM and 2 CPU cores for PostgreSQL
3. **Data Directory**: Use high-performance SSD storage for the data directory
4. **Regular Backups**: Schedule daily backups with offsite storage
5. **High Availability**: Consider using replication for high availability
6. **Regular Maintenance**: Schedule VACUUM and ANALYZE operations

## Common Operations

### Connect to Database

```bash
# Direct connection
docker-compose exec postgres psql -U postgres petpro

# Through PgBouncer
docker-compose exec pgbouncer psql -h localhost -p 6432 -U postgres petpro
```

### Check Database Size

```bash
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('petpro'));"
```

### List Tables

```bash
docker-compose exec postgres psql -U postgres -c "\dt" petpro
```

### Monitor Performance

Access monitoring metrics at: http://localhost:9187/metrics
