import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { booksQueryOptions, chaptersQueryOptions } from "@/lib/bible";
import { groupBooks, displayName } from "@/lib/bible-books";
import { matchesNtFilter, matchesOtFilter, type NtCategory, type OtCategory } from "@/lib/book-meta";
import { BackButton, BookCard, BookGridSkeleton, BottomDock } from "@/components/bible";
import { useBibleSearch } from "@/features/bible-search";
import { ORTHODOX_BIBLE_BOOK_COUNT, ORTHODOX_NT_BOOK_COUNT, ORTHODOX_OT_BOOK_COUNT } from "@/lib/bible-expected-chapters";

type Testament = "old" | "new" | "all";

function booksPageTitle(testament?: Testament) {
  if (testament === "old") return "العهد القديم — الكتاب المقدس";
  if (testament === "new") return "العهد الجديد — الكتاب المقدس";
  return "الأسفار — الكتاب المقدس";
}

export const Route = createFileRoute("/books")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    testament:
      search.testament === "old" || search.testament === "new" || search.testament === "all"
        ? (search.testament as Testament)
        : undefined,
  }),
  head: ({ search }) => ({
    meta: [
      { title: booksPageTitle(search.testament) },
      { name: "description", content: "تصفّح كل أسفار الكتاب المقدس مع تصنيفات وبحث ذكي." },
    ],
  }),
  component: BooksGrid,
});

const NT_TABS: { key: NtCategory; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "gospels", label: "الأناجيل" },
  { key: "letters", label: "الرسائل" },
  { key: "revelation", label: "سفر الرؤيا" },
];

const OT_TABS: { key: OtCategory; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "law", label: "الشريعة" },
  { key: "history", label: "التاريخ" },
  { key: "wisdom", label: "الحكمة" },
  { key: "prophets", label: "الأنبياء" },
];

function BooksGrid() {
  const { testament } = Route.useSearch();
  const { data: books, isLoading, error } = useQuery(booksQueryOptions());
  const [ntFilter, setNtFilter] = useState<NtCategory>("all");
  const [otFilter, setOtFilter] = useState<OtCategory>("all");
  const { openSearch } = useBibleSearch();

  const grouped = useMemo(() => (books ? groupBooks(books) : { old: [], neu: [], other: [] }), [books]);

  const scope = testament === "old" || testament === "new" ? testament : "all";
  const title = booksPageTitle(testament).replace(" — الكتاب المقدس", "");
  const countLabel =
    scope === "old"
      ? `${grouped.old.length || ORTHODOX_OT_BOOK_COUNT} سفراً`
      : scope === "new"
      ? `${grouped.neu.length || ORTHODOX_NT_BOOK_COUNT} سفراً`
      : `${(grouped.old.length + grouped.neu.length) || ORTHODOX_BIBLE_BOOK_COUNT} سفراً`;

  const filtered = useMemo(() => {
    if (!books) return [] as string[];
    let list: string[];
    if (scope === "old") list = grouped.old;
    else if (scope === "new") list = grouped.neu;
    else list = [...grouped.old, ...grouped.neu, ...grouped.other];

    if (scope === "new") list = list.filter((b) => matchesNtFilter(b, ntFilter));
    if (scope === "old") list = list.filter((b) => matchesOtFilter(b, otFilter));

    return list;
  }, [books, grouped, scope, ntFilter, otFilter]);

  const chapterQueries = useQueries({
    queries: filtered.map((b) => ({
      ...chaptersQueryOptions(b),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const tabs = scope === "new" ? NT_TABS : scope === "old" ? OT_TABS : null;
  const activeTab = scope === "new" ? ntFilter : otFilter;
  const setTab = scope === "new"
    ? (k: NtCategory | OtCategory) => setNtFilter(k as NtCategory)
    : (k: NtCategory | OtCategory) => setOtFilter(k as OtCategory);

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f3]">
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
          <BackButton to="/bible" compact tone="light" />
          <div className="text-center min-w-0 flex-1">
            <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">{title}</h1>
            <p className="text-[11px] text-[#6a543a] font-bold">{countLabel}</p>
          </div>
          <button
            type="button"
            aria-label="بحث"
            onClick={openSearch}
            className="inline-grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform"
          >
            <Search className="h-4 w-4 text-[#b8893a]" />
          </button>
        </header>

        {tabs && (
          <nav className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar" aria-label="التصنيفات">
            {tabs.map((c) => {
              const active = activeTab === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setTab(c.key)}
                  className={cn(
                    "flex-1 min-w-0 shrink-0 rounded-full border px-2 py-2 text-[11px] font-bold transition-colors",
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
        )}

        <section className="mt-4">
          {isLoading && <BookGridSkeleton count={16} />}
          {error && (
            <p className="text-center text-[12px] text-red-700/80">
              تعذّر التحميل: {(error as Error).message}
            </p>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-center text-[12px] text-[#6a543a]">لا توجد نتائج.</p>
          )}
          {filtered.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {filtered.map((b, i) => (
                <BookCard
                  key={b}
                  name={displayName(b)}
                  bookParam={b}
                  chaptersCount={chapterQueries[i]?.data?.length}
                />
              ))}
            </div>
          )}
        </section>

        {scope === "all" && (
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/books"
              search={{ testament: "old" }}
              className="rounded-full bg-white/80 border border-[#efe2c4] px-4 py-2 text-[12px] font-bold text-[#3a2a18]"
            >
              العهد القديم
            </Link>
            <Link
              to="/books"
              search={{ testament: "new" }}
              className="rounded-full bg-gradient-to-br from-[#e7c97a] to-[#a87a35] px-4 py-2 text-[12px] font-bold text-white"
            >
              العهد الجديد
            </Link>
          </div>
        )}
      </div>

      <BottomDock />
    </main>
  );
}
