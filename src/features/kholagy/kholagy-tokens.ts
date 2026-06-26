import type { KholagyCategory } from "./types";

export type KholagyAccent = {
  card: string;
  iconBg: string;
  iconColor: string;
  title: string;
  meta: string;
  chev: string;
  glow: string;
};

const PALETTE: KholagyAccent[] = [
  {
    card: "bg-gradient-to-br from-[#f3e8ff] via-[#e6d4ff] to-[#cdb8f5] border-[#9b7ad4]/50",
    iconBg: "bg-white/88",
    iconColor: "text-[#6a4ab5]",
    title: "text-[#3a2560]",
    meta: "text-[#5a4088]",
    chev: "bg-white/88 text-[#5a4088]",
    glow: "#8a6ec1",
  },
  {
    card: "bg-gradient-to-br from-[#fff3d0] via-[#ffe7b0] to-[#fcd887] border-[#e7c075]/55",
    iconBg: "bg-white/88",
    iconColor: "text-[#c98a1f]",
    title: "text-[#6e4715]",
    meta: "text-[#8a5a1f]",
    chev: "bg-white/88 text-[#8a5a1f]",
    glow: "#b8893a",
  },
  {
    card: "bg-gradient-to-br from-[#e8f4ec] via-[#cce8d6] to-[#a8d4b8] border-[#6aab82]/50",
    iconBg: "bg-white/88",
    iconColor: "text-[#2e7a4a]",
    title: "text-[#1e4a30]",
    meta: "text-[#3a6848]",
    chev: "bg-white/88 text-[#3a6848]",
    glow: "#4a9e6e",
  },
  {
    card: "bg-gradient-to-br from-[#fde8ef] via-[#f5c8d8] to-[#e8a8c0] border-[#c86a8a]/45",
    iconBg: "bg-white/88",
    iconColor: "text-[#a83a5a]",
    title: "text-[#5a1830]",
    meta: "text-[#7a3850]",
    chev: "bg-white/88 text-[#7a3850]",
    glow: "#c44569",
  },
  {
    card: "bg-gradient-to-br from-[#ece4f5] via-[#dccdee] to-[#c4afe0] border-[#a98cd1]/55",
    iconBg: "bg-white/88",
    iconColor: "text-[#7a4fcc]",
    title: "text-[#3c2566]",
    meta: "text-[#5a3a92]",
    chev: "bg-white/88 text-[#5a3a92]",
    glow: "#7a5cb0",
  },
  {
    card: "bg-gradient-to-br from-[#1f3a6e] via-[#1a2f5e] to-[#0f1f44] border-white/15 text-white",
    iconBg: "bg-white/15 backdrop-blur",
    iconColor: "text-[#f0d78c]",
    title: "text-white",
    meta: "text-white/75",
    chev: "bg-white/15 text-[#f0d78c]",
    glow: "#f0d78c",
  },
];

const CATEGORY_DEFAULT: Record<KholagyCategory, number> = {
  liturgy: 0,
  tasbeha: 1,
  prayers: 2,
  doxology: 4,
  closing: 5,
};

export function kholagyAccentForGroup(
  category: KholagyCategory,
  indexInCategory: number,
): KholagyAccent {
  const base = CATEGORY_DEFAULT[category];
  return PALETTE[(base + indexInCategory) % PALETTE.length]!;
}

export function kholagyAccentForCategory(category: KholagyCategory): KholagyAccent {
  return kholagyAccentForGroup(category, 0);
}
