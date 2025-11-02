import { promises as fs } from "fs";
import * as yaml from "js-yaml";
import scrapeJson from "./scrapers/json.ts";
import scrapeMeetup from "./scrapers/meetup.ts";
import scrapeMeetabit from "./scrapers/meetabit.ts";
import scrapeLuma from "./scrapers/luma.ts";
import { loadCommunities } from "./utils.ts";

const events: any[] = [];

function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split("/");
  return new Date(+year, +month - 1, +day);
}

function isActiveEvent(eventDate: Date): boolean {
  const oneYearAgo = Date.now() - 31536000000;
  return eventDate.getTime() >= oneYearAgo;
}

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
    } else if (eventsUrl.startsWith("https://luma.com/")) {
      scraped = await scrapeLuma(eventsUrl);
    } else if (url) {
      scraped = await scrapeJson(url);
    }

    if (scraped?.event) {
      const eventDate = parseDate(scraped.event.date);

      if (!isActiveEvent(eventDate)) {
        console.warn(`Inactive: ${community.name} (${scraped.event.date})`);
        return;
      }

      const isoDate = eventDate.toISOString().split("T")[0];

      events.push({
        ...community,
        members: scraped.members,
        date: scraped.event.date,
        isoDate,
        event: scraped.event.link,
        eventLocation: scraped.event.location,
      });
    } else {
      console.warn(`Inactive: ${community.name} (no events found)`);
    }
  } catch (error) {
    console.warn(`Error scraping "${community.name}":`, error);
  }
}

(async function main() {
  const communities = await loadCommunities();

  await Promise.all(communities.map(scrape));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: any[] = [];
  const past: any[] = [];

  for (const event of events) {
    const eventDate = parseDate(event.date);

    if (eventDate >= today) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  const sortByDate = (a: any, b: any) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateA.getTime() - dateB.getTime();
  };

  const sortedUpcoming = upcoming.sort(sortByDate);
  const sortedPast = past.sort((a, b) => sortByDate(b, a));
  const sortedEvents = [...sortedUpcoming, ...sortedPast];

  await fs.writeFile(
    "site/_data/output.yml",
    yaml.dump({ events: sortedEvents })
  );
})();
