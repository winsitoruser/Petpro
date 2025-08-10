# PetPro Platform - UI/UX Design Specifications

## Overview & Purpose

This document provides comprehensive guidelines for the UI/UX design team to create a cohesive, user-friendly experience across all PetPro platform interfaces. The specifications focus on user flows, interface components, and visual language required to implement the product requirements.

## Platform Components

PetPro consists of three main interfaces, each requiring a distinct design approach while maintaining brand consistency:

1. **Mobile Application (Pet Owners)**
2. **Vendor Web Dashboard (Clinics/Vendors)**
3. **Admin Web Dashboard (Platform Administrators)**

## Brand Identity Guidelines

### Color Palette

- **Primary Colors**:
  - Brand Blue: `#4A90E2` (Buttons, headers, key actions)
  - Brand Green: `#50C878` (Success states, confirmation)
  - Brand Orange: `#FF9500` (Warnings, notifications, attention)

- **Secondary Colors**:
  - Light Gray: `#F5F7FA` (Backgrounds)
  - Medium Gray: `#E4E7EB` (Borders, dividers)
  - Dark Gray: `#4A4A4A` (Body text)

- **Accent Colors**:
  - Accent Purple: `#8A4FFF` (Premium features, special highlights)
  - Accent Pink: `#FF6B6B` (Error states, deletions)

### Typography

- **Primary Font**: Nunito Sans
  - Headings: SemiBold (600)
  - Body: Regular (400)
  - CTAs: Bold (700)

- **Font Sizes**:
  - Mobile: 14px base (body), scale ratio 1.2
  - Web: 16px base (body), scale ratio 1.25

### Iconography

- **Style**: Outlined with 2px stroke, rounded corners
- **States**: Normal, Active, Disabled
- **Key Icons**: Home, Pets, Clinics, Products, Orders, Notifications, Settings

## Interface-Specific Design Guidelines

### 1. Mobile Application (Pet Owners)

#### Key UI Components

1. **Bottom Navigation Bar**
   - Home, Appointments, Shop, Pets, Profile
   - Persistent across screens
   - Active state with icon fill and label highlight

2. **Home Dashboard**
   - Upcoming appointments card
   - Nearby clinics map section
   - Recent orders/prescription refills
   - Pet wellness reminders
   - Special offers/promotions carousel

3. **Clinic Search & Details**
   - Search bar with filter icon
   - Map view/list view toggle
   - Clinic cards with:
     - Clinic image
     - Name, rating, distance
     - Open/closed indicator
     - Specialty tags
   - Clinic detail screen with:
     - Image gallery
     - Services offered
     - Available doctors
     - Reviews section
     - Booking CTA button

4. **Booking Flow**
   - Service selection (with prices)
   - Pet selection dropdown
   - Date picker (calendar view)
   - Time slot selection (grid/list)
   - Summary & confirmation
   - Payment integration screen

5. **Pet Profile**
   - Pet image (large circular)
   - Key info (species, breed, age)
   - Health records tab
   - Vaccination history
   - Medical notes
   - Appointment history

6. **Product Shopping**
   - Category navigation
   - Product grid (2 columns)
   - Product cards with:
     - Product image
     - Name, price
     - Rating indicator
     - "Add to cart" button
   - Cart indicator (with item count)
   - Checkout flow:
     - Cart review
     - Address selection
     - Shipping method
     - Payment method
     - Order summary

7. **Order Tracking**
   - Order status timeline
   - Shipping information
   - Tracking number with carrier link
   - Estimated delivery date
   - Order details expandable section

#### Critical User Flows

1. **Registration & Onboarding**
   - Splash screen
   - Authentication options
   - Form with minimal required fields
   - OTP verification screen
   - Add pet profile prompt
   - Location permission request
   - Notification permission request
   - Home dashboard introduction

2. **Clinic Search to Booking Completion**
   - Search initiation
   - Results browsing
   - Clinic selection
   - Service selection
   - Slot selection
   - Booking confirmation
   - Payment processing
   - Success confirmation

3. **Product Purchase to Delivery**
   - Product browsing
   - Product detail view
   - Add to cart
   - Cart review
   - Checkout process
   - Order confirmation
   - Order tracking
   - Delivery confirmation
   - Review prompt

