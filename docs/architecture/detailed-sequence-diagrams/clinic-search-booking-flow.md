# Clinic Search & Booking Flow - Detailed Sequence Diagram (Level 2)

## Overview
This document provides a detailed Level 2 sequence diagram for the clinic search, service browsing, and booking process in the PetPro platform. The diagram shows the step-by-step flow between the user, mobile app, backend services, and clinic/vendor systems.

## 1. Clinic Search & Browse Flow

```mermaid
sequenceDiagram
    actor User
    participant MobileApp as Mobile App
    participant APIGateway as API Gateway
    participant SearchService as Search Service
    participant ClinicService as Clinic Service
    participant LocationService as Location Service
    participant RatingService as Rating Service
    participant DB as Database
    participant Cache as Redis Cache

    %% Initial Clinic Search
    User->>MobileApp: Open Clinic Search Screen
    MobileApp->>MobileApp: Request Location Permission
    
    alt Location Permission Granted
        MobileApp->>MobileApp: Get Current Location
        MobileApp->>APIGateway: POST /search/clinics (with location)
    else Location Permission Denied
        MobileApp->>User: Request Manual Location Input
        User->>MobileApp: Enter Location/Area
        MobileApp->>APIGateway: POST /search/clinics (with manual location)
    end
    
    APIGateway->>SearchService: Forward Search Request
    SearchService->>LocationService: Geocode Location
    LocationService->>SearchService: Return Coordinates
    
    SearchService->>Cache: Check for Cached Results
    
    alt Cache Hit
        Cache->>SearchService: Return Cached Results
    else Cache Miss
        SearchService->>DB: Query Nearby Clinics
        DB->>SearchService: Return Raw Clinic Data
        SearchService->>Cache: Store Results (TTL: 1 hour)
    end
    
    SearchService->>RatingService: Get Ratings for Clinics
    RatingService->>DB: Query Ratings Data
    DB->>RatingService: Return Ratings
    RatingService->>SearchService: Return Aggregated Ratings
    
    SearchService->>APIGateway: Return Search Results
    APIGateway->>MobileApp: Send Clinics List Response
    MobileApp->>MobileApp: Render Clinic List View
    MobileApp->>User: Display Clinics by Distance/Rating

    %% Filtering and Sorting
    User->>MobileApp: Apply Filters (Services/Rating/etc)
    MobileApp->>APIGateway: POST /search/clinics (with filters)
    APIGateway->>SearchService: Forward Filtered Search
    SearchService->>DB: Query with Filters
    DB->>SearchService: Return Filtered Results
    SearchService->>APIGateway: Return Filtered Results
    APIGateway->>MobileApp: Send Filtered Clinics
    MobileApp->>User: Display Filtered Results
    
    %% Clinic Detail View
    User->>MobileApp: Select Clinic
    MobileApp->>APIGateway: GET /clinics/{id}
    APIGateway->>ClinicService: Get Clinic Details
    ClinicService->>DB: Query Clinic Data
    DB->>ClinicService: Return Clinic Details
    ClinicService->>APIGateway: Return Clinic Data
    APIGateway->>MobileApp: Send Clinic Details
    MobileApp->>User: Display Clinic Profile
    
    %% Browse Services
    User->>MobileApp: View Available Services
    MobileApp->>APIGateway: GET /clinics/{id}/services
    APIGateway->>ClinicService: Get Clinic Services
    ClinicService->>DB: Query Services Data
    DB->>ClinicService: Return Services
    ClinicService->>APIGateway: Return Services Data
    APIGateway->>MobileApp: Send Services List
    MobileApp->>User: Display Services with Pricing
```

## 2. Service Booking Flow

