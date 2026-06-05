import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft, Heart, Sparkles, Users, Clock, HandHeart, Flame,
  ShieldCheck, MessageSquareHeart, Send, X, Plus, Check,
} from "lucide-react";
import {
  PRAYER_REQUESTS, PRAYER_TABS, filterPrayers, prayerStats,
  ENCOURAGEMENT_MESSAGES, ENCOURAGEMENT_TOTAL, ENCOURAGEMENT_CHIPS, ENCOURAGEMENT_MAX,
  type PrayerFilter, type PrayerRequest, type EncouragementMessage,
} from "@/data/prayer-requests";

export const Route = createFileRoute("/prayer-requests")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "طلبات الصلاة — ألفا" },
      { name: "description", content: "طلبات الصلاة في كنيستك. شارك في الصلاة من أجل إخوتك." },
    ],
  }),
  component: PrayerRequestsScreen,
});

function PrayerRequestsScreen() {
  const [tab, setTab] = useState<PrayerFilter>("all");
  const [prayedIds, setPrayedIds] = useState<Set<string>>(() => new Set());
  const [messages, setMessages] = useState<EncouragementMessage[]>(ENCOURAGEMENT_MESSAGES);
  const [encourageFor, setEncourageFor] = useState<PrayerRequest | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [items, setItems] = useState<PrayerRequest[]>(PRAYER_REQUESTS);

  const filtered = useMemo(
    () => filterPrayers(items, tab).sort((a, b) => a.ageMinutes - b.ageMinutes),
    [items, tab]
  );
  const stats = useMemo(() => prayerStats(items), [items]);
  const prayedCount = prayedIds.size;
  const totalMessages = ENCOURAGEMENT_TOTAL + (messages.length - ENCOURAGEMENT_MESSAGES.length);

  const togglePray = (id: string) => {
    setPrayedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addEncouragement = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      { id: `local-${Date.now()}`, author: "أنت", text: trimmed.slice(0, ENCOURAGEMENT_MAX), time: "الآن" },
      ...prev,
    ]);
    setEncourageFor(null);
  };

  const addRequest = (title: string, body: string) => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    const item: PrayerRequest = {
      id: `local-${Date.now()}`,
      name: "أنت",
      title: t,
      request: b,
      time: "الآن",
      ageMinutes: 0,
      prayers: 0,
      category: "طلبة",
      status: "active",
      mine: true,
    };
    setItems((prev) => [item, ...prev]);
    setShowAdd(false);
  };

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.22), transparent 65%)",
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.6) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-extrabold text-[#3a2a18]">طلبات الصلاة</h1>
          <button
            type="button"
            aria-label="إضافة طلبة"
            onClick={() => setShowAdd(true)}
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-gradient-to-l from-[#c79356] to-[#d6a862] text-white active:scale-90 transition-transform shadow-[0_8px_20px_-10px_rgba(199,147,86,0.7)]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatBox icon={Sparkles} value={stats.active} label="طلب نشط" tone="#8a6ec1" />
          <StatBox icon={HandHeart} value={stats.peoplePrayed + prayedCount} label="صلّوا" tone="#1f8a5a" />
          <StatBox icon={MessageSquareHeart} value={totalMessages} label="رسالة" tone="#c44569" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {PRAYER_TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold transition-all border " +
                  (active
                    ? "bg-gradient-to-l from-[#c79356] to-[#d6a862] text-white border-transparent shadow-[0_6px_14px_-8px_rgba(199,147,86,0.7)]"
                    : "bg-white/80 text-[#7a5a30] border-[#efe2c4]")
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white/70 border border-dashed border-[#c79356]/40 p-6 text-center">
              <Sparkles className="h-6 w-6 text-[#8a6ec1] mx-auto" strokeWidth={2.2} />
              <p className="mt-2 text-[12.5px] font-bold text-[#7a5a30]">لا توجد طلبات في هذا التصنيف</p>
            </div>
          ) : (
            filtered.map((req) => {
              const hasPrayed = prayedIds.has(req.id);
              const liveCount = req.prayers + (hasPrayed ? 1 : 0);
              return (
                <div
                  key={req.id}
                  className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl p-4 shadow-[0_16px_40px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]"
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#8a6ec1]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#6a4ab5] border border-[#8a6ec1]/25">
                      <HandHeart className="h-2.5 w-2.5" strokeWidth={2.8} />
                      {req.category}
                    </span>
                    {req.status === "urgent" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#c44569]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#a8344f] border border-[#c44569]/25">
                        <Flame className="h-2.5 w-2.5" strokeWidth={2.8} />
                        عاجلة
                      </span>
                    ) : req.status === "answered" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#136a44] border border-[#1f8a5a]/25">
                        <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.8} />
                        تمت الصلاة
                      </span>
                    ) : null}
                    <span className="ms-auto inline-flex items-center gap-1 text-[10px] font-bold text-[#7a5a30]">
                      <Clock className="h-2.5 w-2.5" />
                      {req.time}
                    </span>
                  </div>
                  <p className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-tight">
                    {req.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6a543a] leading-snug">{req.request}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#7a5a30]">{req.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#c79356]/12 px-2 py-0.5 text-[10.5px] font-extrabold text-[#8a6325] border border-[#c79356]/25">
                      <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
                      {liveCount.toLocaleString("ar-EG")} صلّوا
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => togglePray(req.id)}
                      aria-pressed={hasPrayed}
                      className={
                        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-extrabold transition-all active:scale-[0.98] border " +
                        (hasPrayed
                          ? "bg-gradient-to-l from-[#1f8a5a] to-[#2ea870] text-white border-transparent shadow-[0_10px_22px_-12px_rgba(31,138,90,0.7)]"
                          : "bg-gradient-to-l from-[#8a6ec1] to-[#a07ec4] text-white border-transparent shadow-[0_10px_22px_-12px_rgba(138,110,193,0.7)]")
                      }
                    >
                      {hasPrayed ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <HandHeart className="h-3.5 w-3.5" strokeWidth={2.6} />}
                      {hasPrayed ? "تمت الصلاة" : "صليت لأجلها"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEncourageFor(req)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-extrabold border bg-white/85 text-[#7a5a30] border-[#efe2c4] active:scale-[0.98] transition-all"
                    >
                      <MessageSquareHeart className="h-3.5 w-3.5" strokeWidth={2.6} />
                      تشجيع
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Encouragement Messages */}
        <section>
          <h2 className="mb-2 text-[14px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5 px-1">
            <MessageSquareHeart className="h-4 w-4 text-[#c44569]" strokeWidth={2.6} />
            رسائل التشجيع
          </h2>
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white/85 border border-white/80 px-3 py-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
              >
                <p className="text-[12.5px] text-[#3a2a18] leading-snug">{m.text}</p>
                <div className="mt-1 flex items-center justify-between text-[10.5px] text-[#7a5a30]">
                  <span className="font-bold">{m.author}</span>
                  <span>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {encourageFor ? (
        <EncourageModal onClose={() => setEncourageFor(null)} onSend={addEncouragement} />
      ) : null}
      {showAdd ? (
        <AddRequestModal onClose={() => setShowAdd(false)} onAdd={addRequest} />
      ) : null}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </main>
  );
}

function StatBox({ icon: Icon, value, label, tone }: { icon: any; value: number; label: string; tone: string }) {
  return (
    <div className="rounded-[20px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl p-3 text-center shadow-[0_12px_28px_-18px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div
        className="mx-auto grid h-9 w-9 place-items-center rounded-xl border border-white/70"
        style={{ background: `linear-gradient(160deg, ${tone}22, ${tone}55)`, color: tone }}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
      </div>
      <p className="mt-1.5 text-[18px] font-extrabold text-[#3a2a18] leading-none">
        {value.toLocaleString("ar-EG")}
      </p>
      <p className="mt-1 text-[10px] font-bold text-[#6a543a] leading-none">{label}</p>
    </div>
  );
}

function EncourageModal({
  onClose, onSend,
}: { onClose: () => void; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const remaining = ENCOURAGEMENT_MAX - text.length;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center px-4">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[340px] rounded-3xl border border-white/70 bg-[#fbf3e1] shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] p-4 text-right">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
            <MessageSquareHeart className="h-4 w-4 text-[#c44569]" strokeWidth={2.6} />
            رسالة تشجيع
          </h4>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#7a5a30] active:scale-90">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, ENCOURAGEMENT_MAX))}
          maxLength={ENCOURAGEMENT_MAX}
          rows={3}
          placeholder="اكتب كلمة تشجيع أو صلاة قصيرة"
          className="w-full resize-none rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[12.5px] text-[#3a2a18] placeholder:text-[#a89878] focus:outline-none focus:ring-2 focus:ring-[#c79356]/40"
        />
        <div className="mt-1 text-[10px] text-[#7a5a30]">{remaining.toLocaleString("ar-EG")} حرف متبقي</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ENCOURAGEMENT_CHIPS.map((c) => (
            <button
              key={c.text}
              type="button"
              onClick={() => setText(`${c.emoji} ${c.text}`.slice(0, ENCOURAGEMENT_MAX))}
              className="rounded-full bg-white/80 border border-[#efe2c4] px-2.5 py-1 text-[11px] font-bold text-[#7a5a30] active:scale-95"
            >
              {c.emoji} {c.text}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/80 border border-[#efe2c4] py-2 text-[12px] font-extrabold text-[#7a5a30]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onSend(text)}
            disabled={!text.trim()}
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#c44569] to-[#d96585] py-2 text-[12px] font-extrabold text-white disabled:opacity-50 shadow-[0_10px_22px_-12px_rgba(196,69,105,0.7)]"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2.6} />
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}

function AddRequestModal({
  onClose, onAdd,
}: { onClose: () => void; onAdd: (title: string, body: string) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center px-4">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[360px] rounded-3xl border border-white/70 bg-[#fbf3e1] shadow-[0_30px_60px_-20px_rgba(60,40,16,0.6)] p-4 text-right">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
            <HandHeart className="h-4 w-4 text-[#8a6ec1]" strokeWidth={2.6} />
            طلبة صلاة جديدة
          </h4>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#7a5a30] active:scale-90">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الطلبة"
          className="w-full rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[13px] text-[#3a2a18] placeholder:text-[#a89878] focus:outline-none focus:ring-2 focus:ring-[#c79356]/40"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="تفاصيل الطلبة"
          className="mt-2 w-full resize-none rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[12.5px] text-[#3a2a18] placeholder:text-[#a89878] focus:outline-none focus:ring-2 focus:ring-[#c79356]/40"
        />
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/80 border border-[#efe2c4] py-2 text-[12px] font-extrabold text-[#7a5a30]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onAdd(title, body)}
            disabled={!title.trim() || !body.trim()}
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#c79356] to-[#d6a862] py-2 text-[12px] font-extrabold text-white disabled:opacity-50 shadow-[0_10px_22px_-12px_rgba(199,147,86,0.7)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
