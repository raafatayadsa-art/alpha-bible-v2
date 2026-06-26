import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ChevronLeft, ImageIcon, Layers } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { BackButton } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark } from "@/components/coptic";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation/AlphaHeader";
import { SAINT_GALLERY_STATUS_LABEL } from "@/features/saint-gallery";
import { formatProfileDate } from "@/features/profile/profile-privacy";
import {
  platformContributionKindLabel,
  platformContributionStatusLabel,
  saintStatusAccent,
  useMyProfileContributions,
} from "@/features/profile/profile-contributions-api";

export const Route = createFileRoute("/profile/contributions")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — مساهماتي" },
      { name: "description", content: "متابعة مساهماتك في Alpha — صور القديسين وطلبات أخرى." },
    ],
  }),
  component: ProfileContributionsScreen,
});

function ProfileContributionsScreen() {
  const { data, isPending } = useMyProfileContributions();
  const saintImages = data?.saintImages ?? [];
  const platformItems = data?.platformItems ?? [];
  const total = data?.total ?? 0;

  return (
    <div dir="rtl" className="relative min-h-dvh bg-alpha-base text-alpha">
      <CopticWatermark />
      <AlphaHeaderShell>
        <AlphaHeader variant="internal" title="مساهماتي" subtitle="الصور · السنكسار · الطلبات" />
      </AlphaHeaderShell>

      <main
        className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        <div className="mt-2 flex items-center justify-between">
          <BackButton compact to="/profile" />
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#6a543a]">
            <ImageIcon className="h-4 w-4 text-[#b8893a]" />
            {total} مساهمة
          </div>
        </div>

        {isPending ? (
          <p className="mt-6 text-center text-[12px] text-[#6a543a]">جاري التحميل...</p>
        ) : total === 0 ? (
          <div className="mt-4 rounded-2xl border border-[#ead9b1] bg-white/85 p-6 text-center">
            <Camera className="mx-auto h-8 w-8 text-[#b8893a]" />
            <p className="mt-3 text-[13px] font-bold text-[#3a2a18]">لا توجد مساهمات بعد</p>
            <p className="mt-1 text-[11.5px] text-[#6a543a]">افتح أي سيرة قديس في السنكسار واضغط «إضافة صورة».</p>
            <Link
              to="/synaxarium"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] px-4 h-10 text-[12px] font-bold text-white"
            >
              الذهاب إلى السنكسار
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {saintImages.length > 0 ? (
              <section className="mt-4">
                <div className="flex items-center gap-2">
                  <CopticCross className="text-[#b8893a]" size={14} />
                  <h2 className="text-[14px] font-extrabold text-[#3a2a18]">صور القديسين</h2>
                  <span className="text-[10px] font-bold text-[#9a7e5a]">({saintImages.length})</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {saintImages.map((item) => (
                    <Link
                      key={`thumb-${item.id}`}
                      to="/synaxarium/$saintId"
                      params={{ saintId: item.saintId }}
                      className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-[#ead9b1] bg-white active:scale-[0.98] transition-transform"
                    >
                      <img src={item.publicUrl} alt="" className="h-full w-full object-cover" />
                      <span
                        className="absolute bottom-1 right-1 rounded-full px-1.5 py-0.5 text-[7.5px] font-extrabold text-white"
                        style={{ background: `${saintStatusAccent(item.status)}cc` }}
                      >
                        {SAINT_GALLERY_STATUS_LABEL[item.status]}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 space-y-2.5">
                  {saintImages.map((item) => (
                    <Link
                      key={item.id}
                      to="/synaxarium/$saintId"
                      params={{ saintId: item.saintId }}
                      className="flex gap-3 rounded-2xl border border-[#ead9b1] bg-white/90 p-2.5 active:scale-[0.99] transition-transform"
                    >
                      <img src={item.publicUrl} alt="" className="h-20 w-16 rounded-xl object-cover border border-[#efe2c4]" />
                      <div className="flex-1 min-w-0 text-right py-0.5">
                        <p className="text-[12.5px] font-extrabold text-[#3a2a18] line-clamp-1">
                          {item.title ?? "صورة بدون عنوان"}
                        </p>
                        <p className="mt-1 text-[11px] font-bold" style={{ color: saintStatusAccent(item.status) }}>
                          {SAINT_GALLERY_STATUS_LABEL[item.status]}
                        </p>
                        {item.rejectionReason ? (
                          <p className="mt-1 text-[10.5px] text-[#b54545] line-clamp-2">{item.rejectionReason}</p>
                        ) : null}
                        <p className="mt-1 text-[10px] text-[#6a543a]">
                          {formatProfileDate(item.createdAt) ?? item.createdAt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {platformItems.length > 0 ? (
              <section className="mt-6">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#6a4ab5]" />
                  <h2 className="text-[14px] font-extrabold text-[#3a2a18]">طلبات ومساهمات أخرى</h2>
                  <span className="text-[10px] font-bold text-[#9a7e5a]">({platformItems.length})</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {platformItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-[#ead9b1] bg-white/90 p-2.5"
                    >
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="" className="h-16 w-16 rounded-xl object-cover border border-[#efe2c4]" />
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-xl border border-[#efe2c4] bg-[#f8f0e4] text-lg font-black text-[#6a4ab5]">
                          Ⲁ
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-right py-0.5">
                        <p className="text-[12.5px] font-extrabold text-[#3a2a18] line-clamp-2">{item.title}</p>
                        <p className="mt-1 text-[10.5px] font-bold text-[#6a4ab5]">
                          {platformContributionKindLabel(item.kind)}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-[#b8893a]">
                          {platformContributionStatusLabel(item.status)}
                        </p>
                        {item.rejectionReason ? (
                          <p className="mt-1 text-[10.5px] text-[#b54545] line-clamp-2">{item.rejectionReason}</p>
                        ) : null}
                        <p className="mt-1 text-[10px] text-[#6a543a]">
                          {formatProfileDate(item.createdAt) ?? item.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>

      <BottomDock />
    </div>
  );
}
