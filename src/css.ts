import { promises as fs } from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

(async function () {
  const dir = path.join(process.cwd(), "site", "assets", "css");

  await fs.mkdir(dir, { recursive: true });

  console.log("Building Tailwind CSS...");
  const inputFile = path.join(process.cwd(), "src", "input.css");
  const tailwindOutputFile = path.join(dir, "tailwind.css");

  try {
    const { stdout, stderr } = await execAsync(
      `npx postcss ${inputFile} -o ${tailwindOutputFile}`
    );
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    const stats = await fs.stat(tailwindOutputFile);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`Tailwind CSS built successfully (${fileSizeInKB} KB)`);
  } catch (error) {
    console.error("Error building Tailwind CSS:", error);
    throw error;
  }

  console.log("\nCopying Basecoat CSS...");
  const basecoatSource = path.join(
    process.cwd(),
    "node_modules",
    "basecoat-css",
    "dist",
    "basecoat.cdn.css"
  );
  const basecoatDest = path.join(dir, "basecoat.css");

  const basecoatContent = await fs.readFile(basecoatSource, "utf-8");
  await fs.writeFile(basecoatDest, basecoatContent);

  const basecoatStats = await fs.stat(basecoatDest);
  const basecoatSizeInKB = (basecoatStats.size / 1024).toFixed(2);
  console.log(`Basecoat CSS copied successfully (${basecoatSizeInKB} KB)`);
})();
