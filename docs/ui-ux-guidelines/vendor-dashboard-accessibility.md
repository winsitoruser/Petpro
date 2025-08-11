# PetPro Vendor Dashboard Accessibility Guidelines & Responsive Design

## Accessibility Guidelines

### 1. Perceivable Information

#### Color & Contrast
- Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
- Do not rely on color alone to convey information (use icons, patterns, or text)
- Provide visual indicators for focus states with sufficient contrast

```
// Example of compliant color contrast
Text: #333333 on background: #FFFFFF (Ratio: 12.6:1) ✓
Link: #0066CC on background: #FFFFFF (Ratio: 4.8:1) ✓
Error: #D32F2F on background: #FFFFFF (Ratio: 5.1:1) ✓
```

#### Text Alternatives
- All images must include alternative text descriptions
- Charts and graphs should have text summaries
- Form controls must have descriptive labels

```
// Example of proper image alternative text
<img src="order-status-icon.png" alt="Order completed and ready for shipping">
```

#### Adaptable Content
- Information should be presentable in different ways without losing structure
- Tables should include proper headers and row/column associations
- Lists should use proper HTML list elements

### 2. Operable Interface

#### Keyboard Accessibility
- All functionality must be available using keyboard alone
- Implement logical tab order following visual layout
- No keyboard traps or focus issues
- Provide visible focus indicators

```
// Example focus management for modals
function openModal() {
  document.getElementById('modal').setAttribute('aria-hidden', 'false');
  document.getElementById('firstFocusableElement').focus();
  // Trap focus within modal
}
```

#### Timing
- Provide sufficient time to read and interact with content
- Allow users to extend, change, or turn off time limits
- For auto-updating content, provide pause/stop controls

#### Navigation
- Implement skip links to bypass repetitive navigation
- Use descriptive page titles and headings
- Provide breadcrumbs for complex navigation paths
- Include a site search feature

```
// Example skip link implementation
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### 3. Understandable Information

#### Readability
- Use clear, simple language (aim for 8th-grade reading level)
- Avoid jargon and abbreviations or provide explanations
- Left-align text for better readability

#### Predictability
- Navigation should be consistent across pages
- Form elements should behave predictably
- Avoid unexpected changes of context

#### Input Assistance
- Provide clear labels for form fields
- Offer helpful error messages with instructions for correction
- Include input format guidance where needed

```
// Example error message
<div role="alert" aria-live="assertive">
  <p>There are 2 errors in your submission:</p>
  <ul>
    <li>Product price must be a positive number</li>
    <li>Inventory quantity must be at least 1</li>
  </ul>
</div>
```

### 4. Robust Implementation

#### Compatibility
- Ensure compatibility with current and future assistive technologies
- Use valid HTML with proper ARIA attributes when needed
- Test with screen readers (NVDA, JAWS, VoiceOver)

#### ARIA Implementation
- Use ARIA landmarks to identify regions of the page
- Apply proper ARIA roles, states, and properties
- Implement live regions for dynamic content

```
// Example ARIA landmark implementation
<header role="banner">...</header>
<nav role="navigation" aria-label="Main Navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

## Responsive Design Guidelines

### 1. Layout Structure

#### Breakpoints
- Mobile: 320px - 480px
- Tablet: 481px - 768px
- Desktop Small: 769px - 1024px
- Desktop Large: 1025px and above

#### Grid System
- Use a 4-column grid for mobile
- Use an 8-column grid for tablet
- Use a 12-column grid for desktop
- Maintain consistent gutters (16px)

```
// Example responsive grid implementation
.container {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 1fr); /* Mobile */
}

@media (min-width: 481px) {
  .container {
    grid-template-columns: repeat(8, 1fr); /* Tablet */
  }
}

@media (min-width: 769px) {
  .container {
    grid-template-columns: repeat(12, 1fr); /* Desktop */
  }
}
```

### 2. Typography

#### Responsive Font Sizing
- Use relative units (rem or em) for font sizes
- Base font size: 16px (1rem)
- Mobile headings: h1 (1.5rem), h2 (1.25rem), h3 (1.1rem)
- Desktop headings: h1 (2rem), h2 (1.5rem), h3 (1.25rem)

