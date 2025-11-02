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

function parseDate(
  dayNumber: string,
  monthName: string,
  isFutureEvent: boolean
) {
  const month = months[monthName.toLowerCase().trim()];
  const day = dayNumber.padStart(2, "0");
  const currentYear = new Date().getFullYear();

  const eventDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  let year = currentYear;
  if (isFutureEvent && eventDate < currentDate) year++;
  else if (!isFutureEvent && eventDate > currentDate) year--;

  return `${day}/${month}/${year}`;
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
    event = {
      date: parseDate(
        futureEvent.find(".day-number").text(),
        futureEvent.find(".month-name").text(),
        true
      ),
      link: "https://www.meetabit.com" + futureEvent.find("a").attr("href"),
    };
  } else if (pastEvent.length) {
    event = {
      date: parseDate(
        pastEvent.find(".day-number").text(),
        pastEvent.find(".month-name").text(),
        false
      ),
      link: "https://www.meetabit.com" + pastEvent.find("a").attr("href"),
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
