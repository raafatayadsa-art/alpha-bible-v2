import type { CommunityMomentKind } from "./community-types";
import {
  COMMUNITY_AGPEYA_ALT,
  COMMUNITY_MOMENT_ART,
  COMMUNITY_PRAYER_ALT,
  COMMUNITY_READING_ALT,
} from "./community-moment-art";

type Props = {
  kind: CommunityMomentKind;
  /** Slight image variation per card */
  seed?: string;
};

function pickImage(kind: CommunityMomentKind, seed?: string) {
  const base = COMMUNITY_MOMENT_ART[kind].image;
  if (!seed) return base;
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (kind === "reading" && n % 3 === 0) return COMMUNITY_READING_ALT;
  if (kind === "prayer" && n % 3 === 1) return COMMUNITY_PRAYER_ALT;
  if (kind === "agpeya" && n % 3 === 2) return COMMUNITY_AGPEYA_ALT;
  return base;
}

export function CommunityMomentCardArt({ kind, seed }: Props) {
  const art = COMMUNITY_MOMENT_ART[kind];
  const image = pickImage(kind, seed);

  return (
    <>
      <img
        src={image}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover alpha-media-polish"
        style={{ opacity: 0.42, filter: "saturate(1.12) contrast(1.06)" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: art.gradient }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-[0.16]"
        style={{
          background: `radial-gradient(ellipse 85% 70% at 82% 18%, ${art.glow} 0%, transparent 62%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-3 select-none font-black leading-none opacity-[0.07]"
        style={{ fontSize: 72, color: art.accent }}
      >
        {art.glyph}
      </span>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[21px]"
        style={{
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 36px ${art.glow}`,
        }}
      />
    </>
  );
}
