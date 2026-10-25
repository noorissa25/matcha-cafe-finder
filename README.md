# Matcha & Café Finder

A small full-stack app for keeping track of cafés: log where you went, rate the matcha and the coffee separately, write tasting notes, see everything on a map, and get a ranked, explained answer to "what should I try next?"

**Live demo: https://noorissa25.github.io/matcha-cafe-finder/** (real Boston-area cafés with no ratings yet; anything you add stays in your own browser)

![Café list](docs/screenshots/cafes.jpg)

| "Where to next." carousel | Recommendations | Map |
| --- | --- | --- |
| ![Carousel](docs/screenshots/carousel.jpg) | ![Recommendations](docs/screenshots/recommendations.jpg) | ![Map](docs/screenshots/map.jpg) |

On a phone (iPhone 17 simulator, Safari):

<p>
  <img src="docs/screenshots/phone-cafes.jpg" alt="Café list on a phone" width="200">
  <img src="docs/screenshots/phone-carousel.jpg" alt="Café carousel on a phone" width="200">
  <img src="docs/screenshots/phone-recommendations.jpg" alt="Recommendations on a phone" width="200">
  <img src="docs/screenshots/phone-map.jpg" alt="Map on a phone" width="200">
</p>

> Demo GIF: _coming soon_ (logging a tasting and watching the recommendations change).

The sample data is 10 real cafés in Boston, Cambridge, Somerville and Brookline, including Chinatown. Names, addresses and pins come from OpenStreetMap, and the drinks in each description come from the café's menu listings (checked October 2026; menus change). There are no sample ratings or tasting notes: those are personal, so every café starts as "to try".

## Features

- **Café log**: name, neighborhood, address, description, tags, and whether the café serves matcha, coffee or both. Pick the location by clicking the map.
- **Tastings**: each visit records the drink type (matcha or coffee), what you ordered, a 1–5 rating, notes and the date. Matcha and coffee averages are kept apart, so a great espresso bar with a weak matcha latte reads as exactly that.
- **List and map views**: filter by drink or "not tried yet", sort by best matcha, best coffee or most recent visit. The map uses Leaflet with OpenStreetMap tiles, so it needs no API key.
- **"What should I try next?"**: ranks cafés you have not tried for the chosen drink and says why each one is on the list.
- **Optional AI note**: if `ANTHROPIC_API_KEY` is set, the recommendations page adds a two or three sentence summary of the top picks. Without a key, or if the call fails, the page shows only the built-in reasons.
- **JSON API**: `GET /api/recommendations?focus=matcha|coffee|both&limit=5`.

## How the recommender works

The scoring is plain TypeScript in [`src/lib/recommend`](src/lib/recommend), with no ML library and no database access, so it is easy to read and to test.

1. **Taste profile.** Each tasting becomes a bag of words from the drink name, the notes and the café's tags. Words are weighted by TF-IDF and by `(rating - 3) / 2`, so a 5 pulls the profile toward those words, a 1 pushes it away, and a 3 is neutral.
2. **Candidates.** Cafés you have not tried *for the chosen drink* (a café where you only had coffee is still a matcha candidate), described by their description and tags.
3. **Score.** Cosine similarity between the profile and each candidate, plus a small bounded nudge (±0.15) from how you rated other cafés in the same neighborhood.
4. **Explanation.** The terms that moved the score most in each direction become the reasons, for example *"Shares what you rated highly: whisked to order, ceremonial grade, umami."* Words that belong to a matching tag are folded into it so the reasons do not repeat themselves.

Generic words that every café shares ("matcha", "coffee", "latte", "cafe" and so on) are ignored, so a bad matcha latte does not teach the model to avoid the word "matcha". With no non-neutral ratings yet, it falls back to an alphabetical list and asks for a few ratings.

## Live demo

The demo on GitHub Pages is a static build of the same app. GitHub Pages cannot run a server or a database, so `npm run build:demo` (`NEXT_PUBLIC_DEMO=1`) changes three things:

- **Routes:** Next.js only picks up the `*.demo.tsx` route files. They render the same shared views in [`src/components/views`](src/components/views) but read data from [`src/lib/demo/store.ts`](src/lib/demo/store.ts) instead of Prisma.
- **Data:** the store starts from the same sample cafés as the database seed ([`src/lib/sample-data.ts`](src/lib/sample-data.ts)). Cafés and tastings a visitor adds are validated with the same zod schemas and saved to that browser's `localStorage`. "Reset demo" in the banner clears them.
- **Output:** a plain HTML export under `/matcha-cafe-finder`. A café page is `/cafe?id=…` instead of `/cafes/[id]`, because a static export cannot prerender pages for cafés added later.

The recommender is pure TypeScript, so it runs in the browser unchanged. The demo has no AI note and no JSON API. The [`publish demo`](.github/workflows/pages.yml) workflow rebuilds it and pushes it to the `gh-pages` branch on every push to `main`.

## Architecture

