import type { Config } from "@react-router/dev/config";
import { enumerateFilterPaths } from "./app/lib/prerender-paths.server";

/**
 * Static site generation: no runtime server (`ssr: false`), every route is
 * pre-rendered at build time into `build/client/`.
 *
 * - "/", "/guide", "/404", "/tags", "/locations" and every /tags/:tag and
 *   /locations/... page -> an index.html under build/client (the filter-page
 *   paths are enumerated from data/output.json by prerender-paths.server.ts,
 *   shared with the sitemap so they can never drift apart)
 * - "/404" is copied to 404.html by scripts/postbuild.ts so GitHub Pages
 *   serves it for unknown URLs (which also covers invalid tag/location slugs)
 * - "/feed.xml" and "/sitemap.xml" are resource routes written verbatim.
 */
export default {
  ssr: false,
  prerender: async () => [
    "/",
    "/guide",
    "/404",
    "/feed.xml",
    "/sitemap.xml",
    "/tags",
    "/locations",
    ...(await enumerateFilterPaths()).map((entry) => entry.path),
  ],
} satisfies Config;
