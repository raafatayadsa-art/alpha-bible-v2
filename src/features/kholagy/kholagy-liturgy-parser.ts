import type { KholagyColumn, KholagyDisplayMode } from "./kholagy-display";
import { columnsForMode } from "./kholagy-display";
import type { KholagyLiturgyBlock, KholagyLiturgyRole } from "./types";

function blockColumnText(block: KholagyLiturgyBlock, col: KholagyColumn): string {
  switch (col) {
    case "ar":
      return block.arabicText.trim();
    case "cop":
      return block.copticText.trim();
    case "en":
      return block.englishText.trim();
  }
}

/** True when the block has text in at least one visible column (or any column if mode omitted). */
export function isLiturgyBlockNonEmpty(
  block: KholagyLiturgyBlock,
  mode?: KholagyDisplayMode,
): boolean {
  const cols = mode ? columnsForMode(mode) : (["ar", "cop", "en"] as KholagyColumn[]);
  return cols.some((col) => blockColumnText(block, col).length > 0);
}

export function filterLiturgyBlocks(
  blocks: KholagyLiturgyBlock[],
  mode?: KholagyDisplayMode,
): KholagyLiturgyBlock[] {
  return blocks.filter((block) => isLiturgyBlockNonEmpty(block, mode));
}

const ROLE_MARKERS: { pattern: RegExp; role: KholagyLiturgyRole; labelAr: string }[] = [
  { pattern: /^(Priest|Pi`precbuteroc@|الكاهن)\s*:?\s*$/i, role: "priest", labelAr: "الكاهن" },
  { pattern: /^(Deacon|Pidiakwn@|الشماس)\s*:?\s*$/i, role: "deacon", labelAr: "الشماس" },
  { pattern: /^(People|Pilaoc@|الشعب|Congregation)\s*:?\s*$/i, role: "people", labelAr: "الشعب" },
  { pattern: /^تنسيق مختلف\s*$/i, role: "rubrics", labelAr: "تنسيق" },
];

const SKIP_LINE =
  /^(كتاب الخولاجي|القداس الكيرلسي|القداس الك|الخولاجي|فهرس|←|\(\)|\.{2,})|St-Kirellos|St-Basil|St-Gregory|Liturgy-Lyrics/i;

function classifyLine(line: string): "ar" | "cop" | "en" | "skip" {
  const t = line.trim();
  if (!t || SKIP_LINE.test(t)) return "skip";
  if (/[`@]|\\[a-z]|Ⲁ|Ⲃ|Ⲕ|Ⲙ|Ⲟ|Ⲡ|Ⲣ|Ⲥ|Ⲧ|Ⲩ|Ⲫ|Ⲭ|Ⲯ|Ⲱ|Ⲇ|Ⲉ|Ⲍ|Ⲏ|Ⲑ|Ⲓ|Ⲕ|Ⲗ|Ⲙ|Ⲛ|Ⲝ|Ⲟ|Ⲡ|Ⲣ|Ⲥ|Ⲧ|Ⲩ|Ⲫ|Ⲭ|Ⲯ|Ⲱ/i.test(t)) {
    return "cop";
  }
  if (/[\u0600-\u06FF]/.test(t)) return "ar";
  if (/^[A-Za-z0-9\s.,;:'"!?()\-–—/\\]+$/.test(t)) return "en";
  return "ar";
}

function flushBuffer(
  blocks: KholagyLiturgyBlock[],
  role: KholagyLiturgyRole | undefined,
  roleLabelAr: string | undefined,
  buffer: { ar: string[]; cop: string[]; en: string[] },
) {
  const arabicText = buffer.ar.join("\n").trim();
  const copticText = buffer.cop.join("\n").trim();
  const englishText = buffer.en.join("\n").trim();
  if (!arabicText && !copticText && !englishText) return;
  blocks.push({
    id: `block-${blocks.length + 1}`,
    role,
    roleLabelAr,
    arabicText,
    copticText,
    englishText,
  });
  buffer.ar = [];
  buffer.cop = [];
  buffer.en = [];
}

/** Parses scraped liturgy HTML text into readable tri-lingual blocks. */
export function parseLiturgyContent(raw: string): KholagyLiturgyBlock[] {
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks: KholagyLiturgyBlock[] = [];
  let role: KholagyLiturgyRole | undefined;
  let roleLabelAr: string | undefined;
  const buffer = { ar: [] as string[], cop: [] as string[], en: [] as string[] };

  for (const line of lines) {
    const marker = ROLE_MARKERS.find((m) => m.pattern.test(line));
    if (marker) {
      flushBuffer(blocks, role, roleLabelAr, buffer);
      role = marker.role;
      roleLabelAr = marker.labelAr;
      continue;
    }

    const kind = classifyLine(line);
    if (kind === "skip") continue;
    if (kind === "ar") buffer.ar.push(line);
    else if (kind === "cop") buffer.cop.push(line);
    else buffer.en.push(line);
  }

  flushBuffer(blocks, role, roleLabelAr, buffer);
  return blocks;
}
