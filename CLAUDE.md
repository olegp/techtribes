# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Techtribes is a static site that lists active tech communities and meetups in Finland. The site automatically scrapes community event data from various platforms and displays them. Only communities with events in the past year are included.

The site is a **React Router v8 (framework mode) app** in `remix/`, prerendered to static HTML and deployed to GitHub Pages. It replaced the original Jekyll site as the deployed site. The Jekyll sources (`site/`, `Gemfile`, `.ruby-version`) are kept in the repo for now as a rollback path but are no longer built by CI — see `TODO.md`.

## Key Architecture

- **Site**: `remix/` — React Router v8 in framework mode, `ssr: false` + `prerender`, so every route is rendered to static HTML at build time (loaders run in Node during `react-router build`). Client JS hydrates for small interactive bits (e.g. dark-mode toggle). Built with Tailwind v4, shadcn/ui components, and `lucide-react` icons.
- **TypeScript Scrapers**: Located in `src/scrapers/` for different platforms (Meetup, Meetabit, Luma, JSON). Driven by `src/scrape.ts`.
- **Data Pipeline**:
  - Communities defined in `data/communities.yml`
  - `npm run scrape` (root) fetches event data and writes both `data/output.json` (read by the React Router site) and `site/_data/output.yml` (read by the legacy Jekyll site)
  - `remix/app/lib/data.server.ts` reads `../data/output.json` at build time; this must exist before `npm run build` in `remix/`
- **Legacy Jekyll site**: `site/` (Liquid templates, `_layouts`, `_includes`, `_data`), still kept for rollback. Not built or deployed by CI.

## Development Commands

### Root — data pipeline

```bash
npm install
npm run scrape          # Scrape event data -> data/output.json (+ site/_data/output.yml)
npm run add <url> [tags] # Add a community by URL with optional tags
npm run sort            # Sort communities.yml alphabetically by name
npm run images          # Process community logos
npm run prune           # Remove inactive communities (no events in past year)
```

### `remix/` — the site (run from the `remix/` directory)

```bash
npm install
npm run dev             # Start the React Router dev server
npm run build           # react-router build + scripts/postbuild.ts -> build/client
npm run preview         # Preview the built static site
npm run typecheck       # react-router typegen && tsc
npm run lint            # eslint
npm run test            # vitest run
```

`npm run scrape` (root) must be run at least once before `npm run build` (or `dev`) in `remix/`, since the site reads `data/output.json` produced by the scrapers.

### Legacy Jekyll (kept for rollback only)

```bash
bundle install
npm run scrape
npm start                # jekyll serve --source site --livereload
npm run build            # jekyll build --source site
```

## Scraper Architecture

The scraping system (`src/scrape.ts`) supports multiple event platforms:

- **Meetup.com**: `src/scrapers/meetup.ts`
- **Meetabit.com**: `src/scrapers/meetabit.ts`
- **Luma.ma**: `src/scrapers/luma.ts`
- **JSON endpoints**: `src/scrapers/json.ts`
- **JSON Feed**: `src/scrapers/jsonfeed.ts`

Each scraper extracts:

- Event date and link
- Community member count
- Filters out inactive communities (no events in past year)

## Data Structure

Communities in `data/communities.yml` require:

- `name`: Community name
- `location`: "City, Country" format
- `tags`: Array of technology tags
- `events`: URL to event platform
- `site`: (optional) Community homepage
- `logo`: Logo filename in `site/assets/logos/` or URL

## File Organization

- `data/communities.yml` - Master list of communities
- `data/output.json` - Generated event data consumed by the React Router site (git-ignored, produced by `npm run scrape`)
- `src/` - TypeScript utilities and scrapers
- `site/assets/` - Shared static assets (logos, favicons, social image, favicon.ico); still the source of truth while both sites coexist. `remix/vite.config.ts` copies them into the build. (`site/assets/icons` is Jekyll-only; the React site uses lucide-react.)
- `site/` - Legacy Jekyll site source (kept for rollback; see `TODO.md`)
- `site/_data/output.yml` - Generated event data for the legacy Jekyll site
- `remix/` - The deployed React Router site
  - `remix/app/routes.ts` - Explicit route config (framework mode does NOT auto-discover files in `app/routes/` here; new route files must be added to this list)
  - `remix/app/routes/` - Route modules: `home.tsx` (/), `guide.tsx` (/guide), `feed[.]xml.ts` (resource route, /feed.xml), `sitemap[.]xml.ts` (resource route, /sitemap.xml), `tags.tsx` (/tags index), `tags.$tag.tsx` (/tags/:tag), `locations.tsx` (/locations index), `locations.$country.tsx`, `locations.$country.$city.tsx`, `not-found.tsx` (catch-all, prerendered as /404 and copied to 404.html)
  - `remix/app/components/layout/` - Header, Footer, ThemeToggle
  - `remix/app/components/cards/` - `CommunityCard.tsx`
  - `remix/app/components/events/` - `EventList.tsx`
  - `remix/app/components/pages/` - `FilterPage.tsx` (shared renderer for the tag/location leaf pages)
  - `remix/app/components/ui/` - shadcn/ui primitives (button, badge, card, input, tooltip)
  - `remix/app/lib/` - `types.ts`, `site.ts` (site constants), `events.ts` (date/event helpers), `data.server.ts` (reads `../data/output.json`), `meta.ts` (SEO/meta + count-phrase helpers), `filter.ts` (client-side search/tag filtering), `taxonomy.ts` (tag/location slugs, grouping, URL builders), `sitemap.ts` (sitemap XML builder), `feed.ts` (RSS/Atom feed generation), `prerender-paths.server.ts` (enumerates all tag/location page paths from output.json; shared by the prerender list in `react-router.config.ts` and the sitemap route), `content.server.ts` (loads/renders `content/guide.md`)
  - `remix/app/content/guide.md` - Markdown source for the guide page
  - `remix/app/styles/prose.css` - Prose styling for rendered markdown
  - `remix/scripts/postbuild.ts` - Post-build step: copies `404/index.html` to `404.html`, writes `.nojekyll`, removes stray SPA files
  - `remix/react-router.config.ts` - `ssr: false`, prerendered route list
  - `remix/vite.config.ts` - Tailwind + React Router plugins, static-copy of `site/assets/*` into the build

## Testing

- Scrapers: test files (`.test.ts`) alongside `src/scrapers/`, should be run when modifying scraper logic.
- Site: `remix/` uses vitest (`npm run test` in `remix/`), tests under `remix/test/` and alongside components.
