# Microservices Entity Relationship Diagrams
# マイクロサービスエンティティ関連図

**English**
This document contains comprehensive Entity Relationship Diagrams (ERD) for the PetPro microservices architecture, showing domain-specific data models and cross-service relationships.

**日本語**
このドキュメントには、PetProマイクロサービスアーキテクチャのための包括的なエンティティ関連図（ERD）が含まれており、ドメイン固有のデータモデルとサービス間の関係を示しています。

## Overview of Microservice Domains

```mermaid
graph TB
    subgraph "User Domain [Auth Service]"
        Users(Users)
        UserProfiles(User Profiles)
        Roles(Roles)
        Permissions(Permissions)
    end
    
    subgraph "Pet Domain [Pet Service]"
        Pets(Pets)
        PetMedicalRecords(Medical Records)
        PetSpecies(Species)
        PetBreeds(Breeds)
    end
    
    subgraph "Booking Domain [Booking Service]"
        Bookings(Bookings)
        Slots(Time Slots)
        Services(Services)
        Payments(Payments)
        Reviews(Reviews)
    end
    
    subgraph "Clinic Domain [Clinic Service]"
        Clinics(Clinics)
        Staff(Staff)
        OperatingHours(Operating Hours)
        Facilities(Facilities)
    end
    
    subgraph "Inventory Domain [Inventory Service]"
        Products(Products)
        Inventory(Inventory)
        ProductCategories(Categories)
        ProductOrders(Orders)
    end
    
    subgraph "Vendor Domain [Vendor Service]"
        Vendors(Vendors)
        VendorProducts(Products)
        VendorOrders(Orders)
        VendorPayments(Payments)
    end
    
    Users -->|references| Pets
    Users -->|references| Bookings
    Users -->|references| Vendors
    Pets -->|used in| Bookings
    Clinics -->|referenced by| Services
    Clinics -->|referenced by| Staff
    Clinics -->|owns| Services
    Services -->|scheduled as| Slots
    Slots -->|booked as| Bookings
    Bookings -->|generates| Payments
    Bookings -->|receives| Reviews
    Products -->|tracked in| Inventory
    Products -->|belongs to| ProductCategories
    Vendors -->|sells| VendorProducts
    VendorProducts -->|ordered as| VendorOrders
    VendorOrders -->|generates| VendorPayments
```

## Database Schemas by Microservice

Each microservice maintains its own database schema, with service boundaries clearly defined. References to entities in other services are maintained via unique IDs and eventual consistency patterns.

