import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, BellOff, Camera, Check, Clock3, Copy, File,
  Fingerprint, Image as ImageIcon, LockKeyhole, MapPin, MoreHorizontal,
  Pencil, Phone, Plus, SendHorizontal, ShieldCheck, Smartphone, Trash2, VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AlphaShield } from "./AlphaShield";
import { priestProfile } from "./messaging-data";
import {
  HIDDEN_CONVS_KEY,
  MUTED_CONVS_KEY,
  TIMER_KEY,
  convLockMethodKey,
  convLockedKey,
  convPinKey,
  hasSecretCode,
  loadLS,
  saveLS,
} from "./messaging-storage";
import { PinBoxes, MESSAGING_GLASS_SHELL, MESSAGING_GLASS_ROW, MESSAGING_GLASS_ROW_DANGER, MESSAGING_GLASS_ICON_BOX, MessagingGlassPanelShell } from "./messaging-ui";
import {
  hapticLightImpact,
  hapticLightTap,
  hapticMediumImpact,
  hapticSelection,
  hapticWarning,
} from "./messaging-haptics";
// ─── Types ───────────────────────────────────────────────────
type Sheet = "timer" | "attach" | "menu" | "security" | "hide-setup" | null;
type MessageStatus = "sent" | "delivered" | "read";

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  incoming: boolean;
  status?: MessageStatus;
  isSystem?: boolean;
  edited?: boolean;
}

// ─── Constants / Helpers ─────────────────────────────────────
const CONV_ID = "priest";

const timerOptions = ["بعد القراءة", "٣٠ دقيقة", "ساعة", "٢٤ ساعة", "٧ أيام"];

const TIMER_LABELS: Record<string, string> = {
  "بعد القراءة": "سيتم حذف الرسائل بعد قراءتها.",
  "٣٠ دقيقة":   "تم ضبط الحذف التلقائي على ٣٠ دقيقة.",
  "ساعة":        "تم ضبط الحذف التلقائي على ساعة واحدة.",
  "٢٤ ساعة":    "تم ضبط الحذف التلقائي على ٢٤ ساعة.",
  "٧ أيام":      "تم ضبط الحذف التلقائي على ٧ أيام.",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "m1", incoming: true,  text: "مساء الخير يا رأفت، عامل إيه؟",                                                     time: "٨:٤١ م", status: "read" },
  { id: "m2", incoming: true,  text: "كنت بس بطمن عليك وعلى رحلتك الروحية الأسبوع ده.",                                   time: "٨:٤٢ م", status: "read" },
  { id: "m3", incoming: false, text: "مساء النور يا أبونا 🙏 الحمد لله، بدأت خطة القراءة الجديدة وحاسس بسلام كبير.",      time: "٨:٤٤ م", status: "read" },
  { id: "m4", incoming: true,  text: "فرحتني جدًا. خليك ثابت حتى لو قرأت آيات قليلة كل يوم، الأمانة أهم من الكثرة.",    time: "٨:٤٥ م", status: "read" },
  { id: "m5", incoming: false, text: "حاضر يا أبونا. صلّيلي أكمل بنفس الحماس.",                                           time: "٨:٤٧ م", status: "read" },
];

function formatTimeAr(): string {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const period = h >= 12 ? "م" : "ص";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  const ar = (n: number, pad = false) => {
    const s = n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
    return pad && n < 10 ? `٠${s}` : s;
  };
  return `${ar(h)}:${ar(m, true)} ${period}`;
}

