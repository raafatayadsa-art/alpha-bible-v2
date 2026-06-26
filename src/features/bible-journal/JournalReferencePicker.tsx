import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, X } from "lucide-react";
import { ConnectExpandableSearchBar } from "@/components/alpha/ConnectExpandableSearchBar";
import { HeroBadgeEmblem } from "@/components/home/hero-card-chrome";
import { searchContextual } from "@/features/search/contextual-search";
import { booksQueryOptions, chaptersQueryOptions } from "@/lib/bible";
import { displayName, groupBooks } from "@/lib/bible-books";
import { JOURNAL_VAULT } from "./journal-vault-tokens";

type PickerStep = "testament" | "book" | "chapter" | "verse" | null;
type TestamentChoice = "old" | "new";

export type JournalReferenceValue = {
  book: string;
  bookName: string;
  chapter?: number;
  verse?: number;
};

type JournalReferencePickerProps = {
  value: JournalReferenceValue;
  onChange: (value: JournalReferenceValue) => void;
  locked?: boolean;
  lockedLabel?: string;
};

export function JournalReferencePicker({
  value,
  onChange,
  locked = false,
  lockedLabel,
}: JournalReferencePickerProps) {
  const [step, setStep] = useState<PickerStep>(null);
  const [testament, setTestament] = useState<TestamentChoice | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: books = [] } = useQuery(booksQueryOptions());
  const { data: chapters = [] } = useQuery({
    ...chaptersQueryOptions(value.book),
    enabled: Boolean(value.book) && step === "chapter",
  });

  const searchResults = useMemo(
    () => searchContextual("bible", searchQuery, { books }),
    [searchQuery, books],
  );

  const grouped = useMemo(() => groupBooks(books), [books]);

  const refLabel = useMemo(() => {
    if (!value.book) return null;
    const base = `${value.bookName || displayName(value.book)} ${value.chapter ?? "?"}`;
    return value.verse != null ? `${base}:${value.verse}` : base;
  }, [value]);

  const closePicker = useCallback(() => {
    setStep(null);
    setTestament(null);
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const openBookPicker = useCallback(() => {
    setTestament(null);
    setStep("testament");
  }, []);

  const testamentBooks = useMemo(() => {
    if (testament === "old") return grouped.old;
    if (testament === "new") return grouped.neu;
    return [];
  }, [grouped, testament]);

  const pickBook = useCallback(
    (book: string) => {
      onChange({
        book,
        bookName: displayName(book),
        chapter: undefined,
        verse: undefined,
      });
      closePicker();
    },
    [onChange, closePicker],
  );

  const pickChapter = useCallback(
    (chapter: number) => {
      onChange({
        ...value,
        chapter,
        verse: undefined,
      });
      closePicker();
    },
    [onChange, value, closePicker],
  );

  const pickVerse = useCallback(
    (verse: number) => {
      onChange({ ...value, verse });
      closePicker();
    },
    [onChange, value, closePicker],
  );

  if (locked && value.book && value.chapter != null) {
    return (
      <div
        className="rounded-xl border px-3 py-3 text-right"
        style={{
          borderColor: `${JOURNAL_VAULT.gold}44`,
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <p className="mb-2 text-[10px] font-bold" style={{ color: JOURNAL_VAULT.gold }}>
          {lockedLabel ?? "✦ مرتبط بالآية من القراءة ✦"}
        </p>
        <div className="flex justify-end">
          <HeroBadgeEmblem
            label={
              refLabel ??
              `${value.bookName} ${value.chapter}${value.verse != null ? `:${value.verse}` : ""}`
            }
          />
        </div>
      </div>
    );
  }

  const rowBtn =
    "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-bold transition active:scale-[0.99]";

  const chipBtn = (active: boolean, disabled?: boolean) => ({
    borderColor: active ? `${JOURNAL_VAULT.noteAccent}55` : "rgba(255,255,255,0.1)",
    background: active ? JOURNAL_VAULT.noteBg : "rgba(0,0,0,0.3)",
    color: active ? JOURNAL_VAULT.text : JOURNAL_VAULT.textMuted,
    opacity: disabled ? 0.45 : 1,
  });

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={openBookPicker}
          className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition active:scale-[0.98]"
          style={chipBtn(Boolean(value.book))}
        >
          <span className="text-[9px] font-bold opacity-70">السفر</span>
          <span className="line-clamp-2 text-[10px] font-bold leading-snug">
            {value.book ? value.bookName : "اختر"}
          </span>
        </button>
        <button
          type="button"
          disabled={!value.book}
          onClick={() => setStep("chapter")}
          className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition active:scale-[0.98]"
          style={chipBtn(value.chapter != null, !value.book)}
        >
          <span className="text-[9px] font-bold opacity-70">الإصحاح</span>
          <span className="text-[11px] font-bold tabular-nums">
            {value.chapter != null ? value.chapter : "—"}
          </span>
        </button>
        <button
          type="button"
          disabled={value.chapter == null}
          onClick={() => setStep("verse")}
          className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition active:scale-[0.98]"
          style={chipBtn(value.verse != null, value.chapter == null)}
        >
          <span className="text-[9px] font-bold opacity-70">الآية</span>
          <span className="text-[11px] font-bold tabular-nums">
            {value.verse != null ? value.verse : "—"}
          </span>
        </button>
      </div>

      {refLabel ? (
        <div
          className="mt-2 flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
          style={{
            borderColor: `${JOURNAL_VAULT.gold}33`,
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <span className="text-[10px] font-bold" style={{ color: JOURNAL_VAULT.goldMuted }}>
            ✦ ربط الآية
          </span>
          <HeroBadgeEmblem label={refLabel} compact />
        </div>
      ) : (
        <p className="mt-2 text-center text-[10px]" style={{ color: JOURNAL_VAULT.textMuted }}>
          ربط بآية (اختياري) — اختر السفر والإصحاح
        </p>
      )}

      {step ? (
        <div className="fixed inset-0 z-[90] flex flex-col justify-end" dir="rtl">
          <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/70" onClick={closePicker} />
          <div
            className="relative z-10 flex max-h-[78vh] flex-col overflow-hidden rounded-t-[24px] border-t"
            style={{
              borderColor: `${JOURNAL_VAULT.noteAccent}44`,
              background: "linear-gradient(180deg, #0a0818 0%, #050814 100%)",
            }}
          >
            <div
              className="flex shrink-0 items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <button
                type="button"
                onClick={() => {
                  if (step === "book") {
                    setStep("testament");
                    setTestament(null);
                    return;
                  }
                  closePicker();
                }}
                className="grid h-9 w-9 place-items-center rounded-full border"
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                <X className="h-4 w-4" style={{ color: JOURNAL_VAULT.textMuted }} />
              </button>
              <p className="text-[14px] font-bold" style={{ color: JOURNAL_VAULT.text }}>
                {step === "testament"
                  ? "اختر العهد"
                  : step === "book"
                    ? testament === "old"
                      ? "أسفار العهد القديم"
                      : "أسفار العهد الجديد"
                    : step === "chapter"
                      ? "اختر الإصحاح"
                      : "اختر الآية"}
              </p>
              <span className="w-9" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
              {step === "testament" ? (
                <div className="grid gap-2.5 pb-2">
                  {(
                    [
                      { id: "new" as const, label: "العهد الجديد", sub: `${grouped.neu.length || 27} سفراً` },
                      { id: "old" as const, label: "العهد القديم", sub: `${grouped.old.length || 49} سفراً` },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTestament(item.id);
                        setStep("book");
                      }}
                      className={rowBtn}
                      style={{
                        borderColor: `${JOURNAL_VAULT.gold}44`,
                        background: "rgba(0,0,0,0.35)",
                        color: JOURNAL_VAULT.text,
                      }}
                    >
                      <span className="flex-1 text-right">
                        <span className="block text-[13px] font-bold">{item.label}</span>
                        <span className="block text-[10px] font-medium opacity-60">{item.sub}</span>
                      </span>
                      <ChevronLeft className="h-4 w-4 opacity-50" />
                    </button>
                  ))}
                </div>
              ) : null}

              {step === "book" ? (
                <>
                  <div className="alpha-connect-theme alpha-connect-theme--classic mb-3 flex min-w-0 justify-start">
                    <ConnectExpandableSearchBar
                      expanded={searchExpanded}
                      query={searchQuery}
                      inputRef={searchInputRef}
                      onExpand={() => setSearchExpanded(true)}
                      onCollapse={() => {
                        setSearchExpanded(false);
                        setSearchQuery("");
                      }}
                      onQueryChange={setSearchQuery}
                      onSubmit={() => {
                        const first = searchResults[0];
                        if (first?.params?.book) pickBook(first.params.book);
                      }}
                      classicTheme
                      placeholder="ابحث في الكتاب المقدس..."
                      collapsedAriaLabel="بحث في الأسفار"
                      inputAriaLabel="بحث في الأسفار"
                      className="w-full"
                    />
                  </div>
                  {searchQuery.trim() ? (
                    <div className="space-y-2">
                      {searchResults.length === 0 ? (
                        <p className="py-6 text-center text-[12px]" style={{ color: JOURNAL_VAULT.textMuted }}>
                          لا توجد نتائج
                        </p>
                      ) : (
                        searchResults.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => r.params?.book && pickBook(r.params.book)}
                            className={rowBtn}
                            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.35)", color: JOURNAL_VAULT.text }}
                          >
                            <span className="flex-1 text-right">{r.title}</span>
                            <ChevronLeft className="h-4 w-4 opacity-50" />
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 pb-2">
                      {testamentBooks.map((book) => (
                        <button
                          key={book}
                          type="button"
                          onClick={() => pickBook(book)}
                          className={rowBtn}
                          style={{
                            borderColor: value.book === book ? `${JOURNAL_VAULT.noteAccent}55` : "rgba(255,255,255,0.08)",
                            background: value.book === book ? JOURNAL_VAULT.noteBg : "rgba(0,0,0,0.3)",
                            color: JOURNAL_VAULT.text,
                          }}
                        >
                          <span className="flex-1 text-right">{displayName(book)}</span>
                          <ChevronLeft className="h-4 w-4 opacity-50" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : null}

              {step === "chapter" ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {chapters.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => pickChapter(ch)}
                      className="rounded-xl border py-2.5 text-[13px] font-bold tabular-nums transition active:scale-95"
                      style={{
                        borderColor: value.chapter === ch ? `${JOURNAL_VAULT.noteAccent}66` : "rgba(255,255,255,0.1)",
                        background: value.chapter === ch ? JOURNAL_VAULT.noteBg : "rgba(0,0,0,0.35)",
                        color: JOURNAL_VAULT.text,
                      }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              ) : null}

              {step === "verse" ? (
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {Array.from({ length: 40 }, (_, i) => i + 1).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => pickVerse(v)}
                      className="rounded-xl border py-2 text-[12px] font-bold tabular-nums transition active:scale-95"
                      style={{
                        borderColor: value.verse === v ? `${JOURNAL_VAULT.noteAccent}66` : "rgba(255,255,255,0.1)",
                        background: value.verse === v ? JOURNAL_VAULT.noteBg : "rgba(0,0,0,0.35)",
                        color: JOURNAL_VAULT.text,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onChange({ ...value, verse: undefined })}
                    className="col-span-full mt-2 rounded-xl border py-2 text-[11px] font-bold"
                    style={{ borderColor: "rgba(255,255,255,0.12)", color: JOURNAL_VAULT.textMuted }}
                  >
                    بدون رقم آية
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
