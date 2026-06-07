import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { HandHeart, NotebookPen, Zap } from "lucide-react";

import { booksQueryOptions } from "@/lib/bible";

import { groupBooks, displayName } from "@/lib/bible-books";

import { useCurrentSession } from "@/lib/reading-state";

import {

  BackButton,

  BottomDock,

  ContinueReadingCard,

  SectionHeader,

  TestamentCard,

  VerseOfDayHeroCard,

  QuickAccessCard,

} from "@/components/bible";

import { CopticWatermark } from "@/components/coptic";



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

  const psalmsBook = grouped.old.find((b) => displayName(b).includes("مزامير")) ?? grouped.old[0];



  return (

    <main

      dir="rtl"

      className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f3]"

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

      <CopticWatermark />



      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36">

        <header className="flex items-center justify-between gap-2 pt-2 pb-1">

          <BackButton to="/home" compact tone="light" label="الرئيسية" />

          <h1 className="font-arabic-serif text-[20px] font-bold text-[#3a2a18]">

            الكتاب المقدس

          </h1>

          <span className="w-9" aria-hidden />

        </header>



        <section className="mt-4">

          <VerseOfDayHeroCard />

        </section>



        <section className="mt-4 grid grid-cols-2 gap-2.5">

          <TestamentCard

            title="العهد الجديد"

            subtitle="من متى إلى الرؤيا — بشارة الخلاص"

            count={grouped.neu.length || 27}

            tone="gold"

            to="/books"

            search={{ testament: "new" }}

            heroImage="/bible-icons/new-testament-hero.webp"

            compact

          />

          <TestamentCard

            title="العهد القديم"

            subtitle="من التكوين إلى ملاخي — تاريخ الخلاص"

            count={grouped.old.length || 39}

            tone="purple"

            to="/books"

            search={{ testament: "old" }}

            heroImage="/bible-icons/old-testament-hero.webp"

            compact

          />

        </section>



        <section className="mt-6">

          <SectionHeader

            title="الوصول السريع"

            action={<Zap className="h-4 w-4 text-[#c79356]" aria-hidden />}

          />

          <div className="grid grid-cols-2 gap-2">

            <QuickAccessCard

              bookId="Psalms"

              title="المزامير"

              subtitle="150 مزمور"

              tone="gold"

              to={psalmsBook ? "/$book" : "/books"}

              params={psalmsBook ? { book: psalmsBook } : undefined}

            />

            <QuickAccessCard

              title="الآيات المحفوظة"

              subtitle="مكتبتك الشخصية"

              tone="purple"

              to="/bible/saved"

            />

            <QuickAccessCard

              icon={NotebookPen}

              title="الملاحظات والتأملات"

              subtitle="دوّن خواطرك"

              tone="ivory"

              to="/bible/notes"

            />

            <QuickAccessCard

              icon={HandHeart}

              title="الأجبية الذكية"

              subtitle="صلوات مقترحة"

              tone="purple"

              to="/agpeya"

            />

          </div>

        </section>



        <section className="mt-6">

          <SectionHeader title="أكمل حيث توقفت" />

          {session ? (

            <ContinueReadingCard

              book={displayName(session.bookName || session.book)}

              bookParam={session.book}

              chapter={session.chapter}

              verse={session.verse}

              progress={session.progressPercent}

            />

          ) : (

            <ContinueReadingCard

              book="ابدأ رحلتك في الكتاب"

              chapter={1}

              progress={0}

              to="/books"

            />

          )}

        </section>

      </div>



      <BottomDock />

    </main>

  );

}


