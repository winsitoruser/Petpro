# Product Requirements Document (PRD) - MVP Multi-Vendor Pet Clinic + E-commerce

## 1. Overview

PetPro is a comprehensive platform that connects pet owners with veterinary clinics and pet products. The platform consists of three main components:

- **Mobile App (User)**: For booking services & purchasing products
- **Web Dashboard (Vendor/Clinic)**: For managing services, products, bookings, and reports
- **Web Admin Dashboard**: For complete control over vendors, users, transactions, and commissions

## 2. Actors & Access Control

| Role | Platform Access | Primary Access Rights |
|------|----------------|----------------------|
| User | Mobile App (iOS/Android) | Search, book, purchase products, review |
| Vendor | Web/PWA | Manage services, products, bookings, orders |
| Admin | Web | Manage vendors/users, reports, commissions |

## 3. Detailed User Stories & Acceptance Criteria

### 3.1 User (Mobile App)

#### US-001: Registration & Login

**Story**: As a user, I want to register/login using email, phone number (OTP), or Google/Apple so I can access all features.

**Acceptance Criteria**:
- **Registration**:
  - Email/phone number validation, no duplicates
  - OTP sent within ≤ 5 seconds via SMS
  - OTP valid for ≤ 5 minutes
  - Error messages for incorrect or expired OTP
- **Login**:
  - Google/Apple ID login works without bugs
  - Password encryption (bcrypt, minimum 8 characters)
- **Security**:
  - JWT token + refresh token for sessions
  - Logout removes token from device

**Flow**:
1. User selects login method (Email, Phone, Google/Apple)
2. Input credentials → verification
3. Token stored in secure storage (Keychain/Keystore)

**Edge Cases**:
- OTP delay → "Resend OTP" option active after 30 seconds
- Forgotten password → reset via email

**UI Notes**:
- Minimal steps, single screen for login & register (tab-switch)
- Loading indicator while requesting OTP

#### US-002: Pet Profile

**Story**: As a user, I want to add pet profiles to help clinics prepare for services.

**Acceptance Criteria**:
- Can add multiple pets
- Required fields: name, type (dog/cat/etc), breed, date of birth
- Pet photo upload
- Manual vaccine history input

**Flow**:
1. User → "Pet Profile" menu → Add Pet
2. Complete form → Save
3. Data stored in database, related to user_id

**Edge Cases**:
- Photos > 5MB → automatic client-side compression

#### US-003: Clinic Search

**Story**: As a user, I want to search for nearby clinics based on location, services, or ratings.

**Acceptance Criteria**:
- User location captured via GPS
- Filters: service category, opening hours, rating
- Sort options: nearest, highest rating
- Closed clinics still displayed but marked as closed

**Flow**:
1. User enters keywords or activates filters
2. API returns clinic list based on filters
3. User taps for clinic details

#### US-004: Service Booking

**Story**: As a user, I want to select a service slot at a clinic and pay to secure an appointment.

**Acceptance Criteria**:
- Real-time slot synchronization from vendor dashboard
- Initial booking status = "Pending" or "Confirmed"
- Successful payment → booking automatically "Confirmed"
- Push notification + email sent

**Flow**:
1. Select clinic → select service → select slot → checkout
2. Payment via gateway (Midtrans/Xendit)
3. API updates booking status

**Edge Cases**:
- Slot taken by another user before payment completion → "Slot unavailable" notification

#### US-005: Product Purchase

**Story**: As a user, I want to buy products from clinics/vendors.

**Acceptance Criteria**:
- Products can be added to cart (multi-vendor)
- Automatic order splitting for multi-vendor orders
- Shipping calculated via courier API (JNE/Grab)
- Real-time order status updates: "Paid" → "Shipped" → "Completed"

**Flow**:
1. Add to cart → checkout
2. Select shipping and payment methods
3. Payment → order processing

**Edge Cases**:
- Out-of-stock after checkout → automatic refund

#### US-006: History & Reviews

**Story**: As a user, I want to view transaction history and leave reviews.

**Acceptance Criteria**:
- Reviews only allowed after order/booking completion
- Rating 1-5 stars + comments
- Reviews displayed on clinic/product pages

### 3.2 Vendor (Clinic Dashboard)

#### US-101: Clinic Registration

**Story**: As a vendor, I want to register my clinic with official data and documents.

**Acceptance Criteria**:
- Required fields: name, address, opening hours, services, legal documents
- Initial status "Awaiting Approval"
- Admin can approve/reject with reason

#### US-102: Service Management

**Story**: As a vendor, I want to manage services and pricing.

**Acceptance Criteria**:
- CRUD operations for services successful
- Duration and price are required fields
- Slots automatically unavailable when booked

#### US-103: Product Management

**Story**: As a vendor, I want to manage inventory and product pricing.

**Acceptance Criteria**:
- Stock automatically updated when orders received
- Low stock notifications
- CSV product import capability

#### US-104: Booking & Order Management

**Story**: As a vendor, I want to manage bookings and orders.

**Acceptance Criteria**:
- Filter by status
- Status updates → notifications to users
- Booking cancellation with reason

### 3.3 Admin Dashboard

#### US-201: Vendor Management

**Story**: As an admin, I want to approve vendors.

**Acceptance Criteria**:
- List of pending vendors
- Approve/reject with reason
- Email notifications to vendors

#### US-202: Transaction Monitoring

**Story**: As an admin, I want to view transaction reports.

**Acceptance Criteria**:
- Transaction graphs by day/month
- Filter by vendor
- CSV/PDF export

#### US-203: Commission Settings

**Story**: As an admin, I want to set commission percentages.

**Acceptance Criteria**:
- Global and per-vendor commissions
- Applied to subsequent transactions

## 4. Non-Functional Requirements

- **Performance**: API response < 500ms (P95)
- **Availability**: 99% uptime
- **Security**: TLS, hashed passwords, RBAC, audit logs
- **Scalability**: Support for 10k DAU

## 5. Technical Dependencies

- **Payment**: Midtrans/Xendit
- **Shipping**: JNE/SiCepat/Grab API
- **Maps**: Google Maps API
- **Push notifications**: FCM
- **Storage**: AWS S3
