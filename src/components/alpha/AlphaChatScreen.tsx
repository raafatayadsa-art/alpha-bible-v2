import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, BellOff, Camera, Check, Clock3, Copy, File,
  Fingerprint, Image as ImageIcon, LockKeyhole, MapPin, MoreHorizontal,
  Pencil, Phone, Plus, SendHorizontal, ShieldCheck, Smartphone, Smile, Trash2, VolumeX, X, EyeOff,
} from "lucide-react";
import { ConnectConfirmDialog } from "./connect-code-ui";
import { ChatEmojiPickerPanel } from "./ChatEmojiPickerPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AlphaIdentityRow } from "./AlphaIdentityRow";
import { PRESENCE_LABELS } from "@/features/alpha-connect/presence";
import { usePresenceDot, useUserPresenceStatus } from "@/features/alpha-connect/useAlphaPresence";
import { useConnectionStatus, useSecurityStatus } from "@/features/alpha-connect/useAlphaConnectStatus";
import { useAlphaConnectThread } from "@/features/alpha-connect/useAlphaConnectThread";
import {
  mapAlphaConnectMessageToChatMessage,
} from "@/features/alpha-connect/alpha-connect-message-map";
import {
  CHAT_TIMER_LABELS,
  CHAT_TIMER_TOAST,
  DEFAULT_CHAT_TIMER_LABEL,
  isOnReadRetentionPolicy,
  normalizeChatTimerLabel,
  timerLabelToRetention,
} from "@/features/alpha-connect/retention";
import type { AlphaConnectRetentionPolicy } from "@/features/alpha-connect/types";
import { getAuthUserSync } from "@/features/auth";
import { cn } from "@/lib/utils";
import { priestProfile, type Conversation } from "./messaging-data";
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
import { PinBoxes, MESSAGING_GLASS_SHELL, MESSAGING_GLASS_ROW, MESSAGING_GLASS_ROW_DANGER, MESSAGING_GLASS_ICON_BOX, MessagingGlassPanelShell, ALPHA_SETTINGS_ICON_BOX } from "./messaging-ui";
import {
  hapticLightImpact,
  hapticLightTap,
  hapticMediumImpact,
  hapticSelection,
  hapticWarning,
} from "./messaging-haptics";
// ─── Types ───────────────────────────────────────────────────
type Sheet = "timer" | "attach" | "emoji" | "menu" | "security" | "hide-setup" | null;
type MessageStatus = "sent" | "delivered" | "read";

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  incoming: boolean;
  status?: MessageStatus;
  isSystem?: boolean;
  edited?: boolean;
  deleteCountdown?: string | null;
  orderedAt?: number;
}

// ─── Constants / Helpers ─────────────────────────────────────
const timerOptions = CHAT_TIMER_LABELS;

function isLocalOnlyMessageId(id: string): boolean {
  return id.startsWith("sys-") || id.startsWith("local-");
}

