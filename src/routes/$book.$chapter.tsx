import { createFileRoute, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Headphones,
  Share2,
} from "lucide-react";
import { ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";
import { CopticWatermark } from "@/components/coptic";
import { chaptersQueryOptions, versesQueryOptions } from "@/lib/bible";
import type { BibleVerse } from "@/integrations/supabase/client";
import { displayName } from "@/lib/bible-books";
import { chapterWithNumber } from "@/lib/bible-labels";
import {
  AutoScrollControls,
  BottomDock,
  HighlightedWord,
  MeaningSheet,
  ReferenceIndicator,
  VerseSkeleton,
  DictionaryLookupSheet,
  DictionaryResultsSheet,
  type MeaningSheetData,
} from "@/components/bible";
import { chapterKey, updateSession, useSavedChapters, useSavedVerses, useTypographyPrefs, verseKey } from "@/lib/reading-state";
import { articleScrollProgress, bindScroll, resolveScrollRoot, scrollMetrics, scrollToBottom, scrollToTop, scrollToY } from "@/lib/chapter-scroll";
import { cn } from "@/lib/utils";
import {
  useDictionary,
  buildDictionaryIndex,
  lookupEntry,
  namesDictionaryEntries,
  normalizeAr,
  fetchDeepByNormalized,
  lookupDictionary,
  bulkLookupMatched,
  type DictionaryEntry,
  type DictionaryIndex,
  type LookupDictionaryRow,
} from "@/lib/dictionary";
import { setChapterDictState } from "@/lib/chapter-dict-store";
import { normalizeEntityTab, isPersonEntity, isPlaceEntity } from "@/lib/entity-category";

/**
 * HMR_EPOCH — bumps on every hot-module reload of this file (and indirectly
 * any time the dev editor evaluates a change). Used as a memo dependency so
 * the dictionary index + highlighted verses rebuild live in the editor
 * without needing to open Preview or reload the page.
 */
const HMR_EPOCH: number = Date.now();
if (import.meta.hot) {
  import.meta.hot.accept();
}

function parseRelatedVerses(raw?: string): { reference: string; text: string }[] {
  if (!raw) return [];
  // Accept newline / "،" / "," / ";" / "؛" separated refs (text optional after " - ").
  return raw
    .split(/\r?\n|،|;|؛|,/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [refRaw, ...rest] = s.split(/\s[-–—:]\s/);
      return { reference: refRaw.trim(), text: rest.join(" - ").trim() };
    });
}

function isNamesPersonEntry(e: DictionaryEntry): boolean {
  // Only treat as a person when the normalized category (context-aware)
  // resolves to "people". Fixes كوش / أشور being treated as persons just
  // because they live in bible_names_dictionary.
  const desc = (e.shortMeaning ?? e.fullMeaning ?? "").trim();
  return isPersonEntity(e.category, e.term, desc);
}

function entryToNamesPersonSheet(e: DictionaryEntry): MeaningSheetData {
  const name = (e.term ?? "").trim();
  const meaning = (e.shortMeaning ?? e.fullMeaning ?? "").trim();
  const reference = (e.bibleReferencesRaw ?? "").trim();
  const tab = normalizeEntityTab(e.category, name, meaning);

  // Defensive: if the entry actually describes a place, route to Map.
  if (tab === "map") {
    return {
      word: name,
      kind: e.category ?? "place",
      defaultTab: "map",
      hideMeaningTab: true,
      meaning: meaning || undefined,
      mapLabel: name,
    };
  }

  return {
    word: name,
    kind: e.category ?? "person",
    defaultTab: "people",
    hideMeaningTab: true,
    relatedPeople: [
      {
        name,
        role: e.category,
        meaning: meaning || undefined,
        reference: reference || undefined,
      },
    ],
  };
}

function entryToSheet(e: DictionaryEntry): MeaningSheetData {
  const shortMeaning = (e.shortMeaning || "").trim();
  const verses = parseRelatedVerses(e.bibleReferencesRaw);
  const tab = normalizeEntityTab(e.category, e.term, shortMeaning);

  const base: MeaningSheetData = {
    word: (e.term ?? "").trim(),
    kind: e.category,
    meaning: shortMeaning || undefined,
    fullMeaning: (e.fullMeaning || "").trim() || undefined,
    relatedVerses: verses.length ? verses : undefined,
  };

  if (tab === "map") {
    return { ...base, defaultTab: "map", mapLabel: e.term };
  }
  if (tab === "people") {
    return {
      ...base,
      defaultTab: "people",
      relatedPeople: e.term
        ? [{ name: e.term, role: e.category, meaning: shortMeaning || undefined }]
        : undefined,
    };
  }
  // Unknown / general — no forced tab (defaults to "meaning").
  return base;
}

/**
 * Build the sheet for a tapped highlighted word.
 * If alpha_dictionary_deep has a match, augment with person info — BUT
 * only force the People tab when the entry is actually a person. Places
 * (كوش, أشور, ...) keep their Map default.
 */
