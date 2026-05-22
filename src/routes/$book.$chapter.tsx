import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  chaptersQueryOptions,
  versesQueryOptions,
  DEFAULT_LANGUAGE,
  DEFAULT_TRANSLATION,
} from "@/lib/bible";

export const Route = createFileRoute("/$book/$chapter")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} ${params.chapter} — الكتاب المقدس` },
      { name: "description", content: `${params.book} الإصحاح ${params.chapter} — ترجمة فاندايك.` },
    ],
  }),
  loader: ({ context, params }) => {
    const ch = Number(params.chapter);
    return Promise.all([
      context.queryClient.ensureQueryData(
        versesQueryOptions(params.book, ch, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION),
      ),
      context.queryClient.ensureQueryData(
        chaptersQueryOptions(params.book, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION),
      ),
    ]);
  },
  component: ChapterReader,
});

function ChapterReader() {
  const { book, chapter } = Route.useParams();
  const ch = Number(chapter);
  const { data: verses } = useSuspenseQuery(
    versesQueryOptions(book, ch, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION),
  );
  const { data: chapters } = useSuspenseQuery(
    chaptersQueryOptions(book, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION),
  );

  const idx = chapters.indexOf(ch);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12" dir="rtl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          الأسفار
        </Link>
        <span className="mx-2">/</span>
        <Link to="/$book" params={{ book }} className="hover:text-foreground">
          {book}
        </Link>
      </nav>

      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl text-foreground">
          {book} <span className="text-muted-foreground">·</span> {chapter}
        </h1>
      </header>

      <article className="space-y-4 font-serif text-2xl leading-loose text-foreground">
        {verses.map((v) => (
          <p key={v.id} className="indent-0">
            <sup className="mx-1 align-super text-xs text-muted-foreground">{v.verse}</sup>
            {v.text}
          </p>
        ))}
      </article>

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
