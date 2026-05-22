import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { booksQueryOptions } from "@/lib/bible";
import { groupBooks } from "@/lib/bible-books";

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

function BookGrid({ books }: { books: string[] }) {
  return (
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
  );
}

function Section({ title, books }: { title: string; books: string[] }) {
  if (!books.length) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-serif text-2xl text-foreground">
        <span className="text-muted-foreground">·</span> {title}
      </h2>
      <BookGrid books={books} />
    </section>
  );
}

function BooksIndex() {
  const { data: books, isLoading, error } = useQuery(booksQueryOptions());

  const grouped = books ? groupBooks(books) : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-5xl tracking-tight text-foreground">الكتاب المقدس</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">Alpha Bible</p>
      </header>

      {isLoading && (
        <p className="text-center text-muted-foreground">جارٍ تحميل الأسفار…</p>
      )}
      {error && (
        <p className="text-center text-destructive">
          تعذّر تحميل الأسفار: {(error as Error).message}
        </p>
      )}
      {!isLoading && !error && books && books.length === 0 && (
        <p className="text-center text-muted-foreground">لا توجد أسفار متاحة.</p>
      )}

      {grouped && (
        <>
          <Section title="العهد القديم" books={grouped.old} />
          <Section title="العهد الجديد" books={grouped.neu} />
          <Section title="أخرى" books={grouped.other} />
        </>
      )}

      <div className="mt-12 text-center">
        <Link to="/diagnostics" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          Diagnostics
        </Link>
      </div>
    </main>
  );
}
