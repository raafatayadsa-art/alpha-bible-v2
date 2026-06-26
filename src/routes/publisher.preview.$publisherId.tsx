import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  fetchPublisherById,
  fetchPublisherContent,
  PublisherPublicPageView,
  PublisherPublicShell,
  type PublisherContentItem,
  type PublisherRecord,
} from "@/features/publisher";

export const Route = createFileRoute("/publisher/preview/$publisherId")({
  ssr: false,
  component: PublisherPreviewRoute,
});

function PublisherPreviewRoute() {
  const { publisherId } = Route.useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState<PublisherRecord | null>(null);
  const [content, setContent] = useState<PublisherContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [pub, items] = await Promise.all([
        fetchPublisherById(publisherId),
        fetchPublisherContent(publisherId),
      ]);
      setPublisher(pub);
      setContent(items);
      setLoading(false);
    })();
  }, [publisherId]);

  if (loading) {
    return (
      <main dir="rtl" className="grid min-h-dvh place-items-center bg-[#F4EEE6]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#5D3291]" />
      </main>
    );
  }

  if (!publisher) {
    return (
      <main dir="rtl" className="grid min-h-dvh place-items-center bg-[#F4EEE6] p-6 text-center">
        <p className="text-[13px] font-extrabold text-[#3a3258]">لم نجد الصفحة.</p>
        <Link
          to="/publisher/workspace/$publisherId"
          params={{ publisherId }}
          className="mt-2 text-[12px] font-bold text-[#5D3291] underline"
        >
          العودة للمساحة
        </Link>
      </main>
    );
  }

  return (
    <PublisherPublicShell
      publisherName={`معاينة — ${publisher.name}`}
      coverUrl={publisher.coverUrl}
      logoUrl={publisher.logoUrl}
      backLabel="رجوع للمساحة"
      onBack={() => {
        void navigate({ to: "/publisher/workspace/$publisherId", params: { publisherId } });
      }}
    >
      <PublisherPublicPageView publisher={publisher} content={content} preview />
    </PublisherPublicShell>
  );
}
