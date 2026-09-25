import { enumerateFilterPaths } from "~/lib/prerender-paths.server";
import { getScrapeOutput } from "~/lib/data.server";
import { buildSitemap, type SitemapEntry } from "~/lib/sitemap";
import { SITE_URL } from "~/lib/site";

/**
 * Prerendered verbatim to /sitemap.xml (like feed.xml), so no cache headers
 * are needed — it is a static file once built.
 */
export async function loader() {
  const { updated } = await getScrapeOutput();
  const staticEntries: SitemapEntry[] = [
    { path: "/", priority: 1 },
    { path: "/guide", priority: 0.8 },
    { path: "/tags", priority: 0.8 },
    { path: "/locations", priority: 0.8 },
  ];
  const xml = buildSitemap([...staticEntries, ...(await enumerateFilterPaths())], {
    siteUrl: SITE_URL,
    lastmod: updated.slice(0, 10),
  });
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
