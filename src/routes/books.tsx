import { createFileRoute, redirect } from "@tanstack/react-router";
import { BooksV2Screen } from "@/features/books-v2";

export const Route = createFileRoute("/books")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const raw = String(search.testament ?? "").toLowerCase();
    const testament = raw === "old" || raw === "new" ? (raw as "old" | "new") : undefined;
    return { testament };
  },
  beforeLoad: ({ search }) => {
    if (search.testament !== "old" && search.testament !== "new") {
      throw redirect({ to: "/books", search: { testament: "new" }, replace: true });
    }
  },
  head: ({ search }) => ({
    meta: [
      {
        title:
          search.testament === "old"
            ? "العهد القديم — الأسفار"
            : "العهد الجديد — الأسفار",
      },
      { name: "description", content: "تصفّح أسفار الكتاب المقدس بتصميم فاخر." },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { testament } = Route.useSearch();
  return <BooksV2Screen testament={testament ?? "new"} />;
}
