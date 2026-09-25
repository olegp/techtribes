import type { ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/tags.$tag";
import { FilterPage, loadOrNotFound, type FilterPageData } from "~/components/pages/FilterPage";
import { getScrapeOutput } from "~/lib/data.server";
import { splitEvents } from "~/lib/events";
import {
  collectionPageNodes,
  notFoundMeta,
  communitiesDescription,
  eventListNodes,
  filterStatsLine,
  pageMeta,
} from "~/lib/meta";
import { canonicalTagName, filterByTag, slugify, tagUrl } from "~/lib/taxonomy";

export async function loader({ params }: Route.LoaderArgs): Promise<FilterPageData> {
  const { events } = await getScrapeOutput();
  const tagSlug = slugify(params.tag ?? "");
  const filtered = filterByTag(events, tagSlug);
  const name = canonicalTagName(filtered, tagSlug) ?? params.tag;
  const { upcoming, past } = splitEvents(filtered);

  return {
    found: filtered.length > 0,
    missedValue: params.tag,
    crumbs: [
      { label: "All communities", to: "/" },
      { label: "Topics", to: "/tags" },
      { label: name },
    ],
    heading: `${name} communities`,
    statsLine: filterStatsLine(filtered.length, upcoming.length),
    upcoming,
    past,
    pagePath: tagUrl(tagSlug),
    // og:title pattern: "{Tag} communities in Finland".
    pageTitle: `${name} communities in Finland`,
    pagePlace: "Finland",
    topic: name,
  };
}

/** The loader data is static, so only refetch when the params actually change
 * (e.g. navigating /tags/azure -> /tags/devops reuses this route module). */
export function shouldRevalidate({ currentParams, nextParams }: ShouldRevalidateFunctionArgs) {
  return currentParams.tag !== nextParams.tag;
}

export const clientLoader = ({ serverLoader }: Route.ClientLoaderArgs) =>
  loadOrNotFound(serverLoader);

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return notFoundMeta();
  return pageMeta({
    title: `${loaderData.pageTitle} | Techtribes`,
    description: communitiesDescription(
      loaderData.upcoming.length + loaderData.past.length,
      loaderData.pagePlace,
      loaderData.upcoming.length,
      loaderData.topic,
    ),
    path: loaderData.pagePath,
    graph: [
      ...collectionPageNodes(loaderData.pageTitle, loaderData.pagePath, [
        ...loaderData.upcoming,
        ...loaderData.past,
      ]),
      ...eventListNodes(loaderData.upcoming),
    ],
  });
}

export default function TagPage({ loaderData }: Route.ComponentProps) {
  return <FilterPage data={loaderData} />;
}
