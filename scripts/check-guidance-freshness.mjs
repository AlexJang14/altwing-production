import fs from "node:fs";
import path from "node:path";

const files = ["src/features/guidance/opportunityCatalog.ts", "src/features/guidance/additionalOpportunities.ts"];
const source = files.map(file => fs.readFileSync(path.resolve(file), "utf8")).join("\n");
const dates = [...source.matchAll(/"?lastVerified"?\s*:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((match) => match[1]);

if (dates.length === 0) {
  console.error("No opportunity verification dates found.");
  process.exit(1);
}

const now = new Date();
const stale = dates.filter((date) => {
  const ageMs = now.getTime() - new Date(`${date}T00:00:00Z`).getTime();
  return ageMs > 14 * 24 * 60 * 60 * 1000;
});

console.log(`Guidance opportunities: ${dates.length} source-check date records.`);
console.log(`Newest verification: ${dates.slice().sort().at(-1)}`);

if (stale.length > 0) {
  console.error(`${stale.length} opportunity record(s) are older than 14 days. Re-check official sources before release.`);
  process.exit(1);
}

console.log("Source-check date age check passed. This does not reverify program facts.");