```mermaid
sequenceDiagram
    actor User
    participant MobileApp as Mobile App
    participant APIGateway as API Gateway
    participant BookingService as Booking Service
    participant ClinicService as Clinic Service
    participant PetService as Pet Service
    participant NotificationService as Notification Service
    participant PaymentService as Payment Service
    participant DB as Database
    participant VendorApp as Vendor Dashboard
    actor Vendor

    %% Select Service and Time
    User->>MobileApp: Select Service to Book
    MobileApp->>APIGateway: GET /services/{id}
    APIGateway->>ClinicService: Get Service Details
    ClinicService->>DB: Query Service Data
    DB->>ClinicService: Return Service Details
    ClinicService->>APIGateway: Return Service Data
    APIGateway->>MobileApp: Send Service Details
    MobileApp->>User: Display Service Details
    
    User->>MobileApp: Click "Book Now"
    MobileApp->>APIGateway: GET /services/{id}/availability?date=YYYY-MM-DD
    APIGateway->>BookingService: Check Availability
    BookingService->>DB: Query Available Slots
    DB->>BookingService: Return Available Slots
    BookingService->>APIGateway: Return Availability Data
    APIGateway->>MobileApp: Send Available Time Slots
    MobileApp->>User: Display Calendar with Available Slots
    
    User->>MobileApp: Select Date and Time Slot
    MobileApp->>MobileApp: Temporarily Reserve Slot (Client-side)
    
    %% Select Pet for Appointment
    MobileApp->>APIGateway: GET /pets (User's Pets)
    APIGateway->>PetService: Get User's Pets
    PetService->>DB: Query Pets Data
    DB->>PetService: Return Pets List
    PetService->>APIGateway: Return Pets Data
    APIGateway->>MobileApp: Send User's Pets
    MobileApp->>User: Display Pet Selection
    User->>MobileApp: Select Pet for Appointment
    
    %% Create Booking
    User->>MobileApp: Confirm Booking Details
    MobileApp->>APIGateway: POST /bookings (Booking Details)
    APIGateway->>BookingService: Create Booking
    
    BookingService->>BookingService: Validate Booking Request
    BookingService->>DB: Check Slot Availability (with Lock)
    DB->>BookingService: Confirm Slot Available
    
    BookingService->>DB: Create Booking (Status: PENDING_PAYMENT)
    DB->>BookingService: Return Booking ID
    BookingService->>APIGateway: Return Booking Created
    APIGateway->>MobileApp: Send Booking Confirmation

    %% Payment Process
    MobileApp->>User: Show Payment Options
    User->>MobileApp: Select Payment Method
    MobileApp->>APIGateway: POST /payments (Payment Details)
    APIGateway->>PaymentService: Process Payment
    
    alt Credit Card Payment
        PaymentService->>PaymentService: Initialize Payment Gateway
        PaymentService->>MobileApp: Return Payment Form URL
        MobileApp->>User: Display Payment Form
        User->>MobileApp: Enter Payment Details
        MobileApp->>PaymentService: Submit Payment
        PaymentService->>PaymentService: Process with Gateway
        PaymentService->>PaymentService: Receive Gateway Response
    else Wallet/Saved Card
        PaymentService->>PaymentService: Process Saved Payment Method
    end
    
    PaymentService->>DB: Update Payment Status
    PaymentService->>BookingService: Notify Payment Complete
    BookingService->>DB: Update Booking Status to CONFIRMED
    
    %% Notifications
    BookingService->>NotificationService: Send Booking Confirmation
    NotificationService->>User: Send Push Notification
    NotificationService->>User: Send Email Confirmation
    
    BookingService->>NotificationService: Notify Vendor
    NotificationService->>VendorApp: Send New Booking Alert
    VendorApp->>Vendor: Display New Booking Notification
    
    %% Booking Confirmation
    BookingService->>APIGateway: Return Updated Booking Status
    APIGateway->>MobileApp: Send Booking Confirmed
    MobileApp->>User: Display Booking Confirmation
    MobileApp->>MobileApp: Add to User's Calendar
    MobileApp->>User: Show Booking Success Screen
```

## 3. Booking Management Flow

