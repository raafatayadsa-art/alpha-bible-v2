import fontMaps from "./maps/coptic-font-maps.json" with { type: "json" };

const JIMKIN_UNICODE = "\u0300";
const OVERLINE_CODE = 773;

type JimkinMode = "COMBINE_WITH_CHAR_AFTER" | "COMBINE_WITH_CHAR_BEFORE" | "NONE";

const CONVERSION_ATTEMPTS: { font: keyof typeof fontMaps; jimkin: JimkinMode }[] = [
  { font: "NEW_ATHANASIUS", jimkin: "COMBINE_WITH_CHAR_AFTER" },
  { font: "CS", jimkin: "COMBINE_WITH_CHAR_AFTER" },
  { font: "NEW_ATHANASIUS", jimkin: "COMBINE_WITH_CHAR_BEFORE" },
  { font: "COPTIC1", jimkin: "COMBINE_WITH_CHAR_BEFORE" },
  { font: "KYRILLOS", jimkin: "COMBINE_WITH_CHAR_AFTER" },
];

const CACHE = new Map<string, string>();

const COPTIC_UNICODE = /[\u2C80-\u2CFF\u03E2-\u03EF\u2CEF-\u2CF1]/u;
const LEGACY_MARKERS = /[`@~;]|\\[a-z]/;

function normalizeInput(raw: string): string {
  return raw.replace(/\r/g, "").replace(/\uFEFF/g, "").trim();
}

export function isUnicodeCopticText(text: string): boolean {
  const t = normalizeInput(text);
  if (!t || t === "-") return false;
  let letters = 0;
  let coptic = 0;
  for (const ch of t) {
    if (/\s/.test(ch)) continue;
    letters++;
    if (COPTIC_UNICODE.test(ch)) coptic++;
  }
  return letters > 0 && coptic / letters >= 0.45;
}

function applyJimkin(copticUnicode: string, jimkin: JimkinMode): string {
  if (!copticUnicode || jimkin === "NONE") return copticUnicode;
  const out: string[] = [];
  for (let i = 0; i < copticUnicode.length; i++) {
    const chr = copticUnicode[i]!;
    if (chr === "`") {
      if (jimkin === "COMBINE_WITH_CHAR_BEFORE" && out.length) {
        const prev = out.pop()!;
        out.push(prev + JIMKIN_UNICODE);
      } else if (jimkin === "COMBINE_WITH_CHAR_AFTER" && i + 1 < copticUnicode.length) {
        out.push(copticUnicode[i + 1]! + JIMKIN_UNICODE);
        i++;
      }
    } else {
      out.push(chr);
    }
  }
  return out.join("");
}

function removeCharAfterOverline(copticUnicode: string): string {
  if (!copticUnicode) return copticUnicode;
  const out: string[] = [];
  for (let i = 0; i < copticUnicode.length; i++) {
    const cp = copticUnicode.codePointAt(i)!;
    out.push(copticUnicode[i]!);
    if (cp === OVERLINE_CODE) i++;
  }
  return out.join("");
}

function convertWithFont(font: keyof typeof fontMaps, source: string, jimkin: JimkinMode): string {
  const map = fontMaps[font] as Record<string, string> | undefined;
  if (!map) return source;

  const sb: string[] = [];
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!;
    if (ch === " ") {
      sb.push(" ");
      continue;
    }
    const converted = map[ch];
    sb.push(converted ?? ch);
  }

  const joined = sb.join("");
  const withJimkin = jimkin === "NONE" ? joined : applyJimkin(joined, jimkin);
  return removeCharAfterOverline(withJimkin);
}

function scoreConversion(source: string, converted: string): number {
  if (!converted || converted === source) return 0;
  let letters = 0;
  let coptic = 0;
  let legacy = 0;
  for (const ch of converted) {
    if (/\s/.test(ch)) continue;
    letters++;
    if (COPTIC_UNICODE.test(ch)) coptic++;
    if (/[`@~]|\\/.test(ch)) legacy++;
  }
  if (letters === 0) return 0;
  return (coptic / letters) * 2 - legacy / letters;
}

function orderedAttempts(source: string) {
  const hasSemicolonJimkin =
    /;[^;\s];/.test(source) || source.includes(";nte") || source.includes(";e;") || source.includes(";");
  const hasBacktick = source.includes("`");
  const hasTilda = source.includes("~");

  if (hasSemicolonJimkin || hasBacktick) {
    return CONVERSION_ATTEMPTS.filter((a) => a.font === "NEW_ATHANASIUS");
  }
  if (hasTilda) {
    return CONVERSION_ATTEMPTS.filter((a) => a.font === "COPTIC1");
  }
  return CONVERSION_ATTEMPTS;
}

function polishUnicode(text: string): string {
  return text
    .normalize("NFC")
    .replace(/:([ \n]|$)/g, "$1")
    .replace(/\s+@/g, "")
    .replace(/@/g, "")
    .replace(/`/g, "")
    .trim();
}

export async function warmCopticConverter(): Promise<void> {
  formatCopticDisplay("Am/n@");
}

export async function formatCopticDisplay(raw: string | null | undefined): Promise<string> {
  const source = normalizeInput(raw ?? "");
  if (!source || source === "-") return "";

  if (isUnicodeCopticText(source)) {
    return polishUnicode(source);
  }

  if (!LEGACY_MARKERS.test(source) && !/[A-Za-z/]/.test(source)) {
    return source;
  }

  const cached = CACHE.get(source);
  if (cached !== undefined) return cached;

  let best = source;
  let bestScore = 0;

  for (const { font, jimkin } of orderedAttempts(source)) {
    try {
      const converted = polishUnicode(convertWithFont(font, source, jimkin));
      const score = scoreConversion(source, converted);
      if (score > bestScore) {
        bestScore = score;
        best = converted;
      }
    } catch {
      /* next */
    }
  }

  CACHE.set(source, best);
  return best;
}

export async function formatCopticDisplayBatch(values: string[]): Promise<string[]> {
  const unique = [...new Set(values)];
  const converted = new Map<string, string>();
  await Promise.all(
    unique.map(async (v) => {
      converted.set(v, await formatCopticDisplay(v));
    }),
  );
  return values.map((v) => converted.get(v) ?? v);
}
