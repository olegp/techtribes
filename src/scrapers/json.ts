export default async function scrapeUrl(events: string | URL | Request) {
  try {
    const response = await fetch(events);

    if (!response.ok) {
      console.warn(`HTTP ${response.status}: ${events}`);
      return { event: undefined, members: null };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.warn(`Expected JSON but got ${contentType}: ${events}`);
      return { event: undefined, members: null };
    }

    const data = await response.json();
    const event = data.event;

    return {
      event: event
        ? {
            date: event.date,
            link: event.link,
          }
        : undefined,
      members: data.members,
    };
  } catch (error) {
    console.warn(`Error scraping JSON from ${events}:`, error);
    return { event: undefined, members: null };
  }
}
