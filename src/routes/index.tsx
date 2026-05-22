import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { booksQueryOptions } from "@/lib/bible";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الكتاب المقدس — Alpha Bible" },
      { name: "description", content: "اقرأ الكتاب المقدس — اختر سفراً للبدء." },
    ],
  }),
  component: BooksIndex,
});

function BooksIndex() {
  const { data: books, isLoading, error } = useQuery(booksQueryOptions());

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-5xl tracking-tight text-foreground">الكتاب المقدس</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">Alpha Bible</p>
      </header>

      {isLoading && <p className="text-center text-muted-foreground">جارٍ التحميل…</p>}
      {error && (
        <p className="text-center text-destructive">تعذّر تحميل الأسفار: {(error as Error).message}</p>
      )}

      {books && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {books.map((b) => (
            <li key={b}>
              <Link
                to="/$book"
                params={{ book: b }}
                className="block rounded-md border border-border bg-card px-4 py-3 font-serif text-lg text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {b}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
