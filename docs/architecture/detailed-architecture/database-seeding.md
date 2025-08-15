# Database Seeding Documentation

## Overview

This document provides comprehensive guidance on setting up and using database seeders across the PetPro microservices architecture. Database seeders are essential for initializing databases with consistent test data for development, testing, and demonstration environments.

## Table of Contents

1. [General Guidelines](#general-guidelines)
2. [Seeding Command Structure](#seeding-command-structure)
3. [Booking Service Seeders](#booking-service-seeders)
4. [Vendor Service Seeders](#vendor-service-seeders)
5. [Inventory Service Seeders](#inventory-service-seeders)
6. [Auth Service Seeders](#auth-service-seeders)
7. [Running Seeders in Docker Environment](#running-seeders-in-docker-environment)
8. [Seeding Production Reference Data](#seeding-production-reference-data)

## General Guidelines

### Seeder Types

Each microservice implements three types of seeders:

1. **Development Seeders**: Comprehensive test data for local development
2. **Test Seeders**: Minimal data required for automated testing
3. **Production Seeders**: Essential reference data required for production environments

### Design Principles

- **Idempotency**: Seeders should be designed to be safely run multiple times without creating duplicates
- **Relationships**: Entity relationships must be maintained across seeders
- **Dependencies**: Seeders should run in the correct order to satisfy dependencies
- **Configurability**: Environment-specific data should be configurable via environment variables

## Seeding Command Structure

Each microservice implements a consistent CLI interface for database seeding:

```bash
# General format
npm run seed -- [environment] [options]

# Examples
npm run seed -- dev        # Seed development data
npm run seed -- test       # Seed test data
npm run seed -- prod       # Seed production reference data
npm run seed -- dev --fresh # Drop all tables and reseed
```

Options:
- `--fresh`: Drop all tables and recreate schema before seeding
- `--verbose`: Show detailed output during seeding
- `--only=[entity]`: Seed only specific entity (e.g., `--only=services`)
- `--count=[number]`: Specify number of records to generate (dev/test only)

## Booking Service Seeders

### Data Entities

The booking service seeds the following entities:

1. **Bookings**: Appointment records
2. **BookingItems**: Individual service items within a booking
3. **ServiceAvailability**: Available time slots for services
4. **BookingStatuses**: Reference data for booking status types

### Sample Seeder Data

#### Development Environment

```javascript
// Sample booking seeder
module.exports = async function seedBookings(db, options = {}) {
  const count = options.count || 50;
  const users = await db.models.User.findAll();
  const services = await db.models.Service.findAll();
  const vendors = await db.models.Vendor.findAll();
  
  const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const bookings = [];
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate random date within next 30 days
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    
    const booking = await db.models.Booking.create({
      userId: user.id,
      vendorId: vendor.id,
      date: date,
      startTime: `${9 + Math.floor(Math.random() * 8)}:00:00`,
      status,
      notes: `Test booking ${i + 1}`,
      totalPrice: Math.floor(Math.random() * 10000) / 100,
    });
    
    bookings.push(booking);
    
    // Create booking items
    const itemCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < itemCount; j++) {
      const service = services[Math.floor(Math.random() * services.length)];
      await db.models.BookingItem.create({
        bookingId: booking.id,
        serviceId: service.id,
        price: service.price,
        quantity: 1
      });
    }
  }
  
  console.log(`Created ${bookings.length} bookings with items`);
  return bookings;
};
```

### Running Booking Service Seeders

```bash
# Navigate to booking-service directory
cd backend-microservices/booking-service

# Run development seeders
npm run seed -- dev

# Run test seeders
npm run seed -- test

# Run with options
npm run seed -- dev --fresh --count=100
```

## Vendor Service Seeders

### Data Entities

The vendor service seeds the following entities:

1. **Vendors**: Partner businesses
2. **Services**: Services offered by vendors
3. **ServiceCategories**: Categories for organizing services
4. **StaffMembers**: Staff working for vendors
5. **StaffAvailability**: Staff availability schedules
6. **VendorLocations**: Physical locations of vendor businesses

### Sample Seeder Data

#### Production Reference Data

```javascript
// Sample service categories seeder for production
module.exports = async function seedServiceCategories(db) {
  const categories = [
    {
      name: 'Grooming',
      description: 'Pet grooming services including bathing, haircuts, and styling',
      isActive: true
    },
    {
      name: 'Veterinary Care',
      description: 'Medical services including checkups, vaccinations, and treatments',
      isActive: true
    },
    {
      name: 'Training',
      description: 'Behavioral training and obedience classes',
      isActive: true
    },
    {
      name: 'Boarding',
      description: 'Overnight care and accommodation for pets',
      isActive: true
    },
    {
      name: 'Day Care',
      description: 'Daytime supervision and activities for pets',
      isActive: true
    }
  ];
  
  const results = [];
  
  for (const category of categories) {
    // Check if category already exists
    const existing = await db.models.ServiceCategory.findOne({
      where: { name: category.name }
    });
    
    if (!existing) {
      const created = await db.models.ServiceCategory.create(category);
      results.push(created);
    } else {
      results.push(existing);
    }
  }
  
  console.log(`Ensured ${results.length} service categories exist`);
  return results;
};
```

### Running Vendor Service Seeders

```bash
# Navigate to vendor-service directory
cd backend-microservices/vendor-service

# Run development seeders
npm run seed -- dev

# Run test seeders with options
npm run seed -- test --only=vendors --fresh
```

## Inventory Service Seeders

### Data Entities

The inventory service seeds the following entities:

1. **Products**: Product catalog items
2. **ProductCategories**: Categories for organizing products
3. **Inventory**: Stock levels for products
4. **InventoryHistory**: Historical record of inventory changes
5. **ProductReviews**: Customer reviews for products

### Sample Seeder Data

#### Development Environment

```javascript
// Sample product seeder
module.exports = async function seedProducts(db, options = {}) {
  const count = options.count || 100;
  const vendors = await db.models.Vendor.findAll();
  const categories = await db.models.ProductCategory.findAll();
  
  const petTypes = ['DOG', 'CAT', 'BIRD', 'FISH', 'SMALL_ANIMAL'];
  const statusOptions = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'];
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const petType = petTypes[Math.floor(Math.random() * petTypes.length)];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    const price = (Math.floor(Math.random() * 10000) + 500) / 100;
    const salePrice = Math.random() > 0.3 ? (price * 0.8).toFixed(2) : null;
    
    const product = await db.models.Product.create({
      name: `Test Product ${i + 1}`,
      sku: `SKU-${1000 + i}`,
      description: `This is a test product description for product ${i + 1}`,
      price,
      salePrice,
      vendorId: vendor.id,
      categoryId: category.id,
      petTypes: [petType],
      featured: Math.random() > 0.8,
      status
    });
    
    products.push(product);
    
    // Create inventory for this product
    const quantity = Math.floor(Math.random() * 100) + 10;
    await db.models.Inventory.create({
      productId: product.id,
      quantity,
      reserved: 0,
      lowStockThreshold: 10,
      status: quantity > 20 ? 'IN_STOCK' : 'LOW_STOCK'
    });
  }
  
  console.log(`Created ${products.length} products with inventory`);
  return products;
};
```

### Running Inventory Service Seeders

```bash
# Navigate to inventory-service directory
cd backend-microservices/inventory-service

# Run development seeders
npm run seed -- dev

# Run test seeders
npm run seed -- test --fresh
```

## Auth Service Seeders

### Data Entities

The auth service seeds the following entities:

1. **Users**: User accounts
2. **Roles**: User roles (Admin, Vendor, Customer)
3. **Permissions**: Specific permissions for fine-grained access control

### Sample Seeder Data

#### Production Reference Data

```javascript
// Sample roles and permissions seeder for production
module.exports = async function seedRolesAndPermissions(db) {
  // Create base roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'System administrator with full access'
    },
    {
      name: 'VENDOR',
      description: 'Vendor account with access to vendor dashboard'
    },
    {
      name: 'CUSTOMER',
      description: 'Regular customer account'
    }
  ];
  
  // Create all permissions
  const permissions = [
    // Admin permissions
    { name: 'admin:full_access', description: 'Full system access' },
    
    // Vendor permissions
    { name: 'vendor:manage_profile', description: 'Manage vendor profile' },
    { name: 'vendor:manage_services', description: 'Manage vendor services' },
    { name: 'vendor:manage_staff', description: 'Manage vendor staff' },
    { name: 'vendor:manage_bookings', description: 'Manage vendor bookings' },
    
    // Customer permissions
    { name: 'customer:manage_profile', description: 'Manage customer profile' },
    { name: 'customer:create_booking', description: 'Create bookings' },
    { name: 'customer:view_booking_history', description: 'View booking history' }
  ];
  
  // Create roles
  const createdRoles = {};
  for (const role of roles) {
    const [createdRole] = await db.models.Role.findOrCreate({
      where: { name: role.name },
      defaults: role
    });
    createdRoles[role.name] = createdRole;
  }
  
  // Create permissions
  const createdPermissions = {};
  for (const permission of permissions) {
    const [createdPermission] = await db.models.Permission.findOrCreate({
      where: { name: permission.name },
      defaults: permission
    });
    createdPermissions[permission.name] = createdPermission;
  }
  
  // Assign permissions to roles
  await createdRoles['ADMIN'].setPermissions(Object.values(createdPermissions));
  
  await createdRoles['VENDOR'].setPermissions([
    createdPermissions['vendor:manage_profile'],
    createdPermissions['vendor:manage_services'],
    createdPermissions['vendor:manage_staff'],
    createdPermissions['vendor:manage_bookings']
  ]);
  
  await createdRoles['CUSTOMER'].setPermissions([
    createdPermissions['customer:manage_profile'],
    createdPermissions['customer:create_booking'],
    createdPermissions['customer:view_booking_history']
  ]);
  
  console.log(`Seeded ${Object.keys(createdRoles).length} roles and ${Object.keys(createdPermissions).length} permissions`);
  return { roles: createdRoles, permissions: createdPermissions };
};
```

### Running Auth Service Seeders

```bash
# Navigate to auth-service directory
cd backend-microservices/auth-service

# Run development seeders
npm run seed -- dev

# Run production reference data seeders
npm run seed -- prod
```

## Running Seeders in Docker Environment

For Docker-based development, we provide convenience scripts to run seeders:

```bash
# Seed all microservices with development data
./scripts/seed-all-dev.sh

# Seed specific microservice
./scripts/seed-service.sh auth dev
./scripts/seed-service.sh booking test --fresh
```

Example Docker script implementation:

```bash
#!/bin/bash
# seed-service.sh

SERVICE=$1
ENV=$2
shift 2
OPTIONS=$@

if [ -z "$SERVICE" ] || [ -z "$ENV" ]; then
  echo "Usage: ./seed-service.sh <service-name> <environment> [options]"
  echo "Example: ./seed-service.sh booking dev --fresh"
  exit 1
fi

docker-compose exec $SERVICE-service npm run seed -- $ENV $OPTIONS
```

## Seeding Production Reference Data

Production environments should only be seeded with essential reference data, never test data. A separate script is provided for initial production setup:

```bash
# Production seed command (run during deployment)
./scripts/prod-init-data.sh
```

### Security Considerations

- Production seeders should never contain sensitive data or passwords
- Admin users should be created manually or through a secure process
- Production seeders should be idempotent and safe to run multiple times

## Best Practices

1. **Use Factories**: Implement factory functions for generating test data with realistic values
2. **Maintain Referential Integrity**: Ensure foreign key relationships are maintained
3. **Versioning**: Version your seeders to track changes over time
4. **Documentation**: Document any special requirements or dependencies for each seeder
5. **Consistency**: Maintain consistent data patterns across microservices
6. **Environment Variables**: Use environment variables for configurable values
