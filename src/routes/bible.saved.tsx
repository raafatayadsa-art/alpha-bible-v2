import { createFileRoute } from "@tanstack/react-router";
import { SavedVersesPremiumScreen } from "@/features/bible-saved";

export const Route = createFileRoute("/bible/saved")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
    tab: search.tab === "highlights" ? ("highlights" as const) : ("saved" as const),
  }),
  head: () => ({
    meta: [
      { title: "المحفوظات — Alpha Bible" },
      { name: "description", content: "آياتك المحفوظة والملوّنة — خزينة Alpha Bible." },
    ],
  }),
  component: SavedVersesPage,
});

function SavedVersesPage() {
  const { tab } = Route.useSearch();
  return <SavedVersesPremiumScreen backTo="/bible" fromBible2 initialTab={tab} />;
}
