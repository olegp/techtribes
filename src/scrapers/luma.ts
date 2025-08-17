import * as cheerio from "cheerio";

function parseDate(startDate: string) {
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    return { formattedDate: null, eventDate: null };
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const eventDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return { formattedDate, eventDate };
}

export default async function scrape(events: string | URL | Request) {
  const response = await fetch(events);
  const html = await response.text();

  const $ = cheerio.load(html);

  const jsonLdScript = $('script[type="application/ld+json"]').html();
  let eventData: any = null;

  if (jsonLdScript) {
    try {
      eventData = JSON.parse(jsonLdScript);
    } catch (e) {}
  }

  let event: { date: string; link: string } | null = null;

  if (
    eventData &&
    eventData["@type"] === "Organization" &&
    eventData.events &&
    Array.isArray(eventData.events)
  ) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let latestEvent: { date: string; link: string } | null = null;
    let latestEventDate: Date | null = null;

    for (const eventItem of eventData.events) {
      if (eventItem.startDate) {
        const { formattedDate, eventDate } = parseDate(eventItem.startDate);
        if (formattedDate && eventDate) {
          // Find the most recent event (closest to today)
          if (
            !latestEventDate ||
            Math.abs(eventDate.getTime() - now.getTime()) <
              Math.abs(latestEventDate.getTime() - now.getTime())
          ) {
            latestEvent = {
              date: formattedDate,
              link: eventItem["@id"] || events.toString(),
            };
            latestEventDate = eventDate;
          }
        }
      }
    }

    event = latestEvent;
  }

  return {
    event,
  };
}
