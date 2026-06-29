import { useEffect, useState } from "react";
import { Clock, Check, X } from "lucide-react";
import {
  confirmWaitlistOffer,
  declineWaitlistOffer,
  msUntilOfferExpiry,
  myWaitlistEntry,
  subscribeTripWaitlist,
  subscribeTripWaitlistRealtime,
  syncTripWaitlistFromDb,
  type TripWaitlistEntry,
} from "../trip-waitlist";

function formatCountdown(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function WaitlistOfferBanner({ postId }: { postId: string }) {
  const [entry, setEntry] = useState<TripWaitlistEntry | undefined>(() => {
    const mine = myWaitlistEntry(postId);
    return mine?.status === "offered" ? mine : undefined;
  });
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const mine = myWaitlistEntry(postId);
      setEntry(mine?.status === "offered" ? mine : undefined);
    };
    refresh();
    const offLocal = subscribeTripWaitlist(refresh);
    void syncTripWaitlistFromDb(postId).then(refresh);
    const offRealtime = subscribeTripWaitlistRealtime(postId);
    return () => {
      offLocal();
      offRealtime();
    };
  }, [postId]);

  useEffect(() => {
    if (!entry) return;
    const tick = () => setRemaining(msUntilOfferExpiry(entry));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [entry]);

  if (!entry) return null;

  return (
    <div className="rounded-2xl border border-[#e7c97a] bg-[#fff8e8] p-3 mb-3 text-right">
      <p className="text-[12px] font-extrabold text-[#8a6a1e] inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        مكان متاح لك من قائمة الانتظار!
      </p>
      <p className="mt-1 text-[11px] text-[#6a543a]">
        {entry.seats.toLocaleString("ar-EG")} مكان · أكّد خلال {formatCountdown(remaining)}
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={busy || remaining <= 0}
          onClick={async () => {
            setBusy(true);
            await confirmWaitlistOffer(entry.id);
            setBusy(false);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-[#1f8a5a] text-white text-[11px] font-extrabold py-2 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> تأكيد الحجز
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => declineWaitlistOffer(entry.id)}
          className="inline-flex items-center justify-center rounded-full bg-white border border-[#efe2c4] px-3 py-2 text-[#6a543a]"
          aria-label="رفض"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
