# PetPro Vendor Dashboard - Appointment Management API Mapping

This document maps the Appointment Management wireframes to their corresponding API endpoints.

## Appointments List Screen

**Wireframe Reference**: [Vendor Appointment Management - Appointments List](/docs/ui-ux-guidelines/vendor-appointment-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/appointments
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by appointment status
- `sortBy`: Field to sort by (default: appointmentDate)
- `sortDirection`: Sort direction (asc/desc, default: asc)
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end
- `serviceId`: Filter by service type
- `search`: Search by appointment ID, pet name, or owner name

**Response Example**:

```json
{
  "data": [
    {
      "id": "apt-12345",
      "appointmentNumber": "APT-2025-12345",
      "customerId": "cus-56789",
      "customerName": "John Doe",
      "petId": "pet-67890",
      "petName": "Max",
      "petType": "Dog",
      "petBreed": "Golden Retriever",
      "serviceId": "srv-23456",
      "serviceName": "Grooming - Full Service",
      "appointmentDate": "2025-08-12T14:00:00Z",
      "duration": 60,
      "status": "confirmed",
      "notes": "First time customer"
    },
    {
      "id": "apt-12346",
      "appointmentNumber": "APT-2025-12346",
      "customerId": "cus-67890",
      "customerName": "Jane Smith",
      "petId": "pet-78901",
      "petName": "Whiskers",
      "petType": "Cat",
      "petBreed": "Persian",
      "serviceId": "srv-34567",
      "serviceName": "Veterinary Check-up",
      "appointmentDate": "2025-08-12T15:30:00Z",
      "duration": 30,
      "status": "scheduled",
      "notes": "Annual check-up"
    }
  ],
  "meta": {
    "pagination": {
      "total": 42,
      "count": 10,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 5
    }
  }
}
```

## Calendar View

**Wireframe Reference**: [Vendor Appointment Management - Calendar View](/docs/ui-ux-guidelines/vendor-appointment-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/appointments/calendar
```

**Query Parameters**:
- `viewType`: Type of calendar view (day, week, month)
- `startDate`: Start date for the calendar view
- `endDate`: End date for the calendar view
- `timezone`: Timezone for the calendar (default: vendor's timezone)

**Response Example**:

```json
{
  "data": {
    "timezone": "America/Los_Angeles",
    "businessHours": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" },
      "wednesday": { "start": "09:00", "end": "18:00" },
      "thursday": { "start": "09:00", "end": "18:00" },
      "friday": { "start": "09:00", "end": "18:00" },
      "saturday": { "start": "10:00", "end": "16:00" },
      "sunday": { "start": null, "end": null }
    },
    "appointments": [
      {
        "id": "apt-12345",
        "title": "Max - Grooming",
        "start": "2025-08-12T14:00:00Z",
        "end": "2025-08-12T15:00:00Z",
        "status": "confirmed",
        "serviceId": "srv-23456",
        "serviceName": "Grooming - Full Service",
        "color": "#4CAF50"
      },
      {
        "id": "apt-12346",
        "title": "Whiskers - Check-up",
        "start": "2025-08-12T15:30:00Z",
        "end": "2025-08-12T16:00:00Z",
        "status": "scheduled",
        "serviceId": "srv-34567",
        "serviceName": "Veterinary Check-up",
        "color": "#2196F3"
      }
    ],
    "blockedTimeSlots": [
      {
        "id": "bts-12345",
        "title": "Lunch Break",
        "start": "2025-08-12T12:00:00Z",
        "end": "2025-08-12T13:00:00Z",
        "color": "#9E9E9E"
      }
    ]
  }
}
```

## Appointment Detail Screen

**Wireframe Reference**: [Vendor Appointment Management - Appointment Detail](/docs/ui-ux-guidelines/vendor-appointment-management.md)

**API Endpoints**:

```
GET /vendors/{vendorId}/appointments/{appointmentId}
```

**Response Example**:

```json
{
  "data": {
    "id": "apt-12345",
    "appointmentNumber": "APT-2025-12345",
    "createdAt": "2025-08-05T10:30:00Z",
    "status": "confirmed",
    "statusHistory": [
      {
        "status": "scheduled",
        "timestamp": "2025-08-05T10:30:00Z",
        "note": "Appointment scheduled"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-08-06T14:15:00Z",
        "note": "Appointment confirmed with customer"
      }
    ],
    "customer": {
      "id": "cus-56789",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "address": {
        "street": "123 Main Street",
        "city": "Anytown",
        "state": "CA",
        "postalCode": "12345",
        "country": "United States"
      },
      "appointmentCount": 3,
      "firstAppointment": "2025-01-15T09:00:00Z"
    },
    "pet": {
      "id": "pet-67890",
      "name": "Max",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3,
      "weight": 30.5,
      "weightUnit": "kg",
      "gender": "Male",
      "imageUrl": "https://storage.petpro.com/pets/max-67890.jpg",
      "medicalNotes": "No known allergies, regular checkups up to date",
      "lastVisit": "2025-02-10T14:00:00Z"
    },
    "service": {
      "id": "srv-23456",
      "name": "Grooming - Full Service",
      "description": "Complete grooming including bath, haircut, nail trimming, ear cleaning, and teeth brushing",
      "duration": 60,
      "price": 65.00,
      "currencyCode": "USD",
      "category": "grooming",
      "staffAssigned": [
        {
          "id": "stf-34567",
          "name": "Emma Wilson",
          "role": "Pet Groomer",
          "imageUrl": "https://storage.petpro.com/staff/emma-wilson.jpg"
        }
      ]
    },
    "appointmentDate": "2025-08-12T14:00:00Z",
    "endTime": "2025-08-12T15:00:00Z",
    "duration": 60,
    "timeZone": "America/Los_Angeles",
    "notes": "First time customer. Pet is friendly but gets nervous around loud noises.",
    "specialRequests": "Please use hypoallergenic shampoo",
    "paymentStatus": "pending",
    "paymentAmount": 65.00,
    "remindersSent": [
      {
        "type": "email",
        "sentAt": "2025-08-11T14:00:00Z",
        "status": "delivered"
      },
      {
        "type": "sms",
        "sentAt": "2025-08-11T14:01:00Z",
        "status": "delivered"
      }
    ]
  }
}
```

## Appointment Status Update

**Wireframe Reference**: [Vendor Appointment Management - Status Update](/docs/ui-ux-guidelines/vendor-appointment-management.md)

**API Endpoints**:

```
PATCH /vendors/{vendorId}/appointments/{appointmentId}/status
```

**Request Example**:

```json
{
  "status": "completed",
  "note": "Service performed successfully",
  "serviceSummary": "Grooming completed as scheduled, pet responded well to treatment"
}
```

**Response Example**:

```json
{
  "data": {
    "id": "apt-12345",
    "status": "completed",
    "statusHistory": [
      {
        "status": "scheduled",
        "timestamp": "2025-08-05T10:30:00Z",
        "note": "Appointment scheduled"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-08-06T14:15:00Z",
        "note": "Appointment confirmed with customer"
      },
      {
        "status": "completed",
        "timestamp": "2025-08-12T15:05:00Z",
        "note": "Service performed successfully"
      }
    ],
    "serviceSummary": "Grooming completed as scheduled, pet responded well to treatment"
  }
}
```

## Add Appointment Notes/Records

**API Endpoints**:

```
POST /vendors/{vendorId}/appointments/{appointmentId}/notes
```

**Request Example**:

```json
{
  "note": "Pet was very well-behaved during grooming",
  "type": "service_note",
  "isInternal": true,
  "attachments": []
}
```

**Response Example**:

```json
{
  "data": {
    "id": "not-45678",
    "appointmentId": "apt-12345",
    "note": "Pet was very well-behaved during grooming",
    "type": "service_note",
    "isInternal": true,
    "createdAt": "2025-08-12T15:10:00Z",
    "createdBy": {
      "id": "stf-34567",
      "name": "Emma Wilson"
    },
    "attachments": []
  }
}
```

## Reschedule Appointment

**API Endpoints**:

```
PATCH /vendors/{vendorId}/appointments/{appointmentId}/reschedule
```

**Request Example**:

```json
{
  "appointmentDate": "2025-08-15T16:00:00Z",
  "duration": 60,
  "reason": "Customer requested later date",
  "sendNotification": true
}
```

**Response Example**:

```json
{
  "data": {
    "id": "apt-12345",
    "originalDate": "2025-08-12T14:00:00Z",
    "appointmentDate": "2025-08-15T16:00:00Z",
    "endTime": "2025-08-15T17:00:00Z",
    "duration": 60,
    "status": "rescheduled",
    "statusHistory": [
      {
        "status": "scheduled",
        "timestamp": "2025-08-05T10:30:00Z",
        "note": "Appointment scheduled"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-08-06T14:15:00Z",
        "note": "Appointment confirmed with customer"
      },
      {
        "status": "rescheduled",
        "timestamp": "2025-08-11T09:45:00Z",
        "note": "Customer requested later date"
      }
    ],
    "notificationSent": true,
    "notificationDetails": {
      "type": "email",
      "sentAt": "2025-08-11T09:46:00Z",
      "status": "sent"
    }
  }
}
```

## Cancel Appointment

**API Endpoints**:

```
POST /vendors/{vendorId}/appointments/{appointmentId}/cancel
```

**Request Example**:

```json
{
  "reason": "Customer requested cancellation",
  "cancellationFee": 0,
  "sendNotification": true
}
```

**Response Example**:

```json
{
  "data": {
    "id": "apt-12345",
    "status": "cancelled",
    "statusHistory": [
      {
        "status": "scheduled",
        "timestamp": "2025-08-05T10:30:00Z",
        "note": "Appointment scheduled"
      },
      {
        "status": "confirmed",
        "timestamp": "2025-08-06T14:15:00Z",
        "note": "Appointment confirmed with customer"
      },
      {
        "status": "cancelled",
        "timestamp": "2025-08-11T10:20:00Z",
        "note": "Customer requested cancellation"
      }
    ],
    "cancellationFee": 0,
    "refundAmount": 0,
    "notificationSent": true,
    "notificationDetails": {
      "type": "email",
      "sentAt": "2025-08-11T10:21:00Z",
      "status": "sent"
    }
  }
}
```

## Get Available Time Slots

**API Endpoints**:

```
GET /vendors/{vendorId}/appointments/available-slots
```

**Query Parameters**:
- `date`: Date to check availability
- `serviceId`: Service type ID
- `duration`: Duration in minutes
- `staffId`: Optional staff ID to check specific staff availability

**Response Example**:

```json
{
  "data": {
    "date": "2025-08-15",
    "serviceId": "srv-23456",
    "serviceName": "Grooming - Full Service",
    "duration": 60,
    "timeZone": "America/Los_Angeles",
    "availableSlots": [
      {
        "start": "2025-08-15T09:00:00Z",
        "end": "2025-08-15T10:00:00Z",
        "staffAvailable": [
          {
            "id": "stf-34567",
            "name": "Emma Wilson"
          },
          {
            "id": "stf-45678",
            "name": "Michael Brown"
          }
        ]
      },
      {
        "start": "2025-08-15T10:00:00Z",
        "end": "2025-08-15T11:00:00Z",
        "staffAvailable": [
          {
            "id": "stf-45678",
            "name": "Michael Brown"
          }
        ]
      },
      {
        "start": "2025-08-15T16:00:00Z",
        "end": "2025-08-15T17:00:00Z",
        "staffAvailable": [
          {
            "id": "stf-34567",
            "name": "Emma Wilson"
          }
        ]
      }
    ]
  }
}
```

## Get Appointment Statistics

**API Endpoints**:

```
GET /vendors/{vendorId}/appointments/statistics
```

**Query Parameters**:
- `period`: Time period for statistics (today, week, month, year)
- `startDate`: Custom start date
- `endDate`: Custom end date

**Response Example**:

```json
{
  "data": {
    "total": 42,
    "upcoming": 18,
    "completed": 21,
    "cancelled": 3,
    "byService": [
      {
        "serviceId": "srv-23456",
        "serviceName": "Grooming - Full Service",
        "count": 15,
        "revenue": 975.00
      },
      {
        "serviceId": "srv-34567",
        "serviceName": "Veterinary Check-up",
        "count": 20,
        "revenue": 1200.00
      },
      {
        "serviceId": "srv-45678",
        "serviceName": "Nail Trimming",
        "count": 7,
        "revenue": 175.00
      }
    ],
    "byDay": [
      {
        "date": "2025-08-12",
        "count": 8
      },
      {
        "date": "2025-08-13",
        "count": 6
      },
      {
        "date": "2025-08-14",
        "count": 5
      }
    ],
    "completionRate": 87.5,
    "cancellationRate": 12.5,
    "averageDuration": 45
  }
}
```
