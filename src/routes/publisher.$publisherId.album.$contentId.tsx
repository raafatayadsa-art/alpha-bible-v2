import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import {
  fetchApprovedPublisherContent,
  fetchPublishedContentById,
  PublisherAlbumDetailView,
} from "@/features/publisher";

export const Route = createFileRoute("/publisher/$publisherId/album/$contentId")({
  ssr: false,
  loader: async ({ params }) => {
    const result = await fetchPublishedContentById(params.contentId);
    if (
      !result ||
      result.publisher.id !== params.publisherId ||
      (result.item.contentKind !== "album" && result.item.contentKind !== "playlist")
    ) {
      throw notFound();
    }
    const allContent = await fetchApprovedPublisherContent(params.publisherId);
    const hymns = allContent.filter((c) => c.contentKind === "hymn");
    return { publisher: result.publisher, album: result.item, hymns };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.album ? `${loaderData.album.title} — ألفا` : "ألبوم — ألفا" }],
  }),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-[#F5F2ED] p-6 text-center">
      <p className="text-[14px] font-extrabold text-[#3a3258]">الألبوم غير متاح</p>
      <Link to="/audio" className="mt-3 text-[12px] font-bold text-[#5D3291] underline">
        العودة للصوتيات
      </Link>
    </div>
  ),
  component: AlbumDetailPage,
});

function AlbumDetailPage() {
  const { publisher, album, hymns } = Route.useLoaderData();

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F2ED] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-2xl border-b border-[rgba(93,50,145,0.12)] bg-[rgba(245,242,237,0.92)]">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full border bg-white/85 text-[#3a3258] active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </button>
        <h1 className="max-w-[60%] truncate text-[15px] font-extrabold text-[#3a3258]">{album.title}</h1>
        <span className="w-10" />
      </header>
      <main className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">
        <PublisherAlbumDetailView publisher={publisher} album={album} hymnItems={hymns} />
      </main>
    </div>
  );
}
