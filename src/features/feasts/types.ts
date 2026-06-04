export type FeastCategory = "feast" | "fast" | "saint" | "occasion";

export type FeastEvent = {
  id: string;
  title: string;
  subtitle: string;
  category: FeastCategory;
  copticDay: string;
  copticYear: string;
  gregorianDate: string;
  scripture?: string;
  scriptureRef?: string;
  description: string;
  about: string;
  rite: string;
  readings: string;
  image: string;
  accent: "purple" | "gold" | "green" | "blue";
};
