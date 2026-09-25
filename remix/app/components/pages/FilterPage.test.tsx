import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRoutesStub } from "react-router";

import { FilterPage } from "~/components/pages/FilterPage";
import type { FilterPageData } from "~/components/pages/FilterPage";
import { makeEvent } from "../../../test/fixtures";
import { splitEvents } from "~/lib/events";

afterEach(() => {
  cleanup();
});

const events = [
  makeEvent({ name: "Helsinki JS", tags: ["JavaScript"], location: "Helsinki, Finland" }),
  makeEvent({ name: "Turku DevOps", tags: ["DevOps"], location: "Turku, Finland" }),
];

const base: FilterPageData = {
  found: true,
  crumbs: [
    { label: "All communities", to: "/" },
    { label: "Topics", to: "/tags" },
    { label: "JavaScript" },
  ],
  heading: "JavaScript communities",
  statsLine: "1 community · 1 upcoming event",
  ...splitEvents(events, "2026-08-10"),
  pagePath: "/tags/javascript",
  pageTitle: "JavaScript communities in Finland",
  pagePlace: "Finland",
};

function renderFilterPage(data: FilterPageData) {
  const Stub = createRoutesStub([
    {
      path: "/tags/:tag",
      Component: () => <FilterPage data={data} />,
    },
  ]);
  return render(<Stub initialEntries={["/tags/javascript"]} />);
}

describe("FilterPage", () => {
  it("renders the breadcrumb, heading and stats line", () => {
    renderFilterPage(base);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All communities" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Topics" })).toHaveAttribute("href", "/tags");
    // The leaf is plain text marked as the current page, not a link.
    const leaf = screen
      .getByRole("navigation", { name: "Breadcrumb" })
      .querySelector("[aria-current='page']");
    expect(leaf).toHaveTextContent("JavaScript");
    expect(screen.getByRole("heading", { name: "JavaScript communities" })).toBeInTheDocument();
    expect(screen.getByText("1 community · 1 upcoming event")).toBeInTheDocument();
  });

  it("renders the upcoming/past event lists via EventList", () => {
    renderFilterPage(base);
    expect(screen.getByText("Helsinki JS")).toBeInTheDocument();
    expect(screen.getByText("Turku DevOps")).toBeInTheDocument();
  });

  it("has no related-filter section — discovery is the event list's search/filter UI", () => {
    renderFilterPage(base);
    expect(screen.queryByText("Related tags")).not.toBeInTheDocument();
    expect(screen.queryByText("Browse by city")).not.toBeInTheDocument();
  });

  it("shows a not-found state for an unmatched slug instead of a list", () => {
    renderFilterPage({
      ...base,
      found: false,
      missedValue: "nonexistent",
      upcoming: [],
      past: [],
    });
    expect(screen.getByRole("heading", { name: "Nothing here (yet)" })).toBeInTheDocument();
    expect(screen.getByText(/No communities found for/i)).toBeInTheDocument();
    expect(screen.queryByText("JavaScript communities")).not.toBeInTheDocument();
  });
});
