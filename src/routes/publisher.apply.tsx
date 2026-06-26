import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { PublisherApplyForm, fetchCanCreatePublisherApplication } from "@/features/publisher";

export const Route = createFileRoute("/publisher/apply")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "طلب صفحة ناشر — Alpha" },
      { name: "description", content: "طلب إنشاء صفحة ناشر خاصة" },
    ],
  }),
  component: PublisherApplyPage,
});

function PublisherApplyPage() {
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(true);

  useEffect(() => {
    void fetchCanCreatePublisherApplication().then((ok) => {
      setCanCreate(ok);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2ED]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#5D3291]" />
      </div>
    );
  }

  if (!canCreate) {
    return <Navigate to="/publisher" replace />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F2ED] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-2xl border-b border-[rgba(93,50,145,0.12)] bg-[rgba(245,242,237,0.92)]">
        <Link
          to="/profile"
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full border bg-white/85 text-[#3a3258] active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#3a3258]">صفحة ناشر</h1>
        <span className="w-10" />
      </header>
      <main className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">
        <PublisherApplyForm />
      </main>
    </div>
  );
}
