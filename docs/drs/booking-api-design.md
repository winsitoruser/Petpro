# Technical Design Requirements: Booking API

## 1. Gambaran Umum API

API Booking adalah interface utama bagi aplikasi frontend dan layanan pihak ketiga untuk berinteraksi dengan sistem booking PetPro. API ini dirancang mengikuti prinsip REST, dengan fokus pada keamanan, performa, dan kemudahan penggunaan.

## 2. Desain API

### 2.1. Prinsip Desain API

1. **Resource-Oriented**: API didesain berdasarkan resource, bukan operasi
2. **Stateless**: Setiap request berisi semua informasi yang diperlukan
3. **Cacheable**: Responses dapat di-cache untuk meningkatkan performa
4. **Layered System**: Client tidak perlu tahu kompleksitas backend
5. **Uniform Interface**: Konsistensi dalam format dan konvensi
6. **HATEOAS**: Hypermedia sebagai mesin state aplikasi

### 2.2. Versioning

- URL-based versioning: `/api/v1/bookings`
- Header API version tetap disertakan: `X-API-Version: 1`
- Backward compatibility dijaga untuk minimal 2 versi terakhir

### 2.3. Data Format

- Request/Response format: JSON
- Content-Type: `application/json`
- Date format: ISO 8601 (UTC) - `YYYY-MM-DDTHH:mm:ss.sssZ`
- Snake case untuk nama field (`booking_id`, `created_at`)

## 3. Endpoint Specifications

### 3.1. Slot Management

#### 3.1.1. GET /api/v1/clinics/{clinicId}/slots

**Deskripsi**: Mendapatkan slot yang tersedia untuk sebuah klinik

**Parameters**:
- `clinicId` (path, required): ID klinik
- `date` (query, optional): Tanggal pencarian (YYYY-MM-DD)
- `serviceId` (query, optional): ID layanan yang dicari
- `staffId` (query, optional): ID staff/dokter
- `page` (query, optional): Halaman (default: 1)
- `limit` (query, optional): Jumlah per halaman (default: 20, max: 100)

