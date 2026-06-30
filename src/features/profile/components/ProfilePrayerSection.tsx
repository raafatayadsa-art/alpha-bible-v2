import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, HandHeart, Plus } from "lucide-react";
import { filterPrayers } from "@/data/prayer-requests";
import {
  decrementPrayerCount,
  fetchCommunityPrayerRequests,
  incrementPrayerCount,
  PRAYER_REQUESTS_CHANGED,
} from "@/features/church/prayer-requests-api";
import { PrayerRequestCard } from "@/features/prayer/PrayerRequestCard";
import { ProfileGlassCard } from "./shared";

export function ProfilePrayerSection() {
  const [prayedIds, setPrayedIds] = useState<Set<string>>(() => new Set());
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchCommunityPrayerRequests>>>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const rows = await fetchCommunityPrayerRequests();
    setItems(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadItems();
    const onChange = () => void loadItems();
    window.addEventListener(PRAYER_REQUESTS_CHANGED, onChange);
    return () => window.removeEventListener(PRAYER_REQUESTS_CHANGED, onChange);
  }, [loadItems]);

  /** Personal section — only user's approved requests (mine flag = approved for profile). */
  const myPrayers = useMemo(() => filterPrayers(items, "mine"), [items]);

  const togglePray = (id: string) => {
    const wasPrayed = prayedIds.has(id);
    setPrayedIds((prev) => {
      const next = new Set(prev);
      if (wasPrayed) next.delete(id);
      else next.add(id);
      return next;
    });
    void (wasPrayed ? decrementPrayerCount(id) : incrementPrayerCount(id)).then(() => void loadItems());
  };

  if (loading) {
    return (
      <ProfileGlassCard className="p-5 text-center">
        <p className="text-[12px] font-bold text-[#6a543a]">جاري تحميل طلبات الصلاة…</p>
      </ProfileGlassCard>
    );
  }

  if (myPrayers.length === 0) {
    return (
      <ProfileGlassCard className="p-5 text-center">
        <HandHeart className="h-6 w-6 text-[#b8893a] mx-auto" strokeWidth={2.2} />
        <p className="mt-2 text-[12px] font-bold text-[#5a4a38]">
          لم تُضف طلبات صلاة شخصية بعد
        </p>
        <Link
          to="/prayer-requests"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11.5px] font-extrabold text-white"
          style={{
            background: "linear-gradient(to left, #b8893a, #c79356)",
            boxShadow: "0 6px 14px -8px rgba(184,137,58,0.5)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          إنشاء طلب صلاة
        </Link>
      </ProfileGlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {myPrayers.map((req) => (
        <PrayerRequestCard
          key={req.id}
          req={req}
          compact
          hasPrayed={prayedIds.has(req.id)}
          onPray={() => togglePray(req.id)}
          onEncourage={() => {
            window.location.assign("/prayer-requests");
          }}
        />
      ))}

      <Link
        to="/prayer-requests"
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#efe2c4] bg-white/70 py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-[0.98] transition"
      >
        <Plus className="h-3.5 w-3.5 text-[#b8893a]" />
        طلب صلاة جديد
        <ChevronLeft className="h-3.5 w-3.5 text-[#b8893a]" />
      </Link>
    </div>
  );
}
