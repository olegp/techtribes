import * as cheerio from "cheerio";

function parseDate(startDate: string) {
  const date = new Date(startDate);
  if (isNaN(date.getTime())) return null;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return {
    formattedDate: `${day}/${month}/${year}`,
    eventDate: new Date(year, date.getMonth(), date.getDate()),
  };
}

export default async function scrape(events: string | URL | Request) {
  const response = await fetch(events);
  const html = await response.text();
  const $ = cheerio.load(html);

  const jsonLdScript = $('script[type="application/ld+json"]').html();
  if (!jsonLdScript) return { event: null };

  let eventData: any;
  try {
    eventData = JSON.parse(jsonLdScript);
  } catch {
    return { event: null };
  }

  if (
    eventData?.["@type"] !== "Organization" ||
    !Array.isArray(eventData.events)
  ) {
    return { event: null };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const validEvents = eventData.events
    .map((eventItem) => {
      if (!eventItem.startDate) return null;
      const parsed = parseDate(eventItem.startDate);
      if (!parsed) return null;

      return {
        ...parsed,
        link: eventItem["@id"] || events.toString(),
        distance: Math.abs(parsed.eventDate.getTime() - now.getTime()),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);

  const latestEvent = validEvents[0];

  return {
    event: latestEvent
      ? {
          date: latestEvent.formattedDate,
          link: latestEvent.link,
        }
      : null,
  };
}
