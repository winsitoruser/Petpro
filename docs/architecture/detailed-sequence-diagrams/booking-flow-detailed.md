# Detailed Sequence Diagram: Booking Flow
# 詳細シーケンス図：予約フロー

**English**

This document contains detailed sequence diagrams for the Booking feature on the PetPro platform, focusing on level 2 and 3 interactions between system components.

**日本語**

この文書は、PetProプラットフォームの予約機能に関する詳細なシーケンス図を含み、システムコンポーネント間のレベル2および2の相互作用に焦点を当てています。

## Level 1: Overview Booking Flow
## レベル1: 予約フロー概要

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

## Level 2: Detailed Booking Flow
## レベル2: 詳細予約フロー

**English**
The following diagram shows more detailed level 2 interactions for the booking process:

**日本語**
以下の図は、予約プロセスにおけるより詳細なレベル2の相互作用を示しています：

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant API as API Gateway
    participant Auth as Auth Service
    participant Booking as Booking Service
    participant ClinicSvc as Clinic Service
    participant Redis
    participant DB as PostgreSQL
    participant Payment as Payment Service
    participant PayGW as Payment Gateway
    participant MQ as Message Queue
    participant NotifWorker as Notification Worker
    participant Email as Email Service
    participant Push as Push Notification
    participant ClinicDash as Clinic Dashboard

    %% 1. Initialization and Authentication
    Note over Mobile,ClinicDash: 1. Initialization & Authentication
    Mobile->>API: GET /clinics/{clinic_id}/services
    API->>Auth: validate token
    Auth-->>API: token valid, user_id=123
    API->>ClinicSvc: GET /clinics/{clinic_id}/services
    ClinicSvc->>DB: SELECT * FROM services WHERE clinic_id=?
    DB-->>ClinicSvc: services data
    ClinicSvc-->>API: services list with pricing
    API-->>Mobile: 200 OK with services list
    
    Mobile->>API: GET /clinics/{clinic_id}/services/{service_id}/slots?date=2025-08-15
    API->>Auth: validate token
    Auth-->>API: token valid, user_id=123
    API->>Booking: GET /available-slots/{service_id}?date=2025-08-15
    Booking->>DB: SELECT booked slots
    DB-->>Booking: booked slots data
    Booking->>ClinicSvc: GET service capacity & hours
    ClinicSvc-->>Booking: service details
    Booking->>Booking: calculate available slots
    Booking-->>API: available time slots
    API-->>Mobile: 200 OK with available slots

    %% 2. Booking Initiation
    Note over Mobile,ClinicDash: 2. Booking Initiation
    Mobile->>API: POST /bookings {service_id, pet_id, slot, payment_method}
    API->>Auth: validate token & permissions
    Auth-->>API: token valid, user_id=123
    API->>Booking: POST /reserve-slot {service_id, slot, user_id, pet_id}
    
    %% 3. Slot Reservation with Concurrency Control
    Note over Mobile,ClinicDash: 3. Slot Reservation with Concurrency Control
    Booking->>Redis: SET reservation:service:{id}:slot:{time} user_id NX PX 600000
    Note right of Redis: Lock valid for 10 mins
    Redis-->>Booking: OK (lock acquired) or NIL (conflict)
    
    alt Lock Failed
        Booking-->>API: 409 Conflict - Slot already reserved
        API-->>Mobile: 409 Slot no longer available
    else Lock Success
        Booking->>DB: INSERT INTO reservations (status='pending')
        DB-->>Booking: reservation_id
        Booking-->>API: 200 Reserved with lock_id
        
        %% 4. Payment Processing
        Note over Mobile,ClinicDash: 4. Payment Processing
        API->>ClinicSvc: GET service pricing
        ClinicSvc-->>API: service price
        API->>Payment: POST /sessions {amount, currency, description, reservation_id}
        Payment->>PayGW: Create payment session API call
        PayGW-->>Payment: payment_session_id, payment_url
        Payment->>DB: Save payment session data
        Payment-->>API: payment_url, session_id
        API-->>Mobile: 200 OK {payment_url, reservation_id, expires_at}
        
        %% 5. Payment Completion (User Flow)
        Note over Mobile,ClinicDash: 5. Payment Completion (User Flow)
        Mobile->>PayGW: User completes payment through webview
        PayGW->>PayGW: Process payment
        
        %% 6. Payment Webhook & Confirmation
        Note over Mobile,ClinicDash: 6. Payment Webhook & Confirmation
        PayGW->>API: POST /webhooks/payment {event: "payment.success", payment_id}
        API->>Payment: POST /webhooks/payment
        Payment->>DB: UPDATE payments SET status='success'
        Payment->>API: 200 OK payment confirmed
        
        API->>Booking: POST /confirm-booking {reservation_id, payment_id}
        Booking->>Redis: DEL reservation:service:{id}:slot:{time}
        Booking->>DB: UPDATE reservations SET status='confirmed'
        Booking->>DB: INSERT INTO bookings (user_id, pet_id, service_id, slot, payment_id)
        DB-->>Booking: booking_id
        
        %% 7. Notification Processing
        Note over Mobile,ClinicDash: 7. Notification Processing
        Booking->>MQ: Publish event booking.created {booking_id, user_id, clinic_id}
        Booking-->>API: 200 OK booking confirmed
        API-->>Mobile: 200 OK booking confirmed
        
        MQ->>NotifWorker: Consume booking.created event
        NotifWorker->>DB: Get booking details with user, pet, service info
        DB-->>NotifWorker: Complete booking data
        
        NotifWorker->>Email: Send confirmation email
        Email-->>NotifWorker: Email queued
        NotifWorker->>Push: Send push notification
        Push-->>NotifWorker: Notification sent
        NotifWorker->>ClinicDash: Send realtime notification via WebSocket
        
        %% 8. Booking Completion & Calendar Sync
        Note over Mobile,ClinicDash: 8. Booking Completion & Calendar Sync
        Mobile->>API: PUT /bookings/{booking_id}/calendar-sync
        API->>Auth: validate token
        Auth-->>API: token valid
        API->>Booking: PUT /bookings/{booking_id}/calendar-sync
        Booking->>Mobile: Add to user's calendar (via API)
        Mobile-->>Booking: Calendar event created
        Booking-->>API: 200 OK calendar synced
        API-->>Mobile: 200 OK calendar synced
    end
