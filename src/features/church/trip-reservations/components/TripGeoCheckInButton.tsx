import { useState } from "react";
import { MapPin, Check } from "lucide-react";
import { hasCheckedIn, performGeoCheckIn } from "../trip-geo-checkin";
import { myRegistration } from "../../post-registrations";

export function TripGeoCheckInButton({ postId }: { postId: string }) {
  const reg = myRegistration(postId, "trip");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const checked = reg ? hasCheckedIn(reg.id) : false;

  if (!reg) return null;

  return (
    <div className="rounded-2xl border border-[#1f8a5a]/30 bg-[#1f8a5a]/8 p-3 text-right mt-2" dir="rtl">
      <p className="text-[11px] font-extrabold text-[#1f8a5a] inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" /> تحقق جغرافي للحضور
      </p>
      {checked ? (
        <p className="mt-1 text-[10px] font-bold text-[#1f8a5a] inline-flex items-center gap-1">
          <Check className="h-3 w-3" /> تم تسجيل حضورك في الموقع
        </p>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMsg(null);
            const res = await performGeoCheckIn({ postId, registrationId: reg.id });
            setBusy(false);
            setMsg(res.ok ? "تم تسجيل حضورك ✓" : (res.error ?? "فشل التحقق"));
          }}
          className="mt-2 w-full rounded-full bg-[#1f8a5a] text-white text-[11px] font-extrabold py-2 disabled:opacity-60"
        >
          {busy ? "جاري التحقق…" : "تسجيل حضوري الآن"}
        </button>
      )}
      {msg && !checked ? <p className="mt-1 text-[10px] text-[#6a543a]">{msg}</p> : null}
    </div>
  );
}
