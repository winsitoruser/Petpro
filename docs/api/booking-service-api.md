# Booking Service API Documentation

## Overview

The Booking Service manages all pet service booking operations, including appointment scheduling, availability checking, and booking management. This document provides detailed API specifications for both REST endpoints and TCP message patterns.

## REST API Endpoints

All REST endpoints are accessible through the API Gateway at `/api/v1/bookings/*` and require valid authentication unless specified otherwise.

### Booking Management

#### 1. Create Booking

**Endpoint:** `POST /api/v1/bookings`

**Description:** Creates a new booking for a service at a specific time slot

**Request Body:**
```json
{
  "serviceId": 123,
  "petId": 456,
  "startTime": "2025-08-20T10:00:00Z",
  "endTime": "2025-08-20T11:00:00Z",
  "notes": "My dog needs special attention",
  "additionalServices": [
    { "id": 789, "quantity": 1 }
  ],
  "paymentMethod": "CARD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "bookingCode": "BK20250820-1001",
    "status": "PENDING",
    "service": {
      "id": 123,
      "name": "Dog Grooming",
      "price": 50.00,
      "duration": 60
    },
    "pet": {
      "id": 456,
      "name": "Max",
      "type": "Dog",
      "breed": "Golden Retriever"
    },
    "vendor": {
      "id": 789,
      "name": "Happy Paws Grooming"
    },
    "startTime": "2025-08-20T10:00:00Z",
    "endTime": "2025-08-20T11:00:00Z",
    "notes": "My dog needs special attention",
    "additionalServices": [
      { 
        "id": 789, 
        "name": "Nail Trimming",
        "price": 15.00,
        "quantity": 1 
      }
    ],
    "totalPrice": 65.00,
    "paymentStatus": "PENDING",
    "createdAt": "2025-08-15T19:15:30Z",
    "updatedAt": "2025-08-15T19:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `BOOKING_SLOT_UNAVAILABLE`: The requested time slot is no longer available
- `INVALID_SERVICE`: Service ID does not exist or is inactive
- `INVALID_PET`: Pet ID does not exist or doesn't belong to authenticated user
- `INVALID_TIME_RANGE`: The start/end times are invalid

#### 2. Get Booking Details

**Endpoint:** `GET /api/v1/bookings/:id`

**Description:** Retrieves details for a specific booking

**Path Parameters:**
- `id`: Booking ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "bookingCode": "BK20250820-1001",
    "status": "CONFIRMED",
    "service": {
      "id": 123,
      "name": "Dog Grooming",
      "price": 50.00,
      "duration": 60
    },
    "pet": {
      "id": 456,
      "name": "Max",
      "type": "Dog",
      "breed": "Golden Retriever"
    },
    "vendor": {
      "id": 789,
      "name": "Happy Paws Grooming",
      "address": "123 Pet St, San Francisco, CA"
    },
    "startTime": "2025-08-20T10:00:00Z",
    "endTime": "2025-08-20T11:00:00Z",
    "notes": "My dog needs special attention",
    "additionalServices": [
      { 
        "id": 789, 
        "name": "Nail Trimming",
        "price": 15.00,
        "quantity": 1 
      }
    ],
    "totalPrice": 65.00,
    "paymentStatus": "PAID",
    "createdAt": "2025-08-15T19:15:30Z",
    "updatedAt": "2025-08-15T19:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `BOOKING_NOT_FOUND`: Booking ID does not exist
- `UNAUTHORIZED`: User does not have access to this booking

#### 3. List Bookings

**Endpoint:** `GET /api/v1/bookings`

**Description:** Lists bookings for the authenticated user or vendor

**Query Parameters:**
- `status`: Filter by status (optional, comma-separated: PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `startDate`: Filter by start date (optional, format: YYYY-MM-DD)
- `endDate`: Filter by end date (optional, format: YYYY-MM-DD)
- `vendorId`: Filter by vendor ID (optional, admin only)
- `petId`: Filter by pet ID (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "bookingCode": "BK20250820-1001",
      "status": "CONFIRMED",
      "service": {
        "id": 123,
        "name": "Dog Grooming"
      },
      "pet": {
        "id": 456,
        "name": "Max"
      },
      "vendor": {
        "id": 789,
        "name": "Happy Paws Grooming"
      },
      "startTime": "2025-08-20T10:00:00Z",
      "endTime": "2025-08-20T11:00:00Z",
      "totalPrice": 65.00,
      "paymentStatus": "PAID"
    },
    // More bookings...
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### 4. Update Booking Status

**Endpoint:** `PUT /api/v1/bookings/:id/status`

**Description:** Updates the status of a booking (vendor or admin only)

**Path Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "We've confirmed your appointment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "CONFIRMED",
    "updatedAt": "2025-08-15T20:10:45Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `BOOKING_NOT_FOUND`: Booking ID does not exist
- `UNAUTHORIZED`: User does not have permission to update this booking
- `INVALID_STATUS_TRANSITION`: The requested status transition is not allowed

#### 5. Cancel Booking

**Endpoint:** `DELETE /api/v1/bookings/:id`

**Description:** Cancels a booking

**Path Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "reason": "Schedule conflict",
  "requestRefund": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "CANCELLED",
    "refundStatus": "PENDING",
    "cancellationReason": "Schedule conflict",
    "updatedAt": "2025-08-15T20:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `BOOKING_NOT_FOUND`: Booking ID does not exist
- `UNAUTHORIZED`: User does not have permission to cancel this booking
- `CANCELLATION_NOT_ALLOWED`: Booking cannot be cancelled (e.g., too close to appointment time)

### Service Availability

#### 1. Check Available Slots

**Endpoint:** `GET /api/v1/services/:id/slots`

**Description:** Gets available time slots for a specific service

**Path Parameters:**
- `id`: Service ID

**Query Parameters:**
- `date`: Date to check (format: YYYY-MM-DD)
- `timezone`: Client timezone (optional, default: UTC)

**Response:**
```json
{
  "success": true,
  "data": {
    "serviceId": 123,
    "serviceName": "Dog Grooming",
    "serviceDuration": 60,
    "date": "2025-08-20",
    "timeSlots": [
      {
        "startTime": "2025-08-20T09:00:00Z",
        "endTime": "2025-08-20T10:00:00Z",
        "available": true
      },
      {
        "startTime": "2025-08-20T10:00:00Z",
        "endTime": "2025-08-20T11:00:00Z",
        "available": true
      },
      {
        "startTime": "2025-08-20T11:00:00Z",
        "endTime": "2025-08-20T12:00:00Z",
        "available": false
      }
      // More time slots...
    ]
  },
  "meta": {}
}
```

## TCP Message Patterns (Internal Communication)

The following message patterns are used for internal microservice communication and are not directly exposed to clients.

### 1. Get Booking

**Pattern:** `{ cmd: 'get-booking' }`

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
  "bookingCode": "BK20250820-1001",
  "status": "CONFIRMED",
  "serviceId": 123,
  "petId": 456,
  "vendorId": 789,
  "startTime": "2025-08-20T10:00:00Z",
  "endTime": "2025-08-20T11:00:00Z",
  "notes": "My dog needs special attention",
  "additionalServices": [
    { "id": 789, "quantity": 1 }
  ],
  "totalPrice": 65.00,
  "paymentStatus": "PAID",
  "createdAt": "2025-08-15T19:15:30Z",
  "updatedAt": "2025-08-15T19:15:30Z"
}
```

