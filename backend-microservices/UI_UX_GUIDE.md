# 🎨 PetPro UI/UX Design Guide

Panduan lengkap untuk mendesain interface Admin Dashboard dan Mobile App berdasarkan backend architecture yang sudah ada.

---

## 📊 **ADMIN DASHBOARD (via Admin Gateway)**

### **🔐 1. Authentication & Access Control**

#### **Login Page**
```
API: POST /auth/login
Required Fields:
├── email: string (email format validation)
├── password: string (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)

Optional Fields:
├── rememberMe: boolean (default: false)

Response Data:
├── access_token: string (JWT token)
├── refresh_token: string
├── user: object (user profile data)
├── expires_in: number (token expiration in seconds)

UI Components:
├── Email input field (with email validation feedback)
├── Password input field (with show/hide toggle)
├── Remember me checkbox
├── Login button (disabled until valid input)
├── Forgot password link
├── Loading spinner during authentication
└── Error message display area
```

#### **Admin Registration/Invitation**
```
API: POST /admin/users/invite
Required Fields:
├── email: string (valid email, unique check)
├── firstName: string (2-50 chars, only letters)
├── lastName: string (2-50 chars, only letters) 
├── role: enum ['admin', 'moderator', 'super_admin']
├── permissions: array of strings

Optional Fields:
├── phone: string (international format validation)
├── department: string
├── notes: text (admin notes about this user)

UI Form Fields:
├── Email: text input with real-time validation
├── First Name: text input (auto-capitalize)
├── Last Name: text input (auto-capitalize)
├── Role: dropdown select with descriptions
├── Permissions: multi-select checkboxes with categories
├── Phone: formatted input with country code selector
├── Department: text input with autocomplete
├── Notes: textarea (optional, max 500 chars)
```

#### **Role-based Dashboard**
```
Available Roles: Super Admin, Admin, Moderator
UI Layout:
├── Sidebar navigation (role-based menu)
├── Header with user info & logout
├── Main content area
└── Breadcrumb navigation
```

---

### **📈 2. Dashboard Analytics**

#### **Overview Dashboard**
```
API: GET /dashboard/stats
Data yang ditampilkan:
├── Total users (customers, vendors)
├── Active bookings count
├── Revenue metrics
├── Product inventory status
├── System health indicators
└── Recent activity feed
```

**UI Components:**
- **KPI Cards**: Total users, bookings, revenue
- **Charts**: Revenue trends, booking patterns
- **Activity Timeline**: Recent system activities
- **Quick Actions**: Common admin tasks

#### **Real-time Monitoring**
```
API: GET /dashboard/health
Data yang ditampilkan:
├── Service status (all microservices)
├── Database connections
├── Redis status
├── Response times
└── Error rates
```

---

### **👥 3. User Management**

#### **User List & Search**
```
API: GET /users (with pagination & filters)
Query Parameters:
├── page: number (default: 1)
├── limit: number (default: 20, max: 100)
├── search: string (search in name, email, phone)
├── role: enum ['customer', 'vendor', 'admin']
├── status: enum ['active', 'inactive', 'banned', 'pending']
├── verificationStatus: enum ['verified', 'unverified', 'pending']
├── registeredFrom: date (YYYY-MM-DD)
├── registeredTo: date (YYYY-MM-DD)
├── lastLoginFrom: date (YYYY-MM-DD)
├── city: string
├── sortBy: enum ['name', 'email', 'createdAt', 'lastLogin']
├── sortOrder: enum ['asc', 'desc']

Response Data:
├── users: array of user objects
├── pagination: { total, page, limit, totalPages }
├── filters: { appliedFilters, availableOptions }

User Object Fields:
├── id: string (UUID)
├── firstName: string
├── lastName: string
├── email: string
├── phone: string
├── role: string
├── status: string
├── isEmailVerified: boolean
├── avatar: string (URL)
├── createdAt: datetime
├── lastLoginAt: datetime
├── address: object { street, city, state, country, zipCode }
├── petCount: number (calculated field)
├── bookingCount: number (calculated field)
├── totalSpent: number (calculated field)
```

**UI Table Columns:**
- **Avatar + Name**: Profile photo + full name (sortable)
- **Email**: Email with verification badge (sortable)
- **Phone**: Phone number with country code
- **Role**: Badge with role color coding
- **Status**: Status badge (active=green, inactive=yellow, banned=red)
- **Registration**: Date registered (sortable)
- **Last Login**: Last login date (sortable)
- **Actions**: Quick actions dropdown

**Filter Panel Fields:**
- **Search**: Text input (search name, email, phone)
- **Role**: Multi-select checkboxes
- **Status**: Multi-select checkboxes
- **Verification**: Toggle options
- **Registration Date**: Date range picker
- **Location**: City autocomplete input
- **Sort Options**: Dropdown with sort criteria

**Bulk Actions Available:**
- **Activate Users**: Change status to active
- **Deactivate Users**: Change status to inactive  
- **Send Email**: Bulk email to selected users
- **Export**: CSV/Excel export with selected filters
- **Delete**: Soft delete (admin only)

