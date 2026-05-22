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
      <div className="mb-6">
        <Link
          to="/$book"
          params={{ book }}
          className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
        >
          → رجوع إلى الإصحاحات
        </Link>
      </div>

      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl text-foreground">
          {book} <span className="text-muted-foreground">·</span> {chapter}
        </h1>
      </header>

      {verses.isLoading && (
        <p className="text-center text-muted-foreground">جاري تحميل الآيات...</p>
      )}
      {verses.error && (
        <p className="text-center text-destructive">
          تعذّر التحميل: {(verses.error as Error)?.message ?? "خطأ غير معروف"}
        </p>
      )}
      {!verses.isLoading && !verses.error && (verses.data?.length ?? 0) === 0 && (
        <p className="text-center text-muted-foreground">لا توجد آيات</p>
      )}

      {(verses.data?.length ?? 0) > 0 && (
        <article className="space-y-4 font-serif text-2xl leading-loose text-foreground">
          {verses.data?.map((v, i) => (
            <p key={v?.ID ?? `${ch}-${v?.verse_number ?? i}`}>
              <sup className="mx-1 align-super text-xs text-muted-foreground">
                {v?.verse_number ?? ""}
              </sup>
              {v?.verse_text ?? ""}
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
