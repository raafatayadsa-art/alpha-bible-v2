import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { booksQueryOptions } from "@/lib/bible";
import { groupBooks, displayName } from "@/lib/bible-books";
import { BackButton, BookCard, BookGridSkeleton, BottomDock, SectionHeader } from "@/components/bible";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/books")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الأسفار — الكتاب المقدس" },
      { name: "description", content: "تصفّح كل أسفار الكتاب المقدس مع تصنيفات وبحث ذكي." },
    ],
  }),
  component: BooksGrid,
});

type Category = "all" | "ot" | "nt" | "gospels" | "letters" | "prophets" | "wisdom";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "ot", label: "العهد القديم" },
  { key: "nt", label: "العهد الجديد" },
  { key: "gospels", label: "الأناجيل" },
  { key: "letters", label: "الرسائل" },
  { key: "prophets", label: "الأنبياء" },
  { key: "wisdom", label: "الحكمة" },
];

const GOSPELS = ["متى", "مرقس", "لوقا", "يوحنا"];
const WISDOM = ["أيوب", "المزامير", "الأمثال", "الجامعة", "نشيد الأنشاد"];
const PROPHETS = [
  "إشعياء", "إرميا", "مراثي إرميا", "حزقيال", "دانيال",
  "هوشع", "يوئيل", "عاموس", "عوبديا", "يونان",
  "ميخا", "ناحوم", "حبقوق", "صفنيا", "حجي", "زكريا", "ملاخي",
];

function matchesCategory(book: string, cat: Category, ot: string[], nt: string[]): boolean {
  if (cat === "all") return true;
  if (cat === "ot") return ot.includes(book);
  if (cat === "nt") return nt.includes(book);
  const name = displayName(book);
  if (cat === "gospels") return GOSPELS.some((g) => name.includes(g));
  if (cat === "letters")
    return nt.includes(book) && !GOSPELS.some((g) => name.includes(g)) && !name.includes("أعمال") && !name.includes("رؤيا");
  if (cat === "prophets") return PROPHETS.some((p) => name.includes(p));
  if (cat === "wisdom") return WISDOM.some((w) => name.includes(w));
  return true;
}

function BooksGrid() {
  const { data: books, isLoading, error } = useQuery(booksQueryOptions());
  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");

  const grouped = useMemo(() => (books ? groupBooks(books) : { old: [], neu: [], other: [] }), [books]);

  const filtered = useMemo(() => {
    if (!books) return [] as string[];
    const all = [...grouped.old, ...grouped.neu, ...grouped.other];
    const byCat = all.filter((b) => matchesCategory(b, cat, grouped.old, grouped.neu));
    const norm = q.trim();
    if (!norm) return byCat;
    return byCat.filter((b) => displayName(b).includes(norm));
  }, [books, grouped, cat, q]);

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.5), transparent 60%)," +
            "radial-gradient(70% 60% at 0% 80%, rgba(214,168,98,0.18), transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-32">
        <header className="flex items-center justify-between gap-2 pt-2">
          <BackButton to="/bible" />
          <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">الأسفار</h1>
          <span className="w-[68px]" aria-hidden />
        </header>

        <div className="mt-4">
          <label className="flex items-center gap-2 rounded-2xl bg-white/80 border border-[#efe2c4] px-3 py-2 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.3)]">
            <Search className="h-4 w-4 text-[#b8893a]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن سفر..."
              className="w-full bg-transparent text-[13px] text-[#3a2a18] placeholder:text-[#a78f6c] focus:outline-none"
            />
          </label>
        </div>

        <nav className="mt-3 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar" aria-label="التصنيفات">
          {CATEGORIES.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCat(c.key)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-colors",
                  active
                    ? "bg-gradient-to-br from-[#e7c97a] to-[#a87a35] border-transparent text-white shadow-[0_6px_14px_-8px_rgba(120,80,20,0.55)]"
                    : "bg-white/75 border-[#efe2c4] text-[#3a2a18]",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </nav>

        <section className="mt-4">
          <SectionHeader
            title={cat === "all" ? "كل الأسفار" : CATEGORIES.find((c) => c.key === cat)!.label}
            caption={isLoading ? undefined : `${filtered.length} سفر`}
          />
          {isLoading && <BookGridSkeleton count={12} />}
          {error && (
            <p className="text-center text-[12px] text-red-700/80">
              تعذّر التحميل: {(error as Error).message}
            </p>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-center text-[12px] text-[#6a543a]">لا توجد نتائج.</p>
          )}
          {filtered.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {filtered.map((b, i) => (
                <BookCard
                  key={b}
                  name={displayName(b)}
                  bookParam={b}
                  tone={i % 3 === 1 ? "purple" : i % 3 === 2 ? "ivory" : "gold"}
                />
              ))}

            </div>
          )}
        </section>


        <div className="mt-8 text-center">
          <Link
            to="/diagnostics"
            className="text-[10px] uppercase tracking-[0.3em] text-[#a78f6c] hover:text-[#3a2a18]"
          >
            Diagnostics
          </Link>
        </div>
      </div>

      <BottomDock />
    </main>
  );
}
