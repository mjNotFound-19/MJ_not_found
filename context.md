# Manas Portfolio – Data Science Motion Site

## Overview
Single-page React/Vite portfolio that spotlights Caterpillar forecasting (SARIMAX + TimesFM), Purdue research, AVOLTA security automation, and motorsport analytics. TailwindCSS handles the visual system, while Framer Motion + custom overlays (parallax hero, staggered reveals, magnetic CTAs, matrix rain) keep the cinematic feel. Scroll smoothing now relies on native CSS so trackpads behave exactly like the OS, and the floating cursor renders via a portal so it always sits above content. Content is resume-aligned and driven by structured config objects.

## Core Architecture
- `src/App.jsx` – reduced-motion + theme toggles (theme switching via system prefernce/localStorage only), CSS smooth-scroll fallback, section layout, and global overlays (MatrixRain, SpotlightCursor, AmbientBackground, ScrollProgress).
- `src/lib/motion.js` – shared easing tokens (WAAPI-safe), fade/float/stagger variants, hover presets, and image reveal settings.
- `src/hooks/useMagnetic.js` – cursor-follow motion hook for CTA buttons/icons.
- `src/components/motion/*` – reusable motion primitives (`PageTransition`, `RevealText`, `CinematicImage`, `AmbientBackground`).

## Content Model
`src/config/content.js` owns all editable copy: `CONTACT`, `HERO` (badges/stats/spotlight roles), `ABOUT_FEATURES`, `EXPERIENCE`, `PROJECTS`, `SKILLS`, `CERTIFICATIONS`. Update these objects to change text or add entries without touching component logic. Projects include optional `mediaPanel` flags and CTA metadata (external vs internal links); contact data is icon-only (no phone number stored or rendered).

## Key Sections
- `Nav` (no theme toggle), `Hero`, `About`, `Projects`, `SkillList`, `Experience`, `Certifications`, `ContactIcons` (icon buttons only), `Footer`, plus system components (`MatrixRain`, `SpotlightCursor`, `ImmersiveBeams`, `ScrollProgress`).
- Hero uses Framer `useScroll` parallax to animate layered gradients and a spotlight card that filters to active roles (Caterpillar + Purdue FLL). Stats highlight SARIMAX + TimesFM loops, Grafana monitoring, and Flat Out F1, and the intro headline emphasizes “Manas Jha” in Matrix blue.
- About replaces older “research lab” copy with resume-focused highlights (Caterpillar forecasting, infrastructure analytics, Purdue mentorship).
- Experience cards are darker/less transparent, and projects dynamically render stack chips, highlights, CTA targets, and optional media/metrics panels (BASF now references time-series models rather than XGBoost).

## Styling & Motion Tokens
- `tailwind.config.js` defines the palette, font stack, shadows, and custom keyframes (`ambient-drift`, `orb-pulse`, `shimmer`).
- `src/index.css` contains global gradients, glass panels, nav states, experience timeline styles, scrollbar theming, and icon/button treatments.
- `src/SpotlightCursor.jsx` renders via a portal above all content and disables itself on touch-only devices; `MatrixRain.jsx` ignores pointer events for trackpad friendliness.

## Commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Extending
1. Use motion helpers from `src/lib/motion.js` for new animations to keep easing consistent.
2. Add content through config objects, then consume via existing section components (or compose new sections with `Section.jsx`, `RevealText`, magnetic hooks, etc.).
3. Place new media in `public/assets` and reference by absolute path; `CinematicImage` already handles lazy loading.
4. Respect the `showMotion` flag (derived from `prefers-reduced-motion`) for any new animated interactions, and keep the contact surface limited to icons unless you intentionally reintroduce text.

With this structure, future contributors can refresh resume details, add projects, or tweak motion accents without re-learning the whole codebase. For deeper dives, inspect the components listed above alongside the content schema.
