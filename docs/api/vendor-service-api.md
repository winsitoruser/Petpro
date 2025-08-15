# Vendor Service API Documentation

## Overview

The Vendor Service manages all vendor-related operations, including vendor registration, profile management, service offerings, and business settings. This document provides detailed API specifications for both REST endpoints and TCP message patterns.

## REST API Endpoints

All REST endpoints are accessible through the API Gateway at `/api/v1/vendors/*` and require valid authentication unless specified otherwise.

### Vendor Management

#### 1. Register Vendor

**Endpoint:** `POST /api/v1/vendors`

**Description:** Registers a new vendor account

**Request Body:**
```json
{
  "businessName": "Happy Paws Grooming",
  "businessType": "GROOMING",
  "email": "contact@happypaws.com",
  "phone": "+1234567890",
  "website": "https://happypaws.com",
  "description": "Professional pet grooming services",
  "address": {
    "street": "123 Pet Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "businessHours": [
    {
      "dayOfWeek": 1,
      "openTime": "09:00",
      "closeTime": "18:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 2,
      "openTime": "09:00",
      "closeTime": "18:00",
      "isClosed": false
    }
    // Additional days...
  ],
  "taxId": "TAX-12345678",
  "documents": [
    {
      "type": "BUSINESS_LICENSE",
      "fileUrl": "https://storage.petpro.com/documents/license-abc123.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "businessName": "Happy Paws Grooming",
    "businessType": "GROOMING",
    "status": "PENDING_APPROVAL",
    "email": "contact@happypaws.com",
    "phone": "+1234567890",
    "website": "https://happypaws.com",
    "address": {
      "id": 5001,
      "street": "123 Pet Street",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "USA",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "createdAt": "2025-08-15T19:15:30Z",
    "updatedAt": "2025-08-15T19:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `EMAIL_ALREADY_REGISTERED`: Email already in use
- `INVALID_ADDRESS`: Address validation failed
- `INVALID_BUSINESS_TYPE`: Business type not supported
- `MISSING_REQUIRED_DOCUMENTS`: Required documents not provided

#### 2. Get Vendor Profile

**Endpoint:** `GET /api/v1/vendors/:id`

**Description:** Retrieves vendor profile information

**Path Parameters:**
- `id`: Vendor ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "businessName": "Happy Paws Grooming",
    "businessType": "GROOMING",
    "status": "ACTIVE",
    "email": "contact@happypaws.com",
    "phone": "+1234567890",
    "website": "https://happypaws.com",
    "description": "Professional pet grooming services",
    "profileImage": "https://storage.petpro.com/vendors/1001/profile.jpg",
    "coverImage": "https://storage.petpro.com/vendors/1001/cover.jpg",
    "address": {
      "id": 5001,
      "street": "123 Pet Street",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "USA",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "businessHours": [
      {
        "id": 2001,
        "dayOfWeek": 1,
        "openTime": "09:00",
        "closeTime": "18:00",
        "isClosed": false
      },
      {
        "id": 2002,
        "dayOfWeek": 2,
        "openTime": "09:00",
        "closeTime": "18:00",
        "isClosed": false
      }
      // Additional days...
    ],
    "rating": 4.8,
    "reviewCount": 156,
    "serviceCategories": [
      "Grooming",
      "Bathing",
      "Nail Trimming"
    ],
    "createdAt": "2025-08-15T19:15:30Z",
    "updatedAt": "2025-08-15T19:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist

#### 3. Update Vendor Profile

**Endpoint:** `PUT /api/v1/vendors/:id`

**Description:** Updates vendor profile information

**Path Parameters:**
- `id`: Vendor ID

**Request Body:**
```json
{
  "businessName": "Happy Paws Professional Grooming",
  "description": "Premium pet grooming services for dogs and cats",
  "phone": "+1234567890",
  "website": "https://happypawsgrooming.com",
  "profileImage": "https://storage.petpro.com/vendors/1001/new-profile.jpg",
  "address": {
    "street": "456 Pet Avenue",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "businessName": "Happy Paws Professional Grooming",
    "description": "Premium pet grooming services for dogs and cats",
    "phone": "+1234567890",
    "website": "https://happypawsgrooming.com",
    "profileImage": "https://storage.petpro.com/vendors/1001/new-profile.jpg",
    "address": {
      "id": 5001,
      "street": "456 Pet Avenue",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "USA",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "updatedAt": "2025-08-15T20:10:45Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `UNAUTHORIZED`: User does not have permission to update this vendor
- `INVALID_ADDRESS`: Address validation failed

#### 4. List Vendors

**Endpoint:** `GET /api/v1/vendors`

**Description:** Lists vendors with filtering options

**Query Parameters:**
- `businessType`: Filter by business type (optional)
- `city`: Filter by city (optional)
- `state`: Filter by state (optional)
- `zipCode`: Filter by zip code (optional)
- `services`: Filter by service offered (optional, comma-separated)
- `query`: Search term for vendor name (optional)
- `rating`: Minimum rating (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `sort`: Sort field (default: "rating")
- `order`: Sort order (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "businessName": "Happy Paws Grooming",
      "businessType": "GROOMING",
      "status": "ACTIVE",
      "address": {
        "city": "San Francisco",
        "state": "CA"
      },
      "rating": 4.8,
      "reviewCount": 156,
      "distance": 2.3,
      "profileImage": "https://storage.petpro.com/vendors/1001/profile.jpg"
    },
    // More vendors...
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Vendor Services

#### 1. List Vendor Services

**Endpoint:** `GET /api/v1/vendors/:id/services`

**Description:** Lists services offered by a vendor

**Path Parameters:**
- `id`: Vendor ID

**Query Parameters:**
- `category`: Filter by service category (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5001,
      "name": "Full Dog Grooming",
      "description": "Complete grooming service including bath, haircut, nail trimming, and ear cleaning",
      "price": 50.00,
      "duration": 60,
      "category": "Grooming",
      "imageUrl": "https://storage.petpro.com/services/5001.jpg",
      "isActive": true
    },
    {
      "id": 5002,
      "name": "Bath Only",
      "description": "Basic bath service with shampoo and conditioner",
      "price": 30.00,
      "duration": 30,
      "category": "Bathing",
      "imageUrl": "https://storage.petpro.com/services/5002.jpg",
      "isActive": true
    }
    // More services...
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist

#### 2. Add Vendor Service

**Endpoint:** `POST /api/v1/vendors/:id/services`

**Description:** Adds a new service for a vendor

**Path Parameters:**
- `id`: Vendor ID

**Request Body:**
```json
{
  "name": "Premium Cat Grooming",
  "description": "Specialized grooming service for cats of all breeds",
  "price": 65.00,
  "duration": 75,
  "category": "Grooming",
  "petTypes": ["CAT"],
  "image": "base64-encoded-image-data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5003,
    "name": "Premium Cat Grooming",
    "description": "Specialized grooming service for cats of all breeds",
    "price": 65.00,
    "duration": 75,
    "category": "Grooming",
    "petTypes": ["CAT"],
    "imageUrl": "https://storage.petpro.com/services/5003.jpg",
    "isActive": true,
    "createdAt": "2025-08-15T20:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `UNAUTHORIZED`: User does not have permission to add services for this vendor
- `INVALID_CATEGORY`: Service category is invalid
- `INVALID_PRICE`: Price must be greater than 0
- `INVALID_DURATION`: Duration must be greater than 0

#### 3. Update Vendor Service

**Endpoint:** `PUT /api/v1/vendors/:vendorId/services/:serviceId`

**Description:** Updates an existing vendor service

**Path Parameters:**
- `vendorId`: Vendor ID
- `serviceId`: Service ID

**Request Body:**
```json
{
  "name": "Deluxe Cat Grooming",
  "description": "Premium grooming service for cats with special needs",
  "price": 75.00,
  "duration": 90,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5003,
    "name": "Deluxe Cat Grooming",
    "description": "Premium grooming service for cats with special needs",
    "price": 75.00,
    "duration": 90,
    "category": "Grooming",
    "petTypes": ["CAT"],
    "imageUrl": "https://storage.petpro.com/services/5003.jpg",
    "isActive": true,
    "updatedAt": "2025-08-15T20:20:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `SERVICE_NOT_FOUND`: Service ID does not exist
- `UNAUTHORIZED`: User does not have permission to update this service

#### 4. Delete Vendor Service

**Endpoint:** `DELETE /api/v1/vendors/:vendorId/services/:serviceId`

**Description:** Deletes a vendor service

**Path Parameters:**
- `vendorId`: Vendor ID
- `serviceId`: Service ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5003,
    "deletedAt": "2025-08-15T20:25:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `SERVICE_NOT_FOUND`: Service ID does not exist
- `UNAUTHORIZED`: User does not have permission to delete this service
- `SERVICE_HAS_BOOKINGS`: Service cannot be deleted because it has active bookings

### Business Hours

#### 1. Get Business Hours

**Endpoint:** `GET /api/v1/vendors/:id/hours`

**Description:** Gets the business hours for a vendor

**Path Parameters:**
- `id`: Vendor ID

**Response:**
```json
{
  "success": true,
  "data": {
    "regularHours": [
      {
        "id": 2001,
        "dayOfWeek": 1,
        "openTime": "09:00",
        "closeTime": "18:00",
        "isClosed": false
      },
      {
        "id": 2002,
        "dayOfWeek": 2,
        "openTime": "09:00",
        "closeTime": "18:00",
        "isClosed": false
      }
      // Additional days...
    ],
    "specialHours": [
      {
        "id": 3001,
        "date": "2025-12-25",
        "openTime": null,
        "closeTime": null,
        "isClosed": true,
        "note": "Christmas Day"
      }
    ]
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist

#### 2. Update Business Hours

**Endpoint:** `PUT /api/v1/vendors/:id/hours`

**Description:** Updates the business hours for a vendor

**Path Parameters:**
- `id`: Vendor ID

**Request Body:**
```json
{
  "regularHours": [
    {
      "dayOfWeek": 1,
      "openTime": "08:00",
      "closeTime": "17:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 2,
      "openTime": "08:00",
      "closeTime": "17:00",
      "isClosed": false
    }
    // Additional days...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "regularHours": [
      {
        "id": 2001,
        "dayOfWeek": 1,
        "openTime": "08:00",
        "closeTime": "17:00",
        "isClosed": false
      },
      {
        "id": 2002,
        "dayOfWeek": 2,
        "openTime": "08:00",
        "closeTime": "17:00",
        "isClosed": false
      }
      // Additional days...
    ],
    "updatedAt": "2025-08-15T20:30:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `UNAUTHORIZED`: User does not have permission to update these hours
- `INVALID_HOURS_FORMAT`: The hours format is invalid

#### 3. Add Special Hours

**Endpoint:** `POST /api/v1/vendors/:id/hours/special`

**Description:** Adds special hours for specific dates

**Path Parameters:**
- `id`: Vendor ID

**Request Body:**
```json
{
  "specialHours": [
    {
      "date": "2025-12-25",
      "isClosed": true,
      "note": "Christmas Day"
    },
    {
      "date": "2025-12-31",
      "openTime": "09:00",
      "closeTime": "15:00",
      "note": "New Year's Eve"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "specialHours": [
      {
        "id": 3001,
        "date": "2025-12-25",
        "openTime": null,
        "closeTime": null,
        "isClosed": true,
        "note": "Christmas Day"
      },
      {
        "id": 3002,
        "date": "2025-12-31",
        "openTime": "09:00",
        "closeTime": "15:00",
        "isClosed": false,
        "note": "New Year's Eve"
      }
    ],
    "createdAt": "2025-08-15T20:35:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `VENDOR_NOT_FOUND`: Vendor ID does not exist
- `UNAUTHORIZED`: User does not have permission to add special hours
- `INVALID_DATE_FORMAT`: The date format is invalid
- `PAST_DATE`: Cannot set special hours for past dates

## TCP Message Patterns (Internal Communication)

The following message patterns are used for internal microservice communication and are not directly exposed to clients.

### 1. Get Vendor

**Pattern:** `{ cmd: 'get-vendor' }`

**Payload:**
```json
{
  "id": 1001
}
```

**Response:**
```json
{
  "id": 1001,
  "businessName": "Happy Paws Grooming",
  "businessType": "GROOMING",
  "status": "ACTIVE",
  "email": "contact@happypaws.com",
  "phone": "+1234567890",
  "website": "https://happypaws.com",
  "description": "Professional pet grooming services",
  "profileImage": "https://storage.petpro.com/vendors/1001/profile.jpg",
  "address": {
    "id": 5001,
    "street": "123 Pet Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "createdAt": "2025-08-15T19:15:30Z",
  "updatedAt": "2025-08-15T19:15:30Z"
}
```

### 2. Get Vendor Service

**Pattern:** `{ cmd: 'get-vendor-service' }`

**Payload:**
```json
{
  "id": 5001
}
```

**Response:**
```json
{
  "id": 5001,
  "vendorId": 1001,
  "name": "Full Dog Grooming",
  "description": "Complete grooming service including bath, haircut, nail trimming, and ear cleaning",
  "price": 50.00,
  "duration": 60,
  "category": "Grooming",
  "petTypes": ["DOG"],
  "imageUrl": "https://storage.petpro.com/services/5001.jpg",
  "isActive": true,
  "createdAt": "2025-08-15T19:15:30Z",
  "updatedAt": "2025-08-15T19:15:30Z"
}
```

### 3. Check Vendor Availability

**Pattern:** `{ cmd: 'check-vendor-availability' }`

**Payload:**
```json
{
  "vendorId": 1001,
  "serviceId": 5001,
  "date": "2025-08-20"
}
```

**Response:**
```json
{
  "vendorId": 1001,
  "serviceId": 5001,
  "date": "2025-08-20",
  "isOpen": true,
  "regularHours": {
    "openTime": "09:00",
    "closeTime": "18:00"
  },
  "specialHours": null,
  "bookingSlots": [
    {
      "startTime": "2025-08-20T09:00:00Z",
      "endTime": "2025-08-20T10:00:00Z",
      "isAvailable": true,
      "currentBookings": 0,
      "maxBookings": 2
    },
    {
      "startTime": "2025-08-20T10:00:00Z",
      "endTime": "2025-08-20T11:00:00Z",
      "isAvailable": true,
      "currentBookings": 1,
      "maxBookings": 2
    },
    // More slots...
  ]
}
```

## Events Emitted

The vendor service emits the following events that other services can subscribe to:

### 1. Vendor Created

**Event:** `vendor.created`

**Payload:**
```json
{
  "id": 1001,
  "businessName": "Happy Paws Grooming",
  "businessType": "GROOMING",
  "status": "PENDING_APPROVAL",
  "createdAt": "2025-08-15T19:15:30Z"
}
```

### 2. Vendor Status Changed

**Event:** `vendor.status-changed`

**Payload:**
```json
{
  "id": 1001,
  "previousStatus": "PENDING_APPROVAL",
  "newStatus": "ACTIVE",
  "updatedAt": "2025-08-15T20:10:45Z",
  "updatedBy": {
    "id": 234,
    "role": "ADMIN"
  }
}
```

### 3. Vendor Service Created

**Event:** `vendor.service-created`

**Payload:**
```json
{
  "id": 5003,
  "vendorId": 1001,
  "name": "Premium Cat Grooming",
  "price": 65.00,
  "duration": 75,
  "category": "Grooming",
  "isActive": true,
  "createdAt": "2025-08-15T20:15:30Z"
}
```

## Data Models

### Vendor

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| userId | number | ID of the associated user account |
| businessName | string | Name of the business |
| businessType | enum | Type of business (VETERINARY, GROOMING, BOARDING, etc.) |
| email | string | Business email |
| phone | string | Business phone number |
| website | string | Business website URL |
| description | string | Business description |
| profileImage | string | URL to profile image |
| coverImage | string | URL to cover image |
| taxId | string | Business tax ID |
| status | enum | PENDING_APPROVAL, ACTIVE, SUSPENDED, INACTIVE |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

### Vendor Address

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| vendorId | number | ID of the vendor |
| street | string | Street address |
| city | string | City |
| state | string | State/province |
| zipCode | string | ZIP/postal code |
| country | string | Country |
| latitude | decimal | Latitude coordinate |
| longitude | decimal | Longitude coordinate |

### Vendor Service

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| vendorId | number | ID of the vendor |
| name | string | Service name |
| description | string | Service description |
| price | decimal | Service price |
| duration | number | Service duration in minutes |
| category | string | Service category |
| petTypes | array | Types of pets this service is for |
| imageUrl | string | URL to service image |
| isActive | boolean | Whether the service is currently active |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

### Business Hours

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| vendorId | number | ID of the vendor |
| dayOfWeek | enum | Day of week (0-6, 0 being Sunday) |
| openTime | time | Opening time (24h format) |
| closeTime | time | Closing time (24h format) |
| isClosed | boolean | Whether the business is closed on this day |

### Special Hours

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| vendorId | number | ID of the vendor |
| date | date | Specific date |
| openTime | time | Opening time (24h format), null if closed |
| closeTime | time | Closing time (24h format), null if closed |
| isClosed | boolean | Whether the business is closed on this date |
| note | string | Note explaining the special hours |