async function buildSheetForEntry(e: DictionaryEntry): Promise<MeaningSheetData> {
  const base = entryToSheet(e);
  const norm = (e.normalizedTerm || normalizeAr(e.term || "")).trim();
  if (!norm) return base;
  const deep = await fetchDeepByNormalized(norm);
  if (!deep) return base;

  const meaning = (deep.meaning || e.shortMeaning || "").trim();
  const tab = normalizeEntityTab(e.category, e.term, meaning);
  const deepVerses = deep.reference ? parseRelatedVerses(deep.reference) : [];
  const merged = [...(base.relatedVerses ?? []), ...deepVerses];
  const seen = new Set<string>();
  const dedupVerses = merged.filter((v) => {
    const k = v.reference.trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Place → Map tab, regardless of the deep row.
  if (isPlaceEntity(e.category, e.term, meaning)) {
    return {
      ...base,
      defaultTab: "map",
      mapLabel: e.term,
      relatedVerses: dedupVerses.length ? dedupVerses : base.relatedVerses,
    };
  }

  // Person → People tab.
  if (tab === "people") {
    const person = {
      name: deep.word || e.term || "",
      role: e.category,
      meaning: meaning || undefined,
      reference: (deep.reference || "").trim() || undefined,
    };
    return {
      ...base,
      defaultTab: "people",
      relatedPeople: [person],
      relatedVerses: dedupVerses.length ? dedupVerses : base.relatedVerses,
    };
  }

  // Unknown / general — leave defaultTab unset.
  return {
    ...base,
    relatedVerses: dedupVerses.length ? dedupVerses : base.relatedVerses,
  };
}

export const Route = createFileRoute("/$book/$chapter")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} ${params.chapter} — الكتاب المقدس` },
      { name: "description", content: `${displayName(params.book)} — ${chapterWithNumber(params.book, Number(params.chapter))}.` },
    ],
  }),
  component: ScriptureReader,
});

type ChapterScrollAnchor = "top" | "bottom";

type ChapterNavState = {
  chapterNav?: {
    book: string;
    chapter: number;
    anchor: ChapterScrollAnchor;
  };
};

/* Highlight matches now come from the dictionary_entries table via useDictionary(). */

/* ---------------- Reader ---------------- */

function chapterHeaderBtnClass(spiritualMode: boolean, active?: boolean) {
  if (spiritualMode) {
    return cn(
      "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#0e1a2e]/55 backdrop-blur-xl text-[#f3e6c4] active:scale-95 transition",
      active && "border-[#f0d78c]/50 bg-[#f0d78c]/15",
    );
  }
  return cn(
    ALPHA_HEADER_BTN,
    "text-[#3a2a18]",
    active && "border-[#5a3d92]/35 bg-[#7a5cb0]/12 text-[#5a3d92]",
  );
}

function ScriptureReader() {
  const { book, chapter } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const ch = Number(chapter);
  const verses = useQuery(versesQueryOptions(book, ch));
  const chapters = useQuery(chaptersQueryOptions(book));
  const bookName = displayName(book);
  const list = chapters.data ?? [];
  const idx = list.indexOf(ch);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  const chapterNavState = useRouterState({
    select: (s) => (s.location.state as ChapterNavState | undefined)?.chapterNav ?? null,
  });
  const freshNavRef = useRef<{ book: string; chapter: number; anchor: ChapterScrollAnchor } | null>(null);

  const [spiritualMode, setSpiritualMode] = useState(false);
  const [sheet, setSheet] = useState<MeaningSheetData | null>(null);
  const [lookupRow, setLookupRow] = useState<LookupDictionaryRow | null>(null);
  const [lookupChoices, setLookupChoices] = useState<LookupDictionaryRow[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeVerse, setActiveVerse] = useState<string | null>(null);
  const [readingVerse, setReadingVerse] = useState(1);

  // Tap a highlighted/any word: query lookup_dictionary first. If multiple
  // entries match the same surface word, show a picker; otherwise open the
  // single entry directly. Fall back to the local dictionary entry sheet,
  // and if nothing exists show a small toast.
  const openWordLookup = async (term: string, entry?: DictionaryEntry) => {
    const targetNorm = normalizeAr(term);
    const all = await lookupDictionary(term);
    // Exact-match filter: only rows whose `word` normalizes to the same form.
    const rows = all.filter((r) => normalizeAr(r.word ?? "") === targetNorm);
    if (rows.length === 1) {
      setLookupRow(rows[0]);
      return;
    }
    if (rows.length > 1) {
      setLookupChoices(rows);
      return;
    }
    if (entry) {
      setSheet(isNamesPersonEntry(entry) ? entryToNamesPersonSheet(entry) : entryToSheet(entry));
      return;
    }
    setToast("لا يوجد معنى متاح لهذه الكلمة");
    window.setTimeout(() => setToast(null), 1800);
  };

  // Dictionary words from Supabase (dictionary_entries) — drives highlight + meaning sheet.
  const dict = useDictionary();
  // HMR epoch — bumps every time this module (or dictionary.ts) hot-reloads
  // in the dev editor, forcing the index + verse cards to rebuild without
  // requiring a full page reload or jumping to Preview.
  const highlightEntries = useMemo(
    () => namesDictionaryEntries(dict.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict.data, dict.dataUpdatedAt, HMR_EPOCH],
  );
  const dictIndex = useMemo<DictionaryIndex>(
    () => buildDictionaryIndex(highlightEntries),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightEntries, HMR_EPOCH],
  );
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[dictionary] index built:", {
      words: dictIndex.map.size,
      stems: dictIndex.stems.size,
      phrases: dictIndex.phrases.size,
      phraseStems: dictIndex.phraseStems.size,
    });
  }, [dictIndex]);

  /* ----------------------------------------------------------------
   * Smart highlight: collect every unique normalized word in the
   * current chapter, ask lookup_dictionary which ones are real entries,
   * and expose the result as `matchedSet`. VerseCard renders any token
   * whose normalized form is in this set as a highlighted button.
   * ---------------------------------------------------------------- */
  // Temporarily disabled — manual dictionary search still works.
  const enableSmartDictionaryHighlight = true;
  const matchedSSKey = `ab:dict:matched:v9-quality:${book}:${ch}`;
  const readMatchedFromSession = (): Set<string> | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(matchedSSKey);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return null;
      return new Set(arr as string[]);
    } catch {
      return null;
    }
  };
  const [matchedSet, setMatchedSet] = useState<Set<string>>(() => {
    if (!enableSmartDictionaryHighlight) return new Set();
    const cached = readMatchedFromSession();
    if (cached && cached.size > 0) {
      setChapterDictState({ count: cached.size, status: "ready" });
      return cached;
    }
    return new Set();
  });

  useEffect(() => {
    if (!enableSmartDictionaryHighlight) {
      setChapterDictState({ count: 0, status: "idle" });
      return;
    }
    if (!verses.data?.length) {
      setMatchedSet(new Set());
      setChapterDictState({ count: 0, status: "idle" });
      return;
    }

    // Hydrate from sessionStorage only if a non-empty set is cached.
    const cached = readMatchedFromSession();
    if (cached && cached.size > 0) {
      setMatchedSet(cached);
      setChapterDictState({ count: cached.size, status: "ready" });
      // eslint-disable-next-line no-console
      console.log("[chapter-highlight] hydrated from sessionStorage:", cached.size);
      return;
    }

    let cancelled = false;
    const allWords: string[] = [];
    for (const v of verses.data) {
      const re = /[\u0600-\u06FF\u0750-\u077F]+/g;
      const text = (v as any)?.verse_text ?? "";
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const n = normalizeAr(m[0]);
        if (n) allWords.push(n);
      }
    }
    const unique = Array.from(new Set(allWords));
    // eslint-disable-next-line no-console
    console.log("[chapter-highlight] words:", allWords.length, "unique:", unique.length);
    setChapterDictState({ count: 0, status: "loading" });
    bulkLookupMatched(unique, (partial) => {
      if (cancelled) return;
      setMatchedSet(new Set(partial));
      setChapterDictState({ count: partial.size, status: "loading" });
    })
      .then((matched) => {
        if (cancelled) return;
        setMatchedSet(new Set(matched));
        setChapterDictState({ count: matched.size, status: "ready" });
        if (matched.size > 0) {
          try {
            window.sessionStorage.setItem(matchedSSKey, JSON.stringify(Array.from(matched)));
          } catch {
            /* quota / serialization — non-fatal */
          }
        }

        const sample = Array.from(matched).slice(0, 12);
        // eslint-disable-next-line no-console
        console.log("[chapter-highlight] matched:", matched.size, "sample:", sample);
      })
      .catch((e) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn("[chapter-highlight] bulk lookup failed:", e);
        setChapterDictState({ count: 0, status: "ready" });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses.data, book, ch]);

  // Persistent typography prefs
  const { prefs, setPrefs } = useTypographyPrefs();
  const { fontSize, lineHeight } = prefs;
  const setFontSize = (n: number) => setPrefs({ ...prefs, fontSize: n });
  const setLineHeight = (n: number) => setPrefs({ ...prefs, lineHeight: n });

  // Saved verses + chapters
  const { isSaved, toggle: toggleSaved } = useSavedVerses();
  const { isChapterSaved, toggleChapter } = useSavedChapters();
  const chapterSaveId = chapterKey(book, ch);
  const chapterIsSaved = isChapterSaved(chapterSaveId);

  const articleRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const contentColumnRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const verseElementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const visibleVerseRef = useRef<number | undefined>(undefined);
  const lastSavedAt = useRef(0);

  const openWordLookupRef = useRef(openWordLookup);
  openWordLookupRef.current = openWordLookup;

  const registerVerseElement = useCallback((num: number, el: HTMLElement | null) => {
    if (el) verseElementsRef.current.set(num, el);
    else verseElementsRef.current.delete(num);
  }, []);

  const onVerseActive = useCallback((id: string) => {
    setActiveVerse(id);
  }, []);

  const onSelectWordStable = useCallback((word: string, entry?: DictionaryEntry) => {
    if (entry) {
      setSheet(isNamesPersonEntry(entry) ? entryToNamesPersonSheet(entry) : entryToSheet(entry));
      return;
    }
    void openWordLookupRef.current(word);
  }, []);

  const goBack = useCallback(() => {
    void router.navigate({ to: "/bible-2" });
  }, [router]);

  const openAdjacentChapter = useCallback(
    (targetChapter: number, anchor: ChapterScrollAnchor) => {
      const root = scrollRoot ?? resolveScrollRoot(mainRef.current);
      freshNavRef.current = { book, chapter: targetChapter, anchor };
      if (anchor === "bottom") scrollToBottom(root);
      else scrollToTop(root);
      void navigate({
        to: "/$book/$chapter",
        params: { book, chapter: String(targetChapter) },
        state: { chapterNav: { book, chapter: targetChapter, anchor } },
      });
    },
    [book, navigate, scrollRoot],
  );

  const handleAdjacentChapterPress = useCallback(
    (targetChapter: number, anchor: ChapterScrollAnchor, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openAdjacentChapter(targetChapter, anchor);
    },
    [openAdjacentChapter],
  );

  const handleShareChapter = useCallback(async () => {
    const title = `${bookName} — ${chapterWithNumber(book, ch)}`;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("تم نسخ الرابط");
      window.setTimeout(() => setToast(null), 1800);
    } catch {
      setToast("تعذّر المشاركة");
      window.setTimeout(() => setToast(null), 1800);
    }
  }, [bookName, book, ch]);

  const handleToggleChapterSave = useCallback(() => {
    const added = toggleChapter({ book, bookName, chapter: ch });
    setToast(added ? "تم حفظ الإصحاح" : "تمت إزالة الحفظ");
    window.setTimeout(() => setToast(null), 1800);
  }, [toggleChapter, book, bookName, ch]);

  const handleListen = useCallback(() => {
    setToast("الاستماع الصوتي — قريباً");
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(() => {
    verseElementsRef.current.clear();
    setReadingVerse(1);
  }, [book, ch]);

  const onOpenCrossRef = useCallback(
    (num: number) => {
      setSheet({
        word: `${bookName} ${ch}:${num}`,
        kind: "مراجع متقاطعة",
        relatedVerses: [
          { reference: "مزمور 23:1", text: "الرب راعيّ فلا يعوزني شيء." },
          { reference: "يوحنا 14:6", text: "أنا هو الطريق والحق والحياة." },
        ],
      });
    },
    [bookName, ch],
  );

  const onToggleSaveVerse = useCallback(
    (v: Parameters<typeof toggleSaved>[0]) => {
      toggleSaved(v);
    },
    [toggleSaved],
  );

  const isNT = useMemo(() => {
    return [
      "متى",
      "مرقس",
      "لوقا",
      "يوحنا",
      "أعمال",
      "رؤيا",
      "رومية",
      "كورنثوس",
      "غلاطية",
      "أفسس",
      "فيلبي",
      "كولوسي",
      "تسالونيكي",
      "تيموثاوس",
      "تيطس",
      "فليمون",
      "العبرانيين",
      "يعقوب",
      "بطرس",
      "يهوذا",
      "رسالة",
      "إنجيل",
    ].some((k) => bookName.includes(k));
  }, [bookName]);

  // Active verse: cached verse elements (no document-wide query on every scroll tick).
  useEffect(() => {
    if (!verses.data?.length) return;
    let rafId: number | null = null;
    const compute = () => {
      rafId = null;
      const root = scrollRoot ?? resolveScrollRoot(mainRef.current);
      const vh =
        root && root !== document.documentElement ? root.clientHeight : window.innerHeight;
      const zoneTop = vh * 0.25;
      const zoneBottom = vh * 0.45;
      let els = Array.from(verseElementsRef.current.values());
      if (!els.length && articleRef.current) {
        els = Array.from(articleRef.current.querySelectorAll<HTMLElement>("[data-verse-num]"));
      }
      if (!els.length) return;
      const visible = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, top: r.top, bottom: r.bottom };
        })
        .filter((x) => x.bottom > 0 && x.top < vh)
        .sort((a, b) => a.top - b.top);
      if (!visible.length) return;
      let pick = visible.find((x) => x.top >= zoneTop && x.top <= zoneBottom);
      if (!pick) pick = visible[1] ?? visible[0];
      const n = Number(pick.el.dataset.verseNum);
      if (n) {
        visibleVerseRef.current = n;
        setReadingVerse((cur) => (cur === n ? cur : n));
        const id = verseKey(book, ch, n);
        setActiveVerse((cur) => (cur === id ? cur : id));
      }
    };
    const schedule = () => {
      if (rafId == null) rafId = requestAnimationFrame(compute);
    };
    compute();
    const unbind = scrollRoot ? bindScroll(scrollRoot, schedule) : undefined;
    window.addEventListener("resize", schedule);
    return () => {
      unbind?.();
      window.removeEventListener("resize", schedule);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [verses.data, book, ch, scrollRoot]);

  const dictRenderKey = `${matchedSet.size}:${HMR_EPOCH}:${book}:${ch}`;

  // Persist reading session (throttled) + restore scroll on first load.
  const restoredRef = useRef(false);
  useEffect(() => {
    restoredRef.current = false;
  }, [book, ch]);

  useEffect(() => {
    if (!verses.data?.length) return;
    if (restoredRef.current) return;
    const root = scrollRoot ?? resolveScrollRoot(mainRef.current);
    if (!root) return;
    restoredRef.current = true;

    const freshFromRef =
      freshNavRef.current?.book === book && freshNavRef.current?.chapter === ch
        ? freshNavRef.current.anchor
        : null;
    const freshFromState =
      chapterNavState?.book === book && chapterNavState?.chapter === ch
        ? chapterNavState.anchor
        : null;
    const freshAnchor = freshFromRef ?? freshFromState;

    const applyAnchor = (anchor: ChapterScrollAnchor) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (anchor === "bottom") {
            scrollToBottom(root);
            setReadingVerse(verses.data!.length);
          } else {
            scrollToTop(root);
            setReadingVerse(1);
          }
          const metrics = scrollMetrics(root);
          updateSession({
            book,
            bookName,
            chapter: ch,
            verse: anchor === "bottom" ? verses.data!.length : 1,
            progressPercent: anchor === "bottom" ? 100 : 0,
            scrollY: metrics.y,
            lastOpenedAt: Date.now(),
          });
        });
      });
    };

    try {
      if (document.documentElement.dataset.autoscroll === "1") return;

      if (freshAnchor) {
        applyAnchor(freshAnchor);
        freshNavRef.current = null;
        if (freshFromState) {
          void navigate({
            to: "/$book/$chapter",
            params: { book, chapter: String(ch) },
            replace: true,
            state: {},
          });
        }
        return;
      }

      const raw = localStorage.getItem("ab:reading:current");
      if (raw) {
        const s = JSON.parse(raw) as { book: string; chapter: number; scrollY: number };
        if (s && s.book === book && s.chapter === ch && s.scrollY > 0) {
          requestAnimationFrame(() => {
            if (document.documentElement.dataset.autoscroll === "1") return;
            scrollToY(root, s.scrollY);
          });
          return;
        }
      }

      applyAnchor("top");
    } catch {
      applyAnchor("top");
    }
  }, [verses.data, book, bookName, ch, scrollRoot, chapterNavState, navigate]);

  useEffect(() => {
    if (!verses.data?.length) return;
    const save = () => {
      const now = Date.now();
      if (now - lastSavedAt.current < 1200) return;
      lastSavedAt.current = now;
      updateSession({
        book,
        bookName,
        chapter: ch,
        verse: visibleVerseRef.current,
        progressPercent: articleRef.current
          ? articleScrollProgress(scrollRoot ?? resolveScrollRoot(mainRef.current), articleRef.current)
          : 0,
        scrollY: scrollRoot ? scrollMetrics(scrollRoot).y : window.scrollY,
        lastOpenedAt: now,
      });
    };
    save();
    const onScroll = () => save();
    const unbind = scrollRoot ? bindScroll(scrollRoot, onScroll) : undefined;
    const onHide = () => {
      lastSavedAt.current = 0;
      save();
    };
    window.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      unbind?.();
      window.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [verses.data, book, bookName, ch, scrollRoot]);

  // Palette
  const bgClass = spiritualMode ? "bg-[#08131f] text-[#e8e2cf]" : "bg-[#f4ead8] text-[#3a2410]";
  const surfaceClass = spiritualMode
    ? "bg-[#11223a]/60 border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_22px_-16px_rgba(0,0,0,0.7)]"
    : "bg-white/70 border-[#efe2c4]";
  const verseCardClass = spiritualMode
    ? "bg-[#11223a]/55 border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_6px_18px_-14px_rgba(0,0,0,0.6)]"
    : "bg-white/65 border-[#efe2c4]/80 shadow-[0_6px_18px_-14px_rgba(120,80,30,0.30)]";

  const totalVerses = verses.data?.length ?? 0;

  // Synchronized chrome (scroll rail + auto-scroll pill + bottom dock)
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef<number | null>(null);
  useEffect(() => {
    const show = () => {
      setChromeVisible(true);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), 5000);
    };
    show();
    window.addEventListener("pointerdown", show, { passive: true });
    window.addEventListener("touchstart", show, { passive: true });
    window.addEventListener("keydown", show);
    window.addEventListener("wheel", show, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", show);
      window.removeEventListener("touchstart", show);
      window.removeEventListener("keydown", show);
      window.removeEventListener("wheel", show);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!scrollRoot) return;
    const show = () => {
      setChromeVisible(true);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), 5000);
    };
    return bindScroll(scrollRoot, show);
  }, [scrollRoot]);
  const chromeHidden = !chromeVisible;

  useEffect(() => {
    const root = resolveScrollRoot(mainRef.current);
    setScrollRoot(root);
    root.classList.add("alpha-viewport-scroll--chapter-reader");
    return () => root.classList.remove("alpha-viewport-scroll--chapter-reader");
  }, [book, ch]);

  return (
    <main
      ref={mainRef}
      dir="rtl"
      data-chapter-reader=""
      className={cn(
        "chapter-reader relative w-full min-w-0 transition-colors duration-500",
        bgClass,
        spiritualMode && "reader-spiritual",
      )}
    >
      {/* Cinematic dark cloud atmosphere — soft spiritual bloom (no top bowl) */}
      {spiritualMode && (
        <>
          <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#08131f]/88" />
          {/* drifting cloud diffusion layer — subtle cinematic navy haze */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 mix-blend-screen opacity-[0.10] animate-[abFog_32s_ease-in-out_infinite_alternate]"
            style={{
              background:
                "radial-gradient(45% 30% at 28% 38%, rgba(170,195,230,0.30), transparent 70%)," +
                "radial-gradient(40% 28% at 72% 68%, rgba(150,175,215,0.24), transparent 70%)",
              filter: "blur(50px)",
            }}
          />
        </>
      )}

      <CopticWatermark tone={spiritualMode ? "dark" : "light"} />

      <div
        ref={contentColumnRef}
        className="relative flex w-full min-w-0 max-w-full flex-col px-[var(--alpha-content-padding-x)] pb-44"
      >
        {/* Solid premium header — Agpeya-style, always readable over scroll */}
        <div
          className={cn(
            "sticky top-0 z-40 w-full min-w-0 overflow-hidden rounded-b-[1.35rem] border-x border-b",
            spiritualMode
              ? "border-white/10 bg-[#0b1a2c] text-[#e8e2cf] shadow-[0_10px_28px_-16px_rgba(0,0,0,0.5)]"
              : "border-[#c79356]/25 bg-[#fbf3e1] text-[#3a2410] shadow-[0_10px_24px_-14px_rgba(120,90,40,0.32)]",
          )}
          style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}
        >
          <div className="alpha-toolbar-row relative min-h-11 justify-between px-3 pb-1 pt-0.5" dir="ltr">
            <div className="alpha-toolbar-row__leading">
              <button
                type="button"
                aria-label="مشاركة"
                onClick={() => void handleShareChapter()}
                className={chapterHeaderBtnClass(spiritualMode)}
              >
                <Share2 className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label={chapterIsSaved ? "إلغاء حفظ الإصحاح" : "حفظ الإصحاح"}
                onClick={handleToggleChapterSave}
                className={chapterHeaderBtnClass(spiritualMode, chapterIsSaved)}
              >
                <Bookmark className={cn("h-5 w-5", chapterIsSaved && "fill-current")} strokeWidth={2} />
              </button>
            </div>

            <div className="chapter-reader-header__title-slot" dir="rtl">
              <p
                className={cn(
                  "text-[11px] font-extrabold leading-none tracking-[0.12em]",
                  spiritualMode ? "text-[#c79356]" : "text-[#b8893a]",
                )}
              >
                {isNT ? "العهد الجديد" : "العهد القديم"}
              </p>
              <div className="mt-0.5 flex max-w-full items-center justify-center gap-1.5">
                <h1
                  className={cn(
                    "truncate font-arabic-serif text-[clamp(1rem,4.2vw,1.125rem)] font-extrabold leading-tight",
                    spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]",
                  )}
                >
                  {bookName}
                </h1>
                {chapterIsSaved ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold leading-none",
                      spiritualMode
                        ? "bg-[#f0d78c]/20 text-[#f0d78c]"
                        : "bg-[#5a3d92]/10 text-[#5a3d92]",
                    )}
                  >
                    محفوظ
                  </span>
                ) : null}
              </div>
            </div>

            <div className="alpha-toolbar-row__trailing">
              <button
                type="button"
                aria-label="استماع"
                onClick={handleListen}
                className={chapterHeaderBtnClass(spiritualMode)}
              >
                <Headphones className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="رجوع"
                onClick={goBack}
                className={chapterHeaderBtnClass(spiritualMode)}
              >
                <ChevronLeft className="h-[18px] w-[18px] -scale-x-100" strokeWidth={2} />
              </button>
            </div>
          </div>

          <ChapterVerseProgress
            spiritualMode={spiritualMode}
            totalVerses={totalVerses}
            currentVerse={readingVerse}
            scrollRoot={scrollRoot}
            articleRef={articleRef}
          />
        </div>

        {/* Loading / error */}
        {verses.isLoading && <VerseSkeleton count={6} />}
        {verses.error && (
          <p className="mt-12 text-center text-[12px] text-red-500">
            تعذّر التحميل: {(verses.error as Error)?.message ?? "خطأ غير معروف"}
          </p>
        )}

        {!verses.isLoading && !verses.error && totalVerses > 0 && (
          <article
            ref={articleRef}
            className={cn(
              "mt-3 w-full min-w-0 font-arabic-serif tracking-[0.2px] transition-[font-size,line-height] duration-200 space-y-3.5",
              spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]",
            )}
            style={{ fontSize: `${fontSize}px`, lineHeight, wordSpacing: "0.06em" }}
          >
            <ChapterVerseList
              verses={verses.data!}
              book={book}
              ch={ch}
              bookName={bookName}
              activeVerse={activeVerse}
              spiritualMode={spiritualMode}
              verseCardClass={verseCardClass}
              matchedSet={matchedSet}
              dictIndex={dictIndex}
              dictRenderKey={dictRenderKey}
              isSaved={isSaved}
              registerVerseElement={registerVerseElement}
              onVerseActive={onVerseActive}
              onToggleSaveVerse={onToggleSaveVerse}
              onSelectWord={onSelectWordStable}
              onOpenCrossRef={onOpenCrossRef}
            />
          </article>
        )}

        {/* Chapter nav */}
        <nav
          className={cn(
            "mt-8 flex w-full min-w-0 items-center justify-between border-t pt-5 text-[12px]",
            spiritualMode ? "border-white/10" : "border-[#efe2c4]",
          )}
        >
          {prev ? (
            <button
              type="button"
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => handleAdjacentChapterPress(prev, "bottom", e)}
              className={cn(
                "rounded-full border px-4 py-2 font-bold active:scale-95 transition-transform",
                surfaceClass,
              )}
            >
              → {chapterWithNumber(book, prev)}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              type="button"
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => handleAdjacentChapterPress(next, "top", e)}
              className={cn(
                "rounded-full border px-4 py-2 font-bold active:scale-95 transition-transform",
                surfaceClass,
              )}
            >
              {chapterWithNumber(book, next)} ←
            </button>
          ) : (
            <span />
          )}
        </nav>
      </div>

      <AutoScrollControls
        spiritualMode={spiritualMode}
        onToggleSpiritual={() => setSpiritualMode((s) => !s)}
        scrollContainer={scrollRoot}
        bottomClass="bottom-[88px]"
        hidden={chromeHidden}
        barSize="comfort"
        fontSize={fontSize}
        setFontSize={(n) => setFontSize(Math.max(14, Math.min(34, n)))}
        fontMin={14}
        fontMax={34}
        fontStep={1}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
      />

      {/* Persistent global navigation */}
      <BottomDock hidden={chromeHidden} spiritualMode={spiritualMode} />

      <MeaningSheet data={sheet} onClose={() => setSheet(null)} />
      <DictionaryLookupSheet row={lookupRow} onClose={() => setLookupRow(null)} />
      <DictionaryResultsSheet
        rows={lookupChoices}
        onSelect={(row) => {
          setLookupChoices(null);
          setLookupRow(row);
        }}
        onClose={() => setLookupChoices(null)}
      />
      {toast && (
        <div
          role="status"
          dir="rtl"
          className="fixed left-1/2 -translate-x-1/2 bottom-[120px] z-[80] rounded-full border border-[#7af0b8]/40 bg-[#0a2a20]/85 px-4 py-2 text-[12px] font-bold text-[#eaf6ec] backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toast}
        </div>
      )}
    </main>
  );
}

/* ---------------- Chapter verse progress (in-chapter only) ---------------- */

function ChapterVerseProgress({
  spiritualMode,
  totalVerses,
  currentVerse,
  scrollRoot,
  articleRef,
}: {
  spiritualMode: boolean;
  totalVerses: number;
  currentVerse: number;
  scrollRoot: HTMLElement | null;
  articleRef: React.RefObject<HTMLElement | null>;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const displayed = useRef(0);
  const target = useRef(0);
  const [labelPct, setLabelPct] = useState(0);

  useEffect(() => {
    displayed.current = 0;
    target.current = 0;
    setLabelPct(0);
    if (fillRef.current) fillRef.current.style.width = "0%";
  }, [totalVerses]);

  useEffect(() => {
    const root = scrollRoot ?? document.documentElement;
    const article = articleRef.current;

    const paint = (pct: number) => {
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
      setLabelPct(Math.round(pct));
    };

    const onScroll = () => {
      if (!article) return;
      target.current = articleScrollProgress(root, article);
      if (rafRef.current == null) {
        const tick = () => {
          const diff = target.current - displayed.current;
          displayed.current += diff * 0.2;
          const done = Math.abs(diff) < 0.05;
          if (done) {
            displayed.current = target.current;
            paint(displayed.current);
            rafRef.current = null;
            return;
          }
          paint(displayed.current);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    onScroll();
    const unbind = bindScroll(root, onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      unbind();
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [scrollRoot, articleRef, totalVerses]);

  if (totalVerses <= 0) return null;

  const verseNum = Math.min(Math.max(1, currentVerse), totalVerses);

  return (
    <div className="mt-1 w-full min-w-0 px-3 pb-1" dir="rtl">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-[11px] font-bold tabular-nums",
            spiritualMode ? "text-[#e8d5a0]/90" : "text-[#7a5a32]",
          )}
        >
          الآية {verseNum} من {totalVerses}
        </p>
        <p
          className={cn(
            "text-[11px] font-extrabold tabular-nums",
            spiritualMode ? "text-[#f0d78c]" : "text-[#5a3d92]",
          )}
        >
          {labelPct}% مكتمل
        </p>
      </div>
      <div
        className={cn(
          "flex h-[5px] w-full gap-px overflow-hidden rounded-full",
          spiritualMode ? "bg-white/8" : "bg-[#c79356]/15",
        )}
        role="progressbar"
        aria-valuenow={labelPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`تقدم القراءة ${labelPct}%`}
      >
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className={cn("absolute inset-0", spiritualMode ? "bg-white/10" : "bg-[#c79356]/14")} />
          <div
            ref={fillRef}
            className={cn(
              "absolute inset-y-0 right-0 transition-[width,box-shadow] duration-200 ease-out",
              spiritualMode
                ? "bg-gradient-to-l from-[#f0d78c] via-[#d4af37] to-[#b8893a] shadow-[0_0_12px_rgba(212,175,55,0.75)]"
                : "bg-gradient-to-l from-[#7a5cb0] via-[#9b7fd4] to-[#5a3d92] shadow-[0_0_12px_rgba(122,92,176,0.85)]",
            )}
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Chapter verse list ---------------- */

type ChapterVerseListProps = {
  verses: BibleVerse[];
  book: string;
  ch: number;
  bookName: string;
  activeVerse: string | null;
  spiritualMode: boolean;
  verseCardClass: string;
  matchedSet: Set<string>;
  dictIndex: DictionaryIndex;
  dictRenderKey: string;
  isSaved: (id: string) => boolean;
  registerVerseElement: (num: number, el: HTMLElement | null) => void;
  onVerseActive: (id: string) => void;
  onToggleSaveVerse: (v: Parameters<ReturnType<typeof useSavedVerses>["toggle"]>[0]) => void;
  onSelectWord: (word: string, entry?: DictionaryEntry) => void;
  onOpenCrossRef: (num: number) => void;
};

const ChapterVerseList = memo(function ChapterVerseList({
  verses,
  book,
  ch,
  bookName,
  activeVerse,
  spiritualMode,
  verseCardClass,
  matchedSet,
  dictIndex,
  dictRenderKey,
  isSaved,
  registerVerseElement,
  onVerseActive,
  onToggleSaveVerse,
  onSelectWord,
  onOpenCrossRef,
}: ChapterVerseListProps) {
  const seenChapterWordsRef = useRef(new Set<string>());

  useEffect(() => {
    seenChapterWordsRef.current = new Set();
  }, [dictRenderKey]);

  return (
    <>
      {verses.map((v, i) => {
        const num = v?.verse_number ?? i + 1;
        const id = verseKey(book, ch, num);
        const showRef = i > 0 && i % 7 === 3;
        return (
          <VerseCard
            key={`${id}::${dictRenderKey}`}
            verseId={id}
            verseNum={num}
            book={book}
            bookName={bookName}
            chapter={ch}
            text={v?.verse_text ?? ""}
            isActive={activeVerse === id}
            saved={isSaved(id)}
            spiritualMode={spiritualMode}
            surfaceClass={verseCardClass}
            registerVerseElement={registerVerseElement}
            onVerseActive={onVerseActive}
            onToggleSaveVerse={onToggleSaveVerse}
            onSelectWord={onSelectWord}
            matchedSet={matchedSet}
            dictIndex={dictIndex}
            seenChapterWords={seenChapterWordsRef.current}
            showRef={showRef}
            onOpenCrossRef={onOpenCrossRef}
          />
        );
      })}
    </>
  );
});

/* ---------------- Verse Card ---------------- */

const VerseCard = memo(function VerseCard({
  verseId,
  verseNum,
  book,
  bookName,
  chapter,
  text,
  isActive,
  saved,
  spiritualMode,
  surfaceClass,
  registerVerseElement,
  onVerseActive,
  onToggleSaveVerse,
  onSelectWord,
  matchedSet,
  dictIndex,
  seenChapterWords,
  showRef,
  onOpenCrossRef,
}: {
  verseId: string;
  verseNum: number;
  book: string;
  bookName: string;
  chapter: number;
  text: string;
  isActive: boolean;
  saved: boolean;
  spiritualMode: boolean;
  surfaceClass: string;
  registerVerseElement: (num: number, el: HTMLElement | null) => void;
  onVerseActive: (id: string) => void;
  onToggleSaveVerse: (v: Parameters<ReturnType<typeof useSavedVerses>["toggle"]>[0]) => void;
  onSelectWord: (word: string, entry?: DictionaryEntry) => void;
  matchedSet: Set<string>;
  dictIndex: DictionaryIndex;
  seenChapterWords: Set<string>;
  showRef: boolean;
  onOpenCrossRef: (num: number) => void;
}) {
  const verseRef = useCallback(
    (el: HTMLDivElement | null) => {
      registerVerseElement(verseNum, el);
    },
    [verseNum, registerVerseElement],
  );

  const onTap = useCallback(() => {
    onVerseActive(verseId);
  }, [onVerseActive, verseId]);

  const onToggleSave = useCallback(() => {
    onToggleSaveVerse({
      book,
      bookName,
      chapter,
      verse: verseNum,
      text,
    });
  }, [onToggleSaveVerse, book, bookName, chapter, verseNum, text]);

  const onOpenRef = useCallback(() => {
    onOpenCrossRef(verseNum);
  }, [onOpenCrossRef, verseNum]);

  return (
    <div
      ref={verseRef}
      data-verse-num={verseNum}
      onClick={onTap}
      className={cn(
        "group relative w-full min-w-0 cursor-pointer rounded-2xl border px-3.5 py-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        surfaceClass,
        isActive &&
          (spiritualMode
            ? "scale-[1.015] border-[#7af0b8]/35 ring-1 ring-[#7af0b8]/30 shadow-[0_0_28px_-4px_rgba(122,240,184,0.40),0_0_60px_-20px_rgba(62,180,130,0.45)]"
            : "scale-[1.012] ring-1 ring-[#3eb482]/45 shadow-[0_10px_24px_-14px_rgba(31,110,84,0.45)]"),
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "shrink-0 mt-0.5 min-w-[18px] text-center text-[15px] font-extrabold tabular-nums font-arabic-serif leading-none pt-[2px]",
            spiritualMode ? "text-[#f0d78c]" : "text-[#a87a35]",
          )}
        >
          {verseNum}
        </span>
        <p className="flex-1 min-w-0">
          <VerseHighlighted
            text={text}
            matchedSet={matchedSet}
            dictIndex={dictIndex}
            seenChapterWords={seenChapterWords}
            onSelectWord={onSelectWord}
            spiritualMode={spiritualMode}
          />
          {showRef && (
            <ReferenceIndicator
              count={2}
              onClick={(e?: any) => {
                e?.stopPropagation?.();
                onOpenRef();
              }}
            />
          )}
        </p>
        <button
          type="button"
          aria-label={saved ? "إزالة من المحفوظات" : "حفظ الآية"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={cn(
            "shrink-0 grid h-7 w-7 place-items-center rounded-full border transition-all active:scale-90",
            saved
              ? spiritualMode
                ? "bg-[#e7c97a]/20 border-[#e7c97a]/45 text-[#f0d78c]"
                : "bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] border-transparent text-[#7a4a26]"
              : spiritualMode
                ? "bg-white/5 border-white/10 text-[#c79356] opacity-70 group-hover:opacity-100"
                : "bg-white/70 border-[#efe2c4] text-[#b8893a] opacity-70 group-hover:opacity-100",
          )}
        >
          {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
});

/**
 * Memoized highlight layer. Re-renders when matchedSet identity, text, or
 * theme changes. `seenChapterWords` is a mutable per-chapter Set used for
 * first-occurrence-only dedup; it's intentionally excluded from deps.
 */
const VerseHighlighted = memo(function VerseHighlighted({
  text,
  matchedSet,
  dictIndex,
  seenChapterWords,
  onSelectWord,
  spiritualMode,
}: {
  text: string;
  matchedSet: Set<string>;
  dictIndex: DictionaryIndex;
  seenChapterWords: Set<string>;
  onSelectWord: (word: string, entry?: DictionaryEntry) => void;
  spiritualMode: boolean;
}) {
  return useMemo(
    () => renderVerseTokens(text, matchedSet, dictIndex, seenChapterWords, onSelectWord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, matchedSet, dictIndex, spiritualMode, HMR_EPOCH, onSelectWord],
  );
});

/* ---------------- Verse renderer ---------------- */

/**
 * Token-level renderer driven by a pre-computed `matchedSet` (normalized words
 * that exist in `lookup_dictionary`). Each Arabic-letter run is rendered in
 * its own span; runs whose normalized form is in `matchedSet` AND haven't
 * been highlighted yet in this chapter are wrapped in `HighlightedWord`.
 */
function renderVerseTokens(
  text: string,
  matchedSet: Set<string>,
  dictIndex: DictionaryIndex,
  seenChapterWords: Set<string>,
  onSelect: (word: string, entry?: DictionaryEntry) => void,
): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/([\u0600-\u06FF\u0750-\u077F]+)/g);
  // eslint-disable-next-line no-console
  if ((window as any).__hlDebugOnce !== text) {
    (window as any).__hlDebugOnce = text;
    const wordParts = parts.filter((_, i) => i % 2 === 1);
    const normSample = wordParts.slice(0, 8).map((p) => normalizeAr(p));
    // eslint-disable-next-line no-console
    console.log("[verse-render]", {
      sample: text.slice(0, 60),
      tokens: wordParts.length,
      normSample,
      matchedSetSize: matchedSet.size,
      first20Matched: Array.from(matchedSet).slice(0, 20),
    });
  }
  if (matchedSet.size === 0) {
    return parts.map((p, i) => <span key={i}>{p}</span>);
  }
  const out: React.ReactNode[] = [];
  let hlCount = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (i % 2 === 1) {
      const norm = normalizeAr(p);
      const matchKey = norm && matchedSet.has(norm) ? norm : null;

      if (matchKey && !seenChapterWords.has(matchKey)) {
        seenChapterWords.add(matchKey);
        hlCount++;
        out.push(
          <HighlightedWord
            key={i}
            onSelect={() => {
              const entry = lookupEntry(dictIndex, matchKey);
              onSelect(p, entry);
            }}
          >
            {p}
          </HighlightedWord>,
        );
        continue;
      }
    }
    out.push(<span key={i}>{p}</span>);
  }
  if (hlCount > 0) {
    // eslint-disable-next-line no-console
    console.log("[verse-render] highlighted in verse:", hlCount);
  }
  return out;
}
