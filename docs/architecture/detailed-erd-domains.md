# Detailed Entity-Relationship Diagram (ERD) for Key Domains

This document provides detailed ERD diagrams for the following core domains:
1. Pet Management
2. Product Management
3. E-Commerce Management
4. Order Management

## 1. Pet Management Domain - Detailed ERD

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email
        string phone
        string password_hash
        string role "user, vendor, admin"
        string address
        point location
        timestamp created_at
        timestamp updated_at
        boolean is_verified
        string verification_token
        string reset_token
        timestamp reset_token_expires
        json preferences
        string language
    }

    PETS {
        int id PK
        int owner_id FK
        string name
        string species
        string breed
        date birth_date
        decimal weight
        string gender "male, female"
        string color
        string microchip_id
        string image_url
        text notes
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PET_VACCINES {
        int id PK
        int pet_id FK
        string vaccine_name
        date vaccine_date
        date next_due_date
        string administered_by
        string batch_number
        string manufacturer
        string notes
        string image_url "vaccine certificate"
        boolean reminder_enabled
        timestamp created_at
        timestamp updated_at
    }

    PET_MEDICAL_RECORDS {
        int id PK
        int pet_id FK
        int clinic_id FK
        int booking_id FK
        date visit_date
        string diagnosis
        text treatment
        text prescription
        text notes
        string attending_vet
        string record_type "checkup, surgery, emergency"
        string document_url
        timestamp created_at
        timestamp updated_at
    }

    PET_ALLERGIES {
        int id PK
        int pet_id FK
        string allergy_type "food, medication, environmental"
        string allergen
        string severity "mild, moderate, severe"
        string symptoms
        text notes
        date diagnosed_date
        timestamp created_at
        timestamp updated_at
    }

    PET_MEDICATIONS {
        int id PK
        int pet_id FK
        int medical_record_id FK
        string name
        string dosage
        string frequency
        date start_date
        date end_date
        boolean is_active
        text notes
        boolean reminder_enabled
        timestamp created_at
        timestamp updated_at
    }
    
    PET_DIET_PLANS {
        int id PK
        int pet_id FK
        string diet_type
        string food_name
        string brand
        string portion_size
        string frequency
        text special_instructions
        date start_date
        date end_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PET_GROWTH_RECORDS {
        int id PK
        int pet_id FK
        date record_date
        decimal weight
        decimal height
        decimal length
        text notes
        timestamp created_at
    }

    USERS ||--o{ PETS : owns
    PETS ||--o{ PET_VACCINES : has
    PETS ||--o{ PET_MEDICAL_RECORDS : has
    PETS ||--o{ PET_ALLERGIES : has
    PETS ||--o{ PET_MEDICATIONS : prescribed
    PETS ||--o{ PET_DIET_PLANS : follows
    PETS ||--o{ PET_GROWTH_RECORDS : tracks
    PET_MEDICAL_RECORDS ||--o{ PET_MEDICATIONS : prescribes
```

## 2. Product Management Domain - Detailed ERD

```mermaid
erDiagram
    PRODUCTS {
        int id PK
        int clinic_id FK
        string name
        text description
        decimal regular_price
        decimal sale_price
        int stock_qty
        int reserved_qty
        int low_stock_threshold
        string sku
        string barcode
        decimal weight
        string weight_unit "g, kg, oz, lb"
        decimal length
        decimal width
        decimal height
        string dimension_unit "cm, in"
        string image_url
        boolean is_active
        boolean featured
        boolean is_virtual
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    PRODUCT_CATEGORIES {
        int id PK
        string name
        string slug
        text description
        int parent_id FK "self-reference"
        string image_url
        int display_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_CATEGORY_MAPPING {
        int id PK
        int product_id FK
        int category_id FK
        timestamp created_at
    }
    
    PRODUCT_IMAGES {
        int id PK
        int product_id FK
        string image_url
        string alt_text
        int display_order
        boolean is_primary
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_VARIANTS {
        int id PK
        int product_id FK
        string name
        string sku
        decimal price
        int stock_qty
        string image_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    VARIANT_ATTRIBUTES {
        int id PK
        int variant_id FK
        string attribute_name "color, size, material"
        string attribute_value
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_TAGS {
        int id PK
        string name
        string slug
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_TAG_MAPPING {
        int id PK
        int product_id FK
        int tag_id FK
        timestamp created_at
    }
    
    PRODUCT_INVENTORY_HISTORY {
        int id PK
        int product_id FK
        int variant_id FK
        string action "restock, sale, return, adjustment"
        int quantity_change "positive for increase, negative for decrease"
        int new_quantity
        text notes
        int order_id FK
        timestamp created_at
    }
    
    PRODUCT_DISCOUNTS {
        int id PK
        int product_id FK
        int variant_id FK
        string discount_type "percentage, fixed"
        decimal amount
        date start_date
        date end_date
        boolean is_active
        string coupon_code
        int usage_limit
        int usage_count
        timestamp created_at
        timestamp updated_at
    }

    SUPPLIERS {
        int id PK
        string name
        string contact_person
        string email
        string phone
        string address
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_SUPPLIERS {
        int id PK
        int product_id FK
        int supplier_id FK
        string supplier_sku
        decimal cost_price
        int min_order_qty
        int lead_time_days
        boolean is_primary_supplier
        timestamp created_at
        timestamp updated_at
    }

    CLINICS ||--o{ PRODUCTS : sells
    PRODUCT_CATEGORIES ||--o{ PRODUCT_CATEGORY_MAPPING : includes
    PRODUCTS ||--o{ PRODUCT_CATEGORY_MAPPING : belongs_to
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has_variants
    PRODUCT_VARIANTS ||--o{ VARIANT_ATTRIBUTES : has_attributes
    PRODUCTS ||--o{ PRODUCT_TAG_MAPPING : has_tags
    PRODUCT_TAGS ||--o{ PRODUCT_TAG_MAPPING : tagged_to
    PRODUCTS ||--o{ PRODUCT_INVENTORY_HISTORY : tracks
    PRODUCT_VARIANTS ||--o{ PRODUCT_INVENTORY_HISTORY : tracks
    PRODUCTS ||--o{ PRODUCT_DISCOUNTS : has_discounts
    PRODUCT_VARIANTS ||--o{ PRODUCT_DISCOUNTS : has_discounts
    SUPPLIERS ||--o{ PRODUCT_SUPPLIERS : supplies
    PRODUCTS ||--o{ PRODUCT_SUPPLIERS : sourced_from
    PRODUCT_CATEGORIES ||--o{ PRODUCT_CATEGORIES : has_subcategories
```

## 3. E-Commerce Management Domain - Detailed ERD

```mermaid
erDiagram
    SHOPPING_CARTS {
        int id PK
        int user_id FK
        string session_id "for guests"
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }
    
    CART_ITEMS {
        int id PK
        int cart_id FK
        int product_id FK
        int variant_id FK
        int quantity
        decimal unit_price
        decimal total_price
        timestamp created_at
        timestamp updated_at
    }
    
    WISHLISTS {
        int id PK
        int user_id FK
        string name
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }
    
    WISHLIST_ITEMS {
        int id PK
        int wishlist_id FK
        int product_id FK
        int variant_id FK
        timestamp added_at
    }
    
    COUPONS {
        int id PK
        string code
        string type "percentage, fixed, free_shipping"
        decimal amount
        decimal min_purchase
        date start_date
        date end_date
        int usage_limit
        int usage_count
        boolean is_active
        boolean single_use
        int clinic_id FK "null for platform-wide coupons"
        timestamp created_at
        timestamp updated_at
    }
    
    USER_COUPONS {
        int id PK
        int user_id FK
        int coupon_id FK
        boolean is_used
        timestamp used_at
        timestamp expires_at
        timestamp created_at
    }
    
    SHIPPING_ZONES {
        int id PK
        string name
        string regions "JSON array of regions/cities"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    SHIPPING_METHODS {
        int id PK
        int shipping_zone_id FK
        string provider "JNE, SiCepat, Grab"
        string name
        string service_code
        string description
        decimal base_cost
        boolean is_active
        json cost_rules "weight or price based rules"
        timestamp created_at
        timestamp updated_at
    }
    
    USER_ADDRESSES {
        int id PK
        int user_id FK
        string recipient_name
        string phone
        string address_line1
        string address_line2
        string city
        string province
        string postal_code
        point coordinates
        boolean is_default_shipping
        boolean is_default_billing
        string address_type "home, work, other"
        string notes
        timestamp created_at
        timestamp updated_at
    }

    PAYMENT_METHODS {
        int id PK
        string name
        string provider "Midtrans, Xendit"
        string type "credit_card, bank_transfer, e-wallet"
        json configuration
        boolean is_active
        decimal fee_percentage
        decimal fixed_fee
        timestamp created_at
        timestamp updated_at
    }

    USERS ||--o{ SHOPPING_CARTS : has
    SHOPPING_CARTS ||--o{ CART_ITEMS : contains
    USERS ||--o{ WISHLISTS : has
    WISHLISTS ||--o{ WISHLIST_ITEMS : contains
    PRODUCTS ||--o{ CART_ITEMS : added_to
    PRODUCT_VARIANTS ||--o{ CART_ITEMS : added_to
    PRODUCTS ||--o{ WISHLIST_ITEMS : saved_in
    PRODUCT_VARIANTS ||--o{ WISHLIST_ITEMS : saved_in
    USERS ||--o{ USER_COUPONS : receives
    COUPONS ||--o{ USER_COUPONS : assigned_to
    CLINICS ||--o{ COUPONS : offers
    SHIPPING_ZONES ||--o{ SHIPPING_METHODS : has
    USERS ||--o{ USER_ADDRESSES : has
```

## 4. Order Management Domain - Detailed ERD

```mermaid
erDiagram
    ORDERS {
        int id PK
        int user_id FK
        int clinic_id FK
        string order_number
        decimal subtotal
        decimal shipping_fee
        decimal tax
        decimal discount_amount
        decimal total
        string status "pending, processing, shipped, delivered, cancelled, refunded"
        string payment_status "pending, paid, failed, refunded"
        string payment_id FK
        int shipping_address_id FK
        int billing_address_id FK
        string shipping_method_id FK
        string tracking_number
        int coupon_id FK
        string notes
        string cancellation_reason
        timestamp order_date
        timestamp paid_at
        timestamp shipped_at
        timestamp delivered_at
        timestamp cancelled_at
        timestamp refunded_at
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int variant_id FK
        string product_name "stored at time of order"
        string variant_name
        json product_data "snapshot of product at order time"
        int quantity
        decimal unit_price
        decimal tax
        decimal discount
        decimal total
        timestamp created_at
    }
    
    ORDER_STATUS_HISTORY {
        int id PK
        int order_id FK
        string old_status
        string new_status
        int updated_by_user_id FK
        text notes
        timestamp created_at
    }
    
    PAYMENTS {
        int id PK
        string reference_id "order_id or booking_id"
        string reference_type "order, booking"
        decimal amount
        string payment_method_id FK
        string provider "Midtrans, Xendit"
        string provider_reference
        string status "pending, success, failed, refunded"
        json request_data
        json response_data
        timestamp expires_at
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
    
    REFUNDS {
        int id PK
        int payment_id FK
        int order_id FK
        decimal amount
        string status "pending, processed, rejected"
        string reason
        json refund_data
        int requested_by_user_id FK
        int processed_by_user_id FK
        timestamp requested_at
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }
    
    SHIPMENTS {
        int id PK
        int order_id FK
        string tracking_number
        string carrier "JNE, SiCepat, Grab"
        string service_type
        decimal shipping_cost
        string status "processing, shipped, delivered, returned"
        date estimated_delivery
        date actual_delivery
        json tracking_history "JSON array of status updates"
        timestamp created_at
        timestamp updated_at
    }
    
    SHIPMENT_ITEMS {
        int id PK
        int shipment_id FK
        int order_item_id FK
        int quantity
        timestamp created_at
    }
    
    INVOICES {
        int id PK
        int order_id FK
        string invoice_number
        date invoice_date
        date due_date
        string status "draft, issued, paid, void"
        timestamp created_at
        timestamp updated_at
    }
    
    COMMISSION_TRANSACTIONS {
        int id PK
        int order_id FK
        int clinic_id FK
        decimal order_total
        decimal commission_rate
        decimal commission_amount
        decimal clinic_payout
        string status "pending, processed, paid"
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }
    
    RETURNS {
        int id PK
        int order_id FK
        string return_reason
        string status "requested, approved, received, processed, rejected"
        text notes
        timestamp requested_at
        timestamp approved_at
        timestamp received_at
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }
    
    RETURN_ITEMS {
        int id PK
        int return_id FK
        int order_item_id FK
        int quantity
        string condition
        string return_action "refund, exchange, repair"
        decimal refund_amount
        timestamp created_at
    }

    USERS ||--o{ ORDERS : places
    CLINICS ||--o{ ORDERS : fulfills
    ORDERS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : ordered_as
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : ordered_as
    ORDERS ||--o{ ORDER_STATUS_HISTORY : tracks
    USERS ||--o{ ORDER_STATUS_HISTORY : updates
    ORDERS ||--|| PAYMENTS : paid_through
    PAYMENTS ||--o{ REFUNDS : processed_as
    ORDERS ||--o{ REFUNDS : refunded_for
    ORDERS ||--o{ SHIPMENTS : delivered_via
    SHIPMENTS ||--o{ SHIPMENT_ITEMS : contains
    ORDER_ITEMS ||--o{ SHIPMENT_ITEMS : shipped_as
    ORDERS ||--|| INVOICES : billed_by
    ORDERS ||--o{ COMMISSION_TRANSACTIONS : generates
    CLINICS ||--o{ COMMISSION_TRANSACTIONS : earns
    ORDERS ||--o{ RETURNS : processed_for
    RETURNS ||--o{ RETURN_ITEMS : includes
    ORDER_ITEMS ||--o{ RETURN_ITEMS : returned_as
    COUPONS ||--o{ ORDERS : applied_to
    USER_ADDRESSES ||--o{ ORDERS : ships_to
    USER_ADDRESSES ||--o{ ORDERS : bills_to
    SHIPPING_METHODS ||--o{ ORDERS : ships_via
    PAYMENT_METHODS ||--o{ PAYMENTS : processed_via
```

## Cross-Domain Relationships

```mermaid
erDiagram
    PETS ||--o{ BOOKINGS : scheduled_for
    ORDERS ||--o{ BOOKINGS : generated_from "subscription orders"
    PET_MEDICAL_RECORDS ||--o{ PRODUCT_RECOMMENDATIONS : leads_to
    
    PRODUCT_RECOMMENDATIONS {
        int id PK
        int medical_record_id FK
        int product_id FK
        text recommendation_note
        string recommendation_type "medication, food, accessory"
        boolean is_prescription
        timestamp created_at
    }
    
    PRODUCT_SUBSCRIPTIONS {
        int id PK
        int user_id FK
        int pet_id FK
        int product_id FK
        int variant_id FK
        int quantity
        string frequency "weekly, biweekly, monthly"
        date next_delivery_date
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_SUBSCRIPTIONS ||--o{ ORDERS : generates
    PETS ||--o{ PRODUCT_SUBSCRIPTIONS : needs
    
    USER_ACTIVITY_LOG {
        int id PK
        int user_id FK
        string activity_type
        string entity_type "product, clinic, pet, order"
        int entity_id
        json old_values
        json new_values
        timestamp created_at
    }
    
    USERS ||--o{ USER_ACTIVITY_LOG : generates
```

## Database Indexing Strategy Extensions

- **Pet Management Indexes**
  - (owner_id, is_active) on PETS
  - (pet_id, vaccine_name) on PET_VACCINES
  - (pet_id, visit_date) on PET_MEDICAL_RECORDS
  - (pet_id, allergy_type) on PET_ALLERGIES
  - (pet_id, is_active) on PET_MEDICATIONS

- **Product Management Indexes**
  - (clinic_id, is_active) on PRODUCTS
  - (name, clinic_id) on PRODUCTS for search
  - (sku) on PRODUCTS for unique lookups
  - (product_id, is_primary) on PRODUCT_IMAGES
  - Full-text search index on product name and description

- **E-Commerce Indexes**
  - (user_id, expires_at) on SHOPPING_CARTS
  - (cart_id, product_id, variant_id) on CART_ITEMS
  - (code) unique index on COUPONS
  - (user_id, is_default_shipping) on USER_ADDRESSES
  - (session_id) on SHOPPING_CARTS for guest cart management

- **Order Management Indexes**
  - (user_id, status) on ORDERS
  - (clinic_id, status) on ORDERS
  - (order_number) unique index on ORDERS
  - (payment_id) on ORDERS
  - (order_id, product_id) on ORDER_ITEMS
  - (reference_id, reference_type) on PAYMENTS
  - (tracking_number) on SHIPMENTS
  - (order_id, status) on RETURNS
  - (invoice_number) unique index on INVOICES
  
- **Temporal Indexes**
  - (created_at) on ORDERS for date range queries
  - (next_delivery_date) on PRODUCT_SUBSCRIPTIONS
  - (next_due_date) on PET_VACCINES for reminder queries
  - (expires_at) on SHOPPING_CARTS for cleanup operations

## Data Partitioning Strategy

- **Order History Partitioning**
  - Orders table partitioned by date range (monthly)
  - Older order data moved to archive tables after 6 months
  - Archive tables partitioned by year

- **Product Data Partitioning**
  - Products partitioned by clinic_id for multi-tenant isolation
  - Product reviews partitioned by date ranges

- **Logging Tables Partitioning**
  - USER_ACTIVITY_LOG partitioned by week
  - ORDER_STATUS_HISTORY partitioned by month

## Data Validation Rules

- **Pet Management Validation**
  - Pet ages must be valid (birth_date cannot be in future)
  - Weight must be positive number
  - Vaccine dates must be chronological (vaccine_date < next_due_date)

- **Product Management Validation**
  - Price must be non-negative
  - Stock quantity must be non-negative integer
  - SKU must be unique within a clinic
  - Images must have valid URLs and file types

- **E-Commerce Validation**
  - Cart item quantity must be positive integer
  - Coupon usage cannot exceed usage_limit
  - Shipping address must have required fields (recipient, address, city, postal code)

- **Order Management Validation**
  - Order status transitions must follow allowed state machine
  - Refund amount cannot exceed original payment
  - Return quantity cannot exceed ordered quantity
  - Commission calculations must match defined rates

## Data Migration and Historization

- **Historical Data Management**
  - All tables include created_at and updated_at timestamps
  - Key entities include soft delete pattern (deleted_at)
  - Order data immutable after certain status transitions
  - Product changes tracked in history tables
  - Pricing history maintained for auditing and analytics

- **Archiving Strategy**
  - Orders older than 1 year moved to archive storage
  - Pet medical records never deleted, only archived
  - Product data versioned for historical accuracy
  - Analytics data aggregated and summarized over time

## Integration Points with External Systems

- **Payment Gateway Integration**
  - Payment tables designed for Midtrans and Xendit APIs
  - Transaction IDs and references stored for reconciliation
  - Webhook data captured in response_data JSON field

- **Shipping Provider Integration**
  - Shipment tracking compatible with JNE, SiCepat, and Grab Delivery APIs
  - Service codes mapped to provider-specific services
  - Tracking updates stored as JSON array for history

- **Inventory Management**
  - Product inventory synced with external systems
  - Stock reservations tracked for pending orders
  - Low stock alerts and automatic reordering thresholds
