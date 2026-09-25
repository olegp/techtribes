import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";

import { CommunityCard } from "~/components/cards/CommunityCard";
import { makeEvent } from "../../../test/fixtures";

afterEach(() => {
  cleanup();
});

/** The card's tag/location pills are <Link>s, which need a router context. */
function renderCard(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("CommunityCard", () => {
  it("links the name to the community's site when present", () => {
    const event = makeEvent({
      name: "Helsinki JS",
      site: "https://helsinkijs.org",
      events: "https://meetup.com/helsinki-js",
    });
    renderCard(<CommunityCard event={event} />);
    const links = screen.getAllByRole("link", { name: "Helsinki JS" });
    expect(links.some((link) => link.getAttribute("href") === "https://helsinkijs.org")).toBe(true);
  });

  it("falls back to the events URL when no site is given", () => {
    const event = makeEvent({
      name: "Helsinki JS",
      site: undefined,
      events: "https://meetup.com/helsinki-js",
    });
    renderCard(<CommunityCard event={event} />);
    const links = screen.getAllByRole("link", { name: "Helsinki JS" });
    expect(
      links.some((link) => link.getAttribute("href") === "https://meetup.com/helsinki-js"),
    ).toBe(true);
  });

  it("renders the logo as decorative, since the community name is already visible", () => {
    const event = makeEvent({ name: "Helsinki JS", logo: "helsinki-js.png" });
    const { container } = renderCard(<CommunityCard event={event} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", "/assets/logos/helsinki-js.png");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("passes through an absolute logo URL unchanged", () => {
    const event = makeEvent({
      name: "Helsinki JS",
      logo: "https://example.com/logo.png",
    });
    const { container } = renderCard(<CommunityCard event={event} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("renders the date in a <time> element with a dateTime attribute, linked to the event", () => {
    const event = makeEvent({
      date: "15/08/2026",
      isoDate: "2026-08-15",
      event: "https://meetup.com/helsinki-js/events/1",
    });
    renderCard(<CommunityCard event={event} />);
    const time = screen.getByText("15/08/2026").closest("time");
    expect(time).toHaveAttribute("dateTime", "2026-08-15");
    const eventLink = screen.getByRole("link", { name: "15/08/2026" });
    expect(eventLink).toHaveAttribute("href", "https://meetup.com/helsinki-js/events/1");
  });

  it("renders the date as plain text (no link) when there's no event URL", () => {
    const event = makeEvent({ date: "15/08/2026", isoDate: "2026-08-15", event: "" });
    renderCard(<CommunityCard event={event} />);
    expect(screen.queryByRole("link", { name: "15/08/2026" })).not.toBeInTheDocument();
    expect(screen.getByText("15/08/2026")).toBeInTheDocument();
  });

  it("prefers eventLocation over location when both are present", () => {
    const event = makeEvent({
      location: "Helsinki, Finland",
      eventLocation: "Maria 01, Helsinki",
    });
    renderCard(<CommunityCard event={event} />);
    expect(screen.getByText("Maria 01, Helsinki")).toBeInTheDocument();
    expect(screen.queryByText("Helsinki, Finland")).not.toBeInTheDocument();
  });

  it("falls back to location when eventLocation is absent", () => {
    const event = makeEvent({ location: "Helsinki, Finland", eventLocation: undefined });
    renderCard(<CommunityCard event={event} />);
    expect(screen.getByText("Helsinki, Finland")).toBeInTheDocument();
  });

  it("shows the member count only when present", () => {
    const withMembers = makeEvent({ members: 1200 });
    const { rerender } = renderCard(<CommunityCard event={withMembers} />);
    expect(screen.getByText("1200")).toBeInTheDocument();

    const withoutMembers = makeEvent({ members: undefined });
    rerender(
      <MemoryRouter>
        <CommunityCard event={withoutMembers} />
      </MemoryRouter>,
    );
    expect(screen.queryByText("1200")).not.toBeInTheDocument();
  });

  it("renders tags as links to their tag pages", () => {
    const event = makeEvent({ tags: ["javascript", "Data Science"] });
    renderCard(<CommunityCard event={event} />);
    expect(screen.getByRole("link", { name: "Communities tagged javascript" })).toHaveAttribute(
      "href",
      "/tags/javascript",
    );
    expect(screen.getByRole("link", { name: "Communities tagged Data Science" })).toHaveAttribute(
      "href",
      "/tags/data-science",
    );
  });

  it('links the location to its city page when it parses as "City, Country"', () => {
    const event = makeEvent({
      location: "Helsinki, Finland",
      eventLocation: undefined,
    });
    renderCard(<CommunityCard event={event} />);
    expect(screen.getByRole("link", { name: "Helsinki, Finland" })).toHaveAttribute(
      "href",
      "/locations/finland/helsinki",
    );
  });

  it("links the displayed event location to the community's city page", () => {
    const event = makeEvent({
      location: "Helsinki, Finland",
      eventLocation: "Maria 01, Helsinki",
    });
    renderCard(<CommunityCard event={event} />);
    const link = screen.getByRole("link", { name: "Maria 01, Helsinki" });
    expect(link).toHaveAttribute("href", "/locations/finland/helsinki");
    expect(screen.queryByText("Helsinki, Finland")).not.toBeInTheDocument();
  });

  it("renders an unparseable location as plain text (no link)", () => {
    const event = makeEvent({ location: "Online", eventLocation: undefined });
    renderCard(<CommunityCard event={event} />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Online" })).not.toBeInTheDocument();
  });
});
