# PetPro Vendor Dashboard - Settings Management API Mapping

This document maps the Settings Management wireframes to their corresponding API endpoints.

## Settings Overview Screen

**Wireframe Reference**: [Vendor Settings Management - Overview](/docs/ui-ux-guidelines/vendor-settings-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/settings
```

**Response Example**:

```json
{
  "data": {
    "account": {
      "profileComplete": true,
      "verificationStatus": "verified",
      "subscriptionPlan": "premium",
      "subscriptionRenewalDate": "2026-03-15T00:00:00Z"
    },
    "business": {
      "businessInfoComplete": true,
      "paymentMethodsConfigured": true,
      "taxSettingsConfigured": true
    },
    "operations": {
      "shippingMethodsConfigured": true,
      "returnPolicyConfigured": true,
      "openingHoursConfigured": true
    },
    "preferences": {
      "notificationsConfigured": true,
      "appearanceCustomized": false,
      "apiIntegrationConfigured": false
    }
  }
}
```

## Account Profile Screen

**Wireframe Reference**: [Vendor Settings Management - Account Profile](/docs/ui-ux-guidelines/vendor-settings-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/profile
```

**Response Example**:

```json
{
  "data": {
    "id": "ven-12345",
    "name": "Happy Paws Pet Clinic",
    "description": "Full-service pet clinic offering medical care, grooming, and premium pet products.",
    "logo": "https://storage.petpro.com/vendor-logos/happypaws.png",
    "coverImage": "https://storage.petpro.com/vendor-covers/happypaws-cover.jpg",
    "email": "contact@happypaws.com",
    "phone": "(555) 123-4567",
    "website": "www.happypawspetclinic.com",
    "socialMedia": {
      "facebook": "https://facebook.com/happypawsclinic",
      "instagram": "https://instagram.com/happypawsclinic",
      "twitter": null,
      "youtube": null
    },
    "address": {
      "street": "123 Pet Care Avenue",
      "city": "Petropolis",
      "state": "California",
      "postalCode": "90210",
      "country": "United States",
      "coordinates": {
        "lat": 34.0522,
        "lng": -118.2437
      }
    },
    "businessDetails": {
      "registrationNumber": "BRN-12345678",
      "taxId": "TAX-87654321",
      "businessType": "Veterinary Clinic & Shop",
      "foundedYear": 2010
    },
    "verificationStatus": "verified",
    "memberSince": "2024-03-15T00:00:00Z",
    "subscriptionPlan": "premium",
    "subscriptionDetails": {
      "plan": "premium",
      "price": 49.99,
      "billingCycle": "monthly",
      "nextBillingDate": "2025-09-15T00:00:00Z",
      "features": [
        "Unlimited products",
        "Priority support",
        "Advanced analytics",
        "Multiple staff accounts"
      ]
    }
  }
}
```

**Update Profile Endpoint**:

```
PUT /vendors/{vendorId}/profile
```

**Request Example**:

```json
{
  "name": "Happy Paws Pet Clinic & Spa",
  "description": "Full-service pet clinic offering medical care, premium grooming services, and high-quality pet products.",
  "phone": "(555) 123-4568",
  "website": "www.happypawspetclinic.com",
  "socialMedia": {
    "facebook": "https://facebook.com/happypawsclinic",
    "instagram": "https://instagram.com/happypawsclinic",
    "twitter": "https://twitter.com/happypawsclinic"
  }
}
```

**Response**: Updated profile object

## Upload Logo/Images

**API Endpoints**:

```
POST /vendors/{vendorId}/images/logo
POST /vendors/{vendorId}/images/cover
```

**Request**: Multipart form data with image file

**Response Example**:

```json
{
  "data": {
    "id": "img-12345",
    "type": "logo",
    "url": "https://storage.petpro.com/vendor-logos/happypaws-new.png",
    "width": 500,
    "height": 500,
    "fileSize": 128500,
    "uploadedAt": "2025-08-11T16:30:00Z"
  }
}
```

## Business Information Screen

**Wireframe Reference**: [Vendor Settings Management - Business Information](/docs/ui-ux-guidelines/vendor-settings-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/business-info
```

**Response Example**:

```json
{
  "data": {
    "legalName": "Happy Paws Veterinary Services LLC",
    "dba": "Happy Paws Pet Clinic",
    "businessType": "Limited Liability Company",
    "registrationNumber": "BRN-12345678",
    "taxId": "TAX-87654321",
    "vatNumber": "VAT-12345",
    "foundedYear": 2010,
    "businessSize": "11-50 employees",
    "industry": "Pet Care and Veterinary Services",
    "legalAddress": {
      "street": "123 Pet Care Avenue",
      "city": "Petropolis",
      "state": "California",
      "postalCode": "90210",
      "country": "United States"
    },
    "mailingAddress": {
      "street": "123 Pet Care Avenue",
      "city": "Petropolis",
      "state": "California",
      "postalCode": "90210",
      "country": "United States"
    },
    "businessContact": {
      "name": "John Smith",
      "position": "Owner",
      "email": "john.smith@happypaws.com",
      "phone": "(555) 123-4569"
    },
    "documents": [
      {
        "id": "doc-12345",
        "type": "business_license",
        "filename": "business_license_2025.pdf",
        "url": "https://storage.petpro.com/documents/ven-12345/business_license_2025.pdf",
        "uploadedAt": "2025-01-10T09:15:00Z",
        "expiryDate": "2026-01-10T00:00:00Z",
        "verificationStatus": "verified"
      },
      {
        "id": "doc-12346",
        "type": "insurance_certificate",
        "filename": "liability_insurance_2025.pdf",
        "url": "https://storage.petpro.com/documents/ven-12345/liability_insurance_2025.pdf",
        "uploadedAt": "2025-01-15T11:30:00Z",
        "expiryDate": "2026-01-15T00:00:00Z",
        "verificationStatus": "verified"
      }
    ]
  }
}
```

**Update Business Information Endpoint**:

```
PUT /vendors/{vendorId}/business-info
```

**Request Example**: Updated business information object

**Response**: Updated business information object

## Payment Settings Screen

**Wireframe Reference**: [Vendor Settings Management - Payment Settings](/docs/ui-ux-guidelines/vendor-settings-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/payment-settings
```

**Response Example**:

```json
{
  "data": {
    "payoutMethod": "bank_transfer",
    "payoutFrequency": "weekly",
    "bankAccount": {
      "accountName": "Happy Paws Veterinary Services LLC",
      "accountNumber": "XXXX-XXXX-XXXX-1234",
      "bankName": "First National Bank",
      "routingNumber": "XXX-XX-1234",
      "accountType": "business_checking",
      "verified": true
    },
    "alternatePayoutMethods": [],
    "taxForms": [
      {
        "id": "tax-12345",
        "type": "W-9",
        "year": 2025,
        "status": "submitted",
        "submissionDate": "2025-01-05T10:00:00Z"
      }
    ],
    "paymentHistory": {
      "lastPayout": {
        "id": "pay-45678",
        "date": "2025-08-08T00:00:00Z",
        "amount": 1256.78,
        "status": "completed"
      },
      "pendingAmount": 345.67,
      "totalPaidYear": 35678.90
    },
    "acceptedPaymentMethods": [
      {
        "type": "credit_card",
        "enabled": true,
        "supportedCards": ["visa", "mastercard", "amex", "discover"],
        "processingFee": 2.9,
        "additionalFee": 0.30
      },
      {
        "type": "paypal",
        "enabled": true,
        "email": "payments@happypaws.com",
        "processingFee": 3.5,
        "additionalFee": 0.30
      },
      {
        "type": "apple_pay",
        "enabled": true,
        "processingFee": 2.9,
        "additionalFee": 0.30
      }
    ]
  }
}
```

**Update Payment Settings Endpoint**:

```
PUT /vendors/{vendorId}/payment-settings
```

**Request Example**:

```json
{
  "payoutMethod": "bank_transfer",
  "payoutFrequency": "biweekly",
  "acceptedPaymentMethods": [
    {
      "type": "credit_card",
      "enabled": true
    },
    {
      "type": "paypal",
      "enabled": true
    },
    {
      "type": "apple_pay",
      "enabled": true
    },
    {
      "type": "google_pay",
      "enabled": true
    }
  ]
}
```

**Response**: Updated payment settings object

## Tax Settings

**API Endpoints**:

```
GET /vendors/{vendorId}/tax-settings
```

**Response Example**:

```json
{
  "data": {
    "taxRegistration": {
      "taxId": "TAX-87654321",
      "vatNumber": "VAT-12345",
      "issuingCountry": "United States",
      "issuingState": "California"
    },
    "taxableRegions": [
      {
        "country": "United States",
        "state": "California",
        "taxRate": 8.5,
        "taxRuleId": "txr-12345"
      },
      {
        "country": "United States",
        "state": "Nevada",
        "taxRate": 6.85,
        "taxRuleId": "txr-12346"
      }
    ],
    "productTaxClasses": [
      {
        "id": "ptc-12345",
        "name": "Standard Products",
        "description": "All standard taxable products",
        "defaultRate": 8.5,
        "productCount": 187
      },
      {
        "id": "ptc-12346",
        "name": "Pet Medications",
        "description": "Prescription pet medications",
        "defaultRate": 0,
        "productCount": 48
      }
    ],
    "automaticTaxCalculation": true,
    "taxSettings": {
      "pricesIncludeTax": false,
      "displayPricesInCheckout": "both_prices",
      "displayTaxTotals": "itemized"
    }
  }
}
```

**Update Tax Settings Endpoint**:

```
PUT /vendors/{vendorId}/tax-settings
```

**Request Example**: Updated tax settings object

**Response**: Updated tax settings object

## Shipping Settings

**API Endpoints**:

```
GET /vendors/{vendorId}/shipping-settings
```

**Response Example**:

```json
{
  "data": {
    "shippingOrigin": {
      "address": {
        "street": "123 Pet Care Avenue",
        "city": "Petropolis",
        "state": "California",
        "postalCode": "90210",
        "country": "United States"
      },
      "isBusinessAddress": true
    },
    "shippingMethods": [
      {
        "id": "shm-12345",
        "name": "Standard Shipping",
        "enabled": true,
        "estimatedDelivery": "3-5 business days",
        "cost": {
          "type": "flat_rate",
          "amount": 5.95
        },
        "freeShippingThreshold": 50.00
      },
      {
        "id": "shm-12346",
        "name": "Express Shipping",
        "enabled": true,
        "estimatedDelivery": "1-2 business days",
        "cost": {
          "type": "flat_rate",
          "amount": 12.95
        },
        "freeShippingThreshold": 100.00
      },
      {
        "id": "shm-12347",
        "name": "Local Pickup",
        "enabled": true,
        "estimatedDelivery": "Same day",
        "cost": {
          "type": "flat_rate",
          "amount": 0
        }
      }
    ],
    "shippingRestrictions": {
      "restrictedCountries": ["Cuba", "Iran", "North Korea", "Syria"],
      "restrictedStates": []
    },
    "packagingPreferences": {
      "useCustomPackaging": true,
      "defaultPackageTypes": [
        {
          "id": "pkg-12345",
          "name": "Small Box",
          "dimensions": {
            "length": 8,
            "width": 6,
            "height": 4,
            "unit": "in"
          },
          "maxWeight": {
            "value": 2,
            "unit": "lb"
          }
        },
        {
          "id": "pkg-12346",
          "name": "Medium Box",
          "dimensions": {
            "length": 12,
            "width": 10,
            "height": 6,
            "unit": "in"
          },
          "maxWeight": {
            "value": 5,
            "unit": "lb"
          }
        }
      ]
    },
    "carrierIntegrations": [
      {
        "carrier": "usps",
        "enabled": true,
        "accountNumber": "USPS-ACCT-1234"
      },
      {
        "carrier": "ups",
        "enabled": true,
        "accountNumber": "UPS-ACCT-5678"
      }
    ]
  }
}
```

**Update Shipping Settings Endpoint**:

```
PUT /vendors/{vendorId}/shipping-settings
```

**Request Example**: Updated shipping settings object

**Response**: Updated shipping settings object

## Store Hours & Availability

**API Endpoints**:

```
GET /vendors/{vendorId}/business-hours
```

**Response Example**:

```json
{
  "data": {
    "timeZone": "America/Los_Angeles",
    "regularHours": {
      "monday": [{ "open": "09:00", "close": "18:00" }],
      "tuesday": [{ "open": "09:00", "close": "18:00" }],
      "wednesday": [{ "open": "09:00", "close": "18:00" }],
      "thursday": [{ "open": "09:00", "close": "18:00" }],
      "friday": [{ "open": "09:00", "close": "18:00" }],
      "saturday": [{ "open": "10:00", "close": "16:00" }],
      "sunday": []
    },
    "specialHours": [
      {
        "date": "2025-12-24",
        "hours": [{ "open": "09:00", "close": "14:00" }],
        "note": "Christmas Eve"
      },
      {
        "date": "2025-12-25",
        "hours": [],
        "note": "Closed for Christmas"
      }
    ],
    "holidaySchedule": [
      {
        "date": "2025-01-01",
        "hours": [],
        "name": "New Year's Day",
        "note": "Closed"
      },
      {
        "date": "2025-07-04",
        "hours": [],
        "name": "Independence Day",
        "note": "Closed"
      }
    ],
    "appointmentAvailability": {
      "advanceBookingLimit": 30,
      "minAppointmentNotice": 4,
      "defaultAppointmentDuration": 30,
      "appointmentSlotInterval": 15,
      "maxDailyAppointments": 15
    }
  }
}
```

**Update Business Hours Endpoint**:

```
PUT /vendors/{vendorId}/business-hours
```

**Request Example**: Updated business hours object

**Response**: Updated business hours object

## Staff Management

**API Endpoints**:

```
GET /vendors/{vendorId}/staff
```

**Response Example**:

```json
{
  "data": [
    {
      "id": "stf-12345",
      "name": "John Smith",
      "email": "john.smith@happypaws.com",
      "phone": "(555) 123-4569",
      "role": "owner",
      "permissions": ["full_access"],
      "status": "active",
      "avatar": "https://storage.petpro.com/staff/john-smith.jpg",
      "createdAt": "2024-03-15T10:00:00Z"
    },
    {
      "id": "stf-23456",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@happypaws.com",
      "phone": "(555) 123-4570",
      "role": "manager",
      "permissions": ["inventory_management", "order_management", "appointment_management"],
      "status": "active",
      "avatar": "https://storage.petpro.com/staff/sarah-johnson.jpg",
      "createdAt": "2024-03-20T11:30:00Z"
    },
    {
      "id": "stf-34567",
      "name": "Emma Wilson",
      "email": "emma.wilson@happypaws.com",
      "phone": "(555) 123-4571",
      "role": "groomer",
      "permissions": ["appointment_management"],
      "status": "active",
      "avatar": "https://storage.petpro.com/staff/emma-wilson.jpg",
      "createdAt": "2024-04-05T09:15:00Z"
    }
  ]
}
```

**Add Staff Member Endpoint**:

```
POST /vendors/{vendorId}/staff
```

**Request Example**:

```json
{
  "name": "Michael Brown",
  "email": "michael.brown@happypaws.com",
  "phone": "(555) 123-4572",
  "role": "veterinarian",
  "permissions": ["appointment_management", "customer_management"],
  "sendInvitation": true
}
```

**Response**: New staff member object

## Notification Settings

**API Endpoints**:

```
GET /vendors/{vendorId}/notification-settings
```

**Response Example**:

```json
{
  "data": {
    "email": {
      "newOrders": true,
      "orderStatusChanges": true,
      "lowStockAlerts": true,
      "newReviews": true,
      "newAppointments": true,
      "appointmentReminders": true,
      "marketingUpdates": false
    },
    "push": {
      "newOrders": true,
      "orderStatusChanges": true,
      "lowStockAlerts": true,
      "newReviews": true,
      "newAppointments": true,
      "appointmentReminders": false
    },
    "sms": {
      "newOrders": false,
      "orderStatusChanges": false,
      "lowStockAlerts": false,
      "newReviews": false,
      "newAppointments": true,
      "appointmentReminders": true
    },
    "notificationRecipients": [
      {
        "name": "John Smith",
        "email": "john.smith@happypaws.com",
        "phone": "(555) 123-4569",
        "types": ["all"]
      },
      {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@happypaws.com",
        "phone": "(555) 123-4570",
        "types": ["orders", "inventory"]
      }
    ],
    "automatedMessages": {
      "orderConfirmation": true,
      "orderShipped": true,
      "orderDelivered": true,
      "appointmentReminder": true,
      "appointmentConfirmation": true,
      "reviewRequest": true
    }
  }
}
```

**Update Notification Settings Endpoint**:

```
PUT /vendors/{vendorId}/notification-settings
```

**Request Example**: Updated notification settings object

**Response**: Updated notification settings object

## API & Integration Settings

**API Endpoints**:

```
GET /vendors/{vendorId}/integration-settings
```

**Response Example**:

```json
{
  "data": {
    "apiKeys": [
      {
        "id": "key-12345",
        "name": "Inventory Management System",
        "key": "pk_••••••••••••••••••••••",
        "permissions": ["read_inventory", "write_inventory"],
        "createdAt": "2025-05-10T09:00:00Z",
        "lastUsed": "2025-08-11T07:30:00Z",
        "expiresAt": "2026-05-10T09:00:00Z"
      }
    ],
    "webhooks": [
      {
        "id": "whk-12345",
        "url": "https://erp.happypawsclinic.com/webhooks/petpro",
        "events": ["order.created", "order.updated", "inventory.updated"],
        "active": true,
        "createdAt": "2025-05-15T10:30:00Z",
        "lastTriggered": "2025-08-11T14:23:45Z"
      }
    ],
    "integrations": [
      {
        "service": "quickbooks",
        "status": "connected",
        "connectedAt": "2025-06-01T11:45:00Z",
        "settings": {
          "syncOrders": true,
          "syncInventory": true,
          "syncCustomers": true
        }
      },
      {
        "service": "mailchimp",
        "status": "connected",
        "connectedAt": "2025-06-05T14:20:00Z",
        "settings": {
          "syncCustomers": true,
          "defaultListId": "mc-list-12345"
        }
      }
    ]
  }
}
```

**Generate New API Key Endpoint**:

```
POST /vendors/{vendorId}/api-keys
```

**Request Example**:

```json
{
  "name": "Marketing Automation",
  "permissions": ["read_customers", "read_orders"],
  "expiresInDays": 365
}
```

**Response**: New API key object (with full key visible only once)

## Subscription Management

**API Endpoints**:

```
GET /vendors/{vendorId}/subscription
```

**Response Example**:

```json
{
  "data": {
    "currentPlan": {
      "id": "plan-12345",
      "name": "Premium",
      "price": 49.99,
      "billingCycle": "monthly",
      "startDate": "2025-03-15T00:00:00Z",
      "renewalDate": "2025-09-15T00:00:00Z",
      "status": "active",
      "autoRenew": true
    },
    "features": [
      {
        "name": "Products",
        "limit": "unlimited",
        "usage": 235
      },
      {
        "name": "Staff Accounts",
        "limit": 10,
        "usage": 3
      },
      {
        "name": "API Access",
        "limit": "included",
        "usage": "enabled"
      },
      {
        "name": "Advanced Analytics",
        "limit": "included",
        "usage": "enabled"
      }
    ],
    "paymentMethod": {
      "type": "credit_card",
      "brand": "Visa",
      "last4": "1234",
      "expiryMonth": 12,
      "expiryYear": 2028
    },
    "billingHistory": [
      {
        "id": "inv-12345",
        "date": "2025-08-15T00:00:00Z",
        "amount": 49.99,
        "status": "paid",
        "downloadUrl": "https://api.petpro.com/invoices/inv-12345"
      },
      {
        "id": "inv-12344",
        "date": "2025-07-15T00:00:00Z",
        "amount": 49.99,
        "status": "paid",
        "downloadUrl": "https://api.petpro.com/invoices/inv-12344"
      }
    ],
    "availablePlans": [
      {
        "id": "plan-12344",
        "name": "Basic",
        "price": 29.99,
        "billingCycle": "monthly",
        "mainFeatures": [
          "Up to 100 products",
          "3 staff accounts",
          "Basic analytics"
        ]
      },
      {
        "id": "plan-12345",
        "name": "Premium",
        "price": 49.99,
        "billingCycle": "monthly",
        "mainFeatures": [
          "Unlimited products",
          "10 staff accounts",
          "Advanced analytics",
          "API access"
        ]
      },
      {
        "id": "plan-12346",
        "name": "Professional",
        "price": 99.99,
        "billingCycle": "monthly",
        "mainFeatures": [
          "Unlimited products",
          "25 staff accounts",
          "Advanced analytics with custom reports",
          "Priority support",
          "Multiple location support"
        ]
      }
    ]
  }
}
```

**Update Subscription Endpoint**:

```
PUT /vendors/{vendorId}/subscription
```

**Request Example**:

```json
{
  "planId": "plan-12346",
  "billingCycle": "monthly",
  "autoRenew": true,
  "paymentMethodId": "pm-12345"
}
```

**Response**: Updated subscription object