### 2. Create Booking

**Pattern:** `{ cmd: 'create-booking' }`

**Payload:**
```json
{
  "serviceId": 123,
  "petId": 456,
  "userId": 789,
  "startTime": "2025-08-20T10:00:00Z",
  "endTime": "2025-08-20T11:00:00Z",
  "notes": "My dog needs special attention",
  "additionalServices": [
    { "id": 789, "quantity": 1 }
  ],
  "paymentMethod": "CARD"
}
```

**Response:**
```json
{
  "id": 1001,
  "bookingCode": "BK20250820-1001",
  "status": "PENDING",
  "serviceId": 123,
  "petId": 456,
  "userId": 789,
  "vendorId": 234,
  "startTime": "2025-08-20T10:00:00Z",
  "endTime": "2025-08-20T11:00:00Z",
  "notes": "My dog needs special attention",
  "additionalServices": [
    { "id": 789, "quantity": 1 }
  ],
  "totalPrice": 65.00,
  "paymentStatus": "PENDING",
  "createdAt": "2025-08-15T19:15:30Z",
  "updatedAt": "2025-08-15T19:15:30Z"
}
```

### 3. Check Availability

**Pattern:** `{ cmd: 'check-availability' }`

**Payload:**
```json
{
  "serviceId": 123,
  "date": "2025-08-20",
  "vendorId": 789
}
```

