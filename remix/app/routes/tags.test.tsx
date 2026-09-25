import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRoutesStub } from "react-router";
import type { ComponentProps } from "react";

import TagsIndex from "~/routes/tags";

afterEach(() => {
  cleanup();
});

// Shape mirrors the loader's return value.
const loaderData = {
  tags: [
    { tag: "JavaScript", slug: "javascript", count: 2 },
    { tag: "Python", slug: "python", count: 1 },
  ],
  total: 3,
};

function renderIndex() {
  // The route's ComponentProps include router internals we don't care about here.
  const props = { loaderData } as unknown as ComponentProps<typeof TagsIndex>;
  const Stub = createRoutesStub([
    {
      path: "/tags",
      Component: () => <TagsIndex {...props} />,
    },
  ]);
  return render(<Stub initialEntries={["/tags"]} />);
}

describe("TagsIndex", () => {
  it("renders the heading, intro with counts, and a grid of topic links", () => {
    renderIndex();

    expect(screen.getByRole("heading", { name: "Browse by topic" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "2 topics across 3 active communities. Pick one to see its communities and upcoming events.",
      ),
    ).toBeInTheDocument();

    const js = screen.getByRole("link", { name: /JavaScript/ });
    expect(js).toHaveAttribute("href", "/tags/javascript");
    expect(js).toHaveTextContent("2 communities");

    const python = screen.getByRole("link", { name: /Python/ });
    expect(python).toHaveAttribute("href", "/tags/python");
    expect(python).toHaveTextContent("1 community");
  });

  it("uses the singular community noun for a count of 1", () => {
    renderIndex();
    expect(screen.getByText("1 community")).toBeInTheDocument();
  });
});
