# Real-Time WebSocket Integration Documentation

This document describes the WebSocket integration implemented in PetPro for real-time booking status updates and notifications between vendors and customers.

## Overview

PetPro uses Socket.IO for real-time bidirectional communication between the server and clients. This enables instant notifications and updates for booking status changes without requiring clients to poll the server.

## Server-Side Implementation

### Booking Events Gateway

The booking-events gateway (`booking-events.gateway.ts`) handles WebSocket connections and provides:

- Authentication via JWT tokens
- Room-based event subscription for booking-specific updates
- Broadcasting of booking status changes and notifications

### Event Types

The system emits the following events:

1. `booking-status-update`: Sent when a booking status changes
2. `notification`: General notifications for both vendors and customers

## Client-Side Implementation

### Web Vendor Interface

#### Socket Service (`socketService.ts`)

Provides core functionality for Socket.IO connections:

```typescript
// Connect to socket server with JWT authentication
connect(token: string)

// Join/leave booking-specific room
joinBookingRoom(bookingId: string)
leaveBookingRoom(bookingId: string)

// Subscribe/unsubscribe to events
subscribeToBookingUpdates(bookingId: string, callback: Function)
unsubscribeFromBookingUpdates(bookingId: string, callback: Function)
```

#### Socket Context (`SocketContext.tsx`)

React context that:

- Provides socket functionality throughout the app
- Manages connection based on user authentication state
- Exposes hooks for joining rooms and subscribing to events

#### Integration in Bookings Page

The bookings page listens for updates when viewing booking details:

```typescript
// When viewing a booking
const { subscribeToBookingUpdates } = useSocket();

useEffect(() => {
  if (selectedBooking?.id) {
    const unsubscribe = subscribeToBookingUpdates(
      selectedBooking.id, 
      (data) => {
        // Update booking status in UI
      }
    );
    return () => unsubscribe();
  }
}, [selectedBooking]);
```

### Mobile App Integration

#### Socket Service (`socketService.ts`)

Similar to the web implementation but adapted for React Native:

```typescript
// Core functionality
connect(token: string)
joinBookingRoom(bookingId: string)
leaveBookingRoom(bookingId: string)
subscribeToBookingUpdates(bookingId: string, callback: Function)
```

#### Socket Context (`SocketContext.tsx`)

- Connects to socket when authentication is available
- Manages token retrieval from secure storage
- Provides socket state and methods to components

#### Integration in BookingDetailsScreen

```typescript
const { subscribeToBookingUpdates, isConnected } = useSocket();

useEffect(() => {
  if (booking?.id && isConnected) {
    const unsubscribe = subscribeToBookingUpdates(booking.id, (data) => {
      // Update booking UI with new status
    });
    return () => unsubscribe();
  }
}, [booking?.id, isConnected]);
```

## Usage Guidelines

### Joining Booking Rooms

Clients should join specific booking rooms when:

1. Viewing booking details
2. Accessing a list of active bookings

```typescript
// Join a booking room
socketService.joinBookingRoom('booking-123');

// Leave when no longer needed
socketService.leaveBookingRoom('booking-123');
```

### Subscribing to Events

```typescript
// Subscribe to booking updates
const unsubscribe = socketService.subscribeToBookingUpdates(
  'booking-123',
  (data) => {
    console.log('Booking updated:', data);
    // Update UI accordingly
  }
);

// Clean up subscription when done
unsubscribe();
```

### Authentication

The socket connection requires a valid JWT token:

```typescript
// Connect with authentication
socketService.connect(jwtToken);

// Disconnect when logging out
socketService.disconnect();
```

## Event Payloads

### Booking Status Update

```json
{
  "bookingId": "booking-123",
  "status": "confirmed",
  "updatedAt": "2023-07-15T10:30:00Z",
  "message": "Booking has been confirmed by the vendor"
}
```

### Notification

```json
{
  "type": "booking_reminder",
  "title": "Upcoming Appointment",
  "message": "You have an appointment tomorrow at 3:00 PM",
  "bookingId": "booking-123"
}
```

## Best Practices

1. **Always unsubscribe** when components unmount or when subscriptions are no longer needed
2. **Use room-based subscriptions** to limit unnecessary event processing
3. **Handle offline/reconnection scenarios** gracefully
4. **Show connection status** to users for transparency
5. **Include error handling** for socket connection failures

## Security Considerations

- JWT authentication prevents unauthorized access to socket events
- Room-based access control ensures users only receive events for their own bookings
- Sensitive information should never be transmitted via WebSockets
