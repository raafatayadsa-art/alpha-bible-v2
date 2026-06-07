import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Share2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseVerseReference } from "@/lib/bible-labels";
import { useSavedVerses, verseKey } from "@/lib/reading-state";
import artVerse from "@/assets/home/art-verse.jpg";

const VERSE_ACCENT = "#e7c97a";

type VerseData = { text: string; reference: string };

/** Same visual card as Home hero verse — reused on Bible hub. */
export function VerseOfDayHeroCard() {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { isSaved, toggle } = useSavedVerses();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: dc } = await supabase.from("daily_content").select("*").limit(1).maybeSingle();
        if (!cancelled && dc) {
          const text =
            (dc as Record<string, unknown>).verse_text ??
            (dc as Record<string, unknown>).text ??
            (dc as Record<string, unknown>).content ??
            (dc as Record<string, unknown>).body;
          const reference =
            (dc as Record<string, unknown>).verse_reference ??
            (dc as Record<string, unknown>).reference ??
            "";
          if (text) {
            setVerse({ text: String(text), reference: String(reference || "") });
            return;
          }
        }
      } catch { /* fallback */ }
      try {
        const { data: bv } = await supabase
          .from("bible_verses")
          .select("book_name,chapter_number,verse_number,verse_text")
          .eq("book_name", "المزامير")
          .eq("chapter_number", 46)
          .eq("verse_number", 1)
          .maybeSingle();
        if (!cancelled && bv) {
          const row = bv as {
            book_name: string;
            chapter_number: number;
            verse_number: number;
            verse_text: string;
          };
          setVerse({
            text: row.verse_text,
            reference: `${row.book_name} ${row.chapter_number}:${row.verse_number}`,
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const body = verse?.text ?? "رَبَّنَا هُوَ مَلْجَأنَا وَقُوَّتَنَا، عَوْنًا فِي الضِّيقَاتِ جِدًّا.";
  const ref = verse?.reference || "مزامير 46:1";
  const parsed = parseVerseReference(ref);
  const saveId = parsed
    ? verseKey(parsed.book, parsed.chapter, parsed.verse)
    : `verse-day:${ref}`;
  const saved = isSaved(saveId);

  const onToggleSaved = () => {
    if (!parsed) {
      setToast("تعذّر حفظ الآية — مرجع غير واضح");
      return;
    }
    toggle({
      book: parsed.book,
      bookName: parsed.book,
      chapter: parsed.chapter,
      verse: parsed.verse,
      text: body,
      id: saveId,
    });
    setToast(saved ? "تمت إزالة الآية" : "تم حفظ الآية");
  };

  const onShare = async () => {
    const payload = `${body}\n\n— ${ref}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: ref, text: payload });
        return;
      } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(payload);
      setToast("تم نسخ الآية");
    } catch {
      setToast("تعذّر المشاركة");
    }
  };

  return (
    <div className="relative">
      <article
        className="relative h-[252px] w-full overflow-hidden rounded-[32px] border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(231,201,122,0.15)]"
        style={{ background: "#0a0612" }}
      >
        <Link to="/bible" aria-label="آية اليوم" className="absolute inset-0 z-0">
          <img
            src={artVerse}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "saturate(1.05)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.92) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[32px]"
            style={{ boxShadow: `inset 0 0 40px ${VERSE_ACCENT}33, inset 0 1px 0 rgba(255,255,255,0.15)` }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-4 left-4 select-none font-black leading-none"
            style={{ fontSize: 64, color: "rgba(255,255,255,0.08)" }}
          >
            Ⲁ
          </span>
        </Link>

        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1.5">
          <Sparkles className="h-3 w-3" style={{ color: VERSE_ACCENT }} />
          <span className="text-[11px] font-bold text-white">آية اليوم</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-3.5 pt-4 pointer-events-none">
          <p
            className="text-right font-extrabold text-white leading-[1.55] text-[14px] line-clamp-3"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
          >
            {body}
          </p>
          <p className="mt-1 text-right text-[11.5px] font-bold" style={{ color: VERSE_ACCENT }}>
            {ref}
          </p>

          <div className="mt-2.5 flex items-center justify-between pointer-events-auto">
            <button
              type="button"
              aria-label={saved ? "إزالة الحفظ" : "حفظ"}
              aria-pressed={saved}
              onClick={onToggleSaved}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md active:scale-95 transition"
              style={saved ? { background: VERSE_ACCENT, borderColor: VERSE_ACCENT } : {}}
            >
              <Bookmark className={"h-4 w-4 " + (saved ? "fill-white" : "")} />
            </button>

            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-5 rounded-full"
                style={{ background: VERSE_ACCENT, boxShadow: `0 0 8px ${VERSE_ACCENT}99` }}
              />
            </div>

            <button
              type="button"
              aria-label="مشاركة"
              onClick={() => void onShare()}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md active:scale-95 transition"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>

      {toast && (
        <p className="absolute -bottom-7 inset-x-0 text-center text-[11px] font-bold text-[#7a4a26] animate-in fade-in">
          {toast}
        </p>
      )}
    </div>
  );
}
