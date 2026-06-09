import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/bible/search")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "البحث في الكتاب — Alpha Bible" },
      { name: "description", content: "ابحث في الكتاب المقدس." },
    ],
  }),
  component: BibleSearchEntry,
});

function BibleSearchEntry() {
  return <Navigate to="/bible" replace state={{ openBibleSearch: true }} />;
}