```

## Level 3: Component-Level Booking Interactions
## レベル3: コンポーネントレベルの予約相互作用

**English**
The following are more detailed level 3 sequence diagrams for key subprocesses in the booking flow:

**日本語**
以下は、予約フローにおける主要なサブプロセスのより詳細なレベル3シーケンス図です：

### L3: Slot Availability Calculation
### L3: スロット空き状況計算

```mermaid
sequenceDiagram
    participant BookingSvc as Booking Service
    participant Cache as Redis Cache
    participant DB as PostgreSQL
    participant ClinicSvc as Clinic Service
    participant Calendar as Calendar Service

    BookingSvc->>Cache: GET slot:availability:{service_id}:{date}
    alt Cache Hit
        Cache-->>BookingSvc: cached slot data
    else Cache Miss
        BookingSvc->>DB: SELECT reservations WHERE service_id=? AND date=?
        DB-->>BookingSvc: reserved slots
        
        BookingSvc->>ClinicSvc: GET service/{id} (capacity, duration)
        ClinicSvc-->>BookingSvc: service details
        
        BookingSvc->>ClinicSvc: GET clinic/{id}/schedule (hours)
        ClinicSvc-->>BookingSvc: operating hours
        
        BookingSvc->>Calendar: GET blocked_slots/{clinic_id}
        Calendar-->>BookingSvc: staff unavailability
        
        BookingSvc->>BookingSvc: Calculate available slots
        BookingSvc->>Cache: SET slot:availability:{service_id}:{date} data EX 300
        Note right of Cache: Cache for 5 minutes
        
        BookingSvc->>BookingSvc: Format availability response
    end
