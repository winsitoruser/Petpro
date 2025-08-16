# Entity Relationship Diagrams

## Overview
This section contains the Entity Relationship Diagrams (ERDs) for the PetPro system, showing the relationships between different data entities across the microservices architecture.

## Available Diagrams

- [Microservices Domain ERD](./microservices-domain-erd.md): Comprehensive view of all domains and their relationships
- [Vendor Service ERD](./vendor-service-erd.md): Detailed entities and relationships in the vendor service
- [Auth Service ERD](./auth-service-erd.md): User authentication and authorization data model
- [Booking Service ERD](./booking-service-erd.md): Appointment and booking management data model
- [Inventory Service ERD](./inventory-service-erd.md): Product and inventory management data model
- [Payment Service ERD](./payment-service-erd.md): Payment processing and transaction data model
- [Pet Service ERD](./pet-service-erd.md): Pet profile and health records data model
- [Customer Service ERD](./customer-service-erd.md): Customer management data model

## Notation Used

The ERDs follow standard Entity-Relationship notation:
- Rectangles represent entities
- Diamonds represent relationships
- Lines connect entities to relationships
- Crow's foot notation shows cardinality (one-to-many, many-to-many)

## Database Implementation

The PetPro system uses PostgreSQL as the primary database. The data model is implemented with:
- Proper foreign key constraints
- Indexing strategies for performance optimization
- Schema separation by domain
- Role-based access control at the database level

For details on the database implementation, see the [Database Setup Documentation](../../en/architecture/database-setup.md).
