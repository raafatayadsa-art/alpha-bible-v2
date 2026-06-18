/**
 * Member-shield pipeline adapted for Alpha / official gold shield (black bg).
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = process.argv[2];
const out = process.argv[3] ?? "public/shields/official-shield.png";
if (!src) {
  console.error("Usage: node scripts/process-official-shield-like-member.mjs <src> [out]");
  process.exit(1);
}

const outPath = path.resolve(root, out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const BLACK = 34;

function isGold(r, g, b) {
  return r > 75 && g > 35 && b < 120 && r >= g - 20 && r > b + 5;
}

function isShieldPixel(r, g, b) {
  if (isGold(r, g, b)) return true;
  if (r > 110 && g > 75 && b < 130 && r - b > 25) return true;
  return false;
}

function isGray(r, g, b) {
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  return sat < 35 && avg > 35 && avg < 220;
}

// ── Step 1: black-key cutout ──
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const rgba = Buffer.alloc(width * height * 4);

for (let i = 0; i < width * height; i++) {
  const si = i * channels;
  const r = data[si];
  const g = data[si + 1];
  const b = data[si + 2];
  const di = i * 4;
  rgba[di] = r;
  rgba[di + 1] = g;
  rgba[di + 2] = b;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const isBg = maxC <= BLACK || (maxC - minC < 18 && maxC <= 48);
  rgba[di + 3] = isBg ? 0 : 255;
}

for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const di = (y * width + x) * 4;
    if (rgba[di + 3] === 0) continue;
    if (Math.max(rgba[di], rgba[di + 1], rgba[di + 2]) > 55) continue;
    let transparentNeighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        if (rgba[((y + dy) * width + (x + dx)) * 4 + 3] === 0) transparentNeighbors++;
      }
    }
    if (transparentNeighbors >= 4) {
      rgba[di + 3] = 0;
      rgba[di] = rgba[di + 1] = rgba[di + 2] = 0;
    }
  }
}

let trimmed = await sharp(rgba, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

let meta = await sharp(trimmed).metadata();
const maxDim = 820;
const scale = Math.min(1, maxDim / Math.max(meta.width, meta.height));
const targetW = Math.round(meta.width * scale);
const targetH = Math.round(meta.height * scale);

await sharp(trimmed)
  .resize(targetW, targetH, { fit: "fill", kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9, palette: false })
  .toFile(outPath);

console.log("Step 1:", { targetW, targetH });

// ── Step 2: remove disconnected gray artifacts ──
let buf = await sharp(outPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let w = buf.info.width;
let h = buf.info.height;
let px = Buffer.from(buf.data);

const visited = new Uint8Array(w * h);
const toRemove = new Uint8Array(w * h);

for (let sy = Math.floor(h * 0.82); sy < h; sy++) {
  for (let sx = Math.floor(w * 0.72); sx < w; sx++) {
    const start = sy * w + sx;
    const di = start * 4;
    if (px[di + 3] === 0 || visited[start]) continue;
    const r = px[di];
    const g = px[di + 1];
    const b = px[di + 2];
    if (!isGray(r, g, b) || isShieldPixel(r, g, b)) continue;

    const stack = [start];
    const component = [];
    visited[start] = 1;
    let touchesShield = false;

    while (stack.length) {
      const idx = stack.pop();
      component.push(idx);
      const ci = idx * 4;
      if (isShieldPixel(px[ci], px[ci + 1], px[ci + 2])) touchesShield = true;

      const x = idx % w;
      const y = (idx / w) | 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (visited[ni] || px[ni * 4 + 3] === 0) continue;
        const nr = px[ni * 4];
        const ng = px[ni * 4 + 1];
        const nb = px[ni * 4 + 2];
        if (!isGray(nr, ng, nb)) continue;
        visited[ni] = 1;
        stack.push(ni);
      }
    }

    if (!touchesShield && component.length < 5000) {
      for (const idx of component) toRemove[idx] = 1;
    }
  }
}

let removed = 0;
for (let i = 0; i < w * h; i++) {
  if (!toRemove[i]) continue;
  const di = i * 4;
  px[di] = px[di + 1] = px[di + 2] = 0;
  px[di + 3] = 0;
  removed++;
}

trimmed = await sharp(px, { raw: { width: w, height: h, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

await sharp(trimmed).png({ compressionLevel: 9 }).toFile(outPath);
meta = await sharp(outPath).metadata();
console.log("Step 2:", { removed, outW: meta.width, outH: meta.height });

// ── Step 3: crop below shield + bottom-right gray ──
buf = await sharp(outPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
w = buf.info.width;
h = buf.info.height;
px = Buffer.from(buf.data);

let maxShieldY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const di = (y * w + x) * 4;
    if (px[di + 3] < 128) continue;
    if (isShieldPixel(px[di], px[di + 1], px[di + 2])) maxShieldY = Math.max(maxShieldY, y);
  }
}

removed = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const di = (y * w + x) * 4;
    if (px[di + 3] === 0) continue;
    const r = px[di];
    const g = px[di + 1];
    const b = px[di + 2];
    const belowShield = y > maxShieldY + 8;
    const bottomRightGray = y > h * 0.88 && x > w * 0.72 && isGray(r, g, b);
    if (belowShield || bottomRightGray) {
      px[di] = px[di + 1] = px[di + 2] = 0;
      px[di + 3] = 0;
      removed++;
    }
  }
}

trimmed = await sharp(px, { raw: { width: w, height: h, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

await sharp(trimmed).png({ compressionLevel: 9 }).toFile(outPath);
meta = await sharp(outPath).metadata();
console.log("Step 3:", { removed, outW: meta.width, outH: meta.height, maxShieldY });

// ── Step 4: remove gray sparkle + inpaint gold holes ──
buf = await sharp(outPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
w = buf.info.width;
h = buf.info.height;
px = Buffer.from(buf.data);

removed = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const di = (y * w + x) * 4;
    if (px[di + 3] === 0) continue;
    const r = px[di];
    const g = px[di + 1];
    const b = px[di + 2];
    if (isGold(r, g, b)) continue;
    if (!isGray(r, g, b)) continue;
    px[di] = px[di + 1] = px[di + 2] = 0;
    px[di + 3] = 0;
    removed++;
  }
}

for (let pass = 0; pass < 2; pass++) {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const di = (y * w + x) * 4;
      if (px[di + 3] > 0) continue;
      const golds = [];
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ni = ((y + dy) * w + (x + dx)) * 4;
        if (px[ni + 3] < 128) continue;
        const r = px[ni];
        const g = px[ni + 1];
        const b = px[ni + 2];
        if (isGold(r, g, b)) golds.push({ r, g, b });
      }
      if (golds.length >= 3) {
        px[di] = Math.round(golds.reduce((s, p) => s + p.r, 0) / golds.length);
        px[di + 1] = Math.round(golds.reduce((s, p) => s + p.g, 0) / golds.length);
        px[di + 2] = Math.round(golds.reduce((s, p) => s + p.b, 0) / golds.length);
        px[di + 3] = 255;
      }
    }
  }
}

trimmed = await sharp(px, { raw: { width: w, height: h, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

await sharp(trimmed).png({ compressionLevel: 9 }).toFile(outPath);
meta = await sharp(outPath).metadata();
console.log("Step 4:", { removed, outW: meta.width, outH: meta.height });
console.log("Saved:", outPath);
