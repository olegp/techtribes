import * as cheerio from "cheerio";

function parseDate(input: string) {
  const regex = /(\w{3}), (\w{3}) (\d{1,2}), (\d{4})/;
  const match = input.match(regex);

  if (!match) return;

  const [, , monthStr, day, year] = match;

  const monthMap = {
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

  let eventDate: string | undefined;
  let eventLink: string | undefined;

  if (futureDate) {
    eventDate = parseDate(futureDate);
    eventLink = $("#event-card-e-1").attr("href")?.split("?").shift();
  } else if (pastDate) {
    eventDate = parseDate(pastDate);
    eventLink = $("#past-event-card-ep-1").attr("href")?.split("?").shift();
  }

  return {
    event:
      eventDate && eventLink
        ? {
            date: eventDate,
            link: eventLink,
          }
        : undefined,
    members: parseNumber($("#member-count-link div").text()),
  };
}
