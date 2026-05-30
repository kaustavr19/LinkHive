---
name: LinkHive
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  card-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  source-muted:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

The design system focuses on utility and rapid information retrieval. It is tailored for a high-frequency, task-oriented environment where the primary objective is to categorize and archive digital content without friction. 

The aesthetic is **Minimalist / Corporate Modern**, prioritizing content density and clarity over decorative elements. It uses a restrained visual language where color is strictly functional—serving as a navigational anchor to differentiate content categories at a glance. The emotional response is one of organized calm, efficiency, and professional reliability.

## Colors

This design system utilizes a high-utility palette where the base is neutral to allow category accents to pop.

- **Foundations:** In Light Mode, use an off-white background with pure white surfaces for cards. In Dark Mode, use #0D0D0D for the base with #1A1A1A for elevated elements.
- **Category Accents:** These colors are used for status indicators, category chips, and subtle border-left treatments on cards.
    - **Jobs:** Blue (Professional/Trust)
    - **Socials:** Pink/Magenta (Dynamic/Connection)
    - **Videos:** Red (Media/Urgency)
    - **Articles:** Amber (Intellectual/Focus)
    - **Uncategorized:** Neutral Grey (Quiet/Default)
- **State Logic:** Interactive states use a subtle 5% overlay of the primary color on the surface.

## Typography

The system uses a highly systematic 3-level hierarchy designed for rapid scanning. 

1. **Primary Level:** Card titles use `card-title` in Medium weight for immediate legibility.
2. **Secondary Level:** Source handles and metadata use `source-muted` to provide context without competing for attention.
3. **Tertiary Level:** Timestamps and system labels use `label-xs` for low-priority information.

On mobile devices, scale is preserved to maintain tap-target accessibility. Large headlines are avoided in favor of a condensed, dashboard-like density.

## Layout & Spacing

This design system follows a **Mobile-First Fixed Grid** philosophy, optimized for a 390px viewport width.

- **Rhythm:** A 4px baseline grid governs all spacing.
- **Margins:** Standard container margins are 16px.
- **Card Layout:** Vertical stack with 12px gutters between items.
- **Navigation:** A fixed bottom navigation toolbar (56px height) provides primary app switching, while a Floating Action Button (FAB) sits at the bottom-right for the primary "Save Link" action.
- **Offline States:** Subtle 2px progress bar at the very top of the viewport for synchronization status.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** rather than heavy shadows to maintain a clean, offline-tool aesthetic.

- **Level 0 (Background):** The base canvas.
- **Level 1 (Cards):** In light mode, a subtle 1px border (#EEEEEE) or a very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Modals/FAB):** Higher contrast with a slightly more defined shadow to indicate "Floating" status above the content layer.
- **Dark Mode Elevation:** Depth is achieved by lightening the surface color (#1A1A1A) rather than using shadows, which are less visible on dark backgrounds.

## Shapes

The shape language balances modern approachability with professional precision.

- **Content Cards:** 16px corner radius (`rounded-lg`) to soften the dense list view.
- **Chips/Badges:** Full pill-shape (round) to distinguish them from rectangular content blocks.
- **Form Inputs:** 8px corner radius (`rounded-md`) for a structured, functional feel.
- **Buttons:** Primary actions are pill-shaped; secondary actions within cards are 8px rounded.

## Components

- **Link Cards:** Contain a favicon/thumbnail (40px), Title (2 lines max), and Source. A 4px vertical color-accent bar is placed on the extreme left edge to indicate category.
- **Category Chips:** Small, pill-shaped elements using a 10% opacity background of the category color and 100% opacity text of the same color.
- **Floating Action Button (FAB):** 56x56px circle, primary color (#0D0D0D), centered icon.
- **Bottom Navigation:** Icon-only or Icon+Label (10px) with active states highlighted by the primary color.
- **Input Fields:** Minimalist design with a 1px border that shifts to the primary color on focus.
- **Empty States:** Center-aligned, using muted typography and a simplified icon to encourage the first "Save" action.