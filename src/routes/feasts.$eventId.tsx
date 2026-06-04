import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Share2, MoreVertical, BookOpen, Calendar, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { FEASTS, getFeast } from "@/features/feasts";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface, BackButton } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark, CopticSeparator } from "@/components/coptic";

export const Route = createFileRoute("/feasts/$eventId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — تفاصيل المناسبة" },
      { name: "description", content: "تفاصيل المناسبة الكنسية وطقسها." },
    ],
  }),
  component: EventDetails,
});

const ACCENT_COLORS: Record<string, string> = {
  purple: "#6a4ab5",
  gold: "#b8893a",
  green: "#3e7a55",
  blue: "#3a6a9b",
};

function EventDetails() {
  const { eventId } = Route.useParams();
  const event = getFeast(eventId);
  const accent = ACCENT_COLORS[event.accent];
  const related = FEASTS.filter((f) => f.id !== event.id).slice(0, 4);

  const storageKey = "alpha:saved-feasts";
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setSaved(list.includes(event.id));
    } catch {}
  }, [event.id]);

  const toggleSave = () => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const next = list.includes(event.id)
        ? list.filter((x) => x !== event.id)
        : [...list, event.id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      const isSaved = next.includes(event.id);
      setSaved(isSaved);
      toast.success(isSaved ? "تم الحفظ في المفضلة" : "تمت الإزالة من المفضلة");
    } catch {
      toast.error("تعذر الحفظ");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} — ${event.subtitle}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      toast.success("تم نسخ الرابط");
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("تعذرت المشاركة");
    }
  };

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#faf3e3]">
      <CopticWatermark />

      <main
        className="relative z-10 mx-auto w-full max-w-[430px]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {/* Hero */}
        <div className="relative h-[280px] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf3e3] via-[#faf3e3]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

          <div
            className="absolute top-0 inset-x-0 px-4 flex items-center justify-between"
            style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
          >
            <BackButton compact to="/feasts" tone="dark" />
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSave}
                aria-pressed={saved}
                aria-label={saved ? "إزالة من المفضلة" : "حفظ"}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/35 backdrop-blur text-white border border-white/15 active:scale-90 transition-transform"
              >
                {saved ? <BookmarkCheck className="h-4 w-4" style={{ color: accent }} /> : <Bookmark className="h-4 w-4" />}
              </button>
              <button
                onClick={handleShare}
                aria-label="مشاركة"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/35 backdrop-blur text-white border border-white/15 active:scale-90 transition-transform"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button aria-label="المزيد" className="grid h-9 w-9 place-items-center rounded-full bg-black/35 backdrop-blur text-white border border-white/15 active:scale-90 transition-transform">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 right-4 left-4">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white border border-white/30 backdrop-blur"
              style={{ background: `${accent}cc` }}
            >
              <CopticCross size={12} />
              {event.subtitle}
            </span>
          </div>
        </div>

        <div className="px-4 -mt-4">
          <GlassSurface className="p-4 bg-white border-[#ead9b1] shadow-[0_18px_40px_-22px_rgba(120,80,30,0.55)]">
            <h1 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-tight">
              {event.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-[11.5px] text-[#6a543a]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {event.copticDay} {event.gregorianDate} {event.copticYear}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#b8893a]" />
              <span className="inline-flex items-center gap-1.5" style={{ color: accent }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                مناسبة كنسية
              </span>
            </div>

            {event.scripture && (
              <div className="mt-4 relative rounded-2xl bg-[#fff7e0] border border-[#ead9b1] p-4 pr-10">
                <span className="absolute top-3 right-3 text-[#b8893a]/50 text-3xl leading-none font-serif">”</span>
                <p className="text-[13px] text-[#3a2a18] leading-relaxed text-center">{event.scripture}</p>
                {event.scriptureRef && (
                  <p className="text-center text-[12px] font-bold text-[#b8893a] mt-2">{event.scriptureRef}</p>
                )}
              </div>
            )}
          </GlassSurface>

          <Section title="عن المناسبة" accent={accent}>
            <p className="text-[13px] text-[#3a2a18] leading-[1.85]">{event.about}</p>
          </Section>

          <Section title="الطقس والصلوات" accent={accent}>
            <p className="text-[13px] text-[#3a2a18] leading-[1.85]">{event.rite}</p>
          </Section>

          <Section title="قراءات اليوم" accent={accent}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbf3e1] border border-[#efe2c4] text-[#b8893a] shrink-0">
                <BookOpen className="h-4 w-4" />
              </span>
              <p className="text-[13px] text-[#3a2a18] leading-[1.85] flex-1">{event.readings}</p>
            </div>
          </Section>

          <CopticSeparator />

          <h3 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] mb-3 px-1 inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#b8893a] rounded-full" />
            مناسبات ذات صلة
          </h3>
          <div className="-mx-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 px-4 pb-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/feasts/$eventId"
                  params={{ eventId: r.id }}
                  className="block min-w-[160px] active:scale-[0.98] transition-transform"
                >
                  <GlassSurface className="overflow-hidden p-0 bg-white border-[#ead9b1]">
                    <div
                      className="h-24 bg-cover bg-center"
                      style={{ backgroundImage: `url(${r.image})` }}
                    />
                    <div className="p-3">
                      <div
                        className="text-[10.5px] font-bold mb-1"
                        style={{ color: ACCENT_COLORS[r.accent] }}
                      >
                        {r.copticDay} {r.gregorianDate}
                      </div>
                      <div className="text-[12.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-2">
                        {r.title}
                      </div>
                    </div>
                  </GlassSurface>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomDock />
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] mb-2 px-1 inline-flex items-center gap-2">
        <span className="h-0.5 w-6 rounded-full" style={{ background: accent }} />
        {title}
      </h3>
      <GlassSurface className="p-4 bg-white border-[#ead9b1] shadow-[0_18px_40px_-22px_rgba(120,80,30,0.55)]">{children}</GlassSurface>
    </section>
  );
}
