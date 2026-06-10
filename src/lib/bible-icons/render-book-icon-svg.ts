import type { BibleBookId } from "./BibleBookIcons";
import { getBookSymbolDef } from "./book-symbol-registry";
import { SYMBOL_PATHS } from "./symbol-paths";

export function renderBookIconSvg(bookId: BibleBookId, size = 256): string {
  const def = getBookSymbolDef(bookId);
  const paths = SYMBOL_PATHS[def.symbol] ?? SYMBOL_PATHS.scroll;
  const scale = (size * 0.42) / 24;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="g" cx="32%" cy="28%" r="72%">
      <stop offset="0%" stop-color="${def.colorLight}"/>
      <stop offset="55%" stop-color="${def.color}"/>
      <stop offset="100%" stop-color="${shade(def.color, -25)}"/>
    </radialGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.28)"/>
    </filter>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="url(#g)" filter="url(#s)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(-12 -12)" fill="#ffffff" opacity="0.95">
    ${paths}
  </g>
</svg>`;
}

function shade(hex: string, percent: number): string {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
