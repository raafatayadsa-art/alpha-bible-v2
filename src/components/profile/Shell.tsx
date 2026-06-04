import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark, CopticCross } from "@/components/coptic";

export function ProfileSubShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 55% at 50% 0%, rgba(231,201,122,0.35), transparent 60%)," +
            "linear-gradient(180deg,#f7eed6 0%,#f4ead8 50%,#ecdcb6 100%)",
        }}
      />
      <CopticWatermark />
      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        <header className="flex items-center justify-between gap-2 pt-2">
          <Link
            to={"/profile" as any}
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl active:scale-95 transition"
          >
            <ChevronRight className="h-5 w-5 text-[#3a2a18]" />
          </Link>
          <div className="flex items-center gap-2">
            <CopticCross className="text-[#b8893a]" size={14} />
            <h1 className="text-[15px] font-extrabold text-[#3a2a18]">{title}</h1>
          </div>
          <div className="h-10 w-10" />
        </header>
        <div className="mt-5">{children}</div>
      </div>
      <BottomDock />
    </div>
  );
}

export function PCard({
  accent = "#b8893a",
  className = "",
  children,
}: {
  accent?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative rounded-[24px] border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1]/95 to-[#f4ead8]/95 backdrop-blur-xl overflow-hidden ${className}`}
      style={{
        boxShadow: `0 18px 38px -22px rgba(120,80,30,0.55), 0 0 28px -14px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.7)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px]" style={{ boxShadow: `inset 0 0 0 1px ${accent}26` }} />
      {children}
    </div>
  );
}

export function Field({
  label, value, hint,
}: { label: string; value: string; hint?: string }) {
  return (
    <div className="px-4 py-3 border-b border-[#efe2c4]/70 last:border-b-0">
      <div className="text-[10.5px] text-[#9a7e5a] font-semibold">{label}</div>
      <div className="mt-0.5 text-[14px] text-[#3a2a18] font-bold">{value}</div>
      {hint && <div className="text-[10.5px] text-[#9a7e5a] mt-0.5">{hint}</div>}
    </div>
  );
}
