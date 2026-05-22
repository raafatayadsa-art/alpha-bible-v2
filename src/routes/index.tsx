import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { booksQueryOptions, DEFAULT_LANGUAGE, DEFAULT_TRANSLATION } from "@/lib/bible";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الكتاب المقدس — Alpha Bible" },
      { name: "description", content: "اقرأ الكتاب المقدس بالعربية (ترجمة فاندايك) والإنجليزية." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(booksQueryOptions(DEFAULT_LANGUAGE, DEFAULT_TRANSLATION)),
  component: BooksIndex,
});

function BooksIndex() {
  const { data: books } = useSuspenseQuery(booksQueryOptions(DEFAULT_LANGUAGE, DEFAULT_TRANSLATION));

  const old = books.filter((b) => /old|ot|عهد قديم|قديم/i.test(b.testament));
  const nt = books.filter((b) => !old.includes(b));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-5xl tracking-tight text-foreground">الكتاب المقدس</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Alpha Bible · ترجمة فاندايك
        </p>
      </header>

      <Section title="العهد القديم" books={old} />
      <Section title="العهد الجديد" books={nt} />
    </main>
  );
}

function Section({
  title,
  books,
}: {
  title: string;
  books: { book: string; chapters: number }[];
}) {
  if (books.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="mb-4 border-b border-border pb-2 font-serif text-2xl text-foreground">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {books.map((b) => (
          <li key={b.book}>
            <Link
              to="/$book"
              params={{ book: b.book }}
              className="block rounded-md border border-border bg-card px-4 py-3 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="font-serif text-lg">{b.book}</div>
              <div className="text-xs text-muted-foreground">{b.chapters} إصحاح</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
