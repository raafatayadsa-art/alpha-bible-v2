import { createFileRoute, redirect } from "@tanstack/react-router";
import { BooksV2Screen } from "@/features/books-v2";

export const Route = createFileRoute("/books-v2")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const raw = String(search.testament ?? "").toLowerCase();
    const testament = raw === "old" || raw === "new" ? (raw as "old" | "new") : undefined;
    return { testament };
  },
  beforeLoad: ({ search }) => {
    if (search.testament !== "old" && search.testament !== "new") {
      throw redirect({ to: "/books-v2", search: { testament: "new" }, replace: true });
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
  component: BooksV2Page,
});

function BooksV2Page() {
  const { testament } = Route.useSearch();
  return <BooksV2Screen testament={testament ?? "new"} />;
}
