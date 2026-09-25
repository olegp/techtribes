import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Search, X } from "lucide-react";

import { CommunityCard } from "~/components/cards/CommunityCard";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { eventIsoDate } from "~/lib/events";
import { collectTags, filterEvents } from "~/lib/filter";
import { ADD_COMMUNITY_URL } from "~/lib/site";
import type { CommunityEvent } from "~/lib/types";
import { cn } from "~/lib/utils";

export interface EventListProps {
  upcoming: CommunityEvent[];
  past: CommunityEvent[];
}

/** How many tag pills to offer as quick filters. */
const TAG_LIMIT = 12;

const eventKey = (event: CommunityEvent) => `${event.events}-${eventIsoDate(event)}`;

/**
 * The whole home-page list. Server-rendered (prerendered) with an empty filter
 * so every event is present in the static HTML; the search/tag UI is a
 * client-side progressive enhancement that only narrows what is already there.
 */
export function EventList({ upcoming, past }: EventListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // The page is prerendered without search params, so defer reading them until
  // after hydration. From then on the URL is the source of truth, which also
  // makes same-route navigation and browser history update the filter.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const query = hydrated ? (searchParams.get("q") ?? "") : "";
  const activeTags = useMemo(
    () =>
      hydrated
        ? (searchParams.get("tags") ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    [hydrated, searchParams],
  );

  const setFilters = (nextQuery: string, nextTags: string[]) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextTags.length) params.set("tags", nextTags.join(","));
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const allEvents = useMemo(() => [...upcoming, ...past], [upcoming, past]);
  const tags = useMemo(() => collectTags(allEvents).slice(0, TAG_LIMIT), [allEvents]);
  const filteredUpcoming = useMemo(
    () => filterEvents(upcoming, query, activeTags),
    [upcoming, query, activeTags],
  );
  const filteredPast = useMemo(
    () => filterEvents(past, query, activeTags),
    [past, query, activeTags],
  );

  const isFiltering = query.trim().length > 0 || activeTags.length > 0;
  const shown = filteredUpcoming.length + filteredPast.length;
  const total = allEvents.length;
  const nothingMatches = shown === 0;

  const toggleTag = (tag: string) => {
    setFilters(
      query,
      activeTags.some((t) => t.toLowerCase() === tag.toLowerCase())
        ? activeTags.filter((t) => t.toLowerCase() !== tag.toLowerCase())
        : [...activeTags, tag],
    );
  };

  const clearFilters = () => {
    setFilters("", []);
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="mb-8 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h2 className="text-2xl leading-tight font-bold">Upcoming events</h2>
          </div>
          <div className="ml-auto print:hidden">
            <Button
              asChild
              size="lg"
              className="h-9 gap-2 rounded-[12px] border-0 bg-[#5b6cf6] px-4 py-2 text-sm font-medium hover:bg-[#5b6cf6] hover:brightness-95"
            >
              <a href={ADD_COMMUNITY_URL}>
                <Plus className="size-5" aria-hidden="true" />
                <span className="text-nowrap">Add a community</span>
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setFilters(event.target.value, activeTags)}
              placeholder="Search communities, cities or topics…"
              aria-label="Search communities, cities or topics"
              className="h-10 rounded-xl bg-background pr-10 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setFilters("", activeTags);
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map(({ tag, count }) => {
              const pressed = activeTags.some((t) => t.toLowerCase() === tag.toLowerCase());
              return (
                <Badge
                  key={tag}
                  asChild
                  variant="secondary"
                  className={cn(
                    "h-auto cursor-pointer rounded-lg border-0 bg-transparent px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-blue-500/50 transition-colors hover:bg-blue-500/10",
                    pressed && "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggleTag(tag)}
                    aria-label={`Filter by ${tag}`}
                  >
                    {tag}
                    <span className="text-muted-foreground tabular-nums">{count}</span>
                  </button>
                </Badge>
              );
            })}
            {isFiltering ? (
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          {/* Always mounted: a live region only announces changes that happen
              while it is already in the document. */}
          <p
            className={cn("text-sm text-muted-foreground", !isFiltering && "sr-only")}
            aria-live="polite"
          >
            {isFiltering ? `Showing ${shown} of ${total} communities` : ""}
          </p>
        </div>
      </div>

      {nothingMatches ? (
        <div className="mb-12 rounded-xl bg-foreground/5 px-6 py-12 text-center ring-1 ring-foreground/5">
          <p className="text-base font-medium text-foreground">No communities match your filter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or clear the selected tags.
          </p>
          <Button type="button" variant="outline" size="lg" onClick={clearFilters} className="mt-4">
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-12">
            {filteredUpcoming.length ? (
              <div className="space-y-4">
                {filteredUpcoming.map((event) => (
                  <CommunityCard key={eventKey(event)} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No matching upcoming events.</p>
            )}
          </div>

          <div className="mb-8 pb-6 print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h2 className="text-2xl leading-tight font-bold">Past events</h2>
              </div>
            </div>
          </div>

          <div className="mb-12">
            {filteredPast.length ? (
              <div className="space-y-4">
                {filteredPast.map((event) => (
                  <CommunityCard key={eventKey(event)} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No matching past events.</p>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default EventList;