#### **User Detail & Edit**
```
API: GET /users/:id
Response Data (Complete User Profile):
├── id: string (UUID, readonly)
├── firstName: string (2-50 chars, required)
├── lastName: string (2-50 chars, required)
├── email: string (email format, unique, required)
├── phone: string (international format, optional)
├── dateOfBirth: date (YYYY-MM-DD, optional)
├── gender: enum ['male', 'female', 'other']
├── avatar: string (image URL, optional)
├── role: enum ['customer', 'vendor', 'admin', 'moderator']
├── status: enum ['active', 'inactive', 'banned', 'pending']
├── isEmailVerified: boolean (readonly)
├── isPhoneVerified: boolean (readonly)
├── lastLoginAt: datetime (readonly)
├── createdAt: datetime (readonly)
├── updatedAt: datetime (readonly)

Address Information:
├── addresses: array of address objects
│   ├── id: string (UUID)
│   ├── type: enum ['home', 'work', 'other']
│   ├── street: string (required, max 200 chars)
│   ├── city: string (required, max 100 chars)
│   ├── state: string (required, max 100 chars)
│   ├── country: string (required, ISO country code)
│   ├── zipCode: string (required, postal code format)
│   ├── isDefault: boolean
│   └── coordinates: object { lat: number, lng: number }

Pet Information (readonly in user edit):
├── pets: array of pet objects
│   ├── id: string (UUID)
│   ├── name: string
│   ├── species: string
│   ├── breed: string
│   ├── age: number (calculated from birthDate)
│   └── photo: string (image URL)

Activity Summary (readonly):
├── totalBookings: number
├── totalSpent: number (currency format)
├── averageRating: number (1-5 stars)
├── lastBookingDate: datetime
├── favoriteServices: array of service names
```

**API: PUT /users/:id (Update User)**
```
Editable Fields:
├── firstName: string (validation: 2-50 chars, letters only)
├── lastName: string (validation: 2-50 chars, letters only)
├── email: string (validation: email format, uniqueness check)
├── phone: string (validation: international format)
├── dateOfBirth: date (validation: age >= 13, <= 120)
├── gender: enum selection
├── role: enum (admin only, requires confirmation)
├── status: enum (admin only, requires reason for ban/deactivation)

Address Management:
├── Add new address (all fields required except coordinates)
├── Edit existing address
├── Delete address (confirm if default address)
├── Set default address (automatically unset others)

Admin Actions (role-based):
├── Reset password: triggers email to user
├── Force email verification: marks email as verified
├── Send welcome email: resends onboarding email
├── View login history: shows last 50 login sessions
├── Add admin notes: internal notes (not visible to user)
```

**UI Form Layout:**

**Tab 1: Personal Information**
- **Profile Photo**: Image upload with crop functionality
- **Basic Info**: First name, last name, email (with verification status)
- **Contact**: Phone number with country code selector
- **Demographics**: Date of birth (date picker), gender (radio buttons)
- **Account Status**: Role and status (admin only, with confirmation dialogs)

**Tab 2: Addresses**
- **Address List**: Table with type, address, default indicator
- **Add Address Form**: Multi-step address input with map validation
- **Actions**: Edit, delete, set as default for each address

**Tab 3: Pets** (readonly view)
- **Pet Gallery**: Cards showing pet photos and basic info
- **Quick Stats**: Total pets, most recent vet visit
- **Link to Pet Management**: Button to manage pets in pet section

**Tab 4: Activity & History**
- **Booking History**: Recent bookings with status and dates
- **Login Sessions**: Device, location, date/time of logins
- **Account Changes**: Audit trail of profile modifications
- **Admin Notes**: Internal notes section (admin only)

**Form Validation Rules:**
- **Real-time validation**: Show errors as user types
- **Required field indicators**: Red asterisk for required fields
- **Email uniqueness check**: API call to verify email availability
- **Phone format validation**: Country-specific phone number formatting
- **Age validation**: Calculate age from date of birth, enforce minimum age
- **Address validation**: Google Maps API integration for address verification

---

### **🏥 4. Vendor Management**

#### **Vendor Directory**
```
API: GET /vendors (with filters)
Filters & Search:
├── Business name
├── Location/city
├── Service categories
├── Rating range
├── Status (pending, approved, suspended)
└── Registration date
```

**UI Components:**
- **Card Layout** dengan vendor preview
- **Map View** untuk location-based display
- **Status Badges** (pending, approved, rejected)
- **Rating Display** dengan stars & numbers
- **Quick Actions** (approve, suspend, contact)

#### **Vendor Approval Workflow**
```
API: PUT /vendors/:id/status
Status Flow: Pending → Review → Approved/Rejected
Documents to verify:
├── Business license
├── Veterinary certificates  
├── Insurance documents
├── ID verification
└── Business address proof
```

**UI Features:**
- **Document Viewer** dengan zoom & download
- **Approval Checklist** untuk verification
- **Comments System** untuk rejection reasons
- **Email Templates** untuk communication
- **Status Timeline** menunjukkan approval process

---

### **📦 5. Inventory & Product Management**

#### **Product Catalog Management**

**API: GET /products (Product List)**
```
Query Parameters:
├── page: number (default: 1)
├── limit: number (default: 24, max: 100)
├── search: string (search in name, description, SKU)
├── category: string (category ID)
├── vendor: string (vendor ID)
├── status: enum ['active', 'draft', 'discontinued', 'out_of_stock']
├── priceMin: number (minimum price filter)
├── priceMax: number (maximum price filter)
├── stockStatus: enum ['in_stock', 'low_stock', 'out_of_stock']
├── featured: boolean (featured products only)
├── sortBy: enum ['name', 'price', 'createdAt', 'stock', 'rating']
├── sortOrder: enum ['asc', 'desc']

Response Data:
├── products: array of product objects
├── pagination: { total, page, limit, totalPages }
├── filters: { categories, priceRange, stockCounts }

Product Object (List View):
├── id: string (UUID)
├── name: string
├── description: string (truncated for list)
├── sku: string
├── price: number (retail price)
├── salePrice: number (discounted price, nullable)
├── costPrice: number (admin only)
├── mainImage: string (primary product image URL)
├── category: object { id, name, slug }
├── vendor: object { id, businessName, rating }
├── stockQuantity: number
├── stockStatus: enum
├── status: enum
├── rating: number (average rating)
├── reviewCount: number
├── isFeatured: boolean
├── createdAt: datetime
├── updatedAt: datetime
```

