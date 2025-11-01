import type { Community } from "./utils.ts";
import {
  LOGOS_DIR,
  slugify,
  processLogo,
  loadCommunities,
  saveCommunities,
} from "./utils.ts";

(async function main() {
  const communities = await loadCommunities();

  for (const community of communities) {
    if (!community.logo || !community.name) continue;

    const logoUrl = community.logo.trim();
    if (!logoUrl.startsWith("http://") && !logoUrl.startsWith("https://"))
      continue;

    const slug = slugify(community.name);
    const file = `${LOGOS_DIR}${slug}.png`;

    console.log(`${slug}.png`);
    await processLogo(logoUrl, file);
    community.logo = `${slug}.png`;
  }

  await saveCommunities(communities);
})();
