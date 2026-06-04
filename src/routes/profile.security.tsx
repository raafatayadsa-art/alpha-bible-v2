import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell, PCard } from "@/components/profile/Shell";
import { KeyRound, Smartphone, LogOut, ChevronLeft } from "lucide-react";

const rows = [
  { icon: KeyRound, title: "تغيير كلمة المرور", subtitle: "آخر تحديث: منذ شهرين", accent: "#3f9d6e" },
  { icon: Smartphone, title: "الأجهزة النشطة", subtitle: "iPhone 15 · Web Chrome", accent: "#4a86c1" },
];

export const Route = createFileRoute("/profile/security")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — الخصوصية والأمان" }] }),
  component: () => (
    <ProfileSubShell title="الخصوصية والأمان">
      <PCard accent="#3f9d6e" className="p-2">
        {rows.map((r) => (
          <button key={r.title} className="w-full flex items-center gap-3 px-3 py-3 rounded-[18px] hover:bg-[#fbf3e1] transition">
            <div className="grid h-10 w-10 place-items-center rounded-xl border" style={{ background: `linear-gradient(160deg, ${r.accent}33, ${r.accent}11)`, borderColor: `${r.accent}55` }}>
              <r.icon className="h-4.5 w-4.5" style={{ color: r.accent }} />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[13px] font-bold text-[#3a2a18]">{r.title}</div>
              <div className="text-[11px] text-[#6a543a]">{r.subtitle}</div>
            </div>
            <ChevronLeft className="h-4 w-4 text-[#b8893a]/70" />
          </button>
        ))}
      </PCard>
      <button className="mt-5 w-full grid place-items-center rounded-2xl bg-gradient-to-l from-[#c14545] to-[#d86a6a] text-white font-bold py-3 shadow-[0_10px_24px_-12px_rgba(193,69,69,0.6)] active:scale-[0.98] transition">
        <span className="inline-flex items-center gap-2"><LogOut className="h-4 w-4" /> تسجيل الخروج</span>
      </button>
    </ProfileSubShell>
  ),
});
