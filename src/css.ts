import * as fs from "fs";
import * as path from "path";

(async function () {
  const url =
    "https://cdn.jsdelivr.net/npm/@tabler/core/dist/css/tabler.min.css";
  const dir = path.join(process.cwd(), "site", "css");
  const file = path.join(dir, "tabler.css");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download CSS: ${response.status}`);
  }

  const cssContent = await response.text();
  fs.writeFileSync(file, cssContent);
})();