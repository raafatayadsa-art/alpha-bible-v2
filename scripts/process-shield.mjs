import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = process.argv[2];
const out = process.argv[3];
if (!src || !out) {
  console.error("Usage: node scripts/process-shield.mjs <src> <out>");
  process.exit(1);
}

const TARGET_W = 439;
const TARGET_H = 839;
const FILL = 0.9;

function isStrictCheckerboard(r, g, b) {
  const greyDist = Math.abs(r - g) + Math.abs(g - b);
  const avg = (r + g + b) / 3;
  if (greyDist > 22) return false;
  if (avg < 165 || avg > 254) return false;
  const d204 = Math.abs(r - 204) + Math.abs(g - 204) + Math.abs(b - 204);
  const d255 = Math.abs(r - 255) + Math.abs(g - 255) + Math.abs(b - 255);
  const d192 = Math.abs(r - 192) + Math.abs(g - 192) + Math.abs(b - 192);
  return d204 < 40 || d255 < 40 || d192 < 44;
}

function isLooseCheckerboard(r, g, b) {
  if (isStrictCheckerboard(r, g, b)) return true;
  const greyDist = Math.abs(r - g) + Math.abs(g - b);
  const avg = (r + g + b) / 3;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (greyDist > 30) return false;
  if (avg < 155 || avg > 254) return false;
  if (sat > 35) return false;
  return sat < 18 || greyDist < 16;
}

function isShieldInterior(r, g, b) {
  if (b > r + 5 && b > 100 && b > g) return true;
  if (g > r + 5 && g > 80 && g > b) return true;
  if (r > 90 && g > 45 && b < 95 && r >= g - 10 && r > b + 10) return true;
  const greyDist = Math.abs(r - g) + Math.abs(g - b);
  if (r > 165 && g > 140 && b > 110 && r - b < 90 && greyDist > 8) return true;
  return false;
}

function isStrongInterior(r, g, b) {
  if (b > r + 5 && b > 100 && b > g) return true;
  if (g > r + 5 && g > 80 && g > b) return true;
  return r > 90 && g > 45 && b < 95 && r >= g - 10 && r > b + 10;
}

function hasStrongInteriorNeighbor(data, width, height, channels, x, y, radius = 10) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const oi = (ny * width + nx) * channels;
      if (isStrongInterior(data[oi], data[oi + 1], data[oi + 2])) return true;
    }
  }
  return false;
}

function isFillInterior(r, g, b) {
  if (b > r + 5 && b > 100 && b > g) return true;
  if (g > r + 5 && g > 80 && g > b) return true;
  const greyDist = Math.abs(r - g) + Math.abs(g - b);
  return r > 165 && g > 140 && b > 110 && r - b < 90 && greyDist > 8;
}

function isGold(r, g, b) {
  return r > 90 && g > 45 && b < 95 && r >= g - 10 && r > b + 10;
}

function isBlackBar(r, g, b) {
  return r < 20 && g < 20 && b < 20;
}

function isDarkBackground(r, g, b) {
  return r < 75 && g < 75 && b < 75 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15;
}

function isForegroundPixel(r, g, b) {
  return !isStrictCheckerboard(r, g, b) && !isDarkBackground(r, g, b);
}

function isBackgroundSeed(r, g, b) {
  return isLooseCheckerboard(r, g, b) || isDarkBackground(r, g, b);
}

function floodFromEdges(data, width, height, channels, matches) {
  const size = width * height;
  const bg = new Uint8Array(size);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (bg[idx]) return;
    const i = idx * channels;
    if (!matches(data[i], data[i + 1], data[i + 2])) return;
    bg[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = Math.floor(idx / width);
    if (x > 0) tryPush(x - 1, y);
    if (x < width - 1) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y < height - 1) tryPush(x, y + 1);
  }

  return bg;
}

function trimHorizontalBackground(bg, width, height) {
  for (let y = 0; y < height; y++) {
    const xs = [];
    for (let x = 0; x < width; x++) {
      if (!bg[y * width + x]) xs.push(x);
    }
    if (xs.length < 8) continue;
    const minX = xs[0];
    const maxX = xs[xs.length - 1];
    for (let x = 0; x < minX; x++) bg[y * width + x] = 1;
    for (let x = maxX + 1; x < width; x++) bg[y * width + x] = 1;
  }
  return bg;
}

