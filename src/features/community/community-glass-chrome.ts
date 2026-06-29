/** Shared glass / premium chrome for community hub screens. */

export const COMMUNITY_GLASS_CARD =
  "overflow-hidden rounded-[22px] border border-[#e7c97a]/30 bg-white/62 backdrop-blur-xl shadow-[0_16px_40px_-20px_rgba(80,50,20,0.32),inset_0_1px_0_rgba(255,255,255,0.72)]";

export const COMMUNITY_GLASS_MOMENT =
  "overflow-hidden rounded-[22px] border border-[#e7c97a]/35 backdrop-blur-xl shadow-[0_20px_48px_-20px_rgba(40,28,12,0.58),inset_0_1px_0_rgba(255,255,255,0.1)]";

export const COMMUNITY_GLASS_MOMENT_BG =
  "linear-gradient(165deg, rgba(42,31,18,0.92) 0%, rgba(18,12,8,0.94) 100%)";

export const COMMUNITY_GLASS_BTN =
  "rounded-2xl border border-[#e7c97a]/32 bg-white/58 backdrop-blur-lg shadow-[0_10px_28px_-14px_rgba(80,50,20,0.28),inset_0_1px_0_rgba(255,255,255,0.65)] active:scale-[0.98] transition-transform";

export const COMMUNITY_GLASS_BTN_ACCENT = (hex: string) =>
  `${COMMUNITY_GLASS_BTN} border-[color-mix(in_srgb,${hex}_38%,#e7c97a_62%)] bg-[color-mix(in_srgb,${hex}_10%,white_58%)]`;

export const COMMUNITY_GLASS_CHIP =
  "rounded-full border border-[#e7c97a]/30 bg-white/58 backdrop-blur-md shadow-[0_6px_18px_-12px_rgba(80,50,20,0.22),inset_0_1px_0_rgba(255,255,255,0.58)] active:scale-[0.98] transition-transform";

export const COMMUNITY_GLASS_ICON_BTN =
  "grid place-items-center rounded-full border border-[#e7c97a]/32 bg-white/58 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] active:scale-95 transition-transform";
