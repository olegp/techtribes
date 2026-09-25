/**
 * Sitemap XML builder for the sitemap.xml resource route.
 * Pure and testable, like feed.ts.
 */

export interface SitemapEntry {
  /** Absolute path starting with "/", e.g. "/tags/javascript". */
  path: string;
  /** Sitemap priority between 0 and 1. */
  priority: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Build a complete sitemap XML document from ordered entries. Directory-style
 * paths get the trailing-slash form that static hosts actually serve. */
export function buildSitemap(
  entries: SitemapEntry[],
  options: { siteUrl: string; lastmod?: string },
): string {
  const urls = entries.map(({ path, priority }) => {
    const loc = path === "/" || path.endsWith("/") ? path : `${path}/`;
    const lines = [`<loc>${escapeXml(options.siteUrl + loc)}</loc>`];
    if (options.lastmod) lines.push(`<lastmod>${escapeXml(options.lastmod)}</lastmod>`);
    lines.push(`<priority>${priority.toFixed(1)}</priority>`);
    return `  <url>\n    ${lines.join("\n    ")}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
