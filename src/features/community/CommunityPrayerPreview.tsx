import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, HandHeart, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrayerRequest } from "@/data/prayer-requests";
import {
  fetchCommunityPrayerRequests,
  filterPrayers,
  incrementPrayerCount,
  PRAYER_REQUESTS_CHANGED,
} from "@/features/church/prayer-requests-api";
import { PrayerUserAvatar, firstNameFrom } from "@/features/prayer/prayer-avatars";
import { COMMUNITY_GLASS_BTN_ACCENT, COMMUNITY_GLASS_CARD, COMMUNITY_GLASS_CHIP } from "./community-glass-chrome";

const PREVIEW_TABS: { key: "all" | "active" | "urgent"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشط" },
  { key: "urgent", label: "عاجل" },
];

export function CommunityPrayerPreview() {
  const [items, setItems] = useState<PrayerRequest[]>([]);
  const [tab, setTab] = useState<"all" | "active" | "urgent">("all");
  const [prayedIds, setPrayedIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    const rows = await fetchCommunityPrayerRequests();
    setItems(rows);
  }, []);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener(PRAYER_REQUESTS_CHANGED, onChange);
    return () => window.removeEventListener(PRAYER_REQUESTS_CHANGED, onChange);
  }, [load]);

  const filtered = useMemo(() => {
    let list = items;
    if (tab === "urgent") list = filterPrayers(items, "urgent");
    else if (tab === "active") list = items.filter((p) => p.status === "active" || p.status === "urgent");
    return list.slice(0, 3);
  }, [items, tab]);

  const togglePray = (req: PrayerRequest) => {
    if (prayedIds.has(req.id)) return;
    setPrayedIds((prev) => new Set(prev).add(req.id));
    void incrementPrayerCount(req.id).then(() => {
      void import("@/features/community/community-auto-activity").then((m) =>
        m.maybeEmitPrayerIntercessionActivity({
          id: req.id,
          title: req.title,
          request: req.request,
          category: req.category,
        }),
      );
      void load();
    });
  };

  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold text-alpha-heading">
          <HandHeart className="h-4 w-4 text-[#8a6ec1]" />
          طلبات الصلاة
        </h2>
        <Link to="/prayer-requests" className="text-[11px] font-bold text-alpha-heading-muted">
          عرض الكل
        </Link>
      </div>

      <div className="mb-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {PREVIEW_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 px-3 py-1.5 text-[10px] font-extrabold ${
              tab === key
                ? `${COMMUNITY_GLASS_CHIP} text-[#5a3d92] border-[#8a6ec1]/45`
                : `${COMMUNITY_GLASS_CHIP} text-[#7a6548] opacity-80`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={`${COMMUNITY_GLASS_CARD} px-4 py-5 text-center`}>
          <p className="text-[13px] font-semibold text-[#6a543a]">لا توجد طلبات في هذا التصنيف</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const prayed = prayedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-3 py-3 ${COMMUNITY_GLASS_CARD}`}
              >
                <PrayerUserAvatar name={item.name} avatarUrl={item.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[12px] font-extrabold text-[#3a2a18]">
                    {item.anonymous ? "طلب مجهول" : firstNameFrom(item.name)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-[#6a543a]">
                    {item.request}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-[#8a6ec1]">{item.prayers} صلّوا</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePray(item)}
                    disabled={prayed}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold active:scale-95 ${
                      prayed
                        ? "bg-[#1f8a5a]/15 text-[#1f8a5a]"
                        : "bg-gradient-to-l from-[#b8893a] to-[#c79356] text-white shadow-[0_6px_14px_-10px_rgba(184,137,58,0.55)]"
                    }`}
                  >
                    {prayed ? <Check className="h-3 w-3" /> : <HandHeart className="h-3 w-3" />}
                    {prayed ? "تمت" : "صلّيت"}
                  </button>
                  <Link to="/prayer-requests" className="text-[#b8893a]/80">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        to="/prayer-requests"
        className={`mt-3 flex w-full items-center justify-center gap-2 py-3.5 text-[13px] font-extrabold text-[#5a3d92] ${COMMUNITY_GLASS_BTN_ACCENT("#8a6ec1")}`}
      >
        <Plus className="h-4 w-4" />
        أضف طلب صلاة جديد
      </Link>
    </section>
  );
}
