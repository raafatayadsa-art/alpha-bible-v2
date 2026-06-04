import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight, Share2, Download, Copy, Check, ScanLine, BadgeCheck,
  Crown, Church, Hash, Calendar, X, ChevronLeft,
} from "lucide-react";
import { CopticWatermark, CopticCross } from "@/components/coptic";

export const Route = createFileRoute("/profile/membership")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ألفا — بطاقة العضوية" }],
  }),
  component: MembershipScreen,
});

const MEMBER = {
  name: "مينا عاطف",
  role: "خادم مدارس الأحد",
  church: "كنيسة الشهيد مار جرجس",
  diocese: "إيبارشية القاهرة",
  membershipNo: "AC-2024-00187",
  status: "عضو فعّال",
  joinDate: "12 يناير 2019",
  issueDate: "01 يونيو 2026",
  verified: true,
};

const QR_LARGE = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&ecc=H&margin=2&bgcolor=fff7e3&color=2a1a0d&data=${encodeURIComponent(
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
      text: `${MEMBER.name} — ${MEMBER.membershipNo}\n${MEMBER.church}`,
      url: `https://alpha-bible.lovable.app/m/${MEMBER.membershipNo}`,
    };
    try {
      if ((navigator as any).share) await (navigator as any).share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {}
  };

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(231,201,122,0.45), transparent 60%)," +
            "radial-gradient(80% 60% at 100% 100%, rgba(190,150,90,0.25), transparent 65%)," +
            "linear-gradient(180deg,#f7eed6 0%,#f4ead8 50%,#e8d4a8 100%)",
        }}
      />
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-24 pt-[max(env(safe-area-inset-top),10px)]">
        <header className="flex items-center justify-between gap-2 pt-1">
          <Link
            to={"/profile" as any}
            aria-label="رجوع"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_4px_12px_-8px_rgba(120,80,30,0.4)] active:scale-95 transition"
          >
            <ChevronRight className="h-4.5 w-4.5 text-[#3a2a18]" />
          </Link>
          <h1 className="text-[14px] font-extrabold text-[#3a2a18]">بطاقة العضوية</h1>
          <button
            onClick={() => setScannerOpen(true)}
            aria-label="مسح عضو"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_4px_12px_-8px_rgba(120,80,30,0.4)] active:scale-95 transition"
          >
            <ScanLine className="h-4 w-4 text-[#3a2a18]" />
          </button>
        </header>

        {/* === SMART MEMBERSHIP CARD === */}
        <div
          className="relative mt-4 overflow-hidden rounded-[26px]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, #fff8e6 0%, #fbf0d4 55%, #efdcae 100%)",
            boxShadow:
              "0 30px 50px -28px rgba(120,80,30,0.55), 0 10px 18px -10px rgba(216,138,42,0.45), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(216,138,42,0.35)",
          }}
        >
          {/* Gold metallic edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[26px] p-[2.5px]"
            style={{
              background:
                "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 35%, #fff4d0 55%, #b8893a 100%)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          {/* Coptic dot pattern */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 28%, #8a5a1c 0.6px, transparent 1px), radial-gradient(circle at 72% 78%, #8a5a1c 0.5px, transparent 1px)",
              backgroundSize: "14px 14px, 18px 18px",
            }}
          />

          {/* Alpha & Omega watermark */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-between px-5 text-[#b8893a]/[0.08] font-bold text-[110px] leading-none select-none">
            <span>Ⲱ</span>
            <span>Ⲁ</span>
          </div>

          {/* Inner gold frame */}
          <div aria-hidden className="absolute inset-2.5 rounded-[20px] border border-[#d88a2a]/35" />

          <div className="relative px-5 pt-4 pb-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CopticCross className="text-[#b8893a]" size={14} />
                <p className="text-[9px] font-extrabold tracking-[0.3em] text-[#8a5a1c] uppercase">
                  Alpha Coptic
                </p>
              </div>
              {MEMBER.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2dbb7a, #14704a)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 10px rgba(46,204,113,0.45)",
                  }}
                >
                  <BadgeCheck className="h-2.5 w-2.5" strokeWidth={2.8} /> عضوية موثقة وفعّالة
                </span>
              )}
            </div>

            {/* Name */}
            <h2 className="mt-2.5 text-[20px] font-extrabold text-[#2a1a08] leading-tight tracking-tight">
              {MEMBER.name}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#5a3a0e]">
              {MEMBER.role} · {MEMBER.church}
            </p>

            {/* Divider */}
            <div aria-hidden className="mt-3 flex items-center gap-2 text-[#b8893a]/60">
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#b8893a]/50 to-transparent" />
              <span className="text-[9px]">✦</span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#b8893a]/50 to-transparent" />
            </div>

            {/* QR — 3D premium container */}
            <div className="mt-3 grid place-items-center">
              <div
                className="relative rounded-[20px] p-[5px]"
                style={{
                  background:
                    "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 30%, #fff4d0 55%, #b8893a 100%)",
                  boxShadow:
                    "0 18px 30px -12px rgba(120,80,30,0.55), 0 6px 12px -6px rgba(216,138,42,0.4), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -2px 4px rgba(120,80,30,0.25)",
                  transform: "perspective(800px) rotateX(2deg)",
                }}
              >
                <div
                  className="relative rounded-[15px] p-3"
                  style={{
                    background:
                      "linear-gradient(180deg, #fffbe9 0%, #fff7e3 100%)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(216,138,42,0.5), inset 0 2px 10px rgba(120,80,30,0.18), 0 2px 6px rgba(255,255,255,0.8)",
                  }}
                >
                  <img src={QR_LARGE} alt="QR العضوية" className="block h-[190px] w-[190px]" />
                </div>
                {/* Center coptic badge */}
                <span
                  aria-hidden
                  className="absolute inset-0 m-auto grid h-[46px] w-[46px] place-items-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg,#fff7e3,#f0d78c)",
                    boxShadow: "0 0 0 2.5px #fff7e3, 0 0 0 4px #b8893a, 0 4px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  <span className="flex items-center gap-[2px] text-[12px] font-extrabold text-[#3a2a18] leading-none">
                    <span>Ⲁ</span>
                    <span className="text-[#b8893a]">✝</span>
                    <span>Ⲱ</span>
                  </span>
                </span>
                {/* Glass reflection */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[5px] rounded-[15px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.15) 100%)",
                  }}
                />
              </div>
              <p className="mt-2 text-center text-[9.5px] font-bold tracking-[0.25em] text-[#8a5a1c]/85 uppercase">
                Scan to Verify
              </p>
            </div>

            {/* Details — compact 2 col */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
              <Detail icon={<Hash className="h-3 w-3" />} label="رقم العضوية" value={MEMBER.membershipNo} mono />
              <Detail icon={<Calendar className="h-3 w-3" />} label="منذ" value={MEMBER.joinDate.split(" ").slice(-1)[0]} />
              <Detail icon={<Crown className="h-3 w-3" />} label="الخدمة" value={MEMBER.role} />
              <Detail icon={<Church className="h-3 w-3" />} label="الإيبارشية" value="القاهرة" />
            </div>

            {/* Footer: signature + seal */}
            <div className="mt-3 pt-3 border-t border-dashed border-[#d88a2a]/40 flex items-end justify-between gap-3">
              <div className="flex-1">
                <svg viewBox="0 0 120 22" className="h-6 w-[100px] text-[#3a2a18]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M4 16 Q14 2 26 14 T54 14 Q66 4 78 16 T108 10" />
                </svg>
                <p className="mt-0.5 text-[9px] font-bold text-[#8a5a1c]">توقيع الراعي</p>
              </div>
              <div className="relative">
                <div
                  className="relative grid h-12 w-12 place-items-center rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 25%, #fff4d0, #d8a23a 55%, #8a5a1c 100%)",
                    boxShadow:
                      "0 6px 12px -6px rgba(120,80,30,0.65), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 4px rgba(120,80,30,0.35)",
                  }}
                >
                  <CopticCross className="text-[#3a2a18]" size={14} />
                </div>
                <p className="mt-0.5 text-center text-[9px] font-bold text-[#8a5a1c]">الختم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <ActionBtn onClick={share} icon={<Share2 className="h-4 w-4" />} label="مشاركة" />
          <ActionBtn onClick={() => window.print()} icon={<Download className="h-4 w-4" />} label="حفظ" />
          <ActionBtn
            onClick={copyId}
            icon={copied ? <Check className="h-4 w-4 text-[#2f7a4a]" /> : <Copy className="h-4 w-4" />}
            label={copied ? "تم النسخ" : "نسخ الرقم"}
          />
        </div>

        {/* Scan member — premium feature card */}
        <button
          onClick={() => setScannerOpen(true)}
          className="group mt-4 relative w-full overflow-hidden rounded-[22px] p-[2px] active:scale-[0.99] transition"
          style={{
            background:
              "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 35%, #fff4d0 55%, #b8893a 100%)",
            boxShadow:
              "0 14px 28px -14px rgba(120,80,30,0.55), 0 4px 10px -4px rgba(216,138,42,0.4)",
          }}
        >
          <div
            className="relative flex items-center gap-3 rounded-[20px] px-4 py-3.5 text-right"
            style={{
              background:
                "linear-gradient(135deg, #fffbe9 0%, #fbf0d4 100%)",
            }}
          >
            <div
              className="grid h-11 w-11 place-items-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #d8a23a, #8a5a1c)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 12px -6px rgba(120,80,30,0.6)",
              }}
            >
              <ScanLine className="h-5 w-5 text-[#fff8e6]" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-extrabold text-[#2a1a08] leading-tight">مسح عضو آخر</p>
              <p className="mt-0.5 text-[10.5px] text-[#6a543a]">للتحقق من العضوية وحضور الفعاليات الكنسية</p>
            </div>
            <ChevronLeft className="h-4.5 w-4.5 text-[#b8893a]" />
          </div>
        </button>
      </div>

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
              وجّه الكاميرا نحو رمز QR الخاص بالعضو للتحقق من العضوية وتسجيل الحضور.
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

function Detail({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,247,227,0.55))",
        boxShadow: "inset 0 0 0 1px rgba(216,138,42,0.25)",
      }}
    >
      <span className="text-[#8a5a1c] inline-flex items-center gap-1 font-bold text-[10px]">{icon} {label}</span>
      <span className={`text-[#2a1a08] font-extrabold text-[10.5px] truncate ${mono ? "tabular-nums" : ""}`}>{value}</span>
    </div>
  );
}

function ActionBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl border border-[#efe2c4] bg-white/80 backdrop-blur-xl py-3 text-[11.5px] font-extrabold text-[#3a2a18] shadow-[0_6px_14px_-10px_rgba(120,80,30,0.5)] active:scale-[0.97] transition"
    >
      <span className="text-[#b8893a]">{icon}</span>
      {label}
    </button>
  );
}
