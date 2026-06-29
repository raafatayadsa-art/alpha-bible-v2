import type { ReactNode } from "react";
import { CopticCross, CopticMiniCross } from "@/components/coptic";
import { AvatarWithDisplayShield } from "@/components/alpha/AvatarWithDisplayShield";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  avatarUrl?: string;
  /** Church-affiliated members only — null hides the trust shield entirely. */
  shieldRole?: ShieldRole | null;
  showShield?: boolean;
  className?: string;
};

const PHOTO_PX = 140;
const FRAME_PX = 168;

/** Large profile avatar — ornate Coptic ring + glowing cross crown. */
export function ProfileCopticAvatarFrame({
  name,
  avatarUrl,
  shieldRole,
  showShield = false,
  className,
}: Props) {
  const initial = name.trim().charAt(0) || "Ⲁ";
  const role = showShield && shieldRole ? shieldRole : null;

  const photo = avatarUrl ? (
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#f5ead8] via-[#e8dcc8] to-[#d4c4a8] font-arabic-serif text-[44px] font-black text-[#7a5a28]">
      {initial}
    </div>
  );

  const wrappedPhoto: ReactNode = role ? (
    <AvatarWithDisplayShield
      userName={name}
      userAvatar={avatarUrl}
      shieldRole={role}
      shieldSize="lg"
      className="h-full w-full"
      avatarClassName="h-full w-full"
    >
      {photo}
    </AvatarWithDisplayShield>
  ) : (
    photo
  );

  return (
    <div className={cn("relative mx-auto select-none", className)} style={{ width: FRAME_PX, height: FRAME_PX + 18 }}>
      {/* Glow halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[14px] -translate-x-1/2 rounded-full"
        style={{
          width: FRAME_PX + 12,
          height: FRAME_PX + 12,
          background: "radial-gradient(circle, rgba(240,215,140,0.28) 0%, rgba(184,137,58,0.08) 42%, transparent 68%)",
        }}
      />

      {/* Ornate outer ring */}
      <div
        className="absolute left-1/2 top-[14px] -translate-x-1/2 rounded-full p-[5px]"
        style={{
          width: FRAME_PX,
          height: FRAME_PX,
          background:
            "linear-gradient(145deg, #f0d78c 0%, #c79356 38%, #8a5a22 72%, #f0d78c 100%)",
          boxShadow:
            "0 14px 36px -14px rgba(120,80,20,0.55), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -3px 8px rgba(80,50,10,0.35)",
        }}
      >
        <div
          className="relative flex h-full w-full items-center justify-center rounded-[inherit] p-[4px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.35) 0%, rgba(255,248,230,0.12) 40%, rgba(60,40,12,0.18) 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22)",
          }}
        >
          {/* Coptic glyph ticks */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full text-[#b8893a]/75"
            viewBox="0 0 100 100"
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 50 50)`}>
                <line x1="50" y1="3" x2="50" y2="8" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="50" cy="5.5" r="0.9" fill="currentColor" />
              </g>
            ))}
          </svg>

          <div
            className="relative mx-auto overflow-hidden rounded-full border-2 border-[#f0d78c]/70 shadow-[inset_0_2px_8px_rgba(0,0,0,0.12)]"
            style={{ width: PHOTO_PX, height: PHOTO_PX }}
          >
            {wrappedPhoto}
          </div>
        </div>
      </div>

      {/* Cardinal mini crosses */}
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-[6px] -translate-x-1/2 text-[#d4a843]/80">
        <CopticMiniCross size={11} />
      </span>
      <span aria-hidden className="pointer-events-none absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[#d4a843]/80">
        <CopticMiniCross size={11} />
      </span>
      <span aria-hidden className="pointer-events-none absolute left-[2px] top-[calc(14px+50%)] -translate-y-1/2 text-[#d4a843]/80">
        <CopticMiniCross size={11} />
      </span>
      <span aria-hidden className="pointer-events-none absolute right-[2px] top-[calc(14px+50%)] -translate-y-1/2 text-[#d4a843]/80">
        <CopticMiniCross size={11} />
      </span>

      {/* Glowing Coptic cross crown */}
      <div
        className="absolute left-1/2 top-0 z-20 -translate-x-1/2"
        aria-hidden
      >
        <div
          className="grid place-items-center rounded-full border border-[#f0d78c]/80 p-1.5"
          style={{
            background: "linear-gradient(180deg, #fff8e7 0%, #f0d78c 45%, #c79356 100%)",
            boxShadow:
              "0 0 18px rgba(240,215,140,0.85), 0 0 32px rgba(184,137,58,0.45), inset 0 1px 0 rgba(255,255,255,0.65)",
          }}
        >
          <CopticCross
            size={24}
            className="text-[#7a4a12] drop-shadow-[0_0_6px_rgba(255,248,220,0.95)]"
          />
        </div>
      </div>
    </div>
  );
}