function purgeCheckerboardIslands(bg, data, width, height, channels) {
  const visited = new Uint8Array(width * height);

  for (let idx = 0; idx < width * height; idx++) {
    if (bg[idx] || visited[idx]) continue;
    const i = idx * channels;
    if (!isLooseCheckerboard(data[i], data[i + 1], data[i + 2])) continue;

    const stack = [idx];
    const component = [idx];
    visited[idx] = 1;
    let touchesFill = false;

    while (stack.length) {
      const cur = stack.pop();
      const x = cur % width;
      const y = Math.floor(cur / width);

      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        const pi = ni * channels;
        const nr = data[pi];
        const ng = data[pi + 1];
        const nb = data[pi + 2];

        if (!isLooseCheckerboard(nr, ng, nb)) {
          if (isFillInterior(nr, ng, nb)) touchesFill = true;
          continue;
        }

        if (bg[ni] || visited[ni]) continue;
        visited[ni] = 1;
        stack.push(ni);
        component.push(ni);
      }
    }

    if (!touchesFill) {
      for (const pixel of component) bg[pixel] = 1;
    }
  }

  return bg;
}

function expandBackground(bg, data, width, height, channels, passes = 3) {
  let next = bg;
  for (let pass = 0; pass < passes; pass++) {
    const updated = new Uint8Array(next);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (next[idx]) continue;
        const i = idx * channels;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (isShieldInterior(r, g, b)) continue;
        if (!isLooseCheckerboard(r, g, b)) continue;
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            if (next[(y + dy) * width + (x + dx)]) neighbors++;
          }
        }
        if (neighbors >= 4) updated[idx] = 1;
      }
    }
    next = updated;
  }
  return next;
}

function buildBackgroundMask(data, width, height, channels) {
  let bg = floodFromEdges(data, width, height, channels, isBackgroundSeed);
  bg = trimHorizontalBackground(bg, width, height);
  bg = purgeCheckerboardIslands(bg, data, width, height, channels);
  bg = expandBackground(bg, data, width, height, channels, 5);
  return bg;
}

function isNeutralBackground(r, g, b) {
  if (isShieldInterior(r, g, b)) return false;
  const greyDist = Math.abs(r - g) + Math.abs(g - b);
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  if (sat > 35) return false;
  if (greyDist > 35) return false;
  if (avg < 135 || avg > 254) return false;
  return isLooseCheckerboard(r, g, b) || (avg <= 210 && greyDist < 24);
}

function flattenBackgroundToBlack(data, width, height, channels, bg) {
  const flattened = Buffer.from(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const shouldFlatten =
        bg[idx] ||
        isDarkBackground(r, g, b) ||
        (isNeutralBackground(r, g, b) &&
          !hasStrongInteriorNeighbor(data, width, height, channels, x, y, 10));
      if (!shouldFlatten) continue;
      flattened[i] = 0;
      flattened[i + 1] = 0;
      flattened[i + 2] = 0;
    }
  }
  return flattened;
}

function cleanupRgba(rgba, original, width, height, channels) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const di = idx * 4;
      const oi = idx * channels;
      const r = original[oi];
      const g = original[oi + 1];
      const b = original[oi + 2];
      const alpha = rgba[di + 3];

      if (alpha === 0) continue;

      const remove =
        isStrictCheckerboard(r, g, b) ||
        (isNeutralBackground(r, g, b) &&
          !hasStrongInteriorNeighbor(original, width, height, channels, x, y, 10)) ||
        (alpha < 255 && isLooseCheckerboard(r, g, b) && Math.max(r, g, b) > 180);

      if (!remove) continue;

      rgba[di] = 0;
      rgba[di + 1] = 0;
      rgba[di + 2] = 0;
      rgba[di + 3] = 0;
    }
  }
}

function hardenAlphaFringe(rgba, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const di = (y * width + x) * 4;
      const alpha = rgba[di + 3];
      if (alpha === 0 || alpha === 255) continue;

      const maxColor = Math.max(rgba[di], rgba[di + 1], rgba[di + 2]);
      if (
        maxColor < 80 ||
        !hasStrongInteriorNeighbor(rgba, width, height, 4, x, y, 4)
      ) {
        rgba[di] = 0;
        rgba[di + 1] = 0;
        rgba[di + 2] = 0;
        rgba[di + 3] = 0;
        continue;
      }

      rgba[di + 3] = 255;
    }
  }
}

