# PetPro Database Schema Design

## Overview

This document outlines the database schema design for the PetPro application, including core entities, relationships, constraints, indexes, and audit trails.

## Core Entities

The PetPro database is composed of the following core entities:

1. **Users** - Application users (customers, vendors, administrators)
2. **Pets** - Pet information and health records
3. **Clinics** - Veterinary clinics and service providers
4. **Products** - Items for sale in the e-commerce system
5. **Appointments** - Scheduled services at clinics
6. **Orders** - Product purchases and transaction records
7. **Reviews** - Feedback for clinics, services, and products
8. **Inventory** - Product stock management for vendors
9. **Promotions** - Discounts and special offers

## Schema Design Principles

The database schema follows these key design principles:

1. **Normalization** - Tables are normalized to 3NF to minimize redundancy
2. **Referential Integrity** - Foreign key constraints ensure data consistency
3. **Data Types** - Appropriate data types selected for performance and storage efficiency
4. **Indexing Strategy** - Strategic indexes on frequently queried columns
5. **Soft Deletion** - Records are marked as deleted rather than physically removed
6. **Audit Trails** - Changes to critical data are tracked in audit tables
7. **Multi-tenancy** - Data is segregated by tenant (vendor) where appropriate
8. **Performance** - Denormalization applied selectively for read-heavy operations

## Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │    Pets     │       │  Clinics    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │◄──────┤ owner_id (FK)│       │ name        │
│ password    │       │ name        │       │ address_id   │
│ user_type   │       │ species     │       │ description  │
│ ...         │       │ breed       │       │ ...          │
└─────────────┘       │ birth_date  │       └──────┬──────┬┘
      ▲               └─────────────┘              │      │
      │                      ▲                     │      │
      │                      │                     │      │
┌─────┴─────────┐     ┌─────┴─────────┐     ┌─────▼──────▼┐     ┌─────────────┐
│   Profiles    │     │  Pet Health   │     │ Appointments │     │   Services  │
├───────────────┤     │   Records     │     ├─────────────┤     ├─────────────┤
│ id (PK)       │     ├───────────────┤     │ id (PK)     │     │ id (PK)     │
│ user_id (FK)  │     │ id (PK)       │     │ pet_id (FK) │     │ clinic_id   │
│ first_name    │     │ pet_id (FK)   │     │ clinic_id   │◄────┤ name        │
│ last_name     │     │ record_date   │     │ service_id  │     │ description │
│ phone         │     │ description   │     │ date_time   │     │ duration    │
│ ...           │     │ ...           │     │ status      │     │ price       │
└───────────────┘     └───────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Products   │       │   Orders    │       │ Order Items │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ vendor_id   │       │ user_id (FK)│       │ order_id (FK)│
│ name        │◄──────┤ status      │◄──────┤ product_id  │
│ description │       │ total       │       │ quantity    │
│ price       │       │ created_at  │       │ price       │
│ ...         │       │ ...         │       │ ...         │
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Inventory  │       │ Promotions  │       │   Reviews   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ product_id  │       │ name        │       │ user_id     │
│ quantity    │       │ discount    │       │ target_type │
│ location    │       │ start_date  │       │ target_id   │
│ ...         │       │ end_date    │       │ rating      │
└─────────────┘       └─────────────┘       │ content     │
                                            └─────────────┘
