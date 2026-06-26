import { useEffect, useMemo, useState } from "react";
import { X, Check, MessageSquareWarning, Ban, Clock, MapPin, Users, User } from "lucide-react";
import type { ChurchPost } from "@/data/church-posts";
import { fetchChurchPosts } from "@/features/church/church-posts-api";
import {
  approveTripPost,
  rejectTripPost,
  requestTripChanges,
  subscribeTripApprovalChanged,
} from "../trip-approval-workflow";
import { filterPendingTripPosts } from "../trip-organizer-access";

const GLASS =
  "rounded-[22px] border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_16px_36px_-20px_rgba(60,40,16,0.42),inset_0_1px_0_rgba(255,255,255,0.75)]";

export function TripApprovalSheet({
  churchId,
  churchName,
  onClose,
  onChanged,
}: {
  churchId: string;
  churchName: string;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [posts, setPosts] = useState<ChurchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pending = useMemo(() => filterPendingTripPosts(posts), [posts]);
  const selected = pending.find((p) => p.id === selectedId) ?? pending[0] ?? null;

  const refresh = async () => {
    setLoading(true);
    const rows = await fetchChurchPosts(churchId);
    setPosts(rows);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    const unsub = subscribeTripApprovalChanged(() => void refresh());
    return unsub;
  }, [churchId]);

  async function act(kind: "approve" | "changes" | "reject") {
    if (!selected || busy) return;
    setBusy(true);
    let result: { ok: boolean; error?: string };
    if (kind === "approve") {
      result = await approveTripPost(churchId, selected.id, churchName);
    } else if (kind === "changes") {
      result = await requestTripChanges(selected.id, note);
    } else {
      result = await rejectTripPost(selected.id, note);
    }
    setBusy(false);
    if (!result.ok) return;
    setNote("");
    onChanged?.();
    await refresh();
    if (kind !== "changes") onClose();
  }

  return (
    <div role="dialog" aria-modal="true" dir="rtl" className="fixed inset-0 z-[75] flex flex-col bg-[#f4ead8]">
      <div className="sticky top-0 z-10 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] bg-[#f4ead8]/95 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="إغلاق" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4]">
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-[15px] font-extrabold text-[#3a2a18]">مراجعة الرحلات</h2>
          <span className="w-10" />
        </div>
        <p className="mt-1 text-center text-[10px] text-[#7a5a30]">ALPHA-084 · بانتظار الاعتماد</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {loading ? (
          <p className="text-center text-[13px] font-bold text-[#6a543a] py-8">جاري التحميل…</p>
        ) : pending.length === 0 ? (
          <div className={GLASS + " text-center py-10 px-4"}>
            <Clock className="mx-auto h-8 w-8 text-[#b8893a]/80 mb-2" />
            <p className="text-[13px] font-bold text-[#6a543a]">لا توجد رحلات بانتظار المراجعة</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pending.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={[
                    "shrink-0 rounded-2xl px-3 py-2 text-[11px] font-extrabold border transition-colors",
                    (selected?.id === p.id)
                      ? "bg-[#1f8a5a] text-white border-[#1f8a5a]"
                      : "bg-white/60 text-[#3a2a18] border-[#efe2c4]",
                  ].join(" ")}
                >
                  {p.title}
                </button>
              ))}
            </div>

            {selected ? (
              <div className={GLASS + " p-4 space-y-3"}>
                <div>
                  <p className="text-[16px] font-extrabold text-[#3a2a18]">{selected.title}</p>
                  <p className="text-[11px] text-[#8a6a3a] mt-1">{selected.excerpt}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#5a4030]">
                    <User className="h-3.5 w-3.5 text-[#b8893a]" />
                    <span className="font-bold">المنظم:</span>
                    <span>{selected.details?.organizerName || selected.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5a4030]">
                    <Users className="h-3.5 w-3.5 text-[#1f8a5a]" />
                    <span className="font-bold">السعة:</span>
                    <span>{selected.details?.seats ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5a4030]">
                    <Clock className="h-3.5 w-3.5 text-[#8a6ec1]" />
                    <span className="font-bold">الموعد:</span>
                    <span>{selected.details?.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5a4030]">
                    <MapPin className="h-3.5 w-3.5 text-[#c44569]" />
                    <span className="font-bold">الوجهة:</span>
                    <span className="truncate">{selected.details?.places || "—"}</span>
                  </div>
                </div>
                {selected.details?.price ? (
                  <p className="text-[11px] font-bold text-[#1f8a5a]">السعر: {selected.details.price}</p>
                ) : null}
                {selected.details?.program ? (
                  <p className="text-[11px] text-[#5a4030] leading-relaxed whitespace-pre-wrap">{selected.details.program}</p>
                ) : null}
                {selected.body ? (
                  <p className="text-[11px] text-[#6a543a] leading-relaxed">{selected.body}</p>
                ) : null}

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ملاحظة للمنظم (عند طلب تعديل أو الرفض)"
                  rows={2}
                  className="w-full rounded-xl border border-[#efe2c4] bg-white/70 px-3 py-2 text-[12px] text-[#3a2a18] resize-none"
                />

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act("approve")}
                    className="min-h-[48px] rounded-2xl bg-gradient-to-l from-[#1a7a4a] to-[#2f9d6e] text-white text-[14px] font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" /> اعتماد ونشر الرحلة
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act("changes")}
                    className="min-h-[44px] rounded-2xl bg-[#fff8e8] border border-[#e7c97a] text-[#8a6a1e] text-[13px] font-extrabold inline-flex items-center justify-center gap-2"
                  >
                    <MessageSquareWarning className="h-4 w-4" /> طلب تعديل
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act("reject")}
                    className="min-h-[44px] rounded-2xl bg-[#fde8e8] border border-[#e8b4b4] text-[#9a3030] text-[13px] font-extrabold inline-flex items-center justify-center gap-2"
                  >
                    <Ban className="h-4 w-4" /> رفض
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
