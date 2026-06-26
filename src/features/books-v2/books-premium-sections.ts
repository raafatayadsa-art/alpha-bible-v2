import { resolveBookId } from "@/lib/bible-icons";
import { getBookSymbolDef } from "@/lib/bible-icons/book-symbol-registry";
import { matchesNtFilter, matchesOtFilter, type NtCategory, type OtCategory } from "@/lib/book-meta";

function sortByCanonicalOrder(books: string[]): string[] {
  return [...books].sort((a, b) => {
    const oa = getBookSymbolDef(resolveBookId(a) ?? a)?.order ?? 999;
    const ob = getBookSymbolDef(resolveBookId(b) ?? b)?.order ?? 999;
    return oa - ob;
  });
}

export type BooksSectionDef = {
  key: string;
  label: string;
  subtitle: string;
  filter: NtCategory | OtCategory;
  glyph: string;
};

export const OT_SECTIONS: BooksSectionDef[] = [
  { key: "law", label: "أسفار الشريعة", subtitle: "التوراة · أساس العهد", filter: "law", glyph: "Ⲁ" },
  { key: "history", label: "أسفار التاريخ", subtitle: "قصة شعب الله", filter: "history", glyph: "Ⲃ" },
  { key: "wisdom", label: "أسفار الحكمة", subtitle: "تسبيح · تأمل · حكمة", filter: "wisdom", glyph: "ϯ" },
  { key: "prophets", label: "أسفار الأنبياء", subtitle: "نبوءة · دعوة · رجاء", filter: "prophets", glyph: "Ⲱ" },
];

export const NT_SECTIONS: BooksSectionDef[] = [
  { key: "gospels", label: "الأناجيل الأربعة", subtitle: "يسوع المسيح · حياته وفداه", filter: "gospels", glyph: "✦" },
  { key: "acts", label: "سفر الأعمال", subtitle: "امتداد المسيح بالروح", filter: "all", glyph: "Ⲁ" },
  { key: "letters", label: "رسائل الرسل", subtitle: "تعليم · تثبيت · محبة", filter: "letters", glyph: "Ⲃ" },
  { key: "revelation", label: "سفر الرؤيا", subtitle: "نهاية الزمان · انتصار الحمل", filter: "revelation", glyph: "Ⲱ" },
];

function isActsBook(book: string): boolean {
  const n = book.toLowerCase();
  return n.includes("اعمال") || n.includes("أعمال");
}

export function groupBooksIntoSections(
  books: string[],
  testament: "old" | "new",
  activeFilter: NtCategory | OtCategory,
): { section: BooksSectionDef; books: string[] }[] {
  if (testament === "old") {
    if (activeFilter !== "all") {
      const section = OT_SECTIONS.find((s) => s.filter === activeFilter);
      return section ? [{ section, books }] : [{ section: OT_SECTIONS[0], books }];
    }
    return OT_SECTIONS.map((section) => ({
      section,
      books: books.filter((b) => matchesOtFilter(b, section.filter as OtCategory)),
    })).filter((g) => g.books.length > 0);
  }

  if (activeFilter !== "all") {
    const section = NT_SECTIONS.find((s) => s.filter === activeFilter) ?? NT_SECTIONS[0];
    return [{ section, books }];
  }

  const gospels = sortByCanonicalOrder(books.filter((b) => matchesNtFilter(b, "gospels")));
  const acts = books.filter((b) => isActsBook(b));
  const letters = books.filter(
    (b) => matchesNtFilter(b, "letters") && !isActsBook(b),
  );
  const revelation = books.filter((b) => matchesNtFilter(b, "revelation"));

  const groups: { section: BooksSectionDef; books: string[] }[] = [];
  if (gospels.length) groups.push({ section: NT_SECTIONS[0], books: gospels });
  if (acts.length) groups.push({ section: NT_SECTIONS[1], books: acts });
  if (letters.length) groups.push({ section: NT_SECTIONS[2], books: letters });
  if (revelation.length) groups.push({ section: NT_SECTIONS[3], books: revelation });
  return groups;
}
