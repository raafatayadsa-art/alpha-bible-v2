import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  fetchApprovedPublisherContent,
  fetchPublishedPublisher,
  PublisherPublicPageView,
  PublisherPublicShell,
} from "@/features/publisher";

export const Route = createFileRoute("/publisher/$publisherId")({
  ssr: false,
  loader: async ({ params }) => {
    const publisher = await fetchPublishedPublisher(params.publisherId);
    if (!publisher) throw notFound();
    const content = await fetchApprovedPublisherContent(params.publisherId);
    return { publisher, content };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.publisher ? `${loaderData.publisher.name} — ألفا` : "صفحة الناشر — ألفا",
      },
      {
        name: "description",
        content: loaderData?.publisher?.bio ?? loaderData?.publisher?.name ?? "صفحة ناشر",
      },
    ],
  }),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-[#F4EEE6] p-6 text-center">
      <div>
        <p className="mb-2 text-[15px] font-extrabold text-[#3a3258]">هذه الصفحة غير منشورة</p>
        <Link to="/audio" className="text-[12px] font-bold text-[#5D3291] underline">
          العودة إلى الصوتيات
        </Link>
      </div>
    </div>
  ),
  component: PublicPublisherPage,
});

function PublicPublisherPage() {
  const { publisher, content } = Route.useLoaderData();

  return (
    <PublisherPublicShell
      publisherName={publisher.name}
      coverUrl={publisher.coverUrl}
      logoUrl={publisher.logoUrl}
    >
      <PublisherPublicPageView publisher={publisher} content={content} />
    </PublisherPublicShell>
  );
}
