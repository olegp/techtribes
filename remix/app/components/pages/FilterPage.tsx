/**
 * Shared renderer for the tag and location leaf pages
 * (/tags/:tag, /locations/:country[/:city]).
 *
 * The three routes only differ in how they compute this data; the rendering —
 * breadcrumb, heading + stats line, event list — lives here. Reuses <EventList>,
 * whose search + tag-filter pills cover discovery within the page; cross-page
 * navigation happens via the breadcrumbs and the header navbar.
 */
import { data, Link } from "react-router";

import { EventList } from "~/components/events/EventList";
import { Button } from "~/components/ui/button";
import type { CommunityEvent } from "~/lib/types";

/**
 * Client loader for the filter routes. A mistyped slug is served 404.html, which
 * then tries to fetch a `.data` file that was never prerendered; report that as
 * a 404 instead of a generic load error.
 */
export async function loadOrNotFound<T>(serverLoader: () => Promise<T>): Promise<T> {
  try {
    return await serverLoader();
  } catch {
    throw data(null, { status: 404 });
  }
}

export interface Crumb {
  label: string;
  to?: string;
}

export interface FilterPageData {
  /** False when no community matches (only reachable by hand-typing a URL). */
  found: boolean;
  /** The unrecognised URL fragment, shown in the not-found message. */
  missedValue?: string;
  crumbs: Crumb[];
  heading: string;
  statsLine: string;
  upcoming: CommunityEvent[];
  past: CommunityEvent[];
  /** Canonical path of this page, used by `meta()` for the canonical URL. */
  pagePath: string;
  /** Full page title without the " | Techtribes" suffix, e.g.
   * "JavaScript communities in Finland" or "Tech communities in Turku". */
  pageTitle: string;
  /** The place phrase for the description sentence, e.g. "Finland" or
   * "Turku, Finland". */
  pagePlace: string;
  /** For tag pages, the display name of the tag ("AI"); used in the meta
   * description ("active AI communities"). Omitted for location pages. */
  topic?: string;
}

export function FilterPage({ data }: { data: FilterPageData }) {
  if (!data.found) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 text-center md:p-12">
        <header className="flex max-w-sm flex-col items-center gap-3">
          <h1 className="text-2xl font-bold">Nothing here (yet)</h1>
          <p className="text-sm/relaxed text-muted-foreground">
            No communities found for &ldquo;{data.missedValue}&rdquo;. It may have gone inactive
            &mdash; only communities with events in the past year are listed.
          </p>
        </header>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        {data.crumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
            ) : null}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              // The leaf page itself: plain text so it reads as the trail's end.
              <span aria-current="page" className="font-medium text-foreground">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl leading-tight font-bold md:text-4xl">{data.heading}</h1>
        <p className="text-muted-foreground">{data.statsLine}</p>
      </header>

      <EventList upcoming={data.upcoming} past={data.past} />
    </div>
  );
}