**Response (200 OK)**:
```json
{
  "data": [
    {
      "slot_id": "sl-12345",
      "clinic_id": "cl-67890",
      "service_id": "sv-54321",
      "staff_id": "st-98765",
      "start_time": "2025-08-15T09:00:00Z",
      "end_time": "2025-08-15T09:30:00Z",
      "status": "available",
      "capacity": 1,
      "remaining": 1
    }
  ],
  "pagination": {
    "total": 48,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Potential Errors**:
- 400 Bad Request: Parameter tidak valid
- 404 Not Found: Klinik tidak ditemukan
- 429 Too Many Requests: Rate limit terlampaui

**Notes**:
- Response di-cache selama 1 menit
- ETag digunakan untuk conditional GET
- Slot dengan status "booked" atau "unavailable" tidak ditampilkan

#### 3.1.2. GET /api/v1/slots/{slotId}

**Deskripsi**: Mendapatkan detail slot tertentu

**Parameters**:
- `slotId` (path, required): ID slot

**Response (200 OK)**:
```json
{
  "data": {
    "slot_id": "sl-12345",
    "clinic_id": "cl-67890",
    "service_id": "sv-54321",
    "staff_id": "st-98765",
    "start_time": "2025-08-15T09:00:00Z",
    "end_time": "2025-08-15T09:30:00Z",
    "status": "available",
    "capacity": 1,
    "remaining": 1,
    "service": {
      "name": "Vaksinasi Rabies",
      "duration": 30,
      "price": 250000
    },
    "staff": {
      "name": "dr. Ani Wijaya",
      "specialization": "Umum"
    }
  }
}
```

**Potential Errors**:
- 404 Not Found: Slot tidak ditemukan

### 3.2. Reservations

#### 3.2.1. POST /api/v1/slots/{slotId}/reserve

**Deskripsi**: Membuat reservasi sementara untuk slot tertentu

**Parameters**:
- `slotId` (path, required): ID slot

**Request Body**:
```json
{
  "user_id": "us-12345",
  "pet_id": "pt-67890",
  "service_id": "sv-54321"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "reservation_id": "rs-12345",
    "slot_id": "sl-12345",
    "user_id": "us-12345",
    "pet_id": "pt-67890",
    "service_id": "sv-54321",
    "status": "pending",
    "created_at": "2025-08-10T12:30:00Z",
    "expires_at": "2025-08-10T12:40:00Z"
  }
}
```

**Potential Errors**:
- 400 Bad Request: Parameter tidak valid
- 404 Not Found: Slot tidak ditemukan
- 409 Conflict: Slot sudah dipesan
- 422 Unprocessable Entity: Slot tidak tersedia lagi

**Notes**:
- Reservasi valid selama 10 menit
- Menggunakan distributed lock untuk mencegah double booking
- Idempotency key menggunakan header `X-Idempotency-Key`

#### 3.2.2. DELETE /api/v1/reservations/{reservationId}

**Deskripsi**: Membatalkan reservasi

**Parameters**:
- `reservationId` (path, required): ID reservasi

**Response (204 No Content)**

**Potential Errors**:
- 404 Not Found: Reservasi tidak ditemukan
- 410 Gone: Reservasi sudah kedaluwarsa

### 3.3. Bookings

#### 3.3.1. POST /api/v1/bookings

**Deskripsi**: Membuat booking dari reservasi

**Request Body**:
```json
{
  "reservation_id": "rs-12345",
  "notes": "Anjing memiliki alergi makanan",
  "payment_method": "credit_card"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "booking_id": "bk-12345",
    "reservation_id": "rs-12345",
    "slot_id": "sl-12345",
    "user_id": "us-12345",
    "pet_id": "pt-67890",
    "service_id": "sv-54321",
    "clinic_id": "cl-67890",
    "status": "pending_payment",
    "created_at": "2025-08-10T12:35:00Z",
    "notes": "Anjing memiliki alergi makanan",
    "payment": {
      "payment_id": "py-12345",
      "amount": 250000,
      "currency": "IDR",
      "status": "pending",
      "payment_url": "https://payment.example.com/pay/12345",
      "expires_at": "2025-08-10T13:05:00Z"
    }
  }
}
```

**Potential Errors**:
- 400 Bad Request: Parameter tidak valid
- 404 Not Found: Reservasi tidak ditemukan
- 410 Gone: Reservasi sudah kedaluwarsa

**Notes**:
- Booking dibuat dalam status `pending_payment`
- Payment URL valid selama 30 menit
- Webhook notification akan dikirim setelah pembayaran selesai

#### 3.3.2. GET /api/v1/bookings/{bookingId}

**Deskripsi**: Mendapatkan detail booking

**Parameters**:
- `bookingId` (path, required): ID booking

**Response (200 OK)**:
```json
{
  "data": {
    "booking_id": "bk-12345",
    "user": {
      "user_id": "us-12345",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+628123456789"
    },
    "pet": {
      "pet_id": "pt-67890",
      "name": "Buddy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3
    },
    "clinic": {
      "clinic_id": "cl-67890",
      "name": "PetHealth Clinic",
      "address": "Jl. Sudirman No. 123, Jakarta",
      "phone": "+6212345678"
    },
    "service": {
      "service_id": "sv-54321",
      "name": "Vaksinasi Rabies",
      "price": 250000
    },
    "schedule": {
      "date": "2025-08-15",
      "start_time": "09:00",
      "end_time": "09:30",
      "doctor": "dr. Ani Wijaya"
    },
    "status": "confirmed",
    "payment_status": "paid",
    "created_at": "2025-08-10T12:35:00Z",
    "updated_at": "2025-08-10T12:45:00Z",
    "notes": "Anjing memiliki alergi makanan",
    "qr_code": "https://petpro.com/qr/bk-12345"
  }
}
```

**Potential Errors**:
- 404 Not Found: Booking tidak ditemukan

#### 3.3.3. GET /api/v1/users/{userId}/bookings

**Deskripsi**: Mendapatkan daftar booking user

**Parameters**:
- `userId` (path, required): ID user
- `status` (query, optional): Filter berdasarkan status (`upcoming`, `past`, `cancelled`)
- `page` (query, optional): Halaman (default: 1)
- `limit` (query, optional): Jumlah per halaman (default: 10, max: 50)

**Response (200 OK)**:
```json
{
  "data": [
    {
      "booking_id": "bk-12345",
      "clinic_name": "PetHealth Clinic",
      "service_name": "Vaksinasi Rabies",
      "pet_name": "Buddy",
      "schedule_date": "2025-08-15",
      "schedule_time": "09:00 - 09:30",
      "status": "confirmed",
      "payment_status": "paid"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Potential Errors**:
- 404 Not Found: User tidak ditemukan

#### 3.3.4. PUT /api/v1/bookings/{bookingId}/cancel

**Deskripsi**: Membatalkan booking

**Parameters**:
- `bookingId` (path, required): ID booking

**Request Body**:
```json
{
  "reason": "schedule_conflict",
  "notes": "Ada jadwal mendadak yang tidak bisa ditinggalkan"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "booking_id": "bk-12345",
    "status": "cancelled",
    "cancelled_at": "2025-08-10T14:00:00Z",
    "refund": {
      "eligible": true,
      "amount": 225000,
      "status": "processing"
    }
  }
}
```

**Potential Errors**:
- 404 Not Found: Booking tidak ditemukan
- 422 Unprocessable Entity: Booking tidak bisa dibatalkan (terlalu dekat dengan jadwal)

**Notes**:
- Kebijakan pembatalan dapat bervariasi per klinik
- Refund amount berdasarkan kebijakan klinik dan waktu pembatalan

#### 3.3.5. PUT /api/v1/bookings/{bookingId}/reschedule

**Deskripsi**: Menjadwalkan ulang booking

**Parameters**:
- `bookingId` (path, required): ID booking

**Request Body**:
```json
{
  "new_slot_id": "sl-67890",
  "reason": "unavailable",
  "notes": "Tidak bisa hadir pada jadwal semula"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "booking_id": "bk-12345",
    "status": "rescheduled",
    "previous_slot": {
      "slot_id": "sl-12345",
      "start_time": "2025-08-15T09:00:00Z",
      "end_time": "2025-08-15T09:30:00Z"
    },
    "new_slot": {
      "slot_id": "sl-67890",
      "start_time": "2025-08-16T10:00:00Z",
      "end_time": "2025-08-16T10:30:00Z"
    },
    "rescheduled_at": "2025-08-10T14:30:00Z",
    "fee": {
      "amount": 0,
      "description": "First reschedule is free"
    }
  }
}
```

**Potential Errors**:
- 404 Not Found: Booking atau slot baru tidak ditemukan
- 409 Conflict: Slot baru sudah dipesan
- 422 Unprocessable Entity: Booking tidak bisa dijadwalkan ulang

### 3.4. Webhook

#### 3.4.1. POST /api/v1/webhooks/payment

**Deskripsi**: Menerima notifikasi dari payment gateway

**Request Body**:
```json
{
  "payment_id": "py-12345",
  "status": "completed",
  "transaction_time": "2025-08-10T12:50:00Z",
  "amount": 250000,
  "payment_method": "credit_card",
  "signature": "ab67ef12c34..."
}
```

**Response (200 OK)**:
```json
{
  "status": "ok"
}
```

**Potential Errors**:
- 400 Bad Request: Parameter tidak valid atau signature tidak valid
- 404 Not Found: Payment tidak ditemukan

**Notes**:
- Signature diverifikasi menggunakan shared secret
- Idempotent processing untuk menghindari double processing

## 4. Authentication & Authorization

### 4.1. Authentication Methods

#### 4.1.1. User Authentication
- JWT Bearer token dalam Authorization header
- Access token expires dalam 1 jam
- Refresh token expires dalam 30 hari
- Rate limiting: 60 requests per minute per user

#### 4.1.2. Service-to-Service Authentication
- API Key dalam header `X-API-Key`
- Mutual TLS untuk service-to-service communication
- No rate limiting untuk internal services

### 4.2. Authorization Model

#### 4.2.1. Role-Based Access Control
- `user`: Akses ke booking milik sendiri
- `clinic_admin`: Akses ke semua booking klinik tersebut
- `system_admin`: Akses penuh ke semua API

#### 4.2.2. Resource-Based Access Control
- Users hanya dapat mengakses booking mereka sendiri
- Clinic admins hanya dapat mengakses booking di klinik mereka
- API untuk mengakses data sensitif diproteksi dengan permission khusus

## 5. Error Handling

### 5.1. Error Response Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested booking was not found",
    "details": "No booking exists with ID bk-99999",
    "request_id": "req-ab12cd34"
  }
}
```

### 5.2. Standard Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | Request tidak valid |
| 401 | UNAUTHORIZED | Autentikasi diperlukan |
| 403 | FORBIDDEN | Tidak memiliki izin yang cukup |
| 404 | RESOURCE_NOT_FOUND | Resource tidak ditemukan |
| 409 | CONFLICT | Resource konflik dengan state saat ini |
| 422 | UNPROCESSABLE_ENTITY | Request valid tapi tidak bisa diproses |
| 429 | RATE_LIMIT_EXCEEDED | Terlalu banyak request |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Layanan tidak tersedia sementara |

### 5.3. Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid parameters",
    "details": [
      {
        "field": "payment_method",
        "message": "Payment method must be one of: credit_card, bank_transfer, e_wallet"
      },
      {
        "field": "notes",
        "message": "Notes cannot exceed 500 characters"
      }
    ],
    "request_id": "req-ab12cd34"
  }
}
```

## 6. API Security

### 6.1. Transport Security
- TLS 1.2+ wajib untuk semua endpoints
- HTTP Strict Transport Security (HSTS)
- Certificate pinning untuk mobile apps

### 6.2. Data Security
- PII data dienkripsi saat transit dan at rest
- Payment data tidak pernah disimpan, hanya referensi
- Sensitive data tidak pernah ditampilkan dalam log

### 6.3. API Protection
- API keys rotated secara berkala (90 hari)
- Rate limiting berdasarkan IP dan user ID
- Brute force protection dengan exponential backoff
- CORS properly configured untuk web clients

## 7. Pagination & Filtering

### 7.1. Pagination

#### 7.1.1. Request Parameters
- `page`: Halaman yang diminta (default: 1)
- `limit`: Jumlah item per halaman (default bervariasi per endpoint, max: 100)

#### 7.1.2. Response Format
```json
{
  "data": [...],
  "pagination": {
    "total": 48,
    "page": 2,
    "limit": 10,
    "pages": 5
  },
  "links": {
    "self": "/api/v1/users/us-12345/bookings?page=2&limit=10",
    "first": "/api/v1/users/us-12345/bookings?page=1&limit=10",
    "prev": "/api/v1/users/us-12345/bookings?page=1&limit=10",
    "next": "/api/v1/users/us-12345/bookings?page=3&limit=10",
    "last": "/api/v1/users/us-12345/bookings?page=5&limit=10"
  }
}
```

### 7.2. Filtering

#### 7.2.1. Common Filters
- `status`: Filter berdasarkan status resource
- `created_after`/`created_before`: Range waktu pembuatan
- `updated_after`/`updated_before`: Range waktu update

#### 7.2.2. Search & Sort
- `q`: General search query
- `sort`: Field untuk sorting (prefix dengan `-` untuk descending)
- Contoh: `sort=-created_at` (sort descending berdasarkan created_at)

## 8. Rate Limiting

### 8.1. Limits

| Client Type | Rate Limit |
|-------------|------------|
| Anonymous | 20 req/min per IP |
| Authenticated User | 60 req/min per user |
| Clinic Admin | 120 req/min per user |
| System Admin | 300 req/min per user |
| Internal Service | No limit |

### 8.2. Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1628580000
```

### 8.3. Response (429 Too Many Requests)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "details": "Rate limit of 60 requests per minute exceeded",
    "retry_after": 25
  }
}
```

## 9. Caching Strategy

### 9.1. Cache Headers

```
Cache-Control: private, max-age=60
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 10 Aug 2025 12:00:00 GMT
```

### 9.2. Cacheable Endpoints

| Endpoint | TTL | Cache Key |
|----------|-----|-----------|
| GET /api/v1/clinics/{id} | 30 min | clinic_id |
| GET /api/v1/clinics/{id}/slots | 1 min | clinic_id + date + filters |
| GET /api/v1/slots/{id} | 1 min | slot_id |
| GET /api/v1/bookings/{id} | 0 (no cache) | N/A |

### 9.3. Cache Invalidation
- Automatic invalidation pada update resource
- Cache-busting dengan query parameter `_t` jika diperlukan

## 10. API Versioning & Deprecation

### 10.1. Version Lifecycle
- Alpha: Internal testing only
- Beta: Early access program
- GA (General Availability): Production-ready
- Deprecated: Scheduled for removal
- Sunset: No longer available

### 10.2. Deprecation Policy
- Minimum 6 bulan notice sebelum sunset
- Deprecation notice dalam response header:
  ```
  X-API-Warn: This endpoint is deprecated and will be removed on 2026-02-10
  ```
- Dokumentasi diupdate dengan deprecated tag
- Email notification untuk affected users

## 11. API Documentation

### 11.1. OpenAPI Specification
- OpenAPI 3.0 documentation
- Interactive API explorer
- Code samples dalam berbagai bahasa
- Tersedia di `/api/docs`

### 11.2. API Changelog
- Major changes dicatat dalam changelog
- Breaking vs non-breaking changes dibedakan
- Migration guide untuk breaking changes

## 12. Webhooks

### 12.1. Subscription Management
- Konfigurasi melalui dashboard atau API
- Supported events:
  - `booking.created`
  - `booking.updated`
  - `booking.cancelled`
  - `booking.completed`
  - `payment.pending`
  - `payment.completed`
  - `payment.failed`

### 12.2. Webhook Security
- Signed payloads dengan HMAC-SHA256
- Signature dalam header `X-Webhook-Signature`
- Timestamp dalam payload untuk mencegah replay attacks
- Unique ID untuk idempotency

### 12.3. Retry Policy
- 5 retries dengan exponential backoff
- Maksimum retry delay: 1 jam
- Webhook status dapat dilihat di dashboard
- Manual retrigger melalui dashboard
