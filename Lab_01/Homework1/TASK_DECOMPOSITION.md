# TASK_DECOMPOSITION.md — Homework 1: Production Portfolio

## Work Breakdown Structure (defined BEFORE prompting AI)

| Task | Milestone | Contract | Commit message |
|------|-----------|----------|----------------|
| T-01 | M1 | Semantic landmarks only (0 `<div>`), skip-link, exactly one `<h1>`, text contrast >= 4.5:1 | `fix(a11y): contrast & landmarks` |
| T-02 | M2 | Full keyboard flow (Tab/Enter), visible focus ring, no focus trap, theme toggle uses `aria-pressed` | `fix(nav): keyboard trap prevention` |
| T-03 | M3 | Strict CSP meta, zero inline handlers (`onclick=` banned), external CSS/JS only | `feat(security): strict CSP, no inline handlers` |
| T-04 | M4 | Explicit image sizes (zero CLS), no external requests, minimal assets, Lighthouse target 100 | `perf: optimize assets` |

## Contracts
- Stack: vanilla HTML5, modern CSS, ES6+ JS. No jQuery/Bootstrap/Tailwind/CDN scripts.
- Theme persistence: `localStorage` key `theme` (`light` | `dark`).
- All colours via CSS custom properties in `:root`.
- Mobile-first, verified at 375px (no horizontal scroll).

## Verification gates
- M1: Chrome DevTools -> Accessibility -> landmark tree; contrast checker >= 4.5:1.
- M2: Navigate whole page with keyboard only.
- M3: DevTools console shows zero CSP violations.
- M4: Lighthouse (Performance / Accessibility / Best Practices / SEO).
