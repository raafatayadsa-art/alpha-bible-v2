import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { booksQueryOptions } from "@/lib/bible";
import { displayName } from "@/lib/bible-books";

export const Route = createFileRoute("/bible/psalms")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "المزامير — Alpha Bible" },
      { name: "description", content: "تصفّح سفر المزامير." },
    ],
  }),
  component: BiblePsalmsRedirect,
});

function BiblePsalmsRedirect() {
  const { data: books, isLoading } = useQuery(booksQueryOptions());
  const psalmsBook = books?.find((b) => displayName(b).includes("مزامير"));

  if (isLoading) return null;

  if (psalmsBook) {
    return <Navigate to="/$book" params={{ book: psalmsBook }} replace />;
  }

  return <Navigate to="/books" search={{ testament: "old" }} replace />;
}
