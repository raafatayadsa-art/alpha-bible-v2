import { Users } from "lucide-react";
import { autoMatchCompanions, listCompanionGroups } from "../companion-matching";

export function CompanionMatchingPanel({ postId }: { postId: string }) {
  const groups = listCompanionGroups(postId);

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-right" dir="rtl">
      <p className="text-[10px] font-extrabold text-[#f0d78c] mb-1 inline-flex items-center gap-1">
        <Users className="h-3 w-3" /> توزيع الغرف والسكن
      </p>
      {groups.length === 0 ? (
        <p className="text-[9px] text-white/50">لم يُوزّع بعد</p>
      ) : (
        <ul className="space-y-1 mb-1">
          {groups.slice(0, 4).map((g) => (
            <li key={g.id} className="text-[9px] text-white/75">{g.label} · {g.registrationIds.length} حجز</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => autoMatchCompanions(postId)}
        className="w-full rounded-lg border border-[#e7c97a]/30 py-1 text-[9px] font-bold text-[#f0d78c]"
      >
        مطابقة تلقائية
      </button>
    </div>
  );
}
