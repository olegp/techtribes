export default async function scrape(events: string | URL | Request) {
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