**API: POST /products (Create Product)**
```
Required Fields:
├── name: string (3-200 chars, unique per vendor)
├── description: text (min 10 chars, max 2000 chars)
├── sku: string (unique, alphanumeric + dash/underscore)
├── price: number (> 0, max 2 decimal places)
├── categoryId: string (valid category UUID)
├── vendorId: string (valid vendor UUID)

Optional Fields:
├── salePrice: number (must be < price if provided)
├── costPrice: number (for margin calculation)
├── weight: number (in grams)
├── dimensions: object { length, width, height } (in cm)
├── brand: string (1-100 chars)
├── tags: array of strings (max 10 tags, 1-30 chars each)
├── petTypes: array ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other']
├── minimumAge: number (months, for age-appropriate products)
├── maximumAge: number (months, nullable)
├── stockQuantity: number (default: 0)
├── lowStockThreshold: number (default: 10)
├── isFeatured: boolean (admin only, default: false)
├── status: enum (default: 'draft')

Image Upload:
├── images: array of image files (max 8 images)
├── mainImageIndex: number (which image is primary)
├── imageAltTexts: array of strings (SEO alt texts)

Validation Rules:
├── Name uniqueness: per vendor (not global)
├── SKU uniqueness: global across all products
├── Price validation: positive numbers only
├── Sale price: must be less than regular price
├── Image format: JPEG, PNG, WebP (max 5MB each)
├── Image dimensions: min 400x400px, max 2000x2000px
```

**API: PATCH /products/:id (Update Product)**
```
Editable Fields (all optional):
├── name: string (with uniqueness check)
├── description: text
├── price: number (with price history tracking)
├── salePrice: number (nullable)
├── stockQuantity: number (with inventory tracking)
├── lowStockThreshold: number
├── status: enum (with status change logging)
├── isFeatured: boolean (admin only)
├── tags: array modification
├── petTypes: array modification

Batch Update Operations:
├── updatePrices: bulk price updates with percentage/fixed amount
├── updateStatus: bulk status changes
├── updateStock: bulk stock adjustments
├── updateCategory: move products to different category
```

**UI Product Form - Multi-Step Wizard:**

**Step 1: Basic Information**
- **Product Name**: Text input with real-time uniqueness check
- **SKU**: Auto-generated + manual override option
- **Category**: Hierarchical dropdown with search
- **Brand**: Text input with autocomplete from existing brands
- **Description**: Rich text editor with character count
- **Tags**: Tag input with suggestions from existing tags
- **Pet Types**: Multi-select checkboxes with icons

**Step 2: Pricing & Inventory**
- **Regular Price**: Number input with currency formatting
- **Sale Price**: Optional number input (must be < regular price)
- **Cost Price**: Admin only, for margin calculation display
- **Stock Quantity**: Number input with +/- buttons
- **Low Stock Alert**: Number input for notification threshold
- **Weight & Dimensions**: For shipping calculations

**Step 3: Images & Media**
- **Image Upload**: Drag & drop zone with preview
- **Image Editor**: Crop, rotate, adjust brightness/contrast
- **Alt Text**: SEO alt text for each image
- **Primary Image**: Radio selection for main product image
- **Image Order**: Drag to reorder gallery images

**Step 4: Advanced Settings**
- **Status**: Draft, Active, Discontinued (with reason)
- **Featured Product**: Admin checkbox
- **Age Restrictions**: Min/max age for safety
- **Shipping Info**: Dimensions and weight for shipping
- **SEO Settings**: Meta title, description, keywords

**UI Product List Interface:**

**Toolbar:**
- **Add Product**: Primary action button
- **Import Products**: CSV/Excel bulk import
- **Export Products**: Export with current filters
- **Bulk Actions**: Multi-select operations

**Filter Panel:**
- **Search**: Product name, SKU, description
- **Category**: Tree view with expand/collapse
- **Vendor**: Searchable dropdown
- **Price Range**: Dual slider with manual input
- **Stock Status**: Radio buttons with counts
- **Status**: Multi-select checkboxes
- **Date Added**: Date range picker

**Product Grid/List View:**
- **Grid View**: Product cards with image, name, price, stock
- **List View**: Table with detailed information
- **Quick Actions**: Edit, duplicate, delete, view analytics
- **Status Indicators**: Color-coded badges
- **Stock Alerts**: Low stock warning icons
- **Performance Metrics**: Views, sales, rating per product

**Product Analytics Dashboard:**
- **Sales Performance**: Revenue, quantity sold, trends
- **Inventory Turnover**: How fast products sell
- **Customer Engagement**: Views, wishlist adds, reviews
- **Profit Margins**: Cost vs sale price analysis
- **Search Performance**: How often product appears in search

#### **Category Management**
```
API: GET /categories
Hierarchical structure:
Dogs
├── Food
│   ├── Dry Food
│   └── Wet Food
├── Toys
└── Accessories
```

**UI Features:**
- **Tree View** untuk hierarchical categories
- **Drag & Drop** untuk reordering
- **Icon Selection** untuk category representation
- **SEO Settings** untuk each category

---

### **📋 6. Booking & Service Management**

#### **Booking Overview**
```
API: GET /bookings (all bookings dengan filters)
Filters:
├── Date range
├── Status (pending, confirmed, completed, cancelled)
├── Service type
├── Vendor
├── Payment status
└── Customer info
```

**UI Components:**
- **Calendar View** untuk booking timeline
- **List View** dengan detailed information
- **Status Pipeline**: Visual booking status flow
- **Quick Actions**: Confirm, cancel, reschedule
- **Communication Tools**: Send notifications, reminders

#### **Service Management**
```
API: GET /services
Service categories:
├── Veterinary services
├── Grooming
├── Pet hotel
├── Training
└── Emergency services
```

**UI Features:**
- **Service Builder**: Form untuk create/edit services
- **Pricing Management**: Dynamic pricing tools
- **Schedule Templates**: Available time slots
- **Service Analytics**: Popular services, revenue

---

### **💰 7. Financial Management & Commission**

#### **Revenue Dashboard**
```
Data sources:
├── Booking revenue
├── Product sales
├── Commission earnings
├── Payment gateway fees
└── Refunds & cancellations
```

