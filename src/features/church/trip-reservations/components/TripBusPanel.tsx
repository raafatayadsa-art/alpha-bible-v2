import { useEffect, useState } from "react";
import { Bus, Plus, Users } from "lucide-react";
import {
  autoDistributeBuses,
  busOccupancy,
  createTripBus,
  listTripBuses,
  syncTripBusesFromDb,
  updateTripBus,
} from "../trip-bus-store";

export function TripBusPanel({ postId }: { postId: string }) {
  const [buses, setBuses] = useState(() => listTripBuses(postId));
  const [label, setLabel] = useState("");
  const [capacity, setCapacity] = useState("45");

  const refresh = () => setBuses(listTripBuses(postId));

  useEffect(() => {
    void syncTripBusesFromDb(postId).then(refresh);
  }, [postId]);

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-right" dir="rtl">
      <p className="text-[10px] font-extrabold text-[#f0d78c] mb-2 inline-flex items-center gap-1">
        <Bus className="h-3 w-3" /> إدارة الحافلات
      </p>
      {buses.length === 0 ? (
        <p className="text-[9px] text-white/50 mb-2">لم تُنشأ حافلات بعد</p>
      ) : (
        <ul className="space-y-1 mb-2">
          {buses.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg bg-black/30 px-2 py-1.5 text-[9px]">
              <select
                value={b.status}
                onChange={(e) => {
                  updateTripBus(b.id, { status: e.target.value as typeof b.status });
                  refresh();
                }}
                className="rounded bg-black/40 border border-white/10 px-1 py-0.5 text-white/80"
              >
                <option value="idle">انتظار</option>
                <option value="boarding">صعود</option>
                <option value="en_route">في الطريق</option>
                <option value="arrived">وصلت</option>
              </select>
              <span className="font-bold text-white/85 truncate">
                {b.label} · <Users className="inline h-2.5 w-2.5" /> {busOccupancy(b.id)}/{b.capacity}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-1">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="حافلة 1"
          className="flex-1 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-[9px] text-white"
        />
        <input
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          type="number"
          className="w-12 rounded-lg bg-black/40 border border-white/10 px-1 py-1 text-[9px] text-white"
        />
        <button
          type="button"
          onClick={() => {
            if (!label.trim()) return;
            createTripBus({ postId, label: label.trim(), capacity: Number(capacity) || 45 });
            setLabel("");
            refresh();
          }}
          className="rounded-lg bg-[#1f8a5a]/80 px-2 py-1 text-white"
          aria-label="إضافة"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {buses.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            autoDistributeBuses(postId);
            refresh();
          }}
          className="mt-1.5 w-full rounded-lg border border-[#e7c97a]/30 py-1 text-[9px] font-bold text-[#f0d78c]"
        >
          توزيع تلقائي للمقاعد
        </button>
      ) : null}
    </div>
  );
}
