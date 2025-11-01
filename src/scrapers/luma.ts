import * as cheerio from "cheerio";

export default async function scrape(events: string | URL | Request) {
  const response = await fetch(events);
  const html = await response.text();
  const $ = cheerio.load(html);

  const content = $("script#__NEXT_DATA__").html();
  if (!content) return { event: null };

  let nextData: any;
  try {
    nextData = JSON.parse(content);
  } catch {
    return { event: null };
  }

  const eventDates = nextData.props?.pageProps?.initialData?.data?.event_start_ats;
  if (!eventDates || !Array.isArray(eventDates) || eventDates.length === 0) {
    return { event: null };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const allEvents = eventDates
    .map((dateString) => {
      const eventDate = new Date(dateString);
      if (isNaN(eventDate.getTime())) return null;

      const day = String(eventDate.getDate()).padStart(2, "0");
      const month = String(eventDate.getMonth() + 1).padStart(2, "0");
      const year = eventDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const normalizedDate = new Date(year, eventDate.getMonth(), eventDate.getDate());

      return {
        formattedDate,
        eventDate: normalizedDate,
        link: events.toString(),
        distance: Math.abs(normalizedDate.getTime() - now.getTime()),
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

  if (allEvents.length === 0) return { event: null };

  allEvents.sort((a, b) => a.distance - b.distance);
  const latestEvent = allEvents[0]!;

  return {
    event: {
      date: latestEvent.formattedDate,
      link: latestEvent.link,
    },
  };
}
