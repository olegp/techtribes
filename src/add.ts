import scrapeMeetup from "./scrapers/meetup.ts";
import scrapeLuma from "./scrapers/luma.ts";
import type { Community } from "./utils.ts";
import {
  LOGOS_DIR,
  slugify,
  processLogo,
  loadCommunities,
  saveCommunities,
} from "./utils.ts";

async function main() {
  const url = process.argv[2];
  const tagsArg = process.argv[3];

  if (!url) {
    console.error("Usage: npm run add <url> [tags]");
    console.error('Examples:');
    console.error('  npm run add https://meetup.com/example/ "Python,Data Science,AI"');
    console.error('  npm run add https://luma.com/example "Python,Data Science,AI"');
    process.exit(1);
  }

  const isMeetup = url.includes("meetup.com");
  const isLuma = url.includes("luma.com");

  if (!isMeetup && !isLuma) {
    console.error("Error: Only Meetup.com and Luma.com URLs are supported");
    process.exit(1);
  }

  console.log(`Scraping ${url}...`);

  let data: { name?: string; members?: number; logo?: string; event?: { date: string; link: string } | null };

  if (isMeetup) {
    data = await scrapeMeetup(url);
  } else {
    data = await scrapeLuma(url);
  }

  if (isLuma && !data.name) {
    console.error("Error: Could not extract community name from Luma URL");
    console.error("Please add the community manually to data/communities.yml");
    process.exit(1);
  }

  if (isMeetup && !data.name) {
    console.error("Error: Could not extract community name from Meetup URL");
    process.exit(1);
  }

  console.log(`Found: ${data.name}`);
  if (data.members) {
    console.log(`Members: ${data.members}`);
  }

  const communities = await loadCommunities();

  const exists = communities.find((c) => c.name === data.name || c.events === url);
  if (exists) {
    console.error(`Error: Community "${data.name}" already exists`);
    process.exit(1);
  }

  const tags = tagsArg
    ? tagsArg.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const newCommunity: Community = {
    name: data.name,
    location: "Helsinki, Finland",
    tags,
    events: url,
  };

  if (data.logo) {
    newCommunity.logo = data.logo;
  }

  communities.push(newCommunity);

  const sorted = communities.sort((a, b) => a.name.localeCompare(b.name));
  await saveCommunities(sorted);

  console.log(`Added ${data.name} to communities.yml`);

  if (data.logo) {
    const slug = slugify(data.name);
    const file = `${LOGOS_DIR}${slug}.png`;

    console.log(`Downloading and processing logo...`);
    await processLogo(data.logo, file);

    const updatedCommunities = await loadCommunities();

    const community = updatedCommunities.find((c) => c.name === data.name);
    if (community) {
      community.logo = `${slug}.png`;
      await saveCommunities(updatedCommunities);
      console.log(`Logo saved as ${slug}.png`);
    }
  }

  console.log(`\nSuccess! ${data.name} has been added to the site.`);
}

main();
