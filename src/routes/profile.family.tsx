import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell, PCard } from "@/components/profile/Shell";
import { UserPlus } from "lucide-react";

const family = [
  { name: "عاطف صبحي", role: "الأب", initial: "ع" },
  { name: "ماري لويس", role: "الأم", initial: "م" },
  { name: "مارينا عاطف", role: "أخت", initial: "م" },
];

export const Route = createFileRoute("/profile/family")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — العائلة" }] }),
  component: () => (
    <ProfileSubShell title="العائلة">
      <PCard accent="#a07ec4" className="p-3">
        <ul className="divide-y divide-[#efe2c4]/70">
          {family.map((m) => (
            <li key={m.name} className="flex items-center gap-3 py-3 px-1">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-b from-[#a07ec4]/30 to-[#a07ec4]/10 border border-[#a07ec466] text-[#6a4ea1] font-bold">
                {m.initial}
              </div>
              <div className="flex-1 text-right">
                <div className="text-[14px] font-bold text-[#3a2a18]">{m.name}</div>
                <div className="text-[11px] text-[#6a543a]">{m.role}</div>
              </div>
            </li>
          ))}
        </ul>
      </PCard>
      <button className="mt-4 w-full grid place-items-center rounded-2xl bg-gradient-to-l from-[#a07ec4] to-[#c79edd] text-white font-bold py-3 shadow-[0_10px_24px_-12px_rgba(160,126,196,0.6)] active:scale-[0.98] transition">
        <span className="inline-flex items-center gap-2"><UserPlus className="h-4 w-4" /> إضافة فرد للعائلة</span>
      </button>
    </ProfileSubShell>
  ),
});
