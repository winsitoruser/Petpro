# Detailed System Architecture - PetPro Platform

## Table of Contents
1. [Overview](#overview)
2. [Architectural Principles](#architectural-principles)
3. [Component Architecture](#component-architecture)
4. [Data Architecture](#data-architecture)
5. [Integration Architecture](#integration-architecture)
6. [Security Architecture](#security-architecture)
7. [DevOps & Infrastructure](#devops--infrastructure)
8. [Scaling Strategy](#scaling-strategy)

## Overview

PetPro is built on a microservices architecture pattern to enable scalability, resilience, and independent development cycles. The system comprises three main client applications and multiple backend services that communicate through an API Gateway.

### Key Architectural Components

- **Client Applications**
  - Mobile App (Flutter for iOS/Android)
  - Vendor Dashboard (React/Next.js PWA)
  - Admin Dashboard (React SPA)

- **Backend Services**
  - API Gateway/BFF (Backend for Frontend)
  - Core Microservices (12 distinct services)
  - Message Queue/Event Bus
  - Data Stores (SQL, NoSQL, Cache)

## Architectural Principles

### 1. Service Isolation

Each microservice:
- Has a single responsibility and well-defined domain boundary
- Owns its data model and persistence layer
- Can be developed, deployed, and scaled independently
- Communicates via well-defined APIs

### 2. Event-Driven Architecture

- Critical business events are published to a central event bus
- Services subscribe to events they're interested in
- Enables loose coupling between services
- Supports eventual consistency patterns

### 3. API-First Design

- All services provide well-documented RESTful APIs
- OpenAPI/Swagger specifications for all endpoints
- Versioned APIs to support backwards compatibility
- API Gateway provides a single entry point for all client applications

### 4. Resilient Design

- Services designed to fail gracefully
- Circuit breaker patterns implemented for downstream dependencies
- Retry policies for transient failures
- Health checks and readiness/liveness probes

## Component Architecture

### Client Applications

#### Mobile App (Flutter)
- **Architecture**: MVVM with Bloc pattern
- **Features**: User authentication, pet profile management, clinic search, booking, order management
- **Integration**: Communicates with backend via API Gateway
- **Offline Capability**: Limited offline data access for booked appointments and pet profiles

#### Vendor Dashboard (React/Next.js PWA)
- **Architecture**: Server-side rendering with Next.js
- **Features**: Service management, order fulfillment, inventory control, reports
- **Integration**: Communicates with backend via API Gateway

#### Admin Dashboard (React)
- **Architecture**: Single Page Application with Redux
- **Features**: Vendor management, reporting, platform configuration
- **Integration**: Communicates with backend via API Gateway

### Backend Services

#### 1. API Gateway / BFF
- **Technologies**: Kong or AWS API Gateway + custom middleware
- **Responsibilities**:
  - Authentication and authorization
  - Request routing to appropriate services
  - Rate limiting
  - Request/response transformation
  - API documentation

#### 2. Auth & Identity Service
- **Technologies**: Node.js + Express/NestJS + JWT
- **Responsibilities**:
  - User registration and authentication
  - Token issuance and validation
  - Password management
  - OAuth2 provider integration
  - OTP generation and validation

#### 3. User & Pet Service
- **Technologies**: Node.js + Express/NestJS
- **Responsibilities**:
  - User profile management
  - Pet profile management
  - User preferences and settings
  - Address management

#### 4. Clinic & Vendor Service
- **Technologies**: Node.js + Express/NestJS
- **Responsibilities**:
  - Clinic profile management
  - Vendor onboarding and approval workflow
  - Clinic staff management
  - Document verification

#### 5. Booking Service
- **Technologies**: Node.js + Express/NestJS + Redis
- **Responsibilities**:
  - Service slot availability management
  - Booking creation and management
  - Conflict resolution and concurrency control
  - Calendar synchronization

#### 6. Product & Catalog Service
- **Technologies**: Node.js + Express/NestJS + Elasticsearch
- **Responsibilities**:
  - Product catalog management
  - Product search and filtering
  - Inventory management
  - Product categorization

#### 7. Order & Checkout Service
- **Technologies**: Node.js + Express/NestJS
- **Responsibilities**:
  - Shopping cart management
  - Order creation and processing
  - Price calculation (including tax and shipping)
  - Commission calculation

#### 8. Payment Service
- **Technologies**: Node.js + Express/NestJS
- **Responsibilities**:
  - Payment gateway integration (Midtrans/Xendit)
  - Payment processing
  - Webhook handling
  - Refund processing
  - Reconciliation

#### 9. Shipping/Logistics Service
- **Technologies**: Node.js + Express/NestJS
- **Responsibilities**:
  - Shipping rate calculation
  - Carrier API integration (JNE, SiCepat, Grab)
  - Tracking management
  - Shipping label generation

#### 10. Notification Service
- **Technologies**: Node.js + Worker processes
- **Responsibilities**:
  - Email notifications (AWS SES/Sendgrid)
  - Push notifications (FCM)
  - SMS notifications (Twilio)
  - WhatsApp notifications (Twilio/third-party API)
  - Notification templates and personalization

#### 11. Reporting & Analytics Service
- **Technologies**: Node.js + Express/NestJS + ClickHouse/Redshift
- **Responsibilities**:
  - Business intelligence reporting
  - Data aggregation and analytics
  - Dashboard metrics
  - Export functionality (CSV, PDF, Excel)

#### 12. Admin Service
- **Technologies**: Node.js + Express/NestJS
- **Responsibilities**:
  - Platform configuration
  - Vendor management and approval
  - Commission settings
  - System health monitoring

## Data Architecture

### Database Strategy

#### Primary Datastores
- **PostgreSQL**: Primary transactional database for structured data
  - Users, pets, clinics, services, bookings, orders, payments
  - Implemented with schemas per service
  - Strong consistency for critical transactions

- **Redis**: For caching and distributed operations
  - Session data
  - Distributed locks (booking slots)
  - Rate limiting
  - Caching frequently accessed data

- **Elasticsearch**: For search functionality
  - Clinic search by location, services, ratings
  - Product search and filtering
  - Full-text search capabilities

- **S3-compatible Storage**: For binary/large data
  - Images (clinics, products, pets)
  - Documents (clinic licenses, certifications)
  - Export files (reports)

#### Data Access Patterns
- **Service-owned databases**: Each service owns its data schema
- **Event sourcing**: For audit-heavy domains (payments, booking changes)
- **CQRS pattern**: For reporting and analytics
- **Read replicas**: For heavy read operations

#### Data Consistency
- **Strong consistency**: Within service boundaries
- **Eventual consistency**: Across service boundaries
- **Compensating transactions**: For distributed operations that require rollback

### Database Schema Highlights

Key database relations include:
- Users → Pets (one-to-many)
- Clinics → Services (one-to-many)
- Services → Slots (one-to-many)
- Users → Bookings → Services (many-to-many)
- Clinics → Products (one-to-many)
- Users → Orders → Products (many-to-many)

For full ERD, see the [database-erd.md](database-erd.md) document.

## Integration Architecture

### Internal Integration

#### Synchronous Communication
- **REST APIs**: Primary communication pattern between services
  - HTTP/2 for efficiency
  - JSON as the data format
  - HAL/HATEOAS for API discoverability

#### Asynchronous Communication
- **Event Bus**: Kafka/RabbitMQ for event-driven architecture
  - Event topics organized by domain
  - Dead-letter queues for failed processing
  - Idempotent event handlers

#### Event Types
- **Domain Events**: Business-significant occurrences
  - `booking.created`, `booking.confirmed`, `booking.cancelled`
  - `order.created`, `order.paid`, `order.shipped`
  - `vendor.registered`, `vendor.approved`

- **Integration Events**: Cross-service coordination
  - `payment.succeeded`, `payment.failed`
  - `inventory.updated`
  - `notification.requested`

### External Integration

#### Payment Gateways
- **Midtrans/Xendit**: For payment processing
  - RESTful API integration
  - Webhook handling for asynchronous notifications
  - Tokenization for recurring payments

#### Shipping Carriers
- **JNE/SiCepat/Grab**: For delivery services
  - Rate calculation
  - Shipping label generation
  - Tracking status updates

#### Maps & Geolocation
- **Google Maps API**: For location services
  - Geocoding
  - Distance calculation
  - Place details

#### Notification Providers
- **FCM**: For push notifications
- **Twilio**: For SMS and WhatsApp
- **AWS SES/Sendgrid**: For email

## Security Architecture

### Authentication & Authorization

- **JWT-based authentication**:
  - Short-lived access tokens (15-30 minutes)
  - Refresh tokens for session persistence
  - Token revocation capabilities

- **Role-Based Access Control (RBAC)**:
  - User roles: regular user, clinic staff, clinic admin, platform admin
  - Permission-based access for fine-grained control

- **OAuth2/OpenID Connect**:
  - Social login (Google, Apple)
  - Federation capabilities for future B2B integration

### API Security

- **TLS everywhere**: All communications encrypted
- **API Key authentication**: For service-to-service communication
- **Rate limiting**: Prevent abuse and DoS attacks
- **Input validation**: At API Gateway and service levels
- **CORS configuration**: For web clients

### Data Security

- **Encryption at rest**: For sensitive data
- **PII handling**: In compliance with data protection regulations
- **Data masking**: For logging and non-production environments
- **Audit logging**: For sensitive operations (payments, data access)

### Network Security

- **Private subnets**: For backend services
- **VPC**: Isolation of production environment
- **Security groups/Firewalls**: Controlled access between services
- **WAF**: Protection against common web vulnerabilities

## DevOps & Infrastructure

### Infrastructure as Code

- **Terraform/CloudFormation**: For infrastructure provisioning
- **Kubernetes manifests/Helm charts**: For application deployment

### CI/CD Pipeline

- **GitHub Actions/GitLab CI**: For automated pipelines
- **Testing strategy**:
  - Unit tests
  - Integration tests
  - Contract tests (Pact)
  - E2E tests (Cypress)

### Monitoring & Observability

- **Prometheus/Grafana**: For metrics and dashboards
- **ELK Stack**: For centralized logging
- **Jaeger/Zipkin**: For distributed tracing
- **Sentry**: For error tracking

### Deployment Strategy

- **Blue-Green deployments**: For zero-downtime updates
- **Canary releases**: For high-risk changes
- **Feature flags**: For controlled feature rollout

## Scaling Strategy

### Horizontal Scaling

- **Stateless services**: All application services designed for horizontal scaling
- **Auto-scaling**: Based on CPU/memory usage and request rate
- **Database scaling**: Read replicas for read-heavy services

### Performance Optimization

- **Caching strategy**:
  - Application-level caching (Redis)
  - CDN for static assets
  - Database query caching

- **API optimizations**:
  - Pagination for large result sets
  - Projection (field filtering)
  - Compression

### High Availability

- **Multi-AZ deployment**: For resilience against zone failures
- **Database redundancy**: Automated failover
- **Service redundancy**: Minimum of 3 replicas for critical services

### Disaster Recovery

- **Regular backups**: For all data stores
- **Recovery testing**: Scheduled DR drills
- **RTO/RPO targets**: 
  - Recovery Time Objective: < 1 hour
  - Recovery Point Objective: < 5 minutes
