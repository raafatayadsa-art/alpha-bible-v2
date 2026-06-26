/**
 * Paul epistle portrait cards (8 core letters) — NT blue theme + subtitle.
 * Run: node scripts/generate-bible-nt-paul-portrait-cards.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  CARD_W,
  CARD_H,
  ensureFont,
  loadPathMap,
  loadTexture,
  rasterizeSvg,
  renderBookPortraitSvg,
} from "./lib/bible-portrait-art.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bible-icons", "books");
const fontPath = join(root, "scripts", "assets", "NotoNaskhArabic-Bold.ttf");
const fontUrl = pathToFileURL(fontPath).href;

/** Eight Paul epistles — subtitle baked: رسالة بولس الرسول */
const PAUL_BOOKS = [
  { id: "Romans", name: "رومية", symbol: "crossHill", color: "#6a4ab5", colorLight: "#9578d4", category: "رسالة", order: 6, paulSubtitle: "رسالة بولس الرسول" },
  { id: "1Corinthians", name: "كورنثوس الأول", symbol: "column", color: "#3d5a9a", colorLight: "#6a88c4", category: "رسالة", order: 7, paulSubtitle: "رسالة بولس الرسول" },
  { id: "2Corinthians", name: "كورنثوس الثاني", symbol: "letter", color: "#4a6bb5", colorLight: "#7894d4", category: "رسالة", order: 8, paulSubtitle: "رسالة بولس الرسول" },
  { id: "Galatians", name: "غلاطية", symbol: "chains", color: "#8a6ec1", colorLight: "#b09ae0", category: "رسالة", order: 9, paulSubtitle: "رسالة بولس الرسول" },
  { id: "Ephesians", name: "أفسس", symbol: "church", color: "#4a9e9e", colorLight: "#72c8c8", category: "رسالة", order: 10, paulSubtitle: "رسالة بولس الرسول" },
  { id: "Philippians", name: "فيلبي", symbol: "anchor", color: "#6a4ab5", colorLight: "#9578d4", category: "رسالة", order: 11, paulSubtitle: "رسالة بولس الرسول" },
  { id: "Colossians", name: "كولوسي", symbol: "crownThorns", color: "#5a6a8a", colorLight: "#8898b8", category: "رسالة", order: 12, paulSubtitle: "رسالة بولس الرسول" },
  { id: "1Thessalonians", name: "تسالونيكي الأول", symbol: "dawn", color: "#4a6bb5", colorLight: "#7894d4", category: "رسالة", order: 13, paulSubtitle: "رسالة بولس الرسول" },
];

const pathMap = await loadPathMap(root);
const textureBuf = await loadTexture(root, "src/features/bible-v2/assets/nt-card-bg-v4.jpg", CARD_W, CARD_H);

await ensureFont(fontPath);
await mkdir(outDir, { recursive: true });

for (const book of PAUL_BOOKS) {
  const svg = renderBookPortraitSvg(book, pathMap, fontUrl, "nt");
  const buf = await rasterizeSvg(svg, textureBuf, 95);
  await writeFile(join(outDir, `${book.id}.webp`), buf);
  console.log(`✓ ${book.id}.webp — ${book.paulSubtitle} · ${book.name}`);
}

console.log(`\nGenerated ${PAUL_BOOKS.length} Paul epistle cards (${CARD_W}×${CARD_H})`);
