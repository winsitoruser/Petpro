# Vendor Registration & Onboarding Flow - Detailed Sequence Diagram (Level 2)

## Overview
This document provides a detailed Level 2 sequence diagram for the vendor registration and onboarding process in the PetPro platform. The diagram shows the step-by-step flow between the vendor, web portal, backend services, and administrative systems.

## 1. Vendor Registration Flow

```mermaid
sequenceDiagram
    actor Vendor
    participant WebPortal as Vendor Web Portal
    participant APIGateway as API Gateway
    participant AuthService as Authentication Service
    participant VendorService as Vendor Service
    participant VerificationService as Verification Service
    participant EmailService as Email Service
    participant AdminPanel as Admin Panel
    actor Admin
    participant DB as Database
    participant Storage as File Storage

    %% Initial Registration
    Vendor->>WebPortal: Access Vendor Registration Page
    WebPortal->>WebPortal: Display Registration Form
    
    Vendor->>WebPortal: Submit Basic Information (Business Name, Email, Phone)
    WebPortal->>WebPortal: Validate Input (Client-side)
    WebPortal->>APIGateway: POST /vendor/register (Basic Info)
    APIGateway->>VendorService: Process Registration Request
    
    VendorService->>VendorService: Validate Input (Server-side)
    VendorService->>AuthService: Check If Business Email Exists
    AuthService->>DB: Query Vendor Table
    DB->>AuthService: Return Result
    
    alt Email Already Registered
        AuthService->>VendorService: Email Exists Response
        VendorService->>APIGateway: 409 Conflict Response
        APIGateway->>WebPortal: Email Already Exists Error
        WebPortal->>Vendor: Show Error: "Email already registered"
    else Email Available
        AuthService->>VendorService: Email Available Response
        VendorService->>VendorService: Generate Verification Token
        VendorService->>DB: Create Pending Vendor Record
        DB->>VendorService: Confirm Creation
        VendorService->>EmailService: Send Verification Email
        EmailService->>Vendor: Deliver Verification Email
        VendorService->>APIGateway: 201 Created Response
        APIGateway->>WebPortal: Registration Success Response
        WebPortal->>Vendor: Show Email Verification Instructions
    end
    
    %% Email Verification
    Vendor->>Vendor: Open Email & Click Verification Link
    Vendor->>WebPortal: Access Verification Link
    WebPortal->>APIGateway: GET /vendor/verify/{token}
    APIGateway->>VendorService: Verify Email Token
    VendorService->>DB: Update Email Verified Status
    DB->>VendorService: Confirm Update
    VendorService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Verification Success
    WebPortal->>WebPortal: Redirect to Password Setup
    WebPortal->>Vendor: Display Password Setup Form
    
    %% Password Setup
    Vendor->>WebPortal: Set Account Password
    WebPortal->>APIGateway: POST /vendor/complete-registration
    APIGateway->>AuthService: Store Password
    AuthService->>AuthService: Hash Password
    AuthService->>DB: Update Vendor Record with Password
    DB->>AuthService: Confirm Update
    AuthService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Account Setup Complete
    WebPortal->>WebPortal: Redirect to Profile Completion
    WebPortal->>Vendor: Display Profile Completion Form
```

## 2. Business Profile & Verification Flow

