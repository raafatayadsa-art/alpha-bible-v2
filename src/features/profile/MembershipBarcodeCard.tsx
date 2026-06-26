import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft } from "lucide-react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { AlphaShield, type ShieldRole } from "@/components/alpha/AlphaShield";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";

function ActiveStatusPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-[3px] text-[8px] font-extrabold text-emerald-300">
      <BadgeCheck className="h-2 w-2 shrink-0" strokeWidth={2.8} />
      نشط
    </span>
  );
}

function MembershipQrFrame({ value }: { value: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div
        className="rounded-[9px] border border-[#f0d78c]/28 p-[2px]"
        style={{
          background: "linear-gradient(180deg, rgba(240,215,140,0.12) 0%, rgba(0,0,0,0.45) 100%)",
          boxShadow: "0 4px 12px -6px rgba(0,0,0,0.55)",
        }}
      >
        <div className="rounded-[6px] bg-white p-[2px]">
          <AlphaQrCode
            value={value}
            size={96}
            className="block h-[34px] w-[34px] rounded-[4px]"
            fgColor="1a1208"
            bgColor="ffffff"
          />
        </div>
      </div>
      <p className="mt-0.5 text-[7px] font-bold tracking-wide text-[#f0d78c]/50">البطاقة الكاملة</p>
    </div>
  );
}

export function MembershipBarcodeCard({
  alphaId,
  qrPayload,
  roleLabel,
  shieldRole,
  userName,
  userAvatar,
  churchName,
  memberSince,
  diocese,
  showChurchInfo = true,
}: {
  alphaId: string;
  qrPayload: string;
  roleLabel: string;
  shieldRole: ShieldRole;
  userName: string;
  userAvatar: string;
  churchName?: string;
  memberSince?: string | null;
  diocese?: string | null;
  showChurchInfo?: boolean;
}) {
  return (
    <Link
      to="/profile/membership"
      aria-label="عرض بطاقة العضوية الكاملة"
      className="group block active:scale-[0.985] transition-transform"
    >
      <HeroLedgerStylesHost />

      <article
        dir="rtl"
        className="alpha-membership-card relative overflow-hidden rounded-[22px] px-3 py-3"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(240,215,140,0.28), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#f0d78c]/22 to-transparent"
        />

        <div className="relative flex items-center gap-2">
          <div
            className="relative flex w-[88px] shrink-0 items-center justify-center py-0.5"
            onClick={(e) => e.preventDefault()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <AlphaShield
              role={shieldRole}
              size="xl"
              pulseWrap
              userName={userName}
              userAvatar={userAvatar}
              profileInfo={
                showChurchInfo
                  ? { churchName, diocese, memberSince, roleLabel }
                  : { memberSince, roleLabel }
              }
            />
          </div>

          <div className="min-w-0 flex-1 text-right leading-tight">
            <p className="text-[12px] font-extrabold text-alpha-membership-title">بطاقة العضوية</p>
            <p className="mt-0.5 text-[10.5px] font-bold text-alpha-membership-sub">{roleLabel}</p>

            <p className="mt-1 text-[7.5px] font-semibold text-alpha-membership-muted">رقم العضوية</p>
            <p className="font-mono text-[10px] font-extrabold tracking-wide text-alpha-membership-sub tabular-nums" dir="ltr">
              {alphaId}
            </p>

            <p className="mt-0.5 text-[7.5px] font-semibold text-alpha-membership-muted">حالة العضوية</p>
            <ActiveStatusPill />
          </div>

          <MembershipQrFrame value={qrPayload} />
        </div>

        <div className="relative mt-2.5 flex items-center justify-between gap-2 border-t border-alpha-subtle pt-2">
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-alpha-membership-sub">
            عرض البطاقة
            <ChevronLeft className="h-3.5 w-3.5 transition group-active:translate-x-[-2px]" strokeWidth={2.4} />
          </span>
          <span className="truncate text-[8.5px] font-semibold text-alpha-membership-muted">
            {showChurchInfo && churchName
              ? `${churchName}${diocese && diocese !== "—" ? ` · ${diocese}` : ""}`
              : "عضوية Alpha"}
          </span>
        </div>
      </article>
    </Link>
  );
}
