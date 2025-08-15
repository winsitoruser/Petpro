# Microservices Communication Sequence Diagrams

This document illustrates the key communication patterns between PetPro microservices using sequence diagrams.

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Booking Creation Flow](#booking-creation-flow)
3. [Product/Inventory Updates](#productinventory-updates)
4. [Vendor Registration and Approval](#vendor-registration-and-approval)
5. [Service Availability Check](#service-availability-check)

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Auth_Service
    participant User_DB

    Client->>API_Gateway: POST /api/v1/auth/login
    API_Gateway->>Auth_Service: TCP { cmd: 'login' }
    Auth_Service->>User_DB: Query user credentials
    User_DB-->>Auth_Service: Return user data
    
    alt Valid Credentials
        Auth_Service-->>API_Gateway: Generate JWT tokens
        API_Gateway-->>Client: Return tokens & user info
    else Invalid Credentials
        Auth_Service-->>API_Gateway: Authentication failed
        API_Gateway-->>Client: 401 Unauthorized
    end
    
    Note over Client,Auth_Service: For subsequent requests
    
    Client->>API_Gateway: Request with Bearer token
    API_Gateway->>Auth_Service: TCP { cmd: 'validate-token' }
    Auth_Service-->>API_Gateway: Token validation result
    
    alt Valid Token
        API_Gateway->>API_Gateway: Process request
        API_Gateway-->>Client: Response data
    else Invalid/Expired Token
        API_Gateway-->>Client: 401 Unauthorized
    end
```

## Booking Creation Flow

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Booking_Service
    participant Vendor_Service
    participant Notification_Service
    participant DB

    Client->>API_Gateway: POST /api/v1/bookings
    API_Gateway->>Booking_Service: TCP { cmd: 'create-booking' }
    
    Booking_Service->>Vendor_Service: TCP { cmd: 'check-service-availability' }
    Vendor_Service->>DB: Query service availability
    DB-->>Vendor_Service: Return availability data
    Vendor_Service-->>Booking_Service: Service availability status
    
    alt Service Available
        Booking_Service->>Vendor_Service: TCP { cmd: 'reserve-service-slot' }
        Vendor_Service->>DB: Update service availability
        DB-->>Vendor_Service: Confirmation
        Vendor_Service-->>Booking_Service: Slot reserved confirmation
        
        Booking_Service->>DB: Create booking record
        DB-->>Booking_Service: Booking created
        
        Booking_Service->>Notification_Service: Event: 'booking.created'
        Notification_Service->>Notification_Service: Process notifications
        
        par Send notifications
            Notification_Service->>Client: Email confirmation
            Notification_Service->>Vendor_Service: Vendor notification
        end
        
        Booking_Service-->>API_Gateway: Booking confirmation
        API_Gateway-->>Client: Booking details & confirmation
        
    else Service Unavailable
        Vendor_Service-->>Booking_Service: Service unavailable
        Booking_Service-->>API_Gateway: Cannot book (unavailable)
        API_Gateway-->>Client: 400 Bad Request (Service unavailable)
    end
```

## Product/Inventory Updates

```mermaid
sequenceDiagram
    participant Vendor_Dashboard
    participant API_Gateway
    participant Inventory_Service
    participant Search_Service
    participant Notification_Service
    participant DB
    
    Vendor_Dashboard->>API_Gateway: PUT /api/v1/products/{id}
    API_Gateway->>Inventory_Service: TCP { cmd: 'update-product' }
    
    Inventory_Service->>DB: Update product data
    DB-->>Inventory_Service: Update confirmation
    
    Inventory_Service->>Inventory_Service: Emit 'product.updated' event
    
    par Process events
        Inventory_Service-->>Search_Service: Event: 'product.updated'
        Search_Service->>Search_Service: Update search index
        
        Inventory_Service-->>Notification_Service: Event: 'product.updated'
        
        alt Low stock detected
            Notification_Service->>Vendor_Dashboard: Low stock notification
        end
    end
    
    Inventory_Service-->>API_Gateway: Product update confirmation
    API_Gateway-->>Vendor_Dashboard: Updated product data
```

## Vendor Registration and Approval

```mermaid
sequenceDiagram
    participant Vendor
    participant API_Gateway
    participant Vendor_Service
    participant Auth_Service
    participant Admin_Dashboard
    participant Notification_Service
    participant DB
    
    Vendor->>API_Gateway: POST /api/v1/vendors/register
    API_Gateway->>Vendor_Service: TCP { cmd: 'register-vendor' }
    
    Vendor_Service->>Auth_Service: TCP { cmd: 'check-email-exists' }
    Auth_Service-->>Vendor_Service: Email availability status
    
    alt Email Available
        Vendor_Service->>DB: Create pending vendor record
        DB-->>Vendor_Service: Record created
        
        Vendor_Service->>Auth_Service: TCP { cmd: 'create-user' }
        Auth_Service->>DB: Create user with vendor role
        DB-->>Auth_Service: User created
        Auth_Service-->>Vendor_Service: User creation confirmation
        
        Vendor_Service->>Notification_Service: Event: 'vendor.registered'
        Notification_Service->>Admin_Dashboard: New vendor registration notification
        Notification_Service->>Vendor: Registration confirmation email
        
        Vendor_Service-->>API_Gateway: Registration successful
        API_Gateway-->>Vendor: Registration confirmation
        
        Note over Admin_Dashboard,Vendor_Service: Admin approval process
        
        Admin_Dashboard->>API_Gateway: PUT /api/v1/admin/vendors/{id}/approve
        API_Gateway->>Vendor_Service: TCP { cmd: 'approve-vendor' }
        Vendor_Service->>DB: Update vendor status to approved
        DB-->>Vendor_Service: Status updated
        
        Vendor_Service->>Notification_Service: Event: 'vendor.approved'
        Notification_Service->>Vendor: Approval notification email
        
        Vendor_Service-->>API_Gateway: Approval confirmation
        API_Gateway-->>Admin_Dashboard: Vendor approval confirmed
        
    else Email Already Registered
        Auth_Service-->>Vendor_Service: Email already exists
        Vendor_Service-->>API_Gateway: Registration failed (duplicate email)
        API_Gateway-->>Vendor: 400 Bad Request (Email already registered)
    end
```

## Service Availability Check

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Booking_Service
    participant Vendor_Service
    participant DB
    
    Client->>API_Gateway: GET /api/v1/services/{id}/availability?date=2025-01-15
    API_Gateway->>Booking_Service: TCP { cmd: 'get-service-availability' }
    
    Booking_Service->>Vendor_Service: TCP { cmd: 'get-service-details' }
    Vendor_Service->>DB: Query service details
    DB-->>Vendor_Service: Service details
    Vendor_Service-->>Booking_Service: Service details
    
    Booking_Service->>DB: Query existing bookings for date
    DB-->>Booking_Service: Existing bookings
    
    Booking_Service->>Vendor_Service: TCP { cmd: 'get-staff-availability' }
    Vendor_Service->>DB: Query staff availability
    DB-->>Vendor_Service: Staff availability data
    Vendor_Service-->>Booking_Service: Staff availability
    
    Booking_Service->>Booking_Service: Calculate available time slots
    
    Booking_Service-->>API_Gateway: Available time slots
    API_Gateway-->>Client: List of available time slots
```

## Event-Based Communication

Beyond direct TCP communication, our microservices use an event-driven architecture for asynchronous communication. The diagram below illustrates how events propagate through the system:

```mermaid
graph TD
    A[Booking Service] -->|booking.created| B[Notification Service]
    A -->|booking.updated| B
    A -->|booking.canceled| B
    
    C[Vendor Service] -->|vendor.registered| B
    C -->|vendor.approved| B
    C -->|vendor.service.created| D[Search Service]
    
    E[Inventory Service] -->|product.created| D
    E -->|product.updated| D
    E -->|product.low-stock| B
    
    B -->|send.email| F[Email Service]
    B -->|send.sms| G[SMS Service]
    B -->|send.push| H[Push Notification Service]
    
    subgraph "Notification Channels"
        F
        G
        H
    end
```

## Service Discovery Pattern

All microservices register with a service registry for dynamic service discovery:

```mermaid
sequenceDiagram
    participant Service
    participant Service_Registry
    participant API_Gateway
    
    Service->>Service_Registry: Register (service name, host, port)
    Service_Registry-->>Service: Registration acknowledged
    
    API_Gateway->>Service_Registry: Discover service by name
    Service_Registry-->>API_Gateway: Service connection details
    
    API_Gateway->>Service: Connect using details
    
    Note over Service,Service_Registry: Health check loop
    loop Every 30 seconds
        Service_Registry->>Service: Health check request
        Service-->>Service_Registry: Health status
    end
    
    Note over Service,Service_Registry: Deregistration
    Service->>Service_Registry: Deregister on shutdown
    Service_Registry-->>Service: Deregistration acknowledged
```