```mermaid
sequenceDiagram
    actor Vendor
    participant WebPortal as Vendor Web Portal
    participant APIGateway as API Gateway
    participant VendorService as Vendor Service
    participant VerificationService as Verification Service
    participant AdminPanel as Admin Panel
    actor Admin
    participant DB as Database
    participant Storage as File Storage

    %% Business Information
    WebPortal->>Vendor: Request Business Information
    Vendor->>WebPortal: Complete Business Profile Form
    Vendor->>WebPortal: Upload Business Registration Documents
    WebPortal->>APIGateway: POST /vendor/profile/business
    APIGateway->>VendorService: Store Business Information
    
    VendorService->>Storage: Store Documents
    Storage->>VendorService: Return Document URLs
    VendorService->>DB: Update Vendor Profile
    DB->>VendorService: Confirm Update
    
    VendorService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Profile Update Successful
    WebPortal->>WebPortal: Show Next Form Section
    
    %% Address & Location
    Vendor->>WebPortal: Enter Business Address & Location
    WebPortal->>APIGateway: POST /vendor/profile/location
    APIGateway->>VendorService: Store Location Information
    VendorService->>VendorService: Geocode Address
    VendorService->>DB: Update Vendor Location
    DB->>VendorService: Confirm Update
    VendorService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Location Updated Successfully
    WebPortal->>WebPortal: Show Next Form Section
    
    %% Service & Operating Hours
    Vendor->>WebPortal: Enter Services & Operating Hours
    WebPortal->>APIGateway: POST /vendor/profile/services
    APIGateway->>VendorService: Store Service Information
    VendorService->>DB: Update Vendor Services
    DB->>VendorService: Confirm Update
    VendorService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Services Updated Successfully
    WebPortal->>WebPortal: Show Next Form Section
    
    %% Payment Information
    Vendor->>WebPortal: Enter Payment Information
    WebPortal->>APIGateway: POST /vendor/profile/payment
    APIGateway->>VendorService: Store Payment Information
    VendorService->>DB: Update Vendor Payment Details
    DB->>VendorService: Confirm Update
    VendorService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Payment Information Updated
    WebPortal->>WebPortal: Show Profile Summary
    
    %% Profile Review & Submission
    WebPortal->>Vendor: Show Complete Profile for Review
    Vendor->>WebPortal: Review and Submit Profile
    WebPortal->>APIGateway: PUT /vendor/profile/submit
    APIGateway->>VendorService: Submit Profile for Verification
    VendorService->>DB: Update Vendor Status to PENDING_VERIFICATION
    DB->>VendorService: Confirm Update
    
    VendorService->>VerificationService: Queue for Verification
    VerificationService->>DB: Record Verification Request
    
    VendorService->>APIGateway: 200 OK Response
    APIGateway->>WebPortal: Profile Submitted Successfully
    WebPortal->>Vendor: Show Verification Pending Status
    
    %% Admin Verification Process
    VerificationService->>AdminPanel: Add Vendor to Verification Queue
    AdminPanel->>Admin: Show Pending Vendor Verification
    Admin->>AdminPanel: Review Vendor Information
    
    alt Approve Vendor
        Admin->>AdminPanel: Approve Vendor
        AdminPanel->>APIGateway: PUT /admin/vendor/{id}/approve
        APIGateway->>VendorService: Process Vendor Approval
        VendorService->>DB: Update Vendor Status to ACTIVE
        DB->>VendorService: Confirm Update
        VendorService->>EmailService: Send Approval Notification
        EmailService->>Vendor: Deliver Approval Email
    else Request More Information
        Admin->>AdminPanel: Request Additional Information
        AdminPanel->>APIGateway: PUT /admin/vendor/{id}/request-info
        APIGateway->>VendorService: Process Information Request
        VendorService->>DB: Update Vendor Status to INFO_REQUESTED
        DB->>VendorService: Confirm Update
        VendorService->>EmailService: Send Information Request
        EmailService->>Vendor: Deliver Request Email
    else Reject Vendor
        Admin->>AdminPanel: Reject Vendor Application
        AdminPanel->>APIGateway: PUT /admin/vendor/{id}/reject
        APIGateway->>VendorService: Process Vendor Rejection
        VendorService->>DB: Update Vendor Status to REJECTED
        DB->>VendorService: Confirm Update
        VendorService->>EmailService: Send Rejection Notification
        EmailService->>Vendor: Deliver Rejection Email
    end
```

## 3. Vendor Dashboard Initial Setup

