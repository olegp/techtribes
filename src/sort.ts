import { loadCommunities, saveCommunities } from "./utils.ts";

(async function main() {
  const input = await loadCommunities();

  const names = new Set<string>();
  input.forEach((item) => {
    if (names.has(item.name)) {
      console.error(`Duplicate name found: ${item.name}`);
    }
    names.add(item.name);
  });

  const sorted = input.sort((a, b) => a.name.localeCompare(b.name));
  await saveCommunities(sorted);
})();
