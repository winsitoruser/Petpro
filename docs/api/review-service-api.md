# Review Service API Documentation

## Overview
The Review Service API provides endpoints for managing customer reviews for PetPro services. It allows customers to create, read, update, and delete reviews for completed bookings, and provides vendors with insights into their service performance through review metrics.

## Base URL
```
/api/reviews
```

## Authentication
Most endpoints require authentication using JWT Bearer tokens.
- Customer endpoints require the `customer` role
- Some endpoints are public and require no authentication
- The review helpful feature requires authentication but no specific role

## Endpoints

### Create Review
Creates a new review for a completed booking.

- **URL**: `/`
- **Method**: `POST`
- **Auth**: Required (Customer role)
- **Request Body**:
```json
{
  "bookingId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 5,
  "review": "Great service, my pet was well taken care of!",
  "anonymous": false
}
```
- **Success Response**: `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174123",
  "bookingId": "123e4567-e89b-12d3-a456-426614174000",
  "customerId": "123e4567-e89b-12d3-a456-426614174001",
  "vendorId": "123e4567-e89b-12d3-a456-426614174002",
  "serviceId": "123e4567-e89b-12d3-a456-426614174003",
  "rating": 5,
  "review": "Great service, my pet was well taken care of!",
  "anonymous": false,
  "helpfulCount": 0,
  "status": "published",
  "createdAt": "2025-08-15T12:00:00Z",
  "updatedAt": "2025-08-15T12:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid input or booking not eligible for review
  - `401 Unauthorized`: Authentication missing or invalid

### Update Review
Update an existing review.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth**: Required (Customer role)
- **URL Parameters**: `id=[UUID]` - ID of the review to update
- **Request Body**:
```json
{
  "rating": 4,
  "review": "Updated review content",
  "anonymous": true
}
```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `400 Bad Request`: Invalid input or review not eligible for update (72-hour limit)
  - `401 Unauthorized`: Authentication missing or invalid
  - `404 Not Found`: Review not found

### Delete Review
Delete a review.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth**: Required (Customer role)
- **URL Parameters**: `id=[UUID]` - ID of the review to delete
- **Success Response**: `200 OK`
```json
{
  "message": "Review deleted successfully"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid input or review not eligible for deletion (72-hour limit)
  - `401 Unauthorized`: Authentication missing or invalid
  - `404 Not Found`: Review not found

### Get Vendor Reviews
Get reviews for a specific vendor with sorting and filtering options.

- **URL**: `/vendor/:vendorId`
- **Method**: `GET`
- **Auth**: None (Public)
- **URL Parameters**: `vendorId=[UUID]` - ID of the vendor
- **Query Parameters**:
  - `sort=[recent|helpful|rating_high|rating_low]` - Optional, default: recent
  - `filter=[all|positive|negative|neutral]` - Optional, default: all
  - `limit=[number]` - Optional, default: 10
  - `offset=[number]` - Optional, default: 0
- **Success Response**: `200 OK`
```json
{
  "total": 25,
  "offset": 0,
  "limit": 10,
  "reviews": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174123",
      "rating": 5,
      "review": "Great service!",
      "helpfulCount": 3,
      "createdAt": "2025-08-15T12:00:00Z",
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "https://example.com/profile.jpg"
      },
      "booking": {
        "service": {
          "id": "123e4567-e89b-12d3-a456-426614174003",
          "name": "Grooming",
          "type": "grooming"
        }
      }
    },
    // More reviews...
  ]
}
```

### Get Vendor Review Summary
Get summary statistics for a vendor's reviews.

- **URL**: `/vendor/:vendorId/summary`
- **Method**: `GET`
- **Auth**: None (Public)
- **URL Parameters**: `vendorId=[UUID]` - ID of the vendor
- **Success Response**: `200 OK`
```json
{
  "averageRating": 4.7,
  "totalReviews": 25,
  "ratingDistribution": {
    "5": 18,
    "4": 5,
    "3": 1,
    "2": 1,
    "1": 0
  }
}
```

### Mark Review as Helpful
Toggle a review as helpful/not helpful.

- **URL**: `/:id/helpful`
- **Method**: `POST`
- **Auth**: Required (Any authenticated user)
- **URL Parameters**: `id=[UUID]` - ID of the review
- **Success Response**: `200 OK`
```json
{
  "message": "Review marked as helpful",
  "helpful": true,
  "helpfulCount": 4
}
```
- **Error Responses**:
  - `401 Unauthorized`: Authentication missing or invalid
  - `404 Not Found`: Review not found

### Get Customer Reviews
Get all reviews written by the authenticated customer.

- **URL**: `/my-reviews`
- **Method**: `GET`
- **Auth**: Required (Customer role)
- **Query Parameters**:
  - `limit=[number]` - Optional, default: 10
  - `offset=[number]` - Optional, default: 0
- **Success Response**: `200 OK`
```json
{
  "total": 5,
  "offset": 0,
  "limit": 10,
  "reviews": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174123",
      "rating": 5,
      "review": "Great service!",
      "helpfulCount": 3,
      "createdAt": "2025-08-15T12:00:00Z",
      "vendor": {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "firstName": "Jane",
        "lastName": "Smith",
        "businessName": "Jane's Pet Salon",
        "profileImage": "https://example.com/vendor.jpg"
      },
      "booking": {
        "service": {
          "id": "123e4567-e89b-12d3-a456-426614174003",
          "name": "Grooming",
          "type": "grooming"
        }
      }
    },
    // More reviews...
  ]
}
```

### Get Review by ID
Get a specific review by ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth**: None (Public)
- **URL Parameters**: `id=[UUID]` - ID of the review
- **Success Response**: `200 OK`
- **Error Response**: `404 Not Found` - Review not found

### Get Booking Reviews
Get all reviews for a specific booking.

- **URL**: `/booking/:bookingId`
- **Method**: `GET`
- **Auth**: None (Public)
- **URL Parameters**: `bookingId=[UUID]` - ID of the booking
- **Success Response**: `200 OK`

## Business Rules

1. Reviews can only be created for completed bookings.
2. A booking can only have one review.
3. Reviews can only be edited or deleted within 72 hours of creation.
4. Reviews can be marked as anonymous, which hides customer details.
5. The helpful feature acts as a toggle (marking a review helpful that was already marked removes the mark).
6. Vendor rating statistics are automatically updated when reviews are created, updated, or deleted.
7. Filter options for reviews:
   - `all`: All reviews
   - `positive`: 4-5 star reviews
   - `negative`: 1-2 star reviews
   - `neutral`: 3 star reviews
8. Sort options for reviews:
   - `recent`: Sort by most recent
   - `helpful`: Sort by most helpful
   - `rating_high`: Sort by highest rating
   - `rating_low`: Sort by lowest rating