function cleanupOutputRgba(rgba, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const di = idx * 4;
      const r = rgba[di];
      const g = rgba[di + 1];
      const b = rgba[di + 2];
      const alpha = rgba[di + 3];
      const maxColor = Math.max(r, g, b);

      if (alpha === 0) continue;

      const remove =
        (isStrictCheckerboard(r, g, b) &&
          !hasStrongInteriorNeighbor(rgba, width, height, 4, x, y, 3)) ||
        (isNeutralBackground(r, g, b) &&
          !hasStrongInteriorNeighbor(rgba, width, height, 4, x, y, 8)) ||
        (alpha < 240 && maxColor < 55) ||
        (alpha < 240 && isLooseCheckerboard(r, g, b) && maxColor > 160);

      if (!remove) continue;

      rgba[di] = 0;
      rgba[di + 1] = 0;
      rgba[di + 2] = 0;
      rgba[di + 3] = 0;
    }
  }
}

function servantAlphaFromBlackBg(r, g, b) {
  const maxColor = Math.max(r, g, b);
  if (maxColor < 15) return 0;
  if (maxColor < 50) return Math.round(((maxColor - 15) * 255) / 35);
  return 255;
}

function rowForegroundPixels(data, width, channels, y) {
  let count = 0;
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (isForegroundPixel(data[i], data[i + 1], data[i + 2])) count++;
  }
  return count;
}

function detectBannerCropBottom(data, width, height, channels) {
  let prevCenterAvg = 0;
  for (let y = Math.floor(height * 0.82); y < height - 16; y++) {
    let centerAvg = 0;
    let centerGold = 0;
    let centerCount = 0;
    const xStart = Math.floor(width * 0.22);
    const xEnd = Math.ceil(width * 0.78);
    for (let x = xStart; x < xEnd; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      centerAvg += (r + g + b) / 3;
      centerCount++;
      if (isGold(r, g, b)) centerGold++;
    }
    centerAvg /= centerCount;
    if (
      centerGold < 4 &&
      centerAvg > 228 &&
      prevCenterAvg > 0 &&
      centerAvg - prevCenterAvg > 4
    ) {
      return y - 1;
    }
    prevCenterAvg = centerAvg;
  }
  return null;
}

function detectDarkBannerCropBottom(data, width, height, channels) {
  const xStart = Math.floor(width * 0.15);
  const xEnd = Math.ceil(width * 0.85);
  let bannerY = -1;

  for (let y = Math.floor(height * 0.75); y < height - 16; y++) {
    let dark = 0;
    let fg = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (isForegroundPixel(data[i], data[i + 1], data[i + 2])) fg++;
    }
    for (let x = xStart; x < xEnd; x++) {
      const i = (y * width + x) * channels;
      if (data[i] + data[i + 1] + data[i + 2] < 120) dark++;
    }
    if (fg > 350 && dark > 220) {
      bannerY = y;
      break;
    }
  }

  if (bannerY < 0) return null;

  for (let y = bannerY - 1; y >= Math.floor(height * 0.45); y--) {
    let gold = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (isGold(data[i], data[i + 1], data[i + 2])) gold++;
    }
    if (gold > 12) return y + 6;
  }

  return bannerY - 1;
}

function detectCropBottom(data, width, height, channels) {
  for (let y = Math.floor(height * 0.85); y < height - 16; y++) {
    const curr = rowForegroundPixels(data, width, channels, y);
    const prev = rowForegroundPixels(data, width, channels, y - 1);
    if (curr > 280 && curr < 380 && prev > 180 && prev < 240) return y - 1;
  }

  const darkBannerCrop = detectDarkBannerCropBottom(data, width, height, channels);
  if (darkBannerCrop !== null) return darkBannerCrop;

  const bannerCrop = detectBannerCropBottom(data, width, height, channels);
  if (bannerCrop !== null) return bannerCrop;

  let emptyRows = 0;
  for (let y = Math.floor(height * 0.75); y < height; y++) {
    if (rowForegroundPixels(data, width, channels, y) < 5) emptyRows++;
    else emptyRows = 0;
    if (emptyRows > 20) return y - 20;
  }

  let cropBottom = height;
  for (let y = Math.floor(height * 0.78); y < height - 16; y++) {
    const curr = rowForegroundPixels(data, width, channels, y);
    const prev = rowForegroundPixels(data, width, channels, y - 1);
    const prev5 = rowForegroundPixels(data, width, channels, y - 5);
    if ((curr > 280 && prev < 150) || (curr > 350 && prev5 < 260)) {
      cropBottom = y - 4;
    }
  }
  return cropBottom;
}

const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const cropBottom = detectCropBottom(data, width, height, channels);

