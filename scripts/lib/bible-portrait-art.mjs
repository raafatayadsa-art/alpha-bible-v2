/**
 * Shared premium 3:4 portrait card renderer (960×1280 @2x).
 * Category + order at top; title at bottom; optional Paul subtitle.
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

export const CARD_W = 960;
export const CARD_H = 1280;
export const HERO_W = 960;
export const HERO_H = 1280;

export const THEMES = {
  ot: {
    bg: ["#faf4e4", "#e8d4b0", "#8a6840"],
    footer: ["rgba(42,28,12,0)", "rgba(42,28,12,0.62)", "rgba(22,14,6,0.96)"],
    ring: ["#f5e6b8", "#c49a3a", "#7a5518"],
    accent: "#f0d78c",
    topBar: "rgba(28,18,8,0.55)",
  },
  nt: {
    bg: ["#eef3fc", "#c8d8f0", "#28406e"],
    footer: ["rgba(10,18,40,0)", "rgba(10,18,40,0.62)", "rgba(6,10,24,0.96)"],
    ring: ["#b8cce8", "#3d5a9a", "#1a2448"],
    accent: "#b8cce8",
    topBar: "rgba(6,10,24,0.58)",
  },
};

export function shade(hex, percent) {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function padOrder(n) {
  return n < 10 ? `0${n}` : String(n);
}

export function titleSize(name) {
  if (name.length > 18) return 38;
  if (name.length > 14) return 44;
  if (name.length > 10) return 50;
  return 56;
}

export async function ensureFont(fontPath) {
  try {
    await access(fontPath, constants.R_OK);
  } catch {
    await mkdir(dirname(fontPath), { recursive: true });
    const res = await fetch(
      "https://github.com/notofonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Bold.ttf",
    );
    if (!res.ok) throw new Error(`Font download failed: ${res.status}`);
    await writeFile(fontPath, Buffer.from(await res.arrayBuffer()));
  }
}

export function renderBookPortraitSvg(book, pathMap, fontUrl, themeKey = "ot") {
  const theme = THEMES[themeKey] ?? THEMES.ot;
  const paths = pathMap[book.symbol] ?? pathMap.scroll;
  const dark = shade(book.color, -35);
  const W = CARD_W;
  const H = CARD_H;
  const cx = W / 2;
  const cy = H * 0.42;
  const r = 168;
  const ts = titleSize(book.name);
  const paulLine = book.paulSubtitle ? `<text x="${W / 2}" y="${H - 98}" class="sub">${esc(book.paulSubtitle)}</text>` : "";
  const titleY = book.paulSubtitle ? H - 52 : H - 56;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg[0]}"/>
      <stop offset="48%" stop-color="${theme.bg[1]}"/>
      <stop offset="100%" stop-color="${theme.bg[2]}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${book.colorLight}" stop-opacity="0.62"/>
      <stop offset="55%" stop-color="${book.color}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${dark}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="footer" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.footer[0]}"/>
      <stop offset="40%" stop-color="${theme.footer[1]}"/>
      <stop offset="100%" stop-color="${theme.footer[2]}"/>
    </linearGradient>
    <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.ring[0]}"/>
      <stop offset="50%" stop-color="${theme.ring[1]}"/>
      <stop offset="100%" stop-color="${theme.ring[2]}"/>
    </linearGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      @font-face {
        font-family: 'NotoNaskh';
        src: url('${fontUrl}') format('truetype');
        font-weight: 700;
      }
      .title { font-family: 'NotoNaskh', serif; font-weight: 700; fill: #fff; text-anchor: middle; direction: rtl; }
      .sub { font-family: 'NotoNaskh', serif; font-weight: 700; fill: ${theme.accent}; text-anchor: middle; direction: rtl; font-size: 22px; }
      .topCat { font-family: 'NotoNaskh', serif; font-weight: 700; fill: ${theme.accent}; font-size: 24px; }
      .topOrd { font-family: Arial,sans-serif; font-weight: 700; fill: #fff; font-size: 26px; text-anchor: middle; }
    </style>
    <clipPath id="round"><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="44" ry="44"/></clipPath>
  </defs>

  <!-- 3D break-out glow (outside frame) -->
  <g filter="url(#glow)" opacity="0.55">
    <ellipse cx="${cx}" cy="${cy - 40}" rx="${r + 40}" ry="${r * 0.35}" fill="${book.colorLight}"/>
  </g>

  <g clip-path="url(#round)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#halo)"/>

    <!-- faux depth planes -->
    <ellipse cx="${cx}" cy="${cy + 20}" rx="${r + 36}" ry="28" fill="#000" opacity="0.18"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 24}" fill="${book.colorLight}" opacity="0.14"/>

    <!-- protruding top arc (breaks upward visually) -->
    <g filter="url(#lift)">
      <circle cx="${cx}" cy="${cy - 8}" r="${r + 8}" fill="url(#goldRing)" opacity="0.92"/>
      <circle cx="${cx}" cy="${cy - 8}" r="${r - 4}" fill="${book.colorLight}"/>
      <circle cx="${cx}" cy="${cy - 8}" r="${r - 12}" fill="${book.color}"/>
      <circle cx="${cx}" cy="${cy - 8}" r="${r - 12}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="3"/>
      <g transform="translate(${cx} ${cy - 8}) scale(7.2) translate(-12 -12)" fill="#ffffff" opacity="0.97">
        ${paths}
      </g>
    </g>

    <!-- top header bar: category + order -->
    <rect x="0" y="0" width="${W}" height="96" fill="${theme.topBar}"/>
    <text x="${W - 36}" y="62" class="topCat" text-anchor="end">${esc(book.category)}</text>
    <circle cx="56" cy="48" r="34" fill="url(#goldRing)"/>
    <circle cx="56" cy="48" r="28" fill="${book.color}"/>
    <text x="56" y="58" class="topOrd">${padOrder(book.order)}</text>

    <rect x="0" y="${H * 0.52}" width="${W}" height="${H * 0.48}" fill="url(#footer)"/>
    ${paulLine}
    <text x="${W / 2}" y="${titleY}" class="title" font-size="${ts}">${esc(book.name)}</text>
    <line x1="${W * 0.18}" y1="${titleY - 18}" x2="${W * 0.82}" y2="${titleY - 18}" stroke="${theme.accent}" stroke-width="1.5" opacity="0.5"/>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="44" ry="44" fill="none" stroke="url(#goldRing)" stroke-width="4"/>
  <!-- break-out ring highlight -->
  <ellipse cx="${cx}" cy="28" rx="72" ry="18" fill="${theme.accent}" opacity="0.22"/>
</svg>`;
}

export function renderHeroSvg({ themeKey, title, subtitle, countLabel, glyphSymbol, pathMap, fontUrl }) {
  const theme = THEMES[themeKey] ?? THEMES.ot;
  const paths = pathMap[glyphSymbol] ?? pathMap.scroll;
  const W = HERO_W;
  const H = HERO_H;
  const cx = W / 2;
  const cy = H * 0.34;
  const accent = themeKey === "ot" ? "#b8893a" : "#3d5a9a";
  const accentLight = themeKey === "ot" ? "#e8cc70" : "#6a88c4";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg[0]}"/>
      <stop offset="50%" stop-color="${theme.bg[1]}"/>
      <stop offset="100%" stop-color="${theme.bg[2]}"/>
    </linearGradient>
    <linearGradient id="footer" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="45%" stop-color="${theme.footer[1]}"/>
      <stop offset="100%" stop-color="${theme.footer[2]}"/>
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.ring[0]}"/>
      <stop offset="100%" stop-color="${theme.ring[2]}"/>
    </linearGradient>
    <filter id="heroLift" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <style>
      @font-face { font-family: 'NotoNaskh'; src: url('${fontUrl}') format('truetype'); font-weight: 700; }
      .t1 { font-family: 'NotoNaskh', serif; font-weight: 700; fill: #fff; text-anchor: middle; font-size: 52px; }
      .t2 { font-family: 'NotoNaskh', serif; font-weight: 700; fill: rgba(255,255,255,0.88); text-anchor: middle; font-size: 26px; }
      .cnt { font-family: Arial,sans-serif; font-weight: 800; fill: #fff; text-anchor: middle; font-size: 72px; }
      .lbl { font-family: 'NotoNaskh', serif; font-weight: 700; fill: ${theme.accent}; text-anchor: middle; font-size: 24px; }
    </style>
    <clipPath id="round"><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="44" ry="44"/></clipPath>
  </defs>

  <g filter="url(#heroLift)" opacity="0.7">
    <ellipse cx="${cx}" cy="18" rx="120" ry="36" fill="${accentLight}"/>
  </g>

  <g clip-path="url(#round)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#heroLift)">
      <circle cx="${cx}" cy="${cy}" r="200" fill="url(#ring)" opacity="0.95"/>
      <circle cx="${cx}" cy="${cy}" r="172" fill="${accentLight}"/>
      <circle cx="${cx}" cy="${cy}" r="148" fill="${accent}"/>
      <g transform="translate(${cx} ${cy}) scale(9) translate(-12 -12)" fill="#fff" opacity="0.96">${paths}</g>
    </g>
    <!-- 3D break-out: upper crown of circle -->
    <g filter="url(#heroLift)">
      <path d="M ${cx - 90} 8 Q ${cx} -28 ${cx + 90} 8 L ${cx + 70} 48 Q ${cx} 18 ${cx - 70} 48 Z" fill="url(#ring)" opacity="0.85"/>
    </g>
    <rect x="0" y="${H * 0.48}" width="${W}" height="${H * 0.52}" fill="url(#footer)"/>
    <text x="${W / 2}" y="${H - 280}" class="lbl">✦ ALPHA BIBLE · LIBRARY ✦</text>
    <text x="${W / 2}" y="${H - 210}" class="t1">${esc(title)}</text>
    <text x="${W / 2}" y="${H - 150}" class="t2">${esc(subtitle)}</text>
    <rect x="${W / 2 - 110}" y="${H - 120}" width="220" height="88" rx="22" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
    <text x="${W / 2}" y="${H - 68}" class="cnt">${esc(String(countLabel))}</text>
    <text x="${W / 2}" y="${H - 38}" class="lbl">${esc("سفراً")}</text>
  </g>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="44" ry="44" fill="none" stroke="url(#ring)" stroke-width="4"/>
</svg>`;
}

export async function rasterizeSvg(svg, textureBuf, quality = 94) {
  let pipe = sharp(Buffer.from(svg)).resize(CARD_W, CARD_H);
  if (textureBuf) {
    pipe = sharp(await pipe.png().toBuffer()).composite([
      { input: textureBuf, blend: "multiply", opacity: 0.18 },
    ]);
  }
  return pipe.webp({ quality, effort: 6 }).toBuffer();
}

export async function loadPathMap(root) {
  const { readFile } = await import("node:fs/promises");
  const pathsSrc = await readFile(join(root, "src/lib/bible-icons/symbol-paths.ts"), "utf8");
  const pathMap = {};
  for (const m of pathsSrc.matchAll(/(\w+):\s*'([^']+)'/g)) {
    pathMap[m[1]] = m[2];
  }
  return pathMap;
}

export async function loadTexture(root, relPath, w = CARD_W, h = CARD_H) {
  try {
    return await sharp(join(root, relPath)).resize(w, h, { fit: "cover" }).png().toBuffer();
  } catch {
    return null;
  }
}
