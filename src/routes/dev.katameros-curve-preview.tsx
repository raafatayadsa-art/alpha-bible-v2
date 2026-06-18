import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Search } from "lucide-react";
import { CopticCross } from "@/components/coptic";
import { ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";
import { KatamerosScreenBackground } from "@/features/katameros/components/KatamerosScreenBackground";
import { KatamerosPreviewHeaderShell } from "@/features/katameros/components/KatamerosPreviewHeaderShell";
import {
  KATAMEROS_CURVE_DESCRIPTIONS,
  KATAMEROS_CURVE_LABELS,
  KATAMEROS_CURVE_VARIANTS,
  type KatamerosCurvePreviewVariant,
} from "@/features/katameros/katameros-curve-preview";

export const Route = createFileRoute("/dev/katameros-curve-preview")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Alpha — Katameros Curve Preview" }],
  }),
  component: KatamerosCurvePreviewPage,
});

function DynamicIslandMock() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[10px] z-20 h-[28px] w-[108px] -translate-x-1/2 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
    />
  );
}

function PreviewPhone({ variant }: { variant: KatamerosCurvePreviewVariant }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <figcaption className="text-center">
        <p className="text-[13px] font-extrabold text-[#3a2a18]">{KATAMEROS_CURVE_LABELS[variant]}</p>
        <p className="mt-0.5 max-w-[240px] text-[10px] leading-snug text-[#6a543a]">
          {KATAMEROS_CURVE_DESCRIPTIONS[variant]}
        </p>
      </figcaption>

      <div
        className="relative overflow-hidden rounded-[36px] border-[3px] border-[#2a2a2a] bg-[#1a1a1a] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
        style={{ width: 320, height: 692 }}
      >
        <div className="relative mx-auto mt-2 h-[calc(100%-8px)] w-[calc(100%-8px)] overflow-hidden rounded-[30px] bg-[#f4ead8]">
          <DynamicIslandMock />

          {/* Real Katameros background + header preview stack */}
          <div className="relative min-h-full">
            <KatamerosScreenBackground previewVariant={variant} scope="absolute" />

            <KatamerosPreviewHeaderShell
              previewVariant={variant}
              className="!pt-[max(env(safe-area-inset-top,12px),44px)]"
            >
              <div className="flex items-center justify-between gap-2 pb-2">
                <button type="button" aria-hidden className={ALPHA_HEADER_BTN}>
                  <ChevronRight className="h-5 w-5 text-[#3a2a18]" />
                </button>
                <div className="flex min-w-0 flex-1 flex-col items-center -mt-1">
                  <CopticCross className="text-[#b8893a]" size={18} />
                  <h2 className="font-arabic-serif text-[18px] font-extrabold text-[#3a2a18] leading-tight">
                    القطمارس
                  </h2>
                  <p className="text-[10.5px] text-[#6a543a] -mt-0.5">قراءات الكنيسة القبطية لليوم</p>
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
            </KatamerosPreviewHeaderShell>

            {/* Mock hero card */}
            <div className="relative z-10 mx-3 mt-3 overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-b from-[#3a2a18]/80 to-[#2a1a08]/90 p-4 shadow-lg min-h-[120px]">
              <p className="font-arabic-serif text-[15px] font-extrabold text-[#fdfbf7]">الخميس · ١٠ بؤونة</p>
              <p className="mt-1 text-[10px] text-[#f0dfaa]/80">KATAMEROS · Coptic Lectionary</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[44%] rounded-full bg-[#b8893a]" />
              </div>
            </div>

            {/* Mock list rows on parchment */}
            <div className="relative z-10 mx-3 mt-4 space-y-2 pb-4">
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
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#efe2c4] bg-white/90 px-3 py-1 text-[10px] font-bold text-[#3a2a18] shadow-sm">
            Variant {variant.toUpperCase()}
          </div>
        </div>
      </div>
    </figure>
  );
}

function KatamerosCurvePreviewPage() {
  return (
    <div dir="rtl" className="min-h-dvh bg-[#2a2418] px-4 py-8 text-[#f4ead8]">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8893a]">Alpha Design Lab</p>
          <h1 className="mt-2 font-arabic-serif text-[26px] font-extrabold text-white">
            Katameros Top Curve — Visual Comparison
          </h1>
          <p className="mx-auto mt-3 max-w-[680px] text-[13px] leading-relaxed text-[#d4c4a8]">
            Three preview variants targeting the PNG medallion arc in{" "}
            <code className="text-[#f0d78c]">KatamerosScreenBackground</code>. Screenshot this page, then test
            live on <code className="text-[#f0d78c]">/katameros?katamerosBg=a|b|c</code>.
          </p>
        </header>

        <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-10">
          {KATAMEROS_CURVE_VARIANTS.map((variant) => (
            <PreviewPhone key={variant} variant={variant} />
          ))}
        </div>

        <ComparisonTable />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {KATAMEROS_CURVE_VARIANTS.map((v) => (
            <Link
              key={v}
              to="/katameros"
              search={{ katamerosBg: v }}
              className="rounded-full border border-[#efe2c4]/40 bg-[#f4ead8] px-4 py-2 text-[12px] font-bold text-[#3a2a18]"
            >
              Live Variant {v.toUpperCase()} on القطمارس
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <section className="mx-auto mt-10 max-w-[900px] overflow-hidden rounded-2xl border border-[#b8893a]/30 bg-[#3a2a18]/80 text-[12px] text-[#ead9b1]">
      <table className="w-full border-collapse text-right">
        <thead>
          <tr className="border-b border-[#b8893a]/25 bg-[#2a2018]/60">
            <th className="p-3 font-bold text-[#f0d78c]">Variant</th>
            <th className="p-3 font-bold text-[#f0d78c]">What disappears</th>
            <th className="p-3 font-bold text-[#f0d78c]">What is affected</th>
            <th className="p-3 font-bold text-[#f0d78c]">Identity preserved?</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/10">
            <td className="p-3 font-bold">A</td>
            <td className="p-3">Entire PNG — medallion + floating letters + parchment texture</td>
            <td className="p-3">All Katameros screens feel like generic shell; hero card &amp; glass cards carry theme</td>
            <td className="p-3 text-[#f5a5a5]">Partial — loses lectionary parchment DNA</td>
          </tr>
          <tr className="border-b border-white/10">
            <td className="p-3 font-bold">B</td>
            <td className="p-3">Top medallion arc only (+72px crop below cap)</td>
            <td className="p-3">Header zone flat cream; lower body keeps letters &amp; texture</td>
            <td className="p-3 text-[#a8e6a8]">Strong — best balance</td>
          </tr>
          <tr>
            <td className="p-3 font-bold">C</td>
            <td className="p-3">Arc visible only below header band (masked by opaque header)</td>
            <td className="p-3">Header zone flat; scroll area still shows full PNG including arc when scrolling</td>
            <td className="p-3 text-[#f0d78c]">Yes — full asset kept; curve may reappear on scroll</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
