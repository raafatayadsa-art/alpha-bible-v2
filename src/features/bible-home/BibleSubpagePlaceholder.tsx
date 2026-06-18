import { BackButton, BottomDock, GlassSurface } from "@/components/bible";
import { CopticCross } from "@/components/coptic";

export function BibleSubpagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f3]">
      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36">
        <header className="flex items-center justify-between gap-2 pt-2">
          <BackButton to="/bible" compact tone="light" />
          <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">{title}</h1>
          <span className="w-9" aria-hidden />
        </header>

        <GlassSurface tone="warm" className="mt-10 px-6 py-10 text-center">
          <CopticCross className="mx-auto text-[#b8893a]" size={28} />
          <p className="mt-4 font-arabic-serif text-[20px] font-bold text-[#3a2a18]">قريباً</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">{description}</p>
        </GlassSurface>
      </div>

      <BottomDock />
    </main>
  );
}
