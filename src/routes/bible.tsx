import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookHeart, Bookmark, NotebookPen, Sparkles, BookOpen, ChevronLeft } from "lucide-react";
import { booksQueryOptions } from "@/lib/bible";
import { groupBooks, displayName } from "@/lib/bible-books";
import { useCurrentSession } from "@/lib/reading-state";
import {
  BackButton,
  BottomDock,
  ContinueReadingCard,
  QuickAccessCard,
  RecentJourney,
  SectionHeader,
  TestamentCard,
  IconBadge,
  Pressable,
  ProgressBar,
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
  const session = useCurrentSession();


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
          {session ? (
            <Pressable
              to="/$book/$chapter"
              params={{ book: session.book, chapter: String(session.chapter) }}
              ariaLabel={`متابعة قراءة ${session.bookName}`}
              className="rounded-3xl"
            >
              <div className="flex items-center gap-3 rounded-3xl bg-[#fbf3e1] border border-[#efe2c4] p-3 shadow-[0_10px_24px_-16px_rgba(120,80,30,0.35)]">
                <IconBadge tone="gold" size={52}>
                  <BookOpen className="h-6 w-6" strokeWidth={1.8} />
                </IconBadge>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[10.5px] font-bold text-[#b8893a] tracking-wide">متابعة القراءة</p>
                  <h3 className="mt-0.5 truncate text-[14px] font-extrabold text-[#3a2a18]">
                    {displayName(session.bookName || session.book)}
                  </h3>
                  <p className="text-[11px] text-[#6a543a]">
                    الإصحاح {session.chapter}
                    {session.verse ? ` · الآية ${session.verse}` : ""}
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={session.progressPercent} showLabel />
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-[#b8893a] shrink-0" />
              </div>
            </Pressable>
          ) : (
            <ContinueReadingCard
              book="ابدأ رحلتك"
              chapter={1}
              progress={0}
              to="/books"
            />
          )}
          <RecentJourney />
        </section>
      </div>


      <BottomDock />
    </main>
  );
}
