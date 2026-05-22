import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { chaptersQueryOptions } from "@/lib/bible";

export const Route = createFileRoute("/$book")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} — الكتاب المقدس` },
      { name: "description", content: `اختر إصحاحًا من سفر ${params.book}.` },
    ],
  }),
  component: ChaptersPage,
});

function ChaptersPage() {
  const { book } = Route.useParams();
  const { data: chapters, isLoading, error } = useQuery(chaptersQueryOptions(book));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← كل الأسفار</Link>
      </nav>
      <h1 className="mb-8 font-serif text-4xl text-foreground">{book}</h1>

      {isLoading && <p className="text-muted-foreground">جارٍ التحميل…</p>}
      {error && <p className="text-destructive">تعذّر التحميل: {(error as Error).message}</p>}

      {chapters && (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {chapters.map((c) => (
            <li key={c}>
              <Link
                to="/$book/$chapter"
                params={{ book, chapter: String(c) }}
                className="flex aspect-square items-center justify-center rounded-md border border-border bg-card font-serif text-lg text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
