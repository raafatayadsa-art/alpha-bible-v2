import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Mic,
  Volume2,
  Ear,
  Phone,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  ShieldCheck,
  ShieldAlert,
  SignalHigh,
  SignalLow,
  SignalMedium,
  WifiOff,
  Users,
  Settings,
  PhoneMissed,
  PhoneOutgoing,
  MessageCircle,
  ChevronLeft,
  Play,
  Pause,
  X,
  SquarePen,
  Settings2,
  Trash2,
  EyeOff,
  Search,
  Eye,
  MapPin,
} from "lucide-react";
import { ConnectExpandableSearchBar } from "@/components/alpha/ConnectExpandableSearchBar";
import { ConnectConfirmDialog, ConnectConversationDeleteDialog, ConnectTopToast } from "@/components/alpha/connect-code-ui";
import {
  HIDDEN_CODE_KEY,
  HIDDEN_CONVS_KEY,
  HIDDEN_SESSION_KEY,
  hasSecretCode,
  loadLS,
  saveLS,
} from "@/components/alpha/messaging-storage";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import {
  AlphaConnectSettings,
  loadAlphaConnectSettings,
  type AlphaConnectSettingsState,
} from "@/components/alpha/AlphaConnectSettings";
import { AlphaConnectLogo } from "@/components/alpha/AlphaConnectLogo";
import { AlphaMessageSettings } from "@/components/alpha/AlphaMessageSettings";
import { AlphaChatScreen } from "@/components/alpha/AlphaChatScreen";
import { AlphaConnectSecurityGate } from "@/components/alpha/AlphaConnectSecurityGate";
import {
  ALPHA_CONNECT_SCREENSHOT_EVENT,
  applyAlphaConnectSecurity,
  clearAlphaConnectSecurityEffects,
  isAlphaConnectUnlocked,
  isSecurityLockEnabled,
  lockAlphaConnect,
  unlockAlphaConnect,
} from "@/components/alpha/alpha-connect-security";
import { usePushToTalk } from "@/components/alpha/usePushToTalk";
import { useVoiceRecorder } from "@/components/alpha/useVoiceRecorder";
import { useAlphaConnectVoiceChannel } from "@/features/alpha-connect/useAlphaConnectVoiceChannel";
import { formatVoiceDuration } from "@/features/alpha-connect/retention";
import { ConnectAudioOutputControl } from "@/components/alpha/ConnectAudioOutputControl";
import {
  useConnectAudioOutput,
  type ConnectAudioOutputDevice,
  type ConnectAudioSelection,
} from "@/components/alpha/connect-audio-output";
import { currentUserName, getCurrentUser } from "@/features/church/current-user";
import { subscribeAuthContext, getDisplayShieldRoleSync } from "@/features/auth";
import {
  buildIdentityQrPayload,
  deriveAlphaIdShort,
  deriveGroupCode,
  getIdentityQrValue,
} from "@/features/identity/alpha-identity";
import { ConnectChannelInviteSheet, ConnectChannelSettings } from "@/components/alpha/ConnectChannelSettings";
import {
  getChannelState,
  inviteMembersToChannel,
  joinChannelViaInvite,
  moderateChannelMember,
  patchChannelSettings,
  saveChannelState,
  visibleChannelMembers,
  type ChannelMember,
} from "@/components/alpha/connect-channel-state";
import {
  createConnectChannel,
  getConnectChannelOnlineCount,
  getConnectChannelStatus,
  resolveChannelIdFromInvite,
  type ConnectChannelIcon,
} from "@/components/alpha/connect-channels-registry";
import { ConnectCreateChannelSheet } from "@/components/alpha/ConnectCreateChannelSheet";
import { ConnectHistoryPanel } from "@/components/alpha/ConnectTopHistoryPanels";
import { AlphaTrustShield } from "@/components/alpha/AlphaTrustShield";
import { resolveActiveTrustShieldContext } from "@/features/alpha-connect/alpha-trust-shield-context";
import { AlphaIdentityRow } from "@/components/alpha/AlphaIdentityRow";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import {
  PRESENCE_LABELS,
  getPresenceStatus,
  isPresenceVisibleInOnlineSurfaces,
} from "@/features/alpha-connect/presence";
import {
  useAlphaPresenceBootstrap,
  useMyPresenceStatus,
  usePresenceActions,
  usePresenceStoreVersion,
} from "@/features/alpha-connect/useAlphaPresence";
import {
  batteryLevelTone,
  connectionQualityTone,
  presencePresenceSubtitle,
  securityStateTone,
} from "@/features/alpha-connect/alpha-connect-status-engine";
import {
  useConnectionStatus,
  useDeviceStatus,
  useSecurityStatus,
} from "@/features/alpha-connect/useAlphaConnectStatus";
import {
  connectCanCreateChannels,
  connectEffectiveAlphaRole,
  connectListChannelsForViewer,
  connectViewerCanManageChannel,
  connectViewerCanManageLifecycle,
} from "@/components/alpha/connect-alpha-access";
import { ConnectPremiumQrBadge } from "@/components/alpha/ConnectPremiumQrBadge";
import { ConnectCircleButton } from "@/components/alpha/ConnectCircleButton";
import {
  ConnectChannelActionBar,
  ConnectChannelHeader,
  ConnectChannelPttFrame,
  ConnectChannelTalkPermission,
  ConnectChannelModerationSheet,
  ConnectChannelsDrawer,
  ConnectParticipantsDrawer,
  ConnectChannelsHeaderButton,
  ConnectParticipantsHeaderButton,
  ConnectChannelEdgeGestures,
  getConnectChannel,
  useConnectChannels,
} from "@/components/alpha/ConnectChannelsUI";
import {
  useAlphaConnectScreen,
  type AlphaConnectMessagesTab,
  type AlphaConnectMode,
} from "@/components/alpha/alpha-connect-screen";
import { conversations, conversationFromContact, CONVERSATION_CONTACTS, mergeConversationWithDb, type Conversation } from "@/components/alpha/messaging-data";
import { useAlphaConnectConversationList } from "@/features/alpha-connect/useAlphaConnectConversationList";
import { clearConversationForBothParties } from "@/features/alpha-connect/clearConversation";
import {
  hapticLightImpact,
  hapticMediumImpact,
  hapticWarning,
} from "@/components/alpha/messaging-haptics";
import {
  CONNECT_THEME_CHANGED_EVENT,
  getAlphaConnectFrameClass,
  type AlphaConnectThemeId,
} from "@/components/alpha/alpha-connect-theme";
import { getConnectViewportBackdrop } from "@/components/alpha/alpha-viewport";
import avatarMina from "@/assets/avatar-mina.jpg";
import avatarPriest from "@/assets/avatar-priest.jpg";
import { AlphaConnectBottomNavigation } from "@/components/alpha/AlphaConnectBottomNavigation";
import {
  alphaConnectModeToNavTab,
  applyAlphaConnectNavTab,
  buildAlphaConnectSearch,
  emptyAlphaConnectSearch,
  parseAlphaConnectNavTab,
  parseAlphaConnectContactRole,
  type AlphaConnectNavTab,
  type AlphaConnectRouteSearch,
} from "@/features/alpha-connect/alpha-connect-nav";
import { CONNECT_CALL_LOG_ENTRIES as CALL_LOG_ENTRIES } from "@/features/alpha-connect/connect-call-log";
import {
  CONNECT_ACTIVITY_PREVIEW_LIMIT,
  connectBottomSheetHostClass,
} from "@/features/alpha-connect/alpha-connect-layout";
import { TripChannelTabs } from "@/features/alpha-connect/components/TripChannelTabs";
import { TripOperationsPanel } from "@/features/alpha-connect/components/TripOperationsPanel";

export const Route = createFileRoute("/alpha-connect")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): AlphaConnectRouteSearch => ({
    chat: typeof search.chat === "string" ? search.chat : undefined,
    tab: parseAlphaConnectNavTab(search.tab) ?? undefined,
    channel: typeof search.channel === "string" ? search.channel : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
    role: parseAlphaConnectContactRole(search.role),
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Alpha Connect — اتصال صوتي" },
      { name: "description", content: "Alpha Connect — premium voice communication for Alpha Bible." },
    ],
  }),
  component: AlphaConnect,
});

type Mode = AlphaConnectMode;
type MessagesTab = AlphaConnectMessagesTab;

const VOICE_MESSAGE_ENTRIES: {
  id: string;
  duration: string;
  wave: "blue" | "green" | "white";
  time: string;
  avatar: string;
  badge: "green" | "blue";
  section: string;
}[] = [
  { id: "v1", duration: "0:18", wave: "blue", time: "منذ 5 دقائق", avatar: avatarMina, badge: "blue", section: "اليوم" },
  { id: "v2", duration: "1:24", wave: "green", time: "منذ ساعتين", avatar: avatarPriest, badge: "green", section: "اليوم" },
  { id: "v3", duration: "0:55", wave: "blue", time: "منذ 4 ساعات", avatar: avatarMina, badge: "blue", section: "اليوم" },
  { id: "v4", duration: "0:42", wave: "white", time: "أمس 8:30 م", avatar: avatarPriest, badge: "blue", section: "الأمس" },
];

const CHANNEL_VOICE_ENTRIES: {
  id: string;
  duration: string;
  wave: "blue" | "green" | "white";
  time: string;
  avatar: string;
  badge: "green" | "blue";
}[] = [
  { id: "c1", duration: "0:18", wave: "blue", time: "منذ 5 دقائق", avatar: avatarMina, badge: "blue" },
  { id: "c2", duration: "1:24", wave: "green", time: "منذ ساعتين", avatar: avatarPriest, badge: "green" },
  { id: "c3", duration: "0:42", wave: "white", time: "أمس 8:30 م", avatar: avatarPriest, badge: "blue" },
  { id: "c4", duration: "2:10", wave: "green", time: "أمس 4:15 م", avatar: avatarMina, badge: "green" },
];

const CALLABLE_CONTACTS = conversations.filter((contact) => contact.kind === "private");

function parseDurationLabelToMs(label: string): number {
  const [minPart, secPart] = label.split(":");
  const min = Number.parseInt(minPart ?? "0", 10) || 0;
  const sec = Number.parseInt(secPart ?? "0", 10) || 0;
  return (min * 60 + sec) * 1000;
}

function VoicePlaybackDuration({
  duration,
  progress,
  isPlaying,
  className = "",
}: {
  duration: string;
  progress: number;
  isPlaying: boolean;
  className?: string;
}) {
  const totalMs = parseDurationLabelToMs(duration);
  const showElapsed = isPlaying || progress > 0;
  const elapsedMs = Math.min(totalMs, Math.round(totalMs * progress));
  const label = showElapsed ? formatVoiceDuration(elapsedMs) : duration;

  return (
    <span
      className={`shrink-0 text-xs tabular-nums transition-colors ${
        showElapsed ? "font-medium text-foreground" : "text-muted-foreground"
      } ${className}`}
    >
      {label}
    </span>
  );
}

