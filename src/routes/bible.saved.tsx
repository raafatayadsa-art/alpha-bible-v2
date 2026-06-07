import { createFileRoute, Link } from "@tanstack/react-router";
import { BackButton, BottomDock } from "@/components/bible";
import { useSavedVerses } from "@/lib/reading-state";
import { displayName } from "@/lib/bible-books";

export const Route = createFileRoute("/bible/saved")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الآيات المحفوظة — Alpha Bible" },
      { name: "description", content: "آياتك المحفوظة من الكتاب المقدس." },
    ],
  }),
  component: SavedVersesPage,
});

function SavedVersesPage() {
  const { saved } = useSavedVerses();

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f3]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)," +
            "radial-gradient(70% 60% at 0% 80%, rgba(214,168,98,0.18), transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36">
        <header className="flex items-center justify-between gap-2 pt-2">
          <BackButton to="/bible" compact tone="light" />
          <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">الآيات المحفوظة</h1>
          <span className="w-9" aria-hidden />
        </header>

        {saved.length === 0 ? (
          <p className="mt-10 text-center text-[13px] text-[#6a543a]">لا توجد آيات محفوظة بعد.</p>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {saved.map((v) => (
              <li key={v.id}>
                <Link
                  to="/$book/$chapter"
                  params={{ book: v.book, chapter: String(v.chapter) }}
                  className="block rounded-2xl border border-[#efe2c4] bg-white/85 px-4 py-3 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.35)] active:scale-[0.99] transition-transform"
                >
                  <p className="text-[11px] font-bold text-[#b8893a]">
                    {displayName(v.bookName || v.book)} {v.chapter}:{v.verse}
                  </p>
                  {v.text && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#3a2a18] line-clamp-3">{v.text}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomDock />
    </main>
  );
}
