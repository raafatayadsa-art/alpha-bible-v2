#!/usr/bin/env node
/**
 * Convert saved WebFetch markdown snapshots in snapshots/*.md to HTML cache files.
 * Use when direct HTTP from local machine is blocked but snapshots were fetched via WebFetch.
 *
 *   node scripts/st-takla-scraper/import-snapshots.mjs
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { markdownSnapshotToHtml } from "./lib/markdown-to-html.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS = join(__dirname, "snapshots");
const CACHE = join(__dirname, "output", "cache");

async function main() {
  await mkdir(CACHE, { recursive: true });
  let count = 0;
  const files = await readdir(SNAPSHOTS).catch(() => []);
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const md = await readFile(join(SNAPSHOTS, file), "utf8");
    const html = markdownSnapshotToHtml(md);
    const outName = file.replace(/\.md$/, ".html");
    await writeFile(join(CACHE, outName), html, "utf8");
    count++;
  }
  console.log(`Imported ${count} snapshot(s) to ${CACHE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
