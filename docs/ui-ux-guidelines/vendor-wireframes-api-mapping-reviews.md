# PetPro Vendor Dashboard - Reviews Management API Mapping

This document maps the Reviews Management wireframes to their corresponding API endpoints.

## Reviews Overview Screen

**Wireframe Reference**: [Vendor Reviews Management - Overview](/docs/ui-ux-guidelines/vendor-reviews-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/reviews/summary
```

**Response Example**:

```json
{
  "data": {
    "totalReviews": 245,
    "averageRating": 4.3,
    "ratingDistribution": {
      "5": 125,
      "4": 85,
      "3": 25,
      "2": 8,
      "1": 2
    },
    "responseRate": 92,
    "unrespondedCount": 5,
    "recentTrend": {
      "currentPeriodAvg": 4.4,
      "previousPeriodAvg": 4.2,
      "change": 0.2
    },
    "topKeywords": [
      {
        "word": "quality",
        "count": 78
      },
      {
        "word": "service",
        "count": 65
      },
      {
        "word": "friendly",
        "count": 52
      }
    ],
    "recentReviews": [
      {
        "id": "rev-12345",
        "customerId": "cus-23456",
        "customerName": "John D.",
        "rating": 5,
        "title": "Excellent service!",
        "content": "The staff was very friendly and my dog loved the grooming experience.",
        "createdAt": "2025-08-10T15:30:00Z",
        "productId": null,
        "serviceId": "srv-34567",
        "serviceName": "Dog Grooming",
        "hasResponse": false,
        "hasPhotos": false
      },
      {
        "id": "rev-12346",
        "customerId": "cus-34567",
        "customerName": "Sarah M.",
        "rating": 4,
        "title": "Great product",
        "content": "My cat loves this food. Shipping was a bit slow though.",
        "createdAt": "2025-08-09T12:45:00Z",
        "productId": "prod-45678",
        "productName": "Premium Cat Food",
        "hasResponse": true,
        "hasPhotos": true
      }
    ]
  }
}
```

## Reviews List Screen

**Wireframe Reference**: [Vendor Reviews Management - Reviews List](/docs/ui-ux-guidelines/vendor-reviews-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/reviews
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by (default: createdAt)
- `sortDirection`: Sort direction (asc/desc, default: desc)
- `minRating`: Minimum rating filter (1-5)
- `maxRating`: Maximum rating filter (1-5)
- `hasResponse`: Filter by response status (true/false)
- `productId`: Filter by product ID
- `serviceId`: Filter by service ID
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end
- `search`: Search by review content or customer name

**Response Example**:

```json
{
  "data": [
    {
      "id": "rev-12345",
      "customerId": "cus-23456",
      "customerName": "John D.",
      "customerAvatar": "https://storage.petpro.com/avatars/johnd.jpg",
      "rating": 5,
      "title": "Excellent service!",
      "content": "The staff was very friendly and my dog loved the grooming experience.",
      "createdAt": "2025-08-10T15:30:00Z",
      "productId": null,
      "serviceId": "srv-34567",
      "serviceName": "Dog Grooming",
      "photos": [],
      "hasResponse": false,
      "response": null,
      "verified": true,
      "helpful": 3,
      "reported": false
    },
    {
      "id": "rev-12346",
      "customerId": "cus-34567",
      "customerName": "Sarah M.",
      "customerAvatar": "https://storage.petpro.com/avatars/sarahm.jpg",
      "rating": 4,
      "title": "Great product",
      "content": "My cat loves this food. Shipping was a bit slow though.",
      "createdAt": "2025-08-09T12:45:00Z",
      "productId": "prod-45678",
      "productName": "Premium Cat Food",
      "photos": [
        {
          "id": "pht-56789",
          "url": "https://storage.petpro.com/reviews/rev-12346-1.jpg"
        }
      ],
      "hasResponse": true,
      "response": {
        "content": "Thank you for your feedback, Sarah! We're glad your cat enjoys our food. We're working on improving our shipping times and appreciate your patience.",
        "createdAt": "2025-08-09T14:20:00Z",
        "respondedBy": {
          "id": "usr-45678",
          "name": "Store Manager"
        }
      },
      "verified": true,
      "helpful": 5,
      "reported": false
    }
  ],
  "meta": {
    "pagination": {
      "total": 245,
      "count": 20,
      "per_page": 20,
      "current_page": 1,
      "total_pages": 13
    }
  }
}
```

## Review Detail Screen

**Wireframe Reference**: [Vendor Reviews Management - Review Detail](/docs/ui-ux-guidelines/vendor-reviews-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/reviews/{reviewId}
```

**Response Example**:

```json
{
  "data": {
    "id": "rev-12346",
    "customerId": "cus-34567",
    "customerName": "Sarah M.",
    "customerAvatar": "https://storage.petpro.com/avatars/sarahm.jpg",
    "customerInfo": {
      "joinDate": "2024-05-12T00:00:00Z",
      "reviewCount": 8,
      "averageRating": 4.2,
      "verificationStatus": "verified",
      "purchaseCount": 12
    },
    "rating": 4,
    "title": "Great product",
    "content": "My cat loves this food. Shipping was a bit slow though.",
    "createdAt": "2025-08-09T12:45:00Z",
    "updatedAt": null,
    "productId": "prod-45678",
    "productName": "Premium Cat Food",
    "productSku": "PCF-001",
    "orderId": "ord-56789",
    "orderDate": "2025-08-05T10:30:00Z",
    "photos": [
      {
        "id": "pht-56789",
        "url": "https://storage.petpro.com/reviews/rev-12346-1.jpg",
        "thumbnail": "https://storage.petpro.com/reviews/thumbnails/rev-12346-1.jpg"
      }
    ],
    "hasResponse": true,
    "response": {
      "content": "Thank you for your feedback, Sarah! We're glad your cat enjoys our food. We're working on improving our shipping times and appreciate your patience.",
      "createdAt": "2025-08-09T14:20:00Z",
      "updatedAt": null,
      "respondedBy": {
        "id": "usr-45678",
        "name": "Store Manager"
      }
    },
    "verified": true,
    "verificationMethod": "verified_purchase",
    "helpful": 5,
    "reported": false,
    "reportCount": 0,
    "visibility": "public"
  }
}
```

## Respond to Review

**Wireframe Reference**: [Vendor Reviews Management - Respond to Review](/docs/ui-ux-guidelines/vendor-reviews-management.md)

**API Endpoints**:

```
POST /vendors/{vendorId}/reviews/{reviewId}/responses
```

**Request Example**:

```json
{
  "content": "Thank you for your wonderful feedback, John! We're delighted to hear that you and your dog had a positive experience with our grooming service. We look forward to seeing you again soon!"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "res-67890",
    "reviewId": "rev-12345",
    "content": "Thank you for your wonderful feedback, John! We're delighted to hear that you and your dog had a positive experience with our grooming service. We look forward to seeing you again soon!",
    "createdAt": "2025-08-11T09:45:00Z",
    "respondedBy": {
      "id": "usr-45678",
      "name": "Store Manager"
    }
  }
}
```

## Update Review Response

**API Endpoints**:

```
PUT /vendors/{vendorId}/reviews/{reviewId}/responses/{responseId}
```

**Request Example**:

```json
{
  "content": "Thank you for your wonderful feedback, John! We're delighted to hear that you and your dog had a positive experience with our grooming service. We've noted your suggestions for improvement and are working on them. We look forward to seeing you again soon!"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "res-67890",
    "reviewId": "rev-12345",
    "content": "Thank you for your wonderful feedback, John! We're delighted to hear that you and your dog had a positive experience with our grooming service. We've noted your suggestions for improvement and are working on them. We look forward to seeing you again soon!",
    "createdAt": "2025-08-11T09:45:00Z",
    "updatedAt": "2025-08-11T10:30:00Z",
    "respondedBy": {
      "id": "usr-45678",
      "name": "Store Manager"
    }
  }
}
```

## Delete Review Response

**API Endpoints**:

```
DELETE /vendors/{vendorId}/reviews/{reviewId}/responses/{responseId}
```

**Response Example**:

```json
{
  "data": {
    "message": "Response successfully deleted",
    "reviewId": "rev-12345",
    "responseId": "res-67890"
  }
}
```

## Flag Review as Inappropriate

**API Endpoints**:

```
POST /vendors/{vendorId}/reviews/{reviewId}/flag
```

**Request Example**:

```json
{
  "reason": "offensive_content",
  "details": "This review contains inappropriate language"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "flg-78901",
    "reviewId": "rev-12347",
    "reason": "offensive_content",
    "details": "This review contains inappropriate language",
    "status": "under_review",
    "createdAt": "2025-08-11T11:15:00Z",
    "vendorId": "ven-12345"
  }
}
```

## Get Review Templates

**API Endpoints**:

```
GET /vendors/{vendorId}/review-templates
```

**Response Example**:

```json
{
  "data": [
    {
      "id": "tpl-12345",
      "name": "Positive Product Review Response",
      "content": "Thank you for your positive feedback about [Product]! We're delighted to hear that you're enjoying it. Your satisfaction is our top priority, and we appreciate you taking the time to share your experience.",
      "category": "product_positive",
      "createdAt": "2025-07-15T10:00:00Z"
    },
    {
      "id": "tpl-12346",
      "name": "Service Issue Apology",
      "content": "We sincerely apologize for the inconvenience you experienced with our [Service]. Your feedback is important to us, and we're taking immediate steps to address these issues. Please contact our customer service team at support@example.com so we can make this right for you.",
      "category": "service_negative",
      "createdAt": "2025-07-15T10:05:00Z"
    }
  ]
}
```

## Create Review Template

**API Endpoints**:

```
POST /vendors/{vendorId}/review-templates
```

**Request Example**:

```json
{
  "name": "Shipping Delay Apology",
  "content": "We apologize for the delay in shipping your order. We understand how important timely delivery is and are working to improve our logistics. Thank you for your patience and for bringing this to our attention.",
  "category": "shipping_issue"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "tpl-12347",
    "name": "Shipping Delay Apology",
    "content": "We apologize for the delay in shipping your order. We understand how important timely delivery is and are working to improve our logistics. Thank you for your patience and for bringing this to our attention.",
    "category": "shipping_issue",
    "createdAt": "2025-08-11T11:45:00Z"
  }
}
```

## Get Review Analytics

**API Endpoints**:

```
GET /vendors/{vendorId}/reviews/analytics
```

**Query Parameters**:
- `period`: Time period for statistics (week, month, quarter, year)
- `startDate`: Custom start date
- `endDate`: Custom end date

**Response Example**:

```json
{
  "data": {
    "overview": {
      "totalReviews": 245,
      "averageRating": 4.3,
      "responseRate": 92,
      "trendsData": [
        {
          "period": "2025-07",
          "averageRating": 4.2,
          "reviewCount": 58
        },
        {
          "period": "2025-08",
          "averageRating": 4.4,
          "reviewCount": 45
        }
      ]
    },
    "products": {
      "highestRated": [
        {
          "productId": "prod-12345",
          "productName": "Premium Dog Food - Large Breed",
          "averageRating": 4.8,
          "reviewCount": 24
        }
      ],
      "lowestRated": [
        {
          "productId": "prod-23456",
          "productName": "Basic Cat Collar",
          "averageRating": 3.5,
          "reviewCount": 15
        }
      ],
      "mostReviewed": [
        {
          "productId": "prod-34567",
          "productName": "Interactive Cat Toy",
          "reviewCount": 35,
          "averageRating": 4.6
        }
      ]
    },
    "services": {
      "highestRated": [
        {
          "serviceId": "srv-12345",
          "serviceName": "Dog Grooming - Full Service",
          "averageRating": 4.9,
          "reviewCount": 32
        }
      ],
      "lowestRated": [
        {
          "serviceId": "srv-23456",
          "serviceName": "Basic Check-up",
          "averageRating": 3.8,
          "reviewCount": 18
        }
      ],
      "mostReviewed": [
        {
          "serviceId": "srv-34567",
          "serviceName": "Cat Grooming",
          "reviewCount": 28,
          "averageRating": 4.5
        }
      ]
    },
    "sentiment": {
      "positive": {
        "percentage": 78,
        "keyTopics": ["quality", "service", "friendly"]
      },
      "neutral": {
        "percentage": 15,
        "keyTopics": ["price", "packaging", "delivery"]
      },
      "negative": {
        "percentage": 7,
        "keyTopics": ["shipping", "delay", "customer service"]
      }
    }
  }
}
```
