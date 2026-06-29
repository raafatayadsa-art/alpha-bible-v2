import { Link } from "@tanstack/react-router";
import { Check, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import {
  fetchPendingConnectionRequestsReceived,
  respondCommunityConnectionRequest,
  type PendingConnectionRequest,
} from "./community-friends-api";

type Props = {
  compact?: boolean;
  onChanged?: () => void;
};

export function CommunityPendingRequests({ compact = false, onChanged }: Props) {
  const [pending, setPending] = useState<PendingConnectionRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await fetchPendingConnectionRequestsReceived();
    setPending(rows);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (requestId: string, accept: boolean) => {
    setBusyId(requestId);
    try {
      const ok = await respondCommunityConnectionRequest(requestId, accept);
      if (!ok) {
        toast.error("تعذّر معالجة الطلب");
        return;
      }
      toast.success(accept ? "تمت إضافة الصديق" : "تم رفض الطلب");
      await load();
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  if (!pending.length) {
    if (compact) return null;
    return (
      <section className="mb-4">
        <h2 className="mb-2 text-[13px] font-extrabold text-[#3a2a18]">طلبات صداقة</h2>
        <div className="rounded-[18px] border border-dashed border-alpha/30 bg-white/60 px-4 py-10 text-center">
          <UserPlus className="mx-auto h-8 w-8 text-alpha-muted/60" strokeWidth={1.8} />
          <p className="mt-3 text-[13px] font-extrabold text-alpha-heading">لا طلبات معلّقة</p>
          <p className="mt-1 text-[11px] font-semibold text-alpha-muted">
            عندما يرسل أحد طلب صداقة سيظهر هنا
          </p>
        </div>
      </section>
    );
  }

  if (compact) {
    const first = pending[0]!;
    return (
      <Link
        to="/community/friends"
        className="mb-3 flex items-center gap-3 rounded-[18px] border border-[#8a6ec1]/30 bg-[#8a6ec1]/10 px-3.5 py-3 active:scale-[0.99]"
      >
        <UserPlus className="h-4 w-4 shrink-0 text-[#8a6ec1]" />
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[12px] font-extrabold text-[#3a2a18]">
            {pending.length} طلب{pending.length > 1 ? "ات" : ""} صداقة
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[#6a543a]">
            {first.fromName} يريد إضافتك
          </p>
        </div>
      </Link>
    );
  }

  return (
    <section className="mb-4">
      <h2 className="mb-2 text-[13px] font-extrabold text-[#3a2a18]">طلبات صداقة</h2>
      <div className="space-y-2">
        {pending.map((req) => (
          <div
            key={req.id}
            className="flex items-center gap-3 rounded-[18px] border border-[#8a6ec1]/25 bg-white/82 px-3 py-3"
          >
            <PrayerUserAvatar name={req.fromName} avatarUrl={req.fromAvatarUrl} size="md" />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[14px] font-extrabold text-[#3a2a18]">{req.fromName}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#7a6548]">
                {req.note?.trim() || "يريد إضافتك كصديق"}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                disabled={busyId === req.id}
                aria-label="قبول"
                onClick={() => void respond(req.id, true)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 text-[#1f8a5a] active:scale-95 disabled:opacity-50"
              >
                <Check className="h-4 w-4" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                disabled={busyId === req.id}
                aria-label="رفض"
                onClick={() => void respond(req.id, false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-red-200/60 bg-red-50/80 text-red-600 active:scale-95 disabled:opacity-50"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