**UI Components:**
- **Revenue Charts**: Daily, weekly, monthly trends
- **Commission Calculator**: Real-time commission calculation
- **Payment Status**: Successful, pending, failed payments
- **Financial Reports**: Downloadable reports
- **Vendor Payouts**: Commission distribution tracking

#### **Commission Settings** ⚠️ *Need to implement*
```
Commission structure:
├── Service bookings: 15% of booking value
├── Product sales: 10% of product price
├── Premium listings: Fixed monthly fee
└── Transaction fees: 2.5% of transaction
```

---

### **📊 8. Reports & Analytics**

#### **Business Intelligence Dashboard**
```
Key metrics:
├── User growth rate
├── Booking conversion rate
├── Product performance
├── Vendor performance
├── Customer satisfaction (reviews)
└── Geographic distribution
```

**UI Features:**
- **Customizable Charts**: Bar, line, pie charts
- **Date Range Selector**: Custom periods
- **Export Options**: PDF, Excel reports
- **Automated Reports**: Scheduled email reports
- **Comparative Analysis**: Period-over-period comparison

---

## 📱 **MOBILE APP (via API Gateway)**

### **🚀 1. Onboarding & Authentication**

#### **Welcome & Registration**

**API: POST /auth/register (User Registration)**
```
Step 1: Role Selection
├── userType: enum ['customer', 'vendor'] (required)
├── referralCode: string (optional, 6-8 chars)

Step 2: Basic Information
├── firstName: string (2-50 chars, required)
├── lastName: string (2-50 chars, required)
├── email: string (email format, unique, required)
├── phone: string (international format, required)
├── password: string (min 8 chars, 1 upper, 1 lower, 1 number, required)
├── confirmPassword: string (must match password)
├── dateOfBirth: date (must be 13+ years old)
├── gender: enum ['male', 'female', 'other', 'prefer_not_to_say']

Step 3: Location & Preferences
├── address: object (required for vendors, optional for customers)
│   ├── street: string (max 200 chars)
│   ├── city: string (max 100 chars)
│   ├── state: string (max 100 chars)
│   ├── country: string (ISO country code)
│   ├── zipCode: string (postal code format)
│   └── coordinates: object { lat: number, lng: number }
├── notificationPreferences: object
│   ├── email: boolean (default: true)
│   ├── sms: boolean (default: false)
│   ├── push: boolean (default: true)
│   └── marketing: boolean (default: false)

Step 4: Verification
├── emailVerificationCode: string (6-digit code)
├── phoneVerificationCode: string (6-digit code)

Additional for Vendors:
├── businessName: string (3-100 chars, required)
├── businessType: enum ['veterinary', 'grooming', 'pet_hotel', 'training', 'retail']
├── businessLicense: string (license number)
├── businessDescription: text (min 50 chars, max 500 chars)
├── website: string (URL format, optional)
├── businessHours: object (weekly schedule)

Response Data:
├── user: object (user profile)
├── accessToken: string (JWT)
├── refreshToken: string
├── onboardingComplete: boolean
├── requiresVerification: array ['email', 'phone', 'business']
```

**UI/UX Registration Flow:**

**Screen 1: Welcome & Role Selection**
- **App Logo**: Animated PetPro logo with tagline
- **Role Cards**: 
  - Customer: "Find & book pet services" with pet icons
  - Vendor: "Offer pet services & grow business" with business icons
- **Benefits List**: Role-specific feature highlights
- **Continue Button**: Proceed with selected role
- **Login Link**: "Already have account? Sign in"

**Screen 2: Basic Information**
- **Progress Bar**: 2/5 steps completed
- **Form Fields**:
  - First Name: Auto-capitalize, letters only
  - Last Name: Auto-capitalize, letters only
  - Email: Real-time format validation, availability check
  - Phone: Country code selector + formatted input
  - Password: Strength meter, show/hide toggle
  - Confirm Password: Real-time match validation
- **Continue Button**: Disabled until all fields valid
- **Back Button**: Return to role selection

**Screen 3: Personal Details**
- **Progress Bar**: 3/5 steps completed
- **Date of Birth**: Date picker with age validation (13+)
- **Gender**: Optional selection with inclusive options
- **Address Section**: 
  - "Current Location" button (GPS detection)
  - Manual address input with Google Places autocomplete
  - Map preview with draggable pin
- **Privacy Notice**: How location data is used

**Screen 4: Business Information** (Vendors Only)
- **Progress Bar**: 4/5 steps for vendors
- **Business Details**:
  - Business Name: Uniqueness check, auto-suggestions
  - Business Type: Cards with service icons
  - License Number: Format validation per country
  - Description: Character counter, helpful examples
  - Website: Optional URL with format validation
- **Business Hours**: Interactive weekly calendar
- **Skip for Now**: Option to complete later

**Screen 5: Verification**
- **Progress Bar**: 5/5 steps completed
- **Email Verification**: 6-digit code input, resend timer
- **Phone Verification**: SMS code input, call backup option
- **Push Notifications**: Permission request with benefits
- **Location Services**: Permission with usage explanation
- **Complete Registration**: Final step celebration

**Additional UI Components:**
- **Social Login Options**: Google, Facebook, Apple Sign-in
- **Terms & Privacy**: Checkboxes with links to policies
- **Help Button**: In-app chat or help center access
- **Language Selection**: Multi-language support
- **Accessibility**: Screen reader support, high contrast mode

#### **Login & Biometric**
```
API: POST /auth/login
Login options:
├── Email + password
├── Phone + OTP
├── Biometric (fingerprint/face)
├── Google/Facebook login
└── Remember device option
```

---

### **👤 2. User Profile & Pet Management**

#### **Profile Dashboard**
```
API: GET /auth/me
User info display:
├── Profile photo & basic info
├── Pet gallery (quick access)
├── Recent bookings
├── Favorite vendors
├── Notification preferences
└── Account settings
```

