# Navbar Implementation Plan

## Overview

This document outlines the plan to implement a responsive navbar based on the reference design from tailark.com.

## Reference Analysis

The reference navbar (from docs/reference.html) features:

- Fixed positioning with smooth transitions
- Responsive design (mobile hamburger menu + desktop inline menu)
- Logo with gradient SVG
- Navigation links (Features, Pricing, About)
- Call-to-action buttons (Login, Sign Up)
- Theme support (light/dark)
- Mobile menu overlay with backdrop
- State-based animations using data attributes

## Technical Implementation

### Structure

```
<header>
  <nav (fixed, full-width)>
    <div (container)>
      <div (flex wrapper)>
        <!-- Left side -->
        <div>
          <a (logo)>
          <button (mobile menu toggle)>
          <div (desktop nav - hidden on mobile)>
        </div>

        <!-- Right side / Mobile menu -->
        <div (mobile overlay / desktop inline)>
          <div (mobile nav - hidden on desktop)>
          <div (action buttons)>
        </div>
      </div>
    </div>
  </nav>
</header>
```

### Key Features

1. **Fixed Navigation** (reference.html:143)
   - `fixed z-20 w-full transition-all duration-300`
   - Stays at top while scrolling
   - Smooth transitions for state changes

2. **Mobile Menu Toggle** (reference.html:179-213)
   - Hamburger icon transforms to X when active
   - Uses data-state attribute for animations
   - Hidden on desktop (lg:hidden)

3. **Responsive Navigation** (reference.html:214-267)
   - Desktop: Inline flex layout with rounded buttons
   - Mobile: Full-screen overlay with stacked links
   - Different styling for each breakpoint

4. **Action Buttons** (reference.html:268-283)
   - Login: Ghost button style
   - Sign Up: Primary button with gradient background
   - Responsive flex layout (stack on mobile, row on desktop)

5. **Logo** (reference.html:154-178)
   - SVG with linear gradient
   - Gradient from #9B99FE to #2BC8B7
   - 24x24px size

## Implementation Steps for Techtribes

### 1. Update Layout File

File: `site/_layouts/default.html`

Add navbar include before main content:
```html
<body>
  {% include navbar.html %}
  {{ content }}
  {% include footer.html %}
</body>
```

### 2. Create Navbar Include

File: `site/_includes/navbar.html`

Implement the navbar structure with:
- Techtribes logo (or create SVG logo)
- Navigation links: "Communities", "Add Community", "About"
- Mobile menu toggle
- Responsive layout

### 3. JavaScript for Mobile Menu

File: `site/assets/js/navbar.js` (create new)

Add functionality for:
- Toggle mobile menu on hamburger click
- Close menu when clicking outside
- Handle escape key to close menu
- Prevent body scroll when menu is open

Example:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[aria-label="Open Menu"]');
  const nav = document.querySelector('nav');

  menuToggle?.addEventListener('click', () => {
    const isOpen = nav.dataset.state === 'true';
    nav.dataset.state = (!isOpen).toString();
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });
});
```

### 4. CSS Styles

Add to `src/input.css`:

```css
/* Navbar transitions */
nav[data-state="true"] .menu-icon {
  @apply rotate-180 scale-0 opacity-0;
}

nav[data-state="true"] .close-icon {
  @apply rotate-0 scale-100 opacity-100;
}

nav[data-state="true"] .mobile-menu {
  @apply block lg:flex;
}
```

### 5. Tailwind Configuration

Ensure `tailwind.config.js` includes navbar classes in content paths (already configured).

## Customization for Techtribes

### Navigation Links

Replace reference links with:
- **Communities** → Main listing (/)
- **Add Community** → /add or trigger npm run add
- **About** → About page or GitHub repo

### Action Buttons

Options:
1. Keep "Add Community" as primary CTA
2. Add "Submit Event" button
3. Add "GitHub" link
4. Remove login/signup (not needed for static site)

### Logo

Options:
1. Use existing Techtribes branding
2. Create new SVG logo with tech community theme
3. Simple text logo with gradient effect

### Color Scheme

Adapt gradient colors to match Techtribes theme:
- Current reference: Purple (#9B99FE) to Teal (#2BC8B7)
- Consider: Tech-focused colors or Finland-themed colors

## Mobile Menu Behavior

### Closed State (default)
- Hamburger icon visible (mobile only)
- Desktop nav visible (desktop only)
- Mobile menu hidden

### Open State (data-state="true")
- Close (X) icon visible
- Mobile menu overlay shown with backdrop
- Navigation links stacked vertically
- Action buttons at bottom
- Body scroll prevented

## Accessibility Considerations

1. **ARIA Labels**
   - Menu toggle: `aria-label="Open Menu"` / `aria-label="Close Menu"`
   - Logo link: `aria-label="home"`

2. **Keyboard Navigation**
   - Tab through all interactive elements
   - Escape key closes mobile menu
   - Focus trap in mobile menu when open

3. **Screen Readers**
   - Proper heading hierarchy
   - Link text describes destination
   - Button text describes action

## Testing Checklist

- [ ] Mobile menu opens/closes on button click
- [ ] Desktop navigation shows inline
- [ ] Mobile navigation shows as overlay
- [ ] Smooth transitions between states
- [ ] Links navigate correctly
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] Works with keyboard navigation
- [ ] Accessible to screen readers
- [ ] Body scroll locked when mobile menu open
- [ ] Click outside closes mobile menu

## Files to Create/Modify

### Create
- `site/_includes/navbar.html` - Navbar HTML structure
- `site/assets/js/navbar.js` - Mobile menu interactivity
- `docs/navbar.md` - This file

### Modify
- `site/_layouts/default.html` - Add navbar include
- `src/input.css` - Add navbar-specific styles
- `site/_includes/head.html` - Include navbar.js script

## Next Steps

1. Review this plan
2. Decide on navigation structure and links for Techtribes
3. Create/choose logo design
4. Implement navbar.html include
5. Add JavaScript functionality
6. Test on multiple devices and browsers
7. Ensure accessibility compliance
