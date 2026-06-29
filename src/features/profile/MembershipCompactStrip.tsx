import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft, Church, Cross, MapPin, Shield } from "lucide-react";
import { ShieldImage, type ShieldRole } from "@/components/alpha/AlphaShield";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { cn } from "@/lib/utils";

function DataCell({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-alpha/55 bg-white/42 px-2.5 py-2 backdrop-blur-sm">
      <div className="mb-1 flex items-center justify-end gap-1 text-alpha-field-label">
        {icon}
        <span className="alpha-type-caption font-bold">{label}</span>
      </div>
      <p
        className={cn(
          "truncate text-right text-[10.5px] font-extrabold leading-tight text-alpha-field-value-purple",
          mono && "font-mono tabular-nums tracking-wide",
        )}
        dir={mono ? "ltr" : "rtl"}
      >
        {value}
      </p>
    </div>
  );
}

export function MembershipCompactStrip({
  alphaId,
  roleLabel,
  shieldRole,
  churchName,
  diocese,
  memberSince,
  verified = true,
}: {
  alphaId: string;
  roleLabel: string;
  shieldRole: ShieldRole | null;
  churchName: string;
  diocese: string;
  memberSince?: string | null;
  verified?: boolean;
}) {
  const dioceseLabel = diocese && diocese !== "—" ? diocese : "—";
  const sinceLabel = memberSince?.trim() || "—";

  return (
    <Link
      to="/profile/membership"
      aria-label="عرض بطاقة العضوية الكاملة"
      className="group relative mt-4 block active:scale-[0.985] transition-transform"
    >
      <HeroLedgerStylesHost />

      <article
        dir="rtl"
        className="alpha-membership-card relative overflow-hidden rounded-[var(--alpha-radius-card-compact)] px-3.5 py-3.5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full"
          style={{ background: "radial-gradient(circle, var(--alpha-membership-glow), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[var(--alpha-gold-bright)]/28 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[38%] rounded-t-[var(--alpha-radius-card-compact)] bg-gradient-to-b from-white/40 to-transparent"
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <p className="alpha-type-h2 font-extrabold text-alpha-membership-title">بطاقة العضوية</p>
              {verified ? (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-alpha-gold-deep/35 bg-gradient-to-l from-[color-mix(in_srgb,var(--alpha-gold-bright)_22%,white)] to-[color-mix(in_srgb,var(--alpha-gold-deep)_8%,white)] px-1.5 py-[2px] text-[7.5px] font-extrabold text-alpha-gold-deep">
                  <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.6} />
                  موثّق
                </span>
              ) : null}
            </div>
            <p className="alpha-type-caption mt-0.5 font-semibold text-alpha-membership-muted">
              هوية رسمية · اضغط للبطاقة الكاملة
            </p>
          </div>

          <div className="relative shrink-0">
            <div
              className="grid h-12 w-12 place-items-center rounded-[var(--alpha-radius-dock-tab)] border border-alpha-gold-bright/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
              style={{
                background:
                  "linear-gradient(155deg, color-mix(in srgb, var(--alpha-gold-bright) 20%, white), color-mix(in srgb, var(--alpha-gold-deep) 8%, var(--alpha-bg-elevated)))",
              }}
            >
              {shieldRole ? <ShieldImage role={shieldRole} px={34} /> : <Shield className="h-5 w-5 text-alpha-gold-deep/55" strokeWidth={2.2} />}
            </div>
            <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border border-alpha-gold-bright/40 bg-alpha-surface text-alpha-gold-deep shadow-md alpha-motion-spring group-active:scale-95">
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-2">
          <DataCell
            label="Alpha ID"
            value={alphaId}
            mono
            icon={<Shield className="h-2.5 w-2.5" strokeWidth={2.2} />}
          />
          <DataCell
            label="الخدمة"
            value={roleLabel}
            icon={<Cross className="h-2.5 w-2.5" strokeWidth={2.2} />}
          />
          <DataCell
            label="الكنيسة"
            value={churchName}
            icon={<Church className="h-2.5 w-2.5" strokeWidth={2.2} />}
          />
          <DataCell
            label="الإيبارشية"
            value={dioceseLabel}
            icon={<MapPin className="h-2.5 w-2.5" strokeWidth={2.2} />}
          />
        </div>

        <div
          className="relative mt-2.5 flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 backdrop-blur-sm"
          style={{
            borderColor: "var(--alpha-membership-accent-line)",
            background: "color-mix(in srgb, var(--alpha-bg-elevated) 55%, white)",
          }}
        >
          <span className="alpha-type-caption font-bold text-alpha-membership-sub">عضو منذ · {sinceLabel}</span>
          <span className="text-[8px] font-extrabold tracking-wide text-alpha-membership-muted">QR · مشاركة · مسح</span>
        </div>
      </article>
    </Link>
  );
}
