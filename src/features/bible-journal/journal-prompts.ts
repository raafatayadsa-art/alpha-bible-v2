import type { StudyTag } from "@/lib/bible-journal-state";

export const MEDITATION_PROMPTS = [
  "ماذا يقول الله لي من هذه الآية؟",
  "كيف أطبّق هذا في حياتي اليوم؟",
  "ما الشعور الذي يثيره في قلبي؟",
  "صلاة قصيرة من هذا النص",
  "ما الذي أتعلّمه عن محبة الله؟",
  "أين أحتاج إلى توبة أو شكر؟",
] as const;

export function pickRandomMeditationPrompts(count = 5): string[] {
  const items = [...MEDITATION_PROMPTS];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, count);
}

export const NOTE_PROMPTS = [
  "ملخص ما فهمته",
  "كلمات مفتاحية للدراسة",
  "أسئلة للبحث لاحقاً",
  "ربط مع آيات أخرى",
] as const;

export const STUDY_TAGS: { id: StudyTag; label: string; emoji: string }[] = [
  { id: "study", label: "دراسة", emoji: "📖" },
  { id: "application", label: "تطبيق", emoji: "✦" },
  { id: "prayer", label: "صلاة", emoji: "🕊" },
  { id: "question", label: "سؤال", emoji: "؟" },
];
