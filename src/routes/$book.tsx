import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { chaptersQueryOptions, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION } from "@/lib/bible";

export const Route = createFileRoute("/$book")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} — الكتاب المقدس` },
      { name: "description", content: `اختر إصحاحًا من سفر ${params.book}.` },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      chaptersQueryOptions(params.book, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION),
    ),
  component: ChaptersPage,
});

function ChaptersPage() {
  const { book } = Route.useParams();
  const { data: chapters } = useSuspenseQuery(
    chaptersQueryOptions(book, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION),
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          ← كل الأسفار
        </Link>
      </nav>
      <h1 className="mb-8 font-serif text-4xl text-foreground">{book}</h1>
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
    </main>
  );
}
