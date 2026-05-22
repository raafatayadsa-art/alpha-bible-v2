import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, type BibleVerse } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";

export const Route = createFileRoute("/diagnostics")({
  ssr: false,
  head: () => ({ meta: [{ title: "Diagnostics" }] }),
  component: Diagnostics,
});

function Diagnostics() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [booksCount, setBooksCount] = useState<number | null>(null);
  const [chaptersCount, setChaptersCount] = useState<number | null>(null);
  const [versesCount, setVersesCount] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [sampleVerse, setSampleVerse] = useState<BibleVerse | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastQueryResult, setLastQueryResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { count: vCount, error: vErr } = await supabase
          .from("bible_verses")
          .select("*", { count: "exact", head: true });
        if (vErr) throw vErr;
        setVersesCount(vCount ?? 0);

        const { data: booksData, error: bErr } = await supabase
          .from("bible_verses")
          .select("book_name")
          .order("book_name", { ascending: true });
        if (bErr) throw bErr;
        const uniq = new Set<string>();
        for (const r of booksData ?? []) uniq.add((r as { book_name: string }).book_name);
        setBooksCount(uniq.size);

        const firstBook = booksData?.[0]?.book_name ?? null;
        setSelectedBook(firstBook);

        if (firstBook) {
          const { data: chData, error: cErr } = await supabase
            .from("bible_verses")
            .select("chapter_number")
            .eq("book_name", firstBook);
          if (cErr) throw cErr;
          const chSet = new Set<number>();
          for (const r of chData ?? []) chSet.add((r as { chapter_number: number }).chapter_number);
          setChaptersCount(chSet.size);

          const { data: vData, error: sErr } = await supabase
            .from("bible_verses")
            .select("ID, book_name, chapter_number, verse_number, verse_text")
            .eq("book_name", firstBook)
            .order("chapter_number", { ascending: true })
            .order("verse_number", { ascending: true })
            .limit(1);
          if (sErr) throw sErr;
          const first = (vData?.[0] ?? null) as BibleVerse | null;
          setSampleVerse(first);
          setSelectedChapter(first?.chapter_number ?? null);
          setLastQueryResult(`${vData?.length ?? 0} row(s) from bible_verses where book_name = "${firstBook}"`);
        }

        setStatus("ok");
      } catch (e) {
        setStatus("error");
        setLastError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground text-right break-all">{v ?? "—"}</span>
    </div>
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-12" dir="ltr">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      <h1 className="mt-4 mb-6 font-serif text-3xl text-foreground">Diagnostics</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <Row k="Supabase URL" v={SUPABASE_URL} />
        <Row k="Connection status" v={status} />
        <Row k="Total books" v={booksCount} />
        <Row k="Total chapters (selected book)" v={chaptersCount} />
        <Row k="Total verses" v={versesCount} />
        <Row k="Selected book" v={selectedBook} />
        <Row k="Selected chapter" v={selectedChapter} />
        <Row k="Last query result" v={lastQueryResult} />
        <Row k="Last fetch error" v={lastError} />
        <Row
          k="Sample first verse"
          v={
            sampleVerse
              ? `${sampleVerse.book_name} ${sampleVerse.chapter_number}:${sampleVerse.verse_number} — ${sampleVerse.verse_text}`
              : null
          }
        />
      </div>
    </main>
  );
}
