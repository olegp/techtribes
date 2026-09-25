import type { Route } from "./+types/tags";
import { Link } from "react-router";

import { getScrapeOutput } from "~/lib/data.server";
import { pageMeta } from "~/lib/meta";
import { collectTagsWithSlugs, tagUrl, type TagCount } from "~/lib/taxonomy";

export async function loader() {
  const { events } = await getScrapeOutput();
  return { tags: collectTagsWithSlugs(events), total: events.length };
}

/** Baked in at build time; nothing here changes client-side. */
export function shouldRevalidate() {
  return false;
}

export function meta() {
  return pageMeta({
    title: "Browse by topic | Techtribes",
    description:
      "Explore active tech communities and meetups in Finland by technology topic: JavaScript, Python, DevOps, AI and more.",
    path: "/tags",
  });
}

/** "1 community" / "2 communities". */
function communities(count: number) {
  return `${count} ${count === 1 ? "community" : "communities"}`;
}

export default function TagsIndex({ loaderData }: Route.ComponentProps) {
  const { tags, total } = loaderData;
  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl leading-tight font-bold md:text-4xl">Browse by topic</h1>
        <p className="text-muted-foreground">
          {tags.length} {tags.length === 1 ? "topic" : "topics"} across {total} active{" "}
          {total === 1 ? "community" : "communities"}. Pick one to see its communities and upcoming
          events.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tags.map(({ tag, slug, count }: TagCount) => (
          <li key={slug}>
            <Link
              to={tagUrl(slug)}
              className="block h-full rounded-xl bg-foreground/5 px-4 py-3 ring-1 ring-foreground/5 transition-all duration-200 hover:bg-foreground/10 hover:shadow-lg hover:ring-primary/20"
            >
              <div className="font-medium text-foreground">{tag}</div>
              <div className="text-sm text-muted-foreground">{communities(count)}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
