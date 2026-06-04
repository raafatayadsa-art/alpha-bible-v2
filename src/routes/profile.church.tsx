import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell, PCard, Field } from "@/components/profile/Shell";

export const Route = createFileRoute("/profile/church")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — كنيستي" }] }),
  component: () => (
    <ProfileSubShell title="كنيستي">
      <PCard accent="#c98a3c">
        <Field label="اسم الكنيسة" value="كنيسة الشهيد مار جرجس" hint="إيبارشية شرق القاهرة" />
        <Field label="الكاهن" value="القمص داود عبد الملاك" />
        <Field label="الخادم المسؤول" value="الأخ بيتر ميلاد" />
        <Field label="حالة العضوية" value="عضو فعّال" hint="آخر تحديث: 12 يونيو 2026" />
        <Field label="تاريخ الانضمام" value="12 يناير 2019" />
      </PCard>
    </ProfileSubShell>
  ),
});