**Response:**
```json
{
  "serviceId": 123,
  "date": "2025-08-20",
  "vendorId": 789,
  "availableSlots": [
    {
      "startTime": "2025-08-20T09:00:00Z",
      "endTime": "2025-08-20T10:00:00Z"
    },
    {
      "startTime": "2025-08-20T10:00:00Z",
      "endTime": "2025-08-20T11:00:00Z"
    }
    // More available slots...
  ],
  "unavailableSlots": [
    {
      "startTime": "2025-08-20T11:00:00Z",
      "endTime": "2025-08-20T12:00:00Z"
    }
    // More unavailable slots...
  ]
}
```

### 4. Update Booking Status

**Pattern:** `{ cmd: 'update-booking-status' }`

**Payload:**
```json
{
  "id": 1001,
  "status": "CONFIRMED",
  "notes": "We've confirmed your appointment",
  "updatedBy": {
    "id": 234,
    "role": "VENDOR"
  }
}
```

**Response:**
```json
{
  "id": 1001,
  "status": "CONFIRMED",
  "notes": "We've confirmed your appointment",
  "updatedAt": "2025-08-15T20:10:45Z"
}
```

## Events Emitted

The booking service emits the following events that other services can subscribe to:

### 1. Booking Created

**Event:** `booking.created`

**Payload:**
```json
{
  "id": 1001,
  "bookingCode": "BK20250820-1001",
  "serviceId": 123,
  "petId": 456,
  "userId": 789,
  "vendorId": 234,
  "startTime": "2025-08-20T10:00:00Z",
  "endTime": "2025-08-20T11:00:00Z",
  "totalPrice": 65.00,
  "createdAt": "2025-08-15T19:15:30Z"
}
```

### 2. Booking Status Changed

**Event:** `booking.status-changed`

**Payload:**
```json
{
  "id": 1001,
  "previousStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "updatedAt": "2025-08-15T20:10:45Z",
  "updatedBy": {
    "id": 234,
    "role": "VENDOR"
  }
}
```

### 3. Booking Cancelled

**Event:** `booking.cancelled`

**Payload:**
```json
{
  "id": 1001,
  "previousStatus": "CONFIRMED",
  "cancellationReason": "Schedule conflict",
  "requestRefund": true,
  "cancelledAt": "2025-08-15T20:15:30Z",
  "cancelledBy": {
    "id": 789,
    "role": "USER"
  }
}
```

## Data Models

### Booking

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| bookingCode | string | Unique booking reference code |
| userId | number | ID of the user who made the booking |
| petId | number | ID of the pet for the booking |
| serviceId | number | ID of the primary service booked |
| vendorId | number | ID of the vendor providing the service |
| status | enum | PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| startTime | datetime | Start time of the booking |
| endTime | datetime | End time of the booking |
| notes | string | Customer notes for the booking |
| additionalServices | array | List of additional services requested |
| totalPrice | decimal | Total price of the booking |
| paymentStatus | enum | PENDING, PAID, REFUNDED, FAILED |
| paymentId | string | ID of the associated payment |
| cancellationReason | string | Reason for cancellation (if applicable) |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

### Service Availability

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| vendorId | number | ID of the vendor |
| serviceId | number | ID of the service |
| dayOfWeek | enum | Day of week (0-6, 0 being Sunday) |
| startTime | time | Start time (24h format) |
| endTime | time | End time (24h format) |
| isAvailable | boolean | Whether the time slot is generally available |
| maxBookings | number | Maximum concurrent bookings in this slot |

### Special Schedule

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| vendorId | number | ID of the vendor |
| serviceId | number | ID of the service (optional) |
| date | date | Specific date for special schedule |
| startTime | time | Start time (24h format) |
| endTime | time | End time (24h format) |
| isAvailable | boolean | Whether the vendor is available on this date/time |
| reason | string | Reason for special schedule (e.g., "Holiday") |
