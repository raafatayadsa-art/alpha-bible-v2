import { useEffect, useState } from "react";
import { HandHeart, Send } from "lucide-react";
import {
  listTripPrayerRequests,
  reactToTripPrayer,
  submitTripPrayerRequest,
  subscribeTripPrayers,
  syncTripPrayersFromDb,
} from "../trip-prayer-requests";

const GLASS = "rounded-2xl border border-[#efe2c4] bg-white/60 p-3";

export function TripPrayerPanel({ postId }: { postId: string }) {
  const [requests, setRequests] = useState(() => listTripPrayerRequests(postId));
  const [body, setBody] = useState("");
  const [shareOrg, setShareOrg] = useState(true);

  useEffect(() => subscribeTripPrayers(() => setRequests(listTripPrayerRequests(postId))), [postId]);

  useEffect(() => {
    void syncTripPrayersFromDb(postId).then(() => setRequests(listTripPrayerRequests(postId)));
  }, [postId]);

  return (
    <section className={GLASS + " text-right mt-3"} dir="rtl">
      <p className="text-[12px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
        <HandHeart className="h-4 w-4 text-[#8a6ec1]" /> طلبات الصلاة
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="شارك طلب صلاة مع المشاركين…"
        className="mt-2 w-full rounded-xl border border-[#efe2c4] bg-white/80 px-3 py-2 text-[12px] resize-none"
      />
      <label className="mt-1 flex items-center justify-end gap-2 text-[10px] text-[#6a543a]">
        <input type="checkbox" checked={shareOrg} onChange={(e) => setShareOrg(e.target.checked)} />
        مشاركة مع المنظمين
      </label>
      <button
        type="button"
        disabled={!body.trim()}
        onClick={() => {
          submitTripPrayerRequest(postId, body, shareOrg);
          setBody("");
        }}
        className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded-full bg-[#8a6ec1] text-white text-[11px] font-extrabold py-2 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5 -scale-x-100" /> إرسال
      </button>
      {requests.length > 0 ? (
        <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto">
          {requests.slice(0, 5).map((r) => (
            <li key={r.id} className="rounded-xl bg-white/70 border border-[#efe2c4] px-2.5 py-2">
              <p className="text-[10px] font-bold text-[#7a5a30]">{r.authorName}</p>
              <p className="text-[11px] text-[#3a2a18] mt-0.5">{r.body}</p>
              <button
                type="button"
                onClick={() => reactToTripPrayer(r.id)}
                className="mt-1 text-[10px] font-extrabold text-[#8a6ec1]"
              >
                🙏 {r.reactions}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
