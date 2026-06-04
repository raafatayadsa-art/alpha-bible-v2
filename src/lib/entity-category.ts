/**
 * Entity category normalization — single source of truth that maps the raw
 * `category` strings stored in alpha_dictionary / bible_names_dictionary
 * (which are inconsistent, sometimes English, sometimes Arabic, sometimes
 * a name that is really a place) into the small set of UI tabs the app
 * actually has.
 *
 * IMPORTANT:
 *  - Unknown / ambiguous entries fall back to "general" — NEVER to "people".
 *    That fixes كوش / أشور being shown under People just because they sit
 *    in bible_names_dictionary.
 *  - Context-aware: if title or description clearly indicates a place
 *    (land, region, river, country, nation, ...), we override the category
 *    and route the entry to the Map tab.
 *  - Pure module — no React / Supabase imports — safe for unit tests.
 */

export type EntityTab = "people" | "map" | "verses" | "timeline" | "general";

const RAW_TO_TAB: Array<[RegExp, EntityTab]> = [
  // People
  [/(^|[^a-z])(person|people|persons|name|names|prophet|apostle|king|priest|disciple|patriarch|saint)([^a-z]|$)/i, "people"],
  [/(شخصيه|شخصيات|شخص|اشخاص|نبي|رسول|قديس|ملك|كاهن|تلميذ|بطريرك|اب |ام |رئيس|قاضي)/i, "people"],

  // Places — broad: land/region/city/river/country/nation/tribe-territory
  [/(^|[^a-z])(place|places|location|city|town|land|region|country|nation|territory|river|mountain|sea|lake|wilderness|valley|geography|map)([^a-z]|$)/i, "map"],
  [/(موضع|مكان|مدين|قري|بلد|دوله|اقليم|منطقه|ارض|بريه|واد|نهر|جبل|بحر|بحيره|شعب|امه|قبيله|سبط|جغراف)/i, "map"],

  // Verses / scripture references
  [/(verse|verses|reference|references|cross_reference|scripture)/i, "verses"],
  [/(شاهد|شواهد|ايه|ايات|مرجع|مراجع)/i, "verses"],

  // Timeline / history / events
  [/(timeline|event|events|history|historical|era|period|date)/i, "timeline"],
  [/(حدث|احداث|تاريخ|تاريخي|زمن|حقبه|عصر|عهد)/i, "timeline"],
];

/**
 * Context-aware place detector. Looks at title + description for clear
 * geographical indicators. Used to rescue place entries that were stored
 * under "name" / bible_names_dictionary.
 */
const PLACE_CONTEXT_RE =
  /(ارض|منطقه|مدين|قري|بلد|بلاد|دوله|اقليم|نهر|جبل|بحر|بحيره|بريه|واد|سهل|ساحل|شعب|امه|قبيله|سبط|مملكه|حدود|عاصمه|موقع جغراف|land|region|city|town|country|nation|river|mountain|sea|valley|wilderness|territory|kingdom|tribe)/i;

function normalize(s: string): string {
  return (s ?? "")
    .toString()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

/**
 * Map a raw dictionary category (+ optional title/description for context)
 * to a UI tab. Returns "general" for unknown — never "people".
 */
export function normalizeEntityTab(
  category?: string | null,
  title?: string | null,
  description?: string | null,
): EntityTab {
  const cat = normalize(category ?? "");
  const ctx = `${normalize(title ?? "")} ${normalize(description ?? "")}`;

  // 1. Strong context override: if the description/title clearly describes
  //    a place, route to Map even when category says "name" / "person".
  if (ctx && PLACE_CONTEXT_RE.test(ctx)) {
    // Only override when the category isn't *explicitly* a person role
    // (a person can be described AS living in a land — don't misroute).
    if (!/(نبي|رسول|قديس|ملك |كاهن|تلميذ|بطريرك|prophet|apostle|priest|disciple)/i.test(cat)) {
      // Require an unambiguous geographical noun in context.
      if (/(ارض|منطقه|مدين|قري|بلد|دوله|اقليم|نهر|جبل|بحر|بريه|واد|سهل|شعب|امه|قبيله|سبط|مملكه|land|region|city|town|country|nation|river|mountain|sea|valley|wilderness|kingdom|tribe)/i.test(ctx)) {
        return "map";
      }
    }
  }

  // 2. Direct category → tab match.
  if (cat) {
    for (const [re, tab] of RAW_TO_TAB) {
      if (re.test(cat)) return tab;
    }
  }

  // 3. Unknown — General (never People).
  return "general";
}

/** Convenience: is this entry a real person? */
export function isPersonEntity(
  category?: string | null,
  title?: string | null,
  description?: string | null,
): boolean {
  return normalizeEntityTab(category, title, description) === "people";
}

/** Convenience: is this entry a place / land / region / nation? */
export function isPlaceEntity(
  category?: string | null,
  title?: string | null,
  description?: string | null,
): boolean {
  return normalizeEntityTab(category, title, description) === "map";
}
