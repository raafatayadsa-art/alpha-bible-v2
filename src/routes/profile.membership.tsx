import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import {
  ChevronRight, Share2, Download, Copy, Check, ScanLine, ShieldCheck,
  Church, Cross, ChevronLeft, MapPin, Calendar, Shield,
} from "lucide-react";
import { AlphaOfficialLogo } from "@/components/brand";
import { ALPHA_OFFICIAL_SLOGAN } from "@/components/brand/alpha-brand";
import { AlphaQrCode } from "@/components/identity/AlphaQrCode";
import { ShieldImage } from "@/components/alpha/AlphaShield";
import { useProfileMembershipData } from "@/features/profile/useProfileMembershipData";
import { saveAlphaQrImage } from "@/features/identity/save-alpha-qr-image";

const AlphaMembershipQrScanner = lazy(() =>
  import("@/features/profile/AlphaMembershipQrScanner").then((mod) => ({
    default: mod.AlphaMembershipQrScanner,
  })),
);

const PURPLE = {
  page: "linear-gradient(180deg, #1a1028 0%, #140e22 50%, #0c0816 100%)",
  card: "linear-gradient(155deg, rgba(48,32,78,0.96) 0%, rgba(28,18,48,0.94) 55%, rgba(36,24,58,0.92) 100%)",
  panel: "linear-gradient(155deg, rgba(38,24,62,0.92) 0%, rgba(22,14,38,0.95) 100%)",
  accent: "#b8a0e8",
  accentSoft: "#8a6ec1",
  border: "rgba(184,160,232,0.22)",
  glow: "rgba(138,110,193,0.35)",
};

export const Route = createFileRoute("/profile/membership")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — بطاقة العضوية" }] }),
  component: MembershipScreen,
});

