import { AlphaShield } from "@/components/alpha/AlphaShield";
import { useAlphaIdentity } from "@/features/identity/useAlphaIdentity";
import { PROFILE_MEMBER_DEMO } from "../profile-member";

export function ProfileHeroV3() {
  const member = PROFILE_MEMBER_DEMO;
  const identity = useAlphaIdentity({
    displayName: member.displayName,
    churchName: member.churchName,
    verified: member.verified,
  });

  const initial = member.displayName.charAt(0);

  return (
    <header className="relative -mx-4">
      {/* Cover */}
      <div className="relative h-[148px] overflow-hidden">
        <img
          src={member.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,234,216,0.08) 0%, rgba(244,234,216,0.55) 72%, #f4ead8 100%)",
          }}
        />
      </div>

      {/* Avatar block — overlaps cover */}
      <div className="relative -mt-[52px] flex flex-col items-center text-center px-4 pb-1">
        <div className="relative">
          {/* Elegant golden halo */}
          <div
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(240,215,140,0.35) 0%, rgba(216,162,58,0.18) 55%, transparent 72%)",
              filter: "blur(2px)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -m-1.5 rounded-full border-2 border-[#e7c97a]/85"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,244,208,0.5), 0 0 18px rgba(231,201,122,0.35), inset 0 0 12px rgba(240,215,140,0.25)",
            }}
          />

          {/* Small premium cross above halo */}
          <svg
            aria-hidden
            viewBox="0 0 24 32"
            className="absolute left-1/2 -translate-x-1/2 -top-5 w-5 h-7 text-[#d8a23a]"
            fill="currentColor"
          >
            <rect x="10.5" y="4" width="3" height="20" rx="0.8" />
            <rect x="5" y="11" width="14" height="3" rx="0.8" />
            <circle cx="12" cy="4" r="1.6" />
          </svg>

          {/* Avatar */}
          <div className="relative h-[92px] w-[92px] rounded-full border-[2.5px] border-[#f0d78c] overflow-hidden bg-gradient-to-b from-[#5a3a1e] to-[#2a1810] grid place-items-center shadow-[0_10px_24px_-10px_rgba(58,42,24,0.45)]">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[36px] font-bold text-[#f0d78c]">{initial}</span>
            )}
          </div>

          {/* Tiny Alpha shield — membership indicator */}
          <div className="absolute -bottom-0.5 -left-1 z-10 scale-[0.72] origin-bottom-left">
            <AlphaShield role={member.role} size="sm" userName={member.displayName} />
          </div>
        </div>

        <h1 className="mt-3 text-[18px] font-extrabold text-[#3a2a18] tracking-tight">
          {member.displayName}
        </h1>
        <p className="mt-0.5 text-[12px] font-semibold text-[#9a7e5a]">{member.username}</p>
        <p className="mt-1 text-[12.5px] font-bold text-[#b8893a]">{member.membershipLabel}</p>
        <p className="mt-1 text-[11px] font-bold text-[#6a543a] tabular-nums tracking-wide">
          {identity.alphaId}
        </p>
      </div>
    </header>
  );
}
