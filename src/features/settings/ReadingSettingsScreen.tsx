import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { BackButton } from "@/components/bible";
import { CopticWatermark } from "@/components/coptic";
import { SelectRow, ToggleRow } from "@/features/settings/control-center-ui";
import { useSettings } from "@/features/settings/settings-store";
import { useTypographyPrefs } from "@/lib/reading-state";

const FONT_SIZE_OPTIONS = [
  { value: "16", label: "16pt" },
  { value: "18", label: "18pt" },
  { value: "20", label: "20pt" },
  { value: "22", label: "22pt" },
];

export function ReadingSettingsScreen() {
  const { state, patch } = useSettings();
  const { prefs, setPrefs } = useTypographyPrefs();
  const p = <K extends keyof typeof state>(key: K) => (value: (typeof state)[K]) => patch({ [key]: value });

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center justify-between gap-2 py-3">
          <BackButton to="/profile" compact tone="light" />
          <h1 className="font-arabic-serif text-[18px] font-extrabold text-alpha-heading">إعدادات القراءة</h1>
          <span className="h-9 w-9 shrink-0" aria-hidden />
        </header>

        <section className="mt-2 overflow-hidden rounded-[22px] border border-alpha/50 bg-white/75 p-4 shadow-[var(--alpha-shadow-featured)]">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-alpha-gold-deep" strokeWidth={2.1} />
            <h2 className="text-[14px] font-extrabold text-alpha-heading">قراءة الكتاب المقدس</h2>
          </div>

          <SelectRow
            label="حجم الخط"
            value={String(prefs.fontSize)}
            options={FONT_SIZE_OPTIONS}
            onChange={(v) => setPrefs({ ...prefs, fontSize: Number(v) })}
          />
          <ToggleRow
            label="أرقام الآيات"
            subtitle="إظهار أرقام الآيات في النص"
            checked={state.bibleShowVerseNumbers}
            onChange={p("bibleShowVerseNumbers")}
          />
          <ToggleRow
            label="الحواشي"
            subtitle="عندما تتوفر"
            checked={state.bibleShowFootnotes}
            onChange={p("bibleShowFootnotes")}
          />
          <ToggleRow
            label="الحروف الحمراء"
            subtitle="عندما تتوفر"
            checked={state.bibleShowRedLetters}
            onChange={p("bibleShowRedLetters")}
          />
          <ToggleRow
            label="حفظ آخر قراءة"
            subtitle="متابعة من حيث توقفت"
            checked={state.bibleSaveLastRead}
            onChange={p("bibleSaveLastRead")}
          />
          <ToggleRow
            label="شريط تتبع الصوت"
            subtitle="عندما تتوفر"
            checked={state.bibleShowAudioBar}
            onChange={p("bibleShowAudioBar")}
          />
        </section>

        <section className="mt-4 overflow-hidden rounded-[22px] border border-alpha/50 bg-white/75 p-4 shadow-[var(--alpha-shadow-mini)]">
          <h2 className="mb-3 text-[14px] font-extrabold text-alpha-heading">خطط القراءة</h2>
          <ToggleRow
            label="إشعارات الاستكمال"
            subtitle="تذكير عند إكمال خطة"
            checked={state.notifyVerse}
            onChange={p("notifyVerse")}
          />
        </section>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-alpha-muted">
          مسح البيانات المؤقتة لا يحذف ملاحظاتك أو تأملاتك المحفوظة.
        </p>

        <Link
          to="/settings"
          className="mt-4 flex w-full items-center justify-center rounded-2xl border border-alpha/45 bg-white/60 py-3 text-[12px] font-extrabold text-alpha-heading active:scale-[0.99]"
        >
          الإعدادات المتقدمة (أمان · خصوصية · كنيستي)
        </Link>
      </div>

      <BottomDock />
    </div>
  );
}