### 2. Vendor Web Dashboard (Clinics/Vendors)

#### Key UI Components

1. **Sidebar Navigation**
   - Clinic logo/profile
   - Dashboard
   - Appointments
   - Services
   - Products
   - Orders
   - Reviews
   - Reports
   - Settings

2. **Dashboard Overview**
   - Key metrics cards:
     - Today's appointments
     - Pending orders
     - Revenue this month
     - New reviews
   - Upcoming appointments timeline
   - Recent orders table
   - Revenue chart (daily/weekly/monthly toggle)

3. **Appointment Calendar**
   - Month/week/day view toggle
   - Color-coded appointment status
   - Quick view appointment details
   - Time slot management
   - Bulk slot generation tool

4. **Service Management**
   - Service list table with:
     - Name, duration, price
     - Active/inactive toggle
     - Edit/delete actions
   - Add service form
   - Service availability scheduler

5. **Product Management**
   - Product grid/table toggle view
   - Inventory status indicators
   - Batch import/export tools
   - Product editor modal
   - Image gallery uploader

6. **Order Processing**
   - Filterable order list
   - Status update workflow
   - Order details expansion
   - Shipping label generator
   - Tracking number entry form

7. **Analytics & Reports**
   - Date range selector
   - Visual charts/graphs
   - Revenue breakdown by service/product
   - Export tools (CSV/PDF)
   - Commission calculator

#### Critical User Flows

1. **Clinic Onboarding**
   - Registration form
   - Business details entry
   - Document upload
   - Service setup wizard
   - Schedule configuration
   - Staff management
   - Banking information

2. **Appointment Management**
   - Calendar view navigation
   - Appointment detail view
   - Status update process
   - Patient history access
   - Rescheduling workflow
   - Cancellation/refund process

3. **Inventory Management**
   - Product addition
   - Stock update
   - Low stock alerts
   - Batch upload process
   - Product categorization

### 3. Admin Web Dashboard

#### Key UI Components

1. **Admin Sidebar**
   - Dashboard
   - Vendor Management
   - User Management
   - Transactions
   - Commission Settings
   - System Metrics
   - Settings

2. **Vendor Approval Dashboard**
   - Pending approvals queue
   - Document verification interface
   - Approval/rejection action panel
   - Vendor communication tool

3. **Transaction Monitoring**
   - Advanced filtering tools
   - Transaction detail viewer
   - Payment reconciliation interface
   - Commission calculation display
   - Refund management tools

4. **System Health Metrics**
   - Service status indicators
   - Performance graphs
   - Error rate displays
   - User activity heat maps
   - Resource utilization charts

#### Critical User Flows

1. **Vendor Approval Process**
   - Approval queue navigation
   - Document verification
   - Background check tools
   - Approval/rejection decision
   - Feedback communication

2. **Commission Management**
   - Global rate setting
   - Vendor-specific overrides
   - Effective date selection
   - Rate history tracking

## Responsive Design Guidelines

### Breakpoints

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Small Desktop**: 769px - 1024px
- **Large Desktop**: 1025px+

### Key Considerations

- Mobile app is native (Flutter), focus on iOS and Android platform guidelines
- Vendor dashboard should be fully responsive (mobile to desktop)
- Admin dashboard optimized for desktop with tablet support

## Accessibility Guidelines

- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Touch targets minimum size: 44x44 pixels
- All interactive elements must be keyboard navigable
- Screen reader compatibility required for all interfaces
- Support zoom up to 200% without loss of functionality

## Interactive Component Library

### Buttons

1. **Primary Button**
   - Filled background (Brand Blue)
   - White text
   - 8px border radius
   - States: Normal, Hover, Active, Disabled

2. **Secondary Button**
   - Outline style (Brand Blue border)
   - Brand Blue text
   - 8px border radius
   - States: Normal, Hover, Active, Disabled

3. **Tertiary Button**
   - Text only (Brand Blue)
   - Underline on hover
   - States: Normal, Hover, Active, Disabled

### Form Elements

1. **Text Input**
   - Outline style
   - Floating label
   - Inline validation
   - States: Normal, Focus, Error, Disabled

