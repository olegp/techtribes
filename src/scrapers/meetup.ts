import * as cheerio from "cheerio";

function parseDate(input: string) {
  const regex = /(\w{3}), (\w{3}) (\d{1,2}), (\d{4})/;
  const match = input.match(regex);
  if (!match) return;

  const [, , monthStr, day, year] = match;
  const monthMap: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = monthMap[monthStr];
  const formattedDay = String(day).padStart(2, "0");
  return `${formattedDay}/${month}/${year}`;
}

function parseNumber(input: string) {
  return input
    .match(/\d{1,3}(?:,\d{3})*/g)
    ?.map((num) => parseInt(num.replace(/,/g, ""), 10))
    .pop();
}

export default async function scrape(events: string | URL | Request) {
  const response = await fetch(events);
  const html = await response.text();
  const $ = cheerio.load(html);

  const futureDate = $("#event-card-e-1 time").text().trim();
  const pastDate = $("#past-event-card-ep-1 time").text().trim();

  const eventDate = parseDate(futureDate || pastDate);
  const eventLink = futureDate
    ? $("#event-card-e-1").attr("href")?.split("?")[0]
    : $("#past-event-card-ep-1").attr("href")?.split("?")[0];

  let eventLocation: string | undefined;
  
  const eventCard = futureDate ? $("#event-card-e-1") : $("#past-event-card-ep-1");
  if (eventCard.length) {
    const locationElement = eventCard.find('.text-gray6, [class*="location"]').first();
    const locationText = locationElement.text().trim();
    
    if (locationText && !locationText.match(/\d+:\d+\s*(AM|PM|EEST|EET|UTC)/i)) {
      const cityMatch = locationText.match(/,\s*([^,]+)$/);
      if (cityMatch) {
        const city = cityMatch[1].trim();
        if (!city.match(/\d+:\d+\s*(AM|PM|EEST|EET|UTC)/i)) {
          eventLocation = `${city}, Finland`;
        }
      }
    }
  }
  

  return {
    event:
      eventDate && eventLink 
        ? { date: eventDate, link: eventLink, location: eventLocation } 
        : undefined,
    members: parseNumber($("#member-count-link div").text()),
  };
}
