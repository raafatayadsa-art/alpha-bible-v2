export type AgpeyaSectionKey = "day" | "night" | "extra";

export type AgpeyaTabKey = "text" | "psalms" | "gospel" | "fragments" | "info";

/** Structured psalm entry. */
export interface AgpeyaPsalm {
  number: number;
  title?: string;
  /** Verse strings WITHOUT leading numbering — UI numbers them. */
  verses: string[];
}

/** Structured gospel pericope. */
export interface AgpeyaGospelPassage {
  reference: string;        // e.g. "إنجيل معلمنا متى الإصحاح ٥"
  intro?: string;           // e.g. "مبارك الآتي باسم الرب..."
  passage: string;          // multi-paragraph body
  conclusion?: string;      // e.g. "والمجد لله دائماً"
}

/** Standalone liturgical fragment (Trisagion, Doxology, etc.). */
export interface AgpeyaFragment {
  title: string;
  body: string;
}

/** Definition-list entry for the Info tab. */
export interface AgpeyaInfoEntry {
  label: string;
  value: string;
}

export interface AgpeyaTabContent {
  /** Plain Arabic prose. Paragraphs are separated by blank lines. */
  body?: string;
  /** Optional list of references e.g. مز ١، مز ٢. */
  references?: string[];
  /** Psalms tab — structured list. */
  psalms?: AgpeyaPsalm[];
  /** Gospel tab — structured pericope(s). */
  gospel?: AgpeyaGospelPassage[];
  /** Fragments tab — short standalone pieces. */
  fragments?: AgpeyaFragment[];
  /** Info tab — definition entries. */
  info?: AgpeyaInfoEntry[];
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
  subtitle?: string;
  description?: string;
  hour?: number;
  clock?: string;
  durationMin?: number;
  psalmsCount?: number;
  gospelCount?: number;
  metaLine?: string;
  section: AgpeyaSectionKey;
  accent?: "dawn" | "midmorning" | "noon" | "evening" | "compline" | "veil" | "midnight" | "extra";
  tabs: Partial<Record<AgpeyaTabKey, AgpeyaTabContent>>;
  audio?: AgpeyaAudioMeta;
}
