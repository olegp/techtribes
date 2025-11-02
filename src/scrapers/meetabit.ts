import * as cheerio from "cheerio";

const months: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

function parseDate(dayNumber: string, monthName: string, year: string) {
  const month = months[monthName.toLowerCase().trim()];
  const day = dayNumber.padStart(2, "0");
  return `${day}/${month}/${year}`;
}

async function fetchEventYear(eventUrl: string): Promise<string> {
  const $ = cheerio.load(await (await fetch(eventUrl)).text());
  const monthNameText = $(".month-name").first().text().trim();
  const yearMatch = monthNameText.match(/,\s*(\d{4})/);
  return yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
}

export default async function scrape(events: string | URL | Request) {
  const $ = cheerio.load(await (await fetch(events)).text());

  const futureEvent = $('.col-sm-7 h3:contains("Upcoming Event")')
    .next("ul")
    .find("li")
    .first();
  const pastEvent = $('.col-sm-7 h3:contains("Previous Event")')
    .next("ul")
    .find("li")
    .first();

  let event: { date: string; link: string } | undefined;

  if (futureEvent.length) {
    const link = "https://www.meetabit.com" + futureEvent.find("a").attr("href");
    const year = await fetchEventYear(link);
    event = {
      date: parseDate(
        futureEvent.find(".day-number").text(),
        futureEvent.find(".month-name").text(),
        year
      ),
      link,
    };
  } else if (pastEvent.length) {
    const link = "https://www.meetabit.com" + pastEvent.find("a").attr("href");
    const year = await fetchEventYear(link);
    event = {
      date: parseDate(
        pastEvent.find(".day-number").text(),
        pastEvent.find(".month-name").text(),
        year
      ),
      link,
    };
  }

  const name = $(".col-sm-7 h1").first().text().trim();
  const logo = $(".col-sm-5 .img-thumbnail img").attr("src");
  const location = $(".col-sm-7 h1").next("p").text().trim();

  return {
    name,
    logo,
    event,
    members: $("h1~ p+ p").text().match(/\d+/g)?.map(Number).pop(),
    location,
  };
}
