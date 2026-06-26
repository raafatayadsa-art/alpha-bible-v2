import { bibleV2Tokens as T } from "@/features/bible-v2/tokens";

export const BOOKS_PREMIUM = {
  ...T,
  otAccent: T.goldDeep,
  otGlow: "rgba(212, 175, 55, 0.35)",
  ntAccent: T.navySoft,
  ntGlow: "rgba(61, 90, 154, 0.32)",
  heroOtGradient: "linear-gradient(145deg, #fbf3e1 0%, #f5ead8 52%, #ebe0c8 100%)",
  heroNtGradient: "linear-gradient(145deg, #eef2fb 0%, #e4eaf8 52%, #d8e2f4 100%)",
  cardShadow: `0 18px 40px -16px ${T.shadowCard}, inset 0 1px 0 rgba(255,255,255,0.95)`,
} as const;