function useVoicePlayback() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const savedProgressRef = useRef<Record<string, number>>({});
  const rafRef = useRef(0);
  const animRef = useRef({ startTime: 0, durationMs: 0, baseProgress: 0 });

  const stopRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const runAnimation = useCallback(
    (id: string, durationMs: number, fromProgress: number) => {
      animRef.current = { startTime: performance.now(), durationMs, baseProgress: fromProgress };
      setPlayingId(id);
      setProgress(fromProgress);

      const tick = () => {
        const { startTime, durationMs: dur, baseProgress } = animRef.current;
        const elapsed = performance.now() - startTime;
        const next = Math.min(1, baseProgress + elapsed / dur);
        setProgress(next);
        savedProgressRef.current[id] = next;
        if (next >= 1) {
          stopRaf();
          setPlayingId(null);
          savedProgressRef.current[id] = 0;
          setProgress(0);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      stopRaf();
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopRaf],
  );

  const togglePlay = useCallback(
    (id: string, durationMs: number) => {
      if (playingId === id) {
        stopRaf();
        savedProgressRef.current[id] = progress;
        setPlayingId(null);
        return;
      }

      const saved = savedProgressRef.current[id] ?? 0;
      const fromProgress = saved >= 1 ? 0 : saved;
      if (playingId) {
        savedProgressRef.current[playingId] = progress;
        stopRaf();
      }
      runAnimation(id, durationMs, fromProgress);
    },
    [playingId, progress, runAnimation, stopRaf],
  );

  const getRowProgress = useCallback(
    (id: string) => {
      if (playingId === id) return progress;
      return savedProgressRef.current[id] ?? 0;
    },
    [playingId, progress],
  );

  return { togglePlay, getRowProgress, isPlaying: (id: string) => playingId === id };
}

const CONTACT_ROLE_LABEL: Record<Conversation["role"], string> = {
  priest: "كاهن",
  servant: "خادم",
  member: "عضو",
  official: "Alpha الرسمي",
};

function resolveConnectConversation(id: string, dbConversations: Conversation[]): Conversation | null {
  const fromDb = dbConversations.find((c) => c.id === id);
  if (fromDb) return fromDb;
  const contact = CONVERSATION_CONTACTS.find((c) => c.id === id);
  if (contact) return mergeConversationWithDb(contact, undefined);
  const known = conversations.find((item) => item.id === id);
  return known ?? null;
}

function AlphaConnect() {
  useAlphaPresenceBootstrap();
  usePresenceStoreVersion();
  const { mode, messagesTab, setMode, setMessagesTab } = useAlphaConnectScreen();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connectSettings, setConnectSettings] = useState<AlphaConnectSettingsState>(() => loadAlphaConnectSettings());
  const [securityUnlocked, setSecurityUnlocked] = useState(
    () => !isSecurityLockEnabled(loadAlphaConnectSettings()) || isAlphaConnectUnlocked(),
  );
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const [callPickerOpen, setCallPickerOpen] = useState(false);
  const [channelsDrawerOpen, setChannelsDrawerOpen] = useState(false);
  const [createChannelSheetOpen, setCreateChannelSheetOpen] = useState(false);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [moderationMember, setModerationMember] = useState<ChannelMember | null>(null);
  const [channelStateTick, setChannelStateTick] = useState(0);
  const [activeChannelId, setActiveChannelId] = useState("main");
  const [channelMuted, setChannelMuted] = useState(false);
  const [channelToast, setChannelToast] = useState<string | null>(null);
  const [openChatConv, setOpenChatConv] = useState<Conversation | null>(null);
  const [connectToast, setConnectToast] = useState<string | null>(null);
  const [messagesListKey, setMessagesListKey] = useState(0);
  const appliedConnectTabRef = useRef<AlphaConnectNavTab | null>(null);
  const appliedConnectChannelRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { chat: chatContactId, tab: connectTab, channel: connectChannelId, name: chatContactName, role: chatContactRole, phone: chatContactPhone } = Route.useSearch();
  const { conversations: connectDbConversations } = useAlphaConnectConversationList(true);
  const connectUnreadTotal = useMemo(
    () => connectDbConversations.reduce((total, conv) => total + (conv.unread ?? 0), 0),
    [connectDbConversations],
  );
  const currentUser = getCurrentUser();
  const currentUserId = currentUser.id || "creator";
  void channelStateTick;
  const { channels: connectChannels } = useConnectChannels();
  const activeChannel =
    connectChannels.find((channel) => channel.id === activeChannelId) ??
    getConnectChannel(activeChannelId);
  const channelState = getChannelState(activeChannelId);
  const channelMembers = visibleChannelMembers(activeChannelId);
  const canManageChannel = connectViewerCanManageChannel(activeChannelId, currentUserId);
  const activeChannelStatus = getConnectChannelStatus(activeChannelId);
  const canCreateChannels = connectCanCreateChannels();
  const refreshChannelState = useCallback(() => setChannelStateTick((value) => value + 1), []);

  const showConnectToast = useCallback((msg: string) => {
    setConnectToast(msg);
    window.setTimeout(() => setConnectToast(null), 2400);
  }, []);

  const navigateConnectSearch = useCallback(
    (search: Partial<AlphaConnectRouteSearch>) => {
      void navigate({
        to: "/alpha-connect",
        search: buildAlphaConnectSearch(search),
        replace: true,
      });
    },
    [navigate],
  );

  const closeConnectSettings = useCallback(() => {
    setSettingsOpen(false);
    navigateConnectSearch({ chat: chatContactId });
  }, [chatContactId, navigateConnectSearch]);

  const handleConnectNavTab = useCallback(
    (tab: AlphaConnectNavTab, source: "user" | "url" = "user") => {
      if (tab === "settings" && settingsOpen && source === "user") {
        closeConnectSettings();
        return;
      }

      applyAlphaConnectNavTab(tab, {
        exitToAlphaHome: () => {
          void navigate({ to: "/home" });
        },
        openChannels: () => {
          setSettingsOpen(false);
          setChannelSettingsOpen(false);
          setOpenChatConv(null);
          setChannelsDrawerOpen(false);
          setParticipantsDrawerOpen(false);
          setMode("groups");
          navigateConnectSearch({ tab: "channels" });
        },
        openCalls: () => {
          setSettingsOpen(false);
          setChannelSettingsOpen(false);
          setOpenChatConv(null);
          setChannelsDrawerOpen(false);
          setMode("individual");
          navigateConnectSearch({ tab: "calls" });
        },
        openMessages: () => {
          setSettingsOpen(false);
          setChannelSettingsOpen(false);
          setOpenChatConv(null);
          setMode("messages");
          setMessagesTab("conversations");
          navigateConnectSearch({ tab: "messages" });
        },
        openSettings: () => {
          setOpenChatConv(null);
          setChannelsDrawerOpen(false);
          setSettingsOpen(true);
          navigateConnectSearch({ tab: "settings" });
        },
      });
    },
    [
      closeConnectSettings,
      navigate,
      navigateConnectSearch,
      setMessagesTab,
      setMode,
      settingsOpen,
    ],
  );

  const closeOpenChat = useCallback(() => {
    setOpenChatConv(null);
    if (chatContactId) {
      void navigate({ to: "/alpha-connect", search: emptyAlphaConnectSearch(), replace: true });
    }
  }, [chatContactId, navigate]);

  const openConnectChat = useCallback(
    (contact: Conversation) => {
      setMode("messages");
      setMessagesTab("conversations");
      setOpenChatConv(contact);
      void navigate({
        to: "/alpha-connect",
        search: buildAlphaConnectSearch({ tab: "messages", chat: contact.id }),
      });
    },
    [navigate, setMode, setMessagesTab],
  );

  useEffect(() => {
    if (!chatContactId) return;
    if (openChatConv?.id === chatContactId) return;
    let conv = resolveConnectConversation(chatContactId, connectDbConversations);
    if (!conv && chatContactName) {
      conv = conversationFromContact({
        id: chatContactId,
        name: chatContactName,
        role: chatContactRole ?? "admin",
        phone: chatContactPhone,
      });
    }
    if (!conv) return;
    setMode("messages");
    setMessagesTab("conversations");
    setOpenChatConv(conv);
  }, [
    chatContactId,
    chatContactName,
    chatContactRole,
    chatContactPhone,
    connectDbConversations,
    openChatConv?.id,
    setMode,
    setMessagesTab,
  ]);

  useEffect(() => {
    if (!openChatConv) setMessagesListKey((k) => k + 1);
  }, [openChatConv]);

  const trustContext = useMemo(
    () =>
      resolveActiveTrustShieldContext({
        mode,
        messagesTab,
        settingsOpen: false,
        channelSettingsOpen,
        channelId: activeChannelId,
      }),
    [mode, messagesTab, channelSettingsOpen, activeChannelId],
  );

  const trustShieldControl = (
    <AlphaTrustShield
      context={trustContext}
      channelId={activeChannelId}
      channel={activeChannel}
      currentUserId={currentUserId}
      onBeforeOpen={() => {
        setChannelsDrawerOpen(false);
        setParticipantsDrawerOpen(false);
      }}
    />
  );

  useEffect(() => {
    if (mode !== "groups") return;
    const uid = currentUser.id || "creator";
    const state = getChannelState(activeChannelId);
    if (!state.members.some((member) => member.id === uid)) {
      state.members.unshift({
        id: uid,
        name: currentUser.name?.trim() || "مستخدم Alpha",
        avatar: currentUser.avatarUrl || avatarMina,
        role: "super_admin",
        shieldRole: getDisplayShieldRoleSync() ?? undefined,
      });
      saveChannelState(activeChannelId, state);
      refreshChannelState();
    }
  }, [mode, activeChannelId, currentUser, refreshChannelState]);

  useEffect(() => {
    if (mode !== "groups") return;
    const visible = connectListChannelsForViewer(currentUserId);
    if (visible.length === 0) return;
    if (!visible.some((channel) => channel.id === activeChannelId)) {
      setActiveChannelId(visible[0]!.id);
    }
  }, [mode, activeChannelId, currentUserId, channelStateTick]);

  const showChannelToast = useCallback((message: string) => {
    setChannelToast(message);
    window.setTimeout(() => setChannelToast(null), 2400);
  }, []);

  const openChannelsDrawer = useCallback(() => {
    setParticipantsDrawerOpen(false);
    setChannelsDrawerOpen(true);
  }, []);

  const openParticipantsDrawer = useCallback(() => {
    setChannelsDrawerOpen(false);
    setParticipantsDrawerOpen(true);
  }, []);

  useEffect(() => {
    if (mode !== "groups") return;
    if (activeChannelStatus !== "suspended") return;
    if (connectViewerCanManageChannel(activeChannelId, currentUserId)) return;
    const visible = connectListChannelsForViewer(currentUserId).filter(
      (channel) => (channel.status ?? "active") === "active",
    );
    if (visible[0]) setActiveChannelId(visible[0].id);
    showChannelToast("تم تعطيل القناة — تم إخراجك");
  }, [activeChannelId, activeChannelStatus, currentUserId, mode, showChannelToast]);


  const inviteHandledRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (!invite || inviteHandledRef.current === invite) return;
    inviteHandledRef.current = invite;

    const channelId = resolveChannelIdFromInvite(decodeURIComponent(invite));
    void navigate({ to: "/alpha-connect", search: emptyAlphaConnectSearch(), replace: true });
    if (!channelId) {
      showChannelToast("رابط الدعوة غير صالح");
      return;
    }
    if (
      getConnectChannelStatus(channelId) === "suspended" &&
      !connectViewerCanManageLifecycle(channelId, currentUserId)
    ) {
      showChannelToast("القناة معطّلة حالياً");
      return;
    }
    const result = joinChannelViaInvite(channelId, {
      id: currentUserId,
      name: currentUser.name?.trim() || currentUserName(),
      avatar: currentUser.avatarUrl || avatarMina,
      shieldRole: getDisplayShieldRoleSync() ?? undefined,
    });
    if (result.status === "joined" || result.status === "already") {
      setMode("groups");
      setActiveChannelId(channelId);
      refreshChannelState();
    }
    showChannelToast(result.message);
  }, [currentUser, currentUserId, navigate, refreshChannelState, setMode, showChannelToast]);

  const handleCreateChannel = useCallback(
    (input: { name: string; topic: string; icon: ConnectChannelIcon }) => {
      if (!connectCanCreateChannels()) {
        showChannelToast("إنشاء القنوات متاح لحاملي درع الكاهن أو الخادم أو Alpha فقط");
        return;
      }
      try {
        const channel = createConnectChannel({
          name: input.name,
          topic: input.topic,
          icon: input.icon,
          creatorId: currentUserId,
          creatorName: currentUser.name?.trim() || currentUserName(),
          creatorAvatar: currentUser.avatarUrl || avatarMina,
          creatorRole: connectEffectiveAlphaRole(),
        });
        setActiveChannelId(channel.id);
        setMode("groups");
        refreshChannelState();
        showChannelToast(`تم إنشاء «${channel.name}» — مرحباً بك`);
      } catch (error) {
        showChannelToast(error instanceof Error ? error.message : "تعذّر إنشاء القناة");
      }
    },
    [currentUser, currentUserId, refreshChannelState, setMode, showChannelToast],
  );

  const startPersonalCall = useCallback(
    (contact: Conversation) => {
      setCallPickerOpen(false);
      void navigate({
        to: "/personal-call",
        search: {
          name: contact.name,
          contactId: contact.id,
          from: "/alpha-connect",
        },
      });
    },
    [navigate],
  );

  const redialContact = useCallback(
    (contactId: string, name: string) => {
      const contact = CALLABLE_CONTACTS.find((item) => item.id === contactId);
      if (contact) {
        startPersonalCall(contact);
        return;
      }
      void navigate({
        to: "/personal-call",
        search: { name, contactId, from: "/alpha-connect" },
      });
    },
    [navigate, startPersonalCall],
  );

  const openContactMessage = useCallback(
    (contactId: string, name: string) => {
      const resolved = resolveConnectConversation(contactId, connectDbConversations);
      const contact: Conversation =
        resolved ??
        conversationFromContact({
          id: contactId,
          name,
          role: contactId === "priest" ? "priest" : contactId === "servant" ? "servant" : "admin",
        });
      openConnectChat(contact);
    },
    [connectDbConversations, openConnectChat],
  );
  const audio = useConnectAudioOutput({ enabled: mode === "groups" || mode === "individual" });

  useEffect(() => {
    if (mode === "groups" || mode === "individual") {
      void audio.refreshDevices();
    }
  }, [mode, activeChannelId, audio.refreshDevices]);
  const groupCode = deriveGroupCode(activeChannelId);
  const messagesVoice = useAlphaConnectVoiceChannel({
    scope: "personal",
    enabled: mode === "messages" && messagesTab === "voice",
  });
  const groupVoice = useAlphaConnectVoiceChannel({
    scope: "group",
    groupCode,
    groupTitle: activeChannel.name,
    enabled: mode === "groups",
  });

  useEffect(() => {
    const settings = loadAlphaConnectSettings();
    setConnectSettings(settings);
    applyAlphaConnectSecurity(settings);
    setSecurityUnlocked(!isSecurityLockEnabled(settings) || isAlphaConnectUnlocked());

    return () => {
      lockAlphaConnect();
      clearAlphaConnectSecurityEffects();
    };
  }, []);

  useEffect(() => {
    if (settingsOpen) return;
    const settings = loadAlphaConnectSettings();
    setConnectSettings(settings);
    applyAlphaConnectSecurity(settings);
    if (isSecurityLockEnabled(settings) && !isAlphaConnectUnlocked()) {
      setSecurityUnlocked(false);
    }
  }, [settingsOpen]);

  useEffect(() => {
    const onScreenshotAlert = () => {
      if (!connectSettings.screenshotAlert) return;
      setSecurityToast("تم رصد محاولة تصوير للشاشة");
      window.setTimeout(() => setSecurityToast(null), 2400);
    };
    window.addEventListener(ALPHA_CONNECT_SCREENSHOT_EVENT, onScreenshotAlert);
    return () => window.removeEventListener(ALPHA_CONNECT_SCREENSHOT_EVENT, onScreenshotAlert);
  }, [connectSettings.screenshotAlert]);

  const handleScroll = useCallback((_event: React.UIEvent<HTMLDivElement>) => {}, []);

  useEffect(() => {
    if (channelSettingsOpen && !canManageChannel) {
      setChannelSettingsOpen(false);
      showChannelToast("إعدادات القناة للمنشئ والمسؤولين فقط");
    }
  }, [channelSettingsOpen, canManageChannel, showChannelToast]);

  useEffect(() => {
    if (mode !== "messages" && openChatConv) {
      setOpenChatConv(null);
      if (chatContactId) {
        void navigate({ to: "/alpha-connect", search: emptyAlphaConnectSearch(), replace: true });
      }
    }
  }, [mode, openChatConv, chatContactId, navigate]);

  const contentBottomPadding = openChatConv ? "pb-[max(env(safe-area-inset-bottom),8px)]" : "";
  const securityLocked = isSecurityLockEnabled(connectSettings) && !securityUnlocked;
  const chatOpen = !!openChatConv;
  const connectFrameClass = getAlphaConnectFrameClass(connectSettings.theme);
  const connectViewportBackdrop = getConnectViewportBackdrop(connectSettings.theme);
  const connectBottomNav = (
    <AlphaConnectBottomNavigation
      mode={mode}
      settingsOpen={settingsOpen}
      visible={!chatOpen && !securityLocked}
      unreadMessages={connectUnreadTotal}
      themeClassName={connectFrameClass}
      onTabPress={handleConnectNavTab}
    />
  );
  const showConnectBottomNav = !chatOpen && !securityLocked;

  useEffect(() => {
    const onThemeChanged = (event: Event) => {
      const theme = (event as CustomEvent<{ theme: AlphaConnectThemeId }>).detail?.theme;
      if (theme) setConnectSettings((prev) => ({ ...prev, theme }));
    };
    window.addEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
    return () => window.removeEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
  }, []);

  useEffect(() => {
    if (!connectTab) {
      appliedConnectTabRef.current = null;
      return;
    }
    if (appliedConnectTabRef.current === connectTab) return;

    const activeTab = alphaConnectModeToNavTab(mode, settingsOpen);
    if (connectTab === activeTab) {
      appliedConnectTabRef.current = connectTab;
      return;
    }

    appliedConnectTabRef.current = connectTab;
    handleConnectNavTab(connectTab, "url");
  }, [connectTab, handleConnectNavTab, mode, settingsOpen]);

  useEffect(() => {
    if (!connectChannelId) {
      appliedConnectChannelRef.current = null;
      return;
    }
    if (appliedConnectChannelRef.current === connectChannelId) return;
    appliedConnectChannelRef.current = connectChannelId;
    setActiveChannelId(connectChannelId);
    setMode("groups");
    setChannelsDrawerOpen(false);
  }, [connectChannelId, setMode]);

  if (securityLocked) {
    return (
      <AlphaScreenFrame
        mode="scroll"
        showShellBackground={false}
        frameClassName={connectFrameClass}
        viewportBackdrop={connectViewportBackdrop}
      >
        <AlphaConnectSecurityGate
          settings={connectSettings}
          onUnlock={() => {
            unlockAlphaConnect();
            setSecurityUnlocked(true);
          }}
        />
      </AlphaScreenFrame>
    );
  }

  if (settingsOpen) {
    return (
      <>
        <AlphaScreenFrame
          mode="scroll"
          showShellBackground={false}
          frameClassName={connectFrameClass}
          viewportBackdrop={connectViewportBackdrop}
        >
          <AlphaConnectSettings
            onBack={closeConnectSettings}
            onThemeChange={(theme) => setConnectSettings((prev) => ({ ...prev, theme }))}
            trustShield={
              <AlphaTrustShield
                context={{ type: "settings" }}
                channelId={activeChannelId}
                channel={activeChannel}
                currentUserId={currentUserId}
              />
            }
          />
        </AlphaScreenFrame>
        {connectBottomNav}
      </>
    );
  }

  if (channelSettingsOpen) {
    return (
      <>
        <AlphaScreenFrame
          mode="scroll"
          showShellBackground={false}
          frameClassName={connectFrameClass}
          viewportBackdrop={connectViewportBackdrop}
        >
          <ConnectChannelSettings
            channelId={activeChannelId}
            channelName={activeChannel.name}
            currentUserId={currentUserId}
            onBack={() => setChannelSettingsOpen(false)}
            onToast={showChannelToast}
            onChannelLifecycleChange={refreshChannelState}
            onChannelDeleted={() => {
              const visible = connectListChannelsForViewer(currentUserId);
              setActiveChannelId(visible[0]?.id ?? "main");
              setChannelSettingsOpen(false);
              refreshChannelState();
            }}
          />
        </AlphaScreenFrame>
        {connectBottomNav}
      </>
    );
  }

  return (
    <>
      <AlphaScreenFrame
        mode={chatOpen ? "fixed" : "scroll"}
      showShellBackground={false}
      frameClassName={connectFrameClass}
      viewportBackdrop={connectViewportBackdrop}
      onScroll={chatOpen ? undefined : handleScroll}
    >
      <div
        className={`relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-5 ${
          chatOpen ? "flex h-full min-h-0 flex-col overflow-hidden" : contentBottomPadding
        }`}
      >
        <Header
          mode={mode}
          chatContact={openChatConv}
          onCloseChat={closeOpenChat}
          onOpenSettings={() => handleConnectNavTab("settings")}
          onOpenChannels={openChannelsDrawer}
          onOpenParticipants={openParticipantsDrawer}
          trustShield={trustShieldControl}
        />

        {chatOpen && openChatConv ? (
          <div className="connect-chat-immersive flex min-h-0 flex-1 flex-col overflow-hidden -mx-5 px-0">
            <AlphaChatScreen
              key={openChatConv.id}
              embedded
              hideHeader
              profile={openChatConv}
              onBack={closeOpenChat}
              onShowToast={showConnectToast}
            />
          </div>
        ) : mode === "individual" ? (
          <>
            <IndividualProfileCard />
            <NearbyMembersEntry />
            <StatusStrip />
            <CallLogCard onRedial={redialContact} onMessage={openContactMessage} />
            <ConnectScrollAction>
              <ConnectCallButton onPress={() => setCallPickerOpen(true)} />
            </ConnectScrollAction>
          </>
        ) : mode === "messages" ? (
          <>
            <MessagesLogCard
              key={messagesListKey}
              activeTab={messagesTab}
              onTabChange={setMessagesTab}
              voiceHistoryPanel={<VoiceRecordingsLogPanel includeChannel={false} />}
              onOpenChat={openConnectChat}
              onShowToast={showConnectToast}
            />
            {messagesTab === "voice" ? (
              <ConnectScrollAction>
                <VoiceMessageRecorder
                  onSendVoice={(blob, durationMs) => messagesVoice.sendVoice(blob, durationMs, "voice")}
                />
              </ConnectScrollAction>
            ) : null}
          </>
        ) : (
          <>
            <ConnectChannelHeader
              channel={activeChannel}
              adminName={activeChannel.adminName}
              memberCount={channelMembers.length}
              channelStatus={activeChannelStatus}
            />
            <TripChannelTabs
              activeChannelId={activeChannelId}
              currentUserId={currentUserId}
              onSelectChannel={setActiveChannelId}
            />
            <TripOperationsPanel
              activeChannelId={activeChannelId}
              onAlertSent={showChannelToast}
            />
            <ConnectChannelPttFrame>
              <VoiceControl
                showFooterActions={false}
                audioSelection={audio.selection}
                audioDevices={audio.devices}
                audioPickerOpen={audio.pickerOpen}
                onOpenAudioPicker={() => void audio.openPicker()}
                onCloseAudioPicker={() => audio.setPickerOpen(false)}
                onSelectAudioDevice={(id) => void audio.selectDevice(id)}
                onSendVoice={(blob, durationMs) => groupVoice.sendVoice(blob, durationMs, "ptt")}
              />
            </ConnectChannelPttFrame>
            <ConnectChannelTalkPermission
              value={channelState.settings.talkPermission}
              canEdit={canManageChannel}
              onChange={(value) => {
                patchChannelSettings(activeChannelId, { talkPermission: value });
                refreshChannelState();
                showChannelToast("تم تحديث صلاحيات التحدث");
              }}
            />
            <ConnectChannelActionBar
              muted={channelMuted}
              onToggleMute={() => setChannelMuted((value) => !value)}
              audioSelection={audio.selection}
              audioDevices={audio.devices}
              audioPickerOpen={audio.pickerOpen}
              onOpenAudioPicker={() => void audio.openPicker()}
              onCloseAudioPicker={() => audio.setPickerOpen(false)}
              onSelectAudioDevice={(id) => void audio.selectDevice(id)}
              onInvite={() => setInviteSheetOpen(true)}
              canOpenSettings={canManageChannel}
              onChannelSettings={() => {
                if (!canManageChannel) {
                  showChannelToast("إعدادات القناة للمنشئ والمسؤولين فقط");
                  return;
                }
                setChannelSettingsOpen(true);
              }}
            />
            <ChannelRecordingsHistoryCard />
          </>
        )}
      </div>

      <ConnectChannelEdgeGestures
        enabled={mode === "groups"}
        channelsOpen={channelsDrawerOpen}
        participantsOpen={participantsDrawerOpen}
        onOpenChannels={openChannelsDrawer}
        onOpenParticipants={openParticipantsDrawer}
        onCloseChannels={() => setChannelsDrawerOpen(false)}
        onCloseParticipants={() => setParticipantsDrawerOpen(false)}
      />

      <ConnectChannelsDrawer
        open={channelsDrawerOpen}
        activeChannelId={activeChannelId}
        currentUserId={currentUserId}
        canCreateChannels={canCreateChannels}
        onClose={() => setChannelsDrawerOpen(false)}
        onSelect={setActiveChannelId}
        onCreateChannel={() => {
          if (!canCreateChannels) {
            showChannelToast("إنشاء القنوات متاح لحاملي درع الكاهن أو الخادم أو Alpha فقط");
            return;
          }
          setChannelsDrawerOpen(false);
          setCreateChannelSheetOpen(true);
        }}
      />

      <ConnectCreateChannelSheet
        open={createChannelSheetOpen}
        onClose={() => setCreateChannelSheetOpen(false)}
        onCreate={handleCreateChannel}
      />

      <ConnectParticipantsDrawer
        open={participantsDrawerOpen}
        members={channelMembers}
        onlineCount={getConnectChannelOnlineCount(activeChannelId)}
        talkPermission={channelState.settings.talkPermission}
        canModerate={canManageChannel}
        onClose={() => setParticipantsDrawerOpen(false)}
        onModerate={(member) => {
          setParticipantsDrawerOpen(false);
          setModerationMember(member);
        }}
      />

      {inviteSheetOpen ? (
        <ConnectChannelInviteSheet
          open={inviteSheetOpen}
          onClose={() => setInviteSheetOpen(false)}
          onInvite={(contactIds) => {
            inviteMembersToChannel(
              activeChannelId,
              contactIds,
              conversations.map((contact) => ({ id: contact.id, name: contact.name, avatar: contact.avatar })),
            );
            refreshChannelState();
            showChannelToast(`تمت دعوة ${contactIds.length} عضو للقناة`);
          }}
        />
      ) : null}

      <ConnectChannelModerationSheet
        open={!!moderationMember}
        member={moderationMember}
        onClose={() => setModerationMember(null)}
        onAction={(action) => {
          if (!moderationMember) return;
          const error = moderateChannelMember(activeChannelId, moderationMember.id, action, currentUserId);
          refreshChannelState();
          showChannelToast(error ?? "تم تنفيذ الإجراء");
          setModerationMember(null);
        }}
      />

      {callPickerOpen ? (
        <ConnectCallPickerSheet onClose={() => setCallPickerOpen(false)} onSelect={startPersonalCall} />
      ) : null}

      <ConnectTopToast message={connectToast} />

      {channelToast ? (
        <div className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-50 flex justify-center px-4">
          <div className="pointer-events-auto rounded-2xl border border-neon-green/30 bg-neon-green/10 px-4 py-2.5 text-center text-[12px] font-semibold text-neon-green backdrop-blur-md">
            {channelToast}
    </div>
        </div>
      ) : null}

      {securityToast ? (
        <div className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-50 flex justify-center px-4">
          <div className="pointer-events-auto rounded-2xl border border-destructive/40 bg-destructive/15 px-4 py-2.5 text-center text-[12px] font-semibold text-destructive backdrop-blur-md">
            {securityToast}
          </div>
        </div>
      ) : null}

    </AlphaScreenFrame>
    {connectBottomNav}
    </>
  );
}

