# PetPro - Multi-Vendor Pet Clinic + E-commerce

## Overview

PetPro is a comprehensive platform connecting pet owners with veterinary clinics and pet products. The platform consists of:

- **Mobile App (User)**: For booking services & purchasing products
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
