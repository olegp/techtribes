import * as cheerio from "cheerio";

function parseDate(dateTime: string) {
  const cleanDateTime = dateTime.replace(/\[.*?\]$/, '');
  const date = new Date(cleanDateTime);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseNumber(input: string) {
  return input
    .match(/\d{1,3}(?:,\d{3})*/g)
    ?.map((num) => parseInt(num.replace(/,/g, ""), 10))
    .pop();
}

export default async function scrape(events: string | URL | Request) {
  const response = await fetch(events, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    }
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  const upcomingLink = $('a[href*="eventOrigin=group_upcoming_events"]').first().attr("href");
  const pastLink = $('a[href*="eventOrigin=group_past_events"]').first().attr("href");

  const firstTime = $('time[datetime]').first().attr("datetime");

  const eventDate = firstTime ? parseDate(firstTime) : undefined;
  const eventLink = upcomingLink || pastLink;

  const cleanLink = eventLink?.split("?")[0];

  const name = $('meta[property="og:title"]').attr("content") || $("title").text().replace(" | Meetup", "").trim();
  const logo = $('meta[property="og:image"]').attr("content");

  return {
    event: eventDate && cleanLink ? { date: eventDate, link: cleanLink } : undefined,
    members: parseNumber($("#member-count-link").text()),
    name,
    logo,
  };
}
