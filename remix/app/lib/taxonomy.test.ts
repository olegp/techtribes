import { describe, expect, it } from "vitest";

import { makeEvent } from "../../test/fixtures";
import {
  canonicalTagName,
  collectLocations,
  collectTagsWithSlugs,
  filterByLocation,
  filterByTag,
  locationUrl,
  parseLocation,
  slugify,
  tagUrl,
} from "~/lib/taxonomy";

describe("slugify", () => {
  it.each([
    ["JavaScript", "javascript"],
    ["Data Science", "data-science"],
    ["Node.js", "node-js"],
    ["C++", "cplusplus"],
    ["C#", "csharp"],
    ["F#", "fsharp"],
    ["C", "c"],
    ["Jyväskylä", "jyvaskyla"],
    ["Åland", "aland"],
    ["  Leading and trailing  ", "leading-and-trailing"],
    ["Multiple---dashes & such", "multiple-dashes-such"],
    ["", ""],
  ])("slugify(%j) -> %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("parseLocation", () => {
  it("splits a City, Country string", () => {
    expect(parseLocation("Helsinki, Finland")).toEqual({ city: "Helsinki", country: "Finland" });
  });

  it("trims whitespace around both parts", () => {
    expect(parseLocation("  Turku ,  Finland ")).toEqual({ city: "Turku", country: "Finland" });
  });

  it("keeps extra commas as part of the country", () => {
    expect(parseLocation("Washington, DC, USA")).toEqual({
      city: "Washington",
      country: "DC, USA",
    });
  });

  it("returns undefined for values without a country part", () => {
    expect(parseLocation("Online")).toBeUndefined();
    expect(parseLocation("")).toBeUndefined();
  });
});

describe("collectTagsWithSlugs", () => {
  const events = [
    makeEvent({ tags: ["JavaScript", "frontend"] }),
    makeEvent({ tags: ["javascript"] }),
    makeEvent({ tags: ["Python"] }),
  ];

  it("counts occurrences and sorts by count descending then name", () => {
    expect(collectTagsWithSlugs(events)).toEqual([
      { tag: "JavaScript", slug: "javascript", count: 2 },
      { tag: "frontend", slug: "frontend", count: 1 },
      { tag: "Python", slug: "python", count: 1 },
    ]);
  });

  it("merges spellings that share a slug", () => {
    const merged = collectTagsWithSlugs([
      makeEvent({ tags: ["Node.js"] }),
      makeEvent({ tags: ["node js"] }),
    ]);
    expect(merged).toEqual([{ tag: "Node.js", slug: "node-js", count: 2 }]);
  });
});

describe("collectLocations", () => {
  const events = [
    makeEvent({ location: "Helsinki, Finland" }),
    makeEvent({ location: "Turku, Finland" }),
    makeEvent({ location: "Helsinki, Finland" }),
    makeEvent({ location: "Stockholm, Sweden" }),
    makeEvent({ location: "Remote-only" }),
  ];

  it("groups by country with nested cities, most common first", () => {
    expect(collectLocations(events)).toEqual([
      {
        country: "Finland",
        slug: "finland",
        count: 3,
        cities: [
          { city: "Helsinki", slug: "helsinki", count: 2 },
          { city: "Turku", slug: "turku", count: 1 },
        ],
      },
      {
        country: "Sweden",
        slug: "sweden",
        count: 1,
        cities: [{ city: "Stockholm", slug: "stockholm", count: 1 }],
      },
    ]);
  });

  it("skips events without a parseable location", () => {
    const only = collectLocations([makeEvent({ location: "Nowhere in particular" })]);
    expect(only).toEqual([]);
  });
});

describe("filterByTag", () => {
  const events = [
    makeEvent({ name: "A", tags: ["JavaScript"] }),
    makeEvent({ name: "B", tags: ["javascript"] }),
    makeEvent({ name: "C", tags: ["Python"] }),
  ];

  it("matches tags case-insensitively via slugs", () => {
    const names = filterByTag(events, "JAVASCRIPT").map((e) => e.name);
    expect(names).toEqual(["A", "B"]);
  });

  it("matches multi-word tags", () => {
    expect(filterByTag(events, "data-science")).toEqual([]);
    const withData = [...events, makeEvent({ name: "D", tags: ["Data Science"] })];
    expect(filterByTag(withData, "Data-Science").map((e) => e.name)).toEqual(["D"]);
  });

  it("returns everything for an empty slug", () => {
    expect(filterByTag(events, "")).toHaveLength(3);
  });
});

describe("filterByLocation", () => {
  const events = [
    makeEvent({ name: "A", location: "Helsinki, Finland" }),
    makeEvent({ name: "B", location: "Turku, Finland" }),
    makeEvent({ name: "C", location: "Stockholm, Sweden" }),
    makeEvent({ name: "D", location: "Remote-only" }),
  ];

  it("filters by country slug only", () => {
    const names = filterByLocation(events, "finland").map((e) => e.name);
    expect(names).toEqual(["A", "B"]);
  });

  it("filters by country and city slugs", () => {
    const names = filterByLocation(events, "Finland", "Helsinki").map((e) => e.name);
    expect(names).toEqual(["A"]);
  });

  it("excludes events without a parseable location", () => {
    expect(filterByLocation(events, "remote-only")).toEqual([]);
  });
});

describe("canonicalTagName", () => {
  it("returns the first-seen spelling for a slug", () => {
    const events = [makeEvent({ tags: ["JavaScript"] }), makeEvent({ tags: ["javascript"] })];
    expect(canonicalTagName(events, "JAVASCRIPT")).toBe("JavaScript");
  });

  it("returns undefined for an unknown slug", () => {
    expect(canonicalTagName([makeEvent()], "rust")).toBeUndefined();
  });
});

describe("URL builders", () => {
  it("builds tag URLs", () => {
    expect(tagUrl("javascript")).toBe("/tags/javascript");
  });

  it("builds country and city location URLs", () => {
    expect(locationUrl("finland")).toBe("/locations/finland");
    expect(locationUrl("finland", "helsinki")).toBe("/locations/finland/helsinki");
  });
});
