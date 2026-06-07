import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Heart, Sparkles, Clock, HandHeart, Flame,
  ShieldCheck, MessageSquareHeart, Send, X, Check, EyeOff, User as UserIcon,
} from "lucide-react";
import { CopticWatermark } from "@/components/coptic";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation/AlphaHeader";
import {
  PRAYER_REQUESTS, PRAYER_TABS, filterPrayers, prayerStats,
  ENCOURAGEMENT_MESSAGES, ENCOURAGEMENT_TOTAL, ENCOURAGEMENT_CHIPS, ENCOURAGEMENT_MAX,
  type PrayerFilter, type PrayerRequest, type EncouragementMessage, type PrayerCategory,
} from "@/data/prayer-requests";
import {
  PrayerUserAvatar, PrayerStackAvatars, firstNameFrom,
} from "@/features/prayer/prayer-avatars";

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
   Warm Alpha palette — gold, beige, lavender, soft blue accents.
   Category-tinted cards; red reserved for urgent highlights only. */
const GOLD_SOFT = "rgba(199, 147, 86, 0.12)";
const GOLD_BORDER = "rgba(184, 137, 58, 0.26)";
const LAVENDER_SOFT = "rgba(155, 135, 196, 0.11)";
const LAVENDER_BORDER = "rgba(138, 110, 193, 0.24)";

const CATEGORY_ACCENTS: Record<
  PrayerCategory,
  { soft: string; border: string; badge: string; text: string; icon: string }
> = {
  "شفاء": { soft: "rgba(155,135,196,0.14)", border: "rgba(138,110,193,0.28)", badge: "#8a6ec1", text: "#6a4ab5", icon: "#9b87c4" },
  "دراسة": { soft: "rgba(107,159,212,0.13)", border: "rgba(90,140,200,0.26)", badge: "#6b9fd4", text: "#4a7fb8", icon: "#7eb0d8" },
  "معيشة": { soft: "rgba(199,147,86,0.14)", border: "rgba(184,137,58,0.28)", badge: "#c79356", text: "#8a6325", icon: "#b8893a" },
  "زواج": { soft: "rgba(212,168,210,0.12)", border: "rgba(180,140,190,0.24)", badge: "#b491c4", text: "#7a5a90", icon: "#c4a0d4" },
  "راحة نفس": { soft: "rgba(244,234,216,0.55)", border: "rgba(210,195,170,0.32)", badge: "#a99070", text: "#6a543a", icon: "#b8893a" },
  "شكر": { soft: "rgba(106,175,138,0.13)", border: "rgba(31,138,90,0.22)", badge: "#6aaf8a", text: "#1f8a5a", icon: "#5cb88a" },
  "طلبة": { soft: "rgba(107,159,212,0.10)", border: "rgba(138,182,220,0.22)", badge: "#7eb0d8", text: "#4a7fb8", icon: "#6b9fd4" },
};

