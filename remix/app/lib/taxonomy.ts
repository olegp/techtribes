/**
 * Pure helpers for the tag and location pages (/tags, /locations).
 * No React, no Node APIs: shared between loaders, components and unit tests.
 */
import type { CommunityEvent } from "./types";

/**
 * Lower-case a value, strip diacritics, spell out "+" and "#" (C++ -> cplusplus,
 * C# -> csharp) and collapse runs of other non-alphanumerics into single dashes.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface ParsedLocation {
  city: string;
  country: string;
}

/**
 * Split a "City, Country" location. Returns undefined when either part is
 * missing; commas beyond the first stay part of the country name.
 */
export function parseLocation(location: string): ParsedLocation | undefined {
  const [city, ...rest] = location.split(",").map((part) => part.trim());
  const country = rest.join(", ");
  if (!city || !country) return undefined;
  return { city, country };
}

export interface TagCount {
  /** Canonical display spelling (first spelling encountered wins, like canonicalTagName). */
  tag: string;
  slug: string;
  count: number;
}

/** Distinct tags with their slugs and occurrence counts, most common first. */
export function collectTagsWithSlugs(events: CommunityEvent[]): TagCount[] {
  const bySlug = new Map<string, TagCount>();
  for (const event of events) {
    for (const tag of event.tags ?? []) {
      const slug = slugify(tag);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) existing.count += 1;
      else bySlug.set(slug, { tag, slug, count: 1 });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "en", { sensitivity: "base" }),
  );
}

export interface CityCount {
  city: string;
  slug: string;
  count: number;
}

export interface CountryCount {
  country: string;
  slug: string;
  count: number;
  cities: CityCount[];
}

/** Distinct countries with their cities and counts, most common first. */
export function collectLocations(events: CommunityEvent[]): CountryCount[] {
  const countries = new Map<string, CountryCount>();
  for (const event of events) {
    const loc = parseLocation(event.location);
    if (!loc) continue;
    const slug = slugify(loc.country);
    let country = countries.get(slug);
    if (!country) {
      country = { country: loc.country, slug, count: 0, cities: [] };
      countries.set(slug, country);
    }
    country.count += 1;
    const citySlug = slugify(loc.city);
    const city = country.cities.find((candidate) => candidate.slug === citySlug);
    if (city) city.count += 1;
    else country.cities.push({ city: loc.city, slug: citySlug, count: 1 });
  }
  const byCountThenName = <T extends { count: number }>(a: T, b: T, nameKey: keyof T) =>
    b.count - a.count || String(a[nameKey]).localeCompare(String(b[nameKey]), "en");
  const sorted = [...countries.values()].sort((a, b) => byCountThenName(a, b, "country"));
  for (const country of sorted) {
    country.cities.sort((a, b) => byCountThenName(a, b, "city"));
  }
  return sorted;
}

/** Communities carrying a tag whose slug matches `tagSlug` (order preserved). */
export function filterByTag(events: CommunityEvent[], tagSlug: string): CommunityEvent[] {
  const slug = slugify(tagSlug);
  if (!slug) return events;
  return events.filter((event) => (event.tags ?? []).some((tag) => slugify(tag) === slug));
}

/**
 * Communities located in a country — and optionally a city — by slug
 * (order preserved).
 */
export function filterByLocation(
  events: CommunityEvent[],
  countrySlug: string,
  citySlug?: string,
): CommunityEvent[] {
  const country = slugify(countrySlug);
  const city = citySlug === undefined ? undefined : slugify(citySlug);
  return events.filter((event) => {
    const loc = parseLocation(event.location);
    if (!loc || slugify(loc.country) !== country) return false;
    return city === undefined || slugify(loc.city) === city;
  });
}

/** Canonical display spelling for a tag slug, taken from the first match. */
export function canonicalTagName(events: CommunityEvent[], tagSlug: string): string | undefined {
  const slug = slugify(tagSlug);
  if (!slug) return undefined;
  for (const event of events) {
    for (const tag of event.tags ?? []) {
      if (slugify(tag) === slug) return tag;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// URL builders. Safe to import on the client.
// ---------------------------------------------------------------------------

export const TAGS_URL = "/tags";
export const LOCATIONS_URL = "/locations";

export const tagUrl = (tagSlug: string) => `${TAGS_URL}/${tagSlug}`;

export const locationUrl = (countrySlug: string, citySlug?: string) =>
  citySlug ? `${LOCATIONS_URL}/${countrySlug}/${citySlug}` : `${LOCATIONS_URL}/${countrySlug}`;
