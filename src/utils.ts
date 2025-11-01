import path from "path";
import { promises as fs } from "fs";
import yaml from "js-yaml";
import sharp from "sharp";
import * as cheerio from "cheerio";

export const COMMUNITIES_FILE = "data/communities.yml";
export const LOGOS_DIR = "site/assets/logos/";

export interface Community {
  name: string;
  location: string;
  tags: string[];
  events: string;
  site?: string;
  logo?: string;
  url?: string;
  [key: string]: any;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function processLogo(url: string, file: string) {
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

export async function loadCommunities(): Promise<Community[]> {
  const file = await fs.readFile(COMMUNITIES_FILE, "utf8");
  return yaml.load(file) as Community[];
}

export async function saveCommunities(communities: Community[]): Promise<void> {
  await fs.writeFile(COMMUNITIES_FILE, yaml.dump(communities));
}

export async function loadHtml(url: string | URL | Request): Promise<cheerio.CheerioAPI> {
  const response = await fetch(url);
  const html = await response.text();
  return cheerio.load(html);
}
