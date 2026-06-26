import type { KholagyLiturgyKey } from "./types";

export type KholagyLiturgyMeta = {
  key: KholagyLiturgyKey;
  labelAr: string;
  labelShort: string;
  subtitleAr: string;
  folderHint: string;
  accent: string;
  glow: string;
  card: string;
  iconBg: string;
};

export const KHOLAGY_LITURGY_ORDER: KholagyLiturgyKey[] = ["cyril", "basil", "gregory"];

export const KHOLAGY_LITURGY_META: Record<KholagyLiturgyKey, KholagyLiturgyMeta> = {
  basil: {
    key: "basil",
    labelAr: "قداس القديس باسيليوس",
    labelShort: "قداس باسيليوس",
    subtitleAr: "القداس البيزنطي — 72 مقطع",
    folderHint: "2-St-Basil-Liturgy",
    accent: "#4a9e6e",
    glow: "#4a9e6e",
    card: "bg-gradient-to-br from-[#e8f4ec] via-[#cce8d6] to-[#a8d4b8] border-[#6aab82]/50",
    iconBg: "bg-white/88",
  },
  cyril: {
    key: "cyril",
    labelAr: "القداس الكيرلسي",
    labelShort: "قداس كيرلس",
    subtitleAr: "قداس القديس كيرلس — 41 مقطع",
    folderHint: "4-St-Cyril-Liturgy",
    accent: "#b8893a",
    glow: "#b8893a",
    card: "bg-gradient-to-br from-[#fff3d0] via-[#ffe7b0] to-[#fcd887] border-[#e7c075]/55",
    iconBg: "bg-white/88",
  },
  gregory: {
    key: "gregory",
    labelAr: "قداس القديس غريغوريوس",
    labelShort: "قداس غريغوريوس",
    subtitleAr: "قداس القديس غريغوريوس — 29 مقطع",
    folderHint: "3-St-Gregory-Liturgy",
    accent: "#5b8fd1",
    glow: "#5b8fd1",
    card: "bg-gradient-to-br from-[#ece4f5] via-[#dccdee] to-[#c4afe0] border-[#a98cd1]/55",
    iconBg: "bg-white/88",
  },
};

export function inferLiturgyKey(sourceUrl: string, content: string): KholagyLiturgyKey {
  const url = sourceUrl.toLowerCase();
  if (url.includes("st-basil") || url.includes("basil-liturgy")) return "basil";
  if (url.includes("st-gregory") || url.includes("gregory-liturgy")) return "gregory";
  if (url.includes("st-cyril") || url.includes("cyril-liturgy") || url.includes("kirellos")) return "cyril";
  if (content.includes("باسيل")) return "basil";
  if (content.includes("غريغور") || content.includes("Gregory")) return "gregory";
  return "cyril";
}

export function isKholagyLiturgyKey(value: string): value is KholagyLiturgyKey {
  return value === "basil" || value === "cyril" || value === "gregory";
}
