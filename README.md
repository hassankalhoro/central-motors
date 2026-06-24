# Suzuki Central Motors — Website

Public website for Suzuki Central Motors (Authorised 3S Suzuki Dealer, Rawalpindi).
**Phase 1:** static public site (no database, no admin panel).

## Stack
- **Next.js 14** (App Router) · **TypeScript** (strict) · **Tailwind CSS**
- Fonts via `next/font`: **Space Grotesk** (display) + **Hanken Grotesk** (body)
- Brand tokens (refined from the live site): red `#E11622` · navy `#06245C` · blue `#1E55A8`

## Getting started
```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint |

## Structure
```
src/
  app/         # routes, layout, globals.css
  components/  # UI + site components
  data/        # static typed content (products, team, settings…)
  lib/         # helpers (formatPKR, cn, …)
public/        # images, brochures, static assets
```

## Status
✅ Project base scaffolded (config, fonts, brand tokens, sample landing page).
⬜ Next: data layer, shell (Header/Footer), and pages.
