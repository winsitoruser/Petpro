# PetPro Database Migrations

This directory contains SQL migration files that define the PostgreSQL schema for the PetPro application.

## Migration Files

The migrations are numbered sequentially and should be applied in order:

1. **001_initial_schema.sql**: Core schema setup, UUID extension, audit functionality
2. **002_users_schema.sql**: Users, profiles, authentication, addresses, roles & permissions
3. **003_pets_schema.sql**: Pets, health records, vaccinations, allergies, medications
4. **004_clinics_schema.sql**: Clinics, services, staff, appointments
5. **005_products_schema.sql**: Products, inventory, orders, shopping carts
6. **006_reviews_schema.sql**: Reviews and ratings for products, clinics, services
7. **007_notifications_payments_schema.sql**: Notifications, payment methods, transactions

## Running Migrations

Use the `run-migrations.sh` script in the parent directory to apply migrations:

```bash
# Apply all pending migrations
./run-migrations.sh

# Show migration status
./run-migrations.sh --status

# Apply a specific migration file
./run-migrations.sh --file migrations/001_initial_schema.sql

# Reset the database and apply all migrations (CAUTION: destroys all data)
./run-migrations.sh --reset
```

## Schema Overview

### Core Entities

- **Users**: Authentication, profiles, roles, permissions
- **Pets**: Pet records, health information, vaccinations
- **Clinics**: Veterinary services, staff, appointment scheduling
- **Products**: E-commerce catalog, inventory management
- **Orders**: Shopping cart, checkout, order processing
- **Reviews**: Ratings and reviews for clinics, products, services
- **Payments**: Payment processing, stored payment methods

### Schema Design Principles

1. **UUID Primary Keys**: All tables use UUID primary keys for security and scalability
2. **Timestamps**: Created/updated timestamps on all tables
3. **Soft Deletion**: Where appropriate, uses deleted_at timestamp instead of hard deletion
4. **Audit Trail**: Changes tracked in audit.entity_changes table
5. **Indexing Strategy**: Strategic indexes for common query patterns
6. **Referential Integrity**: Enforced through foreign key constraints
7. **Enumerations**: PostgreSQL enums used for constrained values

## Database Features

- **Automatic Timestamps**: Triggers maintain updated_at timestamps
- **Audit Logging**: Changes to key tables are tracked automatically
- **Comprehensive Indexes**: Optimized query performance
- **JSON Support**: JSONB columns for flexible attributes and preferences
- **Full-Text Search**: Text search indexes on product names and descriptions

## Notes on Database Security

- All passwords are stored as secure hashes, never in plain text
- Role-based access control through permissions system
- Sensitive payment data is tokenized (not stored directly)