```mermaid
sequenceDiagram
    actor User
    participant MobileApp as Mobile App
    participant APIGateway as API Gateway
    participant BookingService as Booking Service
    participant NotificationService as Notification Service
    participant PaymentService as Payment Service
    participant DB as Database
    participant VendorApp as Vendor Dashboard
    actor Vendor

    %% View Bookings
    User->>MobileApp: Open "My Bookings"
    MobileApp->>APIGateway: GET /bookings?status=all
    APIGateway->>BookingService: Get User Bookings
    BookingService->>DB: Query Bookings
    DB->>BookingService: Return Bookings Data
    BookingService->>APIGateway: Return Bookings List
    APIGateway->>MobileApp: Send Bookings Data
    MobileApp->>User: Display Bookings List
    
    %% View Booking Details
    User->>MobileApp: Select Booking
    MobileApp->>APIGateway: GET /bookings/{id}
    APIGateway->>BookingService: Get Booking Details
    BookingService->>DB: Query Booking Data
    DB->>BookingService: Return Booking Details
    BookingService->>APIGateway: Return Booking Data
    APIGateway->>MobileApp: Send Booking Details
    MobileApp->>User: Display Booking Details
    
    %% Cancel Booking
    alt Cancel Booking
        User->>MobileApp: Click "Cancel Booking"
        MobileApp->>User: Confirm Cancellation
        User->>MobileApp: Confirm
        MobileApp->>APIGateway: PUT /bookings/{id}/cancel
        APIGateway->>BookingService: Cancel Booking
        BookingService->>BookingService: Check Cancellation Policy
        BookingService->>DB: Update Booking Status
        
        alt Eligible for Refund
            BookingService->>PaymentService: Process Refund
            PaymentService->>PaymentService: Execute Refund
            PaymentService->>BookingService: Confirm Refund
        end
        
        BookingService->>NotificationService: Send Cancellation Notices
        NotificationService->>User: Send Cancellation Confirmation
        NotificationService->>VendorApp: Send Cancellation Alert
        VendorApp->>Vendor: Display Cancellation Notification
        
        BookingService->>APIGateway: Return Cancellation Confirmed
        APIGateway->>MobileApp: Send Cancellation Status
        MobileApp->>User: Show Cancellation Confirmation
    end
    
    %% Reschedule Booking
    alt Reschedule Booking
        User->>MobileApp: Click "Reschedule"
        MobileApp->>APIGateway: GET /services/{id}/availability?date=YYYY-MM-DD
        APIGateway->>BookingService: Check Availability
        BookingService->>DB: Query Available Slots
        DB->>BookingService: Return Available Slots
        BookingService->>APIGateway: Return Availability Data
        APIGateway->>MobileApp: Send Available Time Slots
        MobileApp->>User: Display Calendar for Rescheduling
        
        User->>MobileApp: Select New Date and Time
        MobileApp->>APIGateway: PUT /bookings/{id}/reschedule
        APIGateway->>BookingService: Reschedule Booking
        BookingService->>DB: Update Booking Time
        DB->>BookingService: Confirm Update
        
        BookingService->>NotificationService: Send Reschedule Notices
        NotificationService->>User: Send Reschedule Confirmation
        NotificationService->>VendorApp: Send Reschedule Alert
        VendorApp->>Vendor: Display Reschedule Notification
        
        BookingService->>APIGateway: Return Reschedule Confirmed
        APIGateway->>MobileApp: Send Updated Booking
        MobileApp->>User: Show Reschedule Confirmation
    end
    
    %% Check-in Flow
    alt Check-in (On Appointment Day)
        User->>MobileApp: Open Booking
        MobileApp->>MobileApp: Detect Appointment Day
        MobileApp->>User: Show Check-in Button
        User->>MobileApp: Click "Check-in"
        MobileApp->>APIGateway: PUT /bookings/{id}/check-in
        APIGateway->>BookingService: Record Check-in
        BookingService->>DB: Update Check-in Status
        DB->>BookingService: Confirm Update
        BookingService->>NotificationService: Notify Vendor of Check-in
        NotificationService->>VendorApp: Send Check-in Alert
        VendorApp->>Vendor: Display Check-in Notification
        BookingService->>APIGateway: Return Check-in Confirmed
        APIGateway->>MobileApp: Send Check-in Confirmation
        MobileApp->>User: Show Check-in Confirmation
    end
```

## Error Handling Details

### Error Scenarios During Booking Process

1. **Availability Conflicts**:
   - Slot no longer available (taken by another user)
   - Service temporarily unavailable
   - Response: 409 Conflict with message

2. **Payment Failures**:
   - Insufficient funds
   - Payment gateway error
   - Declined transaction
   - Response: 400 Payment Required with failure reason

3. **Validation Errors**:
   - Invalid pet information
   - Required fields missing
   - Response: 400 Bad Request with specific validation errors

4. **Service Unavailable**:
   - Vendor marked service as unavailable
   - Clinic closed on selected date
   - Response: 400 Bad Request with explanation

5. **Cancellation/Reschedule Policy Violations**:
   - Cancellation after allowed timeframe
   - Too many reschedule attempts
   - Response: 403 Forbidden with policy details

### Business Rules

1. **Booking Requirements**:
   - Must have active pet profile
   - Booking must be at least 1 hour in advance
   - Maximum 3 active bookings per pet

2. **Slot Duration and Availability**:
   - Default slots are 30 minutes
   - Service duration determines how many slots are reserved
   - Buffer time between appointments configurable by vendor