2. **Dropdown Select**
   - Outline style matching text input
   - Custom dropdown icon
   - Multi-select variation

3. **Checkbox & Radio**
   - Custom styled indicators
   - Label right-aligned
   - States: Normal, Checked, Error, Disabled

4. **Date & Time Picker**
   - Calendar popup for date
   - Time slot grid for time selection
   - Range selection capability

### Cards

1. **Clinic Card**
   - Image top (16:9 ratio)
   - Content padding: 16px
   - Title, subtitle, metadata row
   - Action buttons bottom aligned

2. **Pet Profile Card**
   - Circular image (left aligned)
   - Name, species, age
   - Quick action buttons
   - Indicator for health status

3. **Appointment Card**
   - Status indicator strip (left edge)
   - Date/time prominence
   - Service name and clinic
   - Action buttons for manage/reschedule

4. **Product Card**
   - Square image (1:1 ratio)
   - Product name
   - Price with optional discount
   - Rating stars
   - Add to cart button

## Design File Organization

### Figma Structure

1. **Design System**
   - Color styles
   - Text styles
   - Effect styles
   - Component library

2. **Mobile App**
   - User flows
   - Screens (organized by feature)
   - Prototype connections

3. **Vendor Dashboard**
   - Page templates
   - Components specific to vendor
   - Responsive variations

4. **Admin Dashboard**
   - Page templates
   - Components specific to admin
   - Data visualization examples

## Implementation Handoff Guidelines

- Component annotations required
- Responsive behavior documentation
- Interactive states defined
- Animation specifications where applicable
- Accessibility requirements noted

## Key Screen Mockup Requirements

### Mobile App

1. **Onboarding & Authentication**
   - Splash screen
   - Login options
   - Registration form
   - OTP verification
   - Pet profile creation

2. **Home Dashboard**
   - Main dashboard layout
   - Appointment cards
   - Nearby clinic section
   - Health reminders

3. **Clinic Search & Booking**
   - Search interface
   - Results listing
   - Clinic detail view
   - Service selection
   - Calendar view
   - Time slot selection
   - Booking confirmation

4. **Pet Management**
   - Pet list view
   - Pet detail profile
   - Medical history
   - Vaccination timeline
   - Add new pet

5. **E-commerce**
   - Product categories
   - Product listing
   - Product detail
   - Shopping cart
   - Checkout flow
   - Order confirmation
   - Order tracking

### Vendor Dashboard

1. **Onboarding**
   - Registration steps
   - Document upload
   - Service setup
   - Schedule configuration

2. **Main Dashboard**
   - Overview metrics
   - Activity timeline
   - Quick actions

3. **Appointment Management**
   - Calendar view
   - Appointment details
   - Patient information
   - Service completion

4. **Product & Inventory**
   - Product listing
   - Add/edit product
   - Inventory management
   - Order fulfillment

5. **Reports & Analytics**
   - Financial dashboard
   - Sales reports
   - Customer analytics
   - Export options

### Admin Dashboard

1. **Vendor Management**
   - Approval queue
   - Vendor details
   - Document verification

2. **Financial Monitoring**
   - Transaction dashboard
   - Commission reports
   - Revenue analytics

3. **System Health**
   - Status dashboard
   - Error monitoring
   - Performance metrics

## User Testing Focus Areas

1. **Booking Flow Usability**
   - Time to complete booking
   - Abandonment points
   - Comprehension of available slots

2. **Checkout Process**
   - Cart addition success rate
   - Checkout completion rate
   - Payment method clarity

3. **Vendor Order Management**
   - Time to process orders
   - Error rates in fulfillment
   - Dashboard comprehension

## Delivery Timeline

1. **Design System & Components**: 2 weeks
2. **Mobile App Key Screens**: 3 weeks
3. **Vendor Dashboard**: 2 weeks
4. **Admin Dashboard**: 1 week
5. **Responsive Testing & Refinement**: 1 week
6. **Usability Testing & Iterations**: 2 weeks

## Next Steps

1. Validate user flows with stakeholders
2. Create low-fidelity wireframes for key screens
3. Develop design system components
4. Design high-fidelity mockups
5. Create interactive prototypes
6. Conduct usability testing
7. Refine based on feedback
8. Prepare developer handoff documentation
