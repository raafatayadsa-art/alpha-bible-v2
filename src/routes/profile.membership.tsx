import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight, Share2, Download, Copy, Check, ScanLine, BadgeCheck,
  Crown, Church, Hash, Calendar, X, Award,
} from "lucide-react";
import { CopticWatermark, CopticCross } from "@/components/coptic";

export const Route = createFileRoute("/profile/membership")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ألفا — شهادة العضوية" }],
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
      title: "شهادة عضوية Alpha Coptic",
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
          <h1 className="text-[14px] font-extrabold text-[#3a2a18]">شهادة العضوية</h1>
          <button
            onClick={() => setScannerOpen(true)}
            aria-label="مسح عضو"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_4px_12px_-8px_rgba(120,80,30,0.4)] active:scale-95 transition"
          >
            <ScanLine className="h-4 w-4 text-[#3a2a18]" />
          </button>
        </header>

        {/* === FULL CERTIFICATE === */}
        <div
          className="relative mt-4 overflow-hidden rounded-[28px]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, #fff8e6 0%, #fbf0d4 50%, #efdcae 100%)",
            boxShadow:
              "0 36px 60px -28px rgba(120,80,30,0.6), 0 12px 22px -12px rgba(216,138,42,0.5), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(216,138,42,0.4)",
          }}
        >
          {/* Outer gold metallic edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] p-[3px]"
            style={{
              background:
                "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 35%, #fff4d0 55%, #b8893a 100%)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          {/* Manuscript dot texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 28%, #8a5a1c 0.6px, transparent 1px), radial-gradient(circle at 72% 78%, #8a5a1c 0.5px, transparent 1px), radial-gradient(circle at 50% 50%, #b8893a 0.4px, transparent 1px)",
              backgroundSize: "12px 12px, 16px 16px, 22px 22px",
            }}
          />
          {/* Aged corners */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 50% at 0% 0%, rgba(184,137,58,0.22), transparent 60%)," +
                "radial-gradient(70% 50% at 100% 100%, rgba(184,137,58,0.2), transparent 60%)",
            }}
          />

          {/* Alpha & Omega watermark */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-between px-5 text-[#b8893a]/[0.09] font-bold text-[140px] leading-none select-none">
            <span>Ⲱ</span>
            <span>Ⲁ</span>
          </div>
          <div aria-hidden className="absolute inset-0 grid place-items-center text-[260px] leading-none font-bold text-[#d88a2a]/[0.04] select-none">☧</div>

          {/* Double gold inner frame */}
          <div aria-hidden className="absolute inset-3 rounded-[22px] border border-[#d88a2a]/45" />
          <div aria-hidden className="absolute inset-[14px] rounded-[18px] border border-[#d88a2a]/20" />

          {/* Corner flourishes */}
          {[
            { p: "top-2 left-2", r: 0 },
            { p: "top-2 right-2", r: 90 },
            { p: "bottom-2 right-2", r: 180 },
            { p: "bottom-2 left-2", r: 270 },
          ].map((c, i) => (
            <svg
              key={i}
              aria-hidden
              viewBox="0 0 28 28"
              className={`absolute ${c.p} h-7 w-7 text-[#b8893a]/75`}
              style={{ transform: `rotate(${c.r}deg)` }}
            >
              <path d="M3 3 L13 3 M3 3 L3 13 M5 5 Q12 5 12 12" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="12" cy="12" r="1.2" fill="currentColor" />
              <path d="M3 3 L8 8" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          ))}

          <div className="relative px-5 pt-6 pb-5">
            {/* Header crest */}
            <div className="flex flex-col items-center text-center">
              <div className="text-[#b8893a] mb-1.5"><CopticCross size={20} /></div>
              <p className="text-[9px] font-extrabold tracking-[0.35em] text-[#8a5a1c] uppercase">
                Alpha Coptic Church
              </p>
              <h2
                className="mt-1 text-[20px] font-extrabold text-[#2a1a08]"
                style={{ letterSpacing: "-0.01em" }}
              >
                شهادة عضوية رسمية
              </h2>
              <p className="mt-0.5 text-[10.5px] text-[#8a5a1c]/85">
                {MEMBER.diocese}
              </p>
              <div aria-hidden className="mt-2.5 flex items-center justify-center gap-2 text-[#b8893a]/60">
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#b8893a]/70 to-transparent" />
                <span className="text-[10px]">✦</span>
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#b8893a]/70 to-transparent" />
              </div>
            </div>

            {/* Recital */}
            <p className="mt-3 text-center text-[11.5px] leading-relaxed text-[#5a3a0e]">
              تشهد هذه الوثيقة بأن
            </p>

            {/* Member name — hero */}
            <h3
              className="mt-1.5 text-center text-[26px] font-extrabold text-[#2a1a08] leading-tight"
              style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif", letterSpacing: "-0.01em" }}
            >
              {MEMBER.name}
            </h3>
            <p className="mt-1 text-center text-[11px] leading-relaxed text-[#5a3a0e]">
              عضو موثّق في
              <span className="font-extrabold text-[#2a1a08]"> {MEMBER.church} </span>
              ويخدم بصفة
              <span className="font-extrabold text-[#2a1a08]"> {MEMBER.role}</span>.
            </p>

            {/* Verified ribbon */}
            {MEMBER.verified && (
              <div className="mt-3 flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2dbb7a, #14704a)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 14px rgba(46,204,113,0.5), 0 4px 10px -4px rgba(20,112,74,0.7)",
                  }}
                >
                  <BadgeCheck className="h-3 w-3" strokeWidth={2.8} /> عضوية موثقة وفعّالة
                </span>
              </div>
            )}

            {/* QR — premium framed */}
            <div className="mt-4 grid place-items-center">
              <div className="relative">
                <div
                  className="relative rounded-[18px] p-[4px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #f7e7b8 0%, #d8a23a 35%, #fff4d0 55%, #b8893a 100%)",
                    boxShadow:
                      "0 14px 28px -12px rgba(120,80,30,0.6), inset 0 1px 0 rgba(255,255,255,0.7)",
                  }}
                >
                  <div
                    className="rounded-[14px] p-2.5"
                    style={{
                      background: "#fff7e3",
                      boxShadow: "inset 0 0 0 1px rgba(216,138,42,0.5), inset 0 2px 8px rgba(120,80,30,0.18)",
                    }}
                  >
                    <img src={QR_LARGE} alt="QR العضوية" className="block h-[200px] w-[200px]" />
                  </div>
                  <span
                    className="absolute inset-0 m-auto grid h-[40px] w-[40px] place-items-center rounded-lg text-[19px] font-extrabold"
                    style={{
                      background: "linear-gradient(135deg,#fff7e3,#f0d78c)",
                      color: "#3a2a18",
                      boxShadow: "0 0 0 2.5px #fff7e3, 0 0 0 4px #b8893a, 0 4px 10px rgba(0,0,0,0.3)",
                    }}
                    aria-hidden
                  >
                    ⲁ
                  </span>
                </div>
                <p className="mt-2 text-center text-[9.5px] font-bold tracking-[0.25em] text-[#8a5a1c]/85 uppercase">
                  Scan to Verify
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 grid grid-cols-1 gap-2 text-[11.5px]">
              <Detail icon={<Hash className="h-3 w-3" />} label="رقم العضوية" value={MEMBER.membershipNo} mono />
              <Detail icon={<Church className="h-3 w-3" />} label="الكنيسة" value={MEMBER.church} />
              <Detail icon={<Crown className="h-3 w-3" />} label="الخدمة" value={MEMBER.role} />
              <Detail icon={<Calendar className="h-3 w-3" />} label="تاريخ الانضمام" value={MEMBER.joinDate} />
              <Detail icon={<Calendar className="h-3 w-3" />} label="تاريخ الإصدار" value={MEMBER.issueDate} />
            </div>

            {/* Seal + signature row */}
            <div className="mt-5 flex items-end justify-between gap-3">
              {/* Signature */}
              <div className="flex-1 text-center">
                <div className="h-7 flex items-end justify-center">
                  <svg viewBox="0 0 120 28" className="h-7 w-[110px] text-[#3a2a18]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M4 20 Q14 4 26 18 T54 18 Q66 6 78 20 T108 14" />
                    <path d="M14 24 L100 24" strokeOpacity="0.35" strokeDasharray="2 3" />
                  </svg>
                </div>
                <p className="mt-1 text-[9.5px] font-bold text-[#8a5a1c]">توقيع الراعي</p>
              </div>

              {/* Official seal */}
              <div className="relative">
                <div
                  className="relative grid h-16 w-16 place-items-center rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 25%, #fff4d0, #d8a23a 55%, #8a5a1c 100%)",
                    boxShadow:
                      "0 8px 16px -8px rgba(120,80,30,0.7), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 6px rgba(120,80,30,0.4)",
                  }}
                >
                  <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full text-[#5a3a0e]/85" fill="none" stroke="currentColor">
                    <circle cx="32" cy="32" r="28" strokeWidth="0.6" strokeDasharray="1 2" />
                    <circle cx="32" cy="32" r="22" strokeWidth="0.5" />
                  </svg>
                  <div className="relative grid place-items-center text-[#3a2a18]">
                    <CopticCross size={18} />
                    <span className="mt-0.5 text-[7px] font-extrabold tracking-widest">SEAL</span>
                  </div>
                </div>
                <p className="mt-1 text-center text-[9.5px] font-bold text-[#8a5a1c]">الختم الرسمي</p>
              </div>
            </div>

            {/* Footer strip */}
            <div className="mt-4 pt-3 border-t border-dashed border-[#d88a2a]/45 flex items-center justify-between text-[9.5px] font-bold text-[#8a5a1c]/85">
              <span className="inline-flex items-center gap-1">
                <Award className="h-3 w-3" /> Alpha Coptic · {MEMBER.membershipNo}
              </span>
              <span>صالحة حتى 2027</span>
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

        {/* Scan member */}
        <button
          onClick={() => setScannerOpen(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-[#efe2c4] bg-white/80 backdrop-blur-xl py-3.5 text-[13px] font-extrabold text-[#3a2a18] shadow-[0_8px_20px_-12px_rgba(120,80,30,0.5)] active:scale-[0.99] transition"
        >
          <ScanLine className="h-4.5 w-4.5 text-[#b8893a]" /> مسح عضو آخر
        </button>
        <p className="mt-2 text-center text-[10px] text-[#9a7e5a]">
          للتحقق من العضوية وحضور الفعاليات الكنسية
        </p>
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

function Detail({ icon, label, value, mono, valueClass = "text-[#2a1a08]" }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; valueClass?: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,247,227,0.55))",
        boxShadow: "inset 0 0 0 1px rgba(216,138,42,0.3), 0 2px 4px -2px rgba(120,80,30,0.15)",
      }}
    >
      <span className="text-[#8a5a1c] inline-flex items-center gap-1.5 font-bold">{icon} {label}</span>
      <span className={`${valueClass} font-extrabold ${mono ? "tabular-nums" : ""}`}>{value}</span>
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
