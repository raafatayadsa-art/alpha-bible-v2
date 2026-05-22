import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { chaptersQueryOptions, versesQueryOptions } from "@/lib/bible";

export const Route = createFileRoute("/$book/$chapter")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} ${params.chapter} — الكتاب المقدس` },
      { name: "description", content: `${params.book} الإصحاح ${params.chapter}.` },
    ],
  }),
  component: ChapterReader,
});

function ChapterReader() {
  const { book, chapter } = Route.useParams();
  const ch = Number(chapter);
  const verses = useQuery(versesQueryOptions(book, ch));
  const chapters = useQuery(chaptersQueryOptions(book));

  const list = chapters.data ?? [];
  const idx = list.indexOf(ch);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12" dir="rtl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">الأسفار</Link>
        <span className="mx-2">/</span>
        <Link to="/$book" params={{ book }} className="hover:text-foreground">{book}</Link>
      </nav>

      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl text-foreground">
          {book} <span className="text-muted-foreground">·</span> {chapter}
        </h1>
      </header>

      {verses.isLoading && <p className="text-center text-muted-foreground">جارٍ التحميل…</p>}
      {verses.error && (
        <p className="text-center text-destructive">تعذّر التحميل: {(verses.error as Error).message}</p>
      )}

      {verses.data && (
        <article className="space-y-4 font-serif text-2xl leading-loose text-foreground">
          {verses.data.map((v) => (
            <p key={v.ID}>
              <sup className="mx-1 align-super text-xs text-muted-foreground">{v.verse_number}</sup>
              {v.verse_text}
            </p>
          ))}
        </article>
      )}

      <nav className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm">
        {prev ? (
          <Link
            to="/$book/$chapter"
            params={{ book, chapter: String(prev) }}
            className="rounded-md border border-border px-4 py-2 hover:bg-accent"
          >
            → الإصحاح {prev}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/$book/$chapter"
            params={{ book, chapter: String(next) }}
            className="rounded-md border border-border px-4 py-2 hover:bg-accent"
          >
            الإصحاح {next} ←
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
