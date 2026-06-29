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
import { ControlCenterScreenBackground } from "@/features/settings/components/ControlCenterScreenBackground";
import { cn } from "@/lib/utils";

const AlphaMembershipQrScanner = lazy(() =>
  import("@/features/profile/AlphaMembershipQrScanner").then((mod) => ({
    default: mod.AlphaMembershipQrScanner,
  })),
);

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
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base">
      <ControlCenterScreenBackground />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[9] bg-[var(--alpha-bg-radial)]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-[8] bg-[var(--alpha-bg-bloom)]" />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-10 pt-[max(env(safe-area-inset-top),12px)]">
        <header className="relative flex items-center justify-between gap-2 pt-1">
          <Link
            to="/profile"
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-alpha bg-alpha-surface text-alpha shadow-[var(--alpha-shadow-mini)] backdrop-blur-xl active:scale-95 alpha-motion-spring"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="alpha-type-h2 font-arabic-serif font-extrabold text-alpha-section-purple tracking-tight">بطاقة العضوية</h1>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-px w-8 bg-gradient-to-l from-alpha-gold-bright/50 to-transparent" />
              <Cross className="h-2.5 w-2.5 text-alpha-gold-deep" strokeWidth={2.5} />
              <span className="alpha-type-caption text-alpha-gold-deep/55">✦</span>
              <Cross className="h-3 w-3 text-alpha-gold-bright" strokeWidth={2.5} />
              <span className="alpha-type-caption text-alpha-gold-deep/55">✦</span>
              <Cross className="h-2.5 w-2.5 text-alpha-gold-deep" strokeWidth={2.5} />
              <span className="h-px w-8 bg-gradient-to-r from-alpha-gold-bright/50 to-transparent" />
            </div>
          </div>
          <div className="w-10" aria-hidden />
        </header>

        <article className="alpha-membership-card relative mt-5 overflow-hidden rounded-[var(--alpha-radius-featured)] p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full"
            style={{ background: "radial-gradient(circle, var(--alpha-membership-glow), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[var(--alpha-radius-featured)] bg-gradient-to-b from-white/48 to-transparent"
          />

          <div className="relative flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="h-[58px] w-[58px] overflow-hidden rounded-full border-2 border-alpha-gold-bright/55 bg-alpha-surface shadow-[0_4px_14px_-6px_rgba(120,80,30,0.32)]">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span
                        className="grid h-full w-full place-items-center text-xl font-extrabold text-alpha-gold-deep"
                        style={{
                          background:
                            "linear-gradient(155deg, color-mix(in srgb, var(--alpha-gold-bright) 28%, white), color-mix(in srgb, var(--alpha-gold-deep) 12%, var(--alpha-bg-elevated)))",
                        }}
                      >
                        {m.displayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 grid h-6 w-6 place-items-center rounded-full border border-alpha-gold-bright/40 bg-alpha-surface">
                    {m.shieldRole ? <ShieldImage role={m.shieldRole} px={20} /> : null}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <h2 className="alpha-type-h1 truncate leading-tight text-alpha-section-purple">
                    {m.displayName}
                  </h2>
                  <p className="alpha-type-desc mt-0.5 font-bold text-alpha-field-value">{m.roleLabel}</p>
                  {m.verified ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-alpha-gold-deep/35 bg-gradient-to-l from-[color-mix(in_srgb,var(--alpha-gold-bright)_22%,white)] to-[color-mix(in_srgb,var(--alpha-gold-deep)_8%,white)] px-2 py-0.5 text-[8px] font-extrabold text-alpha-gold-deep">
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

        <section
          className="relative mt-4 overflow-hidden rounded-[var(--alpha-radius-card-compact)] border border-alpha/80 p-3.5 backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--alpha-bg-elevated) 96%, transparent), color-mix(in srgb, var(--alpha-bg-base) 94%, transparent))",
            boxShadow: "0 16px 36px -18px rgba(120,80,30,0.24), inset 0 1px 0 rgba(255,255,255,0.85)",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="alpha-type-caption text-alpha-gold-deep/45">✦ ✧ ✦</span>
            <h3 className="alpha-type-h2 font-extrabold text-alpha-section-green">بيانات العضوية</h3>
            <span className="alpha-type-caption text-alpha-gold-deep/45">✦ ✧ ✦</span>
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
          <ActionCard onClick={share} icon={<Share2 className="h-5 w-5" strokeWidth={2.2} />} label="مشاركة" tint="gold" />
          <ActionCard
            onClick={() => void saveQr()}
            icon={qrSaved ? <Check className="h-5 w-5" strokeWidth={2.4} /> : <Download className="h-5 w-5" strokeWidth={2.2} />}
            label={qrSaved ? "تم الحفظ" : "حفظ QR"}
            tint="burgundy"
          />
          <ActionCard
            onClick={copyId}
            icon={copied ? <Check className="h-5 w-5" strokeWidth={2.4} /> : <Copy className="h-5 w-5" strokeWidth={2.2} />}
            label={copied ? "تم" : "نسخ ID"}
            tint="ivory"
          />
        </div>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="group relative mt-3 w-full overflow-hidden rounded-[var(--alpha-radius-mini)] border border-alpha-gold-deep/35 active:scale-[0.99] alpha-motion-spring"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--alpha-gold-bright) 32%, white), color-mix(in srgb, var(--alpha-gold-deep) 18%, var(--alpha-bg-elevated)))",
            boxShadow: "0 16px 32px -14px rgba(120,80,30,0.32), inset 0 1px 0 rgba(255,255,255,0.75)",
          }}
        >
          <div className="relative flex items-center gap-3 px-3.5 py-3 text-right">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--alpha-radius-dock-tab)] border border-alpha-gold-bright/40 bg-white/45 text-alpha-gold-deep">
              <ScanLine className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="flex-1 text-center">
              <p className="alpha-type-h2 font-extrabold text-alpha-section-green leading-tight">مسح عضو آخر</p>
              <p className="alpha-type-caption mt-0.5 text-alpha-muted">للتحقق من عضوية عضو آخر</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-alpha-gold-deep" />
          </div>
        </button>

        <footer className="mt-8 flex flex-col items-center px-3 pb-2 text-center">
          <p
            className="font-coptic text-[24px] font-black leading-none tracking-[0.14em]"
            style={{
              background: "linear-gradient(180deg, var(--alpha-gold-bright) 0%, var(--alpha-gold-deep) 55%, var(--alpha-text-heading-muted) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ⲁⲗⲫⲁ
          </p>
          <p
            className="alpha-type-caption mt-3 max-w-[320px] font-bold uppercase leading-relaxed tracking-[0.12em] text-alpha-muted"
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
          background: "linear-gradient(135deg, var(--alpha-gold-bright) 0%, var(--alpha-gold-deep) 55%, var(--alpha-text-heading-muted) 100%)",
          boxShadow: "0 8px 20px -8px rgba(120,80,30,0.38), inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        <div className="rounded-[11px] bg-white p-1.5 shadow-[inset_0_1px_2px_rgba(120,80,30,0.06)]">
          <AlphaQrCode
            value={payload}
            size={160}
            fgColor="3a2a18"
            bgColor="ffffff"
            alt="Alpha QR"
            className="block h-[72px] w-[72px] rounded-[6px]"
          />
        </div>
        <span
          aria-hidden
          className="absolute inset-0 m-auto grid h-[22px] w-[22px] place-items-center rounded-md bg-white shadow-sm"
          style={{ boxShadow: "0 0 0 2px #fff, 0 0 0 3px var(--alpha-gold-deep)" }}
        >
          <AlphaOfficialLogo size="sm" className="scale-[0.55]" />
        </span>
      </div>
      <p className="alpha-type-caption mt-1 font-bold text-alpha-gold-deep/70">امسح للتحقق</p>
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
    <div className="min-w-0 rounded-xl border border-alpha/55 bg-white/42 px-2.5 py-2 text-right backdrop-blur-sm">
      <div className="mb-0.5 flex items-center justify-end gap-1 alpha-type-caption text-alpha-field-label">
        {icon}
        <span className="font-bold">{label}</span>
      </div>
      <p
        className={cn(
          "alpha-type-desc truncate font-extrabold leading-tight text-alpha-field-value-purple",
          mono && "font-mono tabular-nums tracking-wide",
        )}
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
  tint: "gold" | "burgundy" | "ivory";
}) {
  const styles = {
    gold: {
      bg: "linear-gradient(180deg, color-mix(in srgb, var(--alpha-gold-bright) 24%, white), color-mix(in srgb, var(--alpha-gold-deep) 10%, white))",
      ring: "color-mix(in srgb, var(--alpha-gold-deep) 35%, var(--alpha-border))",
      icon: "var(--alpha-gold-deep)",
    },
    burgundy: {
      bg: "linear-gradient(180deg, color-mix(in srgb, var(--alpha-text-heading-muted) 12%, white), color-mix(in srgb, var(--alpha-text-heading) 6%, white))",
      ring: "color-mix(in srgb, var(--alpha-text-heading-muted) 28%, var(--alpha-border))",
      icon: "var(--alpha-text-heading-muted)",
    },
    ivory: {
      bg: "linear-gradient(180deg, rgba(255,255,255,0.72), color-mix(in srgb, var(--alpha-bg-elevated) 88%, white))",
      ring: "var(--alpha-border)",
      icon: "var(--alpha-text-muted)",
    },
  }[tint];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-[var(--alpha-radius-dock-tab)] border px-2 py-3 active:scale-[0.97] alpha-motion-spring backdrop-blur-sm"
      style={{
        background: styles.bg,
        borderColor: styles.ring,
      }}
    >
      <span style={{ color: styles.icon }}>{icon}</span>
      <p className="alpha-type-caption font-extrabold text-alpha-heading">{label}</p>
    </button>
  );
}
