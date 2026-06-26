import { createFileRoute } from "@tanstack/react-router";
import { BibleJourneyScreen } from "@/features/bible-journey";

export const Route = createFileRoute("/bible/journey")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  head: () => ({
    meta: [
      { title: "رحلتي مع الكتاب المقدس — Alpha Bible" },
      {
        name: "description",
        content: "تقدّمك الهادئ في قراءة الكتاب المقدس — العهدان، خريطة الأسفار، والإحصائيات الروحية.",
      },
    ],
  }),
  component: BibleJourneyPage,
});

function BibleJourneyPage() {
  return <BibleJourneyScreen backTo="/bible" fromBible2 />;
}
