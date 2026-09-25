import type { Route } from "./+types/locations";
import { Link } from "react-router";

import { getScrapeOutput } from "~/lib/data.server";
import { pageMeta } from "~/lib/meta";
import { collectLocations, locationUrl, LOCATIONS_URL, type CountryCount } from "~/lib/taxonomy";

export async function loader() {
  const { events } = await getScrapeOutput();
  const countries = collectLocations(events);
  return {
    countries,
    total: events.length,
    totalCities: countries.reduce((sum, country) => sum + country.cities.length, 0),
  };
}

/** Baked in at build time; nothing here changes client-side. */
export function shouldRevalidate() {
  return false;
}

export function meta() {
  return pageMeta({
    title: "Tech communities by location | Techtribes",
    description:
      "Explore active tech communities and meetups in Finland city by city: Helsinki, Turku, Tampere and more.",
    path: LOCATIONS_URL,
  });
}

/** "1 community" / "2 communities". */
function communities(count: number) {
  return `${count} ${count === 1 ? "community" : "communities"}`;
}

export default function LocationsIndex({ loaderData }: Route.ComponentProps) {
  const { countries, total, totalCities } = loaderData;
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl leading-tight font-bold md:text-4xl">
          Tech communities by location
        </h1>
        <p className="text-muted-foreground">
          {total} active {total === 1 ? "community" : "communities"} in {totalCities}{" "}
          {totalCities === 1 ? "city" : "cities"}. Pick a city to see its communities and upcoming
          events.
        </p>
      </header>

      {countries.map((country: CountryCount) => (
        <section key={country.slug}>
          <h2 className="mb-3 text-xl font-semibold">
            <Link to={locationUrl(country.slug)} className="transition-colors hover:text-primary">
              {country.country}
            </Link>
            <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
              {communities(country.count)}
            </span>
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {country.cities.map(({ city, slug, count }) => (
              <li key={slug}>
                <Link
                  to={locationUrl(country.slug, slug)}
                  className="block h-full rounded-xl bg-foreground/5 px-4 py-3 ring-1 ring-foreground/5 transition-all duration-200 hover:bg-foreground/10 hover:shadow-lg hover:ring-primary/20"
                >
                  <div className="font-medium text-foreground">{city}</div>
                  <div className="text-sm text-muted-foreground">{communities(count)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