```mermaid
flowchart LR
  subgraph Browser
    UI["React Server Components<br/>+ client islands"]
    Map["Leaflet map<br/>(OpenStreetMap tiles)"]
  end

  subgraph "Next.js (App Router)"
    Pages["Pages<br/>/, /map, /cafes/[id], /recommend"]
    Actions["Server Actions<br/>createCafe, addTasting, deleteTasting"]
    API["Route handler<br/>GET /api/recommendations"]
    Data["Data layer<br/>src/lib/data.ts"]
    Rec["Recommender<br/>src/lib/recommend (pure TS)"]
    LLM["Optional AI note<br/>src/lib/llm.ts"]
  end

  DB[("PostgreSQL<br/>(SQLite for local dev)")]
  Claude["Claude API<br/>(only if ANTHROPIC_API_KEY is set)"]

  UI --> Pages
  UI -- "form posts" --> Actions
  Map --> UI
  Pages --> Data
  API --> Data
  Actions -- "zod validation" --> DB
  Data -- Prisma --> DB
  Data --> Rec
  Pages --> LLM
  LLM -.-> Claude
```

## Tech stack and decisions

| Area | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript | Server Components read the database directly; Server Actions handle forms without a separate API layer. Cache Components is on, so every page ships a static shell and streams its data inside `<Suspense>`. |
| Database | PostgreSQL via Prisma | Typed queries and one schema file. The schema avoids enums, arrays and JSON columns so the same file also runs on SQLite. |
| Local dev DB | SQLite (generated from the Postgres schema) | Clone and run with no database server. [`scripts/db.mjs`](scripts/db.mjs) swaps the provider when `DATABASE_URL` starts with `file:`. |
| Validation | zod | One schema per form, shared by the Server Actions and the tests. |
| Map | Leaflet + react-leaflet, OpenStreetMap tiles | Free and keyless. The map module is lazy-loaded on the client because Leaflet needs `window`. |
| Recommender | Hand-written TF-IDF + cosine similarity | Small data, and every score has to be explainable. A heavier model would be harder to justify to the person using it. |
| AI note | Anthropic TypeScript SDK, behind an env var | Additive only: the ranking never depends on it, and any error falls back to the built-in reasons. |
| Styling | Tailwind CSS v4 | Theme tokens as CSS variables, with a dark mode. |
| Tests | Vitest | Fast unit tests for the recommender and validation. |
| CI | GitHub Actions | Lint, typecheck and tests, then schema push, seed and a production build against a real PostgreSQL service. A second workflow publishes the static demo to GitHub Pages. |

## Running locally

Requires Node.js 20.9 or newer.

```bash
git clone <this repo> matcha-cafe-finder
cd matcha-cafe-finder
cp .env.example .env        # defaults to a local SQLite file
npm install
npm run db:setup            # create tables and load the sample cafés
npm run dev                 # http://localhost:3000
```

Or all of the above in one go (it keeps an existing `.env` and replaces the data with the sample cafés):

```bash
npm run preview             # http://localhost:3100
```

### Using PostgreSQL instead

```bash
docker compose up -d        # or use any PostgreSQL 14+ you already have
```

Then set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/matcha_cafe_finder"` in `.env` and run `npm run db:setup` again. Re-run `npm run db:generate` whenever you switch between SQLite and PostgreSQL, since the Prisma client is generated per provider.

### Optional AI note

```bash
# .env
ANTHROPIC_API_KEY="sk-ant-..."
# ANTHROPIC_MODEL="claude-opus-5-5"   # optional override
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run preview` | First-run helper: create `.env` if missing, install, set up the database, start dev on port 3100 |
| `npm run build` / `npm start` | Production build and server |
| `npm run dev:demo` | Run the static demo variant in dev mode (port 3101) |
| `npm run build:demo` | Build the static GitHub Pages demo into `out/` |
| `npm run preview:demo` | Build the demo and serve it at http://localhost:3102/matcha-cafe-finder/ |
| `npm test` | Run the Vitest suite |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit` |
| `npm run db:push` | Create or update tables for the current `DATABASE_URL` |
| `npm run db:seed` | Replace all data with the sample cafés |
| `npm run db:setup` | `db:push` then `db:seed` |

## Project structure

```
prisma/
  schema.prisma        PostgreSQL schema (SQLite copy is generated)
  seed.ts              loads the sample cafés
scripts/db.mjs         runs Prisma against the right provider
scripts/serve-demo.mjs serves the static demo locally under /matcha-cafe-finder
src/
  app/                 routes: /, /map, /cafes/new, /cafes/[id], /recommend, /api/recommendations
                       (*.demo.tsx files are the static demo's routes)
  components/          cards, forms, rating chips, Leaflet map
    views/             page UI shared by the full app and the demo
  lib/
    recommend/         scoring, text utilities and their tests
    demo/              browser-only data store for the static demo
    sample-data.ts     real cafés used by the seed and the demo
    cafes.ts           café summaries and sorting (no database access)
    actions.ts         Server Actions
    data.ts            database reads
    validation.ts      zod schemas
    llm.ts             optional AI note
```

## Limitations and next steps

- Single user, no accounts. The Server Actions have no auth check, so add authentication before deploying the full app publicly. (The GitHub Pages demo has no server, so each visitor only changes their own browser's copy.)
- Locations are entered by clicking the map or typing coordinates; there is no address search (geocoding) yet.
- No photo uploads.
- The recommender only knows what you write. Short notes like "good" give it little to work with.

## License

MIT. See [LICENSE](LICENSE).
