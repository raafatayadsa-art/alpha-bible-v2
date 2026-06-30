import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { useAlphaIdentity } from "@/features/identity/useAlphaIdentity";
import { PROFILE_MEMBER_DEMO } from "../profile-member";
import { ProfileGlassCard } from "./shared";

export function ProfileMembershipCardV3() {
  const member = PROFILE_MEMBER_DEMO;
  const identity = useAlphaIdentity({
    displayName: member.displayName,
    churchName: member.churchName,
    verified: member.verified,
  });

  return (
    <div className="mt-5">
      <ProfileGlassCard className="p-4">
        <div className="flex items-stretch gap-3.5">
          <div className="shrink-0">
            <div
              className="rounded-[14px] p-[3px]"
              style={{
                background: "linear-gradient(135deg, #f7e7b8, #d8a23a, #fff4d0, #b8893a)",
                boxShadow: "0 6px 14px -8px rgba(120,80,30,0.45)",
              }}
            >
              <div className="rounded-[12px] bg-[#fff7e3] p-1.5">
                <AlphaQrCode
                  value={identity.qrPayload}
                  size={200}
                  fgColor="2a1a0d"
                  bgColor="fbf3e1"
                  alt="Alpha QR"
                  className="block h-[76px] w-[76px]"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#8a5a1c] uppercase">
              بطاقة العضوية
            </p>
            <h3 className="mt-1 text-[16px] font-extrabold text-[#2a1a08] leading-tight truncate">
              {member.displayName}
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-[#9a7e5a]">{member.username}</p>
            <p className="mt-1.5 text-[10.5px] font-bold text-[#6a543a] tabular-nums">
              {identity.alphaId}
            </p>
            <p className="mt-0.5 text-[10.5px] text-[#5a4a38] truncate">{member.churchName}</p>
            <span
              className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-[#1f8a5a]"
              style={{
                background: "rgba(106,175,138,0.14)",
                border: "1px solid rgba(31,138,90,0.22)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dbb7a]" />
              عضوية فعّالة
            </span>
          </div>
        </div>

        <Link
          to="/profile/membership"
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-white transition active:scale-[0.98]"
          style={{
            background: "linear-gradient(to left, #b8893a, #d8a23a)",
            boxShadow: "0 8px 18px -10px rgba(184,137,58,0.55)",
          }}
        >
          عرض تفاصيل العضوية
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </ProfileGlassCard>
    </div>
  );
}