```

### L3: Payment Processing
### L3: 決済処理

```mermaid
sequenceDiagram
    participant PaymentSvc as Payment Service
    participant DB as PostgreSQL
    participant PayGW as Payment Gateway
    participant UserSvc as User Service
    
    PaymentSvc->>PaymentSvc: Validate payment request
    PaymentSvc->>DB: Record payment attempt
    
    PaymentSvc->>UserSvc: GET /users/{user_id}/payment-methods
    UserSvc-->>PaymentSvc: saved payment methods
    
    alt Has Saved Payment Method
        PaymentSvc->>PayGW: Create payment with token
        PayGW-->>PaymentSvc: payment result
    else New Payment Method
        PaymentSvc->>PayGW: Create payment session
        PayGW-->>PaymentSvc: session_id, checkout_url
    end
    
    PaymentSvc->>DB: UPDATE payments SET session_id, status
    
    alt Payment Success (Direct)
        PaymentSvc->>DB: UPDATE payments SET status='success'
        PaymentSvc->>PaymentSvc: Generate receipt
    end
```

### L3: Booking Confirmation Process
### L3: 予約確認プロセス

```mermaid
sequenceDiagram
    participant BookingSvc as Booking Service
    participant Redis as Redis
    participant DB as PostgreSQL
    participant ClinicSvc as Clinic Service
    participant CommissionSvc as Commission Service
    participant MQ as Message Queue
    
    BookingSvc->>Redis: Verify reservation lock exists
    Redis-->>BookingSvc: lock exists or not
    
    alt Lock Exists
        BookingSvc->>DB: BEGIN TRANSACTION
        
        BookingSvc->>DB: UPDATE reservations SET status='confirmed'
        BookingSvc->>DB: INSERT INTO bookings (details)
        
        BookingSvc->>ClinicSvc: GET service commission rate
        ClinicSvc-->>BookingSvc: commission percentage
        
        BookingSvc->>CommissionSvc: Calculate commission
        CommissionSvc-->>BookingSvc: platform_fee, clinic_amount
        
        BookingSvc->>DB: INSERT INTO financial_entries
        
        BookingSvc->>DB: COMMIT TRANSACTION
        
        BookingSvc->>Redis: DELETE reservation lock
        
        BookingSvc->>MQ: Publish booking.confirmed event
        
        BookingSvc->>BookingSvc: Generate booking reference
    else Lock Expired/Missing
        BookingSvc->>DB: UPDATE reservations SET status='expired'
        BookingSvc->>BookingSvc: Return booking expired error
    end
```

### L3: Notification Handling for Booking
### L3: 予約通知の処理

```mermaid
sequenceDiagram
    participant NotifWorker as Notification Worker
    participant DB as PostgreSQL
    participant TemplateEngine as Template Engine
    participant UserSvc as User Service
    participant PetSvc as Pet Service
    participant ClinicSvc as Clinic Service
    participant EmailSvc as Email Service
    participant PushSvc as Push Notification Service
    participant SMS as SMS Service
    
    NotifWorker->>DB: GET booking details
    DB-->>NotifWorker: booking data
    
    NotifWorker->>UserSvc: GET user preferences
    UserSvc-->>NotifWorker: notification preferences
    
    NotifWorker->>UserSvc: GET user details
    UserSvc-->>NotifWorker: user data
    
    NotifWorker->>PetSvc: GET pet details
    PetSvc-->>NotifWorker: pet data
    
    NotifWorker->>ClinicSvc: GET clinic/service details
    ClinicSvc-->>NotifWorker: clinic/service data
    
    NotifWorker->>TemplateEngine: Render email template
    TemplateEngine-->>NotifWorker: rendered HTML
    
    NotifWorker->>TemplateEngine: Render push notification
    TemplateEngine-->>NotifWorker: notification content
    
    alt Email Enabled
        NotifWorker->>EmailSvc: Send email
        EmailSvc-->>NotifWorker: delivery status
    end
    
    alt Push Enabled
        NotifWorker->>PushSvc: Send push notification
        PushSvc-->>NotifWorker: delivery status
    end
    
    alt SMS Enabled
        NotifWorker->>SMS: Send SMS reminder
        SMS-->>NotifWorker: delivery status
    end
    
    NotifWorker->>DB: Log all notifications