```
// Example responsive typography
html { font-size: 16px; }

h1 { 
  font-size: 1.5rem; /* 24px on mobile */
}

@media (min-width: 769px) {
  h1 {
    font-size: 2rem; /* 32px on desktop */
  }
}
```

#### Line Length
- Aim for 45-75 characters per line
- Adjust margins on larger screens to maintain optimal line length

### 3. Navigation Patterns

#### Mobile Navigation
- Use a hamburger menu for primary navigation
- Keep critical actions in a persistent bottom navigation bar
- Implement a back button for nested screens

#### Tablet/Desktop Navigation
- Use horizontal navigation with visible options
- Implement dropdown menus for grouping related items
- Consider sidebar navigation for complex sections

```
// Example navigation transformation
<nav class="primary-nav">
  <!-- Mobile: Hidden behind hamburger -->
  <button class="menu-toggle" aria-expanded="false" aria-controls="primary-menu">
    <span class="hamburger-icon"></span>
    <span class="sr-only">Menu</span>
  </button>
  
  <!-- Desktop: Always visible -->
  <ul id="primary-menu">
    <li><a href="#dashboard">Dashboard</a></li>
    <li><a href="#orders">Orders</a></li>
    <!-- ... -->
  </ul>
</nav>
```

### 4. Touch Targets

- Minimum touch target size: 44x44px
- Adequate spacing between interactive elements (min 8px)
- Increase button/control sizes on touch interfaces

```
// Example touch target sizing
.button, 
.interactive-element {
  min-height: 44px;
  min-width: 44px;
  margin: 8px;
}
```

### 5. Tables & Data

#### Responsive Tables
- On mobile, transform tables into stacked card views
- Show only essential columns on smaller screens
- Allow horizontal scrolling for wide tables with fixed headers

```
// Example responsive table pattern
@media (max-width: 768px) {
  table, thead, tbody, tr {
    display: block;
  }
  
  thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }
  
  tr {
    border: 1px solid #ccc;
    margin-bottom: 16px;
  }
  
  td {
    display: flex;
    border: none;
    position: relative;
    padding-left: 50%;
  }
  
  td:before {
    position: absolute;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    content: attr(data-label);
    font-weight: bold;
  }
}
```

### 6. Images & Media

- Use responsive image techniques (`srcset`, `sizes`, `<picture>`)
- Optimize images for different screen densities
- Consider lazy loading for better performance

```
// Example responsive image implementation
<img 
  src="product-image-default.jpg" 
  srcset="product-image-small.jpg 480w,
          product-image-medium.jpg 768w,
          product-image-large.jpg 1200w"
  sizes="(max-width: 480px) 100vw,
         (max-width: 768px) 50vw,
         33vw"
  alt="Product description"
>
```

### 7. Form Elements

- Stack form fields vertically on mobile
- Use full-width inputs on mobile
- Consider multi-column layouts on desktop
- Ensure form controls are touch-friendly

```
// Example responsive form
.form-group {
  margin-bottom: 16px;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
}

@media (min-width: 769px) {
  .form-row {
    display: flex;
    margin: 0 -8px;
  }
  
  .form-group {
    flex: 1;
    padding: 0 8px;
  }
}
```

## Implementation Checklist

### Accessibility Checklist
- [ ] All images have meaningful alt text
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] All functionality is keyboard accessible
- [ ] Forms have proper labels and error handling
- [ ] ARIA attributes are correctly implemented
- [ ] Dynamic content uses appropriate live regions
- [ ] Focus management is properly handled
- [ ] All text is readable and appropriately sized

### Responsive Design Checklist
- [ ] Layouts adjust appropriately at all breakpoints
- [ ] Typography scales for readability on all devices
- [ ] Touch targets are adequately sized on mobile
- [ ] Tables adapt to small screens
- [ ] Navigation transforms appropriately for mobile
- [ ] Forms are usable on all device sizes
- [ ] Images and media are optimized for all screens
- [ ] No horizontal scrolling (except for appropriate content like tables)

## Testing Requirements

### Accessibility Testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast analyzer
- WAVE or axe browser extensions
- Automated testing with Lighthouse

### Responsive Testing
- Testing on actual devices (not just browser resizing)
- Browser dev tools for device emulation
- Browser stack or similar cross-device testing platform
- Test in landscape and portrait orientations
- Test with different font size settings
