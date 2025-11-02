import { promises as fs } from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { loadCommunities, saveCommunities } from "./utils.ts";

(async function main() {
  const outputFile = await fs.readFile("site/_data/output.yml", "utf8");
  const output = yaml.load(outputFile) as { inactive: string[] };

  const inactiveCommunityNames = new Set(output.inactive || []);

  const allCommunities = await loadCommunities();

  const activeCommunities = allCommunities.filter(
    (community) => !inactiveCommunityNames.has(community.name)
  );

  const prunedCommunities = allCommunities.filter((community) =>
    inactiveCommunityNames.has(community.name)
  );

  if (prunedCommunities.length > 0) {
    await saveCommunities(activeCommunities);
    for (const community of prunedCommunities) {
      console.log(`Pruned: ${community.name}`);

      if (community.logo && !community.logo.startsWith("http")) {
        const logoPath = path.join("site/assets/logos", community.logo);
        try {
          await fs.unlink(logoPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            console.warn(`Failed to delete logo ${logoPath}:`, error);
          }
        }
      }
    }
  }
})();