```

## Table Definitions

### Users and Authentication

#### users
- **Purpose**: Store all application users
- **Primary Key**: id (UUID)
- **Indexes**: email (unique), user_type
- **Audit**: Full audit trail via audit.user_changes

#### user_profiles
- **Purpose**: Extended user information
- **Primary Key**: id (UUID)
- **Foreign Key**: user_id references users(id)
- **Indexes**: user_id

#### user_roles
- **Purpose**: User role assignments
- **Primary Key**: user_id, role_id
- **Foreign Keys**: 
  - user_id references users(id)
  - role_id references roles(id)

### Pet Management

#### pets
- **Purpose**: Pet registration and basic information
- **Primary Key**: id (UUID)
- **Foreign Key**: owner_id references users(id)
- **Indexes**: owner_id, species, breed

#### pet_health_records
- **Purpose**: Medical history and health information
- **Primary Key**: id (UUID)
- **Foreign Key**: pet_id references pets(id)
- **Indexes**: pet_id, record_date

### Clinic Management

#### clinics
- **Purpose**: Veterinary clinic information
- **Primary Key**: id (UUID)
- **Foreign Key**: vendor_id references users(id)
- **Indexes**: vendor_id, location_id

#### clinic_services
- **Purpose**: Services offered by clinics
- **Primary Key**: id (UUID)
- **Foreign Key**: clinic_id references clinics(id)
- **Indexes**: clinic_id

#### appointments
- **Purpose**: Scheduled appointments
- **Primary Key**: id (UUID)
- **Foreign Keys**: 
  - pet_id references pets(id)
  - clinic_id references clinics(id)
  - service_id references clinic_services(id)
- **Indexes**: pet_id, clinic_id, date_time, status

### E-Commerce

#### products
- **Purpose**: Product catalog
- **Primary Key**: id (UUID)
- **Foreign Key**: vendor_id references users(id)
- **Indexes**: vendor_id, category, price

#### inventory
- **Purpose**: Product inventory tracking
- **Primary Key**: id (UUID)
- **Foreign Key**: product_id references products(id)
- **Indexes**: product_id, quantity

#### orders
- **Purpose**: Customer orders
- **Primary Key**: id (UUID)
- **Foreign Key**: user_id references users(id)
- **Indexes**: user_id, status, created_at

#### order_items
- **Purpose**: Individual items in orders
- **Primary Key**: id (UUID)
- **Foreign Keys**: 
  - order_id references orders(id)
  - product_id references products(id)
- **Indexes**: order_id, product_id

### Reviews and Feedback

#### reviews
- **Purpose**: User reviews for products and services
- **Primary Key**: id (UUID)
- **Foreign Key**: user_id references users(id)
- **Indexes**: user_id, target_type, target_id, rating

### Promotions

#### promotions
- **Purpose**: Discounts and special offers
- **Primary Key**: id (UUID)
- **Foreign Key**: vendor_id references users(id)
- **Indexes**: vendor_id, promotion_type, start_date, end_date, active

### Locations and Addresses

#### addresses
- **Purpose**: Physical address information
- **Primary Key**: id (UUID)
- **Foreign Key**: user_id references users(id)
- **Indexes**: user_id, postal_code

### Audit Trail

#### audit.entity_changes
- **Purpose**: Track all changes to audited entities
- **Columns**: 
  - id (UUID)
  - entity_type (text)
  - entity_id (UUID)
  - action (insert, update, delete)
  - changed_by (UUID - references users.id)
  - changed_at (timestamp)
  - old_values (JSONB)
  - new_values (JSONB)
- **Indexes**: entity_type, entity_id, changed_by, changed_at

## Indexing Strategy

1. **Primary Keys**: All tables have a primary key index
2. **Foreign Keys**: All foreign key columns are indexed
3. **Query Optimization**: 
   - Indexes on frequently filtered columns
   - Indexes on join columns
   - Indexes on sorted columns
4. **Composite Indexes**: Created for frequently combined query conditions
5. **Partial Indexes**: For specific query patterns (e.g., active records only)

## Constraints

1. **Primary Key**: Ensures entity uniqueness
2. **Foreign Key**: Ensures referential integrity
3. **Unique**: Applied to columns requiring uniqueness (email, etc.)
4. **Check**: Validates data (e.g., price >= 0, rating between 1 and 5)
5. **Not Null**: Required for essential fields

## Audit Trail Implementation

The audit trail is implemented using:

1. **Trigger-Based Approach**: Database triggers capture changes automatically
2. **Full History**: All changes to important entities are tracked
3. **Context Preservation**: Captures who made the change, when, and what was changed
4. **Non-Repudiation**: Cannot be modified by normal application operations
5. **Performance**: Minimal impact on normal database operations

## Schema Evolution

1. **Migrations**: All schema changes are version-controlled
2. **Backwards Compatibility**: Changes maintain compatibility where possible
3. **Testing**: Migrations are tested in development before deployment

## Performance Considerations

1. **Appropriate Indexes**: Indexed based on common query patterns
2. **Optimized Data Types**: Smallest effective data types chosen
3. **Partitioning**: Partitioning for large tables (audit trail, orders)
4. **Materialized Views**: For complex reporting queries
5. **Connection Pooling**: Efficient connection management with PgBouncer
