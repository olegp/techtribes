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

  let future: { date: string; link: string } | null = null;
  let past: { date: string; link: string } | null = null;

  if (
    eventData &&
    eventData["@type"] === "Organization" &&
    eventData.events &&
    Array.isArray(eventData.events)
  ) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let latestFutureEvent: { date: string; link: string } | null = null;
    let latestPastEvent: { date: string; link: string } | null = null;

    for (const event of eventData.events) {
      if (event.startDate) {
        const { formattedDate, eventDate } = parseDate(event.startDate);
        if (formattedDate && eventDate) {
          if (eventDate >= now) {
            if (
              !latestFutureEvent ||
              eventDate <
                new Date(latestFutureEvent.date.split("/").reverse().join("-"))
            ) {
              latestFutureEvent = {
                date: formattedDate,
                link: event["@id"] || events.toString(),
              };
            }
          } else {
            if (
              !latestPastEvent ||
              eventDate >
                new Date(latestPastEvent.date.split("/").reverse().join("-"))
            ) {
              latestPastEvent = {
                date: formattedDate,
                link: event["@id"] || events.toString(),
              };
            }
          }
        }
      }
    }

    future = latestFutureEvent;
    past = latestPastEvent;
  }

  return {
    future,
    past,
  };
}
