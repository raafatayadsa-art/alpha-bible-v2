import type { KholagyCategory } from "./types";

export function normalizeKholagyTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

export function kholagyGroupKey(firstId: number): string {
  return String(firstId);
}

export function classifyKholagyCategory(title: string): KholagyCategory {
  const t = normalizeKholagyTitle(title);
  if (/ذكصول|دكصول|مقدمه الدكصول|مقدمة\s/i.test(t)) return "doxology";
  if (/تحليل/i.test(t)) return "closing";
  if (/أوش/i.test(t)) return "prayers";
  return "tasbeha";
}

export const KHOLAGY_CATEGORY_LABEL: Record<KholagyCategory, string> = {
  liturgy: "القداسات",
  tasbeha: "التسبحة",
  prayers: "الأوشيات",
  doxology: "الذكصولوجيات",
  closing: "الختام",
};

export type KholagyBrowseCategory = Exclude<KholagyCategory, "liturgy">;

export const KHOLAGY_HUB_CATEGORIES: KholagyBrowseCategory[] = [
  "tasbeha",
  "prayers",
  "doxology",
  "closing",
];

export function parseKholagyBrowseCategory(value: string): KholagyBrowseCategory | null {
  if (value === "tasbeha" || value === "prayers" || value === "doxology" || value === "closing") {
    return value;
  }
  return null;
}

export const KHOLAGY_CATEGORY_ORDER: KholagyCategory[] = [
  "liturgy",
  "tasbeha",
  "prayers",
  "doxology",
  "closing",
];
