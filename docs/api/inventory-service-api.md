# Product & Inventory Service API Documentation

## Overview

The Product & Inventory Service manages all product-related operations, including product catalog management, inventory tracking, product categories, and product reviews. This document provides detailed API specifications for both REST endpoints and TCP message patterns.

## REST API Endpoints

All REST endpoints are accessible through the API Gateway at `/api/v1/products/*` and require valid authentication unless specified otherwise.

### Product Management

#### 1. List Products

**Endpoint:** `GET /api/v1/products`

**Description:** Lists products with filtering options

**Query Parameters:**
- `category`: Filter by category ID (optional)
- `vendorId`: Filter by vendor ID (optional)
- `minPrice`: Minimum price filter (optional)
- `maxPrice`: Maximum price filter (optional)
- `query`: Search term for product name/description (optional)
- `petType`: Filter by pet type (optional, e.g., DOG, CAT)
- `status`: Filter by product status (optional, e.g., ACTIVE, OUT_OF_STOCK)
- `featured`: Filter for featured products (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)
- `sort`: Sort field (default: "createdAt")
- `order`: Sort order (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "name": "Premium Dog Food",
      "sku": "DF-PREM-1001",
      "price": 49.99,
      "salePrice": 44.99,
      "thumbnail": "https://storage.petpro.com/products/1001-thumb.jpg",
      "category": {
        "id": 101,
        "name": "Dog Food"
      },
      "vendor": {
        "id": 201,
        "name": "PetNutrition Co."
      },
      "rating": 4.7,
      "reviewCount": 124,
      "status": "ACTIVE"
    },
    // More products...
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 243,
    "totalPages": 13
  }
}
```

#### 2. Get Product Details

**Endpoint:** `GET /api/v1/products/:id`

**Description:** Retrieves detailed information about a specific product

**Path Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "name": "Premium Dog Food",
    "sku": "DF-PREM-1001",
    "description": "High-quality dog food with balanced nutrition for adult dogs",
    "price": 49.99,
    "salePrice": 44.99,
    "cost": 25.50,
    "weight": 5.0,
    "weightUnit": "kg",
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 10,
      "unit": "cm"
    },
    "categoryId": 101,
    "category": {
      "id": 101,
      "name": "Dog Food",
      "path": "Pet Food > Dog Food"
    },
    "vendorId": 201,
    "vendor": {
      "id": 201,
      "name": "PetNutrition Co."
    },
    "attributes": [
      {
        "name": "Brand",
        "value": "PetNutrition"
      },
      {
        "name": "Age Range",
        "value": "Adult"
      },
      {
        "name": "Ingredients",
        "value": "Chicken, Rice, Vegetables"
      }
    ],
    "images": [
      {
        "id": 5001,
        "url": "https://storage.petpro.com/products/1001-1.jpg",
        "isPrimary": true
      },
      {
        "id": 5002,
        "url": "https://storage.petpro.com/products/1001-2.jpg",
        "isPrimary": false
      }
    ],
    "inventory": {
      "quantity": 150,
      "reserved": 10,
      "available": 140,
      "status": "IN_STOCK",
      "lowStockThreshold": 20
    },
    "petTypes": ["DOG"],
    "featured": true,
    "status": "ACTIVE",
    "rating": 4.7,
    "reviewCount": 124,
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-08-10T15:30:00Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `PRODUCT_NOT_FOUND`: Product ID does not exist

#### 3. Create Product

**Endpoint:** `POST /api/v1/products`

**Description:** Creates a new product (vendor or admin only)

**Request Body:**
```json
{
  "name": "Organic Cat Food",
  "sku": "CF-ORG-2001",
  "description": "Organic and grain-free cat food for sensitive stomachs",
  "price": 39.99,
  "salePrice": 34.99,
  "cost": 20.50,
  "weight": 2.5,
  "weightUnit": "kg",
  "dimensions": {
    "length": 25,
    "width": 15,
    "height": 8,
    "unit": "cm"
  },
  "categoryId": 102,
  "attributes": [
    {
      "name": "Brand",
      "value": "NaturePet"
    },
    {
      "name": "Age Range",
      "value": "All Ages"
    },
    {
      "name": "Ingredients",
      "value": "Organic Chicken, Brown Rice, Organic Vegetables"
    }
  ],
  "images": [
    {
      "data": "base64-encoded-image-data",
      "isPrimary": true
    }
  ],
  "inventory": {
    "quantity": 100,
    "lowStockThreshold": 15
  },
  "petTypes": ["CAT"],
  "featured": false,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1002,
    "name": "Organic Cat Food",
    "sku": "CF-ORG-2001",
    "description": "Organic and grain-free cat food for sensitive stomachs",
    "price": 39.99,
    "salePrice": 34.99,
    "categoryId": 102,
    "vendorId": 201,
    "images": [
      {
        "id": 5003,
        "url": "https://storage.petpro.com/products/1002-1.jpg",
        "isPrimary": true
      }
    ],
    "inventory": {
      "quantity": 100,
      "reserved": 0,
      "available": 100,
      "status": "IN_STOCK",
      "lowStockThreshold": 15
    },
    "status": "ACTIVE",
    "createdAt": "2025-08-15T19:15:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `UNAUTHORIZED`: User does not have permission to create products
- `INVALID_CATEGORY`: Category ID does not exist
- `DUPLICATE_SKU`: SKU already exists
- `MISSING_REQUIRED_FIELDS`: Required fields are missing

#### 4. Update Product

**Endpoint:** `PUT /api/v1/products/:id`

**Description:** Updates an existing product (vendor or admin only)

**Path Parameters:**
- `id`: Product ID

**Request Body:**
```json
{
  "name": "Premium Organic Cat Food",
  "description": "Premium organic and grain-free cat food for sensitive stomachs",
  "price": 42.99,
  "salePrice": 36.99,
  "status": "ACTIVE",
  "featured": true,
  "inventory": {
    "lowStockThreshold": 20
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1002,
    "name": "Premium Organic Cat Food",
    "description": "Premium organic and grain-free cat food for sensitive stomachs",
    "price": 42.99,
    "salePrice": 36.99,
    "featured": true,
    "inventory": {
      "quantity": 100,
      "reserved": 0,
      "available": 100,
      "status": "IN_STOCK",
      "lowStockThreshold": 20
    },
    "status": "ACTIVE",
    "updatedAt": "2025-08-15T19:30:45Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `PRODUCT_NOT_FOUND`: Product ID does not exist
- `UNAUTHORIZED`: User does not have permission to update this product

#### 5. Delete Product

**Endpoint:** `DELETE /api/v1/products/:id`

**Description:** Deletes a product (vendor or admin only)

**Path Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1002,
    "deletedAt": "2025-08-15T19:35:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `PRODUCT_NOT_FOUND`: Product ID does not exist
- `UNAUTHORIZED`: User does not have permission to delete this product
- `PRODUCT_HAS_ORDERS`: Product cannot be deleted because it has active orders

### Inventory Management

#### 1. Update Inventory

**Endpoint:** `PUT /api/v1/products/:id/inventory`

**Description:** Updates inventory for a specific product (vendor or admin only)

**Path Parameters:**
- `id`: Product ID

**Request Body:**
```json
{
  "quantity": 200,
  "lowStockThreshold": 30,
  "status": "IN_STOCK"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": 1001,
    "quantity": 200,
    "reserved": 10,
    "available": 190,
    "status": "IN_STOCK",
    "lowStockThreshold": 30,
    "updatedAt": "2025-08-15T19:40:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `PRODUCT_NOT_FOUND`: Product ID does not exist
- `UNAUTHORIZED`: User does not have permission to update this inventory
- `INVALID_QUANTITY`: Quantity cannot be less than reserved items

#### 2. Get Inventory History

**Endpoint:** `GET /api/v1/products/:id/inventory/history`

**Description:** Gets inventory history for a product (vendor or admin only)

**Path Parameters:**
- `id`: Product ID

**Query Parameters:**
- `startDate`: Filter by start date (optional, format: YYYY-MM-DD)
- `endDate`: Filter by end date (optional, format: YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10001,
      "productId": 1001,
      "type": "MANUAL_ADJUSTMENT",
      "previousQuantity": 150,
      "quantity": 200,
      "change": 50,
      "note": "Restocked inventory",
      "createdBy": {
        "id": 201,
        "name": "Vendor User"
      },
      "createdAt": "2025-08-15T19:40:30Z"
    },
    {
      "id": 10000,
      "productId": 1001,
      "type": "ORDER",
      "previousQuantity": 155,
      "quantity": 150,
      "change": -5,
      "reference": "ORD-10012345",
      "createdAt": "2025-08-14T15:20:45Z"
    }
    // More history entries...
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Codes:**
- `PRODUCT_NOT_FOUND`: Product ID does not exist
- `UNAUTHORIZED`: User does not have permission to view this inventory history

### Product Categories

#### 1. List Categories

**Endpoint:** `GET /api/v1/product-categories`

**Description:** Lists all product categories

**Query Parameters:**
- `parentId`: Filter by parent category ID (optional)
- `level`: Filter by category level (optional)
- `includeProducts`: Include product count (optional, default: false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "name": "Pet Food",
      "description": "All types of pet food",
      "slug": "pet-food",
      "level": 0,
      "parentId": null,
      "path": "Pet Food",
      "imageUrl": "https://storage.petpro.com/categories/pet-food.jpg",
      "productCount": 450,
      "children": [
        {
          "id": 101,
          "name": "Dog Food",
          "slug": "dog-food",
          "level": 1,
          "path": "Pet Food > Dog Food",
          "productCount": 250
        },
        {
          "id": 102,
          "name": "Cat Food",
          "slug": "cat-food",
          "level": 1,
          "path": "Pet Food > Cat Food",
          "productCount": 200
        }
      ]
    }
    // More categories...
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### 2. Get Category Details

**Endpoint:** `GET /api/v1/product-categories/:id`

**Description:** Gets details for a specific category

**Path Parameters:**
- `id`: Category ID

**Query Parameters:**
- `includeChildren`: Include child categories (optional, default: true)
- `includeProducts`: Include products in this category (optional, default: false)
- `productLimit`: Limit for included products (optional, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Dog Food",
    "description": "High-quality food for dogs of all breeds and ages",
    "slug": "dog-food",
    "level": 1,
    "parentId": 100,
    "parent": {
      "id": 100,
      "name": "Pet Food",
      "slug": "pet-food"
    },
    "path": "Pet Food > Dog Food",
    "imageUrl": "https://storage.petpro.com/categories/dog-food.jpg",
    "attributes": [
      "Brand",
      "Age Range",
      "Size",
      "Ingredients"
    ],
    "children": [
      {
        "id": 110,
        "name": "Puppy Food",
        "slug": "puppy-food",
        "level": 2,
        "path": "Pet Food > Dog Food > Puppy Food",
        "productCount": 75
      },
      {
        "id": 111,
        "name": "Adult Dog Food",
        "slug": "adult-dog-food",
        "level": 2,
        "path": "Pet Food > Dog Food > Adult Dog Food",
        "productCount": 125
      }
    ],
    "products": [
      {
        "id": 1001,
        "name": "Premium Dog Food",
        "price": 49.99,
        "thumbnail": "https://storage.petpro.com/products/1001-thumb.jpg"
      }
      // More products...
    ],
    "productCount": 250,
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2025-06-01T10:00:00Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `CATEGORY_NOT_FOUND`: Category ID does not exist

#### 3. Create Category

**Endpoint:** `POST /api/v1/product-categories`

**Description:** Creates a new product category (admin only)

**Request Body:**
```json
{
  "name": "Small Animal Food",
  "description": "Food for hamsters, guinea pigs, and other small pets",
  "parentId": 100,
  "attributes": [
    "Brand",
    "Animal Type",
    "Ingredients"
  ],
  "image": "base64-encoded-image-data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 103,
    "name": "Small Animal Food",
    "description": "Food for hamsters, guinea pigs, and other small pets",
    "slug": "small-animal-food",
    "level": 1,
    "parentId": 100,
    "path": "Pet Food > Small Animal Food",
    "imageUrl": "https://storage.petpro.com/categories/small-animal-food.jpg",
    "attributes": [
      "Brand",
      "Animal Type",
      "Ingredients"
    ],
    "createdAt": "2025-08-15T19:50:30Z"
  },
  "meta": {}
}
```

**Error Codes:**
- `UNAUTHORIZED`: User does not have permission to create categories
- `INVALID_PARENT_CATEGORY`: Parent category ID does not exist
- `DUPLICATE_CATEGORY`: A category with this name already exists under the parent

## TCP Message Patterns (Internal Communication)

The following message patterns are used for internal microservice communication and are not directly exposed to clients.

### 1. Get Product

**Pattern:** `{ cmd: 'get-product' }`

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
  "name": "Premium Dog Food",
  "sku": "DF-PREM-1001",
  "price": 49.99,
  "salePrice": 44.99,
  "vendorId": 201,
  "categoryId": 101,
  "status": "ACTIVE",
  "inventory": {
    "quantity": 200,
    "reserved": 10,
    "available": 190,
    "status": "IN_STOCK"
  },
  "createdAt": "2025-07-01T10:00:00Z",
  "updatedAt": "2025-08-15T19:40:30Z"
}
```

### 2. Check Product Availability

**Pattern:** `{ cmd: 'check-product-availability' }`

**Payload:**
```json
{
  "productId": 1001,
  "quantity": 5
}
```

**Response:**
```json
{
  "productId": 1001,
  "requested": 5,
  "available": 190,
  "isAvailable": true,
  "inventory": {
    "status": "IN_STOCK",
    "updatedAt": "2025-08-15T19:40:30Z"
  }
}
```

### 3. Reserve Product Inventory

**Pattern:** `{ cmd: 'reserve-product-inventory' }`

**Payload:**
```json
{
  "orderId": "ORD-10012346",
  "items": [
    {
      "productId": 1001,
      "quantity": 5
    }
  ],
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "orderId": "ORD-10012346",
  "reservationId": "RSV-2001",
  "items": [
    {
      "productId": 1001,
      "requested": 5,
      "reserved": 5,
      "status": "RESERVED"
    }
  ],
  "status": "RESERVED",
  "expiresAt": "2025-08-15T20:50:30Z"
}
```

## Events Emitted

The product/inventory service emits the following events that other services can subscribe to:

### 1. Product Created

**Event:** `product.created`

**Payload:**
```json
{
  "id": 1002,
  "name": "Organic Cat Food",
  "sku": "CF-ORG-2001",
  "vendorId": 201,
  "categoryId": 102,
  "status": "ACTIVE",
  "createdAt": "2025-08-15T19:15:30Z"
}
```

### 2. Product Updated

**Event:** `product.updated`

**Payload:**
```json
{
  "id": 1002,
  "changes": ["name", "price", "salePrice", "featured"],
  "updatedAt": "2025-08-15T19:30:45Z"
}
```

### 3. Product Inventory Changed

**Event:** `product.inventory-changed`

**Payload:**
```json
{
  "productId": 1001,
  "previousQuantity": 150,
  "currentQuantity": 200,
  "change": 50,
  "type": "MANUAL_ADJUSTMENT",
  "reference": null,
  "updatedAt": "2025-08-15T19:40:30Z"
}
```

### 4. Low Stock Alert

**Event:** `product.low-stock`

**Payload:**
```json
{
  "productId": 1001,
  "sku": "DF-PREM-1001",
  "name": "Premium Dog Food",
  "vendorId": 201,
  "quantity": 18,
  "threshold": 20,
  "updatedAt": "2025-08-15T19:40:30Z"
}
```

## Data Models

### Product

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| name | string | Product name |
| sku | string | Stock keeping unit (unique) |
| description | string | Product description |
| price | decimal | Regular price |
| salePrice | decimal | Sale price (optional) |
| cost | decimal | Cost price |
| weight | decimal | Product weight |
| weightUnit | string | Weight unit (g, kg, oz, lb) |
| dimensions | object | Product dimensions |
| categoryId | number | ID of the product category |
| vendorId | number | ID of the vendor |
| attributes | array | Array of product attributes |
| petTypes | array | Types of pets this product is for |
| featured | boolean | Whether the product is featured |
| status | enum | ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

### ProductInventory

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| productId | number | ID of the product |
| quantity | number | Total inventory quantity |
| reserved | number | Reserved inventory quantity |
| lowStockThreshold | number | Threshold for low stock alerts |
| status | enum | IN_STOCK, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED |
| updatedAt | datetime | Last update timestamp |

### ProductCategory

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| name | string | Category name |
| description | string | Category description |
| slug | string | URL-friendly slug |
| parentId | number | ID of parent category (null for root) |
| level | number | Category level (0 for root) |
| path | string | Full category path |
| imageUrl | string | URL to category image |
| attributes | array | Attributes applicable to this category |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

### InventoryHistory

| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| productId | number | ID of the product |
| type | enum | MANUAL_ADJUSTMENT, ORDER, RETURN, RESERVATION |
| previousQuantity | number | Previous inventory quantity |
| quantity | number | New inventory quantity |
| change | number | Change amount (positive or negative) |
| reference | string | Reference ID (e.g., order ID) |
| note | string | Note explaining the change |
| createdBy | number | ID of user who made the change |
| createdAt | datetime | Timestamp of the change |
