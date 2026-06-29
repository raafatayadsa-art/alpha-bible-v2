import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import {
  cancelCommunityConnectionRequest,
  fetchPendingConnectionRequestsSent,
  type SentConnectionRequest,
} from "./community-friends-api";

export function CommunitySentRequests({ onChanged }: { onChanged?: () => void }) {
  const [sent, setSent] = useState<SentConnectionRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await fetchPendingConnectionRequestsSent();
    setSent(rows);
  }, []);

  useEffect(() => {
    void load();
    const onFriends = () => void load();
    window.addEventListener("ab:community-friends-changed", onFriends);
    return () => window.removeEventListener("ab:community-friends-changed", onFriends);
  }, [load]);

  const cancel = async (requestId: string) => {
    setBusyId(requestId);
    try {
      const ok = await cancelCommunityConnectionRequest(requestId);
      if (!ok) {
        toast.error("تعذّر إلغاء الطلب");
        return;
      }
      toast.success("تم إلغاء طلب الصداقة");
      await load();
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  if (!sent.length) return null;

  return (
    <section className="mb-4">
      <h2 className="mb-2 text-[13px] font-extrabold text-[#3a2a18]">طلبات مرسلة</h2>
      <div className="space-y-2">
        {sent.map((req) => (
          <div
            key={req.id}
            className="flex items-center gap-3 rounded-[18px] border border-[#e7c97a]/22 bg-white/78 px-3 py-3"
          >
            <PrayerUserAvatar name={req.toName} avatarUrl={req.toAvatarUrl} size="md" />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[14px] font-extrabold text-[#3a2a18]">{req.toName}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#7a6548]">في انتظار القبول</p>
            </div>
            <button
              type="button"
              disabled={busyId === req.id}
              onClick={() => void cancel(req.id)}
              className="shrink-0 rounded-full border border-[#7a6548]/30 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold text-[#7a6548] active:scale-95 disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