```

## Detailed Components for Booking Implementation
## 予約実装のための詳細コンポーネント

### Domain Models
### ドメインモデル

#### Reservation Model
#### 予約モデル
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "pet_id": "uuid", 
  "clinic_id": "uuid",
  "service_id": "uuid",
  "slot_date": "2025-08-15",
  "slot_time": "14:30:00",
  "slot_duration": 30,
  "status": "pending|confirmed|cancelled|expired",
  "lock_id": "string",
  "lock_expiry": "ISO timestamp",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

#### Booking Model
#### 予約モデル
```json
{
  "id": "uuid",
  "reference_code": "BP12345678",
  "reservation_id": "uuid",
  "user_id": "uuid",
  "pet_id": "uuid",
  "clinic_id": "uuid",
  "service_id": "uuid",
  "payment_id": "uuid",
  "slot_date": "2025-08-15",
  "slot_time": "14:30:00",
  "duration_minutes": 30,
  "amount": 250000,
  "currency": "IDR",
  "status": "confirmed|in-progress|completed|cancelled|no-show",
  "cancellation_reason": "string|null",
  "notes": "string|null",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

### API Endpoints Detail

#### Booking Service APIs
#### 予約サービスAPI

**English**
| Endpoint | Method | Description | Request Body | Response |

**日本語**
| エンドポイント | メソッド | 説明 | リクエストボディ | レスポンス |
|----------|--------|-------------|-------------|----------|
| `/services/{service_id}/slots` | GET | Get available slots | `date: YYYY-MM-DD` | `{ "slots": [ { "time": "09:00", "available": true }, ... ] }` |
| `/reservations` | POST | Reserve a slot | `{ "service_id": "uuid", "pet_id": "uuid", "date": "YYYY-MM-DD", "time": "HH:MM" }` | `{ "reservation_id": "uuid", "lock_id": "string", "expires_at": "timestamp" }` |
| `/reservations/{id}` | GET | Get reservation | - | Reservation object |
| `/reservations/{id}/extend` | PUT | Extend reservation lock | - | `{ "expires_at": "timestamp" }` |
| `/reservations/{id}/confirm` | PUT | Confirm reservation | `{ "payment_id": "uuid" }` | `{ "booking_id": "uuid", "reference": "BP12345678" }` |
| `/reservations/{id}/cancel` | PUT | Cancel reservation | `{ "reason": "string" }` | `{ "success": true }` |
| `/bookings/{id}` | GET | Get booking details | - | Booking object with relations |
| `/bookings/{id}/reschedule` | PUT | Reschedule booking | `{ "date": "YYYY-MM-DD", "time": "HH:MM" }` | Updated booking |
| `/bookings/{id}/cancel` | PUT | Cancel booking | `{ "reason": "string", "refund_requested": true }` | Cancellation result with refund info |

### Error Handling
### エラー処理

#### Reservation Errors
#### 予約エラー
**English**
1. **Slot Not Available**: 409 Conflict - Slot already booked or reserved
2. **Reservation Expired**: 410 Gone - Reservation lock has expired
3. **Invalid Slot**: 400 Bad Request - Time slot is invalid or outside clinic hours
4. **Service Unavailable**: 400 Bad Request - Service not available on selected date

**日本語**
1. **スロット利用不可**: 409 Conflict - スロットはすでに予約済みまたは確保済み
2. **予約期限切れ**: 410 Gone - 予約ロックの有効期限が切れています
3. **無効なスロット**: 400 Bad Request - 時間枠が無効であるか、クリニックの営業時間外です
4. **サービス利用不可**: 400 Bad Request - 選択された日付にサービスが利用できません

#### Payment Errors
#### 決済エラー
**English**
1. **Payment Failed**: 400 Bad Request - Payment failed to process
2. **Payment Timeout**: 408 Request Timeout - Payment session expired
3. **Invalid Payment Method**: 400 Bad Request - Payment method not supported

**日本語**
1. **決済失敗**: 400 Bad Request - 決済の処理に失敗しました
2. **決済タイムアウト**: 408 Request Timeout - 決済セッションの有効期限が切れました
3. **無効な決済方法**: 400 Bad Request - サポートされていない決済方法です

#### Business Rules
#### ビジネスルール

**English**
1. **Reservation Lock**: 
   - Locks slot for 10 minutes
   - Can extend lock once for additional 5 minutes
   - Automatically expires if not confirmed

2. **Cancellation Policy**:
   - Within 24 hours: No refund
   - 24-48 hours: 50% refund
   - >48 hours: 100% refund
   - Clinic can override with custom policy

3. **Double Booking Prevention**:
   - Distributed lock mechanism via Redis
   - Two-phase commit for booking confirmation
   - Monitoring for lock leakage and expiry

**日本語**
1. **予約ロック**:
   - スロットを10分間ロックします
   - 1回限り、さらに5分間ロックを延長可能
   - 確認されない場合は自動的に期限切れになります

2. **キャンセルポリシー**:
   - 24時間以内：返金なし
   - 24〜48時間：50％返金
   - 48時間以上：100％返金
   - クリニックはカスタムポリシーで上書き可能

3. **二重予約防止**:
   - Redisによる分散ロックメカニズム
   - 予約確認のための二段階コミット
   - ロックの漏洩と期限切れの監視

## Exception Flows
## 例外フロー

### Booking Cancellation
### 予約キャンセル

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant API as API Gateway
    participant Auth as Auth Service
    participant Booking as Booking Service
    participant Payment as Payment Service
    participant Clinic as Clinic Service
    participant MQ as Message Queue
    participant Notif as Notification Service
    
    Mobile->>API: PUT /bookings/{id}/cancel {reason}
    API->>Auth: Validate token + permissions
    Auth-->>API: Valid token
    
    API->>Booking: PUT /bookings/{id}/cancel
    Booking->>Booking: Check cancellation policy
    
    alt Within Refundable Period
        Booking->>Payment: POST /refunds {booking_id, amount}
        Payment-->>Booking: Refund initiated
        Booking->>Booking: Update status to "cancelled"
        Booking->>MQ: Publish booking.cancelled event
    else Non-Refundable Period
        Booking->>Booking: Update status to "cancelled"
        Booking->>MQ: Publish booking.cancelled event
    end
    
    Booking-->>API: Cancellation result
    API-->>Mobile: 200 OK with cancellation details
    
    MQ->>Notif: Process booking.cancelled event
    Notif->>Mobile: Send cancellation notification
    Notif->>Clinic: Notify clinic about cancellation
```

### Booking Rescheduling
### 予約の再スケジュール

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant API as API Gateway
    participant Booking as Booking Service
    participant Redis as Redis
    participant DB as PostgreSQL
    participant MQ as Message Queue
    participant Notif as Notification Service
    
    Mobile->>API: PUT /bookings/{id}/reschedule {new_slot}
    API->>Booking: PUT /bookings/{id}/reschedule
    
    Booking->>Booking: Validate new slot
    Booking->>Redis: Check new slot availability
    Redis-->>Booking: Slot availability status
    
    alt Slot Available
        Booking->>Redis: Set temporary lock on new slot
        Booking->>DB: Update booking with new slot
        Booking->>MQ: Publish booking.rescheduled event
        Booking-->>API: 200 OK with updated booking
        API-->>Mobile: Reschedule confirmed
    else Slot Not Available
        Booking-->>API: 409 Conflict - Slot not available
        API-->>Mobile: Reschedule failed, slot taken
    end
    
    MQ->>Notif: Process booking.rescheduled event
    Notif->>Mobile: Notify user about reschedule
    Notif->>Notif: Notify clinic about reschedule
```
