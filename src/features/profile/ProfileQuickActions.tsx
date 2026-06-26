import { Link } from "@tanstack/react-router";
import { Headphones, Mic2, Settings } from "lucide-react";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";

const GOLD_BORDER_IDLE = "rgba(240,215,140,0.14)";
const CELL_BG_IDLE =
  "linear-gradient(180deg, rgba(240,215,140,0.03) 0%, rgba(0,0,0,0.48) 100%)";
const ENGAGEMENT_BG = "rgba(18,10,4,0.52)";

function QuickCell({
  glyph,
  label,
  sub,
  accent,
  icon: Icon,
  to,
}: {
  glyph: string;
  label: string;
  sub: string;
  accent: string;
  icon: typeof Mic2;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2.5 transition-all active:scale-[0.96]"
      style={{
        border: `1px solid ${GOLD_BORDER_IDLE}`,
        background: CELL_BG_IDLE,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="hero-ledger-glyph-gold select-none text-[17px] font-black leading-none">
          {glyph}
        </span>
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} strokeWidth={2.2} />
      </div>
      <p className="w-full text-center text-[9.5px] leading-tight">
        <span className="font-extrabold" style={{ color: "#f0d78c" }}>{label}</span>
        {" "}
        <span className="font-medium text-white/40">· {sub}</span>
      </p>
    </Link>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      className="my-1 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/25 to-transparent"
    />
  );
}

export function ProfileQuickActions() {
  return (
    <div className="mt-4">
      <HeroLedgerStylesHost />
      <h2 className="mb-2.5 px-0.5 text-[13px] font-extrabold text-white/80">إجراءات سريعة</h2>
      <div
        className="flex items-stretch gap-1.5 rounded-xl border px-1.5 py-1"
        style={{
          borderColor: GOLD_BORDER_IDLE,
          background: ENGAGEMENT_BG,
          backdropFilter: "blur(10px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -10px 28px rgba(0,0,0,0.4)",
        }}
      >
        <QuickCell glyph="Ⲱ" label="ناشر" sub="صفحاتك" accent="#8a6ec1" icon={Mic2} to="/publisher" />
        <Divider />
        <QuickCell glyph="Ⲁ" label="دعم" sub="مساعدة" accent="#c98a3c" icon={Headphones} to="/settings" />
        <Divider />
        <QuickCell glyph="Ⲁ" label="إعدادات" sub="حسابك" accent="#5b8fd1" icon={Settings} to="/settings" />
      </div>
    </div>
  );
}
