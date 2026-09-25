/**
 * Server-only helper enumerating every tag and location page path from the
 * scraped data. Used by both the prerender list in react-router.config.ts and
 * the sitemap.xml route, so the two can never drift apart.
 *
 * Runs in Node at build time; all npm scripts run from `remix/`, so
 * data.server.ts's cwd-based path resolution applies here too.
 */
import { getScrapeOutput } from "./data.server";
import type { SitemapEntry } from "./sitemap";
import { collectLocations, collectTagsWithSlugs, locationUrl, tagUrl } from "./taxonomy";

export async function enumerateFilterPaths(): Promise<SitemapEntry[]> {
  const { events } = await getScrapeOutput();
  const entries: SitemapEntry[] = collectTagsWithSlugs(events).map(({ slug }) => ({
    path: tagUrl(slug),
    priority: 0.7,
  }));
  for (const country of collectLocations(events)) {
    entries.push({ path: locationUrl(country.slug), priority: 0.7 });
    for (const city of country.cities) {
      entries.push({ path: locationUrl(country.slug, city.slug), priority: 0.6 });
    }
  }
  return entries;
}
