import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Sun, Moon, Sparkles, BookOpen, Play } from "lucide-react";
import { useMemo } from "react";
import {
  AGPEYA_PRAYERS,
  getAgpeyaBySection,
  getCurrentAgpeyaPrayer,
  readLastOpenedPrayer,
} from "@/features/agpeya";
import { BottomDock } from "@/components/bible/BottomDock";

export const Route = createFileRoute("/agpeya")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الأجبية" },
      { name: "description", content: "صلوات الأجبية القبطية — صلوات النهار والليل والصلوات المتفرقة." },
    ],
  }),
  component: AgpeyaHome,
});

function accentClasses(accent?: string) {
  switch (accent) {
    case "dawn":
      return "from-[#fff4d6] to-[#ffe1ac] text-[#7a4a14] border-[#e9b977]/55";
    case "noon":
      return "from-[#fff0c9] to-[#f6d27a] text-[#7a4a14] border-[#e0a64a]/55";
    case "evening":
      return "from-[#fbe1c4] to-[#e9b27a] text-[#5e2f0c] border-[#c98245]/55";
    case "night":
      return "from-[#1a2a44] to-[#0c1626] text-[#e9d99a] border-white/10";
    case "extra":
      return "from-[#efe6d4] to-[#e2cfa6] text-[#5b3a18] border-[#c79356]/45";
    default:
      return "from-[#fff7e7] to-[#f3e1bc] text-[#5b3a18] border-[#c79356]/40";
  }
}

function PrayerTile({
  id,
  title,
  subtitle,
  accent,
}: { id: string; title: string; subtitle?: string; accent?: string }) {
  return (
    <Link
      to="/agpeya/$prayerId"
      params={{ prayerId: id }}
      className={
        "group relative block overflow-hidden rounded-2xl border bg-gradient-to-br p-4 " +
        "shadow-[0_10px_24px_-14px_rgba(120,80,30,0.35),inset_0_1px_0_rgba(255,255,255,0.6)] " +
        "transition-transform duration-200 active:scale-[0.97] " +
        accentClasses(accent)
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-arabic-serif text-[17px] font-bold leading-tight">{title}</div>
          {subtitle && (
            <div className="mt-1 text-[11.5px] opacity-75 leading-snug">{subtitle}</div>
          )}
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/40 backdrop-blur-md border border-white/50">
          <Play className="h-3.5 w-3.5 fill-current" />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fbf3e1] border border-[#c79356]/40 text-[#8a5a1f]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1">
        <h2 className="font-arabic-serif text-[16px] font-bold text-[#3a2410] leading-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-[#7a5a32]">{subtitle}</p>}
      </div>
    </div>
  );
}

function AgpeyaHome() {
  const current = useMemo(() => getCurrentAgpeyaPrayer(), []);
  const last = useMemo(() => readLastOpenedPrayer(), []);
  const day = getAgpeyaBySection("day");
  const night = getAgpeyaBySection("night");
  const extra = getAgpeyaBySection("extra");

  return (
    <div
      dir="rtl"
      className="min-h-dvh bg-[radial-gradient(120%_60%_at_50%_-10%,#fff5dd_0%,#fbeac6_45%,#f3d9a5_100%)] pb-32"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#fbf3e1]/80 border-b border-[#c79356]/25">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
          <Link
            to="/home"
            aria-label="رجوع"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/60 border border-[#c79356]/35 text-[#8a5a1f] active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 -scale-x-100" />
          </Link>
          <div className="text-center">
            <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2410] leading-tight">الأجبية</h1>
            <p className="text-[11px] text-[#7a5a32]">السبع صلوات اليومية</p>
          </div>
          <div className="h-9 w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 pt-5 space-y-7">
        {/* Hero: current prayer */}
        <section>
          <Link
            to="/agpeya/$prayerId"
            params={{ prayerId: current.id }}
            className="relative block overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#1f4032] via-[#234a3a] to-[#0e2a20] p-5 text-white shadow-[0_20px_44px_-22px_rgba(20,60,40,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(80% 60% at 80% 0%, rgba(231,201,122,0.45), transparent 60%), radial-gradient(60% 60% at 0% 100%, rgba(122,240,184,0.25), transparent 60%)",
              }}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[10.5px] font-semibold text-[#f0d78c]">
                  <Sparkles className="h-3 w-3" />
                  صلاة هذه الساعة
                </div>
                <h2 className="font-arabic-serif mt-3 text-[26px] font-bold leading-tight">{current.title}</h2>
                {current.subtitle && (
                  <p className="mt-1 text-[13px] text-white/75">{current.subtitle}</p>
                )}
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f0d78c] to-[#c79356] text-[#3a2410] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
          </Link>

          {last && last.prayerId !== current.id && (
            <Link
              to="/agpeya/$prayerId"
              params={{ prayerId: last.prayerId }}
              className="mt-3 flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md border border-[#c79356]/35 px-4 py-3 text-[#5b3a18] shadow-[0_6px_16px_-12px_rgba(120,80,30,0.4)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-[#8a5a1f]" />
                <div>
                  <div className="text-[10.5px] text-[#8a5a1f]/80">متابعة القراءة</div>
                  <div className="font-arabic-serif text-[14px] font-bold leading-tight">
                    {AGPEYA_PRAYERS.find((p) => p.id === last.prayerId)?.title ?? "آخر صلاة"}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#8a5a1f]">
                {Math.round((last.scrollPercent || 0) * 100)}%
              </span>
            </Link>
          )}
        </section>

        {/* Day prayers */}
        <section>
          <SectionHeader icon={Sun} title="صلوات النهار" subtitle="السبع صلوات الكنسية" />
          <div className="grid grid-cols-2 gap-3">
            {day.map((p) => (
              <PrayerTile key={p.id} {...p} />
            ))}
          </div>
        </section>

        {/* Night prayers */}
        <section>
          <SectionHeader icon={Moon} title="صلوات الليل" subtitle="الستار ونصف الليل" />
          <div className="grid grid-cols-2 gap-3">
            {night.map((p) => (
              <PrayerTile key={p.id} {...p} />
            ))}
          </div>
        </section>

        {/* Extras */}
        <section>
          <SectionHeader icon={Sparkles} title="صلوات إضافية" />
          <div className="grid grid-cols-2 gap-3">
            {extra.map((p) => (
              <PrayerTile key={p.id} {...p} />
            ))}
          </div>
        </section>
      </main>

      <BottomDock />
    </div>
  );
}
