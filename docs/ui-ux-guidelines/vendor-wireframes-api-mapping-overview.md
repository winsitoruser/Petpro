# PetPro Vendor Dashboard Wireframes-API Mapping

This document maps the wireframe UI components to the corresponding API endpoints, providing a clear reference for developers implementing the vendor dashboard.

## Overview

The PetPro vendor dashboard wireframes are organized into the following functional areas:

1. **Order Management**: Managing customer orders, shipments, and order status updates
2. **Appointment Management**: Scheduling and managing service appointments
3. **Inventory Management**: Product stock tracking and updates
4. **Reviews Management**: Customer review monitoring and responses
5. **Promotions Management**: Creating and managing marketing campaigns
6. **Analytics Dashboard**: Data visualization and business insights
7. **Settings Management**: Account and business configuration

Each section of the wireframe documentation corresponds to specific API endpoints that provide the necessary data and functionality.

## API Structure Overview

The PetPro API follows a RESTful design with the following base URL structure:

```
https://api.petpro.com/v1
```

Authentication is handled via JWT tokens which must be included in the `Authorization` header:

```
Authorization: Bearer {token}
```

Response formats follow standard conventions:

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "pagination": {
      "total": 100,
      "count": 10,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 10
    }
  },
  "errors": [
    // Error details (if applicable)
  ]
}
```

## Primary API Endpoints Overview

| Dashboard Section | Primary Endpoints |
|-------------------|-------------------|
| Order Management | `/vendors/{vendorId}/orders` |
| Appointment Management | `/vendors/{vendorId}/appointments` |
| Inventory Management | `/vendors/{vendorId}/products` |
| Reviews Management | `/vendors/{vendorId}/reviews` |
| Promotions Management | `/vendors/{vendorId}/promotions` |
| Analytics Dashboard | `/vendors/{vendorId}/analytics/*` |
| Settings Management | `/vendors/{vendorId}/settings`, `/vendors/{vendorId}/profile` |

For detailed API documentation, refer to [API Documentation](/docs/api/api-endpoints.md).

## Dashboard Overview & Authentication

### Dashboard Home Screen

**Wireframe Reference**: [Vendor Dashboard Home](/docs/ui-ux-guidelines/vendor-dashboard-overview.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/dashboard-summary
```

**Response Example**:

```json
{
  "data": {
    "revenue": {
      "total": 8745.5,
      "change": 12,
      "period": "last30days"
    },
    "orders": {
      "total": 156,
      "change": 8,
      "period": "last30days"
    },
    "appointments": {
      "total": 42,
      "change": 5,
      "period": "last30days"
    },
    "inventory": {
      "lowStock": 8,
      "outOfStock": 3
    },
    "reviews": {
      "total": 24,
      "unresponded": 5,
      "averageRating": 4.3
    },
    "notifications": [
      {
        "id": "ntf-001",
        "type": "order",
        "message": "New order #12345 received",
        "createdAt": "2025-08-11T06:30:00Z",
        "isRead": false
      },
      {
        "id": "ntf-002",
        "type": "review",
        "message": "New 5-star review from John D.",
        "createdAt": "2025-08-10T15:45:00Z",
        "isRead": false
      }
    ]
  }
}
```

### Authentication

**Wireframe Reference**: Login screen (not included in current wireframes)

**API Endpoints**:

```
POST /auth/login
```

**Request Example**:

```json
{
  "email": "vendor@happypaws.com",
  "password": "securePassword123"
}
```

**Response Example**:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "vnd-12345",
      "name": "Happy Paws Pet Clinic",
      "email": "vendor@happypaws.com",
      "role": "vendor",
      "vendorId": "ven-12345"
    }
  }
}
```

```
GET /vendors/{vendorId}/profile
```

**Response Example**:

```json
{
  "data": {
    "id": "ven-12345",
    "name": "Happy Paws Pet Clinic",
    "description": "Full-service pet clinic offering medical care, grooming, and premium pet products.",
    "logo": "https://storage.petpro.com/vendor-logos/happypaws.png",
    "email": "contact@happypaws.com",
    "phone": "(555) 123-4567",
    "website": "www.happypawspetclinic.com",
    "address": {
      "street": "123 Pet Care Avenue",
      "city": "Petropolis",
      "state": "California",
      "postalCode": "90210",
      "country": "United States",
      "coordinates": {
        "lat": 34.0522,
        "lng": -118.2437
      }
    },
    "businessDetails": {
      "registrationNumber": "BRN-12345678",
      "taxId": "TAX-87654321",
      "businessType": "Veterinary Clinic & Shop",
      "foundedYear": 2010
    },
    "verificationStatus": "verified",
    "memberSince": "2024-03-15T00:00:00Z",
    "subscriptionPlan": "premium",
    "rating": 4.3
  }
}
```
