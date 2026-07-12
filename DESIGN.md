---
name: Cinematic Logistics
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffffff'
  on-tertiary: '#2f3132'
  tertiary-container: '#e3e2e3'
  on-tertiary-container: '#636465'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#e3e2e3'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-lowest: '#0e0e0e'
  surface-low: '#1c1b1b'
  accent-glow: rgba(0, 240, 255, 0.3)
  glass-border: rgba(255, 255, 255, 0.1)
  glass-bg: rgba(255, 255, 255, 0.02)
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 104px
    fontWeight: '900'
    lineHeight: '0.95'
    letterSpacing: -0.05em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 60px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '0.95'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.4em
  label-sm:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.2em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-padding: 160px
  container-max: 1440px
---

## Brand & Style

The brand identity is "Cinematic Asset Intelligence"—a high-fidelity, futuristic aesthetic that blends deep industrial utility with the visual polish of a high-end sci-fi film. It targets global enterprise leaders who require precision, power, and absolute clarity.

The design style is a sophisticated hybrid of **Glassmorphism** and **Minimalism**, set against a dark, atmospheric backdrop. It utilizes ultra-thin borders, frosted translucent panels, and vibrant "data-glow" accents (Cyan) to suggest high-tech orchestration. Visual interest is driven by high-contrast typography and subtle procedural textures (grain/noise) rather than heavy decorative elements.

## Colors

The palette is rooted in a "Deep Space" monochrome foundation to ensure the content feels premium and focused. 

- **Primary (White):** Reserved for high-impact headlines and primary action buttons to ensure maximum legibility and "pop" against dark backgrounds.
- **Secondary (Accent Cyan):** Used as a functional color for status indicators, small labels, icons, and interactive hover states. It represents "active data" and intelligence.
- **Tertiary (Muted Silver):** Used for secondary text and structural lines to maintain hierarchy without competing with the primary content.
- **Neutral (Black/Charcoal):** Tiered neutral shades define the physical structure of the interface, using subtle shifts in value to indicate depth.

## Typography

Typography is the primary driver of the "Cinematic" feel. 
- **Headlines:** Use **Inter** with extreme weights (Extra Bold to Black) and tight tracking. The use of italics for specific emphasis within headlines adds a sophisticated, editorial touch.
- **Labels:** Use **Geist** for its technical, monospaced characteristics. These are always uppercase with generous letter-spacing to evoke a "instrument panel" feel.
- **Body:** Standard **Inter** is used for readability. Line heights are kept generous (1.6) to provide breathing room in an otherwise dense, dark aesthetic.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy within a centered `1440px` container. 
- **Symmetry:** Content is often either perfectly centered for impact (Hero, Stats) or split into a clean 2-column "Feature" grid.
- **Verticality:** Massive vertical padding (`160px`) is used between sections to enforce a premium, unhurried pace of information consumption.
- **Mobile Adaptivity:** On mobile, margins shrink to `20px`, and 2-column grids collapse into a single-column stacked layout. Large display type scales down aggressively to maintain the "one-screen" visual impact without breaking the container.

## Elevation & Depth

Depth is handled through **Glassmorphism** and **Atmospheric Layering** rather than traditional drop shadows.
- **Panels:** Use a very low opacity white background (`rgba(255, 255, 255, 0.02)`) paired with a high-intensity backdrop blur (`24px`).
- **Borders:** Surfaces are defined by 1px solid borders in low-opacity white (`0.08` to `0.1`). 
- **Z-Index Strategy:** The background consists of a "noise" grain layer and a 3D shader. Elements "float" above this using glass panels.
- **Shadows:** When used (e.g., in the header), shadows are extremely large and soft (2xl), functioning more like an ambient occlusion glow than a crisp shadow.

## Shapes

The shape language is defined by "Stadium" and "Hyper-Rounded" geometries. 
- **Pill Shapes:** Buttons, headers, and small badges use a full `rounded-full` radius.
- **Containers:** Large cards and feature panels use a very large radius (up to `2.5rem` or `40px`) to soften the high-tech aesthetic and make it feel approachable.
- **Interactive Elements:** Maintain the pill-shape for almost all interactive triggers, creating a distinct "capsule" visual language.

## Components

- **Buttons:** 
  - *Primary:* Pill-shaped, solid white background, black text (Extra Bold). High-contrast hover effect using Accent Cyan.
  - *Ghost/Glass:* Pill-shaped, transparent background with 1px white/20 border and backdrop blur.
- **Chips (Badges):** Small, pill-shaped glass panels with a pulsing Accent Cyan dot and Geist label text.
- **Cards:** Large-radius glass panels. Content inside should have generous internal padding (`p-10` to `p-20`).
- **Feature Blocks:** A mix of high-contrast imagery (with 70% opacity to blend with the background) and bold typography. Images should have a "nested" corner radius slightly smaller than the parent container.
- **Navigation:** A floating, blurred capsule that sits at the top of the screen, detached from the edges, reinforcing the "floating in space" concept.