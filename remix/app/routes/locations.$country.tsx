import type { ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/locations.$country";
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
import { filterByLocation, locationUrl, parseLocation, slugify } from "~/lib/taxonomy";

export async function loader({ params }: Route.LoaderArgs): Promise<FilterPageData> {
  const { events } = await getScrapeOutput();
  const countrySlug = slugify(params.country ?? "");
  const filtered = filterByLocation(events, countrySlug);
  const name = parseLocation(filtered[0]?.location ?? "")?.country ?? params.country;
  const { upcoming, past } = splitEvents(filtered);

  return {
    found: filtered.length > 0,
    missedValue: params.country,
    crumbs: [
      { label: "All communities", to: "/" },
      { label: "Locations", to: "/locations" },
      { label: name },
    ],
    heading: name,
    statsLine: filterStatsLine(filtered.length, upcoming.length),
    upcoming,
    past,
    pagePath: locationUrl(countrySlug),
    pageTitle: `Tech communities in ${name}`,
    pagePlace: name,
  };
}

/** The loader data is static, so only refetch when the params actually change
 * (e.g. navigating /locations/finland -> /locations/sweden reuses this module). */
export function shouldRevalidate({ currentParams, nextParams }: ShouldRevalidateFunctionArgs) {
  return currentParams.country !== nextParams.country;
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

export default function CountryPage({ loaderData }: Route.ComponentProps) {
  return <FilterPage data={loaderData} />;
}