function Header({
  mode,
  chatContact,
  onCloseChat,
  onOpenSettings,
  onOpenChannels,
  onOpenParticipants,
  trustShield,
}: {
  mode: Mode;
  chatContact?: Conversation | null;
  onCloseChat?: () => void;
  onOpenSettings: () => void;
  onOpenChannels: () => void;
  onOpenParticipants: () => void;
  trustShield: ReactNode;
}) {
  const chatOpen = !!chatContact;
  const subtitle =
    mode === "groups" ? "قناة صوتية" : mode === "messages" ? "الرسائل والصوت" : "اتصال شخصي";

  return (
    <div className={`connect-header flex items-center justify-between pt-[max(env(safe-area-inset-top),14px)] ${chatOpen ? "mb-2 shrink-0" : "mb-3"}`}>
      <div className="flex items-center gap-1.5">
        {chatOpen ? (
          <button
            type="button"
            onClick={onCloseChat}
            aria-label="رجوع للمحادثات"
            className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/90 transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : mode === "groups" ? (
          <ConnectParticipantsHeaderButton onClick={onOpenParticipants} />
        ) : (
          <span className="h-11 w-11 shrink-0" aria-hidden />
        )}
      </div>

      {chatOpen && chatContact ? (
        <div className="relative flex min-w-0 flex-1 items-center justify-center px-1">
          <div className="connect-header-logo-slot connect-header-logo-slot--hide absolute inset-x-0 flex flex-col items-center">
            <AlphaConnectLogo size="lg" animated />
            <div className="flex items-center gap-2">
              <h1 className="connect-header-title text-[17px] font-semibold tracking-tight text-neon-green drop-shadow-[0_0_8px_var(--neon-green)]">
                Alpha Connect
              </h1>
              <span className="connect-header-dot h-2 w-2 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
          <div className="connect-header-compact-contact relative z-10 flex min-w-0 flex-1 items-center justify-center">
            <AlphaIdentityRow
              className="min-w-0"
              name={chatContact.name}
              role={chatContact.role}
              avatar={chatContact.avatar}
              avatarSize="sm"
              presenceUserId={chatContact.id}
              nameClassName="text-[14px] font-bold leading-tight text-foreground"
              subtitle={<span className="text-[9px] text-neon-green/80">محادثة مشفّرة</span>}
            />
          </div>
        </div>
      ) : (
        <div className="connect-header-logo-slot flex flex-col items-center">
          <AlphaConnectLogo size="lg" animated />
          <div className="flex items-center gap-2">
            <h1 className="connect-header-title text-[17px] font-semibold tracking-tight text-neon-green drop-shadow-[0_0_8px_var(--neon-green)]">
              Alpha Connect
            </h1>
            <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {trustShield}
        {mode === "groups" && !chatOpen ? (
          <ConnectChannelsHeaderButton onClick={onOpenChannels} />
        ) : (
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="إعدادات الاتصالات"
            className="flex h-11 w-8 items-center justify-center text-foreground/70 active:scale-95 transition-transform"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function NearbyMembersEntry() {
  return (
    <Link
      to="/alpha-connect/nearby"
      className="glass-strong mb-4 flex items-center gap-3 rounded-2xl px-3.5 py-3 active:scale-[0.99] transition-transform"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-neon-green/15 text-neon-green border border-neon-green/25">
        <MapPin className="h-5 w-5" />
      </span>
      <span className="flex-1 min-w-0 text-right">
        <span className="block text-[13px] font-extrabold">الأعضاء القريبون</span>
        <span className="block text-[10px] text-muted-foreground mt-0.5">
          اكتشاف آمن · Alpha ID · بدون QR
        </span>
      </span>
      <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

function IndividualProfileCard() {
  const [user, setUser] = useState(() => getCurrentUser());
  const myPresence = useMyPresenceStatus();
  const { cycleMyPresenceStatus } = usePresenceActions();

  useEffect(() => {
    return subscribeAuthContext(() => setUser(getCurrentUser()));
  }, []);

  const displayName = user.name?.trim() || currentUserName();
  const avatar = user.avatarUrl || avatarMina;
  const viewerId = user.id || "creator";
  const alphaIdShort = deriveAlphaIdShort(user.id);
  const qrValue = getIdentityQrValue(alphaIdShort);
  const qrLink = buildIdentityQrPayload(alphaIdShort);
  const [qrCopied, setQrCopied] = useState(false);
  const presenceLabel = PRESENCE_LABELS[myPresence];
  const presenceTextClass =
    myPresence === "busy" ? "text-[#f97316]" : myPresence === "hidden" ? "text-muted-foreground" : "text-neon-green";
  const presenceDotClass =
    myPresence === "busy" ? "bg-[#f97316]" : myPresence === "hidden" ? "bg-[#9CA3AF]" : "bg-neon-green";

  return (
    <>
      <AlphaIdentityRow
        className="glass-strong mb-4 w-full rounded-2xl px-3 py-2.5"
        name={displayName}
        role={getDisplayShieldRoleSync()}
        avatar={avatar}
        avatarSize="sm"
        avatarRing="green"
        presenceUserId={viewerId}
        onPresenceClick={cycleMyPresenceStatus}
        presenceAriaLabel={`حالة الاتصال: ${presenceLabel}`}
        nameClassName="truncate text-[15px] font-bold leading-tight"
        meta={
          <>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${presenceDotClass}`} />
              <span className={`text-[10px] font-medium ${presenceTextClass}`}>{presenceLabel}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{presencePresenceSubtitle(myPresence)}</p>
          </>
        }
        trailing={
          <ConnectPremiumQrBadge
            qrValue={qrValue}
            shortCode={alphaIdShort}
            link={qrLink}
            ariaLabel={`نسخ رابط ${alphaIdShort}`}
            variant="flat"
            size={56}
            onCopied={() => {
              setQrCopied(true);
              window.setTimeout(() => setQrCopied(false), 2000);
            }}
          />
        }
      />
      {qrCopied ? (
        <p className="relative -mt-3 mb-4 text-center text-[9px] font-semibold text-neon-green">
          تم نسخ الرابط
        </p>
      ) : null}
    </>
  );
}

function ShowMoreToggle({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-1 flex w-full items-center justify-center gap-1.5 border-t border-white/10 pt-3 text-[12px] font-medium text-neon-green active:scale-[0.98]"
    >
      {expanded ? "عرض أقل" : "عرض المزيد"}
      <ChevronLeft
        className={`h-3.5 w-3.5 opacity-80 transition-transform ${expanded ? "rotate-90" : "-rotate-90"}`}
      />
      </button>
  );
}

function sectionTitles<T extends { section: string }>(entries: T[]): string[] {
  return entries.reduce<string[]>((acc, entry) => {
    if (!acc.includes(entry.section)) acc.push(entry.section);
    return acc;
  }, []);
}

function CallLogCard({
  onRedial,
  onMessage,
}: {
  onRedial: (contactId: string, name: string) => void;
  onMessage: (contactId: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleEntries = expanded ? CALL_LOG_ENTRIES : CALL_LOG_ENTRIES.slice(0, CONNECT_ACTIVITY_PREVIEW_LIMIT);
  const hasMore = CALL_LOG_ENTRIES.length > CONNECT_ACTIVITY_PREVIEW_LIMIT;

  return (
    <div className="glass-strong mb-4 overflow-hidden rounded-3xl p-4">
      <div className="space-y-2">
        {visibleEntries.map((entry) => (
          <RecentCallerRow
            key={entry.id}
            contactName={entry.contactName}
            time={entry.time}
            duration={entry.duration}
            avatar={entry.avatar}
            role={conversations.find((c) => c.id === entry.contactId)?.role ?? "member"}
            missed={entry.missed}
            onCall={() => onRedial(entry.contactId, entry.contactName)}
            onMessage={() => onMessage(entry.contactId, entry.contactName)}
          />
        ))}
      </div>
      {hasMore ? <ShowMoreToggle expanded={expanded} onToggle={() => setExpanded((value) => !value)} /> : null}
    </div>
  );
}

function MessagesLogCard({
  activeTab,
  onTabChange,
  voiceHistoryPanel,
  onOpenChat,
  onShowToast,
}: {
  activeTab: MessagesTab;
  onTabChange: (tab: MessagesTab) => void;
  voiceHistoryPanel: ReactNode;
  onOpenChat: (conv: Conversation) => void;
  onShowToast: (msg: string) => void;
}) {
  const { conversations: dbConversations, refresh: refreshConversations } = useAlphaConnectConversationList();
  const [conversationsExpanded, setConversationsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearingConv, setClearingConv] = useState(false);
  const [hideConfirmId, setHideConfirmId] = useState<string | null>(null);
  const [unhideConfirmId, setUnhideConfirmId] = useState<string | null>(null);
  const [deletedConvIds, setDeletedConvIds] = useState<string[]>([]);
  const [hiddenConvIds, setHiddenConvIds] = useState<string[]>(() => loadLS(HIDDEN_CONVS_KEY, []));
  const [hiddenCode, setHiddenCode] = useState(() => loadLS<string>(HIDDEN_CODE_KEY, ""));
  const [needCodePrompt, setNeedCodePrompt] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const refreshHiddenFromStorage = useCallback(() => {
    setHiddenConvIds(loadLS(HIDDEN_CONVS_KEY, []));
    setHiddenCode(loadLS<string>(HIDDEN_CODE_KEY, ""));
  }, []);

  useEffect(() => {
    refreshHiddenFromStorage();
  }, [showSettings, refreshHiddenFromStorage]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshHiddenFromStorage();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshHiddenFromStorage]);

  const secretMode = hiddenCode.length >= 4 && searchQuery.trim() === hiddenCode;

  useEffect(() => {
    if (secretMode) saveLS(HIDDEN_SESSION_KEY, true);
  }, [secretMode]);

  const newChatTargets = useMemo(
    () => dbConversations.filter((c) => c.kind === "private" && !deletedConvIds.includes(c.id) && !hiddenConvIds.includes(c.id)),
    [dbConversations, deletedConvIds, hiddenConvIds],
  );

  const filteredConversations = useMemo(
    () => dbConversations.filter((c) => !deletedConvIds.includes(c.id) && !hiddenConvIds.includes(c.id)),
    [dbConversations, deletedConvIds, hiddenConvIds],
  );
  const visibleHidden = useMemo(
    () => dbConversations.filter((c) => hiddenConvIds.includes(c.id) && !deletedConvIds.includes(c.id)),
    [dbConversations, hiddenConvIds, deletedConvIds],
  );
  const searchedConversations = useMemo(() => {
    if (secretMode) return visibleHidden;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredConversations;
    return filteredConversations.filter(
      (c) => c.name.toLowerCase().includes(q) || c.message.toLowerCase().includes(q),
    );
  }, [filteredConversations, searchQuery, secretMode, visibleHidden]);
  const visibleConversations = conversationsExpanded
    ? searchedConversations
    : searchedConversations.slice(0, CONNECT_ACTIVITY_PREVIEW_LIMIT);
  const conversationsHasMore = searchedConversations.length > CONNECT_ACTIVITY_PREVIEW_LIMIT;
  const deleteConfirmConv = deleteConfirmId
    ? dbConversations.find((c) => c.id === deleteConfirmId)
    : undefined;

  const hideDeletedConversation = useCallback(
    (convId: string) => {
      setDeletedConvIds((prev) => [...prev, convId]);
      setDeleteConfirmId(null);
    },
    [],
  );

  const handleDeleteLocalOnly = useCallback(() => {
    if (!deleteConfirmConv || clearingConv) return;
    hapticWarning();
    hideDeletedConversation(deleteConfirmConv.id);
    onShowToast("تم مسح المحادثة من قائمتك");
  }, [clearingConv, deleteConfirmConv, hideDeletedConversation, onShowToast]);

  const handleDeleteForBoth = useCallback(async () => {
    if (!deleteConfirmConv || clearingConv) return;
    hapticWarning();
    setClearingConv(true);
    try {
      await clearConversationForBothParties(deleteConfirmConv);
      hideDeletedConversation(deleteConfirmConv.id);
      await refreshConversations();
      onShowToast("تم مسح المحادثة للطرفين");
    } catch (error) {
      console.error("[MessagesLogCard:clearBoth]", error);
      onShowToast("تعذّر مسح المحادثة للطرفين");
    } finally {
      setClearingConv(false);
    }
  }, [clearingConv, deleteConfirmConv, hideDeletedConversation, onShowToast, refreshConversations]);

  const hideConfirmConv = hideConfirmId
    ? dbConversations.find((c) => c.id === hideConfirmId)
    : undefined;
  const unhideConfirmConv = unhideConfirmId
    ? dbConversations.find((c) => c.id === unhideConfirmId)
    : undefined;

  const openConversation = (id: string) => {
    let conv = dbConversations.find((c) => c.id === id);
    if (!conv) {
      const contact = CONVERSATION_CONTACTS.find((c) => c.id === id);
      if (contact) {
        conv = mergeConversationWithDb(contact, undefined);
      }
    }
    if (conv) onOpenChat(conv);
  };

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
    setNeedCodePrompt(false);
  }, []);

  const hideConversation = useCallback(
    (id: string) => {
      if (!hasSecretCode()) {
        setNeedCodePrompt(true);
        onShowToast("أنشئ الكود السري من إعدادات الرسائل أولاً");
        return;
      }
      hapticMediumImpact();
      const list = loadLS<string[]>(HIDDEN_CONVS_KEY, []);
      const next = [...new Set([...list, id])];
      saveLS(HIDDEN_CONVS_KEY, next);
      setHiddenConvIds(next);
      onShowToast("تم إخفاء المحادثة");
    },
    [onShowToast],
  );

  const unhideConversation = useCallback(
    (id: string) => {
      hapticMediumImpact();
      const next = loadLS<string[]>(HIDDEN_CONVS_KEY, []).filter((item) => item !== id);
      saveLS(HIDDEN_CONVS_KEY, next);
      setHiddenConvIds(next);
      onShowToast("تم إظهار المحادثة في القائمة");
    },
    [onShowToast],
  );

  useEffect(() => {
    if (searchExpanded) searchInputRef.current?.focus();
  }, [searchExpanded]);

  return (
    <div className="glass-strong relative mb-4 flex flex-col overflow-hidden rounded-3xl">
      <div className="flex shrink-0 border-b border-white/10" dir="rtl">
        <button
          type="button"
          onClick={() => onTabChange("conversations")}
          className={`relative flex-1 py-3.5 text-center text-[13px] font-medium transition-colors ${
            activeTab === "conversations" ? "text-neon-green" : "text-muted-foreground"
          }`}
        >
          المحادثات
          {activeTab === "conversations" ? (
            <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => onTabChange("voice")}
          className={`relative flex-1 py-3.5 text-center text-[13px] font-medium transition-colors ${
            activeTab === "voice" ? "text-neon-green" : "text-muted-foreground"
          }`}
        >
          الرسائل الصوتية
          {activeTab === "voice" ? (
            <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-neon-green shadow-[0_0_8px_var(--neon-green)]" />
          ) : null}
        </button>
      </div>

      <div className="px-4 py-4">
        {activeTab === "voice" ? (
          <ConnectHistoryPanel label="التسجيلات الصوتية" plain>
            {voiceHistoryPanel}
          </ConnectHistoryPanel>
        ) : showSettings ? (
          <AlphaMessageSettings embedded onBack={() => setShowSettings(false)} />
        ) : (
          <>
            {/* Action buttons row — settings/new chat LEFT · search RIGHT */}
            <div className="mb-3.5 flex w-full items-center gap-2.5" dir="ltr">
              <div className="flex shrink-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  aria-label="إعدادات الرسائل"
                  className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 transition-all active:scale-90"
                >
                  <Settings2 className="h-[18px] w-[18px] text-[var(--neon-blue)]" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewChat(true)}
                  aria-label="محادثة جديدة"
                  className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neon-green/35 text-neon-green shadow-[0_0_12px_oklch(0.82_0.22_145/0.22)] transition-all active:scale-90"
                >
                  <SquarePen className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </button>
              </div>
              <div className="flex min-w-0 flex-1 justify-end">
                <ConnectExpandableSearchBar
                  expanded={searchExpanded}
                  query={searchQuery}
                  inputRef={searchInputRef}
                  secretMode={secretMode}
                  onExpand={() => setSearchExpanded(true)}
                  onCollapse={collapseSearch}
                  onQueryChange={(value) => {
                    setSearchQuery(value);
                    if (needCodePrompt) setNeedCodePrompt(false);
                  }}
                  collapsedAriaLabel="بحث في المحادثات"
                  inputAriaLabel="بحث في المحادثات"
                />
              </div>
            </div>

            {secretMode ? (
              <div className="mb-2 flex items-center justify-between px-0.5" dir="rtl">
                <span className="text-[11px] font-semibold text-neon-green">المحادثات المخفية</span>
                <button
                  type="button"
                  onClick={collapseSearch}
                  className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  إخفاء النتائج
                </button>
              </div>
            ) : null}

            {needCodePrompt ? (
              <p className="mb-2 text-center text-[10px] text-muted-foreground/80" dir="rtl">
                أنشئ الكود السري من إعدادات الرسائل ← القفل والخصوصية
              </p>
            ) : null}

            <div className="space-y-2">
              {visibleConversations.length === 0 ? (
                <p className="py-6 text-center text-[11px] text-muted-foreground/70" dir="rtl">
                  {secretMode
                    ? "لا توجد محادثات مخفية"
                    : searchQuery.trim()
                      ? "لا توجد نتائج للبحث"
                      : "لا توجد محادثات"}
                </p>
              ) : null}
              {visibleConversations.map((conversation) => (
                <ConnectSwipeCard
                  key={conversation.id}
                  secretMode={secretMode}
                  onRowActivate={() => openConversation(conversation.id)}
                  onDeleteRequest={() => setDeleteConfirmId(conversation.id)}
                  onHideRequest={() =>
                    secretMode
                      ? setUnhideConfirmId(conversation.id)
                      : setHideConfirmId(conversation.id)
                  }
                >
                  <TimelineConversationRow
                    userId={conversation.id}
                    name={conversation.name}
                    preview={conversation.message}
                    time={conversation.time}
                    avatar={conversation.avatar}
                    role={conversation.role}
                    unread={conversation.unread}
                  />
                </ConnectSwipeCard>
              ))}
            </div>
            {conversationsHasMore ? (
              <ShowMoreToggle
                expanded={conversationsExpanded}
                onToggle={() => setConversationsExpanded((value) => !value)}
              />
            ) : null}
          </>
        )}
      </div>

      {/* ── New chat picker — Alpha Connect dark style ── */}
      {showNewChat && (
        <div
          className="connect-new-chat-sheet absolute inset-0 z-20 flex flex-col overflow-hidden rounded-3xl bg-[#060d1f]/95 backdrop-blur-xl"
          dir="rtl"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowNewChat(false)}
              className="glass flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition-all active:scale-90"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="flex-1 text-[13px] font-bold text-foreground">محادثة جديدة</p>
            <SquarePen className="h-4 w-4 text-neon-green opacity-70" />
          </div>
          <p className="px-4 py-2 text-[10px] text-muted-foreground/75">اختر من تريد مراسلته</p>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="space-y-2">
              {newChatTargets.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    setShowNewChat(false);
                    openConversation(conv.id);
                  }}
                  className="glass w-full rounded-[16px] border border-white/10 px-3 py-2.5 transition-all active:scale-[0.98]"
                >
                  <AlphaIdentityRow
                    name={conv.name}
                    role={conv.role}
                    avatar={conv.avatar}
                    avatarSize="sm"
                    presenceUserId={conv.id}
                    nameClassName="text-[12px] font-semibold text-foreground"
                    subtitle={<span className="text-[10px] text-muted-foreground/75">رسائل خاصة وموثّقة</span>}
                    trailing={<ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConnectConfirmDialog
        open={!!hideConfirmConv}
        zIndex={270}
        onClose={() => setHideConfirmId(null)}
        onConfirm={() => {
          if (!hideConfirmConv) return;
          hideConversation(hideConfirmConv.id);
          setHideConfirmId(null);
        }}
        title="إخفاء المحادثة؟"
        description={
          hideConfirmConv
            ? `سيتم نقل «${hideConfirmConv.name}» إلى المحادثات المخفية.`
            : undefined
        }
        confirmLabel="إخفاء"
        tone="hide"
        icon={EyeOff}
      />

      <ConnectConfirmDialog
        open={!!unhideConfirmConv}
        zIndex={270}
        onClose={() => setUnhideConfirmId(null)}
        onConfirm={() => {
          if (!unhideConfirmConv) return;
          unhideConversation(unhideConfirmConv.id);
          setUnhideConfirmId(null);
        }}
        title="إظهار المحادثة؟"
        description={
          unhideConfirmConv
            ? `سيتم إظهار «${unhideConfirmConv.name}» في قائمة المحادثات.`
            : undefined
        }
        confirmLabel="إظهار"
        tone="green"
        icon={Eye}
      />

      <ConnectConversationDeleteDialog
        open={!!deleteConfirmConv}
        zIndex={270}
        busy={clearingConv}
        onClose={() => setDeleteConfirmId(null)}
        onDeleteLocal={handleDeleteLocalOnly}
        onDeleteBoth={() => void handleDeleteForBoth()}
        title="حذف المحادثة؟"
        description={
          deleteConfirmConv
            ? `اختر طريقة مسح محادثة «${deleteConfirmConv.name}».`
            : "اختر طريقة المسح."
        }
      />
    </div>
  );
}

// ─── Swipeable conversation card (Alpha Connect dark style) ─────────────────
// Right swipe (dx > 0) → Delete   ·   Left swipe (dx < 0) → Hide / Unhide
function ConnectSwipeCard({
  children,
  secretMode = false,
  onDeleteRequest,
  onHideRequest,
  onRowActivate,
}: {
  children: ReactNode;
  secretMode?: boolean;
  onDeleteRequest: () => void;
  onHideRequest: () => void;
  onRowActivate?: () => void;
}) {
  const [dx, setDx] = useState(0);
  const dxRef = useRef(0);
  const startX     = useRef(0);
  const startY     = useRef(0);
  const dragging   = useRef(false);
  const axis       = useRef<"h" | "v" | null>(null);
  const hapticFired = useRef(false);
  const blockedTapRef = useRef(false);
  const THRESHOLD  = 80;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current   = e.touches[0].clientX;
    startY.current   = e.touches[0].clientY;
    dragging.current = true;
    axis.current     = null;
    hapticFired.current = false;
    blockedTapRef.current = false;
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
    if (Math.abs(dX) > 10) blockedTapRef.current = true;
    const newDx  = Math.max(-120, Math.min(120, dX));
    const newPct = Math.abs(newDx) / THRESHOLD;
    if (newPct >= 1 && !hapticFired.current) {
      hapticLightImpact();
      hapticFired.current = true;
    }
    if (newPct < 0.85) hapticFired.current = false;
    dxRef.current = newDx;
    setDx(newDx);
  };

  const onTouchEnd = () => {
    dragging.current = false;
    hapticFired.current = false;
    const finalDx = dxRef.current;
    if (axis.current === "h") {
      if (finalDx > THRESHOLD) {
        blockedTapRef.current = true;
        onDeleteRequest();
      } else if (finalDx < -THRESHOLD) {
        blockedTapRef.current = true;
        onHideRequest();
      }
    }
    setDx(0);
    dxRef.current = 0;
    axis.current = null;
    if (blockedTapRef.current) {
      window.setTimeout(() => { blockedTapRef.current = false; }, 320);
    }
  };

  const handleActivate = () => {
    if (blockedTapRef.current) return;
    onRowActivate?.();
  };

  const pct      = Math.min(Math.abs(dx) / THRESHOLD, 1);
  const iconSz   = 13 + pct * 7;
  const circleSz = 32 + pct * 18;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete backdrop — right swipe */}
      <div
        className="absolute inset-0 flex items-center justify-end px-5"
        aria-hidden="true"
        style={{
          background: "linear-gradient(135deg,#3b0016 0%,#7f1d1d 45%,#ef4444 100%)",
          opacity: dx > 0 ? Math.min(0.15 + pct * 0.85, 1) : 0,
          transition: dragging.current ? "none" : "opacity 0.3s ease",
        }}
      >
        <div
          className="grid place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
          style={{
            width: circleSz, height: circleSz,
            opacity: dx > 0 ? 0.25 + pct * 0.75 : 0,
            transform: `scale(${0.55 + pct * 0.45})`,
            transition: dragging.current ? "none" : "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: pct > 0.6 ? "0 4px 20px rgba(239,68,68,0.4),0 0 0 1px rgba(255,255,255,0.1)" : "none",
          }}
        >
          <Trash2 style={{ width: iconSz, height: iconSz }} className="text-white" />
        </div>
      </div>

      {/* Hide / Unhide backdrop — left swipe */}
      <div
        className="absolute inset-0 flex items-center justify-start px-5"
        aria-hidden="true"
        style={{
          background: secretMode
            ? "linear-gradient(135deg,#052e16 0%,#166534 45%,#22c55e 100%)"
            : "linear-gradient(135deg,#0d1f3c 0%,#1e3a5f 45%,#3b82f6 100%)",
          opacity: dx < 0 ? Math.min(0.15 + pct * 0.85, 1) : 0,
          transition: dragging.current ? "none" : "opacity 0.3s ease",
        }}
      >
        <div
          className="grid place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
          style={{
            width: circleSz, height: circleSz,
            opacity: dx < 0 ? 0.25 + pct * 0.75 : 0,
            transform: `scale(${0.55 + pct * 0.45})`,
            transition: dragging.current ? "none" : "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: pct > 0.6
              ? secretMode
                ? "0 4px 20px rgba(34,197,94,0.4),0 0 0 1px rgba(255,255,255,0.1)"
                : "0 4px 20px rgba(59,130,246,0.4),0 0 0 1px rgba(255,255,255,0.1)"
              : "none",
          }}
        >
          {secretMode ? (
            <Eye style={{ width: iconSz, height: iconSz }} className="text-white" />
          ) : (
            <EyeOff style={{ width: iconSz, height: iconSz }} className="text-white" />
          )}
        </div>
      </div>

      {/* Sliding content */}
      <div
        role={onRowActivate ? "button" : undefined}
        tabIndex={onRowActivate ? 0 : undefined}
        onKeyDown={
          onRowActivate
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleActivate();
                }
              }
            : undefined
        }
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          willChange: "transform",
          touchAction: "pan-y",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onRowActivate ? handleActivate : undefined}
      >
        {children}
      </div>
    </div>
  );
}

function TimelineSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mb-5 pr-4 ${className}`}>
      <div aria-hidden className="absolute bottom-1 right-[7px] top-6 w-px bg-white/12" />
      <p className="mb-3 text-right text-[11px] font-semibold text-muted-foreground">{title}</p>
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}

function TimelineVoiceRow({
  duration,
  wave,
  time,
  avatar,
  badge,
  isPlaying,
  progress,
  onTogglePlay,
}: {
  duration: string;
  wave: "blue" | "green" | "white";
  time: string;
  avatar: string;
  badge: "green" | "blue";
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
}) {
  const badgeColor = badge === "green" ? "bg-neon-green" : "bg-neon-blue";
  const ringColor =
    badge === "green"
      ? "from-neon-green to-[oklch(0.82_0.22_145/0.3)]"
      : "from-[var(--neon-blue)] to-[oklch(0.72_0.18_235/0.3)]";
  const playTone =
    wave === "green"
      ? "bg-neon-green/20 text-neon-green border-neon-green/35 shadow-[0_0_12px_oklch(0.82_0.22_145/0.25)]"
      : wave === "blue"
        ? "bg-[oklch(0.72_0.18_235/0.18)] text-[var(--neon-blue)] border-[oklch(0.72_0.18_235/0.35)] shadow-[0_0_12px_oklch(0.72_0.18_235/0.2)]"
        : "bg-white/15 text-white border-white/25 shadow-[0_0_12px_rgba(255,255,255,0.12)]";

  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? `إيقاف الرسالة الصوتية ${duration}` : `تشغيل الرسالة الصوتية ${duration}`}
        aria-pressed={isPlaying}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
          isPlaying ? playTone : "border-transparent bg-white/5"
        }`}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current text-current" />
        ) : (
          <Play className="mr-0.5 h-3.5 w-3.5 fill-foreground/90 text-foreground/90" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <Waveform color={wave} progress={progress} />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">{time}</p>
      </div>
      <VoicePlaybackDuration duration={duration} progress={progress} isPlaying={isPlaying} />
      <div className="relative shrink-0">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br p-[2px] ${ringColor}`}>
          <img src={avatar} alt="" loading="lazy" width={80} height={80} className="h-full w-full rounded-full object-cover" />
        </div>
        <span
          className={`absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#0a1430] ${badgeColor}`}
        >
          <Mic className="h-2 w-2 text-[#0a1430]" strokeWidth={3} />
        </span>
      </div>
        </div>
  );
}

function RecentCallerRow({
  contactName,
  time,
  duration,
  avatar,
  role = "member",
  missed = false,
  onCall,
  onMessage,
}: {
  contactName: string;
  time: string;
  duration?: string;
  avatar: string;
  role?: ShieldRole;
  missed?: boolean;
  onCall: () => void;
  onMessage: () => void;
}) {
  return (
    <AlphaIdentityRow
      variant="call-log"
      className="glass w-full rounded-2xl px-3 py-2.5"
      name={contactName}
      role={role}
      avatar={avatar}
      avatarRing="glass"
      avatarSize="sm"
      nameClassName="truncate text-[13px] font-semibold text-foreground"
      meta={
        <div className="flex items-center gap-1.5" dir="rtl">
          {missed ? (
            <PhoneMissed className="h-3 w-3 shrink-0 text-destructive" strokeWidth={2.5} />
          ) : (
            <PhoneOutgoing className="h-3 w-3 shrink-0 text-neon-green" strokeWidth={2.5} />
          )}
          {duration ? <span className="text-[10px] text-muted-foreground/90">{duration}</span> : null}
          <span className="truncate text-[11px] text-muted-foreground">{time}</span>
        </div>
      }
      trailing={
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCall}
            aria-label={`اتصال بـ ${contactName}`}
            className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <Phone className={`h-4 w-4 ${missed ? "text-destructive" : "text-neon-green"}`} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onMessage}
            aria-label={`مراسلة ${contactName}`}
            className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <MessageCircle className="h-4 w-4 text-foreground/90" strokeWidth={2} />
          </button>
        </div>
      }
    />
  );
}

function TimelineConversationRow({
  userId,
  name,
  preview,
  time,
  avatar,
  role = "member",
  unread,
}: {
  userId: string;
  name: string;
  preview: string;
  time: string;
  avatar: string;
  role?: ShieldRole;
  unread?: number;
}) {
  return (
    <AlphaIdentityRow
      variant="participant-grid"
      className="glass w-full rounded-2xl px-3 py-2.5"
      name={name}
      role={role}
      avatar={avatar}
      avatarRing="green"
      presenceUserId={userId}
      nameClassName="text-[12px] font-semibold text-foreground"
      subtitle={preview}
      trailing={
        <>
          <span className="shrink-0 text-[10px] text-muted-foreground">{time}</span>
          {unread ? (
            <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-neon-green px-1.5 text-[10px] font-bold text-[#0a1430]">
              {unread}
            </span>
          ) : null}
        </>
      }
    />
  );
}

function VoiceMessageRecorder({
  onSendVoice,
}: {
  onSendVoice: (blob: Blob, durationMs: number) => Promise<boolean>;
}) {
  const settings = loadAlphaConnectSettings();
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const showVoiceToast = useCallback((msg: string) => {
    setVoiceToast(msg);
    window.setTimeout(() => setVoiceToast(null), 2400);
  }, []);

  const voiceRecorder = useVoiceRecorder({
    onRecorded: onSendVoice,
    onError: (msg) => showVoiceToast(msg),
  });

  const ptt = usePushToTalk({
    holdMs: settings.pttHoldMs,
    vibrateStart: settings.vibrateStart,
    vibrateEnd: settings.vibrateEnd,
    onPressBegin: () => {
      void voiceRecorder.start();
    },
    onPressEnd: () => {
      voiceRecorder.stop();
    },
  });

  const micActive = ptt.isTransmitting || voiceRecorder.isRecording;

  return (
    <div className="pb-1 pt-1">
      <div className="flex justify-center px-1">
        <ConnectCircleButton
          tone="green"
          icon={Mic}
          label="رسالة صوتية"
          pulse
          sublabel={
            voiceRecorder.isSaving
              ? "جاري الإرسال…"
              : micActive
                ? "جاري التسجيل…"
                : undefined
          }
          pressHandlers={ptt.handlers}
          transmitting={micActive}
        />
      </div>
      {voiceToast ? (
        <p
          className={`mt-2 text-center text-[11px] font-medium ${
            voiceToast.includes("قصير") || voiceToast.includes("تعذّر") ? "text-destructive" : "text-neon-green"
          }`}
        >
          {voiceToast}
        </p>
      ) : null}
    </div>
  );
}

function ConnectScrollAction({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex flex-col items-center pb-2 pt-2">{children}</div>;
}

function ConnectCallButton({ onPress }: { onPress: () => void }) {
  return (
    <div className="flex justify-center pb-1 pt-1">
      <ConnectCircleButton tone="green" icon={Phone} label="اتصال" pulse onClick={onPress} />
    </div>
  );
}

function ConnectCallPickerSheet({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (contact: Conversation) => void;
}) {
  return (
    <div className={`${connectBottomSheetHostClass()} z-50`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        dir="rtl"
        className="relative w-full max-w-[var(--alpha-content-narrow-width)] glass-strong rounded-t-3xl pb-[max(16px,env(safe-area-inset-bottom))] pt-3 animate-in slide-in-from-bottom duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="glass flex h-9 w-9 items-center justify-center rounded-xl text-foreground/80 active:scale-95"
          >
            <X className="h-4 w-4" />
      </button>
          <p className="text-sm font-semibold">اختر جهة الاتصال</p>
          <span className="h-9 w-9" />
        </div>

        <div className="max-h-[min(60dvh,420px)] space-y-2 overflow-y-auto overscroll-y-contain px-3 pb-2">
          {CALLABLE_CONTACTS.filter((contact) => isPresenceVisibleInOnlineSurfaces(contact.id)).map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSelect(contact)}
              className="glass w-full rounded-2xl px-3 py-3 active:scale-[0.99] transition-transform"
            >
              <AlphaIdentityRow
                name={contact.name}
                role={contact.role}
                avatar={contact.avatar}
                avatarSize="sm"
                presenceUserId={contact.id}
                nameClassName="text-[13px] font-semibold"
                meta={
                  <>
                    <p className="text-[11px] text-muted-foreground">{CONTACT_ROLE_LABEL[contact.role]}</p>
                    <span className="text-[10px] font-medium text-neon-green">
                      {PRESENCE_LABELS[getPresenceStatus(contact.id)]}
                    </span>
                  </>
                }
                trailing={
                  <span className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Phone className="h-4 w-4 text-neon-green" />
                  </span>
                }
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoiceControl({
  onCall,
  audioSelection,
  audioDevices,
  audioPickerOpen,
  onOpenAudioPicker,
  onCloseAudioPicker,
  onSelectAudioDevice,
  onSendVoice,
  showFooterActions = true,
}: {
  onCall?: () => void;
  audioSelection: ConnectAudioSelection;
  audioDevices: ConnectAudioOutputDevice[];
  audioPickerOpen: boolean;
  onOpenAudioPicker: () => void;
  onCloseAudioPicker: () => void;
  onSelectAudioDevice: (deviceId: string) => void;
  onSendVoice: (blob: Blob, durationMs: number) => Promise<boolean>;
  showFooterActions?: boolean;
}) {
  const settings = loadAlphaConnectSettings();
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const showVoiceToast = useCallback((msg: string) => {
    setVoiceToast(msg);
    window.setTimeout(() => setVoiceToast(null), 2400);
  }, []);

  const voiceRecorder = useVoiceRecorder({
    onRecorded: async (blob, durationMs) => {
      const ok = await onSendVoice(blob, durationMs);
      if (ok) showVoiceToast(`تم إرسال رسالة صوتية (${formatVoiceDuration(durationMs)})`);
      return ok;
    },
    onError: (msg) => showVoiceToast(msg),
  });

  const ptt = usePushToTalk({
    holdMs: settings.pttHoldMs,
    vibrateStart: settings.vibrateStart,
    vibrateEnd: settings.vibrateEnd,
    onPressBegin: () => {
      void voiceRecorder.start();
    },
    onPressEnd: () => {
      voiceRecorder.stop();
    },
  });

  const statusLabel = voiceRecorder.isSaving
    ? "جاري الإرسال…"
    : voiceRecorder.isRecording
      ? "جاري التسجيل…"
      : ptt.isHolding
        ? "استمر بالضغط…"
        : "اضغط مطولاً للتحدث";

  const micPressed = ptt.isHolding || ptt.isTransmitting || voiceRecorder.isRecording;

  return (
    <div className={`flex flex-col items-center ${showFooterActions ? "mb-5" : "mb-0"}`}>
      <div className="connect-mic-stage relative flex h-[300px] w-[300px] items-center justify-center">
        <div className="connect-mic-deco-1 absolute inset-0 rounded-full border border-dashed" />
        <div className="connect-mic-deco-2 absolute inset-3 rounded-full border border-dotted" />
        <div className="connect-mic-deco-3 absolute inset-7 rounded-full border border-dotted" />
        <span
          className={`connect-pulse-wrap connect-pulse-wrap--green ${
            micPressed ? "connect-pulse-wrap--transmitting" : ""
          } relative flex h-[220px] w-[220px] items-center justify-center`}
        >
          <button
            type="button"
            {...ptt.handlers}
            className={`connect-mic-face neon-ring relative flex h-full w-full touch-none select-none flex-col items-center justify-center rounded-full transition-transform ${
              micPressed ? "connect-mic-transmitting" : ptt.isHolding ? "scale-[0.98]" : ""
            }`}
            style={{ background: "var(--gradient-mic)", WebkitTouchCallout: "none" }}
          >
            <div className="connect-mic-deco-face pointer-events-none absolute inset-2 rounded-full border" />
            <Mic
              className={`pointer-events-none h-16 w-16 text-neon-green ${
                micPressed
                  ? "drop-shadow-[0_0_18px_var(--neon-green)]"
                  : "drop-shadow-[0_0_12px_var(--neon-green)]"
              }`}
              strokeWidth={2.2}
            />
            <span
              className={`pointer-events-none absolute bottom-7 text-[11px] ${
                micPressed ? "font-semibold text-neon-green" : "text-neon-green/90"
              }`}
            >
              {statusLabel}
            </span>
          </button>
        </span>
      </div>

      {voiceToast ? (
        <p
          className={`mt-3 text-center text-[11px] font-medium ${
            voiceToast.includes("تم إرسال") ? "text-neon-green" : "text-destructive"
          }`}
        >
          {voiceToast}
        </p>
      ) : null}

      {showFooterActions ? (
        <div className="mt-2 flex w-full max-w-[320px] items-center justify-between gap-4 px-2" dir="rtl">
          <ConnectAudioOutputControl
            selection={audioSelection}
            devices={audioDevices}
            pickerOpen={audioPickerOpen}
            onOpenPicker={onOpenAudioPicker}
            onClosePicker={onCloseAudioPicker}
            onSelectDevice={onSelectAudioDevice}
            variant="voice-footer"
          />
          <button
            onClick={onCall}
            className="glass flex h-[80px] w-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl transition-transform active:scale-95"
          >
            {onCall ? <Phone className="h-5 w-5 text-neon-green" /> : <Ear className="h-5 w-5 text-foreground/90" />}
            <span className="text-[10px] text-muted-foreground">{onCall ? "مكالمة" : "استماع فقط"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StatusStrip() {
  const connection = useConnectionStatus();
  const security = useSecurityStatus();
  const device = useDeviceStatus();

  const connectionIconClass = connectionQualityTone(connection.quality);
  const securityIconClass = securityStateTone(security.state);
  const batteryIconClass = batteryLevelTone(device.level);

  const ConnectionIcon =
    connection.quality === "offline"
      ? WifiOff
      : connection.quality === "poor" || connection.quality === "fair"
        ? SignalLow
        : connection.quality === "good"
          ? SignalMedium
          : SignalHigh;

  const SecurityIcon = security.state === "encrypted" ? ShieldCheck : ShieldAlert;

  const BatteryIcon =
    device.charging
      ? BatteryCharging
      : device.level != null && device.level <= 15
        ? BatteryLow
        : device.level != null && device.level <= 35
          ? BatteryMedium
          : device.level != null
            ? BatteryFull
            : Battery;

  return (
    <div className="glass-strong mb-4 grid grid-cols-3 gap-2 rounded-2xl p-4">
      <StatusCol
        icon={<ConnectionIcon className={`h-5 w-5 ${connectionIconClass}`} />}
        label="جودة الاتصال"
        value={connection.qualityLabel}
        detail={connection.typeLabel}
      />
      <div className="border-r border-l border-white/5">
        <StatusCol
          icon={<SecurityIcon className={`h-5 w-5 ${securityIconClass}`} />}
          label="التشفير"
          value={security.label}
        />
      </div>
      <StatusCol
        icon={<BatteryIcon className={`h-5 w-5 ${batteryIconClass}`} />}
        label="البطارية"
        value={device.label}
      />
    </div>
  );
}

function StatusCol({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className="glass flex h-9 w-9 items-center justify-center rounded-xl">{icon}</div>
      <div className="text-right">
        <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xs font-semibold leading-tight text-foreground">{value}</p>
        {detail ? <p className="text-[9px] leading-tight text-muted-foreground/80">{detail}</p> : null}
      </div>
    </div>
  );
}

function ChannelRecordingsHistoryCard() {
  const [expanded, setExpanded] = useState(false);
  const voicePlayback = useVoicePlayback();
  const visibleEntries = expanded
    ? CHANNEL_VOICE_ENTRIES
    : CHANNEL_VOICE_ENTRIES.slice(0, CONNECT_ACTIVITY_PREVIEW_LIMIT);
  const hasMore = CHANNEL_VOICE_ENTRIES.length > CONNECT_ACTIVITY_PREVIEW_LIMIT;

  if (CHANNEL_VOICE_ENTRIES.length === 0) return null;

  return (
    <div className="glass-strong mb-4 overflow-hidden rounded-3xl p-4">
      <h3 className="mb-3 text-right text-sm font-semibold text-[var(--neon-blue)]">سجل تسجيلات القناة</h3>
      <div className="space-y-3">
        {visibleEntries.map((entry) => (
          <VoiceActivityItem
            key={entry.id}
            {...entry}
            isPlaying={voicePlayback.isPlaying(entry.id)}
            progress={voicePlayback.getRowProgress(entry.id)}
            onTogglePlay={() => voicePlayback.togglePlay(entry.id, parseDurationLabelToMs(entry.duration))}
          />
        ))}
      </div>
      {hasMore ? <ShowMoreToggle expanded={expanded} onToggle={() => setExpanded((value) => !value)} /> : null}
    </div>
  );
}

function VoiceRecordingsLogPanel({ includeChannel }: { includeChannel: boolean }) {
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const [channelExpanded, setChannelExpanded] = useState(false);
  const voicePlayback = useVoicePlayback();

  const visibleMessageEntries = messagesExpanded
    ? VOICE_MESSAGE_ENTRIES
    : VOICE_MESSAGE_ENTRIES.slice(0, CONNECT_ACTIVITY_PREVIEW_LIMIT);
  const messagesHasMore = VOICE_MESSAGE_ENTRIES.length > CONNECT_ACTIVITY_PREVIEW_LIMIT;
  const messageSections = sectionTitles(visibleMessageEntries);

  const visibleChannelEntries = channelExpanded
    ? CHANNEL_VOICE_ENTRIES
    : CHANNEL_VOICE_ENTRIES.slice(0, CONNECT_ACTIVITY_PREVIEW_LIMIT);
  const channelHasMore = CHANNEL_VOICE_ENTRIES.length > CONNECT_ACTIVITY_PREVIEW_LIMIT;

  return (
    <div className="overflow-hidden rounded-3xl p-0">
      <h3 className="mb-3 text-right text-sm font-semibold text-[var(--neon-blue)]">التسجيلات الصوتية</h3>
      <div className="space-y-2">
        {messageSections.map((section) => (
          <div key={section}>
            <p className="mb-2 text-right text-[11px] font-semibold text-muted-foreground">{section}</p>
            <div className="space-y-2">
              {visibleMessageEntries
                .filter((entry) => entry.section === section)
                .map((entry) => (
                  <TimelineVoiceRow
                    key={entry.id}
                    duration={entry.duration}
                    wave={entry.wave}
                    time={entry.time}
                    avatar={entry.avatar}
                    badge={entry.badge}
                    isPlaying={voicePlayback.isPlaying(entry.id)}
                    progress={voicePlayback.getRowProgress(entry.id)}
                    onTogglePlay={() => voicePlayback.togglePlay(entry.id, parseDurationLabelToMs(entry.duration))}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      {messagesHasMore ? (
        <ShowMoreToggle expanded={messagesExpanded} onToggle={() => setMessagesExpanded((value) => !value)} />
      ) : null}

      {includeChannel ? (
        <div className="mt-4 border-t border-white/10 pt-3">
          <h3 className="mb-3 text-right text-sm font-semibold text-[var(--neon-blue)]">سجل تسجيلات القناة</h3>
      <div className="space-y-3">
            {visibleChannelEntries.map((entry) => (
              <VoiceActivityItem
                key={entry.id}
                {...entry}
                isPlaying={voicePlayback.isPlaying(entry.id)}
                progress={voicePlayback.getRowProgress(entry.id)}
                onTogglePlay={() => voicePlayback.togglePlay(entry.id, parseDurationLabelToMs(entry.duration))}
              />
            ))}
      </div>
          {channelHasMore ? (
            <ShowMoreToggle expanded={channelExpanded} onToggle={() => setChannelExpanded((value) => !value)} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function VoiceActivityItem({
  avatar,
  badge,
  wave,
  duration,
  time,
  isPlaying,
  progress,
  onTogglePlay,
}: {
  avatar: string;
  badge: "green" | "blue";
  wave: "blue" | "green" | "white";
  duration: string;
  time: string;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
}) {
  const badgeColor = badge === "green" ? "bg-neon-green" : "bg-neon-blue";
  const ringColor =
    badge === "green"
      ? "from-neon-green to-[oklch(0.82_0.22_145/0.3)]"
      : "from-[var(--neon-blue)] to-[oklch(0.72_0.18_235/0.3)]";
  const playTone =
    wave === "green"
      ? "bg-neon-green/20 text-neon-green border-neon-green/35 shadow-[0_0_12px_oklch(0.82_0.22_145/0.25)]"
      : wave === "blue"
        ? "bg-[oklch(0.72_0.18_235/0.18)] text-[var(--neon-blue)] border-[oklch(0.72_0.18_235/0.35)] shadow-[0_0_12px_oklch(0.72_0.18_235/0.2)]"
        : "bg-white/15 text-white border-white/25 shadow-[0_0_12px_rgba(255,255,255,0.12)]";

  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-3">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? `إيقاف التسجيل ${duration}` : `تشغيل التسجيل ${duration}`}
        aria-pressed={isPlaying}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
          isPlaying ? playTone : "border-transparent bg-white/5"
        }`}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current text-current" />
        ) : (
          <Play className="mr-0.5 h-4 w-4 fill-foreground/90 text-foreground/90" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <Waveform color={wave} progress={progress} />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">{time}</p>
      </div>
      <VoicePlaybackDuration duration={duration} progress={progress} isPlaying={isPlaying} />
      <div className="relative shrink-0">
        <div className={`h-11 w-11 rounded-full bg-gradient-to-br p-[2px] ${ringColor}`}>
          <img src={avatar} alt="" loading="lazy" width={88} height={88} className="h-full w-full rounded-full object-cover" />
        </div>
        <span
          className={`absolute -bottom-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0a1430] ${badgeColor}`}
        >
          <Mic className="h-2 w-2 text-[#0a1430]" strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}

function Waveform({ color, progress = 0 }: { color: "blue" | "green" | "white"; progress?: number }) {
  const bars = [4, 8, 14, 10, 18, 22, 16, 12, 20, 26, 18, 14, 22, 18, 10, 16, 24, 20, 14, 8, 16, 22, 18, 12, 8, 14, 18, 22, 16, 10, 6, 12, 18, 14, 8];
  const c =
    color === "blue" ? "var(--neon-blue)" : color === "green" ? "var(--neon-green)" : "rgba(255,255,255,0.82)";
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div className="relative h-7 overflow-hidden rounded-md" dir="ltr">
      <div className="flex h-full items-center gap-[2px]">
        {bars.map((h, i) => {
          const played = (i + 1) / bars.length <= clamped;
          return (
            <span
              key={i}
              className="w-[2px] rounded-full transition-[opacity,transform] duration-75"
              style={{
                height: `${h}px`,
                background: c,
                opacity: played ? 0.55 + h / 50 : 0.18,
                transform: played ? "scaleY(1)" : "scaleY(0.88)",
              }}
            />
          );
        })}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.45)] transition-[left] duration-75"
        style={{ left: `${clamped * 100}%` }}
      />
    </div>
  );
}
