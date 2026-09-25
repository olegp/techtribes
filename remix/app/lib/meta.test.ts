import { describe, expect, it } from "vitest";
import type { MetaDescriptor } from "react-router";

import {
  collectionPageNodes,
  communitiesDescription,
  eventListNodes,
  filterStatsLine,
  pageMeta,
  upcomingEventsPhrase,
} from "~/lib/meta";
import { makeEvent } from "../../test/fixtures";
import type { CommunityEvent } from "~/lib/types";
import { SITE_URL } from "~/lib/site";

/** Loosen the MetaDescriptor union to a plain record for easy lookups in tests. */
function asRecords(meta: MetaDescriptor[]): Record<string, unknown>[] {
  return meta as unknown as Record<string, unknown>[];
}

function byName(meta: MetaDescriptor[], name: string) {
  return asRecords(meta).find((m) => m.name === name);
}

function byProperty(meta: MetaDescriptor[], property: string) {
  return asRecords(meta).find((m) => m.property === property);
}

describe("pageMeta", () => {
  const meta = pageMeta({
    title: "Home | Techtribes",
    description: "The home page description.",
    path: "/",
  });

  it("includes the page title", () => {
    const titleEntry = asRecords(meta).find((m) => "title" in m);
    expect(titleEntry?.title).toBe("Home | Techtribes");
  });

  it("includes the meta description", () => {
    expect(byName(meta, "description")?.content).toBe("The home page description.");
  });

  it("builds a canonical link from SITE_URL + path", () => {
    const canonical = asRecords(meta).find((m) => m.tagName === "link" && m.rel === "canonical");
    expect(canonical?.href).toBe(`${SITE_URL}/`);
  });

  it("sets og:url and og:title", () => {
    expect(byProperty(meta, "og:url")?.content).toBe(`${SITE_URL}/`);
    expect(byProperty(meta, "og:title")?.content).toBe("Home | Techtribes");
    expect(byProperty(meta, "og:description")?.content).toBe("The home page description.");
  });

  it("sets twitter:* tags", () => {
    expect(byName(meta, "twitter:card")?.content).toBe("summary_large_image");
    expect(byName(meta, "twitter:url")?.content).toBe(`${SITE_URL}/`);
    expect(byName(meta, "twitter:title")?.content).toBe("Home | Techtribes");
    expect(byName(meta, "twitter:description")?.content).toBe("The home page description.");
    expect(byName(meta, "twitter:image")?.content).toBeTruthy();
  });

  it("includes a JSON-LD script descriptor for the WebSite", () => {
    const ldJson = asRecords(meta).find((m) => "script:ld+json" in m);
    expect(ldJson).toBeDefined();
    const payload = ldJson?.["script:ld+json"] as Record<string, unknown>;
    expect(payload["@context"]).toBe("https://schema.org");
    const graph = payload["@graph"] as Record<string, unknown>[];
    const website = graph.find((node) => node["@type"] === "WebSite");
    expect(website?.url).toBe(SITE_URL);
  });

  it("produces different canonicals/og:url for different paths", () => {
    const guideMeta = pageMeta({
      title: "Guide",
      description: "Guide description.",
      path: "/guide",
    });
    const homeCanonical = asRecords(meta).find(
      (m) => m.tagName === "link" && m.rel === "canonical",
    )?.href;
    const guideCanonical = asRecords(guideMeta).find(
      (m) => m.tagName === "link" && m.rel === "canonical",
    )?.href;
    expect(homeCanonical).toBe(`${SITE_URL}/`);
    expect(guideCanonical).toBe(`${SITE_URL}/guide/`);
    expect(homeCanonical).not.toBe(guideCanonical);
    expect(byProperty(guideMeta, "og:url")?.content).toBe(`${SITE_URL}/guide/`);
  });
});

