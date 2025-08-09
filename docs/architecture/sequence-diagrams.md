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