function MembershipScreen() {
  const m = useProfileMembershipData();
  const [copied, setCopied] = useState(false);
  const [qrSaved, setQrSaved] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile`
      : "/profile";

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(m.alphaId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  };

  const share = async () => {
    const data = {
      title: "بطاقة هوية Alpha",
      text: `${m.displayName} — ${m.alphaId}`,
      url: profileUrl,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(`${data.text}\n${profileUrl}`);
    } catch { /* ignore */ }
  };

  const saveQr = async () => {
    const ok = await saveAlphaQrImage(m.qrPayload, `alpha-qr-${m.alphaId}.png`);
    if (ok) {
      setQrSaved(true);
      setTimeout(() => setQrSaved(false), 1600);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: PURPLE.page }}
    >
      <div
        aria-hidden
        className="fixed inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 12%, #8a6ec1 1px, transparent 1.5px), radial-gradient(circle at 82% 88%, #6a4ab5 1px, transparent 1.5px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-10 pt-[max(env(safe-area-inset-top),12px)]">
        <header className="relative flex items-center justify-between gap-2 pt-1">
          <Link
            to="/profile"
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#b8a0e8]/25 bg-[#2a1a45]/60 text-white backdrop-blur-xl shadow-[0_6px_14px_-8px_rgba(0,0,0,0.5)] active:scale-95 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-[16px] font-extrabold text-white/92 tracking-tight">بطاقة العضوية</h1>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-px w-8 bg-gradient-to-l from-[#b8a0e8] to-transparent" />
              <Cross className="h-2.5 w-2.5 text-[#b8a0e8]" strokeWidth={2.5} />
              <span className="text-[#b8a0e8]/70 text-[8px]">✦</span>
              <Cross className="h-3 w-3 text-[#8a6ec1]" strokeWidth={2.5} />
              <span className="text-[#b8a0e8]/70 text-[8px]">✦</span>
              <Cross className="h-2.5 w-2.5 text-[#b8a0e8]" strokeWidth={2.5} />
              <span className="h-px w-8 bg-gradient-to-r from-[#b8a0e8] to-transparent" />
            </div>
          </div>
          <div className="w-10" aria-hidden />
        </header>

        {/* === IDENTITY + COMPACT QR === */}
        <article
          className="relative mt-5 overflow-hidden rounded-[24px] border p-4"
          style={{
            borderColor: PURPLE.border,
            background: PURPLE.card,
            boxShadow: `0 22px 48px -20px rgba(0,0,0,0.65), 0 0 32px -12px ${PURPLE.glow}`,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(184,160,232,0.35), transparent 70%)" }}
          />

          <div className="relative flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="h-[58px] w-[58px] overflow-hidden rounded-full border-2 border-[#b8a0e8]/50 bg-[#1a1028] shadow-md">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-xl font-extrabold text-[#b8a0e8]">
                        {m.displayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 grid h-6 w-6 place-items-center rounded-full border border-[#b8a0e8]/40 bg-[#1a1028]">
                    <ShieldImage role={m.shieldRole} px={20} />
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <h2 className="truncate text-[17px] font-extrabold leading-tight text-white">
                    {m.displayName}
                  </h2>
                  <p className="mt-0.5 text-[11px] font-bold text-[#b8a0e8]/85">{m.roleLabel}</p>
                  {m.verified ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2 py-0.5 text-[8px] font-extrabold text-emerald-300">
                      <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.4} />
                      موثّق
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <CompactQrBadge payload={m.qrPayload} />
          </div>
        </article>

        {/* === MEMBERSHIP DATA (single source — no duplicates) === */}
        <section
          className="relative mt-4 overflow-hidden rounded-[22px] border p-3.5"
          style={{
            borderColor: PURPLE.border,
            background: PURPLE.panel,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#b8a0e8]/40 text-[9px]">✦ ✧ ✦</span>
            <h3 className="text-[13px] font-extrabold text-[#d4c4f8]">بيانات العضوية</h3>
            <span className="text-[#b8a0e8]/40 text-[9px]">✦ ✧ ✦</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoCell
              icon={<Shield className="h-3.5 w-3.5" strokeWidth={2} />}
              label="Alpha ID"
              value={m.alphaId}
              mono
            />
            <InfoCell
              icon={<Calendar className="h-3.5 w-3.5" strokeWidth={2} />}
              label="عضو منذ"
              value={m.memberSince ?? "—"}
            />
            <InfoCell icon={<Church className="h-3.5 w-3.5" strokeWidth={2} />} label="الكنيسة" value={m.churchName} />
            <InfoCell icon={<MapPin className="h-3.5 w-3.5" strokeWidth={2} />} label="الإيبارشية" value={m.diocese} />
            <InfoCell
              icon={
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M10.5 2h3v4h4v3h-4v4.5L17 16l-1 2-4-2-4 2-1-2 3.5-2.5V9h-4V6h4V2z" />
                </svg>
              }
              label="الخدمة"
              value={m.roleLabel}
            />
            <InfoCell
              icon={<Calendar className="h-3.5 w-3.5" strokeWidth={2} />}
              label="تاريخ الميلاد"
              value={m.birthDate ?? "—"}
            />
          </div>
        </section>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionCard onClick={share} icon={<Share2 className="h-5 w-5" strokeWidth={2.2} />} label="مشاركة" tint="purple" />
          <ActionCard
            onClick={() => void saveQr()}
            icon={qrSaved ? <Check className="h-5 w-5" strokeWidth={2.4} /> : <Download className="h-5 w-5" strokeWidth={2.2} />}
            label={qrSaved ? "تم الحفظ" : "حفظ QR"}
            tint="violet"
          />
          <ActionCard
            onClick={copyId}
            icon={copied ? <Check className="h-5 w-5" strokeWidth={2.4} /> : <Copy className="h-5 w-5" strokeWidth={2.2} />}
            label={copied ? "تم" : "نسخ ID"}
            tint="mint"
          />
        </div>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="group relative mt-3 w-full overflow-hidden rounded-[20px] border border-[#b8a0e8]/30 active:scale-[0.99] transition"
          style={{
            background: "linear-gradient(135deg, rgba(106,74,181,0.55) 0%, rgba(58,36,98,0.85) 100%)",
            boxShadow: "0 16px 32px -14px rgba(0,0,0,0.55), 0 0 24px -8px rgba(138,110,193,0.4)",
          }}
        >
          <div className="relative flex items-center gap-3 px-3.5 py-3 text-right">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#d4c4f8]/25 bg-[#b8a0e8]/15">
              <ScanLine className="h-5 w-5 text-[#d4c4f8]" strokeWidth={2.4} />
            </div>
            <div className="flex-1 text-center">
              <p className="text-[14px] font-extrabold text-white leading-tight">مسح عضو آخر</p>
              <p className="mt-0.5 text-[10px] text-[#b8a0e8]/75">للتحقق من عضوية عضو آخر</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-[#b8a0e8]" />
          </div>
        </button>

        <footer className="mt-8 flex flex-col items-center px-3 pb-2 text-center">
          <p
            className="font-coptic text-[24px] font-black leading-none tracking-[0.14em]"
            style={{
              background: "linear-gradient(180deg, #d4c4f8 0%, #8a6ec1 55%, #6a4ab5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ⲁⲗⲫⲁ
          </p>
          <p
            className="mt-3 max-w-[320px] text-[8px] font-bold uppercase leading-relaxed tracking-[0.12em] text-[#b8a0e8]/55"
            aria-label={ALPHA_OFFICIAL_SLOGAN}
          >
            {ALPHA_OFFICIAL_SLOGAN}
          </p>
        </footer>
      </div>

      {scannerOpen ? (
        <Suspense fallback={null}>
          <AlphaMembershipQrScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}

function CompactQrBadge({ payload }: { payload: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div
        className="relative rounded-[14px] p-[3px]"
        style={{
          background: "linear-gradient(135deg, #d4c4f8 0%, #8a6ec1 45%, #6a4ab5 100%)",
          boxShadow: "0 8px 20px -8px rgba(106,74,181,0.65), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        <div className="rounded-[11px] bg-white p-1.5">
          <AlphaQrCode
            value={payload}
            size={160}
            fgColor="1a1028"
            bgColor="ffffff"
            alt="Alpha QR"
            className="block h-[72px] w-[72px] rounded-[6px]"
          />
        </div>
        <span
          aria-hidden
          className="absolute inset-0 m-auto grid h-[22px] w-[22px] place-items-center rounded-md bg-white shadow-sm"
          style={{ boxShadow: "0 0 0 2px #fff, 0 0 0 3px #8a6ec1" }}
        >
          <AlphaOfficialLogo size="sm" className="scale-[0.55]" />
        </span>
      </div>
      <p className="mt-1 text-[7.5px] font-bold text-[#b8a0e8]/60">امسح للتحقق</p>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="min-w-0 rounded-xl border px-2.5 py-2 text-right"
      style={{
        borderColor: "rgba(184,160,232,0.12)",
        background: "rgba(0,0,0,0.22)",
      }}
    >
      <div className="mb-0.5 flex items-center justify-end gap-1 text-[#b8a0e8]/55">
        {icon}
        <span className="text-[8px] font-bold">{label}</span>
      </div>
      <p
        className={`truncate text-[10px] font-extrabold leading-tight text-white/88 ${mono ? "font-mono tabular-nums tracking-wide" : ""}`}
        dir={mono ? "ltr" : "rtl"}
      >
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  onClick,
  icon,
  label,
  tint,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tint: "purple" | "violet" | "mint";
}) {
  const styles = {
    purple: {
      bg: "linear-gradient(180deg, rgba(184,160,232,0.22) 0%, rgba(106,74,181,0.18) 100%)",
      ring: "rgba(184,160,232,0.28)",
      icon: "#d4c4f8",
    },
    violet: {
      bg: "linear-gradient(180deg, rgba(138,110,193,0.2) 0%, rgba(74,48,120,0.22) 100%)",
      ring: "rgba(138,110,193,0.3)",
      icon: "#b8a0e8",
    },
    mint: {
      bg: "linear-gradient(180deg, rgba(52,211,153,0.14) 0%, rgba(16,120,80,0.16) 100%)",
      ring: "rgba(52,211,153,0.28)",
      icon: "#6ee7b7",
    },
  }[tint];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border px-2 py-3 active:scale-[0.97] transition"
      style={{
        background: styles.bg,
        borderColor: styles.ring,
      }}
    >
      <span style={{ color: styles.icon }}>{icon}</span>
      <p className="text-[9.5px] font-extrabold text-white/85">{label}</p>
    </button>
  );
}
