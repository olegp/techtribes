import { promises as fs } from "fs";
import * as yaml from "js-yaml";
import scrapeJson from "./scrapers/json.ts";
import scrapeMeetup from "./scrapers/meetup.ts";
import scrapeMeetabit from "./scrapers/meetabit.ts";
import scrapeLuma from "./scrapers/luma.ts";

const events: any[] = [];

async function scrape(community: {
  name: string;
  events: string;
  url?: string;
}) {
  try {
    const { events: eventsUrl, url } = community;
    let scraped: any;
    if (eventsUrl.startsWith("https://www.meetup.com/")) {
      scraped = await scrapeMeetup(eventsUrl);
    } else if (eventsUrl.startsWith("https://www.meetabit.com/")) {
      scraped = await scrapeMeetabit(eventsUrl);
    } else if (eventsUrl.startsWith("https://lu.ma/")) {
      scraped = await scrapeLuma(eventsUrl);
    } else if (url) {
      scraped = await scrapeJson(url);
    }

    if (scraped && scraped.event) {
      const members = scraped.members;
      const [day, month, year] = scraped.event.date.split("/");
      const eventDate = new Date(+year, +month - 1, +day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate.getTime() < Date.now() - 31536000000) {
        console.warn(`Inactive: ${community.name} (${scraped.event.date})`);
        return;
      }

      events.push({
        ...community,
        members,
        date: scraped.event.date,
        event: scraped.event.link,
      });
    }
  } catch (error) {
    console.warn(`Error scraping "${community.name}":`, error);
  }
}

(async function main() {
  const file = await fs.readFile("data/communities.yml", "utf8");
  const input = yaml.load(file) as any[];
  const date = (event: any) => +event.date.split("/").reverse().join("");
  await Promise.all(input.map(scrape));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: any[] = [];
  const past: any[] = [];

  for (const event of events) {
    const [day, month, year] = event.date.split("/");
    const eventDate = new Date(+year, +month - 1, +day);

    if (eventDate >= today) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  const sortedUpcoming = upcoming.sort((a, b) => date(a) - date(b));

  const sortedPast = past.sort((a, b) => date(b) - date(a));

  const sortedEvents = [...sortedUpcoming, ...sortedPast];

  await fs.writeFile(
    "site/_data/output.yml",
    yaml.dump({
      events: sortedEvents,
    })
  );
})();
