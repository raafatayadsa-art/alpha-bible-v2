import { createFileRoute } from "@tanstack/react-router";
import { SavedVersesPremiumScreen } from "@/features/bible-saved";

export const Route = createFileRoute("/bible/saved")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  head: () => ({
    meta: [
      { title: "المحفوظات — Alpha Bible" },
      { name: "description", content: "آياتك المحفوظة — خزينة Alpha Bible." },
    ],
  }),
  component: SavedVersesPage,
});

function SavedVersesPage() {
  return <SavedVersesPremiumScreen backTo="/bible" fromBible2 />;
}
