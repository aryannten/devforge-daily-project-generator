# Design System: DevForge Daily Project Generator

## 1. Visual Theme & Atmosphere

**Neo-Brutalist Tech Workshop** — Raw industrial energy meets kinetic digital craft. The interface feels like a high-performance developer's workbench: dense with information, unapologetically functional, yet surprisingly elegant through bold typography and electric accents. The aesthetic balances utilitarian efficiency with moments of visual delight through animated gradients, layered shadows, and micro-interactions that reward exploration.

The atmosphere is **focused and energetic** — designed for developers who value information density over whitespace, precision over decoration, and speed over ceremony.

## 2. Color Palette & Roles

### Core Palette
- **Deep Space Black** (#0a0e14) — Primary background, establishes the dark foundation
- **Midnight Slate** (#12161f) — Secondary surfaces, cards, and elevated elements
- **Industrial Charcoal** (#1a1f2e) — Tertiary backgrounds, subtle layering
- **Elevated Gunmetal** (#1e2433) — Hover states, interactive surfaces

### Border System
- **Structural Gray** (#2a3142) — Default borders, dividers, structural elements
- **Bright Edge** (#3d4556) — Emphasized borders, active states, focus rings

### Text Hierarchy
- **Pure White** (#e8edf4) — Primary text, headings, high-emphasis content
- **Soft Gray** (#9ca3af) — Secondary text, metadata, supporting information
- **Muted Gray** (#6b7280) — Tertiary text, timestamps, low-emphasis content

### Accent System
- **Electric Blue** (#00d4ff) — Primary accent, links, interactive elements, gradient start
- **Bright Cyan** (#33ddff) — Hover states, active elements, highlights
- **Deep Cyan** (#0099cc) — Muted accents, gradient end, subtle emphasis
- **Glow Aura** (rgba(0, 212, 255, 0.3)) — Shadows, halos, depth effects

### Status Colors
- **Success Green** (#10b981) — Confirmations, completed states, positive actions
- **Error Red** (#ef4444) — Errors, warnings, destructive actions
- **Warning Amber** (#f59e0b) — Cautions, pending states, attention-required
- **Featured Gold** (#ffd700 → #ffed4e) — Daily featured badge gradient

## 3. Typography Rules

### Font Families
- **Display & Body**: Space Grotesk — Geometric sans-serif with technical character, used for all UI text
- **Monospace**: JetBrains Mono — Developer-focused monospace for code, tags, and technical labels

### Type Scale
- **4XL** (3rem/48px) — Hero headings with gradient treatment
- **3XL** (2.25rem/36px) — Section headings, card titles
- **2XL** (1.75rem/28px) — Subsection headings
- **XL** (1.375rem/22px) — Component headings, emphasized text
- **LG** (1.125rem/18px) — Large body text, prominent labels
- **Base** (1rem/16px) — Standard body text, descriptions
- **SM** (0.875rem/14px) — Secondary text, metadata
- **XS** (0.75rem/12px) — Tertiary text, badges, micro-copy

### Weight & Style
- **Bold 700** — Headings, buttons, emphasized labels (uppercase with letter-spacing)
- **Semibold 600** — Subheadings, navigation, interactive elements
- **Medium 500** — Body text, descriptions
- **Regular 400** — Supporting text, long-form content

### Special Treatments
- **Gradient Text**: Primary headings use electric blue gradient (#00d4ff → #0099cc) with `-webkit-background-clip: text`
- **Uppercase + Tracking**: Buttons, badges, and labels use `text-transform: uppercase` with `letter-spacing: 0.05em`
- **Negative Tracking**: Large headings use `letter-spacing: -0.02em` to `-0.03em` for tighter, more impactful appearance

## 4. Component Stylings

### Buttons
- **Shape**: Generously rounded corners (12px radius), bold 3px borders
- **Primary**: Success green (#10b981) background with white text, glowing shadow
- **Secondary**: Transparent background with bright edge border, hover lifts with background fill
- **Accent**: Electric blue gradient background with cyan border, intense glow effect
- **Behavior**: Hover lifts 3px with enhanced shadow, active state compresses to 1px lift
- **States**: Disabled at 40% opacity with grayscale filter

### Cards & Containers
- **Shape**: Extra-large rounded corners (16px radius)
- **Border**: Bold 3px bright edge border (#3d4556)
- **Background**: Midnight slate (#12161f) with subtle gradient mesh overlay
- **Top Accent**: 4px electric blue gradient bar with glow effect
- **Shadow**: Extra-large layered shadows (16px + 8px) for dramatic depth
- **Animation**: Staggered slide-in-up entrance (0.6s with delays)

### Lists & Items
- **Feature Items**: Success green left border (4px), checkmark icon, hover slides right with glow
- **Outcome Items**: Electric blue left border, arrow icon, hover slides right with glow
- **Extension Items**: Electric blue left border, plus icon, hover slides right with glow
- **Similar Items**: Muted gray left border, bullet icon, hover slides right
- **Padding**: Generous internal spacing (24px horizontal, 20px vertical)

### Tech Tags
- **Shape**: Medium rounded corners (8px radius)
- **Font**: JetBrains Mono monospace
- **Color**: Electric blue text on industrial charcoal background
- **Border**: 2px structural gray, transitions to accent on hover
- **Behavior**: Hover lifts 2px with glow, gradient overlay fades in at 10% opacity

### Badges
- **Daily Featured**: Gold gradient (#ffd700 → #ffed4e) with shimmer animation, bold uppercase text, shadow glow
- **Generation Type**: Small pill badges with accent color, uppercase mono font
- **Meta Items**: Compact pills with dark background, bright border, hover lifts with glow
- **Count Badges**: Circular badges on navigation with gradient background, scale-in animation

### Inputs & Forms
- **Text Inputs**: Dark background with bright edge border, focus adds accent glow ring
- **Checkboxes**: Custom styled with gradient fill on checked state, kinetic hover scale
- **Toggle Switches**: Animated slider with gradient background, smooth 250ms transition
- **Select Dropdowns**: Dark background with accent border on focus, custom arrow icon

## 5. Layout Principles

### Spacing System
- **XS** (4px) — Tight internal spacing, icon gaps
- **SM** (8px) — Compact element spacing, small gaps
- **MD** (16px) — Standard spacing, list gaps, form fields
- **LG** (24px) — Section spacing, card padding
- **XL** (32px) — Large section breaks, hero spacing
- **2XL** (48px) — Major section divisions
- **3XL** (64px) — Page-level spacing, hero sections

### Grid & Alignment
- **Max Width**: 1280px for app container, 900px for content cards
- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1023px), Desktop (1024px+)
- **Card Layout**: Asymmetric single-column with staggered animations
- **Navigation**: Sticky header with backdrop blur, compact on mobile

### Depth & Elevation
- **Layered Shadows**: Multiple shadow layers for dramatic depth (2-4 layers per element)
- **Glow Effects**: Colored shadows using rgba with 20-40% opacity for accent elements
- **Z-Index Hierarchy**: Background (1) → Content (2) → Navigation (100) → Messages (1000)
- **Backdrop Blur**: 12px blur on glass-morphic elements (navigation, messages)

### Animation Principles
- **Entrance**: Staggered slide-in-up (0.6s base + 0.05s increments per item)
- **Hover**: Lift 2-3px with enhanced shadow, 250ms cubic-bezier easing
- **Active**: Compress to 1px lift, 150ms fast transition
- **Micro-interactions**: Scale, rotate, or translate on hover (icons, badges, tags)
- **Loading**: Spin animation (0.8s linear infinite) with accent glow
- **Shimmer**: Horizontal gradient sweep (2s infinite) for featured elements

### Responsive Strategy
- **Mobile-First**: Base styles for mobile, progressive enhancement for larger screens
- **Touch Targets**: Minimum 48px height for interactive elements on mobile
- **Text Scaling**: Reduce font sizes by 1-2 steps on mobile
- **Spacing Reduction**: Compress padding/margins by 25-50% on mobile
- **Navigation**: Hide text labels on mobile, show icons only
- **Messages**: Full-width on mobile with reduced padding

## 6. Interaction Patterns

### Hover States
- **Lift + Glow**: Primary interaction pattern — element lifts 2-3px with enhanced shadow
- **Border Transition**: Border color shifts from structural gray to accent blue
- **Background Overlay**: Gradient overlay fades in at 10-15% opacity
- **Icon Animation**: Scale 1.1x or rotate for playful feedback

### Focus States
- **Glow Ring**: 2px accent outline with 4px glow shadow (rgba(0, 212, 255, 0.3))
- **Offset**: 3px outline offset for breathing room
- **Radius**: Small border radius (4px) for consistent shape

### Loading States
- **Spinner**: Rotating border with accent top color, 64px size, centered with text below
- **Skeleton**: Shimmer animation on placeholder elements
- **Disabled**: 40% opacity with grayscale filter

### Success/Error States
- **Success**: Green glow with checkmark icon, slide-in-right animation
- **Error**: Red glow with X icon, shake animation
- **Messages**: Toast notifications in top-right with auto-dismiss, backdrop blur

## 7. Accessibility Considerations

- **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
- **Focus Indicators**: High-contrast glow rings on all interactive elements
- **Touch Targets**: 48px minimum on mobile for buttons and interactive items
- **Reduced Motion**: Respect `prefers-reduced-motion` for animations
- **Semantic HTML**: Proper heading hierarchy, ARIA labels where needed
- **Keyboard Navigation**: Full keyboard support with visible focus states
