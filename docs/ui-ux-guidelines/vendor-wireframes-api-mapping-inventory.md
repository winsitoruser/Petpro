# PetPro Vendor Dashboard - Inventory Management API Mapping

This document maps the Inventory Management wireframes to their corresponding API endpoints.

## Inventory Overview Screen

**Wireframe Reference**: [Vendor Inventory Management - Overview](/docs/ui-ux-guidelines/vendor-inventory-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/products/inventory/summary
```

**Response Example**:

```json
{
  "data": {
    "totalProducts": 235,
    "inStock": 189,
    "lowStock": 32,
    "outOfStock": 14,
    "totalValue": 45789.50,
    "currencyCode": "USD",
    "stockAlerts": [
      {
        "id": "alt-12345",
        "type": "low_stock",
        "productId": "prod-23456",
        "productName": "Premium Dog Food - Large Breed",
        "sku": "DGF-LRG-001",
        "currentStock": 3,
        "reorderPoint": 5,
        "createdAt": "2025-08-10T08:30:00Z"
      },
      {
        "id": "alt-12346",
        "type": "out_of_stock",
        "productId": "prod-34567",
        "productName": "Cat Scratching Post - Large",
        "sku": "CSP-LRG-001",
        "currentStock": 0,
        "reorderPoint": 3,
        "createdAt": "2025-08-09T14:15:00Z"
      }
    ],
    "recentMovements": [
      {
        "productId": "prod-45678",
        "productName": "Bird Cage - Medium",
        "sku": "BCG-MED-001",
        "quantity": -2,
        "type": "sale",
        "orderId": "ord-56789",
        "timestamp": "2025-08-11T10:30:00Z"
      },
      {
        "productId": "prod-56789",
        "productName": "Dog Collar - Small",
        "sku": "DCL-SML-001",
        "quantity": 10,
        "type": "restock",
        "purchaseOrderId": "po-67890",
        "timestamp": "2025-08-11T09:15:00Z"
      }
    ]
  }
}
```

## Inventory List Screen

**Wireframe Reference**: [Vendor Inventory Management - List](/docs/ui-ux-guidelines/vendor-inventory-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/products/inventory
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by (default: productName)
- `sortDirection`: Sort direction (asc/desc, default: asc)
- `category`: Filter by product category
- `status`: Filter by stock status (in_stock, low_stock, out_of_stock)
- `search`: Search by product name, SKU, or description

**Response Example**:

```json
{
  "data": [
    {
      "id": "prod-12345",
      "name": "Premium Dog Food - Large Breed",
      "sku": "DGF-LRG-001",
      "category": "Dog Food",
      "currentStock": 3,
      "reorderPoint": 5,
      "stockStatus": "low_stock",
      "unitPrice": 49.95,
      "totalValue": 149.85,
      "currencyCode": "USD",
      "locationCode": "WH1-A3-S2",
      "imageUrl": "https://storage.petpro.com/products/dogfood-large.jpg",
      "lastRestocked": "2025-07-25T14:30:00Z",
      "lastSold": "2025-08-10T11:45:00Z"
    },
    {
      "id": "prod-23456",
      "name": "Cat Litter - Clumping",
      "sku": "CLT-CLP-001",
      "category": "Cat Supplies",
      "currentStock": 15,
      "reorderPoint": 8,
      "stockStatus": "in_stock",
      "unitPrice": 14.99,
      "totalValue": 224.85,
      "currencyCode": "USD",
      "locationCode": "WH1-B2-S4",
      "imageUrl": "https://storage.petpro.com/products/catlitter-clump.jpg",
      "lastRestocked": "2025-08-05T09:20:00Z",
      "lastSold": "2025-08-11T13:10:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 235,
      "count": 20,
      "per_page": 20,
      "current_page": 1,
      "total_pages": 12
    }
  }
}
```

## Product Detail Screen

**Wireframe Reference**: [Vendor Inventory Management - Product Detail](/docs/ui-ux-guidelines/vendor-inventory-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/products/{productId}
```

**Response Example**:

```json
{
  "data": {
    "id": "prod-12345",
    "name": "Premium Dog Food - Large Breed",
    "description": "High-quality premium dog food specially formulated for large breed dogs. Contains balanced nutrition with added glucosamine for joint health.",
    "sku": "DGF-LRG-001",
    "barcode": "8901234567890",
    "category": "Dog Food",
    "subcategory": "Dry Food",
    "brand": "Happy Paws Nutrition",
    "supplier": {
      "id": "sup-34567",
      "name": "Global Pet Supplies Inc.",
      "contactEmail": "orders@globalpetsupplies.com",
      "contactPhone": "+1-555-987-6543"
    },
    "inventory": {
      "currentStock": 3,
      "reorderPoint": 5,
      "optimalStockLevel": 15,
      "stockStatus": "low_stock",
      "unitOfMeasure": "bag",
      "weight": 15,
      "weightUnit": "kg",
      "dimensions": {
        "length": 60,
        "width": 40,
        "height": 10,
        "unit": "cm"
      },
      "locationCode": "WH1-A3-S2",
      "shelfLife": {
        "duration": 12,
        "unit": "month",
        "manufacturingDate": "2025-06-15",
        "expirationDate": "2026-06-15"
      }
    },
    "pricing": {
      "costPrice": 32.50,
      "retailPrice": 49.95,
      "salePrice": null,
      "margin": 53.7,
      "currencyCode": "USD",
      "taxRate": 8.5,
      "taxCode": "FOOD-PET"
    },
    "images": [
      {
        "id": "img-45678",
        "url": "https://storage.petpro.com/products/dogfood-large-main.jpg",
        "isPrimary": true
      },
      {
        "id": "img-45679",
        "url": "https://storage.petpro.com/products/dogfood-large-nutrition.jpg",
        "isPrimary": false
      }
    ],
    "attributes": [
      {
        "name": "Age Range",
        "value": "Adult (1-7 years)"
      },
      {
        "name": "Breed Size",
        "value": "Large"
      },
      {
        "name": "Main Ingredient",
        "value": "Chicken"
      },
      {
        "name": "Grain Free",
        "value": "No"
      }
    ],
    "variants": [
      {
        "id": "var-56789",
        "name": "Medium Breed Formula",
        "sku": "DGF-MED-001",
        "currentStock": 8
      },
      {
        "id": "var-56790",
        "name": "Small Breed Formula",
        "sku": "DGF-SML-001",
        "currentStock": 12
      }
    ],
    "stockMovementHistory": [
      {
        "date": "2025-08-10T11:45:00Z",
        "type": "sale",
        "quantity": -2,
        "reference": "Order #12345",
        "notes": null
      },
      {
        "date": "2025-07-25T14:30:00Z",
        "type": "restock",
        "quantity": 10,
        "reference": "PO #67890",
        "notes": "Regular monthly order"
      }
    ],
    "salesData": {
      "totalSold": 45,
      "lastMonthSold": 12,
      "averageWeeklySales": 3.5
    }
  }
}
```

## Update Stock Level

**Wireframe Reference**: [Vendor Inventory Management - Stock Update](/docs/ui-ux-guidelines/vendor-inventory-management.md)

**API Endpoints**:

```
PATCH /vendors/{vendorId}/products/{productId}/inventory
```

**Request Example**:

```json
{
  "currentStock": 13,
  "adjustmentReason": "restock",
  "notes": "Received new shipment from supplier",
  "referenceNumber": "PO-98765"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "prod-12345",
    "name": "Premium Dog Food - Large Breed",
    "sku": "DGF-LRG-001",
    "previousStock": 3,
    "currentStock": 13,
    "stockStatus": "in_stock",
    "adjustment": {
      "quantity": 10,
      "reason": "restock",
      "timestamp": "2025-08-11T15:30:00Z",
      "notes": "Received new shipment from supplier",
      "referenceNumber": "PO-98765",
      "performedBy": {
        "id": "usr-12345",
        "name": "John Smith"
      }
    },
    "movementId": "mov-23456"
  }
}
```

## Update Reorder Points

**API Endpoints**:

```
PATCH /vendors/{vendorId}/products/{productId}/reorder-points
```

**Request Example**:

```json
{
  "reorderPoint": 8,
  "optimalStockLevel": 20
}
```

**Response Example**:

```json
{
  "data": {
    "id": "prod-12345",
    "name": "Premium Dog Food - Large Breed",
    "sku": "DGF-LRG-001",
    "currentStock": 13,
    "reorderPoint": 8,
    "previousReorderPoint": 5,
    "optimalStockLevel": 20,
    "previousOptimalStockLevel": 15
  }
}
```

## Stock Transfer

**API Endpoints**:

```
POST /vendors/{vendorId}/inventory/transfers
```

**Request Example**:

```json
{
  "productId": "prod-12345",
  "quantity": 5,
  "fromLocation": "WH1-A3-S2",
  "toLocation": "ST1-B2-S1",
  "reason": "store_replenishment",
  "notes": "Moving stock to store front display"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "trf-34567",
    "productId": "prod-12345",
    "productName": "Premium Dog Food - Large Breed",
    "sku": "DGF-LRG-001",
    "quantity": 5,
    "fromLocation": "WH1-A3-S2",
    "toLocation": "ST1-B2-S1",
    "reason": "store_replenishment",
    "notes": "Moving stock to store front display",
    "status": "completed",
    "timestamp": "2025-08-11T16:15:00Z",
    "performedBy": {
      "id": "usr-12345",
      "name": "John Smith"
    }
  }
}
```

## Generate Inventory Reports

**API Endpoints**:

```
GET /vendors/{vendorId}/inventory/reports
```

**Query Parameters**:
- `reportType`: Type of report (stock_levels, stock_movements, valuation, etc.)
- `format`: Report format (json, csv, pdf)
- `startDate`: Start date for report period
- `endDate`: End date for report period

**Response Example**:
For JSON format, standard API response with report data.
For CSV/PDF formats, downloadable file URL or binary data.

## Inventory Valuation

**API Endpoints**:

```
GET /vendors/{vendorId}/inventory/valuation
```

**Response Example**:

```json
{
  "data": {
    "totalValue": 45789.50,
    "byCostPrice": 32450.75,
    "byRetailPrice": 45789.50,
    "currencyCode": "USD",
    "asOfDate": "2025-08-11T00:00:00Z",
    "byCategory": [
      {
        "category": "Dog Food",
        "costValue": 8760.50,
        "retailValue": 12450.75,
        "itemCount": 45
      },
      {
        "category": "Cat Supplies",
        "costValue": 6540.25,
        "retailValue": 9876.50,
        "itemCount": 38
      }
    ],
    "topValueItems": [
      {
        "id": "prod-12345",
        "name": "Premium Dog Food - Large Breed",
        "sku": "DGF-LRG-001",
        "costValue": 422.50,
        "retailValue": 649.35,
        "quantity": 13
      }
    ]
  }
}
```

## Bulk Stock Update

**API Endpoints**:

```
POST /vendors/{vendorId}/inventory/bulk-update
```

**Request Example**:

```json
{
  "items": [
    {
      "productId": "prod-12345",
      "newStock": 15,
      "adjustmentReason": "restock"
    },
    {
      "productId": "prod-23456",
      "newStock": 20,
      "adjustmentReason": "restock"
    }
  ],
  "notes": "Weekly stock reconciliation",
  "referenceNumber": "SR-12345"
}
```

**Response Example**:

```json
{
  "data": {
    "batchId": "bat-45678",
    "timestamp": "2025-08-11T17:00:00Z",
    "totalProductsUpdated": 2,
    "referenceNumber": "SR-12345",
    "notes": "Weekly stock reconciliation",
    "items": [
      {
        "productId": "prod-12345",
        "previousStock": 13,
        "newStock": 15,
        "adjustment": 2,
        "status": "success"
      },
      {
        "productId": "prod-23456",
        "previousStock": 15,
        "newStock": 20,
        "adjustment": 5,
        "status": "success"
      }
    ]
  }
}
```
