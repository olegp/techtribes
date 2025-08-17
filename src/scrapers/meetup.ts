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

function isDateInFuture(dateString: string): boolean {
  const [day, month, year] = dateString.split("/");
  const eventDate = new Date(+year, +month - 1, +day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return eventDate >= today;
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
  const parsedFutureDate = futureDate ? parseDate(futureDate) : undefined;

  const future =
    parsedFutureDate && isDateInFuture(parsedFutureDate)
      ? {
          date: parsedFutureDate,
          link: $("#event-card-e-1").attr("href")?.split("?").shift(),
        }
      : undefined;

  const pastDate = $("#past-event-card-ep-1 time").text().trim();
  const parsedPastDate = pastDate ? parseDate(pastDate) : undefined;

  let past = parsedPastDate
    ? {
        date: parsedPastDate,
        link: $("#past-event-card-ep-1").attr("href")?.split("?").shift(),
      }
    : undefined;

  if (!past && parsedFutureDate && !isDateInFuture(parsedFutureDate)) {
    past = {
      date: parsedFutureDate,
      link: $("#event-card-e-1").attr("href")?.split("?").shift(),
    };
  }

  return {
    future,
    past,
    members: parseNumber($("#member-count-link div").text()),
  };
}
