import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import {
  fetchChurchDirectoryFullDetails,
  pushRecentChurchId,
} from "@/features/church-directory";
import { ChurchDirectoryFullDetailView } from "@/features/church-directory/components/ChurchDirectoryFullDetailView";

export const Route = createFileRoute("/church/directory/$placeId")({
  ssr: false,
  loader: async ({ params }) => {
    const church = await fetchChurchDirectoryFullDetails(params.placeId);
    if (!church) throw notFound();
    return { church };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.church ? `${loaderData.church.name} — ألفا` : "تفاصيل — ألفا" },
      { name: "description", content: loaderData?.church?.name ?? "تفاصيل الكنيسة" },
    ],
  }),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-[#F5F2ED] text-center p-6">
      <div>
        <p className="text-[15px] font-extrabold text-[#3a3258] mb-2">لم نجد هذه الكنيسة</p>
        <Link to="/church/directory" className="text-[12px] font-bold text-[#5D3291] underline">
          العودة إلى الدليل
        </Link>
      </div>
    </div>
  ),
  component: PlaceDetailsScreen,
});

function PlaceDetailsScreen() {
  const { church } = Route.useLoaderData();

  useEffect(() => {
    pushRecentChurchId(church.id);
  }, [church.id]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F2ED] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-2xl border-b border-[rgba(93,50,145,0.12)] bg-[rgba(245,242,237,0.92)]">
        <Link
          to="/church/directory"
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full border bg-white/85 text-[#3a3258] active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#3a3258]">تفاصيل الكنيسة</h1>
        <span className="w-10" />
      </header>
      <main className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">
        <ChurchDirectoryFullDetailView church={church} />
      </main>
    </div>
  );
}
