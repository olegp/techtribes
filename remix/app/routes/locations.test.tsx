import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRoutesStub } from "react-router";
import type { ComponentProps } from "react";

import LocationsIndex from "~/routes/locations";
import type { CountryCount } from "~/lib/taxonomy";

afterEach(() => {
  cleanup();
});

const countries: CountryCount[] = [
  {
    country: "Finland",
    slug: "finland",
    count: 3,
    cities: [
      { city: "Helsinki", slug: "helsinki", count: 2 },
      { city: "Turku", slug: "turku", count: 1 },
    ],
  },
];

function renderIndex() {
  // The route's ComponentProps include router internals we don't care about here.
  const props = {
    loaderData: { countries, total: 3, totalCities: 2 },
  } as unknown as ComponentProps<typeof LocationsIndex>;
  const Stub = createRoutesStub([
    {
      path: "/locations",
      Component: () => <LocationsIndex {...props} />,
    },
  ]);
  return render(<Stub initialEntries={["/locations"]} />);
}

describe("LocationsIndex", () => {
  it("renders the heading, intro with counts, country subheading and city grid", () => {
    renderIndex();

    expect(
      screen.getByRole("heading", { name: "Tech communities by location" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 active communities in 2 cities\. Pick a city/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Finland/ })).toBeInTheDocument();

    const helsinki = screen.getByRole("link", { name: /Helsinki/ });
    expect(helsinki).toHaveAttribute("href", "/locations/finland/helsinki");
    expect(helsinki).toHaveTextContent("2 communities");
    expect(screen.getByRole("link", { name: /Turku/ })).toHaveAttribute(
      "href",
      "/locations/finland/turku",
    );
    expect(screen.getByText("1 community")).toBeInTheDocument();
  });

  it("links the country subheading to the country page", () => {
    renderIndex();
    expect(screen.getByRole("link", { name: "Finland" })).toHaveAttribute(
      "href",
      "/locations/finland",
    );
  });
});