function categoryAccent(cat: PrayerCategory) {
  return CATEGORY_ACCENTS[cat] ?? CATEGORY_ACCENTS["طلبة"];
}

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
      {/* Warm spiritual background — gold + lavender + soft blue (red minimized) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(214,168,98,0.22), transparent 58%)," +
            "radial-gradient(70% 60% at 100% 28%, rgba(155,135,196,0.14), transparent 62%)," +
            "radial-gradient(80% 55% at 0% 88%, rgba(107,159,212,0.11), transparent 62%)",
        }}
      />
      {/* Candle glow + light rays */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[120%] h-[45vh] -z-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 55% 80% at 50% 0%, rgba(255,236,190,0.45), transparent 70%)," +
            "conic-gradient(from 180deg at 50% 0%, transparent, rgba(255,244,220,0.08) 10deg, transparent 20deg, rgba(255,240,200,0.06) 35deg, transparent 50deg)",
        }}
      />
      <CopticWatermark tone="light" />
      {/* Soft reflection strip */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[18vh] h-32 -z-0 opacity-30"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.35), transparent)",
        }}
      />

      {/* Header — ivory glass */}
      <AlphaHeaderShell
        sticky
        style={{
          background:
            "linear-gradient(180deg, rgba(251,243,225,0.94) 0%, rgba(244,234,216,0.58) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <AlphaHeader
          variant="internal"
          backTo="/church"
          title={
            <span className="inline-flex items-center gap-1.5">
              <HandHeart className="h-4 w-4 text-[#b8893a]" strokeWidth={2.6} />
              طلبات الصلاة
            </span>
          }
        />
      </AlphaHeaderShell>

      <div className="relative mx-auto w-full max-w-[440px] pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-5">
        {/* Stats — lavender / gold / soft blue glass */}
        <div className="px-4 grid grid-cols-3 gap-2">
          <StatBox icon={Sparkles} value={stats.active} label="طلب نشط" tone="#8a6ec1" />
          <StatBox icon={HandHeart} value={stats.peoplePrayed + prayedCount} label="صلّوا" tone="#b8893a" />
          <StatBox icon={MessageSquareHeart} value={totalMessages} label="رسالة" tone="#6b9fd4" />
        </div>

        {/* Tabs */}
        <div className="px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold transition-all border bg-gradient-to-l from-[#b8893a] to-[#c79356] text-white border-transparent shadow-[0_6px_14px_-8px_rgba(184,137,58,0.55)] active:scale-95"
          >
            طلب صلاة
          </button>
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
                    ? "bg-gradient-to-l from-[#b8893a] to-[#c79356] text-white border-transparent shadow-[0_6px_14px_-8px_rgba(184,137,58,0.55)]"
                    : "bg-white/80 text-[#5a4a38] border-[#efe2c4]")
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
            <div className="mx-4 rounded-2xl bg-white/70 border border-dashed border-[#c79356]/40 p-6 text-center">
              <Sparkles className="h-6 w-6 text-[#b8893a] mx-auto" strokeWidth={2.2} />
              <p className="mt-2 text-[12.5px] font-bold text-[#5a4a38]">لا توجد طلبات في هذا التصنيف</p>
            </div>
          ) : (
            <div
              className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4"
              style={{ scrollPaddingInline: 16 }}
            >
              {filtered.map((req) => {
                const hasPrayed = prayedIds.has(req.id);
                const liveCount = req.prayers + (hasPrayed ? 1 : 0);
                const accent = categoryAccent(req.category);
                return (
                  <article
                    key={req.id}
                    className="snap-start shrink-0 w-[78%] max-w-[300px] rounded-[22px] p-3.5 backdrop-blur-xl"
                    style={{
                      background: `linear-gradient(160deg, ${accent.soft}, rgba(255,255,255,0.82))`,
                      border: `1px solid ${accent.border}`,
                      boxShadow:
                        "0 16px 40px -22px rgba(90,70,40,0.28),inset 0 1px 0 rgba(255,255,255,0.88)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold border"
                        style={{
                          background: `${accent.badge}18`,
                          color: accent.text,
                          borderColor: `${accent.badge}33`,
                        }}
                      >
                        <HandHeart className="h-2.5 w-2.5" strokeWidth={2.8} style={{ color: accent.icon }} />
                        {req.category}
                      </span>
                      {req.status === "urgent" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#c4566e]/12 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#a8344f] border border-[#c4566e]/28">
                          <Flame className="h-2.5 w-2.5" strokeWidth={2.8} />
                          عاجلة
                        </span>
                      ) : req.status === "answered" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#6aaf8a]/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#1f8a5a] border border-[#6aaf8a]/28">
                          <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.8} />
                          تمت
                        </span>
                      ) : null}
                      <span className="ms-auto inline-flex items-center gap-1 text-[9.5px] font-bold text-[#6a543a]">
                        <Clock className="h-2.5 w-2.5 text-[#b8893a]" />
                        {req.time}
                      </span>
                    </div>
                    <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                      {req.title}
                    </p>
                    <p className="mt-1 text-[11.5px] text-[#5a4a38] leading-snug line-clamp-2 min-h-[2.6em]">
                      {req.request}
                    </p>

                    {/* Requester avatar + name */}
                    <div className="mt-2 flex items-center gap-2 min-w-0">
                      <PrayerUserAvatar
                        name={req.anonymous ? "?" : req.name}
                        avatarUrl={req.anonymous ? undefined : req.avatarUrl}
                        size="sm"
                        anonymous={req.anonymous}
                      />
                      <span className="min-w-0 text-[10.5px] font-bold text-[#5a4a38] truncate">
                        {req.anonymous ? "طلب صلاة مجهول" : req.name}
                      </span>
                    </div>

                    {/* Pray-er stack — "صلوا لأجله" */}
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white/55 border border-white/70 px-2 py-1.5">
                      <span className="text-[9.5px] font-extrabold text-[#7a6a58]">صلوا لأجله</span>
                      <span className="inline-flex items-center gap-1.5">
                        <PrayerStackAvatars
                          participants={req.prayerParticipants}
                          total={liveCount}
                          size="xs"
                        />
                        {(req.prayerParticipants ?? []).some((p) => p.avatarUrl) ? null : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#5a4a38]">
                            <Heart className="h-2.5 w-2.5 fill-current text-[#b8893a]/70" strokeWidth={0} />
                            {liveCount.toLocaleString("ar-EG")}
                          </span>
                        )}
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
                            : "bg-gradient-to-l from-[#b8893a] to-[#c79356] text-white border-transparent shadow-[0_8px_18px_-12px_rgba(184,137,58,0.55)]")
                        }
                      >
                        {hasPrayed ? <Check className="h-3 w-3" strokeWidth={3} /> : <HandHeart className="h-3 w-3" strokeWidth={2.6} />}
                        {hasPrayed ? "تمت" : "صليت"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEncourageFor(req)}
                        className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-extrabold border bg-white/85 text-[#5a4a38] border-[#efe2c4] active:scale-[0.98] transition-all"
                      >
                        <MessageSquareHeart className="h-3 w-3 text-[#8a6ec1]" strokeWidth={2.6} />
                        تشجيع
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Encouragement Messages — lavender ivory glass */}
        <section className="px-4">
          <h2 className="mb-2 text-[14px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5 px-1">
            <MessageSquareHeart className="h-4 w-4 text-[#8a6ec1]" strokeWidth={2.6} />
            رسائل التشجيع
          </h2>
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl px-3 py-2.5 text-right backdrop-blur-xl"
                style={{
                  background: `linear-gradient(160deg, ${LAVENDER_SOFT}, rgba(255,255,255,0.88))`,
                  border: `1px solid ${LAVENDER_BORDER}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92), 0 10px 24px -18px rgba(138,110,193,0.25)",
                }}
              >
                <p className="text-[12.5px] text-[#3a2a18] leading-snug">{m.text}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <PrayerUserAvatar
                      name={m.anonymous ? "?" : m.author}
                      avatarUrl={m.anonymous ? undefined : m.avatarUrl}
                      size="sm"
                      anonymous={m.anonymous}
                    />
                    <div className="min-w-0 text-right">
                      <p className="text-[11px] font-extrabold text-[#3a2a18] truncate">
                        {m.anonymous ? "عضو الكنيسة" : firstNameFrom(m.author)}
                      </p>
                      {!m.anonymous && m.churchName ? (
                        <p className="text-[9.5px] font-bold text-[#8a6a58] truncate">{m.churchName}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-[#7a6a58]">{m.time}</span>
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
      <p className="mt-1.5 text-[18px] font-extrabold text-[#3a2a18] leading-none">
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
    <div className="grid grid-cols-2 gap-1.5 rounded-full bg-white/70 border border-[#efe2c4] p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={
          "inline-flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-extrabold transition " +
          (!anonymous
            ? "bg-gradient-to-l from-[#b8893a] to-[#c79356] text-white shadow-[0_6px_14px_-8px_rgba(184,137,58,0.55)]"
            : "text-[#5a4a38]")
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
            ? "bg-gradient-to-l from-[#8a6ec1] to-[#9b87c4] text-white shadow-[0_6px_14px_-8px_rgba(138,110,193,0.5)]"
            : "text-[#5a4a38]")
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
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#3a2a18]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[340px] rounded-3xl p-4 text-right backdrop-blur-2xl"
        style={{
          background: `linear-gradient(160deg, ${LAVENDER_SOFT}, rgba(251,243,225,0.96))`,
          border: `1px solid ${LAVENDER_BORDER}`,
          boxShadow: "0 30px 60px -20px rgba(90,70,40,0.45)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
            <MessageSquareHeart className="h-4 w-4 text-[#8a6ec1]" strokeWidth={2.6} />
            رسالة تشجيع
          </h4>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#5a4a38] active:scale-90">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, ENCOURAGEMENT_MAX))}
          maxLength={ENCOURAGEMENT_MAX}
          rows={3}
          placeholder="اكتب كلمة تشجيع أو صلاة قصيرة"
          className="w-full resize-none rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[12.5px] text-[#3a2a18] placeholder:text-[#a99060] focus:outline-none focus:ring-2 focus:ring-[#b8893a]/35"
        />
        <div className="mt-1 text-[10px] text-[#7a6a58]">{remaining.toLocaleString("ar-EG")} حرف متبقي</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ENCOURAGEMENT_CHIPS.map((c) => (
            <button
              key={c.text}
              type="button"
              onClick={() => setText(`${c.emoji} ${c.text}`.slice(0, ENCOURAGEMENT_MAX))}
              className="rounded-full bg-white/80 border border-[#efe2c4] px-2.5 py-1 text-[11px] font-bold text-[#5a4a38] active:scale-95"
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
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/80 border border-[#efe2c4] py-2 text-[12px] font-extrabold text-[#5a4a38]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onSend(text, anonymous)}
            disabled={!text.trim()}
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#b8893a] to-[#c79356] py-2 text-[12px] font-extrabold text-white disabled:opacity-50 shadow-[0_10px_22px_-12px_rgba(184,137,58,0.55)]"
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
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[#3a2a18]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[360px] rounded-3xl p-4 text-right backdrop-blur-2xl"
        style={{
          background: `linear-gradient(160deg, ${GOLD_SOFT}, rgba(251,243,225,0.96))`,
          border: `1px solid ${GOLD_BORDER}`,
          boxShadow: "0 30px 60px -20px rgba(90,70,40,0.45)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] inline-flex items-center gap-1.5">
            <HandHeart className="h-4 w-4 text-[#b8893a]" strokeWidth={2.6} />
            طلبة صلاة جديدة
          </h4>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#5a4a38] active:scale-90">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الطلبة"
          className="w-full rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[13px] text-[#3a2a18] placeholder:text-[#a99060] focus:outline-none focus:ring-2 focus:ring-[#b8893a]/35"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="تفاصيل الطلبة"
          className="mt-2 w-full resize-none rounded-2xl bg-white/90 border border-[#efe2c4] px-3 py-2 text-[12.5px] text-[#3a2a18] placeholder:text-[#a99060] focus:outline-none focus:ring-2 focus:ring-[#b8893a]/35"
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
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white/80 border border-[#efe2c4] py-2 text-[12px] font-extrabold text-[#5a4a38]">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onAdd(title, body, anonymous)}
            disabled={!title.trim() || !body.trim()}
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#b8893a] to-[#c79356] py-2 text-[12px] font-extrabold text-white disabled:opacity-50 shadow-[0_10px_22px_-12px_rgba(184,137,58,0.55)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
