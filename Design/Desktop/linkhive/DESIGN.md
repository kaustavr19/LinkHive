---
name: LinkHive
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
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
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
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
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 240px
  container_max_width: 1440px
  gutter: 24px
  margin: 32px
  card_padding: 16px
  stack_gap: 12px
---

## Brand & Style
The design system focuses on cognitive clarity and efficiency. It serves users who manage high volumes of digital information and require a tool that "recedes" into the background, allowing content to remain the primary focus. 

The style is **Refined Minimalism**. It avoids decorative flourishes in favor of precision, utilizing generous whitespace to prevent visual fatigue. The interface is task-focused and retrieval-first, prioritizing searchability and categorization through a structured, architectural layout. The aesthetic is clean and professional, evoking a sense of organized calm.

## Colors
The palette is built on a foundation of neutral tones to ensure the UI feels "light" despite dense information. 

**Light Mode:**
- **Canvas:** #F9F9F9 (Off-white) provides a soft base that reduces eye strain.
- **Surface:** #FFFFFF (Pure White) for cards and primary containers.
- **Sidebar:** #F0F0F0 (Soft Grey) creates a subtle structural distinction.

**Dark Mode:**
- **Canvas:** #0D0D0D (Near-black) for depth.
- **Surface:** #1A1A1A (Elevated dark-grey) for card elements.

**Functional Accents:**
Accents are used strictly for categorization and status. Use high-chroma variants for tags and low-opacity tints (10-15%) for subtle background washes on cards or hover states to maintain the minimal aesthetic without overwhelming the user.

## Typography
Inter is used exclusively to maintain a utilitarian, systematic feel. The hierarchy relies on weight and subtle size shifts rather than drastic scale changes.

- **Display Hero:** Reserved for the search bar input and main section headers.
- **Card Titles:** Use `body-medium` or `headline-md` depending on card density to ensure readability.
- **Metadata:** Source info and timestamps use `label-sm` and `label-xs` respectively, with a muted color (60% opacity) to create clear information layering.

## Layout & Spacing
The layout follows a disciplined desktop-first structure.

- **Sidebar:** Fixed at 240px. It contains navigation and category filters.
- **Top Search Bar:** Acts as the "Hero Action." It should be centered or spans the width of the main content area with significant top margin (48px-64px) to emphasize its importance.
- **Main Feed:** A multi-column masonry layout that adapts based on the viewport width. Use a 24px gutter to maintain a clean "breathing" space between saved items.
- **Rhythm:** Use an 8px base grid for all internal element padding.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Subtle Ambient Shadows**.

- **Level 0 (Canvas):** The base background layer (#F9F9F9 / #0D0D0D).
- **Level 1 (Cards):** White surfaces in light mode. Shadows should be highly diffused: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Level 2 (Hover/Active):** When a card is focused or hovered, the shadow intensifies slightly `0px 8px 30px rgba(0, 0, 0, 0.08)` and the border-color matches the category accent at 20% opacity.
- **Glassmorphism:** Reserved only for the top search bar when scrolling, using a 12px backdrop blur to maintain context of the content underneath.

## Shapes
The shape language is "Soft" (0.25rem - 0.75rem). This provides a professional but approachable feel.

- **Cards:** Use `rounded-lg` (0.5rem / 8px).
- **Search Bar:** Use `rounded-xl` (0.75rem / 12px) to distinguish it from the content cards.
- **Tags & Status Markers:** Use `rounded-full` (pill-shaped) for category chips to create a distinct shape contrast against the rectangular cards.

## Components

### Sidebar
- **Style:** Flat background (#F0F0F0).
- **Interaction:** Active states use a subtle left-aligned vertical bar (4px) in the primary color and a weight change in the text.

### Top Search Bar
- **Style:** Large, floating input. 
- **Typography:** Uses `display-hero`.
- **Visual:** Minimal border; focus state uses a 2px primary color ring with soft glow.

### Masonry Cards
- **Structure:** 
  1. **Category Tag:** Small pill at the top-left (e.g., "Articles"). Color-coded by category.
  2. **Title:** `body-medium` or `headline-md`. Max 3 lines before truncation.
  3. **Source:** `label-sm` muted text (e.g., "youtube.com").
  4. **Timestamp:** `label-xs` at the bottom-right or adjacent to source.
- **Job Cards:** Include a status marker at the top-right (e.g., "Applied"). This status uses a filled pill with white text for high visibility.

### Chips & Tags
- **Category Tags:** Low-opacity background of the accent color with high-opacity text of the same hue.
- **Interaction:** Clickable for quick filtering.

### Input Fields
- **Style:** Minimalist. No heavy borders; use a light grey bottom stroke or a very subtle 1px border. Focus shifts the stroke to the primary color.