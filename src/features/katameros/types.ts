export type ReadingType = "psalm" | "gospel" | "pauline" | "catholic" | "praxis";

export type ReadingStatus = "not-started" | "in-progress" | "completed";

export interface DailyReading {
  id: string;
  type: ReadingType;
  title: string;          // المزمور / الإنجيل ...
  reference: string;      // مز ٢٢: ١-١٨
  source: string;         // العشية / الباكر / القداس
  estimatedMin: number;
  body: string;           // Actual Arabic text
}

export interface RelatedItem {
  id: string;
  kind: "synaxarium" | "feast" | "prayer" | "meditation";
  title: string;
  subtitle?: string;
  to?: string;
}

export interface KatamerosDay {
  id: string;
  copticDate: string;     // ٧ بشنس ١٧٤٢
  gregorianDate: string;  // ١٥ مايو ٢٠٢٦
  occasion: string;       // الجمعة العظيمة
  liturgicalDay: string;  // قراءات أسبوع الآلام
  accentHex: string;
  readings: DailyReading[];
  related: RelatedItem[];
}
