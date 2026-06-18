import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BellOff, Eye, EyeOff, Search, Settings2, SlidersHorizontal, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { AlphaBottomNavigation } from "./AlphaBottomNavigation";
import { AlphaIdentityRow } from "./AlphaIdentityRow";
import { type Conversation } from "./messaging-data";
import { useAlphaConnectConversationList } from "@/features/alpha-connect/useAlphaConnectConversationList";
import { clearConversationForBothParties } from "@/features/alpha-connect/clearConversation";
import {
  HIDDEN_CONVS_KEY,
  HIDDEN_CODE_KEY,
  HIDDEN_SESSION_KEY,
  MUTED_CONVS_KEY,
  hasSecretCode,
  loadLS,
  saveLS,
} from "./messaging-storage";
import { CenterGlassPopup, MESSAGING_CONV_CARD, MESSAGING_CONV_CARD_RADIUS, PopupActions } from "./messaging-ui";
import {
  hapticLightImpact,
  hapticMediumImpact,
  hapticSelection,
  hapticWarning,
} from "./messaging-haptics";

const BASE_FILTERS = ["الكل", "خاصة", "مجموعات", "كهنة", "خدام", "غير مقروءة"];

export function AlphaConversationsScreen({
  onOpenChat,
  onOpenSettings,
  returnTo,
  onBack,
}: {
  onOpenChat: (profile: Conversation) => void;
  onOpenSettings: () => void;
  returnTo?: string;
  onBack?: () => void;
}) {
  const navigate = useNavigate();
  const { goBack } = useAlphaNavigation();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (returnTo) {
      void navigate({ to: returnTo as "/" });
      return;
    }
    goBack();
  };
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [search, setSearch] = useState("");
  const [hiddenConvIds, setHiddenConvIds]   = useState<string[]>([]);
  const [mutedConvIds, setMutedConvIds]     = useState<string[]>([]);
  const [hiddenCode, setHiddenCode]         = useState<string>("");
  const [deletedConvIds, setDeletedConvIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [clearingConv, setClearingConv] = useState(false);
  const [convToast, setConvToast]           = useState<string | null>(null);
  const [needCodePrompt, setNeedCodePrompt] = useState(false);
  const [showNewChat, setShowNewChat]       = useState(false);

  const { conversations: dbConversations, refresh: refreshConversations } = useAlphaConnectConversationList();

  const showConvToast = useCallback((msg: string) => {
    setConvToast(msg);
    setTimeout(() => setConvToast(null), 2200);
  }, []);

  const confirmDeleteConv = confirmDeleteId
    ? dbConversations.find((c) => c.id === confirmDeleteId)
    : undefined;

  const hideDeletedConversation = useCallback((convId: string) => {
    setDeletedConvIds((prev) => [...prev, convId]);
    setConfirmDeleteId(null);
  }, []);

  const handleDeleteLocalOnly = useCallback(() => {
    if (!confirmDeleteConv || clearingConv) return;
    hapticWarning();
    hideDeletedConversation(confirmDeleteConv.id);
    showConvToast("تم مسح المحادثة من قائمتك");
  }, [clearingConv, confirmDeleteConv, hideDeletedConversation, showConvToast]);

  const handleDeleteForBoth = useCallback(async () => {
    if (!confirmDeleteConv || clearingConv) return;
    hapticWarning();
    setClearingConv(true);
    try {
      await clearConversationForBothParties(confirmDeleteConv);
      hideDeletedConversation(confirmDeleteConv.id);
      await refreshConversations();
      showConvToast("تم مسح المحادثة للطرفين");
    } catch (error) {
      console.error("[AlphaConversations:clearBoth]", error);
      showConvToast("تعذّر مسح المحادثة للطرفين");
    } finally {
      setClearingConv(false);
    }
  }, [clearingConv, confirmDeleteConv, hideDeletedConversation, refreshConversations, showConvToast]);

  // Re-read from localStorage every time this screen mounts (after returning from chat)
  useEffect(() => {
    setHiddenConvIds(loadLS<string[]>(HIDDEN_CONVS_KEY, []));
    setMutedConvIds(loadLS<string[]>(MUTED_CONVS_KEY, []));
    setHiddenCode(loadLS<string>(HIDDEN_CODE_KEY, ""));
  }, []);

  // Secret mode: search field matches global code → reveal hidden chats + mark session unlocked
  const secretMode = hiddenCode.length >= 4 && search.trim() === hiddenCode;

  useEffect(() => {
    if (secretMode) saveLS(HIDDEN_SESSION_KEY, true);
  }, [secretMode]);

  const filters = BASE_FILTERS;

  // ── Scroll-reveal filters (below search; pull-down at top or scroll list) ──
  const [filtersVisible, setFiltersVisible] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const pullDelta = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const y = el.scrollTop;

    if (y > 14) {
      setFiltersVisible(true);
    } else if (y <= 1 && pullDelta.current < 24) {
      setFiltersVisible(false);
    } else if (y > lastScrollY.current + 3) {
      setFiltersVisible(true);
    }

    lastScrollY.current = y;
  }, []);

  const onListTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    pullDelta.current = 0;
  }, []);

  const onListTouchMove = useCallback((e: React.TouchEvent) => {
    const el = scrollerRef.current;
    if (!el || touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (el.scrollTop <= 0 && dy > 0) {
      pullDelta.current = dy;
      if (dy >= 28) setFiltersVisible(true);
    }
  }, []);

  const onListTouchEnd = useCallback(() => {
    const el = scrollerRef.current;
    const pull = pullDelta.current;
    touchStartY.current = null;
    if (el && el.scrollTop <= 1 && pull < 28) {
      setFiltersVisible(false);
    }
    pullDelta.current = 0;
  }, []);

  // Conversations visible in secret mode (hidden ones only)
  const visibleHidden = useMemo(
    () => dbConversations.filter((item) => hiddenConvIds.includes(item.id)),
    [dbConversations, hiddenConvIds],
  );

  // Conversations visible in normal mode (hidden + deleted are always excluded)
  const visible = useMemo(() => dbConversations.filter((item) => {
    if (hiddenConvIds.includes(item.id)) return false;
    if (deletedConvIds.includes(item.id)) return false;
    const matchesSearch = search.trim() === "" || `${item.name} ${item.message}`.includes(search.trim());
    const matchesFilter = activeFilter === "الكل"
      || (activeFilter === "خاصة" && item.kind === "private")
      || (activeFilter === "مجموعات" && item.kind === "group")
      || (activeFilter === "كهنة" && item.role === "priest")
      || (activeFilter === "خدام" && item.role === "servant")
      || (activeFilter === "غير مقروءة" && Boolean(item.unread));
    return matchesSearch && matchesFilter;
  }), [activeFilter, search, hiddenConvIds, deletedConvIds, dbConversations]);

  const newChatTargets = useMemo(
    () => dbConversations.filter(
      (item) => item.kind === "private"
        && !hiddenConvIds.includes(item.id)
        && !deletedConvIds.includes(item.id),
    ),
    [dbConversations, hiddenConvIds, deletedConvIds],
  );

  const openConversation = useCallback((conversation: Conversation) => {
    hapticSelection();
    onOpenChat(conversation);
  }, [onOpenChat]);

  const handleNewChatSelect = useCallback((id: string) => {
    hapticSelection();
    setShowNewChat(false);
    const conversation = dbConversations.find((item) => item.id === id);
    if (conversation) openConversation(conversation);
  }, [dbConversations, openConversation]);

  return (
    <main dir="rtl" className="flex h-full min-h-0 flex-col overflow-hidden font-arabic text-foreground">
      <div className="shrink-0 px-4 pt-[max(env(safe-area-inset-top),16px)]">

        {/* ── Header ── */}
        <header className="mb-5 flex items-center justify-between gap-3 pt-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              onClick={handleBack}
              aria-label="رجوع"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-[18px] border border-gold/12 bg-[rgba(247,240,224,0.62)] text-gold shadow-[0_2px_12px_-4px_rgba(200,149,42,0.18),0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:border-gold/28 hover:bg-[rgba(247,240,224,0.78)]"
            >
              <ArrowLeft className="size-[18px]" />
            </Button>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-gold/75">
                <span>Α</span>
                <span className="h-px w-5 bg-gold/40" />
                <span>Ω</span>
              </div>
              <h1 className="text-[26px] font-extrabold tracking-tight">المحادثات</h1>
              <p className="mt-1 text-[11px] text-muted-foreground">مساحتك الخاصة والموثّقة داخل Alpha</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="إعدادات الرسائل"
              className="grid size-8 shrink-0 place-items-center rounded-[14px] border border-white/28 bg-white/58 shadow-[0_8px_22px_rgba(0,0,0,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-3xl transition-all hover:border-white/38 hover:bg-white/68 active:scale-[0.94]"
            >
              <Settings2 className="size-[15px] text-[#166534]" strokeWidth={2.15} />
            </button>
            <Button
              onClick={() => { hapticSelection(); setShowNewChat(true); }}
              aria-label="محادثة جديدة"
              size="icon"
              className="size-9 rounded-full border border-gold/40 bg-card/85 text-gold shadow-[0_4px_18px_-6px_var(--gold)] backdrop-blur-xl hover:bg-gold/10"
            >
              <SquarePen className="size-4" />
            </Button>
          </div>
        </header>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="pointer-events-none absolute right-4 top-1/2 z-10 size-4 -translate-y-1/2 text-gold/80" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="بحث في المحادثات"
            placeholder="ابحث عن محادثة، عضو، كاهن أو خادم"
            className="h-12 rounded-2xl border-gold/20 bg-card/80 pr-11 pl-12 text-[12px] shadow-xl backdrop-blur-xl placeholder:text-muted-foreground/60 focus-visible:ring-gold/50"
          />
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
        </div>

        {/* ── Filter pills — hidden in secret mode, revealed on scroll-down / pull-down ── */}
        <div
          className="mx-auto max-w-[var(--alpha-dock-max-width)]"
          style={{
            maxHeight: (!secretMode && filtersVisible) ? "56px" : "0px",
            opacity: (!secretMode && filtersVisible) ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 280ms ease, opacity 220ms ease",
          }}
        >
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                variant="ghost"
                className={`h-8 shrink-0 rounded-full border px-3.5 text-[11px] transition-all ${
                  activeFilter === filter
                    ? "border-gold/55 bg-gold text-navy-deep shadow-[0_4px_14px_-4px_var(--gold)]"
                    : "border-gold/15 bg-card/60 text-muted-foreground hover:border-gold/30 hover:bg-card/80"
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable conversation list ── */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onTouchStart={onListTouchStart}
        onTouchMove={onListTouchMove}
        onTouchEnd={onListTouchEnd}
        className="mx-auto min-h-0 w-full max-w-[var(--alpha-dock-max-width)] flex-1 overflow-y-auto overscroll-y-contain px-4 pb-28"
      >

        {/* ── Conversation cards ── */}
        <section className="mt-1 space-y-2" aria-label="قائمة المحادثات">
          {/* Secret mode: show hidden conversations when PIN typed in search */}
          {secretMode && (
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-[#374151]">المحادثات المخفية</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[10px] text-[#6B7280] transition-colors hover:text-[#374151]"
              >
                إخفاء النتائج
              </button>
            </div>
          )}
          {(secretMode ? visibleHidden : visible).map((conversation) => (
            <SwipeConvCard
              key={conversation.id}
              variant={secretMode ? "hidden" : "normal"}
              onHide={() => {
                if (hasSecretCode()) {
                  hapticMediumImpact();
                  const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []);
                  saveLS(HIDDEN_CONVS_KEY, [...new Set([...list, conversation.id])]);
                  setHiddenConvIds((p) => [...new Set([...p, conversation.id])]);
                  showConvToast("تم إخفاء المحادثة");
                } else {
                  setNeedCodePrompt(true);
                }
              }}
              onUnhide={() => {
                hapticMediumImpact();
                const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []).filter((id) => id !== conversation.id);
                saveLS(HIDDEN_CONVS_KEY, list);
                setHiddenConvIds(list);
                showConvToast("تم إظهار المحادثة في القائمة");
              }}
              onDeleteRequest={() => { hapticMediumImpact(); setConfirmDeleteId(conversation.id); }}
            >
            <article
              onClick={() => openConversation(conversation)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openConversation(conversation);
              }}
              role="button"
              tabIndex={0}
              className={MESSAGING_CONV_CARD}
            >
              <AlphaIdentityRow
                className="w-full"
                name={conversation.name}
                role={conversation.role}
                avatar={conversation.avatar}
                avatarSize="md"
                presenceUserId={conversation.id}
                nameClassName="text-[12.5px] font-bold leading-tight text-[#1F2937]"
                subtitle={
                  <span
                    className={`text-[11px] leading-4 ${
                      conversation.unread ? "font-semibold text-foreground/90" : "text-muted-foreground/75"
                    }`}
                  >
                    {conversation.message}
                  </span>
                }
                trailing={
                  <div className="flex shrink-0 flex-col items-end justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      {mutedConvIds.includes(conversation.id) && (
                        <BellOff className="size-3 text-[#8A6A3D]" aria-label="مكتوم" />
                      )}
                      <time className="text-[8.5px] text-muted-foreground/65">{conversation.time}</time>
                    </div>
                    {conversation.unread ? (
                      <span className="grid min-w-[18px] place-items-center rounded-full bg-alpha-purple px-1 py-0.5 text-[8px] font-bold text-alpha-purple-foreground shadow-[0_0_8px_var(--alpha-purple)]">
                        {conversation.unread}
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-gold/45">✓✓</span>
                    )}
                  </div>
                }
              />
            </article>
            </SwipeConvCard>
          ))}
        </section>
      </div>

      {/* ── New chat picker (glass) ── */}
      {showNewChat && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/32 backdrop-blur-[3px] px-4"
          onClick={() => setShowNewChat(false)}
        >
          <div
            dir="rtl"
            className="w-full max-w-[288px] overflow-hidden rounded-[20px] border border-white/28 bg-white/62 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex h-11 items-center justify-center border-b border-white/20 px-4 pt-2">
              <p className="text-[13px] font-bold text-[#1F2937]">محادثة جديدة</p>
              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                className="absolute inset-y-0 start-4 flex items-center pt-0.5 text-[15px] font-bold text-[#166534] hover:text-[#14532D]"
              >
                تم
              </button>
            </div>
            <p className="px-4 py-2 text-center text-[10px] text-[#6B7280]">اختر من تريد مراسلته</p>
            <div className="max-h-[52vh] space-y-2 overflow-y-auto px-2.5 pb-3.5">
              {newChatTargets.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleNewChatSelect(conversation.id)}
                  className="w-full rounded-[14px] border border-white/32 bg-white/42 px-3 py-2.5 text-right shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] transition-all hover:bg-white/58 active:scale-[0.98]"
                >
                  <AlphaIdentityRow
                    name={conversation.name}
                    role={conversation.role}
                    avatar={conversation.avatar}
                    avatarSize="sm"
                    presenceUserId={conversation.id}
                    nameClassName="text-[12px] font-semibold text-[#1F2937]"
                    subtitle={
                      <span className="text-[10px] text-[#6B7280]">
                        {conversation.message || "اضغط لبدء المحادثة"}
                      </span>
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Need code prompt (redirect to settings) ── */}
      {needCodePrompt && (
        <CenterGlassPopup onClose={() => setNeedCodePrompt(false)}>
          <div className="pt-2 text-center">
            <p className="mb-1 text-[14px] font-bold text-[#1F2937]">كود سري مطلوب</p>
            <p className="mb-4 text-[10px] leading-relaxed text-[#6B7280]">
              أنشئ كوداً سرياً أولاً من إعدادات الرسائل ← القفل والخصوصية
            </p>
            <PopupActions
              onCancel={() => setNeedCodePrompt(false)}
              onConfirm={() => { setNeedCodePrompt(false); onOpenSettings(); }}
              cancelLabel="إلغاء"
              confirmLabel="الذهاب للإعدادات"
            />
          </div>
        </CenterGlassPopup>
      )}

      {/* ── Delete confirm (center glass popup) ── */}
      {confirmDeleteConv && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 backdrop-blur-[4px]"
          onClick={() => { if (!clearingConv) setConfirmDeleteId(null); }}
        >
          <div
            dir="rtl"
            className="w-[88%] max-w-[300px] overflow-hidden rounded-[28px] border border-white/20 bg-white/96 px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-center">
              <div className="grid size-10 place-items-center rounded-full bg-[#FEE2E2]">
                <Trash2 className="size-[18px] text-[#B91C1C]" />
              </div>
            </div>
            <p className="mb-1 text-center text-[13px] font-bold text-[#1F2937]">مسح هذه المحادثة؟</p>
            <p className="mb-4 text-center text-[10px] text-[#6B7280]">اختر طريقة المسح.</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => void handleDeleteForBoth()}
                disabled={clearingConv}
                variant="ghost"
                className="h-10 w-full rounded-2xl bg-[#FEE2E2] text-[12px] font-bold text-[#B91C1C] disabled:opacity-35"
              >
                مسح للطرفين
              </Button>
              <Button
                onClick={handleDeleteLocalOnly}
                disabled={clearingConv}
                variant="ghost"
                className="h-10 w-full rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] font-semibold text-[#374151] disabled:opacity-35"
              >
                من قائمتي فقط
              </Button>
              <Button
                onClick={() => setConfirmDeleteId(null)}
                disabled={clearingConv}
                variant="ghost"
                className="h-10 w-full rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] text-[#374151] disabled:opacity-35"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {convToast && (
        <div className="pointer-events-none fixed bottom-28 left-1/2 z-[200] -translate-x-1/2 rounded-full border border-white/12 bg-[#1F2937]/88 px-4 py-2 text-[11px] text-white/90 shadow-lg backdrop-blur-md">
          {convToast}
        </div>
      )}

      <AlphaBottomNavigation />
    </main>
  );
}

// ─── Swipe conversation card ──────────────────────────────────
// Normal: right swipe → Delete · left swipe → Hide
// Hidden list: left swipe → Unhide (show in main list)
function SwipeConvCard({
  children,
  onHide,
  onUnhide,
  onDeleteRequest,
  variant = "normal",
}: {
  children: React.ReactNode;
  onHide: () => void;
  onUnhide?: () => void;
  onDeleteRequest: () => void;
  variant?: "normal" | "hidden";
}) {
  const [dx, setDx] = useState(0);
  const startX     = useRef(0);
  const startY     = useRef(0);
  const dragging   = useRef(false);
  const axis       = useRef<"h" | "v" | null>(null);
  const hapticFired = useRef(false);
  const THRESHOLD  = 80;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current   = e.touches[0].clientX;
    startY.current   = e.touches[0].clientY;
    dragging.current = true;
    axis.current     = null;
    hapticFired.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dX = e.touches[0].clientX - startX.current;
    const dY = e.touches[0].clientY - startY.current;
    if (!axis.current) {
      if (Math.abs(dX) > Math.abs(dY) + 8)      axis.current = "h";
      else if (Math.abs(dY) > Math.abs(dX) + 8) { axis.current = "v"; return; }
      else return;
    }
    if (axis.current === "v") return;
    const newDx  = Math.max(-120, Math.min(120, dX));
    const newPct = Math.abs(newDx) / THRESHOLD;
    // Haptic pulse exactly once when crossing threshold
    if (newPct >= 1 && !hapticFired.current) {
      hapticLightImpact();
      hapticFired.current = true;
    }
    if (newPct < 0.85) hapticFired.current = false; // allow re-fire if pulled back
    setDx(newDx);
  };

  const onTouchEnd = () => {
    dragging.current = false;
    hapticFired.current = false;
    if (axis.current === "h") {
      if (dx > THRESHOLD)       onDeleteRequest(); // right → delete
      else if (dx < -THRESHOLD) {
        if (variant === "hidden" && onUnhide) onUnhide(); // left → unhide in hidden list
        else onHide();                                 // left → hide in main list
      }
    }
    setDx(0);
    axis.current = null;
  };

  const pct = Math.min(Math.abs(dx) / THRESHOLD, 1);
  const iconSz  = 13 + pct * 7;   // 13 → 20 px
  const circleSz = 32 + pct * 18; // 32 → 50 px

  return (
    <div className={`relative overflow-hidden ${MESSAGING_CONV_CARD_RADIUS}`}>

      {/* ── Delete backdrop (right swipe, dx > 0) ── */}
      <div
        className="absolute inset-0 flex items-center justify-end px-5"
        style={{
          background: "linear-gradient(135deg,#7f1d1d 0%,#b91c1c 45%,#ef4444 100%)",
          opacity: dx > 0 ? Math.min(0.15 + pct * 0.85, 1) : 0,
          transition: dragging.current ? "none" : "opacity 0.3s ease",
        }}
        aria-hidden="true"
      >
        <div
          className="grid place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur-sm"
          style={{
            width:     circleSz,
            height:    circleSz,
            opacity:   dx > 0 ? 0.25 + pct * 0.75 : 0,
            transform: `scale(${0.55 + pct * 0.45})`,
            transition: dragging.current ? "none" : "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow:  pct > 0.6 ? "0 4px 20px rgba(185,28,28,0.45),0 0 0 1px rgba(255,255,255,0.12)" : "none",
          }}
        >
          <Trash2
            style={{ width: iconSz, height: iconSz }}
            className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          />
        </div>
      </div>

      {/* ── Hide / Unhide backdrop (left swipe, dx < 0) ── */}
      <div
        className="absolute inset-0 flex items-center justify-start px-5"
        style={{
          background: variant === "hidden"
            ? "linear-gradient(135deg,#14532D 0%,#166534 45%,#22c55e 100%)"
            : "linear-gradient(135deg,#3b0764 0%,#7c3aed 40%,#c8952a 100%)",
          opacity: dx < 0 ? Math.min(0.15 + pct * 0.85, 1) : 0,
          transition: dragging.current ? "none" : "opacity 0.3s ease",
        }}
        aria-hidden="true"
      >
        <div
          className="grid place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur-sm"
          style={{
            width:     circleSz,
            height:    circleSz,
            opacity:   dx < 0 ? 0.25 + pct * 0.75 : 0,
            transform: `scale(${0.55 + pct * 0.45})`,
            transition: dragging.current ? "none" : "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow:  pct > 0.6
              ? variant === "hidden"
                ? "0 4px 20px rgba(22,101,52,0.45),0 0 0 1px rgba(255,255,255,0.12)"
                : "0 4px 20px rgba(124,58,237,0.45),0 0 0 1px rgba(255,255,255,0.12)"
              : "none",
          }}
        >
          {variant === "hidden" ? (
            <Eye
              style={{ width: iconSz, height: iconSz }}
              className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
            />
          ) : (
            <EyeOff
              style={{ width: iconSz, height: iconSz }}
              className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
            />
          )}
        </div>
      </div>

      {/* ── Sliding card ── */}
      <div
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current
            ? "none"
            : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          willChange: "transform",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