## Auth Service Schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string password_hash
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login_at
    }
    
    USER_PROFILES {
        uuid id PK
        uuid user_id FK
        string full_name
        string phone_number
        string address
        json notification_prefs
        string profile_picture
        timestamp created_at
        timestamp updated_at
    }
    
    ROLES {
        uuid id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    PERMISSIONS {
        uuid id PK
        string name
        string description
        timestamp created_at
    }
    
    USER_ROLES {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        timestamp created_at
    }
    
    ROLE_PERMISSIONS {
        uuid id PK
        uuid role_id FK
        uuid permission_id FK
        timestamp created_at
    }
    
    OTP_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash
        enum type
        timestamp expires_at
        boolean is_used
        timestamp created_at
    }
    
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash
        string device_info
        timestamp expires_at
        timestamp created_at
    }
    
    USERS ||--o| USER_PROFILES : has
    USERS ||--o{ USER_ROLES : has
    USERS ||--o{ OTP_TOKENS : generates
    USERS ||--o{ REFRESH_TOKENS : issues
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : granted_to
```

## Pet Service Schema

```mermaid
erDiagram
    PETS {
        uuid id PK
        uuid user_id FK
        string name
        string species
        string breed
        date birthdate
        float weight
        string gender
        json medical_history
        string photo_url
        string microchip_id
        timestamp created_at
        timestamp updated_at
    }
    
    PET_MEDICAL_RECORDS {
        uuid id PK
        uuid pet_id FK
        date record_date
        string diagnosis
        string treatment
        uuid veterinarian_id
        string record_type
        json attachments
        timestamp created_at
        timestamp updated_at
    }
    
    SPECIES {
        uuid id PK
        string name
        string description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    BREEDS {
        uuid id PK
        uuid species_id FK
        string name
        string description
        json characteristics
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    VACCINATIONS {
        uuid id PK
        uuid pet_id FK
        string vaccine_name
        date administered_date
        date expiry_date
        uuid administered_by
        json certificate_info
        timestamp created_at
        timestamp updated_at
    }
    
    PETS ||--o{ PET_MEDICAL_RECORDS : has
    PETS ||--o{ VACCINATIONS : receives
    SPECIES ||--o{ BREEDS : has
    PETS }|--|| SPECIES : belongs_to
    PETS }|--|| BREEDS : belongs_to
```

## Booking Service Schema

```mermaid
erDiagram
    SERVICES {
        uuid id PK
        uuid clinic_id
        string name
        string description
        decimal price
        int duration_minutes
        boolean requires_approval
        boolean is_available
        json availability_exceptions
        timestamp created_at
        timestamp updated_at
    }
    
    SLOTS {
        uuid id PK
        uuid service_id FK
        uuid staff_id
        date slot_date
        time slot_start_time
        time slot_end_time
        enum status
        int capacity
        int booked_count
        timestamp created_at
        timestamp updated_at
    }
    
    RESERVATIONS {
        uuid id PK
        uuid user_id
        uuid pet_id
        uuid service_id FK
        uuid slot_id FK
        string lock_id
        enum status
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }
    
    BOOKINGS {
        uuid id PK
        uuid reservation_id FK
        uuid user_id
        uuid pet_id
        uuid clinic_id
        uuid service_id FK
        uuid slot_id FK
        uuid payment_id FK
        string reference_code
        decimal amount
        enum status
        string cancellation_reason
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENTS {
        uuid id PK
        uuid booking_id FK
        string external_reference
        decimal amount
        string currency
        enum payment_method
        enum status
        json payment_details
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
    
    FINANCIAL_ENTRIES {
        uuid id PK
        uuid booking_id FK
        uuid clinic_id
        enum type
        decimal total_amount
        decimal platform_fee
        decimal clinic_amount
        decimal tax_amount
        string currency
        enum status
        timestamp settlement_date
        timestamp created_at
        timestamp updated_at
    }
    
    REVIEWS {
        uuid id PK
        uuid booking_id FK
        uuid user_id
        uuid clinic_id
        uuid service_id FK
        int rating
        text comment
        json attachments
        boolean is_verified
        boolean is_published
        timestamp created_at
        timestamp updated_at
    }
    
    SERVICES ||--o{ SLOTS : has
    SLOTS ||--o{ RESERVATIONS : reserved_for
    RESERVATIONS ||--o| BOOKINGS : confirmed_as
    BOOKINGS ||--|| PAYMENTS : has
    BOOKINGS ||--|| FINANCIAL_ENTRIES : generates
    BOOKINGS ||--o| REVIEWS : receives
```

## Clinic Service Schema

```mermaid
erDiagram
    CLINICS {
        uuid id PK
        uuid owner_id
        string name
        string address
        string city
        string province
        string postal_code
        float latitude
        float longitude
        string phone_number
        string email
        string website
        string description
        json operating_hours
        json facilities
        enum status
        decimal commission_rate
        timestamp created_at
        timestamp updated_at
    }
    
    STAFF {
        uuid id PK
        uuid clinic_id FK
        string name
        string email
        string phone
        string role
        string specialization
        string photo_url
        json working_hours
        json qualifications
        timestamp created_at
        timestamp updated_at
    }
    
    CLINIC_SERVICES {
        uuid id PK
        uuid clinic_id FK
        uuid service_id
        boolean is_active
        decimal price_override
        timestamp created_at
        timestamp updated_at
    }
    
    CLINIC_DOCUMENTS {
        uuid id PK
        uuid clinic_id FK
        enum document_type
        string document_name
        string document_url
        boolean is_verified
        timestamp verified_at
        timestamp created_at
        timestamp updated_at
    }
    
    CLINIC_RATINGS {
        uuid id PK
        uuid clinic_id FK
        float avg_rating
        int review_count
        json rating_distribution
        timestamp last_updated
    }
    
    CLINICS ||--o{ STAFF : employs
    CLINICS ||--o{ CLINIC_SERVICES : offers
    CLINICS ||--o{ CLINIC_DOCUMENTS : has
    CLINICS ||--|| CLINIC_RATINGS : has
```

## Inventory Service Schema

```mermaid
erDiagram
    PRODUCT_CATEGORIES {
        uuid id PK
        uuid parent_id FK
        string name
        string description
        string image_url
        boolean is_active
        int display_order
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        uuid id PK
        uuid category_id FK
        uuid vendor_id
        string name
        string description
        text details
        json images
        decimal regular_price
        decimal sale_price
        boolean on_sale
        string sku
        string barcode
        float weight
        json dimensions
        boolean is_active
        boolean is_featured
        timestamp created_at
        timestamp updated_at
    }
    
    INVENTORY {
        uuid id PK
        uuid product_id FK
        int quantity_available
        int quantity_reserved
        int reorder_threshold
        string warehouse_location
        timestamp last_restock_date
        timestamp created_at
        timestamp updated_at
    }
    
    INVENTORY_TRANSACTIONS {
        uuid id PK
        uuid product_id FK
        enum transaction_type
        int quantity
        string reference_id
        string reference_type
        json metadata
        timestamp created_at
    }
    
    PRODUCT_CATEGORIES ||--o{ PRODUCT_CATEGORIES : has_subcategories
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--|| INVENTORY : has
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : records
```

## Vendor Service Schema

```mermaid
erDiagram
    VENDORS {
        uuid id PK
        uuid user_id
        string business_name
        string business_type
        string contact_name
        string email
        string phone
        string address
        string city
        string province
        string postal_code
        string tax_id
        string website
        enum status
        json verification_data
        decimal commission_rate
        timestamp created_at
        timestamp updated_at
    }
    
    VENDOR_PRODUCTS {
        uuid id PK
        uuid vendor_id FK
        uuid product_id
        decimal vendor_price
        decimal marketplace_price
        int quantity_available
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        uuid id PK
        uuid customer_id
        string order_number
        decimal total_amount
        enum status
        timestamp order_date
        json shipping_address
        json billing_address
        string payment_method
        string notes
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id
        uuid vendor_id FK
        int quantity
        decimal unit_price
        decimal subtotal
        decimal tax
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    VENDOR_PAYOUTS {
        uuid id PK
        uuid vendor_id FK
        decimal amount
        string currency
        enum status
        string reference_number
        json transaction_details
        timestamp payout_date
        timestamp created_at
        timestamp updated_at
    }
    
    VENDORS ||--o{ VENDOR_PRODUCTS : offers
    VENDORS ||--o{ ORDER_ITEMS : fulfills
    VENDORS ||--o{ VENDOR_PAYOUTS : receives
    ORDERS ||--o{ ORDER_ITEMS : contains
```

## Cross-Service Data Consistency

### Event-Based Consistency Model

```mermaid
sequenceDiagram
    participant Auth
    participant Booking
    participant Clinic
    participant Inventory
    participant Vendor
    
    Auth->>Auth: User Created/Updated
    Auth-->>Booking: UserCreatedEvent
    Auth-->>Clinic: UserCreatedEvent
    Auth-->>Vendor: UserCreatedEvent
    
    Booking->>Booking: Booking Created/Updated
    Booking-->>Clinic: BookingCreatedEvent
    Booking-->>Auth: BookingNotificationEvent
    
    Clinic->>Clinic: Clinic Service Updated
    Clinic-->>Booking: ServiceUpdatedEvent
    
    Inventory->>Inventory: Product Updated
    Inventory-->>Vendor: ProductUpdatedEvent
    
    Vendor->>Vendor: Order Created
    Vendor-->>Inventory: InventoryReservedEvent
```

### Materialized View Pattern for Cross-Service Queries

```mermaid
graph TD
    subgraph "Services with Source Data"
        A[Auth Service] --> |User events| D[API Gateway]
        B[Booking Service] --> |Booking events| D
        C[Inventory Service] --> |Product events| D
    end
    
    D --> E[Event Bus]
    E --> F[View Updater Service]
    
    F --> G[(User Bookings View)]
    F --> H[(Product Availability View)]
    F --> I[(Vendor Performance View)]
    
    G --> J[Read API]
    H --> J
    I --> J
    
    J --> K[Client Applications]
```

## Microservices Database Deployment Strategy

### Physical Database Separation

```mermaid
flowchart TB
    subgraph "Database Cluster"
        db_auth[(Auth DB)]
        db_booking[(Booking DB)]
        db_clinic[(Clinic DB)]
        db_inventory[(Inventory DB)]
        db_vendor[(Vendor DB)]
    end
    
    subgraph "Services"
        auth_svc[Auth Service]
        booking_svc[Booking Service]
        clinic_svc[Clinic Service]
        inventory_svc[Inventory Service]
        vendor_svc[Vendor Service]
    end
    
    auth_svc --> db_auth
    booking_svc --> db_booking
    clinic_svc --> db_clinic
    inventory_svc --> db_inventory
    vendor_svc --> db_vendor
    
    subgraph "Data Integration"
        kafka[Kafka Event Bus]
    end
    
    auth_svc --> kafka
    booking_svc --> kafka
    clinic_svc --> kafka
    inventory_svc --> kafka
    vendor_svc --> kafka
    
    kafka --> auth_svc
    kafka --> booking_svc
    kafka --> clinic_svc
    kafka --> inventory_svc
    kafka --> vendor_svc
```

## Data Replication and Consistency Patterns

### Outbox Pattern Implementation

```mermaid
sequenceDiagram
    participant Service A
    participant DB A
    participant Message Relay
    participant Event Bus
    participant Service B
    
    Service A->>DB A: 1. Begin Transaction
    Service A->>DB A: 2. Update Domain Tables
    Service A->>DB A: 3. Insert into Outbox Table
    Service A->>DB A: 4. Commit Transaction
    
    DB A-->>Message Relay: 5. Notification (DB trigger/CDC)
    Message Relay->>DB A: 6. Read Outbox Messages
    Message Relay->>Event Bus: 7. Publish Events
    Message Relay->>DB A: 8. Mark Messages as Published
    
    Event Bus-->>Service B: 9. Consume Event
    Service B->>Service B: 10. Update Local Data
```

## Data Synchronization and Migration Strategies

- **Data Versioning**: Each microservice maintains its own schema version
- **Dual Write**: Critical operations write to both old and new schemas during migration
- **Feature Flags**: Control access to new data models during transition
- **Read-Repair**: Fix inconsistencies during read operations
- **Background Reconciliation**: Jobs that verify and fix data across services
