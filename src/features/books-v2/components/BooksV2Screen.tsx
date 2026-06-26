import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import bgWatermark from "@/features/bible-lavoble/assets/bg-watermark.jpg";
import controlCenterBg from "@/assets/control-center-bg.png";
import { alphaOmegaLogo, headerCathedralBg } from "@/assets/bible-home";
import { booksHeroNt, booksHeroOt } from "../assets";
import { BottomDock } from "@/components/bible/BottomDock";
import {
  ConnectExpandableSearchBar,
  ConnectSearchBarField,
} from "@/components/alpha/ConnectExpandableSearchBar";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { useBibleSearch } from "@/features/bible-search";
import { booksQueryOptions } from "@/lib/bible";
import { displayName, groupBooks } from "@/lib/bible-books";
import { matchesNtFilter, matchesOtFilter, type NtCategory, type OtCategory } from "@/lib/book-meta";
import { BackButton } from "@/components/bible";
import { cn } from "@/lib/utils";
import { groupBooksIntoSections } from "../books-premium-sections";
import { BOOKS_PREMIUM } from "../books-premium-tokens";
import { BooksPremiumSectionBlock } from "./BooksPremiumSectionBlock";
import { BooksPremiumStyles } from "./BooksPremiumStyles";
import { BooksPremiumTestamentTabs } from "./BooksPremiumTestamentTabs";

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
  const isOt = testament === "old";

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

  const activeFilter = testament === "new" ? ntFilter : otFilter;
  const sections = useMemo(
    () => groupBooksIntoSections(filtered, testament, activeFilter),
    [filtered, testament, activeFilter],
  );

  const tabs = testament === "new" ? NT_TABS : OT_TABS;
  const setTab = testament === "new"
    ? (k: NtCategory | OtCategory) => setNtFilter(k as NtCategory)
    : (k: NtCategory | OtCategory) => setOtFilter(k as OtCategory);

  let runningIndex = 0;

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden" style={{ background: BOOKS_PREMIUM.ivory }}>
      <HeroLedgerStylesHost />
      <BooksPremiumStyles />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src={headerCathedralBg}
          alt=""
          className="absolute inset-x-0 top-0 h-[52vh] w-full object-cover opacity-[0.28]"
        />
        <img
          src={controlCenterBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.14] mix-blend-multiply"
        />
        <img
          src={bgWatermark}
          alt=""
          className="absolute inset-x-0 top-[18vh] h-[50vh] w-full object-cover opacity-[0.22] mix-blend-luminosity"
        />
        <div
          className="absolute inset-0"
          style={{
            background: [
              `radial-gradient(ellipse 90% 50% at 50% 0%, ${isOt ? BOOKS_PREMIUM.otGlow : BOOKS_PREMIUM.ntGlow} 0%, transparent 55%)`,
              `linear-gradient(180deg, rgba(251,243,225,0.35) 0%, ${BOOKS_PREMIUM.ivory}cc 45%, ${BOOKS_PREMIUM.ivory} 100%)`,
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #5a4a32 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <span
          className="books-orb-float pointer-events-none absolute right-[8%] top-[18%] h-20 w-20 rounded-full blur-3xl"
          style={{ background: isOt ? BOOKS_PREMIUM.otGlow : BOOKS_PREMIUM.ntGlow }}
        />
        <span
          className="books-orb-float pointer-events-none absolute left-[6%] top-[38%] h-14 w-14 rounded-full blur-2xl"
          style={{ background: isOt ? "rgba(184,137,58,0.25)" : "rgba(61,90,154,0.22)", animationDelay: "1.4s" }}
        />
        <span
          className="books-star-twinkle pointer-events-none absolute left-[12%] top-[28%] h-1 w-1 rounded-full bg-[#d4af37]"
        />
        <span
          className="books-star-twinkle pointer-events-none absolute right-[22%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#3d5a9a]"
          style={{ animationDelay: "1.2s" }}
        />
        <span className="hero-ledger-glyph-gold pointer-events-none absolute right-[10%] top-[52%] text-[28px] opacity-[0.07]">Ⲁ</span>
        <span className="hero-ledger-glyph-gold pointer-events-none absolute left-[14%] top-[62%] text-[22px] opacity-[0.06]">Ⲱ</span>
      </div>

      <div className="relative z-10 mx-auto max-w-[var(--alpha-content-max-width)] pb-36">
        <header className="px-4 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
          <div className="flex items-center justify-between gap-2">
            <BackButton to="/bible" compact tone="light" />
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

          <section
            className={cn(
              "relative mx-auto mt-4 aspect-[3/4] w-full max-w-[340px] rounded-[26px] transition duration-300",
              isOt ? "books-premium-hero--ot" : "books-premium-hero--nt",
            )}
            style={{
              boxShadow: isOt
                ? "0 0 0 1px rgba(212,175,55,0.38), 0 28px 56px -16px rgba(90,60,20,0.4)"
                : "0 0 0 1px rgba(61,90,154,0.32), 0 28px 56px -16px rgba(20,30,60,0.36)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[26px]">
              <img
                src={isOt ? booksHeroOt : booksHeroNt}
                alt=""
                draggable={false}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </section>
        </header>

        <div className="px-4">
          <BooksPremiumTestamentTabs active={testament} />

          <div className="mt-3">
            <ConnectSearchBarField
              query={query}
              onQueryChange={setQuery}
              placeholder="ابحث عن سفر بالاسم…"
              inputAriaLabel="ابحث عن سفر"
              classicTheme
              className="w-full"
            />
          </div>

          <nav className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar" aria-label="التصنيفات">
            {tabs.map((c) => {
              const active = activeFilter === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setTab(c.key)}
                  className={
                    active
                      ? "shrink-0 rounded-full px-3.5 py-1.5 text-[10.5px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(30,43,84,0.35)]"
                      : "shrink-0 rounded-full border border-[#efe4c6] bg-white/85 px-3.5 py-1.5 text-[10.5px] font-bold text-[#5a4a32]"
                  }
                  style={
                    active
                      ? {
                          background: isOt
                            ? `linear-gradient(180deg, ${BOOKS_PREMIUM.gold} 0%, ${BOOKS_PREMIUM.goldDeep} 100%)`
                            : `linear-gradient(180deg, ${BOOKS_PREMIUM.ntAccent} 0%, ${BOOKS_PREMIUM.navy} 100%)`,
                        }
                      : undefined
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </nav>

          {isLoading && (
            <p className="mt-10 text-center text-[12px] text-[#8a7355]">جاري تحميل مكتبة الأسفار…</p>
          )}
          {error && (
            <p className="mt-10 text-center text-[12px] text-red-700/80">
              تعذّر التحميل: {(error as Error).message}
            </p>
          )}

          {!isLoading &&
            sections.map((group) => {
              const start = runningIndex;
              runningIndex += group.books.length;
              return (
                <BooksPremiumSectionBlock
                  key={group.section.key}
                  section={group.section}
                  books={group.books}
                  testament={testament}
                  startIndex={start}
                />
              );
            })}

          {!isLoading && filtered.length === 0 && (
            <p className="mt-10 text-center text-[12px] text-[#8a7355]">لا توجد نتائج مطابقة.</p>
          )}
        </div>
      </div>

      <BottomDock />
    </div>
  );
}
