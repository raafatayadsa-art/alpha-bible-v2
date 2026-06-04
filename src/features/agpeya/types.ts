export type AgpeyaSectionKey = "day" | "night" | "extra";

export type AgpeyaTabKey = "text" | "psalms" | "gospel" | "fragments" | "info";

export interface AgpeyaTabContent {
  /** Plain Arabic prose. Paragraphs are separated by blank lines. */
  body?: string;
  /** Optional list of references e.g. مز ١، مز ٢. */
  references?: string[];
}

export interface AgpeyaPrayer {
  id: string;
  title: string;
  /** Short subtitle e.g. "الساعة السادسة صباحًا" */
  subtitle?: string;
  /** Liturgical hour in 24h clock; used to pick "current" prayer. */
  hour?: number;
  section: AgpeyaSectionKey;
  /** Optional accent token used by the card. */
  accent?: "dawn" | "noon" | "evening" | "night" | "extra";
  /** Per-tab content. Tabs with no entry are hidden. */
  tabs: Partial<Record<AgpeyaTabKey, AgpeyaTabContent>>;
}
