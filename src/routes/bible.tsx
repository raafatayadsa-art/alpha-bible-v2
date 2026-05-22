import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookHeart, Bookmark, NotebookPen, Sparkles } from "lucide-react";
import { booksQueryOptions } from "@/lib/bible";
import { groupBooks } from "@/lib/bible-books";
import {
  BackButton,
  BottomDock,
  ContinueReadingCard,
  QuickAccessCard,
  SectionHeader,
  TestamentCard,
} from "@/components/bible";

export const Route = createFileRoute("/bible")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "الكتاب المقدس — Alpha Bible" },
      { name: "description", content: "تنقّل في العهدين القديم والجديد، تابع قراءاتك، واحفظ آياتك المفضلة." },
    ],
  }),
  component: BibleHome,
});

function BibleHome() {
  const { data: books } = useQuery(booksQueryOptions());
  const grouped = books ? groupBooks(books) : { old: [], neu: [], other: [] };

  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(214,168,98,0.18), transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36">
        <header className="flex items-center justify-between gap-2 pt-2">
          <BackButton to="/home" />
          <div className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#c79356]" />
            <h1 className="font-arabic-serif text-[18px] font-bold text-[#3a2a18]">
              الكتاب المقدس
            </h1>
          </div>
          <span className="w-[68px]" aria-hidden />
        </header>

        <section className="mt-5 space-y-3">
          <TestamentCard
            title="العهد القديم"
            subtitle="من التكوين إلى ملاخي"
            count={grouped.old.length || 39}
            tone="gold"
            to="/books"
          />
          <TestamentCard
            title="العهد الجديد"
            subtitle="من متى إلى الرؤيا"
            count={grouped.neu.length || 27}
            tone="purple"
            to="/books"
          />
        </section>

        <section className="mt-6">
          <SectionHeader title="وصول سريع" caption="ابدأ من حيث تشاء" />
          <div className="grid grid-cols-2 gap-2.5">
            <QuickAccessCard
              icon={BookHeart}
              title="المزامير"
              subtitle="تأملات وتسبيح يومي"
              tone="purple"
              to="/books"
            />
            <QuickAccessCard
              icon={Sparkles}
              title="صلوات ذكية"
              subtitle="صلوات مقترحة حسب حالتك"
              tone="gold"
            />
            <QuickAccessCard
              icon={Bookmark}
              title="آيات محفوظة"
              subtitle="مكتبتك الشخصية"
              tone="ivory"
            />
            <QuickAccessCard
              icon={NotebookPen}
              title="ملاحظات وتأملات"
              subtitle="دوّن خواطرك أثناء القراءة"
              tone="purple"
            />
          </div>
        </section>

        <section className="mt-6">
          <SectionHeader title="متابعة القراءة" />
          <ContinueReadingCard
            book="إنجيل يوحنا"
            chapter={3}
            verse={16}
            progress={42}
            to="/books"
          />
        </section>
      </div>

      <BottomDock />
    </main>
  );
}
