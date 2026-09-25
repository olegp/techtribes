import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guide", "routes/guide.tsx"),
  route("feed.xml", "routes/feed[.]xml.ts"),
  route("sitemap.xml", "routes/sitemap[.]xml.ts"),

  // Tag & location pages (issue #37). Only valid slugs are prerendered;
  // invalid ones are handled by the catch-all below (404.html in production).
  route("tags", "routes/tags.tsx"),
  route("tags/:tag", "routes/tags.$tag.tsx"),
  route("locations", "routes/locations.tsx"),
  route("locations/:country", "routes/locations.$country.tsx"),
  route("locations/:country/:city", "routes/locations.$country.$city.tsx"),

  // Catch-all renders the not-found page. It is prerendered at /404 and copied
  // to build/client/404.html (see scripts/postbuild.ts) for GitHub Pages.
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