**UI Layout:**
- **Profile Header**: Photo, name, location
- **Quick Stats**: Total pets, bookings, reviews
- **Action Cards**: Book service, shop products, add pet
- **Recent Activity**: Timeline view

#### **Pet Profile Management**

**API: GET /pets (Get User's Pets)**
```
Response Data (Pet List):
├── pets: array of pet objects
├── totalPets: number
├── upcomingAppointments: array (next 7 days)
├── healthReminders: array (vaccinations, checkups due)

Pet Object:
├── id: string (UUID)
├── name: string (1-50 chars)
├── species: enum ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea_pig', 'other']
├── breed: string (1-100 chars)
├── gender: enum ['male', 'female', 'unknown']
├── isNeutered: boolean
├── birthDate: date (YYYY-MM-DD)
├── age: object { years: number, months: number } (calculated)
├── weight: number (in kg, 2 decimal places)
├── color: string (1-50 chars)
├── microchipNumber: string (15 digits, optional)
├── photos: array of image URLs
├── primaryPhoto: string (main profile image)
├── specialNeeds: text (medical conditions, disabilities)
├── allergies: array of strings (food, environmental, medication)
├── medications: array of medication objects
├── emergencyContact: object (vet information)
├── insurance: object (pet insurance details)
├── createdAt: datetime
├── updatedAt: datetime

Health Records:
├── vaccinations: array of vaccination objects
│   ├── id: string
│   ├── vaccineName: string
│   ├── dateGiven: date
│   ├── nextDueDate: date
│   ├── veterinarian: string
│   ├── batchNumber: string
│   └── notes: text
├── healthRecords: array of health record objects
│   ├── id: string
│   ├── recordType: enum ['checkup', 'illness', 'injury', 'surgery', 'dental']
│   ├── date: date
│   ├── veterinarian: string
│   ├── clinic: string
│   ├── diagnosis: text
│   ├── treatment: text
│   ├── medications: array
│   ├── followUpDate: date
│   ├── cost: number
│   └── documents: array of file URLs
```

**API: POST /pets (Add New Pet)**
```
Required Fields:
├── name: string (1-50 chars, unique per user)
├── species: enum (must select from predefined list)
├── birthDate: date (not in future, realistic age for species)

Optional Fields:
├── breed: string (autocomplete from breed database)
├── gender: enum selection
├── isNeutered: boolean (default: false)
├── weight: number (validation based on species/breed norms)
├── color: string (free text with color suggestions)
├── microchipNumber: string (15-digit validation)
├── specialNeeds: text (max 500 chars)
├── allergies: array of strings
├── emergencyVet: object
│   ├── clinicName: string
│   ├── phone: string
│   ├── address: string
│   └── hours: string
├── insurance: object
│   ├── provider: string
│   ├── policyNumber: string
│   ├── coverage: enum ['basic', 'comprehensive', 'accident_only']
│   └── expiryDate: date

Photo Upload:
├── photos: array (max 10 photos, 5MB each)
├── primaryPhotoIndex: number (which photo is main)
├── allowedFormats: ['JPEG', 'PNG', 'HEIC']
├── minimumResolution: 400x400px

Validation Rules:
├── Name uniqueness: per user (can have multiple pets with same name)
├── Age validation: realistic age limits per species
├── Weight validation: reasonable weight ranges
├── Microchip format: 15-digit international standard
├── Photo validation: appropriate content (no humans/inappropriate images)
```

**Add Pet Wizard UI Flow:**

**Step 1: Basic Information**
- **Pet Name**: Text input with character counter
- **Species Selection**: Visual cards with animal icons
- **Breed Input**: Autocomplete dropdown (filtered by species)
- **Gender**: Radio buttons with icons (male/female/unknown)
- **Neutered Status**: Toggle switch with explanation

**Step 2: Physical Characteristics**
- **Birth Date**: Date picker with age calculation display
- **Weight**: Number input with species-appropriate unit (kg/lbs)
- **Color**: Color palette + custom text input
- **Size Category**: Auto-calculated based on species/breed/weight
- **Distinctive Markings**: Optional text area

**Step 3: Health & Medical**
- **Microchip**: Number input with scanner option (QR/NFC)
- **Allergies**: Tag input with common allergy suggestions
- **Special Needs**: Text area with character limit
- **Current Medications**: List builder with dosage information
- **Emergency Vet**: Contact form with map location

**Step 4: Photos & Documents**
- **Photo Upload**: Camera + gallery options
- **Photo Editor**: Crop, rotate, filter options
- **Document Upload**: Vaccination records, medical documents
- **QR Code Generation**: Automatic pet ID generation

**Pet Profile View UI:**

**Header Section:**
- **Profile Photo**: Large circular image with edit option
- **Basic Info**: Name, species, breed, age prominently displayed
- **Quick Actions**: Edit, Share, Emergency Contact, Book Service
- **Status Indicators**: Health status, vaccination status, insurance status

**Tabs Navigation:**
1. **Overview**: Key information and recent activity
2. **Health**: Medical records, vaccinations, medications
3. **Photos**: Gallery with upload option
4. **Documents**: Certificates, medical records, insurance
5. **Activity**: Booking history, service records

**Overview Tab:**
- **At a Glance**: Weight, age, breed, microchip status
- **Health Summary**: Next vaccination due, last checkup
- **Recent Activity**: Latest bookings, health records
- **Quick Stats**: Total services booked, favorite services
- **Emergency Info**: Primary vet contact with one-tap calling

**Health Tab:**
- **Vaccination Timeline**: Visual timeline with due dates
- **Medical History**: Chronological list of health records
- **Current Medications**: Active prescriptions with reminders
- **Health Reminders**: Upcoming appointments, vaccinations due
- **Add Record**: Quick add buttons for common record types

**UI Components:**
- **Pet Cards**: Swipeable carousel for multiple pets
- **Health Status Badges**: Color-coded indicators (up-to-date, due, overdue)
- **QR Code**: Shareable pet identification
- **Emergency Banner**: Quick access to emergency vet information
- **Medication Reminders**: Push notifications for medication times
- **Health Alerts**: Vaccination due, checkup reminders

**Data Synchronization:**
- **Cloud Backup**: Automatic backup of pet data
- **Cross-Device Sync**: Access pet information from any device
- **Sharing Options**: Share pet profile with family members, vets
- **Export Data**: PDF reports for vet visits
- **Import Data**: Upload existing medical records

---

### **🔍 3. Service Discovery & Booking**

#### **Service Categories**
```
API: GET /services
Categories:
├── 🏥 Veterinary (consultation, vaccination, surgery)
├── ✂️ Grooming (bath, cut, nail trim)
├── 🏨 Pet Hotel (daycare, overnight stay)
├── 🎓 Training (basic, advanced, behavior)
└── 🚨 Emergency (24/7 vet, urgent care)
```

**UI/UX Design:**
- **Category Grid**: Visual icons dengan service counts
- **Location-based**: Nearby services dengan maps
- **Filter & Sort**: Price, rating, distance, availability
- **Service Cards**: Photos, rating, price, quick book

#### **Service Detail & Booking**
```
API: GET /services/:id
API: POST /bookings
Service information:
├── Photos & gallery
├── Description & inclusions
├── Pricing & duration
├── Vendor information
├── Reviews & ratings
├── Available time slots
└── Booking terms
```

**Booking Flow:**
1. **Service Selection**: Choose service & add-ons
2. **Pet Selection**: Select which pet(s)
3. **Date & Time**: Available slots calendar
4. **Confirmation**: Review booking details
5. **Payment**: Secure payment processing
6. **Confirmation**: Booking reference & details

---

### **🛒 4. Product Shopping**

#### **Product Catalog**
```
API: GET /products
Product categories:
├── 🍖 Food (dry, wet, treats, supplements)
├── 🧸 Toys (interactive, chew, comfort)
├── 🎽 Accessories (collars, leashes, beds)
├── 💊 Healthcare (medicines, vitamins, grooming)
└── 🎪 Training (clickers, treats, aids)
```

**UI Features:**
- **Product Grid**: Image-focused layout
- **Search & Filter**: Advanced filtering options
- **Sort Options**: Price, rating, popularity, new
- **Wishlist**: Save favorite products
- **Quick Add**: Fast add-to-cart functionality

#### **Shopping Cart & Checkout** ⚠️ *Need to implement backend*
```
Cart functionality:
├── Add/remove products
├── Quantity adjustment
├── Price calculation
├── Shipping options
├── Discount codes
└── Payment processing
```

**Checkout Flow:**
1. **Cart Review**: Items, quantities, prices
2. **Shipping Address**: Delivery information
3. **Payment Method**: Cards, wallets, COD
4. **Order Confirmation**: Order number & tracking
5. **Order Tracking**: Real-time status updates

---

### **📅 5. Booking Management**

#### **My Bookings Dashboard**
```
API: GET /bookings
Booking status:
├── ⏳ Pending (waiting vendor confirmation)
├── ✅ Confirmed (appointment scheduled)  
├── 🏃 In Progress (service in progress)
├── ✔️ Completed (service finished)
├── ❌ Cancelled (cancelled by user/vendor)
└── 💰 Refunded (payment refunded)
```

**UI Components:**
- **Timeline View**: Chronological booking history
- **Status Cards**: Color-coded status indicators
- **Quick Actions**: Cancel, reschedule, review
- **Booking Details**: Service info, vendor contact
- **Communication**: Chat dengan vendor

#### **Booking Detail & Tracking**
```
API: GET /bookings/:id
Real-time tracking:
├── Vendor location (untuk mobile services)
├── Estimated arrival time
├── Service progress updates
├── Photo updates (grooming progress)
├── Completion notification
└── Review & rating prompt
```

---

### **⭐ 6. Reviews & Ratings**

#### **Review System**
```
API: POST /reviews
Review components:
├── Star rating (1-5 stars)
├── Written review (optional)
├── Photo upload (service results)
├── Service categories rating
├── Anonymous option
└── Recommendation (yes/no)
```

**UI Features:**
- **Rating Interface**: Interactive star selection
- **Photo Upload**: Before/after photos
- **Review Templates**: Quick review options
- **Review History**: User's past reviews
- **Helpful Votes**: Community engagement

---

### **📍 7. Location & Maps**

#### **Vendor Discovery Map**
```
API: GET /vendors/search (with location)
Map features:
├── Vendor pins dengan categories
├── Current location indicator
├── Distance & route calculation
├── Filter overlay (service type, rating)
├── Cluster markers (multiple vendors)
└── Vendor preview cards
```

**UI/UX:**
- **Interactive Map**: Zoom, pan, cluster
- **Vendor Markers**: Category-specific icons
- **Quick Preview**: Vendor info modal
- **Get Directions**: Navigation integration
- **Nearby Search**: Auto-refresh on map move

---

### **🔔 8. Notifications & Communication**

#### **Push Notifications**
```
Notification types:
├── Booking confirmations
├── Service reminders (1 day, 1 hour before)
├── Service updates (vendor location, delays)
├── Promotional offers
├── Pet health reminders (vaccination due)
├── Order updates (shipped, delivered)
└── Review requests
```

**UI Features:**
- **Notification Center**: All notifications history
- **Smart Grouping**: Group by type/date
- **Quick Actions**: Reply, dismiss, snooze
- **Notification Preferences**: Granular control
- **Badge Counts**: Unread indicators

---

### **💬 9. Chat & Communication**

#### **In-app Messaging** ⚠️ *Need to implement*
```
Chat features:
├── Customer ↔ Vendor communication
├── Photo sharing (pet photos, progress updates)
├── Location sharing
├── Voice messages
├── Appointment scheduling via chat
└── Emergency contact (priority routing)
```

---

## 🎨 **Design System Guidelines**

### **Color Palette**
- **Primary**: #FF6B6B (Coral Pink) - Warm, friendly, pet-loving
- **Secondary**: #4ECDC4 (Mint Green) - Fresh, health, trust
- **Accent**: #45B7D1 (Sky Blue) - Professional, calm
- **Success**: #96CEB4 (Sage Green)
- **Warning**: #FFEAA7 (Light Yellow)
- **Error**: #FF7675 (Soft Red)
- **Neutral**: #74B9FF to #2D3436 (Blue-gray scale)

### **Typography**
- **Headers**: SF Pro Display / Roboto (Bold)
- **Body**: SF Pro Text / Roboto (Regular)
- **Captions**: SF Pro Text / Roboto (Light)

### **Iconography**
- **Style**: Rounded, friendly icons
- **Sources**: Feather Icons, Heroicons
- **Pet-specific**: Custom icons untuk species, services

### **UI Components**
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Pill-shaped, gradient backgrounds
- **Forms**: Clean, minimal dengan clear labels
- **Navigation**: Tab-based untuk mobile, sidebar untuk admin

---

## 📊 **Data Requirements Summary**

### **Admin Dashboard Needs:**
1. ✅ User management (implemented)
2. ✅ Vendor management (implemented)
3. ✅ Product management (implemented)
4. ✅ Booking oversight (implemented)
5. ❌ Order management (needs implementation)
6. ❌ Commission settings (needs implementation)
7. ❌ Financial reports (needs enhancement)

### **Mobile App Needs:**
1. ✅ User authentication (implemented)
2. ✅ Pet management (implemented)
3. ✅ Service booking (implemented)
4. ✅ Product browsing (implemented)
5. ❌ Shopping cart & orders (needs implementation)
6. ❌ Real-time chat (needs implementation)
7. ❌ Push notifications (needs implementation)

### **Immediate Implementation Priorities:**

**High Priority:**
1. **Order Management System** - E-commerce functionality
2. **Commission Settings** - Revenue management
3. **Push Notifications** - User engagement
4. **Payment Tracking** - Financial oversight

**Medium Priority:**
1. **Chat System** - Customer-vendor communication
2. **Advanced Analytics** - Business intelligence
3. **File Upload** - Images & documents
4. **Geolocation Enhancement** - Better vendor discovery

**Low Priority:**
1. **Social Features** - Community building
2. **Loyalty Program** - Customer retention
3. **Multi-language** - Internationalization
4. **Advanced Reporting** - Custom reports

---

## 📋 **COMPREHENSIVE DATA REQUIREMENTS SUMMARY**

### **🔢 Input Field Specifications & Validation Rules**

#### **User Data Fields**

| Field | Type | Validation | UI Component | Required |
|-------|------|------------|--------------|----------|
| firstName | string | 2-50 chars, letters only, auto-capitalize | Text input | ✅ |
| lastName | string | 2-50 chars, letters only, auto-capitalize | Text input | ✅ |
| email | string | Email format, uniqueness check | Email input with validation | ✅ |
| phone | string | International format with country code | Formatted input with country selector | ✅ |
| password | string | Min 8 chars, 1 upper, 1 lower, 1 number | Password input with strength meter | ✅ |
| dateOfBirth | date | Age 13-120, YYYY-MM-DD format | Date picker with age validation | ❌ |
| gender | enum | ['male', 'female', 'other', 'prefer_not_to_say'] | Radio buttons | ❌ |
| role | enum | ['customer', 'vendor', 'admin', 'moderator'] | Dropdown/cards | ✅ |
| avatar | file | JPEG/PNG/WebP, max 5MB, min 400x400px | Image upload with crop | ❌ |

#### **Address Data Fields**

| Field | Type | Validation | UI Component | Required |
|-------|------|------------|--------------|----------|
| street | string | Max 200 chars, no special chars | Text input with autocomplete | ✅ |
| city | string | Max 100 chars, letters only | Text input with suggestions | ✅ |
| state | string | Max 100 chars, letters only | Dropdown/autocomplete | ✅ |
| country | string | ISO country code | Country selector | ✅ |
| zipCode | string | Postal code format per country | Formatted input | ✅ |
| coordinates | object | {lat: number, lng: number} | Map picker with GPS | ❌ |
| type | enum | ['home', 'work', 'other'] | Radio buttons | ✅ |
| isDefault | boolean | Only one default per user | Toggle switch | ❌ |

#### **Pet Data Fields**

| Field | Type | Validation | UI Component | Required |
|-------|------|------------|--------------|----------|
| name | string | 1-50 chars, unique per user | Text input | ✅ |
| species | enum | Predefined list of animals | Cards with icons | ✅ |
| breed | string | 1-100 chars, autocomplete from database | Searchable dropdown | ❌ |
| birthDate | date | Not future, realistic for species | Date picker | ✅ |
| weight | number | Species-appropriate range, 2 decimals | Number input with unit | ❌ |
| gender | enum | ['male', 'female', 'unknown'] | Radio buttons | ❌ |
| isNeutered | boolean | Default: false | Toggle switch | ❌ |
| microchipNumber | string | 15 digits, international standard | Number input with scanner | ❌ |
| photos | array | Max 10, 5MB each, JPEG/PNG/HEIC | Multi-image upload | ❌ |
| allergies | array | Tag input with suggestions | Tag selector | ❌ |
| specialNeeds | text | Max 500 chars | Textarea | ❌ |

#### **Product Data Fields**

| Field | Type | Validation | UI Component | Required |
|-------|------|------------|--------------|----------|
| name | string | 3-200 chars, unique per vendor | Text input with uniqueness check | ✅ |
| sku | string | Alphanumeric + dash/underscore, global unique | Auto-generated with override | ✅ |
| description | text | 10-2000 chars | Rich text editor | ✅ |
| price | number | > 0, max 2 decimals | Currency input | ✅ |
| salePrice | number | < price, max 2 decimals | Currency input | ❌ |
| categoryId | string | Valid category UUID | Hierarchical dropdown | ✅ |
| stockQuantity | number | >= 0 | Number input with +/- buttons | ❌ |
| weight | number | Grams, for shipping | Number input | ❌ |
| dimensions | object | {length, width, height} in cm | Dimension inputs | ❌ |
| images | array | Max 8, 5MB each, min 400x400px | Multi-image upload with editor | ❌ |
| tags | array | Max 10 tags, 1-30 chars each | Tag input | ❌ |
| petTypes | array | Multiple selection from enum | Multi-select checkboxes | ❌ |

#### **Booking Data Fields**

| Field | Type | Validation | UI Component | Required |
|-------|------|------------|--------------|----------|
| serviceId | string | Valid service UUID | Service selector | ✅ |
| petId | string | Valid pet UUID from user's pets | Pet selector | ✅ |
| startTime | datetime | Future date/time, during business hours | Date/time picker | ✅ |
| endTime | datetime | After startTime, calculated from service duration | Auto-calculated | ✅ |
| notes | text | Max 500 chars, special requests | Textarea | ❌ |
| emergencyContact | string | Phone number format | Phone input | ❌ |
| paymentMethod | enum | ['card', 'wallet', 'cash', 'bank_transfer'] | Payment selector | ✅ |

### **🎨 UI Component Library Requirements**

#### **Form Components**
- **Text Input**: With validation states, error messages, character counters
- **Email Input**: Real-time validation, availability checking
- **Password Input**: Strength meter, show/hide toggle, requirements checklist
- **Phone Input**: Country code selector, international formatting
- **Number Input**: Min/max validation, increment/decrement buttons
- **Currency Input**: Automatic formatting, multiple currency support
- **Date Picker**: Age validation, future/past restrictions, calendar widget
- **Time Picker**: Business hours validation, timezone support
- **Dropdown Select**: Search, multi-select, hierarchical options
- **Autocomplete**: API-driven suggestions, recent selections
- **Tag Input**: Add/remove tags, suggestions, validation
- **Rich Text Editor**: WYSIWYG, character limits, formatting options
- **File Upload**: Drag & drop, progress indicators, preview, validation

#### **Display Components**
- **Data Tables**: Sorting, filtering, pagination, bulk actions
- **Cards**: Product cards, user cards, pet cards with consistent styling
- **Badges**: Status indicators, role badges, notification badges
- **Progress Bars**: Multi-step forms, loading states
- **Timeline**: Health records, activity history, booking status
- **Maps**: Location selection, vendor discovery, service areas
- **Charts**: Analytics dashboard, performance metrics
- **Image Gallery**: Product images, pet photos, document viewer

#### **Navigation Components**
- **Tab Navigation**: Profile sections, category browsing
- **Breadcrumbs**: Admin navigation, multi-level forms
- **Sidebar Menu**: Admin dashboard, filter panels
- **Bottom Navigation**: Mobile app primary navigation
- **Search Bar**: Global search, filtered search with suggestions

### **📱 Mobile-Specific Requirements**

#### **Device Features Integration**
- **Camera**: Pet photos, document scanning, QR code reading
- **GPS**: Location detection, vendor discovery, service areas
- **Push Notifications**: Booking reminders, health alerts, promotional offers
- **Biometric Authentication**: Fingerprint, Face ID login
- **Contact Integration**: Emergency vet contacts, family sharing
- **Calendar Integration**: Appointment scheduling, reminders
- **Phone Integration**: One-tap calling to vets, vendors

#### **Offline Capabilities**
- **Pet Profiles**: Cached for offline viewing
- **Emergency Contacts**: Always accessible without internet
- **Basic Information**: User profile, recent bookings cached
- **Photos**: Local storage with cloud sync
- **Search History**: Recent searches cached

#### **Accessibility Requirements**
- **Screen Reader Support**: VoiceOver, TalkBack compatibility
- **High Contrast Mode**: Alternative color schemes
- **Large Text Support**: Dynamic font sizing
- **Voice Control**: Voice navigation and input
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Blind Support**: Not relying on color alone for information

### **🔐 Security & Privacy Requirements**

#### **Data Protection**
- **Personal Data Encryption**: All PII encrypted at rest and in transit
- **Photo Privacy**: Secure image storage, access controls
- **Payment Security**: PCI DSS compliance, tokenization
- **Location Privacy**: Opt-in location sharing, granular controls
- **Medical Data Protection**: HIPAA-like protections for pet health data

#### **Authentication & Authorization**
- **Multi-Factor Authentication**: Optional 2FA for enhanced security
- **Session Management**: Secure token handling, automatic logout
- **Role-Based Access**: Granular permissions for different user types
- **API Security**: Rate limiting, input validation, injection prevention

### **📊 Analytics & Monitoring Requirements**

#### **User Analytics**
- **User Journey Tracking**: Registration to first booking conversion
- **Feature Usage**: Most/least used features, adoption rates
- **Performance Metrics**: Page load times, error rates
- **Search Analytics**: Popular searches, conversion rates
- **Booking Analytics**: Conversion funnel, abandonment points

#### **Business Intelligence**
- **Revenue Tracking**: Commission calculations, payment analytics
- **Vendor Performance**: Rating trends, booking volumes
- **Product Analytics**: Best sellers, inventory turnover
- **Customer Satisfaction**: Review analysis, support ticket trends
- **Geographic Analytics**: Service coverage, demand mapping

---

*Guide ini memberikan roadmap lengkap untuk development UI/UX berdasarkan backend architecture yang sudah ada dan yang perlu diimplementasikan, dengan spesifikasi detail untuk setiap field dan komponen yang dibutuhkan.*