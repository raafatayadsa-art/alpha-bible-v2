import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight, Share2, Download, Copy, Check, ScanLine, ShieldCheck,
  Church, Cross, MoreVertical, ChevronLeft, X,
} from "lucide-react";
import { AlphaOfficialLogo } from "@/components/brand";

export const Route = createFileRoute("/profile/membership")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — بطاقة العضوية" }] }),
  component: MembershipScreen,
});

const MEMBER = {
  name: "مينا عاطف",
  role: "خادم مدارس الأحد",
  diocese: "إيبارشية القاهرة",
  membershipNo: "AC-2024-00187",
  verified: true,
};

const QR_LARGE = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&ecc=H&margin=2&bgcolor=ffffff&color=1a1208&data=${encodeURIComponent(
  `alpha://member/${MEMBER.membershipNo}`,
)}`;

function MembershipScreen() {
  const [copied, setCopied] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(MEMBER.membershipNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const share = async () => {
    const data = {
      title: "بطاقة عضوية Alpha Coptic",
      text: `${MEMBER.name} — ${MEMBER.membershipNo}`,
      url: `https://alpha-bible.lovable.app/m/${MEMBER.membershipNo}`,
    };
    try {
      if ((navigator as any).share) await (navigator as any).share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {}
  };

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, #fbf2dc 0%, #f5e9cf 45%, #efdfba 100%)",
        }}
      />
      {/* Faint coptic ornaments background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 15%, #8a5a1c 1px, transparent 1.5px), radial-gradient(circle at 80% 85%, #8a5a1c 1px, transparent 1.5px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-10 pt-[max(env(safe-area-inset-top),12px)]">
        {/* === HEADER === */}
        <header className="relative flex items-center justify-between gap-2 pt-1">
          <Link
            to={"/profile" as any}
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e8d5a8] bg-white/85 backdrop-blur-xl shadow-[0_6px_14px_-8px_rgba(120,80,30,0.45)] active:scale-95 transition"
          >
            <ChevronRight className="h-5 w-5 text-[#3a2a18]" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-[16px] font-extrabold text-[#3a2a18] tracking-tight">بطاقة العضوية</h1>
            {/* Gold orthodox divider */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-px w-8 bg-gradient-to-l from-[#c9a14a] to-transparent" />
              <Cross className="h-2.5 w-2.5 text-[#c9a14a]" strokeWidth={2.5} />
              <span className="text-[#c9a14a] text-[8px]">✦</span>
              <Cross className="h-3 w-3 text-[#b8893a]" strokeWidth={2.5} />
              <span className="text-[#c9a14a] text-[8px]">✦</span>
              <Cross className="h-2.5 w-2.5 text-[#c9a14a]" strokeWidth={2.5} />
              <span className="h-px w-8 bg-gradient-to-r from-[#c9a14a] to-transparent" />
            </div>
          </div>
          <button
            aria-label="المزيد"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e8d5a8] bg-white/85 backdrop-blur-xl shadow-[0_6px_14px_-8px_rgba(120,80,30,0.45)] active:scale-95 transition"
          >
            <MoreVertical className="h-4.5 w-4.5 text-[#3a2a18]" />
          </button>
        </header>

        {/* === MAIN MEMBERSHIP CARD === */}
        <div
          className="relative mt-5 overflow-hidden rounded-[28px] p-5"
          style={{
            background:
              "linear-gradient(180deg, #fbf2dc 0%, #f6e8c8 100%)",
            boxShadow:
              "0 24px 50px -24px rgba(120,80,30,0.5), 0 8px 18px -10px rgba(216,138,42,0.35), inset 0 1px 0 rgba(255,255,255,0.85)",
            border: "1px solid rgba(201,161,74,0.45)",
          }}
        >
          {/* Subtle church silhouette - left */}
          <svg
            aria-hidden
            viewBox="0 0 200 300"
            className="absolute -left-2 top-6 h-[210px] w-auto text-[#c9a14a] opacity-[0.10]"
            fill="currentColor"
          >
            <rect x="80" y="120" width="40" height="140" />
            <polygon points="100,80 70,120 130,120" />
            <rect x="95" y="60" width="10" height="20" />
            <rect x="90" y="68" width="20" height="4" />
            <rect x="40" y="180" width="40" height="80" />
            <rect x="120" y="180" width="40" height="80" />
            <circle cx="100" cy="150" r="8" />
          </svg>
          {/* Ornament - right */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute -right-4 top-10 h-[200px] w-[200px] text-[#c9a14a] opacity-[0.10]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 80 * Math.cos((i * Math.PI) / 6)}
                y2={100 + 80 * Math.sin((i * Math.PI) / 6)}
              />
            ))}
          </svg>

          {/* Name + side ornaments */}
          <div className="relative flex items-center justify-center gap-3">
            <span className="text-[#c9a14a] text-[10px]">✦ ✧ ✦</span>
            <h2 className="text-[24px] font-extrabold text-[#2a1a08] leading-tight tracking-tight">
              {MEMBER.name}
            </h2>
            <span className="text-[#c9a14a] text-[10px]">✦ ✧ ✦</span>
          </div>

          {/* QR — premium 3D */}
          <div className="relative mt-4 grid place-items-center">
            <div
              className="relative rounded-[24px] p-[5px]"
              style={{
                background:
                  "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 30%, #fff4d0 55%, #b8893a 100%)",
                boxShadow:
                  "0 22px 36px -14px rgba(120,80,30,0.55), 0 8px 16px -8px rgba(216,138,42,0.4), inset 0 1px 0 rgba(255,255,255,0.7)",
                transform: "perspective(900px) rotateX(3deg)",
              }}
            >
              <div
                className="relative rounded-[18px] p-3.5"
                style={{
                  background: "#ffffff",
                  boxShadow:
                    "inset 0 0 0 1px rgba(216,138,42,0.5), inset 0 2px 10px rgba(120,80,30,0.18)",
                }}
              >
                <img src={QR_LARGE} alt="QR العضوية" className="block h-[200px] w-[200px]" />
              </div>
              {/* Center Alpha badge */}
              <span
                aria-hidden
                className="absolute inset-0 m-auto grid h-[52px] w-[52px] place-items-center rounded-2xl"
                style={{
                  background: "#ffffff",
                  boxShadow:
                    "0 0 0 3px #ffffff, 0 0 0 5px #c9a14a, 0 6px 14px rgba(0,0,0,0.25)",
                }}
              >
                <AlphaOfficialLogo size="sm" className="scale-75" />
              </span>
            </div>
          </div>

          {/* Status badge */}
          {MEMBER.verified && (
            <div className="mt-4 flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11.5px] font-extrabold text-[#1e6b3f]"
                style={{
                  background: "linear-gradient(180deg, #e8f5e9, #d4ecd6)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(46,124,80,0.3), 0 4px 10px -6px rgba(46,124,80,0.4)",
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
                عضوية موثقة وفعالة
              </span>
            </div>
          )}
        </div>

        {/* === MEMBERSHIP INFO SECTION === */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-[#c9a14a] text-[9px]">✦ ✧ ✦</span>
          <h3 className="text-[13.5px] font-extrabold text-[#3a2a18]">بيانات العضوية</h3>
          <span className="text-[#c9a14a] text-[9px]">✦ ✧ ✦</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <InfoCard
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
                <circle cx="12" cy="11" r="2.5" />
                <path d="M8.5 17c.8-1.8 2-2.5 3.5-2.5s2.7.7 3.5 2.5" />
              </svg>
            }
            label="رقم العضوية"
            value={MEMBER.membershipNo}
            mono
          />
          <InfoCard
            icon={<Church className="h-6 w-6" strokeWidth={1.8} />}
            label="الإيبارشية"
            value={MEMBER.diocese}
          />
          <InfoCard
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M10.5 2h3v4h4v3h-4v4.5L17 16l-1 2-4-2-4 2-1-2 3.5-2.5V9h-4V6h4V2z" />
              </svg>
            }
            label="الخدمة"
            value={MEMBER.role}
          />
        </div>

        {/* === ACTION CARDS === */}
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <ActionCard
            onClick={share}
            icon={<Share2 className="h-6 w-6" strokeWidth={2.2} />}
            label="مشاركة البطاقة"
            tint="gold"
          />
          <ActionCard
            onClick={() => window.print()}
            icon={<Download className="h-6 w-6" strokeWidth={2.2} />}
            label="حفظ البطاقة"
            tint="blue"
          />
          <ActionCard
            onClick={copyId}
            icon={copied ? <Check className="h-6 w-6" strokeWidth={2.4} /> : <Copy className="h-6 w-6" strokeWidth={2.2} />}
            label={copied ? "تم النسخ" : "نسخ رقم العضوية"}
            tint="green"
          />
        </div>

        {/* === SCAN MEMBER CARD === */}
        <button
          onClick={() => setScannerOpen(true)}
          className="group relative mt-3 w-full overflow-hidden rounded-[22px] p-[2px] active:scale-[0.99] transition"
          style={{
            background:
              "linear-gradient(135deg, #d8a23a 0%, #8a5a1c 50%, #d8a23a 100%)",
            boxShadow:
              "0 20px 36px -16px rgba(60,30,5,0.65), 0 8px 16px -8px rgba(216,138,42,0.5)",
          }}
        >
          <div
            className="relative flex items-center gap-3 rounded-[20px] px-3.5 py-3.5 text-right"
            style={{
              background:
                "linear-gradient(135deg, #3a2410 0%, #1e1208 50%, #2a1a0c 100%)",
            }}
          >
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #f7e7b8, #d8a23a 60%, #8a5a1c)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 12px -4px rgba(216,138,42,0.7)",
              }}
            >
              <ScanLine className="h-6 w-6 text-[#1e1208]" strokeWidth={2.4} />
            </div>
            <div className="flex-1 text-center">
              <p className="text-[15px] font-extrabold text-[#f7e7b8] leading-tight">مسح عضو آخر</p>
              <p className="mt-0.5 text-[10.5px] text-[#d8b87a]">للتحقق من عضوية عضو آخر</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-[#d8a23a]" />
          </div>
        </button>

        {/* === LOGO SECTION === */}
        <div className="mt-8 flex flex-col items-center">
          <AlphaOfficialLogo size="lg" />
        </div>
      </div>

      {/* Scanner modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setScannerOpen(false)}>
          <div className="relative w-full max-w-[340px] rounded-3xl border border-[#efe2c4] bg-gradient-to-b from-[#fbf3e1] to-[#f4ead8] p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setScannerOpen(false)} className="absolute top-3 left-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 border border-[#efe2c4]">
              <X className="h-4 w-4 text-[#3a2a18]" />
            </button>
            <div className="mx-auto mt-2 grid h-14 w-14 place-items-center rounded-2xl border border-[#efe2c4] bg-white/70">
              <ScanLine className="h-7 w-7 text-[#b8893a]" />
            </div>
            <h3 className="mt-3 text-[15px] font-extrabold text-[#3a2a18]">مسح عضو</h3>
            <p className="mt-1 text-[11.5px] text-[#6a543a] leading-relaxed">
              وجّه الكاميرا نحو رمز QR الخاص بالعضو للتحقق من العضوية.
            </p>
            <div className="relative mx-auto mt-4 aspect-square w-[200px] rounded-2xl border-2 border-dashed border-[#b8893a]/50 bg-[#1e120a]/5 grid place-items-center overflow-hidden">
              <div className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-[#d88a2a] to-transparent animate-pulse" />
              <span className="text-[10px] text-[#9a7e5a]">معاينة الكاميرا</span>
            </div>
            <p className="mt-3 text-[10px] text-[#9a7e5a]">قريباً — قيد التطوير</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon, label, value, mono,
}: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3.5 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(251,242,220,0.7) 100%)",
        boxShadow:
          "0 10px 24px -14px rgba(120,80,30,0.45), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(201,161,74,0.3)",
        backdropFilter: "blur(10px)",
      }}
    >
      <span className="text-[#b8893a]">{icon}</span>
      <p className="text-[10px] font-bold text-[#6a543a] mt-0.5">{label}</p>
      <p className={`text-[10.5px] font-extrabold text-[#2a1a08] leading-tight ${mono ? "tabular-nums tracking-tight" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  onClick, icon, label, tint,
}: { onClick: () => void; icon: React.ReactNode; label: string; tint: "gold" | "blue" | "green" }) {
  const styles = {
    gold: {
      bg: "linear-gradient(180deg, #fbecc4 0%, #f3d896 100%)",
      ring: "rgba(184,137,58,0.45)",
      icon: "#a06d1f",
      shadow: "0 10px 22px -12px rgba(160,109,31,0.5)",
    },
    blue: {
      bg: "linear-gradient(180deg, #e3edfb 0%, #cfdef5 100%)",
      ring: "rgba(60,110,180,0.35)",
      icon: "#2e5fa8",
      shadow: "0 10px 22px -12px rgba(60,110,180,0.45)",
    },
    green: {
      bg: "linear-gradient(180deg, #dff0e1 0%, #c7e3cb 100%)",
      ring: "rgba(46,124,80,0.35)",
      icon: "#1e7a4a",
      shadow: "0 10px 22px -12px rgba(46,124,80,0.45)",
    },
  }[tint];

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3.5 active:scale-[0.97] transition"
      style={{
        background: styles.bg,
        boxShadow: `${styles.shadow}, inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px ${styles.ring}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <span style={{ color: styles.icon }}>{icon}</span>
      <p className="text-[10.5px] font-extrabold text-[#2a1a08] leading-tight mt-0.5">{label}</p>
    </button>
  );
}
