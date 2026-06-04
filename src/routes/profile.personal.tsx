import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell, PCard, Field } from "@/components/profile/Shell";
import { Pencil } from "lucide-react";

export const Route = createFileRoute("/profile/personal")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — البيانات الشخصية" }] }),
  component: () => (
    <ProfileSubShell title="البيانات الشخصية">
      <PCard accent="#4a86c1">
        <Field label="الاسم بالكامل" value="مينا عاطف صبحي" />
        <Field label="الجوال" value="+20 100 123 4567" />
        <Field label="البريد الإلكتروني" value="mina.atef@example.com" />
        <Field label="تاريخ الميلاد" value="14 مارس 1996" />
        <Field label="النوع" value="ذكر" />
        <Field label="العنوان" value="مصر الجديدة، القاهرة" />
      </PCard>
      <button className="mt-4 w-full grid place-items-center rounded-2xl bg-gradient-to-l from-[#4a86c1] to-[#6aa7d8] text-white font-bold py-3 shadow-[0_10px_24px_-12px_rgba(74,134,193,0.6)] active:scale-[0.98] transition">
        <span className="inline-flex items-center gap-2"><Pencil className="h-4 w-4" /> تعديل البيانات</span>
      </button>
    </ProfileSubShell>
  ),
});
