# API Endpoints Specification - PetPro Platform

This document defines the API endpoints for the MVP of the PetPro platform, organized by service domain.

## Authentication & User Management

### Auth Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (email/password) |
| POST | `/auth/otp/send` | Send OTP to phone number |
| POST | `/auth/otp/verify` | Verify OTP code |
| POST | `/auth/social` | Social auth (Google/Apple) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user (invalidate token) |
| POST | `/auth/password/reset` | Request password reset |

### User & Pet Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update user profile |
| GET | `/user/addresses` | Get user addresses |
| POST | `/user/addresses` | Add new address |
| PUT | `/user/addresses/:id` | Update address |
| DELETE | `/user/addresses/:id` | Delete address |
| GET | `/pets` | List user's pets |
| GET | `/pets/:id` | Get pet details |
| POST | `/pets` | Add new pet |
| PUT | `/pets/:id` | Update pet |
| DELETE | `/pets/:id` | Delete pet |
| POST | `/pets/:id/vaccines` | Add vaccine record |

## Clinic & Service Management

### Clinic Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clinics` | Search/list clinics |
| GET | `/clinics/:id` | Get clinic details |
| POST | `/clinics` | Register clinic (vendor) |
| PUT | `/clinics/:id` | Update clinic (vendor) |
| GET | `/clinics/:id/services` | List clinic services |
| POST | `/clinics/:id/services` | Add service (vendor) |
| PUT | `/clinics/:id/services/:id` | Update service (vendor) |
| DELETE | `/clinics/:id/services/:id` | Delete service (vendor) |
| GET | `/clinics/:id/reviews` | Get clinic reviews |
| POST | `/clinics/:id/reviews` | Add review for clinic |

### Booking Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services/:id/slots` | Get available slots |
| POST | `/bookings` | Create booking |
| GET | `/bookings` | List user/vendor bookings |
| GET | `/bookings/:id` | Get booking details |
| PUT | `/bookings/:id/status` | Update booking status (vendor) |
| DELETE | `/bookings/:id` | Cancel booking |

### Review Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Create a new review |
| PUT | `/reviews/:id` | Update an existing review |
| DELETE | `/reviews/:id` | Delete a review |
| GET | `/reviews/vendor/:vendorId` | Get vendor reviews with filtering and sorting |
| GET | `/reviews/vendor/:vendorId/summary` | Get vendor review statistics |
| POST | `/reviews/:id/helpful` | Toggle marking a review as helpful |
| GET | `/reviews/my-reviews` | Get authenticated customer's reviews |
| GET | `/reviews/:id` | Get a specific review by ID |
| GET | `/reviews/booking/:bookingId` | Get reviews for a specific booking |

## Product & Order Management

### Product Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Search/list products |
| GET | `/products/:id` | Get product details |
| POST | `/products` | Add product (vendor) |
| PUT | `/products/:id` | Update product (vendor) |
| DELETE | `/products/:id` | Delete product (vendor) |
| POST | `/products/batch` | Batch import products (vendor) |
| GET | `/products/:id/reviews` | Get product reviews |
| POST | `/products/:id/reviews` | Add product review |

### Order Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/items` | Add item to cart |
| GET | `/cart` | Get cart contents |
| PUT | `/cart/items/:id` | Update cart item |
| DELETE | `/cart/items/:id` | Remove from cart |
| POST | `/orders` | Create order from cart |
| GET | `/orders` | List user/vendor orders |
| GET | `/orders/:id` | Get order details |
| PUT | `/orders/:id/status` | Update order status (vendor) |

### Payment Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/session` | Create payment session |
| POST | `/payments/webhook` | Payment gateway webhook |
| GET | `/payments/:id` | Get payment details |
| POST | `/payments/:id/refund` | Request refund |

### Shipping Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shipping/rates` | Calculate shipping rates |
| POST | `/shipping/orders` | Create shipping order |
| GET | `/shipping/tracking/:id` | Get tracking info |

## Admin Management

### Admin Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/vendors` | List vendors |
| PUT | `/admin/vendors/:id/approve` | Approve vendor |
| PUT | `/admin/vendors/:id/reject` | Reject vendor |
| GET | `/admin/users` | List users |
| PUT | `/admin/users/:id/status` | Update user status |
| GET | `/admin/transactions` | List transactions |
| GET | `/admin/reports/sales` | Sales report |
| GET | `/admin/reports/bookings` | Bookings report |
| PUT | `/admin/settings/commissions` | Update commission settings |

### Analytics Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/customer-growth` | Get customer growth statistics by time interval |
| GET | `/analytics/customer-activity` | Get customer activity metrics by type and time period |
| GET | `/analytics/customer-demographics` | Get customer demographic insights |
| GET | `/analytics/service-usage` | Get service usage metrics and statistics |
| GET | `/analytics/customer-retention` | Get customer retention metrics and churn rates |

### Activities Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/activities` | Create activity record (admin/system only) |
| GET | `/activities/user/:userId` | Get activities by user ID |
| GET | `/activities/recent` | Get recent activities across users (admin only) |
| GET | `/activities/statistics` | Get activity statistics grouped by time interval |

## Common API Response Format

All API responses follow a standard format:

```json
{
  "success": true/false,
  "data": {}, // Response data (if success)
  "error": {  // Error details (if !success)
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Additional error details
  },
  "meta": {   // For pagination, etc.
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## Authentication

All API endpoints (except public ones like registration, login) require authentication via JWT Bearer token:

```
Authorization: Bearer <jwt_token>
```

## API Versioning

API versioning is handled via URL path:

```
/api/v1/[resource]
```

## Rate Limiting

API Gateway implements rate limiting based on client IP and authenticated user ID.