let cropTop = 0;
for (let y = 0; y < cropBottom; y++) {
  if (rowForegroundPixels(data, width, channels, y) > 80) {
    cropTop = Math.max(0, y - 6);
    break;
  }
}

let cropLeft = 0;
let cropRight = width;
for (let x = 0; x < width; x++) {
  let count = 0;
  for (let y = cropTop; y < cropBottom; y++) {
    const i = (y * width + x) * channels;
    if (isForegroundPixel(data[i], data[i + 1], data[i + 2])) count++;
  }
  if (count > (cropBottom - cropTop) * 0.04) {
    cropLeft = Math.max(0, x - 4);
    break;
  }
}
for (let x = width - 1; x >= 0; x--) {
  let count = 0;
  for (let y = cropTop; y < cropBottom; y++) {
    const i = (y * width + x) * channels;
    if (isForegroundPixel(data[i], data[i + 1], data[i + 2])) count++;
  }
  if (count > (cropBottom - cropTop) * 0.04) {
    cropRight = Math.min(width, x + 5);
    break;
  }
}

const cropW = cropRight - cropLeft;
const cropH = cropBottom - cropTop;
console.log({ cropTop, cropBottom, cropLeft, cropRight, cropW, cropH });

const cropped = await sharp(src)
  .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
  .raw()
  .toBuffer({ resolveWithObject: true });

const bg = buildBackgroundMask(cropped.data, cropW, cropH, cropped.info.channels);
const flattened = flattenBackgroundToBlack(cropped.data, cropW, cropH, cropped.info.channels, bg);

const rgba = Buffer.alloc(cropW * cropH * 4);
for (let idx = 0; idx < cropW * cropH; idx++) {
  const si = idx * cropped.info.channels;
  const di = idx * 4;
  const r = flattened[si];
  const g = flattened[si + 1];
  const b = flattened[si + 2];
  rgba[di] = r;
  rgba[di + 1] = g;
  rgba[di + 2] = b;
  rgba[di + 3] = servantAlphaFromBlackBg(r, g, b);
  if (rgba[di + 3] > 0 && rgba[di + 3] < 255 && isNeutralBackground(cropped.data[si], cropped.data[si + 1], cropped.data[si + 2])) {
    rgba[di + 3] = 0;
  }
  if (rgba[di + 3] === 0) {
    rgba[di] = 0;
    rgba[di + 1] = 0;
    rgba[di + 2] = 0;
  }
}

for (let idx = 0; idx < cropW * cropH; idx++) {
  const di = idx * 4;
  if (rgba[di + 3] === 0) continue;
  const si = idx * cropped.info.channels;
  const r = cropped.data[si];
  const g = cropped.data[si + 1];
  const b = cropped.data[si + 2];
  if (isShieldInterior(r, g, b)) continue;
  if (!isNeutralBackground(r, g, b)) continue;
  rgba[di + 3] = 0;
  rgba[di] = 0;
  rgba[di + 1] = 0;
  rgba[di + 2] = 0;
}

cleanupRgba(rgba, cropped.data, cropW, cropH, cropped.info.channels);

const trimmed = await sharp(rgba, { raw: { width: cropW, height: cropH, channels: 4 } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

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
const topPad = Math.round((TARGET_H - scaledH) / 2);

const composed = await sharp({
  create: {
    width: TARGET_W,
    height: TARGET_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: scaled, left, top: topPad }])
  .png()
  .toBuffer();

const { data: outData, info: outInfo } = await sharp(composed)
  .raw()
  .toBuffer({ resolveWithObject: true });
cleanupOutputRgba(outData, outInfo.width, outInfo.height);
// hardenAlphaFringe removed
await sharp(outData, {
  raw: { width: outInfo.width, height: outInfo.height, channels: 4 },
})
  .png()
  .toFile(path.resolve(root, out));

const stats = await sharp(path.resolve(root, out)).raw().toBuffer({ resolveWithObject: true });
let transparent = 0;
let opaque = 0;
let semi = 0;
let opaqueBg = 0;
for (let i = 0; i < stats.info.width * stats.info.height; i++) {
  const a = stats.data[i * 4 + 3];
  if (a === 0) transparent++;
  else if (a === 255) opaque++;
  else semi++;
  if (a > 200 && isLooseCheckerboard(stats.data[i * 4], stats.data[i * 4 + 1], stats.data[i * 4 + 2])) {
    opaqueBg++;
  }
}

console.log("Saved:", path.resolve(root, out), { scaledW, scaledH, transparent, opaque, semi, opaqueBg });
