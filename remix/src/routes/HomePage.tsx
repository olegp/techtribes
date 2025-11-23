import { useEffect, useState } from 'react'
import { CommunityCard } from '@/components/cards/CommunityCard'
import { getEvents, filterUpcomingEvents, filterPastEvents } from '@/lib/data'
import type { EventOutput } from '@/lib/types'

export function HomePage() {
  const [events, setEvents] = useState<EventOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  if (!events || !events.events || events.events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found.</p>
        </div>
      </div>
    )
  }

  const upcomingEvents = filterUpcomingEvents(events.events)
  const pastEvents = filterPastEvents(events.events)

  return (
    <div className="container mx-auto px-4 py-8">
      {upcomingEvents.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <CommunityCard key={`${event.name}-${event.date}-${index}`} community={event} />
            ))}
          </div>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Past Events</h2>
          <div className="space-y-4">
            {pastEvents.map((event, index) => (
              <CommunityCard key={`${event.name}-${event.date}-${index}`} community={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}