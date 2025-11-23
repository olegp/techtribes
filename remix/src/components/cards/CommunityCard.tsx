import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import type { EventData } from "@/lib/types"

interface CommunityCardProps {
  community: EventData
}

export function CommunityCard({ community }: CommunityCardProps) {
  const siteUrl = community.site || community.url || community.events

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <a
            href={siteUrl}
            className="block shrink-0 transition-opacity hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={community.logo.startsWith('http')
                ? community.logo
                : `/assets/logos/${community.logo}`}
              alt={`${community.name} logo`}
              className="size-16 rounded-xl object-cover ring-1 ring-foreground/10"
              loading="lazy"
            />
          </a>

          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">
                <a
                  href={siteUrl}
                  className="transition-colors hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {community.name}
                </a>
              </h3>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 opacity-70" />
                <a
                  href={community.event}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {community.date}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 opacity-70" />
                  {community.eventLocation || community.location}
                </div>

                {community.members && (
                  <>
                    <span className="opacity-50">·</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 opacity-70" />
                      {community.members.toLocaleString()}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {community.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}