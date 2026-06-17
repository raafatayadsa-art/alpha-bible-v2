import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = process.argv[2];
const out = process.argv[3];
if (!src || !out) {
  console.error("Usage: node scripts/normalize-shield.mjs <src-png> <out>");
  process.exit(1);
}

const TARGET_W = 439;
const TARGET_H = 839;
const FILL = 0.9;

const trimmed = await sharp(path.resolve(root, src)).trim({ threshold: 1 }).png().toBuffer();
const trimmedMeta = await sharp(trimmed).metadata();
const maxW = Math.round(TARGET_W * FILL);
const maxH = Math.round(TARGET_H * FILL);

let scale = maxH / trimmedMeta.height;
let scaledW = Math.round(trimmedMeta.width * scale);
let scaledH = maxH;
if (scaledW > maxW) {
  scale = maxW / trimmedMeta.width;
  scaledW = maxW;
  scaledH = Math.round(trimmedMeta.height * scale);
}

const scaled = await sharp(trimmed)
  .resize(scaledW, scaledH, { fit: "inside", kernel: sharp.kernel.lanczos3 })
  .png()
  .toBuffer();

const left = Math.round((TARGET_W - scaledW) / 2);
const top = Math.round((TARGET_H - scaledH) / 2);

await sharp({
  create: {
    width: TARGET_W,
    height: TARGET_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: scaled, left, top }])
  .png()
  .toFile(path.resolve(root, out));

console.log("Saved:", path.resolve(root, out), { scaledW, scaledH });
