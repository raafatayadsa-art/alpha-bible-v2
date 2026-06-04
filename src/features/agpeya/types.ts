export type AgpeyaSectionKey = "day" | "night" | "extra";

export type AgpeyaTabKey = "text" | "psalms" | "gospel" | "fragments" | "info";

export interface AgpeyaTabContent {
  /** Plain Arabic prose. Paragraphs are separated by blank lines. */
  body?: string;
  /** Optional list of references e.g. مز ١، مز ٢. */
  references?: string[];
}

/** Audio metadata placeholder — playback not implemented yet. */
export interface AgpeyaAudioMeta {
  url?: string;
  durationSec?: number;
  reciter?: string;
  available?: boolean;
}

export interface AgpeyaPrayer {
  id: string;
  title: string;
  /** Short subtitle e.g. "الساعة السادسة صباحًا" */
  subtitle?: string;
  /** Longer one-line description shown on the hero card. */
  description?: string;
  /** Liturgical hour in 24h clock; used to pick "current" prayer. */
  hour?: number;
  /** Human label for the hour, e.g. "06:00 ص". */
  clock?: string;
  /** Estimated reading duration in minutes. */
  durationMin?: number;
  /** Number of psalms in this prayer. */
  psalmsCount?: number;
  /** Number of gospel pericopes (قطع) in this prayer. */
  gospelCount?: number;
  /** Short reference line e.g. "12 مزمور — 3 قطع — 35 دقيقة" override. */
  metaLine?: string;
  section: AgpeyaSectionKey;
  /** Optional accent token used by the card. */
  accent?: "dawn" | "midmorning" | "noon" | "evening" | "compline" | "veil" | "midnight" | "extra";
  /** Per-tab content. Tabs with no entry are hidden. */
  tabs: Partial<Record<AgpeyaTabKey, AgpeyaTabContent>>;
  /** Optional audio recitation metadata (not yet wired to a player). */
  audio?: AgpeyaAudioMeta;
}
