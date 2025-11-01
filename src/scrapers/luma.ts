import { loadHtml, formatDate } from "../utils.ts";

export default async function scrape(events: string | URL | Request) {
  const $ = await loadHtml(events);

  const content = $("script#__NEXT_DATA__").html();
  if (!content) return { event: null };

  let nextData: any;
  try {
    nextData = JSON.parse(content);
  } catch {
    return { event: null };
  }

  const rawName = $('meta[property="og:title"]').attr("content") || $("title").text().trim();
  const name = rawName.replace(/\s*[·•]\s*Events?\s+Calendar\s*/i, "").trim();

  const logoStyle = $('.logo-wrapper .logo a > div').attr("style");
  let logo: string | undefined;

  if (logoStyle) {
    const match = logoStyle.match(/url\(([^)]+)\)/);
    if (match) {
      logo = match[1];
    }
  }

  if (!logo) {
    logo = $('meta[property="og:image"]').attr("content");
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

      const formattedDate = formatDate(eventDate);

      const normalizedDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      return {
        formattedDate,
        eventDate: normalizedDate,
        link: events.toString(),
        distance: Math.abs(normalizedDate.getTime() - now.getTime()),
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

  if (allEvents.length === 0) return { event: null, name, logo };

  allEvents.sort((a, b) => a.distance - b.distance);
  const latestEvent = allEvents[0]!;

  return {
    event: {
      date: latestEvent.formattedDate,
      link: latestEvent.link,
    },
    name,
    logo,
  };
}