```mermaid
sequenceDiagram
    actor Vendor
    participant WebPortal as Vendor Web Portal
    participant APIGateway as API Gateway
    participant VendorService as Vendor Service
    participant ProductService as Product Service
    participant ServiceCatalog as Service Catalog
    participant DB as Database
    participant Storage as File Storage

    %% First Login After Approval
    Vendor->>WebPortal: Login with Credentials
    WebPortal->>APIGateway: POST /vendor/auth/login
    APIGateway->>AuthService: Verify Credentials
    AuthService->>AuthService: Generate JWT Tokens
    AuthService->>APIGateway: Return Authentication Tokens
    APIGateway->>WebPortal: Login Success with Tokens
    WebPortal->>WebPortal: Store Tokens
    WebPortal->>WebPortal: Load Dashboard
    
    WebPortal->>APIGateway: GET /vendor/dashboard/setup-status
    APIGateway->>VendorService: Check Setup Completion
    VendorService->>DB: Query Setup Status
    DB->>VendorService: Return Status
    VendorService->>APIGateway: Return Setup Status
    APIGateway->>WebPortal: Setup Status Response
    
    alt Setup Incomplete
        WebPortal->>Vendor: Show Setup Wizard
        
        %% Service Catalog Setup
        WebPortal->>APIGateway: GET /vendor/service-categories
        APIGateway->>ServiceCatalog: Get Available Categories
        ServiceCatalog->>DB: Query Service Categories
        DB->>ServiceCatalog: Return Categories
        ServiceCatalog->>APIGateway: Return Categories List
        APIGateway->>WebPortal: Service Categories Response
        WebPortal->>Vendor: Display Service Selection
        
        Vendor->>WebPortal: Select Service Categories & Add Services
        WebPortal->>APIGateway: POST /vendor/services/batch
        APIGateway->>ServiceCatalog: Add Vendor Services
        ServiceCatalog->>DB: Create Service Records
        DB->>ServiceCatalog: Confirm Creation
        ServiceCatalog->>APIGateway: Services Created Response
        APIGateway->>WebPortal: Success Response
        WebPortal->>Vendor: Show Service Setup Complete
        
        %% Product Catalog Setup (if applicable)
        WebPortal->>APIGateway: GET /vendor/product-categories
        APIGateway->>ProductService: Get Available Categories
        ProductService->>DB: Query Product Categories
        DB->>ProductService: Return Categories
        ProductService->>APIGateway: Return Categories List
        APIGateway->>WebPortal: Product Categories Response
        WebPortal->>Vendor: Display Product Addition Form
        
        Vendor->>WebPortal: Add Initial Products
        WebPortal->>APIGateway: POST /vendor/products
        APIGateway->>ProductService: Add Product
        ProductService->>Storage: Store Product Images
        Storage->>ProductService: Return Image URLs
        ProductService->>DB: Create Product Records
        DB->>ProductService: Confirm Creation
        ProductService->>APIGateway: Product Created Response
        APIGateway->>WebPortal: Success Response
        WebPortal->>Vendor: Show Product Added Confirmation
        
        %% Staff & Calendar Setup
        Vendor->>WebPortal: Add Staff Members
        WebPortal->>APIGateway: POST /vendor/staff
        APIGateway->>VendorService: Add Staff Member
        VendorService->>DB: Create Staff Record
        DB->>VendorService: Confirm Creation
        VendorService->>APIGateway: Staff Created Response
        APIGateway->>WebPortal: Success Response
        WebPortal->>Vendor: Show Staff Added Confirmation
        
        Vendor->>WebPortal: Configure Business Hours
        WebPortal->>APIGateway: POST /vendor/business-hours
        APIGateway->>VendorService: Set Business Hours
        VendorService->>DB: Update Hours Configuration
        DB->>VendorService: Confirm Update
        VendorService->>APIGateway: Hours Updated Response
        APIGateway->>WebPortal: Success Response
        WebPortal->>Vendor: Show Hours Configured Confirmation
        
        %% Setup Completion
        WebPortal->>APIGateway: PUT /vendor/dashboard/complete-setup
        APIGateway->>VendorService: Mark Setup Complete
        VendorService->>DB: Update Setup Status
        DB->>VendorService: Confirm Update
        VendorService->>APIGateway: Setup Completed Response
        APIGateway->>WebPortal: Success Response
        WebPortal->>Vendor: Show Setup Completion Congratulations
        WebPortal->>WebPortal: Redirect to Main Dashboard
    else Setup Complete
        WebPortal->>WebPortal: Load Main Dashboard
        WebPortal->>APIGateway: GET /vendor/dashboard/summary
        APIGateway->>VendorService: Get Dashboard Summary
        VendorService->>DB: Query Dashboard Data
        DB->>VendorService: Return Summary Data
        VendorService->>APIGateway: Dashboard Data Response
        APIGateway->>WebPortal: Dashboard Data
        WebPortal->>Vendor: Display Dashboard with Summary
    end
```

## Error Handling Details

### Error Scenarios During Vendor Registration

1. **Validation Errors**:
   - Business email format invalid
   - Required business information missing
   - Response: 400 Bad Request with specific validation errors

2. **Verification Failures**:
   - Invalid or expired verification token
   - Business already registered
   - Response: 409 Conflict or 400 Bad Request with specific message

3. **Document Upload Issues**:
   - File too large
   - Invalid file format
   - Upload failed
   - Response: 413 Payload Too Large or 400 Bad Request

4. **Business Verification Failures**:
   - Business information cannot be verified
   - Business license expired or invalid
   - Response: Application moves to VERIFICATION_FAILED status

