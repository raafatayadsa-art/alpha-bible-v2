import type { CommunityMomentKind } from "./community-types";
import artReadings from "@/assets/home/art-readings.jpg";
import cardBible from "@/assets/home/card-bible.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import dailyPrayer from "@/assets/home/daily-prayer.jpg";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import agpeyaHero from "@/assets/agpeya/hero-sunrise.jpg";

export type CommunityMomentArtConfig = {
  image: string;
  gradient: string;
  accent: string;
  glyph: string;
  glow: string;
};

export const COMMUNITY_MOMENT_ART: Record<CommunityMomentKind, CommunityMomentArtConfig> = {
  reading: {
    image: artReadings,
    gradient:
      "linear-gradient(165deg, rgba(42,31,69,0.88) 0%, rgba(26,18,48,0.82) 45%, rgba(12,8,22,0.94) 100%)",
    accent: "#8a6ec1",
    glyph: "Ⲁ",
    glow: "rgba(138,110,193,0.28)",
  },
  prayer: {
    image: dailyPrayer,
    gradient:
      "linear-gradient(165deg, rgba(18,48,36,0.88) 0%, rgba(12,32,28,0.82) 45%, rgba(8,18,14,0.94) 100%)",
    accent: "#1f8a5a",
    glyph: "Ⲭ",
    glow: "rgba(31,138,90,0.26)",
  },
  agpeya: {
    image: cardAgpeya,
    gradient:
      "linear-gradient(165deg, rgba(58,38,18,0.9) 0%, rgba(36,24,12,0.84) 45%, rgba(16,10,6,0.94) 100%)",
    accent: "#c98a3c",
    glyph: "Ⲭ",
    glow: "rgba(201,138,60,0.28)",
  },
};

/** Alternate art for reading auto-shares */
export const COMMUNITY_READING_ALT = cardBible;
export const COMMUNITY_PRAYER_ALT = cardMeditation;
export const COMMUNITY_AGPEYA_ALT = agpeyaHero;
