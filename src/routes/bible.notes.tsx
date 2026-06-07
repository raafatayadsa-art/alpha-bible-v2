import { createFileRoute } from "@tanstack/react-router";
import { BackButton, BottomDock, GlassSurface } from "@/components/bible";
import { CopticCross } from "@/components/coptic";

export const Route = createFileRoute("/bible/notes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الملاحظات والتأملات — Alpha Bible" },
      { name: "description", content: "ملاحظاتك وتأملاتك على الكتاب المقدس." },
    ],
  }),
  component: NotesPlaceholderPage,
});

function NotesPlaceholderPage() {
  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f3]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.15), transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36">
        <header className="flex items-center justify-between gap-2 pt-2">
          <BackButton to="/bible" compact tone="light" />
          <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">الملاحظات والتأملات</h1>
          <span className="w-9" aria-hidden />
        </header>

        <GlassSurface tone="warm" className="mt-10 px-6 py-10 text-center">
          <CopticCross className="mx-auto text-[#b8893a]" size={28} />
          <p className="mt-4 font-arabic-serif text-[20px] font-bold text-[#3a2a18]">قريباً</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6a543a]">
            ستتمكن قريباً من تدوين ملاحظاتك وتأملاتك أثناء قراءة الكتاب المقدس.
          </p>
        </GlassSurface>
      </div>

      <BottomDock />
    </main>
  );
}
