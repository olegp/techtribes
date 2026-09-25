# Tag & Location Pages — Implementation Plan (grounded, RR v8)

Implements issue #37 as scoped in [separate-pages.md](separate-pages.md) (tag pages and
hierarchical location pages; no combined tag×location pages). This document supersedes the
code samples in separate-pages.md wherever they conflict with reality — that doc was written
before the Remix rewrite landed and assumes APIs that don't exist here.

## How this differs from docs/separate-pages.md

| separate-pages.md assumed | Reality in `remix/` | Consequence |
|---|---|---|
| `getCommunities()` from `data.server.ts` | Only `getScrapeOutput()` → `{ events: CommunityEvent[] }` — community + its event are already merged | All filtering operates on `CommunityEvent[]`; a "community page" is an event-list page, same as home |
| Remix v2: `json()`, `@remix-run/node`, `MetaFunction` | React Router v8 framework mode, plain loader returns, types from `./+types/<route>` | Use `Route.LoaderArgs` / `Route.MetaArgs`, `shouldRevalidate() { return false }` like `home.tsx` |
| Static generation via `scripts/generate-static-routes.ts` + `remix-serve` | `ssr: false` + `prerender` in `react-router.config.ts`; **prerender accepts an async function returning paths** (verified in `@react-router/dev` config types) | Enumerate slugs directly in the prerender hook; no extra build step, no server |
| 404 via `throw new Response(..., { status: 404 })` | RR refuses to prerender non-200 responses; GitHub Pages serves `404.html` for unknown URLs anyway | Loaders never throw for unknown slugs; only valid slugs are prerendered, everything else falls through to `404.html` |
| Date helpers reimplemented per-route (`parseDate`) | `app/lib/events.ts` has `splitEvents()`, `eventIsoDate()`, timezone-correct `todayIso()` | Reuse them; no new date code |
| Domain `techtribes.fi` | `SITE_URL = "https://www.techtrib.es"` (`app/lib/site.ts`) | Sitemap/canonicals use `SITE_URL` |
| `pageMeta` hand-built per route in meta export | `app/lib/meta.ts#pageMeta()` builds the full head incl. canonical + JSON-LD graph | Filter pages call `pageMeta()` with their own path/description/graph node |
| Caching layer (TTL map / Redis / CDN) | Everything is computed at build time on ~46 events | No caching whatsoever; delete that concern |

## URL structure

```
/tags                             index: links to every tag page
/tags/:tag                        e.g. /tags/javascript
/locations                        index: countries with their cities
/locations/:country               e.g. /locations/finland
/locations/:country/:city         e.g. /locations/finland/helsinki
/sitemap.xml                      new resource route
```

Slugs: lowercase, non-alphanumerics → `-`, trimmed (`slugify("Data Science") === "data-science"`).
Tag matching is case-insensitive (same rule as the existing `normaliseTag` in `filter.ts`),
so "JavaScript" and "javascript" collapse onto one page; the first-seen casing wins for display,
mirroring what `collectTags()` already does.

Current data shape (from `data/output.json`, 46 events): locations are exactly
`Helsinki/Turku/Tampere, Finland`; ~40 distinct tags. Expected page count ≈ 45–50 — trivially cheap to prerender.

## Data source decision

Everything derives from `getScrapeOutput().events`. Note this means tag/location pages list
**active** communities only (had an event in the past year) — consistent with the homepage and
the project's stated policy. `data/communities.yml` is *not* read by the site and won't be.

## New shared module: `app/lib/taxonomy.ts`

Pure functions, no React/Node APIs — unit-testable like `filter.ts`:

```ts
export function slugify(s: string): string;
export interface ParsedLocation { city: string; country: string }
export function parseLocation(location: string): ParsedLocation | undefined; // undefined if no ", "

// Canonical display name per slug (first-seen casing wins), like collectTags()
export function collectTags(events): { tag: string; slug: string; count: number }[];   // count desc
export function collectLocations(events): {
  country: string; slug: string; count: number;
  cities: { city: string; slug: string; count: number }[];
}[];

export function filterByTag(events, tagSlug): CommunityEvent[];
export function filterByLocation(events, countrySlug, citySlug?): CommunityEvent[];
```

