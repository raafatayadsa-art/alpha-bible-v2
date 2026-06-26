import type { AudioPublisherCardModel } from "@/features/publisher/publisher-discovery-api";
import { AudioPublisherCard } from "./AudioPublisherCard";
import { SectionHeader } from "./SectionHeader";

type Props = {
  publishers: AudioPublisherCardModel[];
  loading?: boolean;
};

export function AudioPublishersSection({ publishers, loading }: Props) {
  return (
    <section className="mt-8 space-y-3">
      <SectionHeader title="الكورالات والمرنمون" />

      <div dir="rtl" className="space-y-2.5 px-5">
        {loading ? (
          <p className="rounded-[22px] border border-[rgba(93,50,145,0.1)] bg-white/80 px-4 py-6 text-center text-[11px] font-bold text-[#6b658a]">
            جاري تحميل الكورالات والمرنمين…
          </p>
        ) : publishers.length ? (
          publishers.map((pub) => <AudioPublisherCard key={pub.id} publisher={pub} />)
        ) : (
          <div className="rounded-[22px] border border-dashed border-[rgba(93,50,145,0.18)] bg-white/70 px-4 py-8 text-center">
            <p className="text-[12px] font-extrabold text-[#3a3258]">لا توجد صفحات كورالات أو مرنمين بعد</p>
            <p className="mt-1 text-[10px] font-bold leading-relaxed text-[#6b658a]">
              تظهر هنا بعد اعتماد طلب الناشر ونشر محتوى صوتي عام (ترنيم · ألبوم · قائمة).
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
