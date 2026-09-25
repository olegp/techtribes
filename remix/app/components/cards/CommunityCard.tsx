import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { eventIsoDate, logoUrl } from "~/lib/events";
import { locationUrl, parseLocation, slugify, tagUrl } from "~/lib/taxonomy";
import type { CommunityEvent } from "~/lib/types";
import { cn } from "~/lib/utils";

export interface CommunityCardProps {
  event: CommunityEvent;
}

/** Shared look of a tag pill. */
const TAG_CLASS =
  "h-auto rounded-lg border-0 bg-transparent px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-blue-500/50";

export function CommunityCard({ event }: CommunityCardProps) {
  const link = event.site ?? event.events;
  const logo = logoUrl(event.logo);
  const isoDate = eventIsoDate(event);
  const loc = parseLocation(event.location);

  return (
    <Card className="group gap-0 overflow-hidden rounded-xl py-0 transition-all duration-200 hover:shadow-lg hover:ring-primary/20">
      <div className="flex gap-4 p-6">
        <div className="shrink-0">
          <a href={link} className="block transition-opacity duration-200 hover:opacity-80">
            {logo ? (
              <img
                src={logo}
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-foreground/10"
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-foreground/10 text-xl font-semibold text-muted-foreground ring-1 ring-foreground/10"
              >
                {event.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </a>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg leading-snug font-semibold text-foreground">
                <a href={link} className="transition-colors duration-200 hover:text-primary">
                  {event.name}
                </a>
              </h3>
            </div>
            <time
              dateTime={isoDate}
              className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Calendar className="size-4 opacity-70" aria-hidden="true" />
              {event.event ? (
                <a
                  href={event.event}
                  className="text-primary transition-colors duration-200 hover:underline"
                >
                  {event.date}
                </a>
              ) : (
                <span className="text-primary">{event.date}</span>
              )}
            </time>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 opacity-70" aria-hidden="true" />
                  {loc ? (
                    <Link
                      to={locationUrl(slugify(loc.country), slugify(loc.city))}
                      className="transition-colors hover:text-foreground hover:underline"
                    >
                      {event.eventLocation ?? event.location}
                    </Link>
                  ) : (
                    (event.eventLocation ?? event.location)
                  )}
                </div>
                {event.members ? (
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-50" aria-hidden="true">
                      ·
                    </span>
                    <Users className="size-4 opacity-70" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Members: </span>
                      {event.members}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {event.tags?.length ? (
              <div className="w-full md:w-auto">
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={tagUrl(slugify(tag))}
                      aria-label={`Communities tagged ${tag}`}
                    >
                      <Badge
                        variant="secondary"
                        className={cn(TAG_CLASS, "transition-colors hover:bg-foreground/10")}
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CommunityCard;
