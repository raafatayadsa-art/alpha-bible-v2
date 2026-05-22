import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchBooks } from "@/lib/bible";

const SUPABASE_URL = "https://usflbjlyadihyitnvzya.supabase.co";

export const Route = createFileRoute("/diagnostics")({
  ssr: false,
  head: () => ({ meta: [{ title: "Diagnostics" }] }),
  component: Diagnostics,
});

function Diagnostics() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [booksCount, setBooksCount] = useState<number | null>(null);
  const [versesCount, setVersesCount] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastQueryResult, setLastQueryResult] = useState<string | null>(null);
  const [books, setBooks] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { count, error: vErr } = await supabase
          .from("bible_verses")
          .select("*", { count: "exact", head: true });
        if (vErr) throw vErr;
        setVersesCount(count ?? 0);

        const uniq = await fetchBooks();
        setBooks(uniq);
        setBooksCount(uniq.length);
        setLastQueryResult(
          `unique book_name list: ${uniq.length} books (first: ${uniq[0] ?? "—"})`,
        );
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
        <Row k="Total books (unique)" v={booksCount} />
        <Row k="Total verses" v={versesCount} />
        <Row k="Selected book" v="(none — choose from home)" />
        <Row k="Selected chapter" v="(none — choose from book page)" />
        <Row k="Last query result" v={lastQueryResult} />
        <Row k="Last fetch error" v={lastError} />
      </div>
      {books.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Unique book names
          </h2>
          <ul className="space-y-1 text-sm text-foreground">
            {books.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
