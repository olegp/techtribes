import { describe, expect, it } from "vitest";

import { buildSitemap } from "~/lib/sitemap";

describe("buildSitemap", () => {
  it("builds a valid document with loc, lastmod and priority per entry", () => {
    const xml = buildSitemap(
      [
        { path: "/", priority: 1 },
        { path: "/tags/javascript", priority: 0.7 },
      ],
      { siteUrl: "https://www.techtrib.es", lastmod: "2026-08-15" },
    );
    expect(xml).toContain(`<?xml version="1.0" encoding="UTF-8"?>`);
    expect(xml).toContain(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
    expect(xml).toContain("<loc>https://www.techtrib.es/</loc>");
    expect(xml).toContain("<lastmod>2026-08-15</lastmod>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain("<loc>https://www.techtrib.es/tags/javascript/</loc>");
    expect(xml).toContain("<priority>0.7</priority>");
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });

  it("omits lastmod when not given", () => {
    const xml = buildSitemap([{ path: "/", priority: 1 }], { siteUrl: "https://x.example" });
    expect(xml).not.toContain("<lastmod>");
  });

  it("escapes XML-special characters in URLs", () => {
    const xml = buildSitemap([{ path: "/tags/a&b<c>", priority: 0.5 }], {
      siteUrl: "https://x.example",
    });
    expect(xml).toContain("<loc>https://x.example/tags/a&amp;b&lt;c&gt;/</loc>");
    expect(xml).not.toContain("a&b<c>");
  });
});
