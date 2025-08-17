/**
 * Scrapes events from a generic URL endpoint that returns JSON data
 * Used for communities that have custom event APIs or data sources
 */
export default async function scrapeUrl(events: string | URL | Request) {
  const response = await fetch(events);
  const data = await response.json();

  const event = data.future || data.past;

  return {
    event: event
      ? {
          date: event.date,
          link: event.link,
        }
      : undefined,
    members: data.members,
  };
}