`collectTags` can reuse/wrap the existing `collectTags` in `filter.ts` (add slug output there or
map over it — prefer extending `filter.ts`'s return type to avoid two competing implementations).

URL builders live next to them (or in the same file):

```ts
export const tagUrl = (slug: string) => `/tags/${slug}`;
export const locationUrl = (countrySlug: string, citySlug?: string) =>
  citySlug ? `/locations/${countrySlug}/${citySlug}` : `/locations/${countrySlug}`;
```

## Routes

Five page routes plus one resource route. The three leaf routes share so much (loader shape,
header, related filters, upcoming/past sections) that the rendering lives in one component:

```
app/routes/tags.tsx                       index: pill links to every tag page w/ counts
app/routes/tags.$tag.tsx                  loader only (~30 lines)
app/routes/locations.tsx                  index: countries with nested city links
app/routes/locations.$country.tsx
app/routes/locations.$country.$city.tsx
app/routes/sitemap[.]xml.ts               resource route, mirrors feed[.]xml.ts

app/components/pages/FilterPage.tsx   shared renderer for the leaf pages:
  - breadcrumb ("← Back to all communities"; on city pages also the country link;
    on all filter pages a small "Browse by tag / by location" pair linking the indexes)
  - h1 + muted stats line ("4 communities · 12 upcoming events")
  - related filters (cities on tag pages; tags on location pages) as pill links w/ counts
  - <EventList upcoming past>  ← reused wholesale, including search/tag client filter
```

Reusing `EventList` gives every filter page the full search + tag-toggling progressive
enhancement for free, and keeps the "prerendered HTML contains everything, JS only narrows"
model intact. The plan's bespoke Upcoming/Past sections and `FilterStats` card grid are dropped —
counts go in the stats line instead of a dashboard grid.

The index routes don't render `EventList`: header plus the pill/link lists from
`collectTags()` / `collectLocations()`. Titles: "Browse by tag" / "Tech communities by location".

### Loader pattern (identical shape in all three routes)

```ts
import type { Route } from "./+types/tags.$tag";

export async function loader({ params }: Route.LoaderArgs) {
  const { events } = await getScrapeOutput();
  const filtered = filterByTag(events, params.tag);        // or filterByLocation(...)
  // Unknown slug: don't throw (can't prerender 404s). Render the not-found layout at 200;
  // invalid URLs aren't prerendered anyway, so GH Pages serves 404.html for them.
  const { upcoming, past } = splitEvents(filtered);
  return {
    found: filtered.length > 0,
    param: params.tag,
    upcoming, past,
    totalCommunities: filtered.length,
    relatedTags: ...,      // collectTags(filtered), minus current
    relatedCities: ...,    // collectLocations(filtered) — tag pages
    relatedCountryTags: ...// location pages
  };
}

export function shouldRevalidate() { return false; }

export function meta({ loaderData }: Route.MetaArgs) {
  return pageMeta({
    title: `JavaScript communities & meetups in Finland | Techtribes`,
    description: `${n} active JavaScript tech communities in Finland with ${m} upcoming events.`,
    path: `/tags/${slug}`,
    graph: [collectionPageNode(...)],  // small helper added to meta.ts (schema.org CollectionPage + ItemList)
  });
}
```

Display names: the loader resolves the *canonical* display spelling (e.g. `/tags/js` never exists
because only real slugs are prerendered; `/tags/javascript` shows "JavaScript"). For locations,
resolve city/country display names from the matched communities rather than de-slugging the URL.

### Prerender enumeration

`react-router.config.ts` becomes async:

```ts
export default {
  ssr: false,
  prerender: async () => [
    "/", "/guide", "/404", "/feed.xml", "/sitemap.xml",
    "/tags", "/locations",
    ...(await getPrerenderPaths()),   // tag + country/city slugs, from app/lib/taxonomy-paths.server.ts
  ],
};
```

The paths helper reads `data/output.json` (same path resolution as `data.server.ts`: run from
`remix/`). If importing TS app code from the config proves awkward, the helper duplicates only
`slugify` + two reduce loops — acceptable, but prefer the import.

### Sitemap resource route

`app/routes/sitemap[.]xml.ts`, modelled on `feed[.]xml.ts`: loader returns `new Response(xml,
{ headers: { "Content-Type": "application/xml" } })`; XML built in a pure
`app/lib/sitemap.ts` (testable, like `feed.ts`). Includes `/`, `/guide`, the `/tags` and
`/locations` indexes (priority 0.8), all tag pages (0.7), country (0.7) and city (0.6) pages,
`<lastmod>` from `output.json.updated`.
Add `<link rel="sitemap">`? Not standard — skip. Keep feed's `<link rel="alternate">` as-is.

## Making tags & locations clickable

**Decision: tag pills on cards become links everywhere**, including the homepage. Rationale:
issue goal is "clickable throughout the site"; having pills toggle a hidden filter on one page
and navigate on others is inconsistent, and the quick-filter row at the top of `EventList`
already provides toggling. Changes:

- `CommunityCard.tsx`
  - Remove `activeTags`/`onTagClick` props and the button branch; tags render as
    `<Link to={tagUrl(slugify(tag))}><Badge …>{tag}</Badge></Link>` always.
  - Location text becomes `<Link to={locationUrl(country, city)}>` when `parseLocation()`
    returns a value (falls back to plain text otherwise).
  - `EventList.tsx`: drop the props it passes through; keep the top pill row as toggles.
- Tests referencing `onTagClick`/`activeTags` updated accordingly.

No changes to Header/Footer navigation; cross-navigation between filter pages happens via the
"Browse by tag / by location" pair in `FilterPage` and the index pages.

## SEO

Every page gets the full `pageMeta()` head (canonical, OG, Twitter, RSS alternate) with
**page-specific titles and descriptions** (confirmed requirement):

```html
<meta property="og:title" content="Tech communities in Turku"/>
<meta property="og:description" content="Discover 4 active tech communities and meetups in Turku, Finland with 1 upcoming event."/>
```

| Page | og:title | description place |
|---|---|---|
| `/tags/:tag` | `{Tag} communities in Finland` | Finland |
| `/locations/:country` | `Tech communities in {Country}` | {Country} |
| `/locations/:country/:city` | `Tech communities in {City}` | {City}, {Country} |
| `/tags`, `/locations` | `Browse by tag` / `Tech communities by location` | directory-style blurb |

Description grammar (singular/plural; trailing clause omitted when there are no upcoming
events):

```
Discover {n} active tech communit{n === 1 ? "y" : "ies"} and meetup{n === 1 ? "" : "s"}
in {place}[ with {u} upcoming event{u === 1 ? "" : "s"}].
```

Implement as small pure helpers (e.g. exported from `meta.ts` or a `countPhrases.ts`) with unit
tests covering 0/1/2 for both n and u. `<title>` is the og:title plus the site suffix
(`… | Techtribes`) via `pageMeta()`. Additionally:

- New `collectionPageGraph()` helper in `meta.ts` emits a `CollectionPage` JSON-LD node merged
  into the page's `@graph` (same mechanism as `eventListNodes`).
- `sitemap.xml` covers discovery of all filter pages, indexes included.

## Testing

Follow existing conventions (vitest, colocated `*.test.ts`, tests in `remix/test/`):

1. `taxonomy.test.ts` — slugify edge cases (spaces, punctuation, unicode-lite), parseLocation
   malformed input, collectTags casing/count ordering, filterByLocation country+city.
2. `sitemap.test.ts` — XML well-formedness, URL set (incl. `/tags`, `/locations`) matches
   expectations on fixture data.
3. Description/title helper tests — singular/plural, zero-upcoming omission.
4. Component test for `FilterPage` (found/not-found branches, breadcrumb links) mirroring
   existing component tests.
5. Update `CommunityCard`/`EventList` tests for the link change.

Manual verification checklist (same rigour as the rewrite):
- `npm run typecheck && npm run lint && npm test && npm run build`
- Build output contains `tags/*/index.html`, `locations/**/index.html`, `sitemap.xml`;
  spot-check counts against `data/output.json`.
- `vite preview` + headless Chromium: navigate home → tag pill → tag page → city link → back;
  search still works on filter pages; no hydration errors; dark mode unaffected.
- Validate sitemap.xml and one page's JSON-LD.

## Implementation notes (August 2026)

Implemented on top of the plan above. Where reality differed, this is what happened:

- **Routes are explicit.** This project defines its routes in `remix/app/routes.ts`; files in
  `app/routes/` are NOT auto-discovered. Forgetting to register them there silently produces a
  build without the new pages (typegen only generates `+types` for registered routes — that's
  how you notice). All five page routes plus `sitemap.xml` are now registered.
- **Trailing-slash canonicals.** Every page is a directory-style `index.html`, so static hosts
  (GitHub Pages, `python -m http.server`) redirect `/tags/java` → `/tags/java/` before serving.
  Canonical/OG URLs and sitemap `<loc>` entries therefore use `canonicalPath()` (trailing slash);
  internal `<Link>`s stay extensionless since client-side navigation needs no redirect.
- The stale hand-written `public/sitemap.xml` (2 URLs) was deleted; `sitemap.xml` is now built
  from the same path enumeration as the prerender list (`prerender-paths.server.ts`), so they
  cannot drift apart.
- **Slug collisions** exist in principle (e.g. "C++" → `c`) but not in current data; first-seen
  casing wins for display, matching `collectTags()`.
- `filter.ts`'s `collectTags` was left untouched; `taxonomy.ts` wraps it with slugs.
- CommunityCard tag pills and location text are now always `<Link>`s (homepage included); the
  homepage's top quick-filter pill row keeps its toggle behaviour per the confirmed decision.
- Header nav gained "Tags" / "Locations" links.