// ─── Main screen ─────────────────────────────────────────────
export function AlphaChatScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages]       = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput]             = useState("");
  const [sheet, setSheet]             = useState<Sheet>(null);
  const [timer, setTimerState]        = useState<string>(() => loadLS(TIMER_KEY, "٢٤ ساعة"));
  const [muted, setMutedState]        = useState<boolean>(() => loadLS<string[]>(MUTED_CONVS_KEY, []).includes(CONV_ID));
  const [isLocked, setIsLockedState]  = useState<boolean>(() => loadLS(convLockedKey(CONV_ID), false));
  const [lockMethod, setLockMethod]   = useState<"face-id" | "pin">(() => loadLS(convLockMethodKey(CONV_ID), "face-id"));
  const [savedPin, setSavedPin]       = useState<string>(() => loadLS(convPinKey(CONV_ID), "123456"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !loadLS(convLockedKey(CONV_ID), false));
  const [lockEntry, setLockEntry]     = useState("");
  const [lockEntryError, setLockEntryError] = useState(false);
  const [isHidden, setIsHidden]         = useState<boolean>(() => loadLS<string[]>(HIDDEN_CONVS_KEY, []).includes(CONV_ID));
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [longPressId, setLongPressId]   = useState<string | null>(null);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [composerH, setComposerH] = useState(72);
  const timerRef = useRef(timer);
  useEffect(() => { timerRef.current = timer; }, [timer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const update = () => setComposerH(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [isLocked, isAuthenticated, editingId]);

  // ── Helpers ─────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleCall = useCallback(() => {
    const phone = priestProfile.phone?.replace(/[\s-]/g, "");
    if (!phone) {
      showToast("لا يوجد رقم مسجل لهذا المستخدم");
      return;
    }
    window.location.href = `tel:${phone}`;
  }, [showToast]);

  const progressMessage = useCallback((id: string) => {
    setTimeout(() => {
      setMessages((p) => p.map((m) => m.id === id ? { ...m, status: "delivered" as MessageStatus } : m));
    }, 1000);
    setTimeout(() => {
      setMessages((p) => p.map((m) => m.id === id ? { ...m, status: "read" as MessageStatus } : m));
      if (timerRef.current === "بعد القراءة") {
        setTimeout(() => setMessages((p) => p.filter((m) => m.id !== id)), 3000);
      }
    }, 2000);
  }, []);

  // ── Send / Save edit ────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    hapticLightTap();
    if (editingId) {
      setMessages((p) => p.map((m) => m.id === editingId ? { ...m, text, edited: true } : m));
      setInput("");
      setEditingId(null);
      return;
    }
    const id = `msg-${Date.now()}`;
    setMessages((p) => [...p, { id, text, time: formatTimeAr(), incoming: false, status: "sent" }]);
    setInput("");
    progressMessage(id);
  }, [input, progressMessage, editingId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // ── Attach ──────────────────────────────────────────────────
  const handleAttach = useCallback((label: string) => {
    const textMap: Record<string, string> = {
      "صورة":     "تم إرفاق صورة 🖼️",
      "الكاميرا": "تم التقاط صورة 📷",
      "ملف":      "تم إرفاق ملف 📄",
      "الموقع":   "تم مشاركة الموقع 📍",
    };
    const id = `msg-${Date.now()}`;
    setMessages((p) => [...p, { id, text: textMap[label] ?? label, time: formatTimeAr(), incoming: false, status: "sent" }]);
    setSheet(null);
    progressMessage(id);
  }, [progressMessage]);

  // ── Timer ───────────────────────────────────────────────────
  const handleSetTimer = useCallback((newTimer: string) => {
    setTimerState(newTimer);
    saveLS(TIMER_KEY, newTimer);
    const label = TIMER_LABELS[newTimer] ?? `تم ضبط المؤقت على ${newTimer}.`;
    setMessages((p) => [
      ...p,
      { id: `sys-${Date.now()}`, text: `🕒 ${label}`, time: formatTimeAr(), incoming: false, isSystem: true },
    ]);
  }, []);

  // ── Mute (persisted) ────────────────────────────────────────
  const handleSetMuted = useCallback((v: boolean) => {
    hapticSelection();
    setMutedState(v);
    const list = loadLS<string[]>(MUTED_CONVS_KEY, []);
    saveLS(MUTED_CONVS_KEY, v ? [...new Set([...list, CONV_ID])] : list.filter((id) => id !== CONV_ID));
    setSheet(null);
  }, []);

  // ── Lock unlock (session) ────────────────────────────────────
  const handlePinUnlock = useCallback(() => {
    if (lockEntry === savedPin) {
      setIsAuthenticated(true);
      setLockEntry("");
      setLockEntryError(false);
    } else {
      setLockEntryError(true);
      setTimeout(() => { setLockEntryError(false); setLockEntry(""); }, 800);
    }
  }, [lockEntry, savedPin]);

  // ── Message actions ──────────────────────────────────────────
  const handleDeleteMessage = useCallback((id: string) => {
    hapticWarning();
    setMessages((p) => p.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  }, []);

  // ── Hide conversation ──────────────────────────────────────
  const handleHideConversation = useCallback(() => {
    if (hasSecretCode()) setSheet("hide-setup");
    else showToast("أنشئ الكود السري من إعدادات الرسائل ← القفل والخصوصية");
  }, [showToast]);

  const handleConfirmHide = useCallback(() => {
    hapticMediumImpact();
    const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []);
    saveLS(HIDDEN_CONVS_KEY, [...new Set([...list, CONV_ID])]);
    setIsHidden(true);
    setSheet(null);
    showToast("تم إخفاء المحادثة");
    setTimeout(() => onBack(), 900);
  }, [onBack, showToast]);

  // ── Unhide conversation ───────────────────────────────────────
  const handleUnhideConversation = useCallback(() => {
    hapticSelection();
    const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []);
    saveLS(HIDDEN_CONVS_KEY, list.filter((id) => id !== CONV_ID));
    setIsHidden(false);
    setSheet(null);
    showToast("تم إظهار المحادثة");
  }, [showToast]);

  // ── Clear chat ───────────────────────────────────────────────
  const handleClearConfirmed = useCallback(() => {
    hapticWarning();
    setMessages([]);
    setConfirmClear(false);
    setSheet(null);
  }, []);

  return (
    <main dir="rtl" className="alpha-chat-bg flex h-[100dvh] flex-col overflow-hidden font-arabic text-foreground">

      {/* ── Header — always visible even when locked ── */}
      <header className="z-20 border-b border-gold/10 bg-card/70 px-3 pb-2 pt-[max(env(safe-area-inset-top),8px)] backdrop-blur-2xl">
        <div className="mx-auto grid max-w-[420px] grid-cols-[40px_1fr_76px] items-center gap-1">

          <Button
            onClick={onBack}
            aria-label="رجوع"
            variant="ghost"
            size="icon"
            className="size-9 justify-self-end rounded-full border border-gold/20 bg-card/60 text-gold shadow-sm backdrop-blur-sm hover:bg-gold/10 hover:text-gold"
          >
            <ArrowLeft className="size-[18px]" />
          </Button>

          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <img
                src={priestProfile.avatar}
                alt="أبونا داود"
                width={38}
                height={38}
                className="size-[38px] rounded-full border-[1.5px] border-gold/40 object-cover shadow-[0_0_12px_rgba(200,149,42,0.22)]"
              />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-[1.5px] border-card bg-[#166534] shadow-[0_0_6px_rgba(22,101,52,0.5)]" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <p className="text-[14px] font-bold leading-tight">أبونا داود</p>
                <AlphaShield role="priest" size="sm" userName="أبونا داود" userAvatar={priestProfile.avatar} isOnline={true} />
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-[8.5px] font-semibold tracking-wide text-[#166534]">متصل الآن</p>
                {muted && (
                  <span className="flex items-center gap-0.5 rounded-full border border-[#8A6A3D]/20 bg-card/80 px-1.5 py-0.5 text-[7px] font-medium text-[#8A6A3D]">
                    <BellOff className="size-2.5" />
                    مكتوم
                  </span>
                )}
                {isLocked && isAuthenticated && (
                  <span className="flex items-center gap-0.5 rounded-full border border-gold/20 bg-card/80 px-1.5 py-0.5 text-[7px] font-medium text-gold">
                    <LockKeyhole className="size-2.5" />
                    مقفل
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-0.5">
            <Button onClick={() => setSheet("menu")} aria-label="المزيد" variant="ghost" size="icon" className="size-8 rounded-full text-gold/65 hover:bg-gold/10 hover:text-gold">
              <MoreHorizontal className="size-[18px]" />
            </Button>
            <Button onClick={handleCall} aria-label="اتصال" variant="ghost" size="icon" className="size-8 rounded-full text-gold/65 hover:bg-gold/10 hover:text-gold">
              <Phone className="size-[18px]" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Lock screen OR Chat content ── */}
      {isLocked && !isAuthenticated ? (
        <LockScreen
          method={lockMethod}
          pinEntry={lockEntry}
          onPinChange={setLockEntry}
          pinError={lockEntryError}
          onFaceId={() => setIsAuthenticated(true)}
          onPinSubmit={handlePinUnlock}
          onBack={onBack}
        />
      ) : (
        <>
          {/* ── Privacy pill ── */}
          <div className="z-10 mx-auto w-full max-w-[420px] px-4 pt-2">
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-[#166534]/20 bg-[#DCFCE7]/70 px-3 py-1 backdrop-blur-sm">
              <LockKeyhole className="size-3 shrink-0 text-[#166534]" />
              <p className="text-[8.5px] font-medium text-[#14532D]">
                محادثة خاصة ومشفرة · لا يمكن الاطلاع عليها
              </p>
            </div>
          </div>

          {/* ── Messages ── */}
          <section
            className="no-scrollbar relative mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4"
            aria-label="الرسائل"
          >
            {/* Watermark */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div
                className="absolute inset-0 opacity-[0.022]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Ccircle cx='36' cy='36' r='24' fill='none' stroke='%23c8952a' stroke-width='1.2'/%3E%3Cpath d='M36 12v48M12 36h48' stroke='%23c8952a' stroke-width='0.7'/%3E%3C/svg%3E")`,
                  backgroundSize: "72px 72px",
                }}
              />
              <div className="absolute left-4 top-1/3 select-none font-bold leading-none text-gold opacity-[0.025]" style={{ fontSize: "180px" }}>α</div>
            </div>

            {/* Date separator */}
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-gold/10" />
              <span className="rounded-full border border-gold/12 bg-card/50 px-3 py-0.5 text-[8px] text-muted-foreground/60 backdrop-blur-sm">اليوم</span>
              <div className="h-px flex-1 bg-gold/10" />
            </div>

            {/* Messages — long-press to open action menu */}
            {messages.map((msg) => (
              <Message
                key={msg.id}
                {...msg}
                onLongPress={!msg.isSystem ? () => setLongPressId(msg.id) : undefined}
              />
            ))}

            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-[13px] text-muted-foreground/60">لا توجد رسائل</p>
                <p className="text-[10px] text-muted-foreground/35">ابدأ محادثة جديدة 🕊️</p>
              </div>
            )}

            {/* Auto-delete notice */}
            <div className="flex items-center justify-center gap-1.5 self-center rounded-full border border-[#166534]/20 bg-[#DCFCE7]/55 px-3 py-1 text-[8px] font-medium text-[#14532D] backdrop-blur-sm">
              <Clock3 className="size-2.5 text-[#14532D]" />
              سيتم حذف الرسائل بعد: {timer}
            </div>

            <div ref={messagesEndRef} />
          </section>

          {/* ── Composer ── */}
          <footer ref={footerRef} className="z-20 border-t border-gold/10 bg-card/75 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur-2xl">
            {/* Edit mode banner */}
            {editingId && (
              <div className="mx-auto mb-2 flex max-w-[420px] items-center justify-between rounded-xl border border-gold/15 bg-gold/8 px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Pencil className="size-3 text-gold" />
                  <span className="text-[11px] font-medium text-[#374151]">تعديل الرسالة</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setInput(""); setEditingId(null); }}
                  className="text-[10px] text-[#6B7280] hover:text-[#374151]"
                >
                  إلغاء
                </button>
              </div>
            )}
            <div className="mx-auto flex max-w-[420px] items-center gap-1.5 rounded-[22px] border border-gold/18 bg-background/65 py-1.5 pl-2 pr-1.5 shadow-sm backdrop-blur-xl">
              <button
                type="button"
                aria-label={editingId ? "حفظ التعديل" : "إرسال الرسالة"}
                disabled={!input.trim()}
                onClick={handleSend}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-navy-deep shadow-[0_2px_10px_-4px_var(--gold)] transition-all hover:scale-105 hover:shadow-[0_4px_16px_-4px_var(--gold)] disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
              >
                {editingId
                  ? <Check className="size-[17px]" />
                  : <SendHorizontal className="size-[18px] rtl:-scale-x-100" />}
              </button>

              <button
                type="button"
                onClick={() => setSheet("timer")}
                aria-label="مؤقت الاختفاء"
                title={`المؤقت: ${timer}`}
                className="flex shrink-0 items-center gap-1 rounded-full border border-[#FCA5A5] bg-[#FEE2E2] px-2 py-1 transition-colors hover:bg-[#FCA5A5]/40"
              >
                <Clock3 className="size-3.5 text-[#DC2626]" />
              </button>

              <Input
                aria-label="اكتب رسالة"
                placeholder="اكتب رسالة..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-relaxed shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />

              <button
                type="button"
                onClick={() => setSheet("attach")}
                aria-label="إرفاق"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D6C4A8] bg-[#F5F0E6] text-[#5B4636] transition-colors hover:bg-[#D6C4A8]/70 hover:text-[#3F2F24]"
              >
                <Plus className="size-[17px]" />
              </button>
            </div>
          </footer>
        </>
      )}

      {/* ── Delete message confirmation (center glass popup) ── */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 backdrop-blur-[4px]"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            dir="rtl"
            className="w-[88%] max-w-[300px] overflow-hidden rounded-[28px] border border-white/20 bg-white/96 px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex justify-center">
              <div className="grid size-10 place-items-center rounded-full bg-[#FEE2E2]">
                <Trash2 className="size-4.5 text-[#B91C1C]" />
              </div>
            </div>
            <p className="mb-1 text-center text-[13px] font-bold text-[#1F2937]">حذف هذه الرسالة؟</p>
            <p className="mb-4 text-center text-[10px] text-[#6B7280]">ستُحذف من هذا الجهاز فقط.</p>
            <div className="flex gap-2.5">
              <Button onClick={() => setDeleteConfirmId(null)} variant="ghost" className="h-10 flex-1 rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] text-[#374151]">إلغاء</Button>
              <Button onClick={() => handleDeleteMessage(deleteConfirmId)} variant="ghost" className="h-10 flex-1 rounded-2xl bg-[#FEE2E2] text-[12px] font-bold text-[#B91C1C]">حذف</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear chat confirmation (center glass popup) ── */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 backdrop-blur-[4px]"
          onClick={() => setConfirmClear(false)}
        >
          <div
            dir="rtl"
            className="w-[88%] max-w-[300px] overflow-hidden rounded-[28px] border border-white/20 bg-white/96 px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex justify-center">
              <div className="grid size-10 place-items-center rounded-full bg-[#FEE2E2]">
                <Trash2 className="size-4.5 text-[#B91C1C]" />
              </div>
            </div>
            <p className="mb-1 text-center text-[13px] font-bold text-[#1F2937]">مسح المحادثة</p>
            <p className="mb-4 text-center text-[10px] text-[#6B7280]">لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2.5">
              <Button onClick={() => setConfirmClear(false)} variant="ghost" className="h-10 flex-1 rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] text-[#374151]">إلغاء</Button>
              <Button onClick={handleClearConfirmed} variant="ghost" className="h-10 flex-1 rounded-2xl bg-[#FEE2E2] text-[12px] font-bold text-[#B91C1C]">مسح</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="pointer-events-none fixed bottom-28 left-1/2 z-[200] -translate-x-1/2 rounded-full border border-white/12 bg-[#1F2937]/88 px-4 py-2 text-[11px] text-white/90 shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}

      {/* ── Long-press message action menu ── */}
      {longPressId && (() => {
        const msg = messages.find((m) => m.id === longPressId);
        if (!msg) return null;
        return (
          <div
            className="fixed inset-0 z-[160]"
            onClick={() => setLongPressId(null)}
          >
            <div
              dir="rtl"
              className="absolute bottom-[88px] left-1/2 min-w-[200px] -translate-x-1/2 overflow-hidden rounded-[18px] border border-white/10 bg-[#111827]/96 shadow-2xl backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {!msg.incoming && (
                <button
                  type="button"
                  onClick={() => {
                    setInput(msg.text);
                    setEditingId(msg.id);
                    setLongPressId(null);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-right text-[12px] text-white/90 transition-colors hover:bg-white/8"
                >
                  <Pencil className="size-3.5 shrink-0 text-gold" />
                  تعديل الرسالة
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(msg.text).catch(() => {});
                  showToast("تم النسخ");
                  setLongPressId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-right text-[12px] text-white/90 transition-colors hover:bg-white/8"
              >
                <Copy className="size-3.5 shrink-0 text-white/55" />
                نسخ
              </button>
              <div className="mx-3 h-px bg-white/8" />
              <button
                type="button"
                onClick={() => {
                  hapticMediumImpact();
                  setDeleteConfirmId(msg.id);
                  setLongPressId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-right text-[12px] text-[#F87171] transition-colors hover:bg-white/8"
              >
                <Trash2 className="size-3.5 shrink-0" />
                حذف من هذا الجهاز
              </button>
            </div>
          </div>
        );
      })()}

      <AlphaSheet
        sheet={sheet}
        setSheet={setSheet}
        timer={timer}
        setTimer={handleSetTimer}
        muted={muted}
        setMuted={handleSetMuted}
        onClearChat={() => setConfirmClear(true)}
        onAttach={handleAttach}
        isHidden={isHidden}
        onHideRequest={handleHideConversation}
        onHideConfirm={handleConfirmHide}
        onUnhideChat={handleUnhideConversation}
        composerBottom={composerH}
      />
    </main>
  );
}

// ─── System event notice ──────────────────────────────────────
function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center py-0.5">
      <span className="max-w-[80%] rounded-full border border-gold/12 bg-card/50 px-3.5 py-1 text-center text-[9px] leading-relaxed text-muted-foreground/65 backdrop-blur-sm">
        {text}
      </span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────
function Message({ id, text, time, incoming, status, isSystem, edited, onLongPress }: {
  id: string; text: string; time: string; incoming?: boolean; status?: MessageStatus;
  isSystem?: boolean; edited?: boolean; onLongPress?: () => void;
}) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    if (!onLongPress) return;
    pressTimer.current = setTimeout(onLongPress, 600);
  }, [onLongPress]);

  const handleTouchCancel = useCallback(() => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  }, []);

  if (isSystem) return <SystemMessage text={text} />;
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchCancel}
      onTouchMove={handleTouchCancel}
      className={`relative max-w-[82%] select-none px-4 py-3 text-[13px] leading-[1.7] backdrop-blur-md ${
        incoming
          ? "self-start rounded-[20px] rounded-tl-[5px] border border-white/50 bg-white/68 text-foreground/90 shadow-[0_2px_14px_-4px_rgba(0,0,0,0.08)]"
          : "self-end rounded-[20px] rounded-tr-[5px] border border-[#c8952a]/28 bg-gradient-to-br from-[#fdf0d0]/90 to-[#f0d898]/75 text-[#3a2800] shadow-[0_4px_20px_-6px_rgba(200,149,42,0.32)]"
      }`}
    >
      <p>{text}</p>
      <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-[7.5px] ${incoming ? "text-foreground/40" : "text-[#8a6200]/55"}`}>
        <time className="ltr">{time}</time>
        {edited && <span className={incoming ? "text-foreground/30" : "text-[#8a6200]/40"}>· تم التعديل</span>}
        {!incoming && status && (
          <span className={`font-bold ${
            status === "read"      ? "text-[#c8952a]"    :
            status === "delivered" ? "text-[#8a6200]/60" :
                                     "text-[#8a6200]/35"
          }`}>
            {status === "sent" ? "✓" : "✓✓"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Lock screen (center glass popup) ─────────────────────────
function LockScreen({
  method, pinEntry, onPinChange, pinError, onFaceId, onPinSubmit, onBack,
}: {
  method: "face-id" | "pin";
  pinEntry: string;
  onPinChange: (v: string) => void;
  pinError: boolean;
  onFaceId: () => void;
  onPinSubmit: () => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-[5px]">
      <div
        dir="rtl"
        className="w-[88%] max-w-[300px] overflow-hidden rounded-[28px] border border-white/20 bg-white/96 px-6 py-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="grid size-14 place-items-center rounded-full border border-gold/25 bg-gold/8 shadow-[0_0_24px_rgba(200,149,42,0.14)]">
            <LockKeyhole className="size-7 text-gold" />
          </div>
        </div>
        {/* Title */}
        <p className="mb-1 text-center text-[14px] font-bold text-[#1F2937]">هذه المحادثة مقفلة</p>
        <p className="mb-5 text-center text-[11px] text-[#6B7280]">
          {method === "pin" ? "أدخل رمز PIN للمتابعة" : "استخدم Face ID لفتح المحادثة"}
        </p>

        {method === "face-id" ? (
          <Button
            onClick={onFaceId}
            className="h-11 w-full rounded-2xl bg-gradient-to-br from-gold to-gold-deep text-[13px] font-bold text-navy-deep shadow-[0_4px_16px_-4px_var(--gold)]"
          >
            🔓 فتح باستخدام Face ID
          </Button>
        ) : (
          <div
            className="flex flex-col items-center gap-4"
            onClick={() => inputRef.current?.focus()}
          >
            <PinBoxes value={pinEntry} error={pinError} />
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={pinEntry}
              onChange={(e) => onPinChange(e.target.value.replace(/\D/g, ""))}
              autoFocus
              className="sr-only"
            />
            {pinError && <p className="text-[10px] font-medium text-[#B91C1C]">رمز PIN غير صحيح</p>}
            <Button
              onClick={onPinSubmit}
              disabled={pinEntry.length < 4}
              className="h-11 w-full rounded-2xl bg-gradient-to-br from-gold to-gold-deep text-[13px] font-bold text-navy-deep disabled:opacity-35"
            >
              فتح
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-4 w-full text-center text-[11px] text-[#6B7280] hover:text-[#374151]"
        >
          رجوع
        </button>
      </div>
    </div>
  );
}

// ─── Shared glass shell (timer picker + chat settings) ────────

function ChatGlassPanel({
  title,
  desc,
  onClose,
  composerBottom,
  children,
}: {
  title: string;
  desc?: string;
  onClose: () => void;
  composerBottom: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] bg-black/28 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 w-[86%] max-w-[272px] -translate-x-1/2"
        style={{ bottom: composerBottom + 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <MessagingGlassPanelShell
          title={title}
          desc={desc}
          onDone={onClose}
        >
          {children}
        </MessagingGlassPanelShell>
      </div>
    </div>
  );
}

// ─── Bottom sheet drawer ──────────────────────────────────────
interface AlphaSheetProps {
  sheet:             Sheet;
  setSheet:          (v: Sheet) => void;
  timer:             string;
  setTimer:          (v: string) => void;
  muted:             boolean;
  setMuted:          (v: boolean) => void;
  onClearChat:       () => void;
  onAttach:          (label: string) => void;
  isHidden:          boolean;
  onHideRequest:     () => void;
  onHideConfirm:     () => void;
  onUnhideChat:      () => void;
  composerBottom:    number;
}

function AlphaSheet({
  sheet, setSheet, timer, setTimer,
  muted, setMuted,
  onClearChat, onAttach,
  isHidden, onHideRequest, onHideConfirm, onUnhideChat,
  composerBottom,
}: AlphaSheetProps) {
  const open = sheet !== null;

  const attachItems: [typeof ImageIcon, string, string][] = [
    [ImageIcon, "صورة",     "from-[#3d8bef] to-[#1a55cc]"],
    [Camera,    "الكاميرا", "from-[#9b5fde] to-[#6b3db0]"],
    [File,      "ملف",      "from-[#2ebb9a] to-[#1a8a72]"],
    [MapPin,    "الموقع",   "from-[#ef5350] to-[#c62828]"],
  ];

  const menuItems: [typeof Clock3, string, (() => void) | undefined, string?, string?][] = [
    [Clock3,      "انتهاء صلاحية الرسائل",                              () => setSheet("timer"),                                      "text-gold",      "text-[#374151]"],
    [VolumeX,     muted ? "إلغاء كتم الإشعارات" : "كتم الإشعارات",    () => setMuted(!muted),                                       "text-[#8A6A3D]", "text-[#374151]"],
    [Fingerprint, isHidden ? "إظهار المحادثة" : "إخفاء المحادثة",      isHidden ? onUnhideChat : onHideRequest,        "text-gold",      "text-[#374151]"],
    [File,        "مسح المحادثة",                                         onClearChat,                                                  "text-[#B91C1C]", "text-[#B91C1C]"],
    [ShieldCheck, "معلومات الأمان",                                       () => setSheet("security"),                                   "text-[#14532D]", "text-[#14532D]"],
  ];

  return (
    <>
      {sheet === "timer" && (
        <TimerGlassPicker
          value={timer}
          options={timerOptions}
          onSelect={(opt) => { hapticSelection(); setTimer(opt); setSheet(null); }}
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
        />
      )}

      {sheet === "menu" && (
        <ChatGlassPanel
          title="إعدادات المحادثة"
          desc="تحكم في خصوصية هذه المحادثة وأمانها"
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
        >
          <div className="space-y-2">
            {menuItems.map(([Icon, label, action, iconClass, labelClass]) => {
              const isDanger = label === "مسح المحادثة";
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (isDanger) {
                      onClearChat();
                      setSheet(null);
                      return;
                    }
                    action?.();
                  }}
                  className={`${isDanger ? MESSAGING_GLASS_ROW_DANGER : MESSAGING_GLASS_ROW} hover:bg-white/58 active:scale-[0.98]`}
                >
                  <span className={`${MESSAGING_GLASS_ICON_BOX} ${
                    isDanger ? "border-[#FECACA]/60 bg-[#FEE2E2]/45" : ""
                  }`}>
                    <Icon className={`size-4 ${iconClass ?? "text-gold"}`} />
                  </span>
                  <span className={`flex-1 text-[12px] font-semibold leading-snug ${labelClass ?? "text-[#1F2937]"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </ChatGlassPanel>
      )}

      {sheet === "hide-setup" && (
        <ChatGlassPanel
          title="إخفاء المحادثة"
          desc="سيتم إضافتها إلى قسم المحادثات المخفية"
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
        >
          <div className="flex gap-2.5 px-0.5">
            <button
              type="button"
              onClick={() => setSheet(null)}
              className="flex-1 rounded-[13px] border border-white/32 bg-white/42 py-2.5 text-[12px] font-semibold text-[#374151] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-colors hover:bg-white/58"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={onHideConfirm}
              className="flex-1 rounded-[13px] border border-gold/28 bg-gold/14 py-2.5 text-[12px] font-bold text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-colors hover:bg-gold/22"
            >
              إخفاء
            </button>
          </div>
        </ChatGlassPanel>
      )}

      {sheet === "security" && (
        <ChatGlassPanel
          title="أمان المحادثة"
          desc="محمية بواسطة Alpha Security"
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
        >
          <div className="mb-2.5 flex justify-center">
            <span className="flex items-center gap-1.5 rounded-full border border-[#166534]/22 bg-[#ECFDF5]/85 px-3 py-1.5 text-[10px] font-semibold text-[#166534]">
              <ShieldCheck className="size-3.5 text-[#166534]" />
              موثّقة وآمنة
            </span>
          </div>
          <div className="space-y-2">
            {([
              [ShieldCheck, "مستوى الثقة",    "موثّق"],
              [Clock3,      "الحذف التلقائي", timer],
              [LockKeyhole, "التشفير",         "مفعّل"],
            ] as const).map(([Icon, label, value]) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-[13px] border border-white/32 bg-white/42 px-3 py-2.5 shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)]"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-[9px] border border-[#166534]/12 bg-[#ECFDF5]/70">
                  <Icon className="size-3.5 text-[#166534]" />
                </span>
                <span className="flex-1 text-[11px] font-medium text-[#6B7280]">{label}</span>
                <span className="text-[12px] font-bold text-[#1F2937]">{value}</span>
              </div>
            ))}
          </div>
        </ChatGlassPanel>
      )}

      <Drawer open={open && sheet === "attach"} onOpenChange={(v) => !v && setSheet(null)}>
      <DrawerContent dir="rtl" className="mx-auto max-w-[420px] border-gold/25 bg-card/97 px-5 pb-6 text-foreground backdrop-blur-2xl">

        {/* Attach */}
        {sheet === "attach" && (
          <div className="flex items-center justify-around pb-2 pt-4">
            {attachItems.map(([Icon, label, gradient]) => (
              <button key={label} type="button" onClick={() => onAttach(label)} className="flex flex-col items-center gap-1.5">
                <span
                  className={`grid size-[52px] place-items-center rounded-2xl bg-gradient-to-b ${gradient}`}
                  style={{ boxShadow: "0 6px 16px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.22)" }}
                >
                  <Icon className="size-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                </span>
                <span className="text-[10px] font-medium text-[#374151]">{label}</span>
              </button>
            ))}
          </div>
        )}
      </DrawerContent>
    </Drawer>
    </>
  );
}

// ─── Apple-style glass timer picker (compact) ─────────────────
const PICKER_ITEM_H = 32;
const PICKER_VISIBLE = 112;
const PICKER_SNAP_MS = 130;

let pickerAudioCtx: AudioContext | null = null;

function playPickerTickSound() {
  try {
    pickerAudioCtx ??= new AudioContext();
    const ctx = pickerAudioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.03);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.055, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.042);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  } catch { /* unsupported */ }
}

function pickerStepFeedback() {
  hapticLightImpact();
  playPickerTickSound();
}

function TimerGlassPicker({
  value,
  options,
  onSelect,
  onClose,
  composerBottom,
}: {
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  composerBottom: number;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const snappingRef = useRef(false);
  const lastTickIdx = useRef(-1);
  const lastScrollTickIdx = useRef(-1);
  const [active, setActive] = useState(value);
  const [focusedIdx, setFocusedIdx] = useState(() => Math.max(0, options.indexOf(value)));
  const [tickKey, setTickKey] = useState(0);
  const padY = (PICKER_VISIBLE - PICKER_ITEM_H) / 2;

  const scrollToIndex = useCallback((idx: number, smooth = false) => {
    const el = listRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(options.length - 1, idx));
    snappingRef.current = smooth;
    el.scrollTo({ top: clamped * PICKER_ITEM_H, behavior: smooth ? "smooth" : "auto" });
    setFocusedIdx(clamped);
    if (smooth) window.setTimeout(() => { snappingRef.current = false; }, 280);
  }, [options.length]);

  const commitIndex = useCallback((idx: number, withFeedback: boolean) => {
    const clamped = Math.max(0, Math.min(options.length - 1, idx));
    const next = options[clamped];
    if (withFeedback && clamped !== lastScrollTickIdx.current) {
      lastScrollTickIdx.current = clamped;
      lastTickIdx.current = clamped;
      pickerStepFeedback();
      setTickKey((k) => k + 1);
    }
    setActive(next);
    setFocusedIdx(clamped);
    scrollToIndex(clamped, true);
  }, [options, scrollToIndex]);

  useEffect(() => {
    const idx = Math.max(0, options.indexOf(value));
    lastTickIdx.current = idx;
    lastScrollTickIdx.current = idx;
    scrollToIndex(idx, false);
    setActive(value);
    setFocusedIdx(idx);
  }, [value, options, scrollToIndex]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || snappingRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const idx = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / PICKER_ITEM_H)));
      setFocusedIdx(idx);
      if (idx !== lastScrollTickIdx.current) {
        lastScrollTickIdx.current = idx;
        setActive(options[idx]);
        pickerStepFeedback();
        setTickKey((k) => k + 1);
      }
    });

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      const idx = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / PICKER_ITEM_H)));
      lastTickIdx.current = idx;
      setActive(options[idx]);
      scrollToIndex(idx, true);
    }, PICKER_SNAP_MS);
  };

  const selectOption = (idx: number) => {
    void pickerAudioCtx?.resume();
    commitIndex(idx, true);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/28 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <style>{`
        @keyframes alphaTimerWheelTick {
          0% { opacity: 1; }
          50% { opacity: 0.72; }
          100% { opacity: 1; }
        }
      `}</style>
      <div
        className="absolute left-1/2 w-[84%] max-w-[260px] -translate-x-1/2"
        style={{ bottom: composerBottom + 8 }}
        onClick={(e) => e.stopPropagation()}
      >
      <div
        dir="rtl"
        className={MESSAGING_GLASS_SHELL}
      >
        {/* iOS toolbar: عنوان وسط | تم أخضر */}
        <div className="relative flex h-12 items-center justify-center px-4 pt-2" dir="rtl">
          <p className="text-[14px] font-bold text-[#1F2937]">مؤقت الاختفاء</p>
          <button
            type="button"
            onClick={() => onSelect(active)}
            className="absolute inset-y-0 start-4 flex items-center pt-0.5 text-[16px] font-bold text-[#166534] transition-colors hover:text-[#14532D] active:text-[#0F3D22]"
          >
            تم
          </button>
        </div>

        <div className="relative mx-2.5 mb-3 mt-1" style={{ height: PICKER_VISIBLE }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-9 bg-gradient-to-b from-white/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-9 bg-gradient-to-t from-white/80 to-transparent" />
          <div
            className="pointer-events-none absolute inset-x-0.5 top-1/2 z-10 -translate-y-1/2 rounded-[10px] border border-gold/20 bg-gold/8"
            style={{ height: PICKER_ITEM_H }}
          />
          <ul
            ref={listRef}
            className="h-full overflow-y-auto scroll-smooth overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              scrollSnapType: "y mandatory",
              paddingTop: padY,
              paddingBottom: padY,
              WebkitOverflowScrolling: "touch",
            }}
            onTouchStart={() => void pickerAudioCtx?.resume()}
            onScroll={handleScroll}
            onTouchEnd={handleScroll}
            onMouseUp={handleScroll}
          >
            {options.map((option, idx) => {
              const selected = active === option;
              const isFocused = idx === focusedIdx;
              const dist = Math.abs(idx - focusedIdx);
              return (
                <li
                  key={option}
                  style={{
                    height: PICKER_ITEM_H,
                    scrollSnapAlign: "center",
                    animation: selected && isFocused && tickKey > 0
                      ? "alphaTimerWheelTick 0.18s ease-out both"
                      : undefined,
                  }}
                  className="flex w-full cursor-pointer items-center justify-center"
                  onClick={() => selectOption(idx)}
                >
                  <span
                    className="block w-full truncate px-2 text-center text-[13.5px] font-semibold leading-none transition-[opacity,color] duration-150"
                    style={{
                      opacity: isFocused ? 1 : dist === 1 ? 0.58 : 0.32,
                      color: isFocused ? "#1F2937" : "#6B7280",
                    }}
                  >
                    {option}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}