3. **Payment Rules**:
   - Full payment required to confirm booking
   - Partial payment options for premium users
   - Payment must complete within 15 minutes or slot is released

4. **Cancellation Policy**:
   - Full refund if cancelled 24+ hours before appointment
   - 50% refund if cancelled 12-24 hours before appointment
   - No refund if cancelled less than 12 hours before appointment
   - Policy customizable by vendor within platform limits

5. **Rescheduling Policy**:
   - Free rescheduling if done 24+ hours in advance
   - One free reschedule allowed, subsequent reschedules incur fee
   - No rescheduling less than 3 hours before appointment

## Implementation Notes

1. **Concurrency Control**:
   - Pessimistic locking for slot reservation
   - Transaction isolation level: Serializable for booking operations
   - Slot held for maximum 10 minutes during checkout process

2. **Performance**:
   - Search results cached for 1 hour with geospatial index
   - Availability calendar pre-computed nightly
   - Booking confirmation API response time < 1 second

3. **Scalability**:
   - Booking service horizontally scalable
   - Read replicas for availability queries
   - Scheduled jobs distributed across cluster

## Japanese Translation / 日本語訳

### 概要
このドキュメントでは、PetProプラットフォームでのクリニック検索、サービス閲覧、予約プロセスの詳細なレベル2シーケンス図を提供します。この図は、ユーザー、モバイルアプリ、バックエンドサービス、クリニック/ベンダーシステム間のステップバイステップのフローを示しています。

### エラー処理の詳細

#### 予約プロセス中のエラーシナリオ

1. **可用性の競合**:
   - スロットがもう利用できない（他のユーザーによって予約された）
   - サービスが一時的に利用不可
   - レスポンス: メッセージを含む409 Conflict

2. **決済の失敗**:
   - 残高不足
   - 決済ゲートウェイエラー
   - 取引拒否
   - レスポンス: 失敗理由を含む400 Payment Required

3. **バリデーションエラー**:
   - 無効なペット情報
   - 必須フィールドの欠落
   - レスポンス: 特定のバリデーションエラーを含む400 Bad Request

4. **サービス利用不可**:
   - ベンダーがサービスを利用不可としてマーク
   - 選択された日付にクリニックが閉店
   - レスポンス: 説明を含む400 Bad Request

5. **キャンセル/再スケジュールポリシー違反**:
   - 許可された時間枠後のキャンセル
   - 再スケジュールの試行回数が多すぎる
   - レスポンス: ポリシー詳細を含む403 Forbidden

#### ビジネスルール

1. **予約要件**:
   - アクティブなペットプロファイルが必要
   - 予約は少なくとも1時間前に行う必要がある
   - ペットごとに最大3つのアクティブな予約

2. **スロットの期間と可用性**:
   - デフォルトのスロットは30分
   - サービスの期間によって予約されるスロット数が決まる
   - 予約間のバッファ時間はベンダーが設定可能

3. **支払いルール**:
   - 予約を確認するには全額支払いが必要
   - プレミアムユーザー向けの部分支払いオプション
   - 支払いは15分以内に完了する必要があり、それ以外の場合はスロットが解放される

4. **キャンセルポリシー**:
   - 予約の24時間以上前にキャンセルした場合は全額返金
   - 予約の12〜24時間前にキャンセルした場合は50%返金
   - 予約の12時間未満前にキャンセルした場合は返金なし
   - ポリシーはプラットフォームの制限内でベンダーがカスタマイズ可能

5. **再スケジュールポリシー**:
   - 24時間以上前に行えば無料で再スケジュール可能
   - 1回の無料再スケジュールが許可され、それ以降の再スケジュールには料金が発生
   - 予約の3時間未満前の再スケジュールは不可

#### 実装メモ

1. **同時実行制御**:
   - スロット予約のための悲観的ロック
   - トランザクション分離レベル: 予約操作のためのSerializable
   - チェックアウトプロセス中は最大10分間スロットを保持

2. **パフォーマンス**:
   - 検索結果は地理空間インデックスで1時間キャッシュ
   - 可用性カレンダーは毎晩事前計算
   - 予約確認APIの応答時間 < 1秒

3. **スケーラビリティ**:
   - 予約サービスは水平方向にスケーラブル
   - 可用性クエリのための読み取りレプリカ
   - スケジュールされたジョブはクラスター全体に分散
