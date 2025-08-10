# Mobile App Booking Flow - Detailed Design Guide

## Overview

The booking flow is a critical user journey that directly impacts business conversion and user satisfaction. This document provides detailed specifications for designing an intuitive, efficient booking process that maximizes completion rate while providing users with all necessary information.

## User Journey Map

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │      │             │      │             │
│  Find Clinic │─────▶│ Select      │─────▶│ Choose Pet  │─────▶│ Select Date │─────▶│ Choose Time │
│             │      │ Service     │      │             │      │ & Slot      │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                                                                                          │
                                                                                          ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │      │             │      │             │
│ Confirmation│◀─────│  Payment    │◀─────│  Review     │◀─────│  Add Notes  │◀─────│  Preview    │
│ & Receipt   │      │             │      │             │      │ (Optional)  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

## Screen-by-Screen Design Requirements

### 1. Find Clinic Screen

#### Purpose
Allow users to discover and select veterinary clinics based on location, services, and ratings.

#### Key Components
- **Search Bar** with location auto-detection
- **Filters Section** (expandable/collapsible):
  - Services offered
  - Rating threshold
  - Distance range
  - Availability (today, tomorrow, this week)
- **Results List/Map Toggle**:
  - Map View: Pins showing clinic locations
  - List View: Clinic cards (primary view)

#### Clinic Card Elements
- Clinic profile image (16:9 ratio)
- Clinic name (maximum 2 lines)
- Rating (0-5 stars) with number of reviews
- Distance from current location
- Brief description (one line, truncated)
- "Book Now" button (primary CTA)
- Visual indicator for currently open/closed

#### Interaction Details
- Tapping clinic card navigates to clinic detail screen
- Tapping "Book Now" skips clinic details and goes directly to service selection
- Pull to refresh functionality
- Infinite scroll pagination (10 clinics per page)

#### Accessibility
- Voice search integration
- Alt text for all clinic images
- Screen reader optimized cards

### 2. Select Service Screen

#### Purpose
Present available services for the selected clinic, allowing users to choose what they need.

#### Key Components
- **Clinic Header** (minimized view):
  - Name, rating, distance
  - Back button to return to search
- **Category Tabs** (horizontal scroll):
  - General Checkup
  - Vaccinations
  - Surgery
  - Grooming
  - Dental
- **Service List**:
  - Service name
  - Duration (minutes/hours)
  - Price
  - Brief description (expandable)
  - Selection radio button

#### Interaction Details
- Single service selection only (radio button behavior)
- Service cards expand on tap to show full description
- "Continue" button (footer) only enabled after selection
- Sticky header when scrolling

#### Behavior Notes
- Services that are unavailable should be grayed out with explanation
- If clinic is closed, show earliest availability date in header

### 3. Choose Pet Screen

#### Purpose
Allow selection of which pet the appointment is for, or create a new pet profile.

#### Key Components
- **Pet Cards** (horizontal carousel):
  - Pet profile picture (circular)
  - Name
  - Species/Breed
  - Age
- **Add New Pet** card (+) as last item
- **Selected Service Summary** (minimized, sticky top)
- **Skip Option** ("I'm bringing a new pet" - for first-time visitors)

#### Interaction Details
- Selected pet card shows visual indicator
- Tapping Add New Pet opens pet creation flow (separate process)
- Continue button is disabled until pet is selected or skip option chosen

#### Behavior Notes
- If no pets are registered yet, automatically show the Add New Pet form
- Recently added pets appear first in the carousel

### 4. Select Date & Slot Screen

#### Purpose
Allow users to choose their preferred appointment date and available time slot.

#### Key Components
- **Month View Calendar**:
  - Current month visible by default
  - Dates with availability highlighted
  - Booked/unavailable dates grayed out
- **Time Slot Grid** (appears after date selection):
  - Morning/Afternoon/Evening grouping
  - Available slots shown as selectable buttons
  - 30-minute slot increments
  - Visual indicators for peak/off-peak pricing
- **Selected Service & Pet Summary** (minimized, expandable)

#### Interaction Details
- Date tapping shows available slots below calendar
- Selected slot shows visual confirmation
- Forward/backward month navigation
- "Next Available" quick button to jump to next open slot

#### Behavior Notes
- Fully booked dates should appear grayed out
- Special holiday indicators
- If clinic has varying hours by day, reflect in available slots

### 5. Preview Booking Screen

#### Purpose
Show a comprehensive summary of the booking details before proceeding to notes.

#### Key Components
- **Booking Card** (with visual hierarchy):
  1. Clinic name and address
  2. Service details (name, duration, price)
  3. Date and time (with day of week)
  4. Pet information
