# PetPro Platform - Visual Style Guide

## Brand Identity

### Color Palette

```
Primary Colors
┌─────────────┬────────────┬────────────────┐
│ Color Name  │ Hex Code   │ Usage          │
├─────────────┼────────────┼────────────────┤
│ Teal        │ #00A0B0    │ Primary Brand  │
│ Coral       │ #FF6B6B    │ Accents/CTAs   │
│ Warm Yellow │ #FFD166    │ Highlights     │
│ Deep Blue   │ #1D3461    │ Text/Headers   │
└─────────────┴────────────┴────────────────┘

Neutral Colors
┌─────────────┬────────────┬────────────────┐
│ Color Name  │ Hex Code   │ Usage          │
├─────────────┼────────────┼────────────────┤
│ White       │ #FFFFFF    │ Backgrounds    │
│ Light Gray  │ #F5F7FA    │ Backgrounds    │
│ Medium Gray │ #D9E0E6    │ Borders        │
│ Dark Gray   │ #66788A    │ Secondary Text │
│ Charcoal    │ #333F4D    │ Primary Text   │
└─────────────┴────────────┴────────────────┘

Status Colors
┌─────────────┬────────────┬────────────────┐
│ Color Name  │ Hex Code   │ Usage          │
├─────────────┼────────────┼────────────────┤
│ Success     │ #06D6A0    │ Confirmations  │
│ Warning     │ #FFC43D    │ Alerts         │
│ Error       │ #EF476F    │ Errors         │
│ Info        │ #118AB2    │ Information    │
└─────────────┴────────────┴────────────────┘
```

#### Color Application Examples

