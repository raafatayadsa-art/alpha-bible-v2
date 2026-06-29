import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft } from "lucide-react";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { AlphaShield, type ShieldRole } from "@/components/alpha/AlphaShield";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";

function ActiveStatusPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-alpha-gold-deep/35 bg-gradient-to-l from-[color-mix(in_srgb,var(--alpha-gold-bright)_24%,white)] to-[color-mix(in_srgb,var(--alpha-gold-deep)_10%,white)] px-2 py-[3px] text-[8px] font-extrabold text-alpha-gold-deep shadow-[0_2px_6px_-4px_rgba(120,80,30,0.28)]">
      <BadgeCheck className="h-2 w-2 shrink-0" strokeWidth={2.8} />
      نشط
    </span>
  );
}

function MembershipQrFrame({ value }: { value: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div
        className="rounded-[var(--alpha-radius-thumb)] border border-alpha-gold-bright/40 p-[2px]"
        style={{
          background:
            "linear-gradient(155deg, color-mix(in srgb, var(--alpha-gold-bright) 28%, white), color-mix(in srgb, var(--alpha-gold-deep) 12%, var(--alpha-bg-elevated)))",
          boxShadow: "0 6px 16px -8px rgba(120,80,30,0.32), inset 0 1px 0 rgba(255,255,255,0.75)",
        }}
      >
        <div className="rounded-[6px] bg-white p-[2px] shadow-[inset_0_1px_2px_rgba(120,80,30,0.06)]">
          <AlphaQrCode
            value={value}
            size={96}
            className="block h-[34px] w-[34px] rounded-[4px]"
            fgColor="3a2a18"
            bgColor="ffffff"
          />
        </div>
      </div>
      <p className="alpha-type-caption mt-0.5 font-bold tracking-wide text-alpha-gold-deep/65">البطاقة الكاملة</p>
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
  shieldRole: ShieldRole | null;
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
        className="alpha-membership-card relative overflow-hidden rounded-[var(--alpha-radius-card-compact)] px-3 py-3"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full"
          style={{ background: "radial-gradient(circle, var(--alpha-membership-glow), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(90,31,42,0.08), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[var(--alpha-gold-bright)]/30 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[42%] rounded-t-[var(--alpha-radius-card-compact)] bg-gradient-to-b from-white/42 to-transparent"
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
              <p className="alpha-type-h2 font-extrabold text-alpha-membership-title">بطاقة العضوية</p>
              <p className="mt-0.5 text-[10.5px] font-bold text-alpha-field-value">{roleLabel}</p>

            <p className="mt-1 text-[7.5px] font-semibold text-alpha-field-label">رقم العضوية</p>
            <p className="font-mono text-[10px] font-extrabold tracking-wide text-alpha-field-value-purple tabular-nums" dir="ltr">
              {alphaId}
            </p>

            <p className="mt-0.5 text-[7.5px] font-semibold text-alpha-field-label">حالة العضوية</p>
            <ActiveStatusPill />
          </div>

          <MembershipQrFrame value={qrPayload} />
        </div>

        <div
          className="relative mt-2.5 flex items-center justify-between gap-2 border-t pt-2"
          style={{ borderColor: "var(--alpha-membership-accent-line)" }}
        >
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