- **Map Preview** of clinic location
- **Cancellation Policy** notice
- **Continue** and **Edit** buttons

#### Interaction Details
- Tapping any section provides option to edit that specific detail
- Expandable sections for additional service details

### 6. Add Notes Screen (Optional)

#### Purpose
Allow users to provide additional information about their pet's condition.

#### Key Components
- **Text Area** for notes (character-limited with counter)
- **Common Issues** quick-select buttons:
  - "First visit"
  - "Follow-up appointment"
  - "Emergency"
  - "Recurring issue"
- **Photo Upload** option (to show symptoms/issues)
- **Skip** option clearly available

#### Interaction Details
- Quick-select buttons add predefined text to notes
- Photo upload opens camera/gallery selection
- Limit of 3 photos

### 7. Review Screen

#### Purpose
Final verification of all booking details before payment.

#### Key Components
- **Complete Booking Summary**:
  - All details from previous steps
  - Notes section (if filled)
  - Total cost breakdown:
    - Service fee
    - Taxes/Additional fees
    - Total amount
- **Terms & Conditions** checkbox
- **Proceed to Payment** button

#### Interaction Details
- Expandable/collapsible sections
- T&C checkbox must be checked to enable payment button

### 8. Payment Screen

#### Purpose
Secure payment processing for booking confirmation.

#### Key Components
- **Payment Method Selection**:
  - Saved cards (if any)
  - Add new card
  - Digital wallets (Apple Pay/Google Pay)
- **Promo Code** entry field (collapsible)
- **Secure Payment** indicators/badges
- **Amount** prominently displayed
- **Pay Now** button

#### Behavior Notes
- Integration with Midtrans/Xendit
- Saved card information should be masked
- Error handling for declined payments
- Loading states and animations during processing

### 9. Confirmation & Receipt Screen

#### Purpose
Confirm successful booking and provide next steps.

#### Key Components
- **Success Animation** (brief, celebratory)
- **Confirmation Number** (copy-to-clipboard)
- **Booking Details Summary** (collapsed by default)
- **Add to Calendar** button
- **Share Details** button
- **Return to Home** button
- **Preparation Instructions** (expandable)

#### Follow-up Actions
- Automatic confirmation email/SMS
- Add to in-app appointment list
- Calendar event with reminders (if selected)
- Push notification scheduling (day before, hour before)

## Error Handling

### Common Scenarios

1. **Slot Taken During Booking**
   - Immediate notification overlay
   - Alternative slot suggestions
   - Easy return to slot selection

2. **Payment Failure**
   - Clear error message with reason
   - Retry option
   - Alternative payment method suggestion
   - Support contact information

3. **Network Connectivity Issues**
   - Offline indicator
   - Auto-retry mechanism
   - Local data saving for recovery

4. **Session Timeout**
   - Warning before timeout
   - Option to extend session
   - Save progress for quick recovery

## Micro-Interactions & Animations

### Animation Guidelines

- **Duration**: 200-300ms for most transitions
- **Easing**: Standard deceleration curve
- **Purpose**: Functional feedback, not decorative

### Key Moments for Animation

- Clinic card selection (subtle elevation change)
- Calendar date selection (ripple + highlight)
- Time slot selection (checkmark animation)
- Payment processing (progress indicator)
- Booking confirmation (success animation)

## Performance Considerations

- Lazy load clinic images
- Progressive loading of service lists
- Pre-fetch next likely screen
- Cache previous selections for back navigation
- Optimize calendar rendering for slower devices

## A/B Testing Opportunities

1. **Service Selection Layout**:
   - Option A: Card-based vertical list
   - Option B: Grid view with icons

2. **Calendar Interface**:
   - Option A: Traditional month calendar
   - Option B: Horizontal date strip with quick-select

3. **CTA Button Language**:
   - Option A: "Continue" vs "Next"
   - Option B: More specific action text ("Select Time", "Choose Payment")

## Metrics to Track

- Time spent on each booking step
- Drop-off rates per step
- Booking completion rate
- Payment method preferences
- Rebooking rate
- Post-booking survey completion

## Accessibility Checklist

- Voiceover/TalkBack support for all elements
- Minimum touch target size: 44x44pt
- Color contrast ratios: 4.5:1 minimum
- Alternative text for all images
- Keyboard navigation support
- Error identification without relying solely on color

## Localization Considerations

- Date format adapting to locale
- Currency display with appropriate symbols
- Right-to-left language support
- Time format (12h/24h) based on locale
- Dynamic text container sizing for longer translations
