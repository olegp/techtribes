import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import sharp from "sharp";
import scrape from "./scrapers/meetup.ts";

interface Community {
  name: string;
  location: string;
  tags: string[];
  events: string;
  site?: string;
  logo?: string;
  url?: string;
  [key: string]: any;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function processLogo(url: string, file: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const output = await sharp(await response.arrayBuffer())
    .resize(128, 128, { fit: "cover" })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, output);
}

async function main() {
  const url = process.argv[2];
  const tagsArg = process.argv[3];

  if (!url) {
    console.error("Usage: npm run add <meetup-url> [tags]");
    console.error('Example: npm run add https://meetup.com/example/ "Python,Data Science,AI"');
    process.exit(1);
  }

  if (!url.includes("meetup.com")) {
    console.error("Error: Only Meetup.com URLs are supported");
    process.exit(1);
  }

  console.log(`Scraping ${url}...`);
  const data = await scrape(url);

  if (!data.name) {
    console.error("Error: Could not extract community name from URL");
    process.exit(1);
  }

  console.log(`Found: ${data.name}`);
  console.log(`Members: ${data.members || "unknown"}`);

  const yamlContent = await fs.readFile("data/communities.yml", "utf8");
  const communities = yaml.load(yamlContent) as Community[];

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
  await fs.writeFile("data/communities.yml", yaml.dump(sorted));

  console.log(`Added ${data.name} to communities.yml`);

  if (data.logo) {
    const slug = slugify(data.name);
    const file = `site/assets/logos/${slug}.png`;

    console.log(`Downloading and processing logo...`);
    await processLogo(data.logo, file);

    const updatedYaml = await fs.readFile("data/communities.yml", "utf8");
    const updatedCommunities = yaml.load(updatedYaml) as Community[];

    const community = updatedCommunities.find((c) => c.name === data.name);
    if (community) {
      community.logo = `${slug}.png`;
      await fs.writeFile("data/communities.yml", yaml.dump(updatedCommunities));
      console.log(`Logo saved as ${slug}.png`);
    }
  }

  console.log(`\nSuccess! ${data.name} has been added to the site.`);
}

main();
