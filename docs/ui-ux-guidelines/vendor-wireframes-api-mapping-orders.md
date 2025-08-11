# PetPro Vendor Dashboard - Order Management API Mapping

This document maps the Order Management wireframes to their corresponding API endpoints.

## Orders List Screen

**Wireframe Reference**: [Vendor Order Management - Orders List](/docs/ui-ux-guidelines/vendor-order-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/orders
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by order status
- `sortBy`: Field to sort by (default: createdAt)
- `sortDirection`: Sort direction (asc/desc, default: desc)
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end
- `search`: Search by order ID or customer name

**Response Example**:

```json
{
  "data": [
    {
      "id": "ord-12345",
      "orderNumber": "PO-2025-12345",
      "customerId": "cus-56789",
      "customerName": "John Doe",
      "orderDate": "2025-08-10T14:30:00Z",
      "status": "shipped",
      "paymentStatus": "paid",
      "totalAmount": 126.50,
      "currencyCode": "USD",
      "itemCount": 3,
      "shippingMethod": "Standard Delivery",
      "trackingNumber": "TRK123456789"
    },
    {
      "id": "ord-12344",
      "orderNumber": "PO-2025-12344",
      "customerId": "cus-98765",
      "customerName": "Jane Smith",
      "orderDate": "2025-08-09T10:15:00Z",
      "status": "processing",
      "paymentStatus": "paid",
      "totalAmount": 89.95,
      "currencyCode": "USD",
      "itemCount": 2,
      "shippingMethod": "Express Delivery",
      "trackingNumber": null
    }
  ],
  "meta": {
    "pagination": {
      "total": 156,
      "count": 10,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 16
    }
  }
}
```

## Order Detail Screen

**Wireframe Reference**: [Vendor Order Management - Order Detail](/docs/ui-ux-guidelines/vendor-order-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/orders/{orderId}
```

**Response Example**:

```json
{
  "data": {
    "id": "ord-12345",
    "orderNumber": "PO-2025-12345",
    "customerId": "cus-56789",
    "orderDate": "2025-08-10T14:30:00Z",
    "status": "shipped",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2025-08-10T14:30:00Z",
        "note": "Order placed"
      },
      {
        "status": "processing",
        "timestamp": "2025-08-10T15:45:00Z",
        "note": "Payment confirmed"
      },
      {
        "status": "shipped",
        "timestamp": "2025-08-11T09:20:00Z",
        "note": "Order shipped via Standard Delivery"
      }
    ],
    "customer": {
      "id": "cus-56789",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567"
    },
    "billingAddress": {
      "name": "John Doe",
      "street": "123 Main Street",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345",
      "country": "United States"
    },
    "shippingAddress": {
      "name": "John Doe",
      "street": "123 Main Street",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345",
      "country": "United States"
    },
    "items": [
      {
        "id": "itm-23456",
        "productId": "prod-34567",
        "sku": "DGF-LRG-001",
        "name": "Premium Dog Food - Large Breed",
        "quantity": 2,
        "unitPrice": 49.95,
        "totalPrice": 99.90,
        "discountAmount": 0,
        "imageUrl": "https://storage.petpro.com/products/dogfood-large.jpg"
      },
      {
        "id": "itm-23457",
        "productId": "prod-45678",
        "sku": "DGT-001",
        "name": "Durable Dog Toy - Rope",
        "quantity": 1,
        "unitPrice": 12.99,
        "totalPrice": 12.99,
        "discountAmount": 0,
        "imageUrl": "https://storage.petpro.com/products/dogtoy-rope.jpg"
      }
    ],
    "subtotal": 112.89,
    "tax": 8.61,
    "shipping": 5.00,
    "discountTotal": 0,
    "totalAmount": 126.50,
    "currencyCode": "USD",
    "paymentMethod": "Credit Card (Visa ending in 1234)",
    "paymentStatus": "paid",
    "paymentId": "pay-56789",
    "shippingMethod": "Standard Delivery",
    "trackingNumber": "TRK123456789",
    "trackingUrl": "https://track.carrier.com/TRK123456789",
    "estimatedDelivery": "2025-08-13",
    "notes": "Please leave package at front door"
  }
}
```

## Order Status Update

**Wireframe Reference**: [Vendor Order Management - Status Update](/docs/ui-ux-guidelines/vendor-order-management.md)

**API Endpoints**:

```
PATCH /vendors/{vendorId}/orders/{orderId}/status
```

**Request Example**:

```json
{
  "status": "shipped",
  "note": "Package has been shipped via Standard Delivery",
  "trackingNumber": "TRK123456789",
  "trackingUrl": "https://track.carrier.com/TRK123456789",
  "estimatedDelivery": "2025-08-13"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "ord-12345",
    "status": "shipped",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2025-08-10T14:30:00Z",
        "note": "Order placed"
      },
      {
        "status": "processing",
        "timestamp": "2025-08-10T15:45:00Z",
        "note": "Payment confirmed"
      },
      {
        "status": "shipped",
        "timestamp": "2025-08-11T09:20:00Z",
        "note": "Package has been shipped via Standard Delivery"
      }
    ],
    "trackingNumber": "TRK123456789",
    "trackingUrl": "https://track.carrier.com/TRK123456789",
    "estimatedDelivery": "2025-08-13"
  }
}
```

## Order Cancellation

**API Endpoints**:

```
POST /vendors/{vendorId}/orders/{orderId}/cancel
```

**Request Example**:

```json
{
  "reason": "Customer requested cancellation",
  "note": "Customer found alternative product"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "ord-12345",
    "status": "cancelled",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2025-08-10T14:30:00Z",
        "note": "Order placed"
      },
      {
        "status": "cancelled",
        "timestamp": "2025-08-11T10:15:00Z",
        "note": "Customer requested cancellation"
      }
    ]
  }
}
```

## Refund Processing

**API Endpoints**:

```
POST /vendors/{vendorId}/orders/{orderId}/refunds
```

**Request Example**:

```json
{
  "amount": 126.50,
  "reason": "Customer dissatisfaction",
  "note": "Product damaged during shipping"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "ref-56789",
    "orderId": "ord-12345",
    "amount": 126.50,
    "currencyCode": "USD",
    "reason": "Customer dissatisfaction",
    "note": "Product damaged during shipping",
    "status": "processing",
    "createdAt": "2025-08-11T11:30:00Z",
    "processedAt": null
  }
}
```

## Print Invoice/Packing Slip

**API Endpoints**:

```
GET /vendors/{vendorId}/orders/{orderId}/documents/invoice
GET /vendors/{vendorId}/orders/{orderId}/documents/packing-slip
```

**Response**:
PDF document binary or URL to downloadable document.

## Send Notification

**API Endpoints**:

```
POST /vendors/{vendorId}/orders/{orderId}/notifications
```

**Request Example**:

```json
{
  "type": "shipping_update",
  "channel": "email",
  "message": "Your order has been shipped and is on the way!"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "not-12345",
    "type": "shipping_update",
    "channel": "email",
    "recipient": "john.doe@example.com",
    "status": "sent",
    "sentAt": "2025-08-11T09:25:00Z"
  }
}
```

## Get Order Statistics

**API Endpoints**:

```
GET /vendors/{vendorId}/orders/statistics
```

**Query Parameters**:
- `period`: Time period for statistics (today, week, month, year)
- `startDate`: Custom start date
- `endDate`: Custom end date

**Response Example**:

```json
{
  "data": {
    "total": 156,
    "totalAmount": 8745.50,
    "averageOrderValue": 56.06,
    "byStatus": {
      "pending": 12,
      "processing": 23,
      "shipped": 45,
      "delivered": 68,
      "cancelled": 8
    },
    "byDate": [
      {
        "date": "2025-08-10",
        "count": 15,
        "amount": 843.75
      },
      {
        "date": "2025-08-09",
        "count": 12,
        "amount": 675.48
      }
    ]
  }
}
```
