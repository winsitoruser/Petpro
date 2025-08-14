# PetPro - Pet Services Platform

![PetPro Logo](./assets/petpro-logo.png)

## Project Overview

PetPro is a comprehensive platform that connects pet owners with quality pet service vendors. The platform consists of:
- **Web Dashboard (Vendor/Clinic)**: For managing services, products, bookings, and reports
- **Web Admin Dashboard**: For complete control over vendors, users, transactions, and commissions

## Architecture

The platform follows a microservices architecture:

- Mobile App: Flutter (iOS/Android)
- Web Frontends: Next.js/React for Vendor and Admin dashboards
- Backend: Node.js microservices with API Gateway
- Database: PostgreSQL (primary), Redis (cache), Elasticsearch (search)
- Storage: S3-compatible for images and documents
- Message Queue: Kafka/RabbitMQ for event-driven operations

## Project Structure

```
/
├── docs/              # Documentation
│   ├── prd/           # Product Requirements Document
│   ├── architecture/  # Architecture diagrams and details
│   └── api/           # API specifications
├── mobile-app/        # Flutter application for users
├── web-vendor/        # Next.js application for vendors/clinics
├── web-admin/         # React application for administrators
└── backend/           # Microservices backend
    ├── api-gateway/   # API Gateway service
    ├── auth/          # Authentication service
    ├── user/          # User and pet profiles service
    ├── clinic/        # Clinic and vendor service
    ├── booking/       # Booking and slot management service
    ├── product/       # Product catalog service
    ├── order/         # Order management service
    ├── payment/       # Payment processing service
    ├── shipping/      # Shipping/logistics service
    ├── notification/  # Notification service
    └── admin/         # Admin and reporting service
```

## Development Status

This project is currently in initial setup phase.

## Key Features

- User registration and authentication (email, phone, social)
- Pet profile management
- Clinic search and booking
- Product catalog and e-commerce functionality
- Order management and payment processing
- Vendor onboarding and management
- Administrative dashboard with reporting
- Centralized structured logging with ELK stack
- Security hardening with authentication and encryption
- Production-ready PostgreSQL database with connection pooling
- Automated database backups and monitoring

## ELK Stack Logging System

PetPro includes a comprehensive, secure logging infrastructure using the ELK (Elasticsearch, Logstash, Kibana) stack:

### Features

- **Centralized Logging**: All application logs collected in one searchable repository
- **Structured JSON Logging**: Rich, contextual information with each log entry
- **Security Hardening**: Authentication, authorization, and encryption
- **Log Rotation**: Automatic file rotation and compression
- **Custom Dashboards**: Team-specific visualizations (Operations, Development, Security, Executive)
- **Automated Alerting**: Email notifications for critical errors
- **Request Tracking**: Unique IDs and context for request tracing

### Setup

1. Configure environment variables in `.env` file (see `.env.example`)
2. Run the initialization script:
   ```bash
   ./elk-stack-init.sh
   ```
3. Access Kibana at: http://localhost:5601 (use credentials from `.env`)

### Architecture

- **Backend Logging**: Winston-based structured logging with multiple transports
- **Log Collection**: Logstash with TCP/UDP/Beats inputs and filtering
- **Storage**: Elasticsearch with index lifecycle management
- **Visualization**: Kibana with custom dashboards and alerts

### Security

See [ELK Security Documentation](./docs/ELK_SECURITY.md) for details on:
- Authentication & Authorization
- Encryption & Transport Security
- Data Protection
- Network Security
- Resource Protection

## PostgreSQL Database Setup

PetPro utilizes a production-ready PostgreSQL database with advanced features for performance, security, and maintenance:

### Features

- **High Performance**: Optimized configuration for efficient query processing
- **Connection Pooling**: PgBouncer for efficient connection management
- **Role-Based Access**: Fine-grained permissions with dedicated application roles
- **Automated Backups**: Scheduled daily, weekly, and monthly backups
- **Monitoring Integration**: Prometheus exporter for comprehensive metrics
- **Development Tools**: PgAdmin interface for database management (development only)
- **Security Hardening**: SCRAM-SHA-256 authentication and network restrictions

### Setup

1. Configure database environment variables in `.env` file (see `.env.example`)
2. Start the database services:
   ```bash
   # Standard setup
   docker-compose up -d postgres pgbouncer
   
   # With monitoring
   docker-compose --profile monitoring up -d
   
   # With backups
   docker-compose --profile backup up -d
   
   # With development tools
   docker-compose --profile development up -d
   ```
3. Access PgAdmin (dev only) at: http://localhost:5050

### Architecture

- **Main Database**: PostgreSQL 14 with optimized configuration
- **Connection Pooling**: PgBouncer with transaction pooling mode
- **Monitoring**: Prometheus PostgreSQL exporter
- **Backup System**: Automated backup service with retention policies
- **Admin Interface**: PgAdmin 4 web interface (development profile)

### Database Management

- **Backup**: Automatic daily/weekly/monthly backups
- **Restore**: Easy restoration from backup files
- **Monitoring**: Key metrics collection for performance analysis
- **Administration**: Web interface for database administration

For detailed information, see [Database Setup Documentation](./docs/DATABASE_SETUP.md)

## Repository Pattern & Monitoring

PetPro implements an enhanced repository pattern with integrated metrics collection and monitoring:

### Features

- **Enhanced Repository Pattern**: Abstraction layer between data access and business logic
- **Automated Metrics Collection**: Prometheus instrumentation for all database operations
- **Caching Integration**: Redis caching with automatic invalidation strategy
- **Transaction Management**: Metrics-enabled transaction handling
- **Comprehensive Monitoring**: Grafana dashboards for repository, database, and cache performance
- **Alerting Rules**: Pre-configured alerts for error rates, slow queries, and cache issues

### Setup

1. Configure monitoring environment variables in `.env` file
2. Start the monitoring stack:
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```
3. Access Grafana at: http://localhost:3000

### Architecture

- **Metrics Collection**: Prometheus with custom exporters
- **Repositories**: Enhanced base repository with metrics instrumentation
- **Dashboards**: Custom Grafana dashboards for different concerns:
  - Repository metrics dashboard (query durations, error rates, cache hit ratios)
  - Database performance dashboard
  - Redis cache performance dashboard
- **Alerting**: Prometheus alerts with configurable thresholds

### Repository Implementation

- **Base Class**: `EnhancedRepository` with metrics collection
- **Query Metrics**: Duration, count, and error rate for all database operations
- **Cache Metrics**: Hit ratio, invalidation rate, and error tracking
- **Transaction Metrics**: Duration and error rate for database transactions

For detailed information, see [Repository Pattern Documentation](./backend/docs/REPOSITORY_PATTERN.md)
