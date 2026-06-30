import { useMemo } from "react";
import { CopticMiniCross } from "@/components/coptic";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { useAlphaIdentity } from "@/features/identity/useAlphaIdentity";
import { getProfileCover } from "../profile-cover-storage";
import { PROFILE_MEMBER_DEMO } from "../profile-member";

const SHIELD_SRC: Record<ShieldRole, string> = {
  member: "/shields/member-shield.png",
  servant: "/shields/servant-shield.png",
  priest: "/shields/priest-shield.png",
  official: "/shields/official-shield.png",
};

export function ProfileHeroV3() {
  const member = PROFILE_MEMBER_DEMO;
  const identity = useAlphaIdentity({
    displayName: member.displayName,
    churchName: member.churchName,
    verified: member.verified,
  });

  const coverUrl = useMemo(() => getProfileCover(member.coverImage), [member.coverImage]);
  const initial = member.displayName.charAt(0);

  return (
    <header className="relative -mx-4 mb-1">
      {/* §1 — Cover (editable elsewhere; Alpha default when unset) */}
      <div className="relative mx-4 h-[172px] overflow-hidden rounded-b-[26px] shadow-[0_12px_28px_-18px_rgba(58,42,24,0.35)]">
        <img
          src={coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(58,42,24,0.06) 0%, rgba(244,234,216,0.42) 68%, rgba(244,234,216,0.92) 100%)",
          }}
        />
      </div>

      {/* Avatar cluster — overlaps cover */}
      <div className="relative -mt-[54px] flex flex-col items-center text-center px-6">
        <div className="relative">
          {/* Soft outer glow */}
          <div
            aria-hidden
            className="absolute inset-0 -m-4 rounded-full opacity-80"
            style={{
              background:
                "radial-gradient(circle, rgba(240,215,140,0.28) 0%, rgba(216,162,58,0.1) 58%, transparent 74%)",
            }}
          />

          {/* Elegant golden halo ring */}
          <div
            aria-hidden
            className="absolute inset-0 -m-[5px] rounded-full border-[1.5px] border-[#e7c97a]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,244,208,0.45), 0 0 20px rgba(231,201,122,0.28)",
            }}
          />

          {/* Premium cross integrated above halo */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 -top-[18px] grid place-items-center text-[#d8a23a]"
          >
            <CopticMiniCross size={14} />
          </div>

          {/* Circular avatar */}
          <div className="relative h-[96px] w-[96px] rounded-full border-[2px] border-[#f0d78c] overflow-hidden bg-gradient-to-b from-[#5a3a1e] to-[#2a1810] grid place-items-center shadow-[0_12px_28px_-12px_rgba(58,42,24,0.5)]">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[38px] font-bold text-[#f0d78c]">{initial}</span>
            )}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent)" }}
            />
          </div>

          {/* Tiny Alpha shield — verification mark only */}
          <img
            src={SHIELD_SRC[member.role]}
            alt=""
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] object-contain drop-shadow-[0_2px_6px_rgba(58,42,24,0.35)]"
          />
        </div>

        {/* Identity text — nothing else */}
        <h1 className="mt-4 text-[19px] font-extrabold text-[#3a2a18] tracking-tight leading-tight">
          {member.displayName}
        </h1>
        <p className="mt-1 text-[12.5px] font-semibold text-[#9a7e5a]">{member.username}</p>

        <span
          className="mt-2.5 inline-flex items-center rounded-full border border-[#e7c97a]/65 bg-[#fbf3e1]/90 px-3 py-1 text-[11px] font-extrabold text-[#8a6325] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
        >
          {member.membershipLabel}
        </span>

        <p className="mt-2 text-[10.5px] font-bold text-[#9a7e5a] tabular-nums tracking-[0.06em]">
          {identity.alphaId}
        </p>
      </div>
    </header>
  );
}
