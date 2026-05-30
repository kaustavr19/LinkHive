# LinkHive

An offline-first link-saving PWA. Paste a URL, and LinkHive saves it instantly, auto-assigns a category bucket, derives a readable name, and makes it searchable across name, source, category, and tags. Retrieval is the product's first job — everything is local, works offline, and needs no account.

## Highlights

- **Instant, optimistic save** — write first, categorize synchronously, then refine the title in the background.
- **Rule-based categorizer** — pure, offline, no LLM. One editable rule table maps domains to buckets: `jobs · socials · videos · articles · uncategorized`.
- **Accurate naming, three tiers** — (1) smart offline URL heuristics, (2) real-title capture from pasted rich text, (3) graceful online oEmbed upgrade (YouTube/Vimeo) — degrading cleanly when offline.
- **Fast offline search** — every record carries a precomputed lowercase `searchBlob` (name + source + url + category + tags), so search is a single substring scan.
- **Jobs pipeline** — job links track an application status (Applied / Not Applied / Rejected): tap-to-cycle on mobile, direct-select on desktop.
- **Pinned-first** — pinned links float to the top of every browse and search view.
- **Installable PWA** — manifest + service worker, fully usable offline. Web Share Target is scaffolded (commented) for a future release.
- **Responsive + theming** — one codebase: mobile (bottom nav + chips + FAB) and desktop (sidebar + top search + masonry). Light/dark follows the system, with a manual toggle that then wins.

## Tech stack

React + Vite + TypeScript · Tailwind CSS (centralized category/theme tokens) · IndexedDB via `idb` · Zustand · React Router · `vite-plugin-pwa` · Vitest.

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm test           # run the categorizer unit tests
npm run build       # type-check + production build
npm run preview     # preview the production build
```

## Project structure

```
src/
  types/        Link model, Category / JobStatus, status-cycle helpers
  lib/          categorize · metadata (oEmbed) · db (IndexedDB) · search · format
  store/        Zustand stores (links, UI)
  theme/        category color map · theme controller
  components/   layout, cards, filters, shared UI
  screens/      Home (All / category / pinned) · Search · Empty state
```

## Key design decisions

- **Categories vs. tags are separate.** `category` is the single auto-assigned bucket that drives navigation. `tags: string[]` is carried in the data model and indexed into search from day one, but its editor UI is deferred (stubbed) — avoiding a later IndexedDB migration.
- **The save flow is a three-stage seam** (`saveRaw` → `categorizeRecord` → `enrich`). `enrich` is the async metadata step; today it fetches oEmbed titles, and it's where a share-sheet payload or metadata proxy will plug in later — no refactor of the save path required.
- **Theme precedence is explicit:** a stored manual choice always wins and stops following the system; the system preference is used only until the user chooses.

## Deployment

Static SPA — `npm run build` emits `dist/`, deployable to any static host (Vercel, Netlify, GitHub Pages, etc.). Configure the host to serve `index.html` for unknown routes (SPA fallback) so client-side routing works.
