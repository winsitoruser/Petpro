# PetPro Vendor Dashboard - Promotions Management API Mapping

This document maps the Promotions Management wireframes to their corresponding API endpoints.

## Promotions Overview Screen

**Wireframe Reference**: [Vendor Promotions Management - Overview](/docs/ui-ux-guidelines/vendor-promotions-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/promotions/summary
```

**Response Example**:

```json
{
  "data": {
    "activePromotions": 8,
    "scheduledPromotions": 3,
    "expiredPromotions": 24,
    "currentRevenueImpact": {
      "discountAmount": 2345.75,
      "additionalRevenue": 8750.50,
      "netImpact": 6404.75,
      "currency": "USD",
      "period": "last30days"
    },
    "activeHighlights": [
      {
        "id": "prm-12345",
        "name": "Summer Pet Sale",
        "type": "discount",
        "discountType": "percentage",
        "discountValue": 15,
        "redemptionCount": 145,
        "startDate": "2025-08-01T00:00:00Z",
        "endDate": "2025-08-31T23:59:59Z"
      },
      {
        "id": "prm-12346",
        "name": "Free Shipping over $50",
        "type": "free_shipping",
        "threshold": 50,
        "redemptionCount": 87,
        "startDate": "2025-07-15T00:00:00Z",
        "endDate": "2025-08-15T23:59:59Z"
      }
    ],
    "upcomingPromotions": [
      {
        "id": "prm-12347",
        "name": "Back to School Pet Care",
        "type": "bundle",
        "startDate": "2025-08-20T00:00:00Z",
        "endDate": "2025-09-10T23:59:59Z"
      }
    ]
  }
}
```

## Promotions List Screen

**Wireframe Reference**: [Vendor Promotions Management - Promotions List](/docs/ui-ux-guidelines/vendor-promotions-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/promotions
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by promotion status (active, scheduled, expired)
- `type`: Filter by promotion type (discount, bogo, free_shipping, etc.)
- `sortBy`: Field to sort by (default: startDate)
- `sortDirection`: Sort direction (asc/desc, default: desc)
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end
- `search`: Search by promotion name or code

**Response Example**:

```json
{
  "data": [
    {
      "id": "prm-12345",
      "name": "Summer Pet Sale",
      "code": "SUMMER25",
      "type": "discount",
      "discountType": "percentage",
      "discountValue": 15,
      "status": "active",
      "startDate": "2025-08-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z",
      "redemptionCount": 145,
      "totalDiscountAmount": 1875.25,
      "totalOrdersValue": 12501.75
    },
    {
      "id": "prm-12346",
      "name": "Free Shipping over $50",
      "code": "FREESHIP50",
      "type": "free_shipping",
      "threshold": 50,
      "status": "active",
      "startDate": "2025-07-15T00:00:00Z",
      "endDate": "2025-08-15T23:59:59Z",
      "redemptionCount": 87,
      "totalDiscountAmount": 470.50,
      "totalOrdersValue": 6587.25
    },
    {
      "id": "prm-12347",
      "name": "Back to School Pet Care",
      "code": "SCHOOL15",
      "type": "bundle",
      "discountType": "percentage",
      "discountValue": 15,
      "status": "scheduled",
      "startDate": "2025-08-20T00:00:00Z",
      "endDate": "2025-09-10T23:59:59Z",
      "redemptionCount": 0,
      "totalDiscountAmount": 0,
      "totalOrdersValue": 0
    }
  ],
  "meta": {
    "pagination": {
      "total": 35,
      "count": 20,
      "per_page": 20,
      "current_page": 1,
      "total_pages": 2
    }
  }
}
```

## Promotion Detail Screen

**Wireframe Reference**: [Vendor Promotions Management - Promotion Detail](/docs/ui-ux-guidelines/vendor-promotions-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/promotions/{promotionId}
```

**Response Example**:

```json
{
  "data": {
    "id": "prm-12345",
    "name": "Summer Pet Sale",
    "description": "15% off all summer pet products including cooling mats, outdoor toys, and travel accessories.",
    "code": "SUMMER25",
    "type": "discount",
    "discountType": "percentage",
    "discountValue": 15,
    "status": "active",
    "createdAt": "2025-07-15T10:00:00Z",
    "updatedAt": "2025-07-15T10:30:00Z",
    "startDate": "2025-08-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "minimumPurchase": 25,
    "maximumDiscount": 100,
    "isPublic": true,
    "allowCombination": false,
    "redemptionLimit": {
      "total": 500,
      "perCustomer": 2,
      "remaining": 355
    },
    "eligibility": {
      "customerGroups": ["all"],
      "firstTimeOnly": false,
      "newCustomersOnly": false
    },
    "conditions": {
      "products": [
        {
          "id": "prod-23456",
          "name": "Pet Cooling Mat - Large",
          "sku": "PCM-LRG-001"
        },
        {
          "id": "prod-23457",
          "name": "Pet Cooling Mat - Medium",
          "sku": "PCM-MED-001"
        }
      ],
      "categories": [
        {
          "id": "cat-12345",
          "name": "Summer Pet Products"
        },
        {
          "id": "cat-12346",
          "name": "Travel Accessories"
        }
      ],
      "productExclusions": [],
      "categoryExclusions": []
    },
    "performance": {
      "redemptionCount": 145,
      "totalDiscountAmount": 1875.25,
      "totalOrdersValue": 12501.75,
      "averageOrderValue": 86.22,
      "conversionRate": 3.8
    },
    "marketingAssets": {
      "banners": [
        {
          "id": "img-12345",
          "url": "https://storage.petpro.com/promotions/summer-sale-banner.jpg",
          "width": 1200,
          "height": 300,
          "type": "web_banner"
        },
        {
          "id": "img-12346",
          "url": "https://storage.petpro.com/promotions/summer-sale-mobile.jpg",
          "width": 600,
          "height": 400,
          "type": "mobile_banner"
        }
      ],
      "emailTemplate": {
        "id": "emt-12345",
        "name": "Summer Sale Announcement",
        "previewUrl": "https://storage.petpro.com/promotions/summer-sale-email.jpg"
      }
    }
  }
}
```

## Create/Edit Promotion Screen

**Wireframe Reference**: [Vendor Promotions Management - Create/Edit Promotion](/docs/ui-ux-guidelines/vendor-promotions-management.md)

**API Endpoints**:

```
POST /vendors/{vendorId}/promotions
```

**Request Example**:

```json
{
  "name": "Fall Pet Health Sale",
  "description": "20% off all health supplements and vitamins for pets",
  "code": "PETFALL20",
  "type": "discount",
  "discountType": "percentage",
  "discountValue": 20,
  "startDate": "2025-09-15T00:00:00Z",
  "endDate": "2025-10-15T23:59:59Z",
  "minimumPurchase": 30,
  "maximumDiscount": 75,
  "isPublic": true,
  "allowCombination": false,
  "redemptionLimit": {
    "total": 400,
    "perCustomer": 1
  },
  "eligibility": {
    "customerGroups": ["all"],
    "firstTimeOnly": false,
    "newCustomersOnly": false
  },
  "conditions": {
    "products": [],
    "categories": [
      {
        "id": "cat-34567",
        "name": "Pet Health Supplements"
      },
      {
        "id": "cat-34568",
        "name": "Pet Vitamins"
      }
    ],
    "productExclusions": [],
    "categoryExclusions": []
  },
  "marketingAssets": {
    "banners": [
      {
        "id": "img-23456",
        "url": "https://storage.petpro.com/promotions/fall-health-banner.jpg"
      }
    ]
  }
}
```

**Response Example**:

```json
{
  "data": {
    "id": "prm-23456",
    "name": "Fall Pet Health Sale",
    "description": "20% off all health supplements and vitamins for pets",
    "code": "PETFALL20",
    "type": "discount",
    "discountType": "percentage",
    "discountValue": 20,
    "status": "scheduled",
    "createdAt": "2025-08-11T13:30:00Z",
    "startDate": "2025-09-15T00:00:00Z",
    "endDate": "2025-10-15T23:59:59Z",
    "minimumPurchase": 30,
    "maximumDiscount": 75,
    "isPublic": true,
    "allowCombination": false,
    "redemptionLimit": {
      "total": 400,
      "perCustomer": 1,
      "remaining": 400
    },
    "eligibility": {
      "customerGroups": ["all"],
      "firstTimeOnly": false,
      "newCustomersOnly": false
    },
    "conditions": {
      "products": [],
      "categories": [
        {
          "id": "cat-34567",
          "name": "Pet Health Supplements"
        },
        {
          "id": "cat-34568",
          "name": "Pet Vitamins"
        }
      ],
      "productExclusions": [],
      "categoryExclusions": []
    },
    "marketingAssets": {
      "banners": [
        {
          "id": "img-23456",
          "url": "https://storage.petpro.com/promotions/fall-health-banner.jpg"
        }
      ]
    }
  }
}
```

## Update Promotion

**API Endpoints**:

```
PUT /vendors/{vendorId}/promotions/{promotionId}
```

**Request Example**:

```json
{
  "name": "Fall Pet Health Sale",
  "description": "25% off all health supplements and vitamins for pets",
  "discountValue": 25,
  "endDate": "2025-10-30T23:59:59Z"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "prm-23456",
    "name": "Fall Pet Health Sale",
    "description": "25% off all health supplements and vitamins for pets",
    "code": "PETFALL20",
    "type": "discount",
    "discountType": "percentage",
    "discountValue": 25,
    "status": "scheduled",
    "updatedAt": "2025-08-11T14:00:00Z",
    "startDate": "2025-09-15T00:00:00Z",
    "endDate": "2025-10-30T23:59:59Z",
    "minimumPurchase": 30,
    "maximumDiscount": 75
  }
}
```

## Activate/Deactivate Promotion

**API Endpoints**:

```
PATCH /vendors/{vendorId}/promotions/{promotionId}/status
```

**Request Example**:

```json
{
  "status": "inactive",
  "reason": "Product inventory issues"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "prm-12345",
    "name": "Summer Pet Sale",
    "status": "inactive",
    "previousStatus": "active",
    "statusChangedAt": "2025-08-11T14:15:00Z",
    "statusChangeReason": "Product inventory issues"
  }
}
```

## Delete Promotion

**API Endpoints**:

```
DELETE /vendors/{vendorId}/promotions/{promotionId}
```

**Response Example**:

```json
{
  "data": {
    "message": "Promotion successfully deleted",
    "id": "prm-23456"
  }
}
```

## Promotion Performance Analytics

**Wireframe Reference**: [Vendor Promotions Management - Performance](/docs/ui-ux-guidelines/vendor-promotions-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/promotions/{promotionId}/analytics
```

**Query Parameters**:
- `granularity`: Data granularity (day, week, month)
- `startDate`: Custom start date
- `endDate`: Custom end date

**Response Example**:

```json
{
  "data": {
    "overview": {
      "redemptionCount": 145,
      "totalDiscountAmount": 1875.25,
      "totalOrdersValue": 12501.75,
      "averageOrderValue": 86.22,
      "conversionRate": 3.8,
      "viewCount": 3800,
      "addToCartCount": 210
    },
    "timeSeries": {
      "granularity": "day",
      "data": [
        {
          "date": "2025-08-01",
          "redemptionCount": 12,
          "discountAmount": 156.75,
          "ordersValue": 1045.00
        },
        {
          "date": "2025-08-02",
          "redemptionCount": 15,
          "discountAmount": 195.90,
          "ordersValue": 1306.00
        }
      ]
    },
    "customerSegments": {
      "newCustomers": {
        "count": 52,
        "percentage": 35.9,
        "totalSpend": 4250.60
      },
      "returning": {
        "count": 93,
        "percentage": 64.1,
        "totalSpend": 8251.15
      }
    },
    "popularProducts": [
      {
        "id": "prod-23456",
        "name": "Pet Cooling Mat - Large",
        "sku": "PCM-LRG-001",
        "quantitySold": 35,
        "revenue": 1749.95
      },
      {
        "id": "prod-34567",
        "name": "Portable Pet Water Bottle",
        "sku": "PWB-001",
        "quantitySold": 28,
        "revenue": 419.72
      }
    ]
  }
}
```

## Get Available Promotion Templates

**API Endpoints**:

```
GET /vendors/{vendorId}/promotion-templates
```

**Response Example**:

```json
{
  "data": [
    {
      "id": "prt-12345",
      "name": "Seasonal Discount",
      "type": "discount",
      "discountType": "percentage",
      "discountValue": 15,
      "durationDays": 30,
      "minimumPurchase": 25,
      "description": "Template for seasonal promotions with percentage discount"
    },
    {
      "id": "prt-12346",
      "name": "Buy One Get One",
      "type": "bogo",
      "description": "Buy one item, get another item at 50% off"
    }
  ]
}
```

## Create Marketing Email for Promotion

**API Endpoints**:

```
POST /vendors/{vendorId}/promotions/{promotionId}/marketing-email
```

**Request Example**:

```json
{
  "subject": "Summer Sale: 15% Off Pet Cooling Products",
  "templateId": "emt-12345",
  "scheduledSendTime": "2025-08-12T09:00:00Z",
  "audienceSegment": "summer_buyers",
  "personalizedFields": {
    "headerImage": "https://storage.petpro.com/promotions/summer-sale-email-header.jpg",
    "primaryCta": {
      "text": "Shop Now",
      "url": "https://petpro.com/summer-sale"
    }
  }
}
```

**Response Example**:

```json
{
  "data": {
    "id": "eml-23456",
    "promotionId": "prm-12345",
    "subject": "Summer Sale: 15% Off Pet Cooling Products",
    "templateId": "emt-12345",
    "status": "scheduled",
    "scheduledSendTime": "2025-08-12T09:00:00Z",
    "audienceSegment": "summer_buyers",
    "estimatedRecipients": 1450,
    "previewUrl": "https://email.petpro.com/preview/eml-23456"
  }
}
```
