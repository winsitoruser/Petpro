# Sequence Diagrams - PetPro Platform

This document contains sequence diagrams for key processes in the PetPro platform, illustrating the interactions between different components.

## Booking Flow

```mermaid
sequenceDiagram
  participant Mobile as Mobile App
  participant API as API Gateway/BFF
  participant Auth as Auth Service
  participant Booking as Booking Service
  participant Payment as Payment Service
  participant Notif as Notification Worker

  Mobile->>API: POST /bookings {service_id, pet_id, slot, payment_method}
  API->>Auth: validate token
  API->>Booking: POST /reserve-slot {service_id, slot}
  Booking-->>API: 200 reserved (lock_id)
  API->>Payment: create payment session {order_ref, amount}
  Payment-->>API: payment_url
  API-->>Mobile: payment_url
  Mobile->>Payment: complete payment
  Payment->>API: webhook payment.succeeded
  API->>Booking: POST /confirm-booking {reservation_lock_id, payment_id}
  Booking-->>API: 200 confirmed (booking_id)
  Booking->>Notif: publish booking.created event
  Notif->>Mobile: Push + Email to user
  Notif->>Clinic: Notify clinic dashboard
```

### Booking Flow Description

1. **Initiate Booking**: 
   - Mobile app sends booking request with service, pet, time slot, and payment method.
   - API Gateway validates user authentication token.

2. **Slot Reservation**:
   - Booking Service temporarily reserves the slot and returns a lock ID.
   - This prevents double-booking while payment is being processed.

3. **Payment Processing**:
   - Payment Service creates a payment session and returns a payment URL.
   - User completes payment through the payment gateway interface.

4. **Booking Confirmation**:
   - Payment gateway sends a webhook notification of successful payment.
   - Booking Service confirms the reservation using the lock ID.
   - Booking Service publishes a booking created event.

5. **Notifications**:
   - Notification Worker sends push notification and email to user.
   - Notification Worker notifies the clinic dashboard about the new booking.

## Order / Checkout Flow

```mermaid
sequenceDiagram
  participant Mobile
  participant API
  participant Product as Product Service
  participant OrderSvc as Order Service
  participant Payment
  participant MQ as Message Queue
  participant VendorWorker
  participant Shipping

  Mobile->>API: POST /orders {cart_items, address}
  API->>Product: POST /reserve-stock {items}
  Product-->>API: 200 reserved (stock_holds)
  API->>OrderSvc: POST /orders/create {items, holds, totals}
  OrderSvc-->>API: 201 order_created {order_id}
  API->>Payment: create payment session
  Payment-->>API: payment_url
  API-->>Mobile: payment_url
  Mobile->>Payment: completes payment
  Payment->>API: webhook payment.succeeded
  API->>OrderSvc: POST /orders/{id}/paid
  OrderSvc->>Product: decrement stock
  OrderSvc->>MQ: publish order.paid
  MQ->>VendorWorker: vendor notifications + prepare shipment
  VendorWorker->>Shipping: create shipment
  Shipping-->>VendorWorker: tracking_no
  VendorWorker->>OrderSvc: update order shipped
  OrderSvc->>API: notify user
```

### Order / Checkout Flow Description

1. **Initiate Order**:
   - Mobile app submits order with cart items and shipping address.
   - Product Service temporarily reserves inventory for the items.

2. **Order Creation**:
   - Order Service creates an order record with all details.
   - Payment Service generates a payment session URL.

3. **Payment Processing**:
   - User completes payment through the payment gateway.
   - Payment gateway sends webhook notification of successful payment.

4. **Inventory & Fulfillment**:
   - Order Service confirms the stock deduction.
   - Order Service publishes a payment confirmation event.

5. **Shipping & Notifications**:
   - Vendor Worker receives the order notification.
   - Shipping Service creates shipment and returns tracking number.
   - Order status is updated with shipping details.
   - User is notified about the order shipment.

## Vendor Onboarding Flow

```mermaid
sequenceDiagram
  participant VendorUI
  participant API
  participant ClinicSvc
  participant AdminUI
  participant AdminSvc
  participant Notif

  VendorUI->>API: POST /clinics {profile, docs}
  API->>ClinicSvc: create clinic (status=pending)
  ClinicSvc->>S3: upload docs
  AdminUI->>AdminSvc: GET /admin/vendors/pending
  AdminSvc->>ClinicSvc: GET pending clinics
  AdminUI->>AdminSvc: PUT /approve/{clinic_id}
  AdminSvc->>ClinicSvc: PATCH clinic.status = approved
  ClinicSvc->>Notif: publish vendor.approved
  Notif->>VendorUI: email approval
```

### Vendor Onboarding Flow Description

1. **Registration Submission**:
   - Vendor submits clinic profile and documentation through vendor UI.
   - Clinic Service creates a new clinic record with pending status.
   - Documents are uploaded to S3 storage.

2. **Admin Review**:
   - Admin accesses the pending vendors list through the admin dashboard.
   - Admin Service retrieves pending clinic registrations from Clinic Service.

3. **Approval Process**:
   - Admin reviews vendor information and approves the clinic.
   - Admin Service updates the clinic status to approved via the Clinic Service.

4. **Notification**:
   - Clinic Service publishes a vendor approval event.
   - Notification Service sends an email confirmation to the vendor.
   - Vendor can now access the full clinic dashboard functionality.
