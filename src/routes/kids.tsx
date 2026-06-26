import { createFileRoute } from "@tanstack/react-router";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";

function KidsScreen() {
  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden pb-36"
      style={{ background: "linear-gradient(180deg,#0e0a06 0%,#1a1208 55%,#120c08 100%)" }}
    >
      <CopticWatermark />
      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-[max(env(safe-area-inset-top),12px)]">
        <h1 className="text-[20px] font-extrabold text-[#f0d78c]">الأطفال</h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/70">
          قصص القديسين وأنشطة روحية للأطفال — المحتوى قيد الإعداد.
        </p>
      </div>
      <BottomDock />
    </div>
  );
}

export const Route = createFileRoute("/kids")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الأطفال" },
      { name: "description", content: "قصص وأنشطة روحية للأطفال." },
    ],
  }),
  component: KidsScreen,
});