Primary Button: Teal (#00A0B0) with white text
Secondary Button: White with Teal border and Teal text
Danger Button: Error (#EF476F) with white text
Success States: Success Green (#06D6A0) for confirmations
Links: Deep Blue (#1D3461), underlined on hover

### Typography

```
┌─────────────┬────────────┬────────────────────────────┐
│ Font        │ Weight     │ Usage                      │
├─────────────┼────────────┼────────────────────────────┤
│ Montserrat  │ Bold       │ Headers (H1, H2)           │
│             │ SemiBold   │ Headers (H3, H4)           │
│             │ Medium     │ Subheaders                 │
├─────────────┼────────────┼────────────────────────────┤
│ Open Sans   │ Regular    │ Body text                  │
│             │ SemiBold   │ Emphasis/buttons           │
│             │ Light      │ Captions/secondary text    │
└─────────────┴────────────┴────────────────────────────┘
```

#### Font Size System

```
┌─────────────┬────────────┬────────────────────────────┐
│ Element     │ Mobile     │ Desktop                    │
├─────────────┼────────────┼────────────────────────────┤
│ H1          │ 24px       │ 36px                       │
│ H2          │ 20px       │ 30px                       │
│ H3          │ 18px       │ 24px                       │
│ H4          │ 16px       │ 20px                       │
│ Body        │ 14px       │ 16px                       │
│ Small Text  │ 12px       │ 14px                       │
│ Caption     │ 10px       │ 12px                       │
└─────────────┴────────────┴────────────────────────────┘
```

## Component Library

### Buttons

```
┌────────────────────────────────────────────┐
│                                            │
│  [  PRIMARY BUTTON  ]  [SECONDARY BUTTON]  │
│                                            │
│  [    DISABLED    ]  [ BUTTON WITH ICON ▶ ]│
│                                            │
└────────────────────────────────────────────┘
```

#### Button Specifications

- **Height**: 44px (mobile), 48px (desktop)
- **Padding**: 16px horizontal, 12px vertical
- **Border Radius**: 8px
- **States**: Default, Hover, Active, Disabled
- **Transitions**: 0.2s ease-in-out for all state changes

### Input Fields

```
┌────────────────────────────────────────────┐
│                                            │
│  Label                                     │
│  ┌──────────────────────────────────────┐  │
│  │ Input text                           │  │
│  └──────────────────────────────────────┘  │
│  Helper text / Error message               │
│                                            │
│  Label                                     │
│  ┌──────────────────────────────────────┐  │
│  │ Placeholder text                     │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Label                                     │
│  ┌──────────────────────────────────────┐  │
│  │ ●●●●●●●●●●                           │  │
│  └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

#### Input Field Specifications

- **Height**: 44px (mobile), 48px (desktop)
- **Border**: 1px solid Medium Gray (#D9E0E6)
- **Border Radius**: 8px
- **Focus State**: 2px Teal border
- **Error State**: 1px Error red border with error message
- **Padding**: 12px horizontal, 10px vertical

### Cards

```
┌────────────────────────────────────────────┐
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │  [Image Area - 16:9 ratio]           │  │
│  │                                      │  │
│  ├──────────────────────────────────────┤  │
│  │                                      │  │
│  │  Card Title                          │  │
│  │  Supporting text or description that │  │
│  │  provides additional context         │  │
│  │                                      │  │
│  │  [Button or Link]                    │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

#### Card Specifications

- **Border Radius**: 12px
- **Shadow**: 0px 4px 8px rgba(0, 0, 0, 0.08)
- **Padding**: 16px
- **Background**: White (#FFFFFF)
- **Border**: None or 1px solid Medium Gray (#D9E0E6)
- **Hover State**: Slight elevation increase (box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.12))

### Icons

```
┌────────────────────────────────────────────┐
│                                            │
│  ◯ ⚙ ❤ 🔍 🏠 📅 💬 📦 📊 ⭐ 🔔 📄 ✓ ✕     │
│                                            │
└────────────────────────────────────────────┘
```

#### Icon Specifications

- **Style**: Outlined or filled depending on state
- **Size**: 24px (default), 20px (compact), 32px (large)
- **Color**: Inherits from text color or specified by context
- **Touch Target**: Minimum 44x44px for interactive icons

## Interface-Specific Guidelines

### Mobile App

#### Navigation Bar

```
┌────────────────────────────────────────────┐
│                                            │
│  🏠     📅     🛒     👤                   │
│ Home   Appts   Shop  Profile               │
│                                            │
└────────────────────────────────────────────┘
```

#### List Items

```
┌────────────────────────────────────────────┐
│                                            │
│  Item Title                          >     │
│  Supporting text or description            │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  Item with Icon                      >     │
│  📅 Aug 27, 2025 - 10:00 AM                │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  [◯] Item with checkbox                    │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  Item with Toggle              [Off]       │
│                                            │
└────────────────────────────────────────────┘
```

### Vendor Dashboard

#### Data Tables

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Column 1    Column 2    Column 3      Actions     │
├────────────────────────────────────────────────────┤
│  Value 1.1   Value 1.2   Value 1.3    [Edit][View] │
├────────────────────────────────────────────────────┤
│  Value 2.1   Value 2.2   Value 2.3    [Edit][View] │
├────────────────────────────────────────────────────┤
│  Value 3.1   Value 3.2   Value 3.3    [Edit][View] │
├────────────────────────────────────────────────────┤
│  [◂ Previous]          [1][2][3][4][5]  [Next ▸]   │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Sidebar Navigation

```
┌─────────────────────┐
│                     │
│  [Logo]             │
│                     │
│  ➤ Dashboard        │
│  ○ Appointments     │
│  ○ Services         │
│  ○ Products         │
│  ○ Orders           │
│  ○ Reviews          │
│  ○ Reports          │
│  ○ Settings         │
│                     │
│  CLINIC STATUS      │
│  ○ OPEN             │
│                     │
└─────────────────────┘
```

### Admin Dashboard

#### Stat Cards

```
┌────────────────────────────────────────────┐
│                                            │
│  TITLE                                     │
│  123,456                                   │
│  ↑ 12% from previous period                │
│                                            │
└────────────────────────────────────────────┘
```

#### Charts

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Chart Title                                       │
│                                                    │
│  │                                                 │
│  │    ┌───┐                                        │
│  │    │   │    ┌───┐                               │
│  │    │   │    │   │    ┌───┐                      │
│  │    │   │    │   │    │   │    ┌───┐             │
│  │    │   │    │   │    │   │    │   │    ┌───┐    │
│  └────┴───┴────┴───┴────┴───┴────┴───┴────┴───┴────┘
│      Jan    Feb    Mar    Apr    May    Jun         │
│                                                     │
│  [Toggle: Weekly | Monthly | Quarterly | Yearly]    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Responsive Design Guidelines

### Breakpoints

```
┌────────────────┬────────────────┬────────────────────┐
│ Device         │ Width Range    │ Primary Layout     │
├────────────────┼────────────────┼────────────────────┤
│ Mobile Small   │ 320px-375px    │ Single column      │
│ Mobile Regular │ 376px-767px    │ Single column      │
│ Tablet         │ 768px-1023px   │ Two columns        │
│ Desktop Small  │ 1024px-1439px  │ Multi-column       │
│ Desktop Large  │ 1440px+        │ Multi-column       │
└────────────────┴────────────────┴────────────────────┘
```

### Grid System

- Mobile: 4-column grid with 16px gutters
- Tablet: 8-column grid with 24px gutters
- Desktop: 12-column grid with 24px gutters

### Spacing System

```
┌────────────┬────────────┬───────────────────────┐
│ Size Name  │ Value      │ Usage                 │
├────────────┼────────────┼───────────────────────┤
│ xs         │ 4px        │ Tight inline spacing  │
│ s          │ 8px        │ Icon padding          │
│ m          │ 16px       │ Standard spacing      │
│ l          │ 24px       │ Section spacing       │
│ xl         │ 32px       │ Component spacing     │
│ xxl        │ 48px       │ Major section breaks  │
└────────────┴────────────┴───────────────────────┘
```

## Accessibility Guidelines

### Color Contrast

- Text meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- UI elements have sufficient contrast against backgrounds
- Information is not conveyed by color alone

### Interactive Elements

- Minimum touch target size: 44x44px
- Focus states are clearly visible
- Interactive elements are distinguishable 

### Screen Readers

- All images have meaningful alt text
- Form fields have associated labels
- ARIA attributes used appropriately
- Proper heading hierarchy maintained

## Animation & Transitions

### Principles

- Animations should feel natural and unobtrusive
- Duration: 200-300ms for most UI transitions
- Easing: Use ease-out for entering elements, ease-in for exiting elements
- Purpose: Always functional, never purely decorative

### Common Animations

```
┌────────────────┬────────────┬───────────────────────┐
│ Animation      │ Duration   │ Easing                │
├────────────────┼────────────┼───────────────────────┤
│ Page transition│ 300ms      │ cubic-bezier(0.4,0,0.2,1) │
│ Button hover   │ 200ms      │ ease-out              │
│ Card hover     │ 250ms      │ ease-out              │
│ Modal open     │ 250ms      │ ease-out              │
│ Modal close    │ 200ms      │ ease-in               │
│ Loader         │ 1500ms     │ linear, infinite      │
└────────────────┴────────────┴───────────────────────┘
```

## Implementation Notes

### CSS Variables

```css
:root {
  /* Colors: Primary */
  --color-teal: #00A0B0;
  --color-coral: #FF6B6B;
  --color-yellow: #FFD166;
  --color-blue: #1D3461;
  
  /* Colors: Neutral */
  --color-white: #FFFFFF;
  --color-gray-100: #F5F7FA;
  --color-gray-300: #D9E0E6;
  --color-gray-500: #66788A;
  --color-gray-800: #333F4D;
  
  /* Colors: Status */
  --color-success: #06D6A0;
  --color-warning: #FFC43D;
  --color-error: #EF476F;
  --color-info: #118AB2;
  
  /* Spacing */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  
  /* Typography */
  --font-family-heading: 'Montserrat', sans-serif;
  --font-family-body: 'Open Sans', sans-serif;
  
  /* Border Radius */
  --border-radius-s: 4px;
  --border-radius-m: 8px;
  --border-radius-l: 12px;
  
  /* Shadows */
  --shadow-light: 0px 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-medium: 0px 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-heavy: 0px 8px 16px rgba(0, 0, 0, 0.12);
}
```

### Component-Based Implementation

Follow these principles when implementing the design system:

1. Use component-based architecture (React components for web dashboards, reusable components for mobile)
2. Ensure all components are responsive and accessible
3. Document each component with:
   - Visual examples
   - Props and configuration options
   - Accessibility notes
   - Usage guidelines
4. Create storybooks or live component libraries for reference

## Design File Organization

### Figma Structure

```
PetPro Design System
├── 📁 Style Guide
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Icons
│   └── Motion
├── 📁 Components
│   ├── Buttons
│   ├── Form Elements
│   ├── Cards
│   ├── Navigation
│   └── Data Display
├── 📁 Mobile App
│   ├── Core Screens
│   ├── User Flows
│   └── Prototypes
├── 📁 Vendor Dashboard
│   ├── Core Screens
│   ├── User Flows
│   └── Prototypes
└── 📁 Admin Dashboard
    ├── Core Screens
    ├── User Flows
    └── Prototypes
```

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | August 11, 2025 | Initial release |
