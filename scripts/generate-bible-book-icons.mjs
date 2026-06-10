/**
 * Generates premium circular book icons (256×256 webp) for all 66 Bible books.
 * Run: node scripts/generate-bible-book-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bible-icons", "books");

const BOOK_IDS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1Samuel", "2Samuel", "1Kings", "2Kings",
  "1Chronicles", "2Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "SongOfSolomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1Corinthians", "2Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1Thessalonians", "2Thessalonians",
  "1Timothy", "2Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1Peter", "2Peter", "1John", "2John", "3John", "Jude", "Revelation",
];

// Inline registry (mirrors book-symbol-registry.ts) for Node script
const REGISTRY = {
  Genesis: { symbol: "creation", color: "#4a7c59", colorLight: "#7ab58a" },
  Exodus: { symbol: "staffSea", color: "#3d5a9a", colorLight: "#6a8ac4" },
  Leviticus: { symbol: "altar", color: "#8a4545", colorLight: "#b87070" },
  Numbers: { symbol: "tent", color: "#6a5a8a", colorLight: "#9588b0" },
  Deuteronomy: { symbol: "tablets", color: "#7a5a18", colorLight: "#b8893a" },
  Joshua: { symbol: "trumpet", color: "#4a9e6e", colorLight: "#72c49a" },
  Judges: { symbol: "scales", color: "#5b6b8a", colorLight: "#8494b5" },
  Ruth: { symbol: "wheat", color: "#c98a3c", colorLight: "#e8b86a" },
  "1Samuel": { symbol: "oil", color: "#4a6bb5", colorLight: "#7894d4" },
  "2Samuel": { symbol: "throne", color: "#6a4ab5", colorLight: "#9578d4" },
  "1Kings": { symbol: "crown", color: "#8a6ec1", colorLight: "#b09ae0" },
  "2Kings": { symbol: "crownThorns", color: "#6a543a", colorLight: "#9a8060" },
  "1Chronicles": { symbol: "scroll", color: "#5a7aa8", colorLight: "#88a4cc" },
  "2Chronicles": { symbol: "temple", color: "#3d6a9a", colorLight: "#6a94c4" },
  Ezra: { symbol: "scroll", color: "#4a6a8a", colorLight: "#7898b8" },
  Nehemiah: { symbol: "wall", color: "#6a543a", colorLight: "#9a8068" },
  Esther: { symbol: "scepter", color: "#a8548a", colorLight: "#d080b0" },
  Job: { symbol: "ashes", color: "#5a5a6a", colorLight: "#888898" },
  Psalms: { symbol: "harp", color: "#d4af37", colorLight: "#e8cc70" },
  Proverbs: { symbol: "lamp", color: "#b8893a", colorLight: "#d8b068" },
  Ecclesiastes: { symbol: "sun", color: "#8a7355", colorLight: "#b8a080" },
  SongOfSolomon: { symbol: "rose", color: "#c44569", colorLight: "#e07090" },
  Isaiah: { symbol: "wing", color: "#3d5a9a", colorLight: "#6a88c4" },
  Jeremiah: { symbol: "vessel", color: "#6a4a5a", colorLight: "#987888" },
  Lamentations: { symbol: "tears", color: "#4a5a7a", colorLight: "#7888a8" },
  Ezekiel: { symbol: "wheel", color: "#5a6a9a", colorLight: "#8898c8" },
  Daniel: { symbol: "lionDen", color: "#b8893a", colorLight: "#d8b068" },
  Hosea: { symbol: "covenant", color: "#a85450", colorLight: "#d08078" },
  Joel: { symbol: "locust", color: "#4a7a5a", colorLight: "#78a888" },
  Amos: { symbol: "plumb", color: "#6a5a32", colorLight: "#988860" },
  Obadiah: { symbol: "mountain", color: "#5a7a8a", colorLight: "#88a8b8" },
  Jonah: { symbol: "fish", color: "#3d6a8a", colorLight: "#6a98b8" },
  Micah: { symbol: "scales", color: "#6a4ab5", colorLight: "#9878d4" },
  Nahum: { symbol: "shield", color: "#4a5a6a", colorLight: "#788898" },
  Habakkuk: { symbol: "watchtower", color: "#7a6a4a", colorLight: "#a89878" },
  Zephaniah: { symbol: "fire", color: "#a85a3a", colorLight: "#d08868" },
  Haggai: { symbol: "temple", color: "#b8893a", colorLight: "#d8b068" },
  Zechariah: { symbol: "lampstand", color: "#4a6bb5", colorLight: "#7894d4" },
  Malachi: { symbol: "sunRays", color: "#d4a93a", colorLight: "#e8c868" },
  Matthew: { symbol: "angel", color: "#3d5a9a", colorLight: "#6a88c4" },
  Mark: { symbol: "lion", color: "#6a4ab5", colorLight: "#9578d4" },
  Luke: { symbol: "ox", color: "#4a9e9e", colorLight: "#72c8c8" },
  John: { symbol: "eagle", color: "#4a9e6e", colorLight: "#72c49a" },
  Acts: { symbol: "keys", color: "#d4af37", colorLight: "#e8cc70" },
  Romans: { symbol: "crossHill", color: "#6a4ab5", colorLight: "#9578d4" },
  "1Corinthians": { symbol: "column", color: "#3d5a9a", colorLight: "#6a88c4" },
  "2Corinthians": { symbol: "letter", color: "#4a6bb5", colorLight: "#7894d4" },
  Galatians: { symbol: "chains", color: "#8a6ec1", colorLight: "#b09ae0" },
  Ephesians: { symbol: "church", color: "#4a9e9e", colorLight: "#72c8c8" },
  Philippians: { symbol: "anchor", color: "#6a4ab5", colorLight: "#9578d4" },
  Colossians: { symbol: "crownThorns", color: "#5a6a8a", colorLight: "#8898b8" },
  "1Thessalonians": { symbol: "dawn", color: "#4a6bb5", colorLight: "#7894d4" },
  "2Thessalonians": { symbol: "shield", color: "#3d5a9a", colorLight: "#6a88c4" },
  "1Timothy": { symbol: "staff", color: "#8a4545", colorLight: "#b87070" },
  "2Timothy": { symbol: "sword", color: "#6a5a4a", colorLight: "#988878" },
  Titus: { symbol: "church", color: "#4a7a6a", colorLight: "#78a898" },
  Philemon: { symbol: "handshake", color: "#b8893a", colorLight: "#d8b068" },
  Hebrews: { symbol: "veil", color: "#8a6ec1", colorLight: "#b09ae0" },
  James: { symbol: "quill", color: "#a85450", colorLight: "#d08078" },
  "1Peter": { symbol: "fishAnchor", color: "#3d5a9a", colorLight: "#6a88c4" },
  "2Peter": { symbol: "growth", color: "#4a6bb5", colorLight: "#7894d4" },
  "1John": { symbol: "heartLight", color: "#4a9e6e", colorLight: "#72c49a" },
  "2John": { symbol: "seal", color: "#5a7aa8", colorLight: "#88a4cc" },
  "3John": { symbol: "house", color: "#6a5a8a", colorLight: "#9888b0" },
  Jude: { symbol: "faithShield", color: "#8a4545", colorLight: "#b87070" },
  Revelation: { symbol: "crown", color: "#d4af37", colorLight: "#e8cc70" },
};

import { readFile } from "node:fs/promises";
const pathsSrc = await readFile(join(root, "src/lib/bible-icons/symbol-paths.ts"), "utf8");
const pathMap = {};
for (const m of pathsSrc.matchAll(/(\w+):\s*'([^']+)'/g)) {
  pathMap[m[1]] = m[2];
}

function shade(hex, percent) {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function renderSvg(bookId, size = 256) {
  const def = REGISTRY[bookId];
  const paths = pathMap[def.symbol] ?? pathMap.scroll;
  const scale = (size * 0.42) / 24;
  const dark = shade(def.color, -25);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="g" cx="32%" cy="28%" r="72%">
      <stop offset="0%" stop-color="${def.colorLight}"/>
      <stop offset="55%" stop-color="${def.color}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="url(#g)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(-12 -12)" fill="#ffffff" opacity="0.95">
    ${paths}
  </g>
</svg>`;
}

await mkdir(outDir, { recursive: true });

let ok = 0;
for (const id of BOOK_IDS) {
  const svg = renderSvg(id);
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 92 }).toBuffer();
  await writeFile(join(outDir, `${id}.webp`), buf);
  ok++;
  console.log(`✓ ${id}.webp`);
}

console.log(`\nGenerated ${ok} book icons → public/bible-icons/books/`);
