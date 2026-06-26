import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, LoaderCircle, Mic2 } from "lucide-react";
import {
  fetchCanCreatePublisherApplication,
  fetchMyPublishers,
  PUBLISHER_STATUS_LABELS,
  PUBLISHER_TYPE_LABELS,
  type PublisherRecord,
} from "@/features/publisher";

export const Route = createFileRoute("/publisher/")({
  ssr: false,
  head: () => ({
    meta: [{ title: "صفحات الناشر — Alpha" }],
  }),
  component: PublisherHubPage,
});

function PublisherHubPage() {
  const [rows, setRows] = useState<PublisherRecord[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchMyPublishers(), fetchCanCreatePublisherApplication()]).then(
      ([items, allowCreate]) => {
        setRows(items);
        setCanCreate(allowCreate);
        setLoading(false);
      },
    );
  }, []);

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
        <h1 className="text-[15px] font-extrabold text-[#3a3258]">صفحات الناشر</h1>
        <span className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-[var(--alpha-content-max-width)] space-y-4 px-4 pt-4">
        {canCreate ? (
          <Link
            to="/publisher/apply"
            className="flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-extrabold text-white"
            style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
          >
            <Mic2 className="h-4 w-4" />
            طلب صفحة ناشر جديدة
          </Link>
        ) : !loading ? (
          <p className="rounded-[20px] border border-[rgba(93,50,145,0.12)] bg-white/90 px-4 py-3 text-center text-[11px] font-bold leading-relaxed text-[#6b658a]">
            لديك صفحة ناشر بالفعل — صفحة واحدة لكل مستخدم. يمكنك إضافة مساعدين من داخل المساحة.
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-[#5D3291]" />
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <Link
                key={row.id}
                to="/publisher/workspace/$publisherId"
                params={{ publisherId: row.id }}
                className="block rounded-[20px] border border-[rgba(93,50,145,0.12)] bg-white/92 p-4 active:scale-[0.99]"
              >
                <p className="text-[13px] font-extrabold text-[#3a3258]">{row.name}</p>
                <p className="mt-1 text-[10px] font-bold text-[#6b658a]">
                  {PUBLISHER_TYPE_LABELS[row.publisherType]} · {PUBLISHER_STATUS_LABELS[row.status]}
                  {row.accessRole === "assistant" ? " · مساعد" : ""}
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#5D3291]">جاهزية {row.readinessScore}%</p>
                {row.status === "published" ? (
                  <p className="mt-1 text-[10px] font-extrabold text-emerald-700">منشورة — افتح المساحة أو الصفحة العامة</p>
                ) : null}
              </Link>
            ))}
            {!rows.length && canCreate ? (
              <p className="py-8 text-center text-[11px] font-bold text-[#6b658a]">
                لا توجد صفحات ناشر بعد — ابدأ بطلب جديد.
              </p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