/** Embedded chat lives inside overflow/transform ancestors — use absolute overlays. */
function chatOverlayPosition(embedded: boolean): "fixed" | "absolute" {
  return embedded ? "absolute" : "fixed";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

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
export function AlphaChatScreen({
  onBack,
  profile: profileProp,
  returnTo = "/alpha-connect",
  embedded = false,
  hideHeader = false,
  onShowToast,
}: {
  onBack: () => void;
  profile?: Conversation;
  returnTo?: string;
  embedded?: boolean;
  hideHeader?: boolean;
  onShowToast?: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const profile = profileProp ?? priestProfile;
  const convId = profile.id;
  const contactPresenceDot = usePresenceDot(convId);
  const contactPresence = useUserPresenceStatus(convId);
  const presenceLabel = contactPresenceDot ? PRESENCE_LABELS[contactPresenceDot] : "غير متصل";
  const presenceTextClass =
    contactPresence === "busy"
      ? "text-[#ea580c]"
      : contactPresence === "hidden"
        ? "text-[#374151]"
        : contactPresenceDot
          ? "text-[#166534]"
          : "text-[#9CA3AF]";
  const threadScope = profile.kind === "group" ? "group" : "direct";
  const [timerAnchorMs, setTimerAnchorMs] = useState(0);
  const [activeRetentionPolicy, setActiveRetentionPolicy] = useState<AlphaConnectRetentionPolicy | null>(null);
  const thread = useAlphaConnectThread({
    scope: threadScope,
    peerKey: profile.kind !== "group" ? profile.id : undefined,
    groupCode: profile.kind === "group" ? profile.id : undefined,
    groupTitle: profile.name,
    conversationId: profile.conversationId,
    enabled: true,
    timerAnchorMs,
    activeRetentionPolicy,
  });

  const [countdownTick, setCountdownTick] = useState(() => Date.now());

  const dbMessages = useMemo(() => {
    const user = getAuthUserSync();
    if (!user?.id) return [];
    return thread.messages.map((m) =>
      mapAlphaConnectMessageToChatMessage(m, user.id, countdownTick, timerAnchorMs),
    );
  }, [thread.messages, countdownTick, timerAnchorMs]);

  const [localExtra, setLocalExtra] = useState<ChatMessage[]>([]);
  const messages = useMemo(() => {
    const merged = [...dbMessages, ...localExtra];
    return merged.sort((a, b) => (a.orderedAt ?? 0) - (b.orderedAt ?? 0));
  }, [dbMessages, localExtra]);
  const [input, setInput]             = useState("");
  const [sheet, setSheet]             = useState<Sheet>(null);
  const [timer, setTimerState]        = useState<string>(() => normalizeChatTimerLabel(loadLS(TIMER_KEY, DEFAULT_CHAT_TIMER_LABEL)));
  const [muted, setMutedState]        = useState<boolean>(() => loadLS<string[]>(MUTED_CONVS_KEY, []).includes(convId));
  const [isLocked, setIsLockedState]  = useState<boolean>(() => loadLS(convLockedKey(convId), false));
  const [lockMethod, setLockMethod]   = useState<"face-id" | "pin">(() => loadLS(convLockMethodKey(convId), "face-id"));
  const [savedPin, setSavedPin]       = useState<string>(() => loadLS(convPinKey(convId), "123456"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !loadLS(convLockedKey(convId), false));
  const [lockEntry, setLockEntry]     = useState("");
  const [lockEntryError, setLockEntryError] = useState(false);
  const [isHidden, setIsHidden]         = useState<boolean>(() => loadLS<string[]>(HIDDEN_CONVS_KEY, []).includes(convId));
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [longPressId, setLongPressId]   = useState<string | null>(null);
  const actionMenuOpenedAt = useRef(0);
  const overlayPos = chatOverlayPosition(embedded);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingOnReadRef = useRef<Set<string>>(new Set());
  const exitFlushedRef = useRef(false);
  const markReadRef = useRef(thread.markRead);
  const onBackRef = useRef(onBack);
  markReadRef.current = thread.markRead;
  onBackRef.current = onBack;

  useEffect(() => {
    exitFlushedRef.current = false;
    pendingOnReadRef.current.clear();
  }, [convId]);
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
    if (embedded && onShowToast) {
      onShowToast(msg);
      return;
    }
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, [embedded, onShowToast]);

  useEffect(() => {
    const interval = setInterval(() => setCountdownTick(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!thread.error || thread.loading) return;
    console.error("[AlphaChatScreen:thread]", thread.error);
    showToast(thread.error);
  }, [thread.error, thread.loading, showToast]);

  useEffect(() => {
    const user = getAuthUserSync();
    if (!user?.id) return;
    for (const message of thread.messages) {
      if (message.sender_id === user.id || message.read_at) continue;
      if (!isOnReadRetentionPolicy(message.retention_policy)) continue;
      pendingOnReadRef.current.add(message.id);
    }
  }, [thread.messages]);

  const flushOnReadOnExit = useCallback(() => {
    if (exitFlushedRef.current) return;
    const ids = [...pendingOnReadRef.current];
    if (!ids.length) return;
    exitFlushedRef.current = true;
    pendingOnReadRef.current.clear();
    for (const id of ids) {
      void markReadRef.current(id);
    }
  }, []);

  const handleLeaveChat = useCallback(() => {
    flushOnReadOnExit();
    onBackRef.current();
  }, [flushOnReadOnExit]);

  useEffect(() => () => {
    flushOnReadOnExit();
  }, [flushOnReadOnExit]);

  const handleCall = useCallback(() => {
    if (profile.kind === "group") {
      void navigate({ to: "/alpha-connect" });
      return;
    }
    void navigate({
      to: "/personal-call",
      search: {
        name: profile.name,
        contactId: profile.id,
        from: returnTo,
      },
    });
  }, [navigate, profile.id, profile.kind, profile.name, returnTo]);

  const sendMessageToThread = useCallback(async (body: string) => {
    const result = await thread.sendText(body, timerLabelToRetention(timerRef.current));
    if (!result.ok) {
      console.error("[AlphaChatScreen:send]", result.error);
      showToast(result.error);
    }
    return result.ok;
  }, [thread.sendText, showToast]);

  // ── Send / Save edit ────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    hapticLightTap();
    if (editingId) {
      if (isLocalOnlyMessageId(editingId)) {
        setLocalExtra((p) => p.map((m) => (m.id === editingId ? { ...m, text, edited: true } : m)));
      } else {
        showToast("لا يمكن تعديل الرسائل المزامنة بعد الإرسال");
      }
      setInput("");
      setEditingId(null);
      return;
    }
    const ok = await sendMessageToThread(text);
    if (ok) setInput("");
  }, [input, editingId, sendMessageToThread, showToast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  }, [handleSend]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    hapticLightTap();
    setInput((prev) => prev + emoji);
  }, []);

  const handleImageFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    hapticLightTap();
    await sendMessageToThread(`🖼️ صورة: ${file.name || "صورة"} (${formatFileSize(file.size)})`);
  }, [sendMessageToThread]);

  const handleGenericFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    hapticLightTap();
    await sendMessageToThread(`📄 ملف: ${file.name} (${formatFileSize(file.size)})`);
  }, [sendMessageToThread]);

  const handleShareLocation = useCallback(() => {
    hapticLightTap();
    if (!navigator.geolocation) {
      showToast("الموقع غير متاح على هذا الجهاز");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const link = `https://maps.google.com/?q=${latitude},${longitude}`;
        void sendMessageToThread(`📍 موقع: ${link}`);
      },
      () => showToast("تعذّر الوصول للموقع"),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, [sendMessageToThread, showToast]);

  // ── Attach ──────────────────────────────────────────────────
  const handleAttach = useCallback((label: string) => {
    setSheet(null);
    if (label === "صورة") {
      imageInputRef.current?.click();
      return;
    }
    if (label === "الكاميرا") {
      cameraInputRef.current?.click();
      return;
    }
    if (label === "ملف") {
      fileInputRef.current?.click();
      return;
    }
    if (label === "الموقع") {
      handleShareLocation();
    }
  }, [handleShareLocation]);

  // ── Timer ───────────────────────────────────────────────────
  const handleSetTimer = useCallback((newTimer: string) => {
    const anchor = Date.now();
    const policy = timerLabelToRetention(newTimer);
    setTimerAnchorMs(anchor);
    setActiveRetentionPolicy(policy);
    setTimerState(newTimer);
    saveLS(TIMER_KEY, newTimer);
    const label = CHAT_TIMER_TOAST[newTimer as keyof typeof CHAT_TIMER_TOAST] ?? `تم ضبط المؤقت على ${newTimer}.`;
    setLocalExtra((p) => [
      ...p,
      {
        id: `sys-${anchor}`,
        text: `🕒 ${label}`,
        time: formatTimeAr(),
        incoming: false,
        isSystem: true,
        orderedAt: anchor,
      },
    ]);
  }, []);

  // ── Mute (persisted) ────────────────────────────────────────
  const handleSetMuted = useCallback((v: boolean) => {
    hapticSelection();
    setMutedState(v);
    const list = loadLS<string[]>(MUTED_CONVS_KEY, []);
    saveLS(MUTED_CONVS_KEY, v ? [...new Set([...list, convId])] : list.filter((id) => id !== convId));
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

  const openMessageActions = useCallback((messageId: string) => {
    hapticMediumImpact();
    actionMenuOpenedAt.current = Date.now();
    setLongPressId(messageId);
  }, []);

  const handleDeleteMessage = useCallback(async (id: string) => {
    hapticWarning();
    if (isLocalOnlyMessageId(id)) {
      setLocalExtra((p) => p.filter((m) => m.id !== id));
      setDeleteConfirmId(null);
      return;
    }

    const result = await thread.deleteMessage(id);
    setDeleteConfirmId(null);
    if (result.ok) {
      showToast("تم حذف الرسالة للطرفين");
      return;
    }
    showToast(result.error);
  }, [thread.deleteMessage, showToast]);

  // ── Hide conversation ──────────────────────────────────────
  const handleHideConversation = useCallback(() => {
    if (hasSecretCode()) setSheet("hide-setup");
    else showToast("أنشئ الكود السري من إعدادات الرسائل ← القفل والخصوصية");
  }, [showToast]);

  const handleConfirmHide = useCallback(() => {
    hapticMediumImpact();
    const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []);
    saveLS(HIDDEN_CONVS_KEY, [...new Set([...list, convId])]);
    setIsHidden(true);
    setSheet(null);
    showToast("تم إخفاء المحادثة");
    setTimeout(() => handleLeaveChat(), 900);
  }, [handleLeaveChat, showToast, convId]);

  // ── Unhide conversation ───────────────────────────────────────
  const handleUnhideConversation = useCallback(() => {
    hapticSelection();
    const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []);
    saveLS(HIDDEN_CONVS_KEY, list.filter((id) => id !== convId));
    setIsHidden(false);
    setSheet(null);
    showToast("تم إظهار المحادثة");
  }, [showToast, convId]);

  // ── Clear chat ───────────────────────────────────────────────
  const handleClearConfirmed = useCallback(() => {
    hapticWarning();
    setLocalExtra([]);
    setConfirmClear(false);
    setSheet(null);
    showToast("تم مسح الرسائل المحلية فقط");
  }, [showToast]);

  const headerBg    = embedded ? "border-white/10 bg-[#060d1f]/80"                   : "border-gold/10 bg-card/70";
  const backBtnCls  = embedded
    ? "size-9 justify-self-end rounded-full border border-white/15 bg-white/8 text-foreground shadow-sm backdrop-blur-sm hover:bg-white/15"
    : "size-9 justify-self-end rounded-full border border-gold/20 bg-card/60 text-gold shadow-sm backdrop-blur-sm hover:bg-gold/10 hover:text-gold";
  const avatarRingCls = embedded ? "border-neon-green/40 shadow-[0_0_12px_oklch(0.82_0.22_145/0.3)]" : "border-gold/40 shadow-[0_0_12px_rgba(200,149,42,0.22)]";
  const mutedTagCls   = embedded
    ? "flex items-center gap-0.5 rounded-full border border-white/15 bg-white/8 px-1.5 py-0.5 text-[7px] font-medium text-muted-foreground"
    : "flex items-center gap-0.5 rounded-full border border-[#8A6A3D]/20 bg-card/80 px-1.5 py-0.5 text-[7px] font-medium text-[#8A6A3D]";
  const lockedTagCls  = embedded
    ? "flex items-center gap-0.5 rounded-full border border-neon-green/20 bg-neon-green/10 px-1.5 py-0.5 text-[7px] font-medium text-neon-green"
    : "flex items-center gap-0.5 rounded-full border border-gold/20 bg-card/80 px-1.5 py-0.5 text-[7px] font-medium text-gold";
  const menuBtnCls    = embedded
    ? "size-8 rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
    : "size-8 rounded-full text-gold/65 hover:bg-gold/10 hover:text-gold";

  return (
    <main dir="rtl" className={`flex h-full min-h-0 flex-col overflow-hidden font-arabic text-foreground ${embedded ? "connect-chat-surface relative" : ""}`}>

      {/* ── Header — always visible even when locked ── */}
      {!hideHeader ? (
      <header className={`z-20 border-b px-3 pb-2 backdrop-blur-2xl ${headerBg} ${embedded ? "pt-2" : "pt-[max(env(safe-area-inset-top),8px)]"}`}>
        <div className="mx-auto grid max-w-[var(--alpha-dock-max-width)] grid-cols-[40px_1fr_76px] items-center gap-1">

          <Button
            onClick={handleLeaveChat}
            aria-label="رجوع"
            variant="ghost"
            size="icon"
            className={backBtnCls}
          >
            <ArrowLeft className="size-[18px]" />
          </Button>

          <div className="flex min-w-0 items-center justify-center">
            <AlphaIdentityRow
              className="min-w-0"
              name={profile.name}
              role={profile.role}
              avatar={profile.avatar}
              avatarSize="sm"
              presenceUserId={profile.id}
              nameClassName={`text-[14px] font-bold leading-tight ${embedded ? "text-foreground" : ""}`}
              meta={
                <div className="flex items-center gap-1.5">
                  <p className={`text-[8.5px] font-semibold tracking-wide ${presenceTextClass}`}>{presenceLabel}</p>
                  {muted && (
                    <span className={mutedTagCls}>
                      <BellOff className="size-2.5" />
                      مكتوم
                    </span>
                  )}
                  {isLocked && isAuthenticated && (
                    <span className={lockedTagCls}>
                      <LockKeyhole className="size-2.5" />
                      مقفل
                    </span>
                  )}
                </div>
              }
            />
          </div>

          <div className="flex items-center justify-end gap-0.5">
            <Button onClick={() => setSheet("menu")} aria-label="المزيد" variant="ghost" size="icon" className={menuBtnCls}>
              <MoreHorizontal className="size-[18px]" />
            </Button>
            <Button onClick={handleCall} aria-label="اتصال" variant="ghost" size="icon" className={embedded ? "size-8 rounded-full text-[var(--neon-blue)]/75 hover:bg-white/10 hover:text-[var(--neon-blue)]" : "size-8 rounded-full text-gold/65 hover:bg-gold/10 hover:text-gold"}>
              <Phone className="size-[18px]" />
            </Button>
          </div>
        </div>
      </header>
      ) : null}

      {/* ── Lock screen OR Chat content ── */}
      {isLocked && !isAuthenticated ? (
        <LockScreen
          method={lockMethod}
          pinEntry={lockEntry}
          onPinChange={setLockEntry}
          pinError={lockEntryError}
          onFaceId={() => setIsAuthenticated(true)}
          onPinSubmit={handlePinUnlock}
          onBack={handleLeaveChat}
        />
      ) : (
        <>
          {/* ── Immersive toolbar (Connect header owns back/contact) ── */}
          {hideHeader && embedded ? (
            <div className="z-10 mx-auto flex w-full max-w-[var(--alpha-dock-max-width)] items-center justify-end gap-0.5 px-3 pb-1 pt-0.5">
              <Button onClick={() => setSheet("menu")} aria-label="المزيد" variant="ghost" size="icon" className={menuBtnCls}>
                <MoreHorizontal className="size-[18px]" />
              </Button>
              <Button onClick={handleCall} aria-label="اتصال" variant="ghost" size="icon" className="size-8 rounded-full text-[var(--neon-blue)]/75 hover:bg-white/10 hover:text-[var(--neon-blue)]">
                <Phone className="size-[18px]" />
              </Button>
            </div>
          ) : null}

          {/* ── Privacy pill ── */}
          <div className={`z-10 flex justify-center px-4 ${hideHeader ? "pt-1" : "pt-2"}`}>
            <div className={`connect-chat-notice connect-chat-notice--privacy ${embedded ? "connect-chat-notice--embedded" : ""}`}>
              <LockKeyhole className="connect-chat-notice__icon shrink-0" />
              <p className="connect-chat-notice__text">
                محادثة خاصة ومشفرة · لا يمكن الاطلاع عليها
              </p>
            </div>
          </div>

          {/* ── Messages ── */}
          <section
            className="no-scrollbar relative mx-auto flex w-full max-w-[var(--alpha-dock-max-width)] flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4"
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
              <div className={`h-px flex-1 ${embedded ? "bg-white/10" : "bg-gold/10"}`} />
              <span className={`rounded-full border px-3 py-0.5 text-[8px] backdrop-blur-sm ${embedded ? "border-white/12 bg-white/8 text-muted-foreground/70" : "border-gold/12 bg-card/50 text-muted-foreground/60"}`}>اليوم</span>
              <div className={`h-px flex-1 ${embedded ? "bg-white/10" : "bg-gold/10"}`} />
            </div>

            {/* Messages — long-press to open action menu */}
            {messages.map((msg) => (
              <Message
                key={msg.id}
                {...msg}
                embedded={embedded}
                onOpenActions={!msg.isSystem ? () => openMessageActions(msg.id) : undefined}
              />
            ))}

            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-[13px] text-muted-foreground/60">لا توجد رسائل</p>
                <p className="text-[10px] text-muted-foreground/35">ابدأ محادثة جديدة 🕊️</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </section>

          {/* ── Composer ── */}
          <footer ref={footerRef} className={`z-20 border-t px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur-2xl ${
            embedded ? "connect-chat-composer border-white/10 bg-[#060d1f]/90" : "border-gold/10 bg-card/75"
          }`}>
            {/* Edit mode banner */}
            {editingId && (
              <div className={`mx-auto mb-2 flex max-w-[var(--alpha-dock-max-width)] items-center justify-between rounded-xl border px-3 py-1.5 ${
                embedded ? "border-neon-green/20 bg-neon-green/10" : "border-gold/15 bg-gold/8"
              }`}>
                <div className="flex items-center gap-1.5">
                  <Pencil className={`size-3 ${embedded ? "text-neon-green" : "text-gold"}`} />
                  <span className={`text-[11px] font-medium ${embedded ? "text-foreground/90" : "text-[#374151]"}`}>تعديل الرسالة</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setInput(""); setEditingId(null); }}
                  className={`text-[10px] ${embedded ? "text-muted-foreground hover:text-foreground" : "text-[#6B7280] hover:text-[#374151]"}`}
                >
                  إلغاء
                </button>
              </div>
            )}
            <div className={`mx-auto flex max-w-[var(--alpha-dock-max-width)] items-center gap-1.5 rounded-[22px] border py-1.5 pl-2 pr-1.5 shadow-sm backdrop-blur-xl ${
              embedded
                ? "border-white/12 bg-white/6"
                : "border-gold/18 bg-background/65"
            }`}>
              <button
                type="button"
                aria-label={editingId ? "حفظ التعديل" : "إرسال الرسالة"}
                disabled={!input.trim() || thread.sending}
                onClick={() => void handleSend()}
                className={`connect-chat-send-btn grid h-10 min-w-[48px] shrink-0 place-items-center rounded-full px-3 transition-all hover:scale-105 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100 me-2 ${
                  embedded
                    ? "connect-chat-send-btn--embedded"
                    : "bg-gradient-to-br from-gold to-gold-deep text-navy-deep shadow-[0_2px_10px_-4px_var(--gold)] hover:shadow-[0_4px_16px_-4px_var(--gold)]"
                }`}
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
                className={
                  embedded
                    ? "connect-chat-timer-btn flex shrink-0 items-center rounded-[14px] border border-white/12 bg-white/6 p-1 transition-all active:scale-[0.98]"
                    : "flex shrink-0 items-center gap-1 rounded-full border border-[#FCA5A5] bg-[#FEE2E2] px-2 py-1 transition-colors hover:bg-[#FCA5A5]/40"
                }
              >
                <span className={embedded ? `${ALPHA_SETTINGS_ICON_BOX} !size-7` : "flex items-center"}>
                  <Clock3 className={`size-3.5 ${embedded ? "text-gold" : "text-[#DC2626]"}`} />
                </span>
              </button>

              <Input
                aria-label="اكتب رسالة"
                placeholder="اكتب رسالة..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-relaxed shadow-none focus-visible:ring-0 ${
                  embedded ? "text-foreground placeholder:text-muted-foreground/50" : "placeholder:text-muted-foreground/40"
                }`}
              />

              <button
                type="button"
                onClick={() => setSheet((prev) => (prev === "emoji" ? null : "emoji"))}
                aria-label="إيموجي"
                aria-pressed={sheet === "emoji"}
                className={`connect-chat-emoji-btn grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
                  embedded
                    ? sheet === "emoji"
                      ? "border-neon-green/35 bg-neon-green/12 text-neon-green"
                      : "border-white/12 bg-white/6 text-muted-foreground hover:text-foreground"
                    : sheet === "emoji"
                      ? "border-gold/40 bg-gold/12 text-gold"
                      : "border-[#D6C4A8] bg-[#F5F0E6] text-[#5B4636] hover:bg-[#D6C4A8]/70 hover:text-[#3F2F24]"
                }`}
              >
                <Smile className="size-[17px]" />
              </button>

              <button
                type="button"
                onClick={() => setSheet((prev) => (prev === "attach" ? null : "attach"))}
                aria-label="إرفاق"
                aria-pressed={sheet === "attach"}
                className={`connect-chat-attach-btn grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
                  embedded
                    ? "connect-chat-attach-btn--embedded"
                    : "border-[#D6C4A8] bg-[#F5F0E6] text-[#5B4636] hover:bg-[#D6C4A8]/70 hover:text-[#3F2F24]"
                }`}
              >
                <Plus className="size-[17px]" />
              </button>
            </div>
          </footer>
        </>
      )}

      {/* ── Delete message confirmation ── */}
      {embedded ? (
        <ConnectConfirmDialog
          open={!!deleteConfirmId}
          scoped
          zIndex={280}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            if (deleteConfirmId) void handleDeleteMessage(deleteConfirmId);
          }}
          title="حذف هذه الرسالة؟"
          description="ستُحذف عندك وعند الطرف الآخر."
          confirmLabel="حذف"
          tone="danger"
          icon={Trash2}
        />
      ) : deleteConfirmId ? (
        <div
          className={`${overlayPos} inset-0 z-[160] flex items-center justify-center bg-black/45 backdrop-blur-[4px]`}
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
            <p className="mb-4 text-center text-[10px] text-[#6B7280]">ستُحذف عندك وعند الطرف الآخر.</p>
            <div className="flex gap-2.5">
              <Button onClick={() => setDeleteConfirmId(null)} variant="ghost" className="h-10 flex-1 rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] text-[#374151]">إلغاء</Button>
              <Button onClick={() => void handleDeleteMessage(deleteConfirmId)} variant="ghost" className="h-10 flex-1 rounded-2xl bg-[#FEE2E2] text-[12px] font-bold text-[#B91C1C]">حذف</Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Clear chat confirmation ── */}
      {embedded ? (
        <ConnectConfirmDialog
          open={confirmClear}
          scoped
          zIndex={280}
          onClose={() => setConfirmClear(false)}
          onConfirm={handleClearConfirmed}
          title="مسح المحادثة"
          description="لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="مسح"
          tone="danger"
          icon={Trash2}
        />
      ) : confirmClear ? (
        <div
          className={`${overlayPos} inset-0 z-[160] flex items-center justify-center bg-black/45 backdrop-blur-[4px]`}
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
      ) : null}

      {/* ── Toast (standalone only — embedded uses ConnectTopToast) ── */}
      {!embedded && toast ? (
        <div className="pointer-events-none fixed bottom-28 left-1/2 z-[200] -translate-x-1/2 rounded-full border border-white/12 bg-[#1F2937]/88 px-4 py-2 text-[11px] text-white/90 shadow-lg backdrop-blur-md">
          {toast}
        </div>
      ) : null}

      {/* ── Message action menu (tap or long-press) ── */}
      {longPressId && (() => {
        const msg = messages.find((m) => m.id === longPressId);
        if (!msg) return null;
        return (
          <div
            className={`${overlayPos} inset-0 z-[270]`}
            onPointerDown={() => {
              if (Date.now() - actionMenuOpenedAt.current < 400) return;
              setLongPressId(null);
            }}
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
                  actionMenuOpenedAt.current = Date.now();
                  setDeleteConfirmId(msg.id);
                  setLongPressId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-right text-[12px] text-[#F87171] transition-colors hover:bg-white/8"
              >
                <Trash2 className="size-3.5 shrink-0" />
                حذف الرسالة
              </button>
            </div>
          </div>
        );
      })()}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleImageFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void handleImageFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          void handleGenericFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

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
        embedded={embedded}
        onEmojiSelect={handleEmojiSelect}
      />
    </main>
  );
}

// ─── System event notice ──────────────────────────────────────
function SystemMessage({ text, embedded = false }: { text: string; embedded?: boolean }) {
  return (
    <div className="flex justify-center py-0.5">
      <span className={`max-w-[80%] rounded-full border px-3.5 py-1 text-center text-[9px] leading-relaxed backdrop-blur-sm ${
        embedded
          ? "border-white/12 bg-white/8 text-muted-foreground/80"
          : "border-gold/12 bg-card/50 text-muted-foreground/65"
      }`}>
        {text}
      </span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────
function Message({ id, text, time, incoming, status, isSystem, edited, deleteCountdown, embedded = false, onOpenActions }: {
  id: string; text: string; time: string; incoming?: boolean; status?: MessageStatus;
  isSystem?: boolean; edited?: boolean; deleteCountdown?: string | null; embedded?: boolean; onOpenActions?: () => void;
}) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!onOpenActions || event.button !== 0) return;
    longPressFired.current = false;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onOpenActions();
    }, 480);
  }, [clearPressTimer, onOpenActions]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current || !pressTimer.current) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    if (Math.hypot(dx, dy) > 12) clearPressTimer();
  }, [clearPressTimer]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    clearPressTimer();
    if (longPressFired.current) {
      event.preventDefault();
      event.stopPropagation();
      window.setTimeout(() => { longPressFired.current = false; }, 350);
    }
    pointerStart.current = null;
  }, [clearPressTimer]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!onOpenActions) return;
    if (longPressFired.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    onOpenActions();
  }, [onOpenActions]);

  if (isSystem) return <SystemMessage text={text} embedded={embedded} />;
  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      onContextMenu={(event) => {
        if (!onOpenActions) return;
        event.preventDefault();
        onOpenActions();
      }}
      onKeyDown={(event) => {
        if (!onOpenActions) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenActions();
        }
      }}
      className={`relative max-w-[82%] cursor-pointer select-none px-4 py-3 text-[13px] leading-[1.7] backdrop-blur-md touch-manipulation ${
        embedded
          ? incoming
            ? "connect-chat-bubble connect-chat-bubble--in self-start rounded-[20px] rounded-tl-[5px] border border-white/14 bg-[oklch(0.24_0.03_260/0.92)] text-foreground shadow-[0_2px_14px_-4px_rgba(0,0,0,0.35)]"
            : "connect-chat-bubble connect-chat-bubble--out self-end rounded-[20px] rounded-tr-[5px] border border-neon-green/30 bg-gradient-to-br from-[oklch(0.28_0.06_145/0.95)] to-[oklch(0.22_0.04_260/0.95)] text-foreground shadow-[0_4px_20px_-6px_oklch(0.82_0.22_145/0.35)]"
          : incoming
            ? "self-start rounded-[20px] rounded-tl-[5px] border border-white/50 bg-white/68 text-foreground/90 shadow-[0_2px_14px_-4px_rgba(0,0,0,0.08)]"
            : "self-end rounded-[20px] rounded-tr-[5px] border border-[#c8952a]/28 bg-gradient-to-br from-[#fdf0d0]/90 to-[#f0d898]/75 text-[#3a2800] shadow-[0_4px_20px_-6px_rgba(200,149,42,0.32)]"
      }`}
    >
      <p>{text}</p>
      <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-[7.5px] ${
        embedded
          ? incoming ? "text-muted-foreground/75" : "text-neon-green/70"
          : incoming ? "text-foreground/40" : "text-[#8a6200]/55"
      }`}>
        {deleteCountdown ? (
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              embedded
                ? incoming ? "text-[#fbbf24]/85" : "text-neon-green/80"
                : incoming ? "text-[#b45309]/80" : "text-[#8a6200]/75"
            }`}
            title="الحذف التلقائي"
          >
            <Clock3 className="size-2.5 shrink-0" />
            <span>
              {/^[٠-٩]+$/.test(deleteCountdown) ? `${deleteCountdown} ث` : deleteCountdown}
            </span>
          </span>
        ) : null}
        <time className="ltr">{time}</time>
        {edited && <span className={embedded ? (incoming ? "text-muted-foreground/55" : "text-neon-green/50") : (incoming ? "text-foreground/30" : "text-[#8a6200]/40")}>· تم التعديل</span>}
        {!incoming && status && (
          <span className={`font-bold ${
            embedded
              ? status === "read" ? "text-neon-green" : status === "delivered" ? "text-neon-green/60" : "text-neon-green/35"
              : status === "read" ? "text-[#c8952a]" : status === "delivered" ? "text-[#8a6200]/60" : "text-[#8a6200]/35"
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
  embedded = false,
  children,
}: {
  title: string;
  desc?: string;
  onClose: () => void;
  composerBottom: number;
  embedded?: boolean;
  children: React.ReactNode;
}) {
  if (embedded) {
    return (
      <div
        className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[3px]"
        onClick={onClose}
      >
        <div
          className="absolute left-1/2 w-[88%] max-w-[300px] -translate-x-1/2"
          style={{ bottom: composerBottom + 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div dir="rtl" className="glass-strong overflow-hidden rounded-[22px] px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="glass flex size-8 items-center justify-center rounded-full text-muted-foreground active:scale-95"
              >
                <X className="size-3.5" />
              </button>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[13px] font-bold text-neon-green">{title}</p>
                {desc ? <p className="mt-0.5 text-[10px] text-muted-foreground">{desc}</p> : null}
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }

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
  embedded?:         boolean;
  onEmojiSelect:     (emoji: string) => void;
}

function AlphaSheet({
  sheet, setSheet, timer, setTimer,
  muted, setMuted,
  onClearChat, onAttach,
  isHidden, onHideRequest, onHideConfirm, onUnhideChat,
  composerBottom,
  embedded = false,
  onEmojiSelect,
}: AlphaSheetProps) {
  const open = sheet !== null;
  const security = useSecurityStatus();
  const connection = useConnectionStatus();
  const trustLevelLabel = security.authenticated ? "موثّق" : "غير مصادق";
  const encryptionLabel = security.label;
  const securityBadgeLabel =
    security.state === "encrypted"
      ? "موثّقة وآمنة"
      : security.state === "warning"
        ? "تحذير أمني"
        : connection.online
          ? "اتصال محدود"
          : "غير متصل";

  const attachItems: [typeof ImageIcon, string, "blue" | "purple" | "green" | "red"][] = [
    [ImageIcon, "صورة",     "blue"],
    [Camera,    "الكاميرا", "purple"],
    [File,      "ملف",      "green"],
    [MapPin,    "الموقع",   "red"],
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
          embedded={embedded}
        />
      )}

      {sheet === "emoji" && (
        <ChatEmojiPickerPanel
          onPick={onEmojiSelect}
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
          embedded={embedded}
        />
      )}

      {sheet === "menu" && (
        <ChatGlassPanel
          title="إعدادات المحادثة"
          desc="تحكم في خصوصية هذه المحادثة وأمانها"
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
          embedded={embedded}
        >
          <div className="space-y-2">
            {menuItems.map(([Icon, label, action, iconClass, labelClass]) => {
              const isDanger = label === "مسح المحادثة";
              const rowCls = embedded
                ? isDanger
                  ? "flex w-full items-center gap-2.5 rounded-[14px] border border-destructive/25 bg-destructive/10 px-3 py-3 text-right backdrop-blur-sm transition-all active:scale-[0.98]"
                  : "flex w-full items-center gap-2.5 rounded-[14px] border border-white/12 bg-white/6 px-3 py-3 text-right backdrop-blur-sm transition-all active:scale-[0.98]"
                : isDanger
                  ? MESSAGING_GLASS_ROW_DANGER
                  : MESSAGING_GLASS_ROW;
              const iconBoxCls = embedded
                ? isDanger
                  ? "grid size-8 shrink-0 place-items-center rounded-[10px] border border-destructive/30 bg-destructive/15"
                  : "grid size-8 shrink-0 place-items-center rounded-[10px] border border-white/12 bg-white/8"
                : `${MESSAGING_GLASS_ICON_BOX} ${isDanger ? "border-[#FECACA]/60 bg-[#FEE2E2]/45" : ""}`;
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
                  className={`${rowCls} ${embedded ? "" : "hover:bg-white/58 active:scale-[0.98]"}`}
                >
                  <span className={iconBoxCls}>
                    <Icon className={`size-4 ${embedded ? (isDanger ? "text-destructive" : iconClass ?? "text-neon-green") : iconClass ?? "text-gold"}`} />
                  </span>
                  <span className={`flex-1 text-[12px] font-semibold leading-snug ${
                    embedded
                      ? isDanger ? "text-destructive" : "text-foreground"
                      : labelClass ?? "text-[#1F2937]"
                  }`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </ChatGlassPanel>
      )}

      {embedded && sheet === "hide-setup" ? (
        <ConnectConfirmDialog
          open
          onClose={() => setSheet(null)}
          onConfirm={onHideConfirm}
          title="إخفاء المحادثة"
          description="سيتم إضافتها إلى قسم المحادثات المخفية"
          confirmLabel="إخفاء"
          tone="hide"
          icon={EyeOff}
        />
      ) : null}

      {sheet === "hide-setup" && !embedded ? (
        <ChatGlassPanel
          title="إخفاء المحادثة"
          desc="سيتم إضافتها إلى قسم المحادثات المخفية"
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
          embedded={false}
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
      ) : null}

      {sheet === "security" && (
        <ChatGlassPanel
          title="أمان المحادثة"
          desc="محمية بواسطة Alpha Security"
          onClose={() => setSheet(null)}
          composerBottom={composerBottom}
          embedded={embedded}
        >
          <div className="mb-2.5 flex justify-center">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
              embedded
                ? "border-neon-green/30 bg-neon-green/12 text-neon-green"
                : "border-[#166534]/22 bg-[#ECFDF5]/85 text-[#166534]"
            }`}>
              <ShieldCheck className={`size-3.5 ${embedded ? "text-neon-green" : "text-[#166534]"}`} />
              {securityBadgeLabel}
            </span>
          </div>
          <div className="space-y-2">
            {([
              [ShieldCheck, "مستوى الثقة", trustLevelLabel],
              [Clock3,      "الحذف التلقائي", timer],
              [LockKeyhole, "التشفير", encryptionLabel],
            ] as const).map(([Icon, label, value]) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-[13px] border px-3 py-2.5 ${
                  embedded
                    ? "border-white/12 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "border-white/32 bg-white/42 shadow-[0_3px_11px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)]"
                }`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-[9px] border ${
                  embedded
                    ? "border-neon-green/20 bg-neon-green/10"
                    : "border-[#166534]/12 bg-[#ECFDF5]/70"
                }`}>
                  <Icon className={`size-3.5 ${embedded ? "text-neon-green" : "text-[#166534]"}`} />
                </span>
                <span className={`flex-1 text-[11px] font-medium ${embedded ? "text-muted-foreground" : "text-[#6B7280]"}`}>{label}</span>
                <span className={`text-[12px] font-bold ${embedded ? "text-foreground" : "text-[#1F2937]"}`}>{value}</span>
              </div>
            ))}
          </div>
        </ChatGlassPanel>
      )}

      {embedded && sheet === "attach" ? (
        <div
          className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px]"
          onClick={() => setSheet(null)}
        >
          <div
            className="absolute left-1/2 w-[88%] max-w-[300px] -translate-x-1/2"
            style={{ bottom: composerBottom + 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div dir="rtl" className="glass-strong overflow-hidden rounded-[22px] px-4 py-4">
              <p className="mb-3 text-center text-[12px] font-bold text-neon-green">إرفاق</p>
              <div className="flex items-center justify-around gap-2">
                {attachItems.map(([Icon, label, tone]) => {
                  const pulseClass =
                    tone === "green"
                      ? "connect-pulse-wrap--green"
                      : tone === "red"
                        ? "connect-pulse-wrap--red"
                        : tone === "purple"
                          ? "connect-pulse-wrap--white"
                          : "connect-pulse-wrap--blue";
                  const ringClass =
                    tone === "green"
                      ? "connect-attach-icon-ring--green"
                      : tone === "red"
                        ? "connect-attach-icon-ring--red"
                        : tone === "purple"
                          ? "connect-attach-icon-ring--purple"
                          : "";
                  const iconColor =
                    tone === "green"
                      ? "text-neon-green"
                      : tone === "red"
                        ? "text-destructive"
                        : tone === "purple"
                          ? "text-[oklch(0.72_0.18_300)]"
                          : "text-neon-blue";
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => onAttach(label)}
                      className="connect-attach-icon-btn active:scale-95"
                    >
                      <span className={`connect-pulse-wrap ${pulseClass} connect-attach-icon-ring ${ringClass}`}>
                        <Icon className={`relative z-10 size-5 ${iconColor} drop-shadow-[0_0_8px_currentColor]`} strokeWidth={2.2} />
                      </span>
                      <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Drawer open={open && sheet === "attach" && !embedded} onOpenChange={(v) => !v && setSheet(null)}>
      <DrawerContent dir="rtl" className="mx-auto max-w-[var(--alpha-dock-max-width)] border-gold/25 bg-card/97 px-5 pb-6 text-foreground backdrop-blur-2xl">

        {/* Attach — standard (non-embedded) */}
        {sheet === "attach" && !embedded && (
          <div className="flex items-center justify-around pb-2 pt-4">
            {attachItems.map(([Icon, label, tone]) => {
              const gradient =
                tone === "blue"
                  ? "from-[#3d8bef] to-[#1a55cc]"
                  : tone === "purple"
                    ? "from-[#9b5fde] to-[#6b3db0]"
                    : tone === "green"
                      ? "from-[#2ebb9a] to-[#1a8a72]"
                      : "from-[#ef5350] to-[#c62828]";
              return (
              <button key={label} type="button" onClick={() => onAttach(label)} className="flex flex-col items-center gap-1.5">
                <span
                  className={`grid size-[52px] place-items-center rounded-2xl bg-gradient-to-b ${gradient}`}
                  style={{ boxShadow: "0 6px 16px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.22)" }}
                >
                  <Icon className="size-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                </span>
                <span className="text-[10px] font-medium text-[#374151]">{label}</span>
              </button>
            );
            })}
          </div>
        )}
      </DrawerContent>
    </Drawer>
    </>
  );
}

// ─── Apple-style glass timer picker (compact) ─────────────────
const PICKER_ITEM_H = 26;
const PICKER_VISIBLE = 96;
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
  embedded = false,
}: {
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  composerBottom: number;
  embedded?: boolean;
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

  const pickerWheel = (
    <div className="relative mx-2.5 mb-3 mt-1 overflow-hidden rounded-[14px] border border-white/32 bg-white/42 backdrop-blur-sm">
      <div className="relative px-0 pb-1.5">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-[26px] -translate-y-1/2 rounded-[11px] border border-white/95 bg-white/82 shadow-[0_0_18px_rgba(255,255,255,0.5),0_4px_14px_rgba(212,168,87,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-sm"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-7 bg-gradient-to-b from-white/72 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 bg-gradient-to-t from-white/72 to-transparent"
          aria-hidden
        />
        <ul
          ref={listRef}
          className="alpha-date-wheel relative z-[25] h-full overflow-y-auto scroll-smooth overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            height: PICKER_VISIBLE,
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
            const wheelColor = isFocused ? "#1F2937" : dist === 1 ? "#6B7280" : "#9CA3AF";
            const wheelOpacity = isFocused ? 1 : dist === 1 ? 0.75 : 0.45;
            return (
              <li
                key={option}
                style={{
                  height: PICKER_ITEM_H,
                  scrollSnapAlign: "center",
                  fontSize: isFocused ? "15px" : dist === 1 ? "13px" : "12px",
                  fontWeight: isFocused ? 700 : 500,
                  color: wheelColor,
                  opacity: wheelOpacity,
                  transform: isFocused ? "scale(1.06)" : dist === 1 ? "scale(0.97)" : "scale(0.92)",
                  textShadow: isFocused ? "0 1px 2px rgba(255,255,255,0.9)" : "none",
                  animation:
                    selected && isFocused && tickKey > 0
                      ? "alphaDateWheelTick 0.24s cubic-bezier(0.22,1,0.36,1) both"
                      : undefined,
                }}
                className="flex w-full cursor-pointer items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                onClick={() => selectOption(idx)}
              >
                <span className="block w-full truncate px-2 text-center leading-none">{option}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  const sheetPaddingBottom = embedded
    ? "max(calc(env(safe-area-inset-bottom) + 32px), 40px)"
    : `max(calc(${composerBottom}px + 32px), 40px)`;

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <style>{`
        @keyframes alphaDateWheelTick {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.06); }
        }
        @keyframes alphaDateSheetIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className={cn(
          "fixed inset-0 z-[120] flex items-end justify-center px-4",
          embedded && "alpha-bottom-sheet-host",
        )}
        dir="rtl"
        style={{ paddingBottom: sheetPaddingBottom }}
      >
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute inset-0 bg-black/28 backdrop-blur-[3px] animate-in fade-in duration-200"
        />
        <div
          className={cn("relative z-[1] w-full max-w-[320px] overflow-hidden", MESSAGING_GLASS_SHELL)}
          style={{ animation: "alphaDateSheetIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex h-12 items-center justify-center px-4 pt-1" dir="rtl">
            <p className="text-[14px] font-bold text-[#1F2937]">مؤقت الاختفاء</p>
            <button
              type="button"
              onClick={() => onSelect(active)}
              className="absolute inset-y-0 start-4 flex items-center pt-0.5 text-[16px] font-bold text-[#166534] transition-colors hover:text-[#14532D] active:text-[#0F3D22]"
            >
              تم
            </button>
            <button
              type="button"
              onClick={onClose}
              className="absolute inset-y-0 end-4 flex items-center pt-0.5 text-[14px] font-semibold text-[#EF4444]"
            >
              إلغاء
            </button>
          </div>
          {pickerWheel}
        </div>
      </div>
    </>,
    document.body,
  );
}
