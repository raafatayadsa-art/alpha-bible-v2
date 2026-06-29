import { useEffect, useState } from "react";
import { Award, ShieldCheck } from "lucide-react";
import { getOrganizerTrustStats, syncOrganizerTrustFromDb } from "../organizer-trust";

export function OrganizerTrustSheet({
  organizerUserId,
  organizerName,
  onClose,
}: {
  organizerUserId: string;
  organizerName: string;
  onClose: () => void;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    void syncOrganizerTrustFromDb(organizerUserId).then(() => setTick((n) => n + 1));
  }, [organizerUserId]);

  const stats = getOrganizerTrustStats(organizerUserId);

  return (
    <div className="fixed inset-0 z-[76] flex items-end justify-center px-3 pb-[max(env(safe-area-inset-bottom),12px)]" dir="rtl">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#1a0f04]/40" />
      <div className="relative w-full max-w-[400px] rounded-[24px] border border-[#efe2c4] bg-[#fbf3e1] p-4 text-right">
        <p className="text-[14px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#1f8a5a]" /> لوحة ثقة المنظم
        </p>
        <p className="text-[11px] text-[#6a543a] mt-1">{organizerName}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="رحلات سابقة" value={stats.tripsCompleted} />
          <Stat label="معدل الحضور" value={`${stats.attendanceRate}%`} />
          <Stat label="معدل الإلغاء" value={`${stats.cancellationRate}%`} />
          <Stat label="الالتزام" value={`${stats.commitmentScore}/100`} accent />
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-full bg-[#7a4a26] text-white py-2.5 text-[12px] font-extrabold">
          إغلاق
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white/80 border border-[#efe2c4] p-2.5 text-center">
      {accent ? <Award className="mx-auto h-4 w-4 text-[#b8893a] mb-1" /> : null}
      <p className="text-[16px] font-extrabold text-[#3a2a18] tabular-nums">{value}</p>
      <p className="text-[9px] font-bold text-[#8a6a3a]">{label}</p>
    </div>
  );
}
