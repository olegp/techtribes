/**
 * Per-page `meta` descriptors.
 *
 * In React Router a child route's `meta` export REPLACES the parent's instead of
 * merging with it, so every route builds its full descriptor list through this
 * helper: page-specific tags (title, description, canonical, og/twitter URLs)
 * plus the site-wide defaults that used to live in site/_layouts/default.html.
 */
import type { MetaDescriptor } from "react-router";
import { eventIsoDate } from "./events";
import { OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, THEME_COLOR } from "./site";
import type { CommunityEvent } from "./types";

export interface PageMetaOptions {
  /** Contents of <title>, also used for og:title / twitter:title. */
  title: string;
  /** Meta description, also used for og:description / twitter:description. */
  description: string;
  /** Absolute path of the page, e.g. "/" or "/guide". Used for the canonical URL. */
  path: string;
  /** Extra JSON-LD nodes appended to the page's single @graph, e.g. eventListNodes(). */
  graph?: GraphNode[];
}

/** A JSON-LD node inside the page's @graph. */
type GraphNode = Record<string, unknown> & { "@type": string };

// --- Count phrases (shared by filter-page stats lines and descriptions) ---

/** "0 upcoming events" / "1 upcoming event" / "2 upcoming events". */
export function upcomingEventsPhrase(count: number): string {
  return `${count} upcoming event${count === 1 ? "" : "s"}`;
}

/** Muted stats line under a filter page's heading, e.g. "4 communities · 12 upcoming events".
 * The upcoming part is omitted when there is nothing upcoming. Deliberately no member counts:
 * summing members across communities is meaningless given platform overlap. */
export function filterStatsLine(communities: number, upcoming: number): string {
  const noun = communities === 1 ? "community" : "communities";
  const base = `${communities} ${noun}`;
  return upcoming > 0 ? `${base} · ${upcomingEventsPhrase(upcoming)}` : base;
}

/** Description sentence for tag/location pages, e.g. "Discover 4 active tech communities and
 * meetups in Turku, Finland with 1 upcoming event." When `topic` is given it replaces "tech"
 * ("Discover 6 active AI communities …"). The upcoming clause is omitted when there is nothing
 * upcoming; singular/plural are handled throughout. */
export function communitiesDescription(
  communityCount: number,
  place: string,
  upcomingCount: number,
  topic?: string,
): string {
  const communityNoun = communityCount === 1 ? "community" : "communities";
  const meetupNoun = communityCount === 1 ? "meetup" : "meetups";
  const kind = topic ? `${topic} ` : "tech ";
  const upcoming = upcomingCount > 0 ? ` with ${upcomingEventsPhrase(upcomingCount)}` : "";
  return `Discover ${communityCount} active ${kind}${communityNoun} and ${meetupNoun} in ${place}${upcoming}.`;
}

const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

/**
 * Every page is prerendered as a directory-style index.html, so static hosts
 * serve `path` only after redirecting to `path/`. Canonical/OG URLs therefore
 * use the trailing-slash form — the URL a visitor (and search engine) ends up on.
 */
export function canonicalPath(path: string): string {
  return path === "/" || path.endsWith("/") ? path : `${path}/`;
}

/** Build the complete list of meta descriptors for a page. */
export function pageMeta({
  title,
  description,
  path,
  graph = [],
}: PageMetaOptions): MetaDescriptor[] {
  const url = `${SITE_URL}${canonicalPath(path)}`;
  return [
    { title },
    { name: "description", content: description },

    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: OG_IMAGE_URL },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: SITE_TITLE },
    { property: "og:site_name", content: "Techtribes" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE_URL },
    { name: "twitter:image:alt", content: SITE_TITLE },

    { name: "author", content: "Techtribes" },
    { name: "robots", content: "index, follow" },
    { name: "theme-color", content: THEME_COLOR },

    { tagName: "link", rel: "canonical", href: url },

    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}#website`,
            name: "Techtribes",
            description: SITE_DESCRIPTION,
            url: SITE_URL,
            publisher: {
              "@id": `${SITE_URL}#organization`,
            },
          },
          {
            "@type": "Organization",
            "@id": `${SITE_URL}#organization`,
            name: "Techtribes",
            url: SITE_URL,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/assets/icons/tent.svg`,
            },
          },
          ...graph,
        ],
      },
    },
  ];
}

/**
 * @graph nodes describing a filter page as a schema.org CollectionPage whose
 * item list is the set of listed communities.
 */
export function collectionPageNodes(
  name: string,
  path: string,
  communities: CommunityEvent[],
): GraphNode[] {
  return [
    {
      "@type": "CollectionPage",
      name,
      url: `${SITE_URL}${canonicalPath(path)}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: communities.length,
        itemListElement: communities.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Organization",
            name: event.name,
            url: event.site ?? event.events,
          },
        })),
      },
    },
  ];
}

/**
 * @graph nodes for a list of community events, so search engines can read the
 * dates (the visible dd/mm/yyyy is ambiguous) and show event rich results.
 *
 * The scrapers give us a community, a date and a link but no event title or
 * street address, so the community stands in as both the event name and the
 * organizer. (eventAttendanceMode/eventStatus would be useful if we can get
 * them by scraping.)
 */
export function eventListNodes(events: CommunityEvent[]): GraphNode[] {
  if (events.length === 0) return [];
  return [
    {
      "@type": "ItemList",
      itemListElement: events.map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: event.name,
          startDate: eventIsoDate(event),
          url: event.event,
          location: {
            "@type": "Place",
            name: event.eventLocation ?? event.location,
            address: event.location,
          },
          organizer: {
            "@type": "Organization",
            name: event.name,
            url: event.site ?? event.events,
            ...(event.members !== undefined && {
              interactionStatistic: {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/JoinAction",
                userInteractionCount: event.members,
              },
            }),
          },
        },
      })),
    },
  ];
}

export const notFoundMeta = () =>
  pageMeta({
    title: "Page not found",
    description: "The page you were looking for doesn't exist.",
    path: "/404",
  });