5. **Address Validation Issues**:
   - Address cannot be geocoded
   - Address not found
   - Response: 400 Bad Request with address validation error

### Business Rules

1. **Registration Requirements**:
   - Valid business email required
   - Business registration documents required
   - Physical address verification required
   - At least one service category must be offered

2. **Verification Process**:
   - Email verification mandatory
   - Business document verification required
   - Address verification required
   - Admin approval required before activation

3. **Password Policy**:
   - Minimum 10 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

4. **Service Catalog Rules**:
   - Minimum 1 service required
   - Maximum 50 services per vendor
   - Service pricing must be within platform guidelines
   - Service duration must be in 15-minute increments

5. **Operating Hours**:
   - At least 3 business days per week required
   - Minimum 4 operating hours per business day
   - Buffer time between appointments configurable (default: 15 minutes)

## Implementation Notes

1. **Security Considerations**:
   - Business documents stored with encryption at rest
   - Secure document viewing for admin verification
   - Role-based access control for staff accounts
   - Audit log of all profile changes

2. **Performance**:
   - Registration form multi-step process with state preservation
   - Document upload with compression and optimization
   - Asynchronous verification process

3. **Scalability**:
   - Vendor verification queues distributed by region
   - Document storage with CDN for optimized retrieval
   - Separate scaling for vendor authentication service

## Japanese Translation / 日本語訳

### 概要
このドキュメントでは、PetProプラットフォームにおけるベンダー登録とオンボーディングプロセスの詳細なレベル2シーケンス図を提供します。この図は、ベンダー、Webポータル、バックエンドサービス、管理システム間のステップバイステップのフローを示しています。

### エラー処理の詳細

#### ベンダー登録中のエラーシナリオ

1. **バリデーションエラー**:
   - ビジネスメールの形式が無効
   - 必要なビジネス情報の欠落
   - レスポンス: 特定のバリデーションエラーを含む400 Bad Request

2. **検証の失敗**:
   - 無効または期限切れの検証トークン
   - ビジネスがすでに登録されている
   - レスポンス: 特定のメッセージを含む409 Conflictまたは400 Bad Request

3. **ドキュメントアップロードの問題**:
   - ファイルサイズが大きすぎる
   - 無効なファイル形式
   - アップロード失敗
   - レスポンス: 413 Payload Too Largeまたは400 Bad Request

4. **ビジネス検証の失敗**:
   - ビジネス情報を検証できない
   - ビジネスライセンスの期限切れまたは無効
   - レスポンス: アプリケーションはVERIFICATION_FAILEDステータスに移行

5. **住所検証の問題**:
   - 住所をジオコーディングできない
   - 住所が見つからない
   - レスポンス: 住所検証エラーを含む400 Bad Request

#### ビジネスルール

1. **登録要件**:
   - 有効なビジネスメールが必要
   - ビジネス登録書類が必要
   - 物理的な住所検証が必要
   - 少なくとも1つのサービスカテゴリを提供する必要がある

2. **検証プロセス**:
   - メール検証は必須
   - ビジネス書類の検証が必要
   - 住所検証が必要
   - 有効化前に管理者の承認が必要

3. **パスワードポリシー**:
   - 最低10文字
   - 少なくとも1つの大文字
   - 少なくとも1つの小文字
   - 少なくとも1つの数字
   - 少なくとも1つの特殊文字

4. **サービスカタログのルール**:
   - 最低1つのサービスが必要
   - ベンダーごとに最大50のサービス
   - サービス価格はプラットフォームのガイドライン内である必要がある
   - サービス時間は15分単位である必要がある

5. **営業時間**:
   - 週に少なくとも3営業日が必要
   - 営業日あたり最低4時間の営業時間
   - 予約間のバッファ時間は設定可能（デフォルト：15分）

#### 実装メモ

1. **セキュリティに関する考慮事項**:
   - ビジネス書類は保存時に暗号化
   - 管理者検証のための安全な書類閲覧
   - スタッフアカウントのロールベースアクセス制御
   - すべてのプロファイル変更の監査ログ

2. **パフォーマンス**:
   - 状態保存を伴う多段階の登録フォームプロセス
   - 圧縮と最適化を伴うドキュメントアップロード
   - 非同期検証プロセス

3. **スケーラビリティ**:
   - 地域ごとに分散されたベンダー検証キュー
   - 最適化された取得のためのCDNを備えたドキュメントストレージ
   - ベンダー認証サービスの個別スケーリング
