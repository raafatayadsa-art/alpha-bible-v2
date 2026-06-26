import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy books URL — canonical route is `/books`. */
export const Route = createFileRoute("/books-v2")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const raw = String(search.testament ?? "").toLowerCase();
    const testament = raw === "old" || raw === "new" ? (raw as "old" | "new") : undefined;
    return { testament };
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/books",
      search: { testament: search.testament ?? "new" },
      replace: true,
    });
  },
  component: () => null,
});
