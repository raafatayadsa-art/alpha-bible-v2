export type KholagyVerse = {
  id: number;
  title: string;
  arabicText: string;
  copticText: string;
  englishText: string;
  sourceUrl: string;
};

export type KholagyGroup = {
  key: string;
  title: string;
  category: KholagyCategory;
  verses: KholagyVerse[];
  verseCount: number;
  preview: string;
};

export type KholagyCategory = "liturgy" | "tasbeha" | "prayers" | "doxology" | "closing";

export type KholagyLiturgyKey = "basil" | "cyril" | "gregory";

export type KholagyLiturgyRole = "priest" | "deacon" | "people" | "rubrics" | "note";

export type KholagyLiturgyBlock = {
  id: string;
  role?: KholagyLiturgyRole;
  roleLabelAr?: string;
  arabicText: string;
  copticText: string;
  englishText: string;
};

export type KholagyLiturgySection = {
  id: number;
  liturgyKey: KholagyLiturgyKey;
  sortOrder: number;
  title: string;
  sourceUrl: string;
  blocks: KholagyLiturgyBlock[];
  blockCount: number;
};

export type KholagyLiturgySummary = {
  liturgyKey: KholagyLiturgyKey;
  sectionCount: number;
  sections: KholagyLiturgySection[];
};
