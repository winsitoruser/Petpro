# System Architecture - PetPro Platform

## Architecture Diagram

```mermaid
flowchart LR
  subgraph Client
    Mobile[Mobile App (Flutter)]
    WebClinic[Clinic Dashboard (PWA / React)]
    WebAdmin[Admin Dashboard (React)]
  end

  API[API Gateway / BFF]

  subgraph Services[Microservices]
    Auth[Auth & Identity Service]
    User[User & Pet Service]
    ClinicSvc[Clinic & Vendor Service]
    Booking[Booking Service (Slot Engine)]
    Product[Product & Catalog Service]
    Order[Order & Checkout Service]
    Payment[Payment Service]
    Shipping[Shipping / Logistics Service]
    Notif[Notification Service]
    Report[Reporting & Analytics]
  end

  subgraph Infra[Infrastructure]
    Postgres[(PostgreSQL)]
    Redis[(Redis)]
    ES[(Elasticsearch / Algolia)]
    S3[(S3 Object Storage)]
    MQ[(Message Queue - Kafka/RabbitMQ)]
    Monitoring[(Prometheus / Grafana / Sentry)]
  end

  Mobile -->|HTTPS| API
  WebClinic -->|HTTPS| API
  WebAdmin -->|HTTPS| API

  API --> Auth
  API --> User
  API --> ClinicSvc
  API --> Booking
  API --> Product
  API --> Order
  API --> Payment
  API --> Shipping
  API --> Notif
  API --> Report

  Auth --> Postgres
  User --> Postgres
  ClinicSvc --> Postgres
  Booking --> Postgres
  Booking --> Redis
  Product --> Postgres
  Product --> ES
  Order --> Postgres
  Order --> MQ
  Payment --> Postgres
  Shipping --> Postgres
  Notif --> MQ
  Report --> MQ

  S3 -.-> ClinicSvc
  S3 -.-> User
  Monitoring -.-> API
  Monitoring -.-> Services

  MQ --> Notif
  MQ --> Report
  MQ --> Order
```

## Key Architecture Notes

- **API Gateway / BFF** is the single entry point: handling authentication, rate-limiting, routing, and aggregation for mobile clients.

- **Booking Service** uses Redis for distributed locks to prevent double-booking.

- **Event-driven Architecture**: Order/Booking/Payment services publish events to Message Queue for downstream processing (notifications, analytics, settlement).

## Service Descriptions

### Client Applications
- **Mobile App**: Flutter-based application for iOS and Android for pet owners/users
- **Web Clinic Dashboard**: PWA/React application for clinic/vendor management
- **Web Admin Dashboard**: React application for platform administrators

### Backend Services
1. **API Gateway / BFF**: Entry point for all client requests, handles routing, authentication, and request aggregation
2. **Auth & Identity Service**: User authentication, registration, token management
3. **User & Pet Service**: User profiles, pet profiles, and related data
4. **Clinic & Vendor Service**: Clinic profiles, services, staff, and vendor management
5. **Booking Service**: Appointment scheduling, slot management, availability
6. **Product & Catalog Service**: Product catalog, inventory, search
7. **Order & Checkout Service**: Shopping cart, order processing, checkout
8. **Payment Service**: Payment processing, gateway integration, reconciliation
9. **Shipping/Logistics Service**: Shipping rate calculation, tracking, carrier integration
10. **Notification Service**: Email, SMS, push notifications
11. **Reporting & Analytics**: Business intelligence, reporting, dashboard data

### Infrastructure
- **PostgreSQL**: Primary relational database
- **Redis**: Caching, distributed locking, session storage
- **Elasticsearch/Algolia**: Search indexing
- **S3 Object Storage**: File storage for images and documents
- **Message Queue**: Event bus for asynchronous processing
- **Monitoring Stack**: System monitoring, logging, and error tracking

## Data Flow Patterns

### Booking Flow
1. User selects service, clinic, and time slot in mobile app
2. API Gateway validates token and routes to Booking Service
3. Booking Service uses Redis locks to reserve the slot
4. Payment Service creates a payment session
5. Upon successful payment, Booking Service confirms the booking
6. Events are published to MQ for notifications and analytics

### Order Flow
1. User adds products to cart and proceeds to checkout
2. Order Service reserves inventory and creates order
3. Payment Service processes payment
4. Upon successful payment, Order Service finalizes the order
5. Shipping Service arranges delivery
6. Events are published to MQ for notifications, inventory updates, and analytics

## Security Model
- TLS encryption for all communications
- JWT token-based authentication
- Role-based access control
- Input validation at API Gateway
- Rate limiting to prevent abuse
- Audit logging for sensitive operations
