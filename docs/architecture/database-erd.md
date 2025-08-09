# Database Entity-Relationship Diagram (ERD)

## Entity Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email
        string phone
        string password_hash
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    PETS {
        int id PK
        int owner_id FK
        string name
        string species
        string breed
        date birth_date
        string image_url
        timestamp created_at
        timestamp updated_at
    }
    
    PET_VACCINES {
        int id PK
        int pet_id FK
        string vaccine_name
        date vaccine_date
        date next_due_date
        string notes
        timestamp created_at
    }
    
    CLINICS {
        int id PK
        int owner_id FK
        string name
        string address
        point location
        string phone
        string email
        json business_hours
        string status
        float rating
        timestamp created_at
        timestamp updated_at
    }
    
    CLINIC_DOCUMENTS {
        int id PK
        int clinic_id FK
        string document_type
        string document_url
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    SERVICES {
        int id PK
        int clinic_id FK
        string name
        text description
        decimal price
        int duration_min
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    SERVICE_SLOTS {
        int id PK
        int service_id FK
        timestamp slot_time
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    BOOKINGS {
        int id PK
        int user_id FK
        int pet_id FK
        int service_id FK
        int service_slot_id FK
        decimal amount
        string status
        string payment_id
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        int id PK
        int clinic_id FK
        string name
        text description
        decimal price
        int stock_qty
        string image_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        int id PK
        int user_id FK
        int clinic_id FK
        decimal subtotal
        decimal shipping_fee
        decimal tax
        decimal total
        string status
        string payment_id
        string shipping_address
        string shipping_method
        string tracking_number
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
        decimal total
        timestamp created_at
    }
    
    REVIEWS {
        int id PK
        int user_id FK
        int clinic_id FK
        int product_id FK
        int booking_id FK
        int order_id FK
        int rating
        text comment
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENTS {
        int id PK
        string reference_id
        string reference_type
        decimal amount
        string payment_method
        string provider
        string provider_reference
        string status
        json response_data
        timestamp created_at
        timestamp updated_at
    }
    
    COMMISSION_SETTINGS {
        int id PK
        int clinic_id FK
        decimal rate_percent
        boolean is_global
        timestamp created_at
        timestamp updated_at
    }
    
    USERS ||--o{ PETS : owns
    PETS ||--o{ PET_VACCINES : has
    USERS ||--o{ CLINICS : owns
    CLINICS ||--o{ CLINIC_DOCUMENTS : has
    CLINICS ||--o{ SERVICES : offers
    SERVICES ||--o{ SERVICE_SLOTS : has
    USERS ||--o{ BOOKINGS : makes
    PETS ||--o{ BOOKINGS : for
    SERVICES ||--o{ BOOKINGS : of
    SERVICE_SLOTS ||--|| BOOKINGS : reserved_for
    CLINICS ||--o{ PRODUCTS : sells
    USERS ||--o{ ORDERS : places
    CLINICS ||--o{ ORDERS : fulfills
    ORDERS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : is_in
    USERS ||--o{ REVIEWS : writes
    CLINICS ||--o{ REVIEWS : receives
    PRODUCTS ||--o{ REVIEWS : receives
    BOOKINGS ||--o{ REVIEWS : generates
    ORDERS ||--o{ REVIEWS : generates
    CLINICS ||--o{ COMMISSION_SETTINGS : has
```

## Database Relations

1. **Users and Pets**:
   - One User can have multiple Pets (one-to-many)
   - Each Pet belongs to one User (many-to-one)

2. **Pets and Vaccines**:
   - One Pet can have multiple Vaccine records (one-to-many)

3. **Users and Clinics**:
   - A User (vendor) can own one or more Clinics (one-to-many)

4. **Clinics and Services**:
   - A Clinic can offer multiple Services (one-to-many)
   - Each Service belongs to one Clinic (many-to-one)

5. **Services and Slots**:
   - A Service can have multiple time Slots (one-to-many)

6. **Bookings**:
   - A User makes Bookings (one-to-many)
   - A Pet is the subject of Bookings (one-to-many)
   - A Service is booked (one-to-many)
   - A Service Slot is reserved for one Booking (one-to-one)

7. **Products**:
   - A Clinic sells multiple Products (one-to-many)

8. **Orders and Order Items**:
   - A User places Orders (one-to-many)
   - A Clinic fulfills Orders (one-to-many)
   - An Order contains multiple Order Items (one-to-many)
   - A Product appears in Order Items (one-to-many)

9. **Reviews**:
   - A User writes Reviews (one-to-many)
   - A Clinic receives Reviews (one-to-many)
   - A Product receives Reviews (one-to-many)
   - A Booking can generate a Review (one-to-many)
   - An Order can generate a Review (one-to-many)

10. **Commission Settings**:
    - A Clinic has Commission Settings (one-to-many)
    - Global commission rates apply to all Clinics

## Database Indexing Strategy

- Primary keys on all tables
- Foreign keys with indexes for relational lookups
- Composite indexes on frequently queried combinations:
  - (clinic_id, status) on BOOKINGS
  - (user_id, status) on ORDERS
  - (clinic_id, is_active) on PRODUCTS
  - (location) spatial index on CLINICS for geographic queries

## Data Storage Considerations

- Use PostgreSQL for transactional data
- Store large text fields, images, and documents in S3
- Cache frequently accessed data in Redis
- Consider using materialized views for complex reports
