# PetPro Vendor Dashboard - Analytics Dashboard API Mapping

This document maps the Analytics Dashboard wireframes to their corresponding API endpoints.

## Analytics Overview Screen

**Wireframe Reference**: [Vendor Analytics Dashboard - Overview](/docs/ui-ux-guidelines/vendor-analytics-dashboard.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/analytics/dashboard
```

**Query Parameters**:
- `period`: Time period for data (today, yesterday, last7days, last30days, thisMonth, lastMonth, custom)
- `startDate`: Custom start date (required if period=custom)
- `endDate`: Custom end date (required if period=custom)
- `comparison`: Include comparison data (boolean)
- `comparisonPeriod`: Period to compare against (previous_period, previous_year, custom)
- `comparisonStartDate`: Custom comparison start date
- `comparisonEndDate`: Custom comparison end date

**Response Example**:

```json
{
  "data": {
    "period": {
      "type": "last30days",
      "start": "2025-07-12T00:00:00Z",
      "end": "2025-08-11T23:59:59Z",
      "comparisonType": "previous_period",
      "comparisonStart": "2025-06-12T00:00:00Z",
      "comparisonEnd": "2025-07-11T23:59:59Z"
    },
    "summary": {
      "revenue": {
        "current": 12567.85,
        "previous": 11230.50,
        "change": 11.9
      },
      "orders": {
        "current": 187,
        "previous": 175,
        "change": 6.9
      },
      "customers": {
        "current": 152,
        "previous": 145,
        "change": 4.8
      },
      "averageOrderValue": {
        "current": 67.21,
        "previous": 64.17,
        "change": 4.7
      },
      "salesPerCategory": [
        {
          "category": "Pet Food",
          "amount": 5678.95,
          "percentage": 45.2,
          "change": 8.5
        },
        {
          "category": "Accessories",
          "amount": 3456.75,
          "percentage": 27.5,
          "change": 14.2
        },
        {
          "category": "Health Products",
          "amount": 2198.35,
          "percentage": 17.5,
          "change": 12.8
        },
        {
          "category": "Toys",
          "amount": 1233.80,
          "percentage": 9.8,
          "change": 15.5
        }
      ],
      "salesByChannel": [
        {
          "channel": "Online Store",
          "amount": 8797.50,
          "percentage": 70,
          "change": 12.5
        },
        {
          "channel": "In-Store",
          "amount": 3770.35,
          "percentage": 30,
          "change": 10.2
        }
      ]
    },
    "trends": {
      "dailyRevenue": [
        {
          "date": "2025-07-12",
          "amount": 398.75,
          "orders": 6
        },
        {
          "date": "2025-07-13",
          "amount": 412.50,
          "orders": 7
        }
      ],
      "topProducts": [
        {
          "id": "prod-12345",
          "name": "Premium Dog Food - Large Breed",
          "unitsSold": 45,
          "revenue": 2247.75,
          "changePercentage": 12.5
        },
        {
          "id": "prod-23456",
          "name": "Cat Scratching Post - Large",
          "unitsSold": 28,
          "revenue": 1398.60,
          "changePercentage": 15.2
        }
      ],
      "topServices": [
        {
          "id": "srv-34567",
          "name": "Dog Grooming - Full Service",
          "bookingsCount": 32,
          "revenue": 2080.00,
          "changePercentage": 8.5
        },
        {
          "id": "srv-45678",
          "name": "Veterinary Check-up",
          "bookingsCount": 28,
          "revenue": 1680.00,
          "changePercentage": 5.2
        }
      ]
    }
  }
}
```

## Sales Analytics Screen

**Wireframe Reference**: [Vendor Analytics Dashboard - Sales Analysis](/docs/ui-ux-guidelines/vendor-analytics-dashboard.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/analytics/sales
```

**Query Parameters**:
- `period`: Time period for data
- `startDate`: Custom start date
- `endDate`: Custom end date
- `granularity`: Data grouping (day, week, month)
- `channels`: Filter by sales channels (comma-separated)
- `categories`: Filter by product categories (comma-separated)
- `comparison`: Include comparison data (boolean)

**Response Example**:

```json
{
  "data": {
    "period": {
      "type": "last30days",
      "start": "2025-07-12T00:00:00Z",
      "end": "2025-08-11T23:59:59Z",
      "granularity": "day"
    },
    "overview": {
      "totalRevenue": 12567.85,
      "totalOrders": 187,
      "totalProducts": 532,
      "averageOrderValue": 67.21,
      "conversionRate": 3.2
    },
    "timeSeries": {
      "revenue": [
        {
          "date": "2025-07-12",
          "amount": 398.75
        },
        {
          "date": "2025-07-13",
          "amount": 412.50
        }
      ],
      "orders": [
        {
          "date": "2025-07-12",
          "count": 6
        },
        {
          "date": "2025-07-13",
          "count": 7
        }
      ],
      "averageOrderValue": [
        {
          "date": "2025-07-12",
          "amount": 66.46
        },
        {
          "date": "2025-07-13",
          "amount": 58.93
        }
      ]
    },
    "salesBreakdown": {
      "byCategory": [
        {
          "category": "Pet Food",
          "amount": 5678.95,
          "percentage": 45.2,
          "unitsSold": 243
        },
        {
          "category": "Accessories",
          "amount": 3456.75,
          "percentage": 27.5,
          "unitsSold": 152
        }
      ],
      "byChannel": [
        {
          "channel": "Online Store",
          "amount": 8797.50,
          "percentage": 70,
          "orders": 131
        },
        {
          "channel": "In-Store",
          "amount": 3770.35,
          "percentage": 30,
          "orders": 56
        }
      ],
      "byPaymentMethod": [
        {
          "method": "Credit Card",
          "amount": 7540.71,
          "percentage": 60,
          "orders": 112
        },
        {
          "method": "PayPal",
          "amount": 2513.57,
          "percentage": 20,
          "orders": 38
        },
        {
          "method": "Apple Pay",
          "amount": 1256.78,
          "percentage": 10,
          "orders": 19
        },
        {
          "method": "Cash",
          "amount": 1256.78,
          "percentage": 10,
          "orders": 18
        }
      ]
    },
    "productPerformance": {
      "topProducts": [
        {
          "id": "prod-12345",
          "name": "Premium Dog Food - Large Breed",
          "sku": "DGF-LRG-001",
          "unitsSold": 45,
          "revenue": 2247.75,
          "profitMargin": 35,
          "returnRate": 2.2,
          "growth": 12.5
        }
      ],
      "worstPerforming": [
        {
          "id": "prod-67890",
          "name": "Pet Training Whistle",
          "sku": "PTW-001",
          "unitsSold": 3,
          "revenue": 29.97,
          "profitMargin": 45,
          "returnRate": 33.3,
          "growth": -15.2
        }
      ]
    },
    "orderStatistics": {
      "averageItems": 2.8,
      "abandonmentRate": 22.5,
      "repeatPurchaseRate": 35.4,
      "orderSizeDistribution": [
        {
          "range": "$0-$25",
          "count": 28,
          "percentage": 15
        },
        {
          "range": "$25-$50",
          "count": 56,
          "percentage": 30
        },
        {
          "range": "$50-$100",
          "count": 75,
          "percentage": 40
        },
        {
          "range": "$100+",
          "count": 28,
          "percentage": 15
        }
      ]
    },
    "customerInsights": {
      "newVsReturning": {
        "new": {
          "count": 67,
          "percentage": 44.1,
          "revenue": 4020.00
        },
        "returning": {
          "count": 85,
          "percentage": 55.9,
          "revenue": 8547.85
        }
      },
      "topCustomerSegments": [
        {
          "segment": "Dog Owners",
          "customerCount": 87,
          "revenue": 6283.92,
          "averageOrderValue": 72.23
        },
        {
          "segment": "Cat Owners",
          "customerCount": 65,
          "revenue": 4145.39,
          "averageOrderValue": 63.78
        }
      ]
    }
  }
}
```

## Customer Analytics Screen

**API Endpoints**:

```
GET /vendors/{vendorId}/analytics/customers
```

**Query Parameters**:
- Standard period and comparison parameters
- `segments`: Filter by customer segments (comma-separated)
- `includeDetails`: Include detailed customer data (boolean)

**Response Example**:

```json
{
  "data": {
    "period": {
      "type": "last30days",
      "start": "2025-07-12T00:00:00Z",
      "end": "2025-08-11T23:59:59Z"
    },
    "overview": {
      "totalCustomers": 152,
      "newCustomers": 67,
      "returningCustomers": 85,
      "customerRetentionRate": 78.5,
      "customerLifetimeValue": 345.50,
      "averagePurchaseFrequency": 2.3
    },
    "acquisition": {
      "channelBreakdown": [
        {
          "channel": "Organic Search",
          "count": 32,
          "percentage": 47.8
        },
        {
          "channel": "Social Media",
          "count": 18,
          "percentage": 26.9
        },
        {
          "channel": "Referral",
          "count": 10,
          "percentage": 14.9
        },
        {
          "channel": "Direct",
          "count": 7,
          "percentage": 10.4
        }
      ],
      "conversionRateByChannel": [
        {
          "channel": "Organic Search",
          "rate": 2.8
        },
        {
          "channel": "Social Media",
          "rate": 3.5
        },
        {
          "channel": "Referral",
          "rate": 5.2
        },
        {
          "channel": "Direct",
          "rate": 4.1
        }
      ]
    },
    "segmentation": {
      "byPetType": [
        {
          "segment": "Dog Owners",
          "count": 87,
          "percentage": 57.2,
          "revenue": 6283.92,
          "avgOrderValue": 72.23
        },
        {
          "segment": "Cat Owners",
          "count": 65,
          "percentage": 42.8,
          "revenue": 4145.39,
          "avgOrderValue": 63.78
        }
      ],
      "byActivity": [
        {
          "segment": "Active (3+ orders)",
          "count": 45,
          "percentage": 29.6,
          "revenue": 5027.14
        },
        {
          "segment": "Moderate (2 orders)",
          "count": 38,
          "percentage": 25.0,
          "revenue": 3768.67
        },
        {
          "segment": "New (1 order)",
          "count": 69,
          "percentage": 45.4,
          "revenue": 3771.85
        }
      ],
      "byValue": [
        {
          "segment": "High Value (>$100)",
          "count": 32,
          "percentage": 21.1,
          "revenue": 5402.89
        },
        {
          "segment": "Medium Value ($50-$100)",
          "count": 63,
          "percentage": 41.4,
          "revenue": 4523.46
        },
        {
          "segment": "Low Value (<$50)",
          "count": 57,
          "percentage": 37.5,
          "revenue": 2641.50
        }
      ]
    },
    "retention": {
      "retentionByMonth": [
        {
          "month": "2025-03",
          "rate": 65.2
        },
        {
          "month": "2025-04",
          "rate": 72.5
        },
        {
          "month": "2025-05",
          "rate": 68.9
        },
        {
          "month": "2025-06",
          "rate": 74.3
        },
        {
          "month": "2025-07",
          "rate": 78.5
        }
      ],
      "churnRate": 21.5,
      "churnReasons": [
        {
          "reason": "Found cheaper alternative",
          "percentage": 35
        },
        {
          "reason": "Moved away",
          "percentage": 25
        },
        {
          "reason": "Dissatisfied with product/service",
          "percentage": 20
        },
        {
          "reason": "No longer need products",
          "percentage": 15
        },
        {
          "reason": "Other",
          "percentage": 5
        }
      ]
    },
    "topCustomers": [
      {
        "id": "cus-12345",
        "name": "John Doe",
        "totalSpent": 567.85,
        "orderCount": 7,
        "lastPurchase": "2025-08-05T14:30:00Z",
        "averageOrderValue": 81.12,
        "preferredCategory": "Dog Food"
      },
      {
        "id": "cus-23456",
        "name": "Jane Smith",
        "totalSpent": 498.50,
        "orderCount": 5,
        "lastPurchase": "2025-08-08T10:15:00Z",
        "averageOrderValue": 99.70,
        "preferredCategory": "Cat Supplies"
      }
    ]
  }
}
```

## Inventory Analytics Screen

**API Endpoints**:

```
GET /vendors/{vendorId}/analytics/inventory
```

**Query Parameters**:
- Standard period parameters
- `categories`: Filter by product categories (comma-separated)
- `stockStatus`: Filter by stock status (in_stock, low_stock, out_of_stock)

**Response Example**:

```json
{
  "data": {
    "period": {
      "type": "last30days",
      "start": "2025-07-12T00:00:00Z",
      "end": "2025-08-11T23:59:59Z"
    },
    "overview": {
      "totalProducts": 235,
      "inStock": 189,
      "lowStock": 32,
      "outOfStock": 14,
      "inventoryValue": 45789.50,
      "inventoryTurnover": 3.2,
      "averageDaysToSell": 27
    },
    "stockLevelsByCategory": [
      {
        "category": "Dog Food",
        "inStock": 35,
        "lowStock": 8,
        "outOfStock": 2,
        "totalValue": 12450.75
      },
      {
        "category": "Cat Supplies",
        "inStock": 42,
        "lowStock": 5,
        "outOfStock": 3,
        "totalValue": 9876.50
      }
    ],
    "productPerformance": {
      "fastMoving": [
        {
          "id": "prod-12345",
          "name": "Premium Dog Food - Large Breed",
          "sku": "DGF-LRG-001",
          "currentStock": 12,
          "salesVelocity": 1.5,
          "daysToStockout": 8,
          "restockUrgency": "high",
          "profitMargin": 35
        }
      ],
      "slowMoving": [
        {
          "id": "prod-78901",
          "name": "Designer Pet Collar - Medium",
          "sku": "DPC-MED-001",
          "currentStock": 18,
          "salesVelocity": 0.1,
          "daysToStockout": 180,
          "restockUrgency": "low",
          "profitMargin": 55
        }
      ]
    },
    "stockHistory": {
      "stockLevelTrends": [
        {
          "date": "2025-07-12",
          "inStock": 195,
          "lowStock": 30,
          "outOfStock": 10
        },
        {
          "date": "2025-07-19",
          "inStock": 192,
          "lowStock": 31,
          "outOfStock": 12
        },
        {
          "date": "2025-07-26",
          "inStock": 190,
          "lowStock": 32,
          "outOfStock": 13
        },
        {
          "date": "2025-08-02",
          "inStock": 189,
          "lowStock": 32,
          "outOfStock": 14
        }
      ],
      "inventoryMovements": [
        {
          "date": "2025-07-15",
          "received": 35,
          "sold": 23,
          "adjusted": -2,
          "netChange": 10
        },
        {
          "date": "2025-07-22",
          "received": 25,
          "sold": 28,
          "adjusted": 0,
          "netChange": -3
        }
      ]
    },
    "recommendations": {
      "restock": [
        {
          "id": "prod-12345",
          "name": "Premium Dog Food - Large Breed",
          "sku": "DGF-LRG-001",
          "currentStock": 12,
          "recommendedOrder": 15,
          "reason": "High sales velocity",
          "potentialRevenue": 748.50
        }
      ],
      "discontinue": [
        {
          "id": "prod-89012",
          "name": "Pet Costume - Medium",
          "sku": "PCS-MED-003",
          "currentStock": 8,
          "lastSold": "2025-04-12T10:30:00Z",
          "daysNoSales": 121,
          "potentialLoss": 159.60
        }
      ]
    }
  }
}
```

## Marketing Analytics Screen

**API Endpoints**:

```
GET /vendors/{vendorId}/analytics/marketing
```

**Query Parameters**:
- Standard period and comparison parameters
- `channels`: Filter by marketing channels (comma-separated)
- `campaigns`: Filter by campaign IDs (comma-separated)

**Response Example**:

```json
{
  "data": {
    "period": {
      "type": "last30days",
      "start": "2025-07-12T00:00:00Z",
      "end": "2025-08-11T23:59:59Z"
    },
    "overview": {
      "totalCampaigns": 8,
      "activeCampaigns": 3,
      "totalSpend": 1250.00,
      "totalRevenue": 7850.25,
      "roi": 528,
      "customerAcquisitionCost": 18.66
    },
    "channelPerformance": [
      {
        "channel": "Email",
        "spend": 350.00,
        "revenue": 2980.75,
        "roi": 751.6,
        "conversionRate": 3.8,
        "customerAcquisition": 42
      },
      {
        "channel": "Social Media",
        "spend": 600.00,
        "revenue": 3250.50,
        "roi": 441.8,
        "conversionRate": 2.5,
        "customerAcquisition": 38
      },
      {
        "channel": "Search",
        "spend": 300.00,
        "revenue": 1619.00,
        "roi": 439.7,
        "conversionRate": 4.2,
        "customerAcquisition": 27
      }
    ],
    "campaignPerformance": [
      {
        "id": "cmp-12345",
        "name": "Summer Sale Email",
        "channel": "Email",
        "spend": 150.00,
        "revenue": 1580.25,
        "roi": 953.5,
        "conversionRate": 4.2,
        "impressions": 5000,
        "clicks": 650,
        "ctr": 13.0,
        "acquisitions": 27
      },
      {
        "id": "cmp-12346",
        "name": "Pet Care Tips - Social",
        "channel": "Social Media",
        "spend": 200.00,
        "revenue": 950.75,
        "roi": 375.4,
        "conversionRate": 1.8,
        "impressions": 8500,
        "clicks": 720,
        "ctr": 8.5,
        "acquisitions": 13
      }
    ],
    "promotionPerformance": [
      {
        "id": "prm-12345",
        "name": "Summer Pet Sale",
        "code": "SUMMER25",
        "type": "discount",
        "discountValue": 15,
        "redemptions": 145,
        "revenue": 12501.75,
        "discountAmount": 1875.25,
        "averageOrderValue": 86.22
      }
    ],
    "audienceInsights": {
      "newVsExisting": {
        "new": {
          "percentage": 44,
          "conversionRate": 2.3,
          "acquisitionCost": 21.15
        },
        "existing": {
          "percentage": 56,
          "conversionRate": 4.1,
          "acquisitionCost": 0
        }
      },
      "demographicPerformance": [
        {
          "segment": "Pet Parents 25-34",
          "impressions": 3500,
          "clicks": 385,
          "ctr": 11.0,
          "conversions": 42,
          "conversionRate": 10.9
        },
        {
          "segment": "Pet Parents 35-44",
          "impressions": 4200,
          "clicks": 420,
          "ctr": 10.0,
          "conversions": 38,
          "conversionRate": 9.0
        }
      ]
    }
  }
}
```

## Custom Reports Screen

**API Endpoints**:

```
POST /vendors/{vendorId}/analytics/custom-reports
```

**Request Example**:

```json
{
  "name": "Q3 Sales by Product Category",
  "description": "Analysis of sales performance by product category for Q3 2025",
  "dateRange": {
    "startDate": "2025-07-01T00:00:00Z",
    "endDate": "2025-09-30T23:59:59Z"
  },
  "metrics": ["revenue", "units_sold", "profit_margin", "growth_rate"],
  "dimensions": ["product_category", "week", "sales_channel"],
  "filters": [
    {
      "field": "product_category",
      "operator": "in",
      "values": ["Dog Food", "Cat Food", "Pet Toys"]
    },
    {
      "field": "sales_channel",
      "operator": "equals",
      "values": ["online"]
    }
  ],
  "sort": [
    {
      "field": "revenue",
      "direction": "desc"
    }
  ],
  "format": "json"
}
```

**Response Example**:

```json
{
  "data": {
    "reportId": "rep-12345",
    "name": "Q3 Sales by Product Category",
    "generatedAt": "2025-08-11T15:30:00Z",
    "dateRange": {
      "startDate": "2025-07-01T00:00:00Z",
      "endDate": "2025-09-30T23:59:59Z"
    },
    "results": [
      {
        "product_category": "Dog Food",
        "week": "2025-W27",
        "sales_channel": "online",
        "revenue": 1256.75,
        "units_sold": 45,
        "profit_margin": 32.5,
        "growth_rate": 12.5
      },
      {
        "product_category": "Cat Food",
        "week": "2025-W27",
        "sales_channel": "online",
        "revenue": 875.50,
        "units_sold": 38,
        "profit_margin": 29.8,
        "growth_rate": 8.7
      }
    ],
    "summary": {
      "totalRevenue": 15689.25,
      "totalUnitsSold": 598,
      "averageProfitMargin": 31.2,
      "averageGrowthRate": 10.8
    },
    "downloadUrl": "https://api.petpro.com/vendors/ven-12345/reports/rep-12345/download"
  }
}
```
