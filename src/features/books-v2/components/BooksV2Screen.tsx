import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { alphaOmegaLogo, headerCathedralBg } from "@/assets/bible-home";
import { BibleV2BottomNav } from "@/features/bible-v2/components/BibleV2BottomNav";
import { BibleV2ContinueReading } from "@/features/bible-v2/components/BibleV2ContinueReading";
import {
  ConnectExpandableSearchBar,
  ConnectSearchBarField,
} from "@/components/alpha/ConnectExpandableSearchBar";
import { useBibleSearch } from "@/features/bible-search";
import { booksQueryOptions } from "@/lib/bible";
import { displayName, groupBooks } from "@/lib/bible-books";
import { resolveBookId, type BibleBookId } from "@/lib/bible-icons";
import { getBookSymbolDef } from "@/lib/bible-icons/book-symbol-registry";
import { matchesNtFilter, matchesOtFilter, type NtCategory, type OtCategory } from "@/lib/book-meta";
import { BackButton } from "@/components/bible";
import { cn } from "@/lib/utils";
import { BooksV2BookCard } from "./BooksV2BookCard";
import { BooksV2TestamentTabs } from "./BooksV2TestamentTabs";

type Testament = "old" | "new";

const NT_TABS: { key: NtCategory; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "gospels", label: "الأناجيل" },
  { key: "letters", label: "الرسائل" },
  { key: "revelation", label: "الرؤيا" },
];

const OT_TABS: { key: OtCategory; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "law", label: "الشريعة" },
  { key: "history", label: "التاريخ" },
  { key: "wisdom", label: "الحكمة" },
  { key: "prophets", label: "الأنبياء" },
];

function padOrder(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function BooksV2Screen({ testament }: { testament: Testament }) {
  const { data: books, isLoading, error } = useQuery(booksQueryOptions());
  const [ntFilter, setNtFilter] = useState<NtCategory>("all");
  const [otFilter, setOtFilter] = useState<OtCategory>("all");
  const [query, setQuery] = useState("");
  const { openSearchWithQuery } = useBibleSearch();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const submitSearch = useCallback(() => {
    openSearchWithQuery(searchQuery.trim());
    collapseSearch();
  }, [searchQuery, openSearchWithQuery, collapseSearch]);

  useEffect(() => {
    setNtFilter("all");
    setOtFilter("all");
    setQuery("");
  }, [testament]);

  const grouped = useMemo(() => (books ? groupBooks(books) : { old: [], neu: [], other: [] }), [books]);
  const list = testament === "old" ? grouped.old : grouped.neu;

  const filtered = useMemo(() => {
    let items = list;
    if (testament === "new") items = items.filter((b) => matchesNtFilter(b, ntFilter));
    if (testament === "old") items = items.filter((b) => matchesOtFilter(b, otFilter));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter((b) => displayName(b).toLowerCase().includes(q));
    }
    return items;
  }, [list, testament, ntFilter, otFilter, query]);

  const tabs = testament === "new" ? NT_TABS : OT_TABS;
  const activeTab = testament === "new" ? ntFilter : otFilter;
  const setTab = testament === "new"
    ? (k: NtCategory | OtCategory) => setNtFilter(k as NtCategory)
    : (k: NtCategory | OtCategory) => setOtFilter(k as OtCategory);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[#faf7f2]">
      <div className="relative mx-auto max-w-[var(--alpha-content-max-width)] pb-36">
        <header className="relative overflow-hidden px-4 pb-4 pt-[max(env(safe-area-inset-top),10px)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${headerCathedralBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(250,247,242,0.5) 0%, #faf7f2 85%)",
            }}
          />
          <div className="relative flex items-center justify-between gap-2">
            <BackButton to="/bible-2" compact tone="light" />
            <img
              src={alphaOmegaLogo}
              alt=""
              className={cn(
                "h-10 w-10 object-contain transition-opacity duration-200",
                searchExpanded && "pointer-events-none opacity-0",
              )}
              draggable={false}
            />
            <ConnectExpandableSearchBar
              expanded={searchExpanded}
              query={searchQuery}
              inputRef={searchInputRef}
              onExpand={() => setSearchExpanded(true)}
              onCollapse={collapseSearch}
              onQueryChange={setSearchQuery}
              onSubmit={submitSearch}
              classicTheme
              placeholder="ابحث في الكتاب المقدس..."
              collapsedAriaLabel="بحث في الكتاب المقدس"
              inputAriaLabel="بحث في الكتاب المقدس"
              className={searchExpanded ? "flex-1" : undefined}
            />
          </div>
          <div className="relative mt-3 text-center">
            <h1 className="font-arabic-serif text-[22px] font-extrabold text-[#1e2b54]">الأسفار</h1>
            <p className="mt-0.5 text-[12px] font-medium text-[#b8893a]">اختر سفرًا للقراءة</p>
          </div>
        </header>

        <div className="px-4">
          <BooksV2TestamentTabs active={testament} />

          <div className="mt-3 flex items-center gap-2">
            <ConnectSearchBarField
              query={query}
              onQueryChange={setQuery}
              placeholder="ابحث عن سفر"
              inputAriaLabel="ابحث عن سفر"
              classicTheme
              className="min-w-0 flex-1"
            />
            <button
              type="button"
              className="alpha-connect-theme alpha-connect-theme--classic flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white px-3 py-2.5 text-[12px] font-semibold text-[#5c6b62] shadow-[0_10px_32px_rgba(22,50,35,0.11)] transition active:scale-95"
            >
              ترتيب
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--neon-blue)]" />
            </button>
          </div>

          <nav className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar" aria-label="التصنيفات">
            {tabs.map((c) => {
              const active = activeTab === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setTab(c.key)}
                  className={
                    active
                      ? "shrink-0 rounded-full bg-[#1e2b54] px-3 py-1.5 text-[10.5px] font-bold text-white"
                      : "shrink-0 rounded-full border border-[#efe4c6] bg-white/80 px-3 py-1.5 text-[10.5px] font-bold text-[#5a4a32]"
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </nav>

          <section key={testament} className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {isLoading && <p className="col-span-full text-center text-[12px] text-[#8a7355]">جاري التحميل…</p>}
            {error && (
              <p className="col-span-full text-center text-[12px] text-red-700/80">
                تعذّر التحميل: {(error as Error).message}
              </p>
            )}
            {!isLoading &&
              filtered.map((b) => {
                const id = resolveBookId(b) as BibleBookId | undefined;
                const order = id ? getBookSymbolDef(id).order : 0;
                return <BooksV2BookCard key={b} bookParam={b} orderLabel={padOrder(order)} />;
              })}
          </section>

          {!isLoading && filtered.length === 0 && (
            <p className="mt-6 text-center text-[12px] text-[#8a7355]">لا توجد نتائج.</p>
          )}
        </div>

        <BibleV2ContinueReading />
      </div>

      <BibleV2BottomNav />
    </div>
  );
}
