# Ceres Kersiefees 2026

One-page festival website built from the Figma design
([Kersiefees Landing page v3](https://www.figma.com/design/KCKgf8UXh9vOE2UcxLSVzA/Kersiefees-2026?node-id=238-3)).

## Stack

- **Astro** (static-first) with **Vite**
- **React** islands only where interactivity is needed (`client:visible`)
- **Tailwind CSS v4** (design tokens in `src/styles/global.css` via `@theme`)
- **Base UI** (`@base-ui/react`) for accessible primitives (accordion, select)
- **GSAP + ScrollTrigger** for animations, **Lenis** for smooth scrolling
- **TypeScript** throughout

## Google Map

The "Hoe om daar te kom" section renders a live Google Map themed to the site
palette. Copy `.env.example` to `.env` and set `PUBLIC_GOOGLE_MAPS_API_KEY`;
without a key the section falls back to the static map image from the design.

## Commands

| Command           | Action                        |
| ----------------- | ----------------------------- |
| `npm run dev`     | Dev server at localhost:4321+ |
| `npm run build`   | Production build to `dist/`   |
| `npm run preview` | Preview the production build  |
| `npx astro check` | Type-check the project        |

Tip: append `?noanim` to the URL to disable all GSAP animations
(useful for visual regression testing; also honours `prefers-reduced-motion`).

## Architecture

```text
src/
├── assets/figma/          # assets exported from the Figma file
├── components/
│   ├── ui/                # shared foundations
│   │   ├── Section.astro  #   base section: bg variants + vertical rhythm
│   │   ├── Container.astro#   the one standard content width (1464px)
│   │   ├── Button.astro   #   pill button (red/white, arrow circle)
│   │   ├── TicketCard.astro#  scalloped ticket (SVG mask, red/white)
│   │   └── Logo.astro
│   ├── react/             # interactive islands (React + Base UI)
│   │   ├── PhotoCarousel.tsx
│   │   ├── HighlightsCarousel.tsx
│   │   ├── VendorSlideshow.tsx
│   │   ├── FaqAccordion.tsx      # Base UI Accordion
│   │   └── ContactForm.tsx       # Base UI Select
│   ├── sections/          # page sections composing the foundations
│   └── NavBar.astro
├── layouts/Layout.astro   # fonts, global css, animation bootstrap
├── scripts/animations.ts  # all GSAP logic (reveals, floats, marquees…)
├── styles/global.css      # Tailwind theme tokens + shared patterns
└── pages/index.astro      # section composition
```

### Breakpoints (desktop-first)

Unprefixed utilities style the **desktop** layout; variants override from that
device size *down* (portrait beats landscape beats tablet):

| Variant      | Applies at |
| ------------ | ---------- |
| *(none)*     | desktop, > 1280px |
| `tablet:`    | ≤ 1280px |
| `landscape:` | ≤ 768px (phones landscape / small tablets) |
| `portrait:`  | ≤ 480px (phones portrait) |

Example: `h-118 tablet:h-80 landscape:h-64 portrait:h-56`.

### Conventions

- **Design tokens** live in `global.css` under `@theme`: colors (`cherry`,
  `cherry-dark`, `cherry-deep`, `blossom`, `cream`, `green-*`), typography
  (`text-h1/h2/h3/lead/body-lg/body/button` with size, line-height, weight and
  tracking baked in), spacing (`section`, `section-sm`), content widths
  (`max-w-copy/content/wide/nav/hero`), radii (`blob`, `tile`) and shadows
  (`shadow-cherry`, `shadow-cherry-soft`, `shadow-pop`, `drop-shadow-cherry`).
- **No raw pixel values** in utility classes: spacing/sizing uses the standard
  4px scale (odd Figma values are snapped to the nearest step), and named
  tokens cover everything larger.
- **Animations** are opt-in via data attributes handled centrally in
  `animations.ts`: `data-reveal` (scroll fade-up), `data-float` (drifting
  leaves/cherries), `data-marquee` (infinite ticker), `data-ticket`
  (wobble-in), `data-hero-art`.
- New sections compose `<Section>` (background + vertical rhythm) and place
  their own `<Container>` explicitly — Section never wraps content itself.
  Full-bleed elements (marquees, hero art, decor) sit outside the Container.
