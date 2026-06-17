import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Search } from "lucide-react";
import { AlphaBackground } from "@/components/alpha/AlphaBackground";
import {
  ALPHA_BACKGROUND_BASE,
  ALPHA_BACKGROUND_DESCRIPTIONS,
  ALPHA_BACKGROUND_LABELS,
  type AlphaBackgroundVariant,
} from "@/components/alpha/alpha-background";
import { CopticCross } from "@/components/coptic";
import { ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";

export const Route = createFileRoute("/dev/background-preview")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Alpha — Background Preview" }],
  }),
  component: BackgroundPreviewPage,
});

const VARIANTS: AlphaBackgroundVariant[] = ["a", "b", "c"];

function DynamicIslandMock() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[10px] z-20 h-[28px] w-[108px] -translate-x-1/2 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
    />
  );
}

function PreviewPhone({ variant }: { variant: AlphaBackgroundVariant }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <figcaption className="text-center">
        <p className="text-[13px] font-extrabold text-[#3a2a18]">{ALPHA_BACKGROUND_LABELS[variant]}</p>
        <p className="mt-0.5 max-w-[220px] text-[10px] leading-snug text-[#6a543a]">
          {ALPHA_BACKGROUND_DESCRIPTIONS[variant]}
        </p>
      </figcaption>

      <div
        className="relative overflow-hidden rounded-[36px] border-[3px] border-[#2a2a2a] bg-[#1a1a1a] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
        style={{ width: 320, height: 692 }}
      >
        {/* Screen */}
        <div
          className="relative mx-auto mt-2 h-[calc(100%-8px)] w-[calc(100%-8px)] overflow-hidden rounded-[30px]"
          style={{ backgroundColor: ALPHA_BACKGROUND_BASE }}
        >
          <DynamicIslandMock />
          <AlphaBackground variant={variant} scope="absolute" />

          {/* Mock header — matches القطمارس / shell screens */}
          <div
            className="relative z-10 px-3"
            style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 44px)" }}
          >
            <div className="flex items-center justify-between gap-2 pb-2">
              <button type="button" aria-hidden className={ALPHA_HEADER_BTN}>
                <ChevronRight className="h-5 w-5 text-[#3a2a18]" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <CopticCross className="text-[#b8893a]" size={18} />
                <h2 className="font-arabic-serif text-[18px] font-extrabold text-[#3a2a18] leading-tight">
                  القطمارس
                </h2>
                <p className="text-[10px] text-[#6a543a]">قراءات الكنيسة القبطية لليوم</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" aria-hidden className={ALPHA_HEADER_BTN}>
                  <Bell className="h-5 w-5 text-[#3a2a18]" />
                </button>
                <button type="button" aria-hidden className={ALPHA_HEADER_BTN}>
                  <Search className="h-5 w-5 text-[#3a2a18]" />
                </button>
              </div>
            </div>
          </div>

          {/* Mock hero card */}
          <div className="relative z-10 mx-3 mt-2 overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-b from-[#3a2a18]/80 to-[#2a1a08]/90 p-4 shadow-lg">
            <p className="font-arabic-serif text-[15px] font-extrabold text-[#fdfbf7]">الخميس · ١٠ بؤونة</p>
            <p className="mt-1 text-[10px] text-[#f0dfaa]/80">KATAMEROS · Coptic Lectionary</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[44%] rounded-full bg-[#b8893a]" />
            </div>
          </div>

          {/* Mock list rows */}
          <div className="relative z-10 mx-3 mt-4 space-y-2">
            {["مزمور العشية", "إنجيل العشية", "مزمور باكر"].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-[#d4c4a8]/60 bg-[#faf6ec]/85 px-3 py-2.5 backdrop-blur-sm"
              >
                <span className="text-[12px] font-bold text-[#3a2a18]">{label}</span>
                <span className="rounded-full bg-[#6a4ab5]/15 px-2 py-0.5 text-[9px] font-bold text-[#6a4ab5]">
                  مكتمل
                </span>
              </div>
            ))}
          </div>

          {/* Variant badge */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#efe2c4] bg-white/90 px-3 py-1 text-[10px] font-bold text-[#3a2a18] shadow-sm">
            Variant {variant.toUpperCase()}
          </div>
        </div>
      </div>
    </figure>
  );
}

function BackgroundPreviewPage() {
  return (
    <div dir="rtl" className="min-h-dvh bg-[#2a2418] px-4 py-8 text-[#f4ead8]">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8893a]">Alpha Design Lab</p>
          <h1 className="mt-2 font-arabic-serif text-[26px] font-extrabold text-white">
            Shell Background — Visual Comparison
          </h1>
          <p className="mx-auto mt-3 max-w-[640px] text-[13px] leading-relaxed text-[#d4c4a8]">
            Three isolated previews using only <code className="text-[#f0d78c]">AlphaBackground</code> (no route-level
            gradients). Take screenshots here, then test live with{" "}
            <code className="text-[#f0d78c]">?alphaBg=a</code>, <code className="text-[#f0d78c]">?alphaBg=b</code>, or{" "}
            <code className="text-[#f0d78c]">?alphaBg=c</code> on any shell screen.
          </p>
        </header>

        <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-10">
          {VARIANTS.map((variant) => (
            <PreviewPhone key={variant} variant={variant} />
          ))}
        </div>

        <section className="mx-auto mt-10 max-w-[720px] rounded-2xl border border-[#b8893a]/30 bg-[#3a2a18]/80 p-5 text-[12px] leading-relaxed text-[#ead9b1]">
          <p className="font-bold text-[#f0d78c]">Live app note</p>
          <p className="mt-2">
            Route-level radial gradients are <strong>not removed yet</strong>. On Variant B live screens that already
            have inline gradients (e.g. /church), you may see a stacked effect until migration. The preview above is
            the clean A/B/C comparison.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/katameros"
              search={{ alphaBg: "a" }}
              className="rounded-full border border-[#efe2c4]/40 bg-[#f4ead8] px-4 py-2 text-[12px] font-bold text-[#3a2a18]"
            >
              Try A on القطمارس
            </Link>
            <Link
              to="/katameros"
              search={{ alphaBg: "b" }}
              className="rounded-full border border-[#efe2c4]/40 bg-[#f4ead8] px-4 py-2 text-[12px] font-bold text-[#3a2a18]"
            >
              Try B on القطمارس
            </Link>
            <Link
              to="/katameros"
              search={{ alphaBg: "c" }}
              className="rounded-full border border-[#efe2c4]/40 bg-[#f4ead8] px-4 py-2 text-[12px] font-bold text-[#3a2a18]"
            >
              Try C on القطمارس
            </Link>
            <Link
              to="/home"
              search={{ alphaBg: "a" }}
              className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-bold text-white"
            >
              Try A on Home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
