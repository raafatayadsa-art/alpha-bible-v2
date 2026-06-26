import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft, Church, Cross, MapPin, Shield } from "lucide-react";
import { ShieldImage, type ShieldRole } from "@/components/alpha/AlphaShield";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";

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
    <div
      className="min-w-0 rounded-xl border px-2.5 py-2"
      style={{
        borderColor: "rgba(240,215,140,0.1)",
        background: "linear-gradient(180deg, rgba(240,215,140,0.04) 0%, rgba(0,0,0,0.35) 100%)",
      }}
    >
      <div className="mb-1 flex items-center justify-end gap-1 text-[#f0d78c]/55">
        {icon}
        <span className="text-[8px] font-bold">{label}</span>
      </div>
      <p
        className={`truncate text-right text-[10.5px] font-extrabold leading-tight text-white/88 ${mono ? "font-mono tabular-nums tracking-wide" : ""}`}
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
  shieldRole: ShieldRole;
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
        className="relative overflow-hidden rounded-[22px] border px-3.5 py-3.5"
        style={{
          borderColor: "rgba(240,215,140,0.16)",
          background:
            "linear-gradient(155deg, rgba(22,14,8,0.96) 0%, rgba(14,10,6,0.94) 55%, rgba(26,18,10,0.92) 100%)",
          boxShadow:
            "0 20px 44px -18px rgba(0,0,0,0.72), 0 0 0 1px rgba(231,201,122,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(240,215,140,0.22), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#f0d78c]/25 to-transparent"
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-extrabold text-white/92">بطاقة العضوية</p>
              {verified ? (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-1.5 py-[2px] text-[7.5px] font-extrabold text-emerald-300">
                  <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.6} />
                  موثّق
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[10px] font-semibold text-[#f0d78c]/55">
              هوية رسمية · اضغط للبطاقة الكاملة
            </p>
          </div>

          <div className="relative shrink-0">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl border"
              style={{
                borderColor: "rgba(240,215,140,0.22)",
                background: "linear-gradient(180deg, rgba(240,215,140,0.08) 0%, rgba(0,0,0,0.45) 100%)",
              }}
            >
              <ShieldImage role={shieldRole} px={34} />
            </div>
            <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border border-[#f0d78c]/35 bg-[#1a1208] text-[#f0d78c] shadow-md transition group-active:scale-95">
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

        <div className="relative mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/6 bg-black/25 px-2.5 py-2">
          <span className="text-[9px] font-bold text-[#f0d78c]/70">عضو منذ · {sinceLabel}</span>
          <span className="text-[8px] font-extrabold tracking-wide text-white/35">QR · مشاركة · مسح</span>
        </div>
      </article>
    </Link>
  );
}
