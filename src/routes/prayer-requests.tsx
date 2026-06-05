import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft, Heart, Sparkles, Clock, HandHeart, Flame,
  ShieldCheck, MessageSquareHeart, Send, X, Plus, Check, EyeOff, User as UserIcon,
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

/* === Prayer Screen Visual Identity ===
   Soft transparent prayer red + burgundy glass accents.
   Different glass tones per section: red (header/cards), burgundy (encourage), purple (stats). */
const RED_SOFT = "rgba(196, 69, 89, 0.10)";
const RED_BORDER = "rgba(154, 36, 56, 0.22)";
const BURGUNDY_SOFT = "rgba(122, 30, 50, 0.12)";
const BURGUNDY_BORDER = "rgba(90, 20, 38, 0.28)";

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

  const addEncouragement = (text: string, anonymous: boolean) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      {
        id: `local-${Date.now()}`,
        author: anonymous ? "عضو الكنيسة" : "أنت",
        text: trimmed.slice(0, ENCOURAGEMENT_MAX),
        time: "الآن",
        anonymous,
      },
      ...prev,
    ]);
    setEncourageFor(null);
  };

  const addRequest = (title: string, body: string, anonymous: boolean) => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    const item: PrayerRequest = {
      id: `local-${Date.now()}`,
      name: anonymous ? "طلب صلاة مجهول" : "أنت",
      title: t,
      request: b,
      time: "الآن",
      ageMinutes: 0,
      prayers: 0,
      category: "طلبة",
      status: "active",
      mine: true,
      anonymous,
    };
    setItems((prev) => [item, ...prev]);
    setShowAdd(false);
  };

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      {/* Unique prayer-screen background — warm cream w/ soft red + burgundy halos */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(212, 96, 110, 0.18), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(122, 30, 50, 0.14), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.22), transparent 65%)",
        }}
      />

      {/* Header — soft red glass */}
      <header
        className="sticky top-0 z-30 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,232,232,0.92) 0%, rgba(244,234,216,0.55) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/85 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-extrabold text-[#5a1426] inline-flex items-center gap-1.5">
            <HandHeart className="h-4 w-4 text-[#a82747]" strokeWidth={2.6} />
            طلبات الصلاة
          </h1>
          <button
            type="button"
            aria-label="إضافة طلبة"
            onClick={() => setShowAdd(true)}
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-gradient-to-l from-[#a82747] to-[#c4566e] text-white active:scale-90 transition-transform shadow-[0_8px_20px_-10px_rgba(168,39,71,0.7)]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-[440px] pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-5">
        {/* Stats — purple glass */}
        <div className="px-4 grid grid-cols-3 gap-2">
          <StatBox icon={Sparkles} value={stats.active} label="طلب نشط" tone="#8a6ec1" />
          <StatBox icon={HandHeart} value={stats.peoplePrayed + prayedCount} label="صلّوا" tone="#a82747" />
          <StatBox icon={MessageSquareHeart} value={totalMessages} label="رسالة" tone="#5a1426" />
        </div>

        {/* Tabs */}
        <div className="px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                    ? "bg-gradient-to-l from-[#a82747] to-[#c4566e] text-white border-transparent shadow-[0_6px_14px_-8px_rgba(168,39,71,0.7)]"
                    : "bg-white/80 text-[#7a1e32] border-[#efd5d9]")
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal carousel — compact prayer request cards */}
        <section>
          {filtered.length === 0 ? (
            <div className="mx-4 rounded-2xl bg-white/70 border border-dashed border-[#c4566e]/40 p-6 text-center">
              <Sparkles className="h-6 w-6 text-[#a82747] mx-auto" strokeWidth={2.2} />
              <p className="mt-2 text-[12.5px] font-bold text-[#7a1e32]">لا توجد طلبات في هذا التصنيف</p>
            </div>
          ) : (
            <div
              className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4"
              style={{ scrollPaddingInline: 16 }}
            >
              {filtered.map((req) => {
                const hasPrayed = prayedIds.has(req.id);
                const liveCount = req.prayers + (hasPrayed ? 1 : 0);
                return (
                  <article
                    key={req.id}
                    className="snap-start shrink-0 w-[78%] max-w-[300px] rounded-[22px] p-3.5 backdrop-blur-xl"
                    style={{
                      background: `linear-gradient(160deg, ${RED_SOFT}, rgba(255,255,255,0.78))`,
                      border: `1px solid ${RED_BORDER}`,
                      boxShadow:
                        "0 16px 40px -22px rgba(122,30,50,0.45),inset 0 1px 0 rgba(255,255,255,0.85)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#8a6ec1]/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#6a4ab5] border border-[#8a6ec1]/25">
                        <HandHeart className="h-2.5 w-2.5" strokeWidth={2.8} />
                        {req.category}
                      </span>
                      {req.status === "urgent" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#a82747]/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#7a1e32] border border-[#a82747]/30">
                          <Flame className="h-2.5 w-2.5" strokeWidth={2.8} />
                          عاجلة
                        </span>
                      ) : req.status === "answered" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#136a44] border border-[#1f8a5a]/25">
                          <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.8} />
                          تمت
                        </span>
                      ) : null}
                      <span className="ms-auto inline-flex items-center gap-1 text-[9.5px] font-bold text-[#7a1e32]">
                        <Clock className="h-2.5 w-2.5" />
                        {req.time}
                      </span>
                    </div>
                    <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a0e1c] leading-tight line-clamp-1">
                      {req.title}
                    </p>
                    <p className="mt-1 text-[11.5px] text-[#5a3a40] leading-snug line-clamp-2 min-h-[2.6em]">
                      {req.request}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#7a1e32]">
                        {req.anonymous ? <EyeOff className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
                        {req.anonymous ? "طلب صلاة مجهول" : req.name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#a82747]/12 px-1.5 py-0.5 text-[10px] font-extrabold text-[#7a1e32] border border-[#a82747]/25">
                        <Heart className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                        {liveCount.toLocaleString("ar-EG")}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => togglePray(req.id)}
                        aria-pressed={hasPrayed}
                        className={
                          "inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-extrabold transition-all active:scale-[0.98] border " +
                          (hasPrayed
                            ? "bg-gradient-to-l from-[#1f8a5a] to-[#2ea870] text-white border-transparent shadow-[0_8px_18px_-12px_rgba(31,138,90,0.7)]"
                            : "bg-gradient-to-l from-[#a82747] to-[#c4566e] text-white border-transparent shadow-[0_8px_18px_-12px_rgba(168,39,71,0.7)]")
                        }
                      >
                        {hasPrayed ? <Check className="h-3 w-3" strokeWidth={3} /> : <HandHeart className="h-3 w-3" strokeWidth={2.6} />}
                        {hasPrayed ? "تمت" : "صليت"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEncourageFor(req)}
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-extrabold border bg-white/85 text-[#7a1e32] border-[#efd5d9] active:scale-[0.98] transition-all"
                      >
                        <MessageSquareHeart className="h-3 w-3" strokeWidth={2.6} />
                        تشجيع
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Encouragement Messages — burgundy glass section */}
        <section className="px-4">
          <h2 className="mb-2 text-[14px] font-extrabold text-[#5a1426] inline-flex items-center gap-1.5 px-1">
            <MessageSquareHeart className="h-4 w-4 text-[#7a1e32]" strokeWidth={2.6} />
            رسائل التشجيع
          </h2>
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl px-3 py-2.5 text-right backdrop-blur-xl"
                style={{
                  background: `linear-gradient(160deg, ${BURGUNDY_SOFT}, rgba(255,255,255,0.85))`,
                  border: `1px solid ${BURGUNDY_BORDER}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <p className="text-[12.5px] text-[#3a0e1c] leading-snug">{m.text}</p>
                <div className="mt-1 flex items-center justify-between text-[10.5px] text-[#7a1e32]">
                  <span className="inline-flex items-center gap-1 font-bold">
                    {m.anonymous ? <EyeOff className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
                    {m.anonymous ? "عضو الكنيسة" : m.author}
                  </span>
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
    <div
      className="rounded-[20px] p-3 text-center backdrop-blur-xl"
      style={{
        background: `linear-gradient(160deg, ${tone}1c, rgba(255,255,255,0.82))`,
        border: `1px solid ${tone}33`,
        boxShadow: `0 12px 28px -18px ${tone}55,inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      <div
        className="mx-auto grid h-9 w-9 place-items-center rounded-xl border border-white/70"
        style={{ background: `linear-gradient(160deg, ${tone}22, ${tone}55)`, color: tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <p className="mt-1.5 text-[18px] font-extrabold text-[#3a0e1c] leading-none">
        {value.toLocaleString("ar-EG")}
      </p>
      <p className="mt-1 text-[10px] font-bold text-[#5a3a40] leading-none">{label}</p>
    </div>
  );
}

/* === Privacy toggle (shared between modals) === */
function PrivacyToggle({
  anonymous, onChange, withMeLabel, anonLabel,
}: {
  anonymous: boolean;
  onChange: (v: boolean) => void;
  withMeLabel: string;
  anonLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-full bg-white/70 border border-[#efd5d9] p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={
          "inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-extrabold transition " +
          (!anonymous
            ? "bg-gradient-to-l from-[#a82747] to-[#c4566e] text-white shadow-[0_6px_14px_-8px_rgba(168,39,71,0.7)]"
            : "text-[#7a1e32]")
        }
      >
        <UserIcon className="h-3 w-3" strokeWidth={2.6} />
        {withMeLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={
          "inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-extrabold transition " +
          (anonymous
            ? "bg-gradient-to-l from-[#5a1426] to-[#7a1e32] text-white shadow-[0_6px_14px_-8px_rgba(90,20,38,0.7)]"
            : "text-[#7a1e32]")
        }
      >
        <EyeOff className="h-3 w-3" strokeWidth={2.6} />
        {anonLabel}
      </button>
    </div>
  );
}

function EncourageModal({
  onClose, onSend,
}: { onClose: () => void; onSend: (text: string, anonymous: boolean) => void }) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const remaining = ENCOURAGEMENT_MAX - text.length;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center px-4">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#3a0e1c]/45 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[340px] rounded-3xl p-4 text-right backdrop-blur-2xl"
        style={{
          background: `linear-gradient(160deg, ${BURGUNDY_SOFT}, rgba(251,243,225,0.96))`,
          border: `1px solid ${BURGUNDY_BORDER}`,
          boxShadow: "0 30px 60px -20px rgba(60,16,28,0.6)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-arabic-serif text-[15px] font-extrabold text-[#5a1426] inline-flex items-center gap-1.5">
            <MessageSquareHeart className="h-4 w-4 text-[#a82747]" strokeWidth={2.6} />
            رسالة تشجيع
          </h4>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efd5d9] text-[#7a1e32] active:scale-90">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, ENCOURAGEMENT_MAX))}
          maxLength={ENCOURAGEMENT_MAX}
          rows={3}
          placeholder="اكتب كلمة تشجيع أو صلاة قصيرة"
          className="w-full resize-none rounded-2xl bg-white/90 border border-[#efd5d9] px-3 py-2 text-[12.5px] text-[#3a0e1c] placeholder:text-[#b89098] focus:outline-none focus:ring-2 focus:ring-[#a82747]/40"
        />
        <div className="mt-1 text-[10px] text-[#7a1e32]">{remaining.toLocaleString("ar-EG")} حرف متبقي</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ENCOURAGEMENT_CHIPS.map((c) => (
            <button
              key={c.text}
              type="button"
              onClick={() => setText(`${c.emoji} ${c.text}`.slice(0, ENCOURAGEMENT_MAX))}
              className="rounded-full bg-white/80 border border-[#efd5d9] px-2.5 py-1 text-[11px] font-bold text-[#7a1e32] active:scale-95"
            >
              {c.emoji} {c.text}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <PrivacyToggle
            anonymous={anonymous}
            onChange={setAnonymous}
            withMeLabel="إرسال باسمي"
            anonLabel="إرسال مجهول"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/80 border border-[#efd5d9] py-2 text-[12px] font-extrabold text-[#7a1e32]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onSend(text, anonymous)}
            disabled={!text.trim()}
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#a82747] to-[#c4566e] py-2 text-[12px] font-extrabold text-white disabled:opacity-50 shadow-[0_10px_22px_-12px_rgba(168,39,71,0.7)]"
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
}: { onClose: () => void; onAdd: (title: string, body: string, anonymous: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center px-4">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#3a0e1c]/45 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[360px] rounded-3xl p-4 text-right backdrop-blur-2xl"
        style={{
          background: `linear-gradient(160deg, ${RED_SOFT}, rgba(251,243,225,0.96))`,
          border: `1px solid ${RED_BORDER}`,
          boxShadow: "0 30px 60px -20px rgba(60,16,28,0.6)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-arabic-serif text-[15px] font-extrabold text-[#5a1426] inline-flex items-center gap-1.5">
            <HandHeart className="h-4 w-4 text-[#a82747]" strokeWidth={2.6} />
            طلبة صلاة جديدة
          </h4>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efd5d9] text-[#7a1e32] active:scale-90">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الطلبة"
          className="w-full rounded-2xl bg-white/90 border border-[#efd5d9] px-3 py-2 text-[13px] text-[#3a0e1c] placeholder:text-[#b89098] focus:outline-none focus:ring-2 focus:ring-[#a82747]/40"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="تفاصيل الطلبة"
          className="mt-2 w-full resize-none rounded-2xl bg-white/90 border border-[#efd5d9] px-3 py-2 text-[12.5px] text-[#3a0e1c] placeholder:text-[#b89098] focus:outline-none focus:ring-2 focus:ring-[#a82747]/40"
        />
        <div className="mt-3">
          <PrivacyToggle
            anonymous={anonymous}
            onChange={setAnonymous}
            withMeLabel="إظهار اسمي"
            anonLabel="مجهول"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/80 border border-[#efd5d9] py-2 text-[12px] font-extrabold text-[#7a1e32]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onAdd(title, body, anonymous)}
            disabled={!title.trim() || !body.trim()}
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#a82747] to-[#c4566e] py-2 text-[12px] font-extrabold text-white disabled:opacity-50 shadow-[0_10px_22px_-12px_rgba(168,39,71,0.7)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
