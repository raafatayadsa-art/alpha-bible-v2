/**
 * Books library hero cards — 3:4 with 3D break-out + book count zone.
 * Run: node scripts/generate-bible-testament-hero-cards.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import {
  HERO_W,
  HERO_H,
  ensureFont,
  loadPathMap,
  loadTexture,
  renderHeroSvg,
} from "./lib/bible-portrait-art.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "src", "features", "books-v2", "assets");
const fontPath = join(root, "scripts", "assets", "NotoNaskhArabic-Bold.ttf");
const fontUrl = pathToFileURL(fontPath).href;

const pathMap = await loadPathMap(root);
await ensureFont(fontPath);
await mkdir(assetsDir, { recursive: true });

async function writeHero(filename, svg, textureRel) {
  const textureBuf = await loadTexture(root, textureRel, HERO_W, HERO_H);
  let pipe = sharp(Buffer.from(svg)).resize(HERO_W, HERO_H);
  if (textureBuf) {
    pipe = sharp(await pipe.png().toBuffer()).composite([
      { input: textureBuf, blend: "multiply", opacity: 0.2 },
    ]);
  }
  const buf = await pipe.webp({ quality: 95, effort: 6 }).toBuffer();
  await writeFile(join(assetsDir, filename), buf);
  console.log(`✓ ${filename}`);
}

const otSvg = renderHeroSvg({
  themeKey: "ot",
  title: "مكتبة الأسفار",
  subtitle: "العهد القديم · 46 سفراً",
  countLabel: "46",
  glyphSymbol: "tablets",
  pathMap,
  fontUrl,
});

const ntSvg = renderHeroSvg({
  themeKey: "nt",
  title: "مكتبة الأسفار",
  subtitle: "العهد الجديد · 27 سفراً",
  countLabel: "27",
  glyphSymbol: "crossHill",
  pathMap,
  fontUrl,
});

await writeHero("books-hero-ot.webp", otSvg, "src/features/bible-v2/assets/ot-card-bg-v2.jpg");
await writeHero("books-hero-nt.webp", ntSvg, "src/features/bible-v2/assets/nt-card-bg-v4.jpg");

console.log("\nHero cards → src/features/books-v2/assets/");
