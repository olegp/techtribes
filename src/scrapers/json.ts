export default async function scrapeUrl(events: string | URL | Request) {
  const response = await fetch(events);
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
}