describe("eventListNodes", () => {
  const event: CommunityEvent = {
    name: "Helsinki Python",
    location: "Helsinki, Finland",
    tags: ["python"],
    events: "https://www.meetup.com/helsinki-python/",
    site: "https://helsinkipython.fi",
    members: 1236,
    date: "03/09/2026",
    isoDate: "2026-09-03",
    event: "https://www.meetup.com/helsinki-python/events/12345/",
    eventLocation: "Kamppi, Helsinki",
  };

  function firstItem(events: CommunityEvent[]) {
    const [list] = eventListNodes(events);
    const [listItem] = list.itemListElement as Record<string, unknown>[];
    return listItem;
  }

  it("returns nothing when there are no events", () => {
    expect(eventListNodes([])).toEqual([]);
  });

  it("describes each event as a schema.org Event in an ItemList", () => {
    const [list] = eventListNodes([event]);
    expect(list["@type"]).toBe("ItemList");
    expect(list["@context"]).toBeUndefined();

    const listItem = firstItem([event]);
    expect(listItem.position).toBe(1);
    const item = listItem.item as Record<string, unknown>;
    expect(item["@type"]).toBe("Event");
    expect(item.name).toBe("Helsinki Python");
    expect(item.startDate).toBe("2026-09-03");
    expect(item.url).toBe(event.event);
    expect(item.location).toEqual({
      "@type": "Place",
      name: "Kamppi, Helsinki",
      address: "Helsinki, Finland",
    });
    expect(item.organizer).toEqual({
      "@type": "Organization",
      name: "Helsinki Python",
      url: "https://helsinkipython.fi",
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/JoinAction",
        userInteractionCount: 1236,
      },
    });
  });

  it("omits interactionStatistic when the member count is unknown", () => {
    const item = firstItem([{ ...event, members: undefined }]).item as Record<string, unknown>;
    expect(item.organizer).not.toHaveProperty("interactionStatistic");
  });

  it("falls back to the community location and event platform URL", () => {
    const item = firstItem([{ ...event, eventLocation: undefined, site: undefined }])
      .item as Record<string, unknown>;
    expect((item.location as Record<string, unknown>).name).toBe("Helsinki, Finland");
    expect((item.organizer as Record<string, unknown>).url).toBe(event.events);
  });

  it("derives startDate from the dd/mm/yyyy date when isoDate is missing", () => {
    const item = firstItem([{ ...event, isoDate: "" }]).item as Record<string, unknown>;
    expect(item.startDate).toBe("2026-09-03");
  });

  it("lands in the page's single @graph when passed to pageMeta", () => {
    const meta = pageMeta({
      title: "Home",
      description: "Home description.",
      path: "/",
      graph: eventListNodes([event]),
    });
    const scripts = asRecords(meta).filter((m) => "script:ld+json" in m);
    expect(scripts).toHaveLength(1);
    const graph = (scripts[0]["script:ld+json"] as Record<string, unknown>)["@graph"] as Record<
      string,
      unknown
    >[];
    expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "Organization", "ItemList"]);
  });
});

describe("upcomingEventsPhrase", () => {
  it.each([
    [0, "0 upcoming events"],
    [1, "1 upcoming event"],
    [2, "2 upcoming events"],
  ])("upcomingEventsPhrase(%i) -> %j", (count, expected) => {
    expect(upcomingEventsPhrase(count)).toBe(expected);
  });
});

describe("filterStatsLine", () => {
  it("shows both counts when there are upcoming events", () => {
    expect(filterStatsLine(4, 12)).toBe("4 communities · 12 upcoming events");
  });

  it("uses the singular community noun", () => {
    expect(filterStatsLine(1, 1)).toBe("1 community · 1 upcoming event");
  });

  it("drops the upcoming part when there is nothing upcoming", () => {
    expect(filterStatsLine(3, 0)).toBe("3 communities");
  });
});

describe("communitiesDescription", () => {
  it("builds the full sentence with plurals and an upcoming clause", () => {
    expect(communitiesDescription(4, "Turku, Finland", 1)).toBe(
      "Discover 4 active tech communities and meetups in Turku, Finland with 1 upcoming event.",
    );
  });

  it("uses singular nouns for a single community", () => {
    expect(communitiesDescription(1, "Finland", 2)).toBe(
      "Discover 1 active tech community and meetup in Finland with 2 upcoming events.",
    );
  });

  it("replaces tech with the topic for tag pages", () => {
    expect(communitiesDescription(6, "Finland", 3, "AI")).toBe(
      "Discover 6 active AI communities and meetups in Finland with 3 upcoming events.",
    );
    expect(communitiesDescription(1, "Finland", 0, "Data Engineering")).toBe(
      "Discover 1 active Data Engineering community and meetup in Finland.",
    );
  });

  it("omits the upcoming clause when nothing is upcoming", () => {
    expect(communitiesDescription(7, "Finland", 0)).toBe(
      "Discover 7 active tech communities and meetups in Finland.",
    );
  });
});

describe("collectionPageNodes", () => {
  const community = makeEvent();

  it("describes the page as a CollectionPage listing its communities", () => {
    const [node] = collectionPageNodes("Tech communities in Turku", "/locations/finland/turku", [
      community,
    ]);
    expect(node["@type"]).toBe("CollectionPage");
    expect(node.url).toBe(`${SITE_URL}/locations/finland/turku/`);
    const mainEntity = node.mainEntity as Record<string, unknown>;
    expect(mainEntity.numberOfItems).toBe(1);
    const items = mainEntity.itemListElement as Record<string, unknown>[];
    const org = items[0].item as Record<string, unknown>;
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe(community.name);
    expect(org.url).toBe(community.site);
  });
});
