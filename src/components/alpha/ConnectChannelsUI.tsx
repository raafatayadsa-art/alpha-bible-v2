import { useEffect, useState, type ReactNode } from "react";
import {
  Ban,
  ChevronLeft,
  Ear,
  Info,
  Lock,
  Menu,
  Mic,
  MicOff,
  PanelLeftOpen,
  Pin,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useConnectionStatus } from "@/features/alpha-connect/useConnectionStatus";
import { ConnectAudioOutputControl } from "@/components/alpha/ConnectAudioOutputControl";
import {
  type ConnectAudioOutputDevice,
  type ConnectAudioSelection,
} from "@/components/alpha/connect-audio-output";
import { AlphaIdentityRow } from "./AlphaIdentityRow";
import { AlphaPresenceDot } from "./AlphaPresenceDot";
import { AlphaShield } from "./AlphaShield";
import {
  canMemberSpeakInChannel,
  channelRoleLabel,
  getChannelState,
  resolveChannelMemberShieldRole,
  talkPermissionLabel,
  type ChannelMember,
  type ConnectTalkPermission,
} from "./connect-channel-state";
import {
  connectListChannelsForViewer,
} from "./connect-alpha-access";
import {
  getConnectChannel,
  getConnectChannelOnlineCount,
  useConnectChannels,
  type ConnectChannel,
  type ConnectChannelIcon,
  type ConnectChannelStatus,
} from "./connect-channels-registry";
import { ConnectChannelIconView } from "./ConnectChannelIconView";
import { ConnectChannelQrBadge } from "./ConnectChannelQrBadge";
import { usePresenceStoreVersion } from "@/features/alpha-connect/useAlphaPresence";
import { PRESENCE_LABELS, resolvePresenceDotForUser } from "@/features/alpha-connect/presence";
import { cn } from "@/lib/utils";
import { connectBottomSheetHostClass } from "@/features/alpha-connect/alpha-connect-layout";

export type { ConnectChannel, ConnectChannelIcon, ConnectTalkPermission };

const TALK_PERMISSION_OPTIONS: { id: ConnectTalkPermission; label: string }[] = [
  { id: "admins_only", label: talkPermissionLabel("admins_only") },
  { id: "everyone", label: talkPermissionLabel("everyone") },
];

function ChannelIcon({ icon }: { icon: ConnectChannelIcon }) {
  return <ConnectChannelIconView icon={icon} />;
}

function ChannelIconPulse({
  icon,
  size = "md",
  pulseDelay = 0,
}: {
  icon: ConnectChannelIcon;
  size?: "sm" | "md";
  pulseDelay?: number;
}) {
  const boxClass = size === "sm" ? "h-10 w-10" : "h-9 w-9";
  return (
    <div
      className={`connect-pulse-wrap connect-pulse-wrap--white flex ${boxClass} shrink-0 items-center justify-center rounded-full bg-white/[0.06]`}
      style={{ "--channel-pulse-delay": `${pulseDelay}s` } as React.CSSProperties}
    >
      <ChannelIcon icon={icon} />
    </div>
  );
}

function ParticipantRowStatus({
  member,
  talkPermission,
}: {
  member: ChannelMember;
  talkPermission: ConnectTalkPermission;
}) {
  const canSpeak = canMemberSpeakInChannel(member, talkPermission);

  return (
    <div className="connect-participant-row__status-slot">
      {member.muted ? (
        <span className="connect-participant-badge connect-participant-badge--mute" aria-label="مكتوم">
          <MicOff className="h-3 w-3" strokeWidth={2.4} />
        </span>
      ) : !member.muted && canSpeak ? (
        <span className="connect-participant-badge connect-participant-badge--speaker" aria-label="مسموح بالتحدث">
          <Ear className="h-3 w-3" strokeWidth={2.4} />
        </span>
      ) : member.blocked ? (
        <span className="connect-participant-badge connect-participant-badge--mute" aria-label="محظور">
          <Ban className="h-3 w-3" strokeWidth={2.4} />
        </span>
      ) : (
        <span className="connect-participant-row__status-empty" aria-hidden />
      )}
    </div>
  );
}

function ConnectParticipantListRow({
  participant,
  talkPermission,
  canModerate,
  onModerate,
}: {
  participant: ChannelMember;
  talkPermission: ConnectTalkPermission;
  canModerate: boolean;
  onModerate?: (member: ChannelMember) => void;
}) {
  const presence = resolvePresenceDotForUser(participant.id);
  const rankLabel = participant.role !== "member" ? channelRoleLabel(participant.role) : "عضو";
  const shieldRole = resolveChannelMemberShieldRole(participant);

  return (
    <button
      type="button"
      onClick={() => {
        if (canModerate) onModerate?.(participant);
      }}
      className={`connect-participant-row connect-participant-row--grid glass w-full rounded-2xl px-3 py-2.5 ${
        canModerate ? "active:scale-[0.99]" : ""
      }`}
    >
      <div className="connect-participant-row__avatar">
        <img
          src={participant.avatar}
          alt=""
          className={`h-10 w-10 rounded-full border object-cover ${
            participant.muted || participant.blocked ? "opacity-55" : "border-white/10"
          }`}
        />
        <AlphaPresenceDot userId={participant.id} size="xs" />
        <ParticipantStatusIcons member={participant} />
      </div>

      <div className="connect-participant-row__details">
        <p className="truncate text-[12px] font-semibold leading-tight">{participant.name}</p>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {presence ? (
            <>
              <span className="font-semibold">{PRESENCE_LABELS[presence]}</span>
              <span className="mx-1 opacity-40">·</span>
            </>
          ) : null}
          <span>{rankLabel}</span>
        </p>
      </div>

      <div className="connect-participant-row__shield">
        <AlphaShield
          role={shieldRole}
          size="sm"
          userName={participant.name}
          userAvatar={participant.avatar}
          presenceStatus={presence ?? undefined}
        />
      </div>

      <div className="connect-participant-row__status">
        <ParticipantRowStatus member={participant} talkPermission={talkPermission} />
      </div>
    </button>
  );
}

function ParticipantStatusIcons({ member }: { member: ChannelMember }) {
  if (!member.muted && !member.blocked) return null;

  return (
    <div className="absolute -left-0.5 -top-0.5 z-[2] flex flex-col gap-0.5">
      {member.muted ? (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#0a1430] bg-destructive shadow-sm">
          <MicOff className="h-2 w-2 text-white" />
        </span>
      ) : null}
      {member.blocked ? (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#0a1430] bg-destructive/90 shadow-sm">
          <Ban className="h-2 w-2 text-white" />
        </span>
      ) : null}
    </div>
  );
}

function SignalBars({ strength = 0 }: { strength?: number | null }) {
  const normalized = strength == null ? 0 : Math.max(0, Math.min(100, strength));
  const activeBars = normalized >= 75 ? 4 : normalized >= 50 ? 3 : normalized >= 25 ? 2 : normalized > 0 ? 1 : 0;
  const tone =
    normalized >= 50 ? "bg-neon-green" : normalized >= 25 ? "bg-[#F59E0B]" : normalized > 0 ? "bg-destructive" : "bg-muted-foreground/40";

  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden>
      {[3, 5, 7, 9].map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm ${i < activeBars ? tone : "bg-white/15"}`}
          style={{ height: `${h}px`, opacity: i < activeBars ? 0.45 + i * 0.15 : 0.35 }}
        />
      ))}
    </div>
  );
}

export function ConnectChannelsDrawer({
  open,
  activeChannelId,
  currentUserId,
  canCreateChannels,
  onClose,
  onSelect,
  onCreateChannel,
}: {
  open: boolean;
  activeChannelId: string;
  currentUserId: string;
  canCreateChannels: boolean;
  onClose: () => void;
  onSelect: (channelId: string) => void;
  onCreateChannel: () => void;
}) {
  useConnectChannels();
  const channels = connectListChannelsForViewer(currentUserId);
  const [query, setQuery] = useState("");

  if (!open) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? channels.filter((channel) => channel.name.toLowerCase().includes(normalizedQuery))
    : channels;
  const favorites = filtered.filter((channel) => channel.favorite);
  const others = filtered.filter((channel) => !channel.favorite);

  return (
    <div className="fixed inset-0 z-[60]" data-alpha-connect-drawer>
      <button type="button" aria-label="إغلاق قائمة القنوات" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        dir="rtl"
        className="connect-channels-drawer absolute inset-y-0 left-0 flex h-full w-[min(100%,340px)] flex-col glass-strong shadow-[8px_0_40px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
          <div className="min-w-0 flex-1 text-right">
            <h2 className="text-[20px] font-bold leading-tight">القنوات</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">تواصل صوتي فوري مع مجموعتك</p>
          </div>
          <button
            type="button"
            aria-label="معلومات القنوات"
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neon-green"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 px-3 py-2.5">
          <label className="glass flex items-center gap-2 rounded-2xl px-3 py-2" dir="rtl">
            <Search className="connect-accent-icon h-3.5 w-3.5 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في القنوات"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-y-contain px-3 py-3">
          {favorites.length > 0 ? (
            <ChannelListSection title="القنوات المفضلة" icon={<Pin className="h-3.5 w-3.5 text-neon-green" />}>
              {favorites.map((channel) => (
                <ChannelListRow
                  key={channel.id}
                  channel={channel}
                  selected={channel.id === activeChannelId}
                  onSelect={() => {
                    onSelect(channel.id);
                    onClose();
                  }}
                />
              ))}
            </ChannelListSection>
          ) : null}

          {favorites.length > 0 && others.length > 0 ? <div className="my-4 border-t border-white/10" /> : null}
          {others.length > 0 ? (
            <>
              {!normalizedQuery ? (
                <p className="mb-3 text-center text-[11px] font-medium text-muted-foreground">كل القنوات</p>
              ) : null}
              <div className="space-y-2">
                {others.map((channel) => (
                  <ChannelListRow
                    key={channel.id}
                    channel={channel}
                    selected={channel.id === activeChannelId}
                    onSelect={() => {
                      onSelect(channel.id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[11px] text-muted-foreground">لا توجد قنوات مطابقة</p>
          ) : null}
        </div>

        <div className="border-t border-white/10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {canCreateChannels ? (
            <button
              type="button"
              onClick={onCreateChannel}
              className="glass flex w-full items-center justify-center gap-2 rounded-2xl border border-neon-green/30 py-3.5 text-[13px] font-semibold text-neon-green transition-transform active:scale-[0.99]"
            >
              <span className="text-base leading-none">+</span>
              إنشاء قناة جديدة
            </button>
          ) : (
            <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
              إنشاء القنوات متاح لحاملي درع الكاهن أو الخادم أو Alpha فقط
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelListSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-end gap-1.5">
        {icon}
        <p className="text-[12px] font-semibold text-neon-green">{title}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ChannelListRow({
  channel,
  selected,
  onSelect,
}: {
  channel: ConnectChannel;
  selected: boolean;
  onSelect: () => void;
}) {
  usePresenceStoreVersion();
  const connection = useConnectionStatus();

  return (
    <button
      type="button"
      dir="rtl"
      onClick={onSelect}
      className={`glass flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-colors active:scale-[0.99] ${
        selected ? "border border-neon-green/45 shadow-[0_0_16px_oklch(0.82_0.22_145/0.12)]" : "border border-transparent"
      }`}
    >
      <ChannelIconPulse icon={channel.icon} size="sm" />
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-[13px] font-semibold">{channel.name}</p>
        <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 shrink-0 text-neon-green" />
            <span>{getConnectChannelOnlineCount(channel.id)} متصل الآن</span>
          </span>
        </p>
      </div>
      <SignalBars strength={connection.signalStrength} />
    </button>
  );
}

export function ConnectChannelHeader({
  channel,
  adminName,
  memberCount,
  channelStatus = "active",
}: {
  channel: ConnectChannel;
  adminName: string;
  memberCount: number;
  channelStatus?: ConnectChannelStatus;
}) {
  const isSuspended = channelStatus === "suspended";
  const topic = channel.topic?.trim();
  const [qrCopied, setQrCopied] = useState(false);

  return (
    <>
      <div className={`glass-strong mb-4 rounded-2xl px-3 py-2.5 ${isSuspended ? "border border-white/15 opacity-90" : ""}`} dir="rtl">
        {isSuspended ? (
          <p className="mb-1.5 rounded-lg bg-white/5 px-2 py-1 text-center text-[10px] font-medium text-muted-foreground">
            قناة غير مفعلة — مرئية للمسؤولين فقط
          </p>
        ) : null}
        <div className="flex items-start gap-2.5">
          <div className="flex min-w-0 flex-1 items-start gap-2" dir="rtl">
            <ChannelIconPulse icon={channel.icon} />
            <div className="min-w-0 flex-1 text-right">
              <h2 className="truncate text-[15px] font-bold leading-tight">{channel.name}</h2>
              <p className="mt-0.5 truncate text-[10px]">
                مسؤول: <span className="font-semibold text-destructive">{adminName}</span>
              </p>
              <p className="mt-0.5 w-full text-right text-[10px] font-medium text-neon-green">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>{memberCount} عضو</span>
                </span>
              </p>
              {topic ? (
                <p className="mt-1.5 line-clamp-2 border-t border-white/10 pt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                  {topic}
                </p>
              ) : null}
            </div>
          </div>
          <ConnectChannelQrBadge
            channelId={channel.id}
            onCopied={() => {
              setQrCopied(true);
              window.setTimeout(() => setQrCopied(false), 2000);
            }}
          />
        </div>
      </div>
      {qrCopied ? (
        <p className="relative -mt-3 mb-4 text-center text-[9px] font-semibold text-neon-green">
          تم نسخ الرابط
        </p>
      ) : null}
    </>
  );
}

export function ConnectChannelParticipants({
  members,
  onlineCount,
  onModerate,
  onViewAll,
  canModerate,
}: {
  members: ChannelMember[];
  onlineCount: number;
  canModerate: boolean;
  onModerate?: (member: ChannelMember) => void;
  onViewAll?: () => void;
}) {
  const visible = members.filter((member) => !member.blocked);

  return (
    <div className="glass-strong mb-2.5 rounded-2xl px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <button type="button" onClick={onViewAll} className="text-[10px] font-medium text-neon-green active:opacity-80">
          عرض الكل
        </button>
        <p className="text-[11px] font-semibold">المشاركون ({onlineCount})</p>
      </div>
      <div
        className="flex items-start justify-start gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        dir="rtl"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {visible.map((participant) => (
          <button
            key={participant.id}
            type="button"
            onClick={() => (canModerate ? onModerate?.(participant) : undefined)}
            className={`w-[68px] shrink-0 ${canModerate ? "active:scale-95" : ""}`}
          >
            <AlphaIdentityRow
              variant="stacked"
              name={participant.name}
              role={resolveChannelMemberShieldRole(participant)}
              avatar={participant.avatar}
              avatarSize="sm"
              presenceUserId={participant.id}
              avatarOverlay={<ParticipantStatusIcons member={participant} />}
              nameClassName="text-[10px] leading-tight"
              meta={
                participant.role !== "member" ? (
                  <span className="rounded-full bg-neon-green/15 px-1 py-0.5 text-[7px] font-bold text-neon-green">
                    {channelRoleLabel(participant.role)}
                  </span>
                ) : null
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConnectParticipantsDrawer({
  open,
  members,
  onlineCount,
  talkPermission = "admins_only",
  onClose,
  onModerate,
  canModerate,
}: {
  open: boolean;
  members: ChannelMember[];
  onlineCount: number;
  talkPermission?: ConnectTalkPermission;
  onClose: () => void;
  canModerate: boolean;
  onModerate?: (member: ChannelMember) => void;
}) {
  const [query, setQuery] = useState("");
  usePresenceStoreVersion();

  if (!open) return null;

  const visible = members.filter((member) => !member.blocked);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? visible.filter((member) => member.name.toLowerCase().includes(normalizedQuery))
    : visible;

  return (
    <div className="fixed inset-0 z-[60]" data-alpha-connect-drawer>
      <button type="button" aria-label="إغلاق قائمة المشاركين" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        dir="rtl"
        className="connect-participants-drawer absolute inset-y-0 right-0 flex h-full w-[min(100%,340px)] flex-col glass-strong shadow-[-8px_0_40px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="text-[20px] font-bold leading-tight">المشاركون</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">متصل الآن ({onlineCount})</p>
          </div>
          <span className="h-9 w-9 shrink-0" aria-hidden />
        </div>

        <div className="border-b border-white/10 px-3 py-2.5">
          <label className="glass flex items-center gap-2 rounded-2xl px-3 py-2" dir="rtl">
            <Search className="connect-accent-icon h-3.5 w-3.5 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في المشاركين"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto overscroll-y-contain px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {filtered.map((participant) => (
              <ConnectParticipantListRow
                key={participant.id}
                participant={participant}
                talkPermission={talkPermission}
                canModerate={canModerate}
                onModerate={onModerate}
              />
            ))}

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[11px] text-muted-foreground">لا يوجد مشاركون مطابقون</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use ConnectParticipantsDrawer */
export function ConnectChannelMembersSheet({
  open,
  members,
  onClose,
  onModerate,
  canModerate,
}: {
  open: boolean;
  members: ChannelMember[];
  onClose: () => void;
  canModerate: boolean;
  onModerate?: (member: ChannelMember) => void;
}) {
  return (
    <ConnectParticipantsDrawer
      open={open}
      members={members}
      onlineCount={members.filter((member) => !member.blocked).length}
      onClose={onClose}
      onModerate={onModerate}
      canModerate={canModerate}
    />
  );
}

export function ConnectChannelPttFrame({ children }: { children: ReactNode }) {
  return (
    <div className="glass-strong relative mb-3 overflow-hidden rounded-3xl px-4 pb-4 pt-3">
      <div className="mb-1 flex items-center justify-between">
        <button
          type="button"
          aria-label="معلومات التحدث"
          className="glass flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
        <p className="connect-accent-icon text-[12px] font-medium">اضغط مطولاً للتحدث</p>
      </div>
      {children}
    </div>
  );
}

export function ConnectChannelTalkPermission({
  value,
  onChange,
  canEdit,
}: {
  value: ConnectTalkPermission;
  onChange: (value: ConnectTalkPermission) => void;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value === "super_admin_only" ? "admins_only" : value;
  const label = TALK_PERMISSION_OPTIONS.find((option) => option.id === normalizedValue)?.label ?? talkPermissionLabel(value);

  return (
    <div className="relative mb-3">
      <button
        type="button"
        onClick={() => (canEdit ? setOpen((current) => !current) : undefined)}
        className={`glass flex w-full items-center gap-2.5 rounded-2xl px-3 py-3 text-right ${canEdit ? "active:scale-[0.99]" : "opacity-90"}`}
      >
        <ChevronLeft className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "-rotate-90" : ""}`} />
        <p className="min-w-0 flex-1 text-[11px] text-muted-foreground">
          السماح للتحدث: <span className="font-semibold text-foreground">{label}</span>
          {!canEdit ? <span className="mr-1 text-[10px]"> (للمسؤولين فقط)</span> : null}
        </p>
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && canEdit ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1430]/95 shadow-xl backdrop-blur-md">
          {TALK_PERMISSION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`flex w-full px-3 py-2.5 text-right text-[12px] transition-colors hover:bg-white/5 ${
                option.id === normalizedValue ? "font-semibold text-neon-green" : "text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ConnectChannelActionBar({
  muted,
  onToggleMute,
  audioSelection,
  audioDevices,
  audioPickerOpen,
  onOpenAudioPicker,
  onCloseAudioPicker,
  onSelectAudioDevice,
  onInvite,
  onChannelSettings,
  canOpenSettings,
}: {
  muted: boolean;
  onToggleMute: () => void;
  audioSelection: ConnectAudioSelection;
  audioDevices: ConnectAudioOutputDevice[];
  audioPickerOpen: boolean;
  onOpenAudioPicker: () => void;
  onCloseAudioPicker: () => void;
  onSelectAudioDevice: (deviceId: string) => void;
  onInvite: () => void;
  onChannelSettings: () => void;
  canOpenSettings: boolean;
}) {
  type ActionTone = "mute" | "record" | "invite" | "settings";

  const actions: Array<{
    key: string;
    label: string;
    tone: ActionTone;
    onClick: () => void;
    toggled?: boolean;
    soon?: boolean;
    record?: boolean;
    icon?: typeof Mic;
  }> = [
    {
      key: "mute",
      label: "كتم الصوت",
      tone: "mute",
      icon: muted ? MicOff : Mic,
      toggled: muted,
      onClick: onToggleMute,
    },
    { key: "record", label: "تسجيل", tone: "record", record: true, soon: true, onClick: () => undefined },
    { key: "invite", label: "دعوة", tone: "invite", icon: UserPlus, onClick: onInvite },
    ...(canOpenSettings
      ? [{ key: "settings", label: "إعدادات القناة", tone: "settings" as const, icon: Settings, onClick: onChannelSettings }]
      : []),
  ];

  const gridCols = canOpenSettings ? "grid-cols-5" : "grid-cols-4";
  const muteAction = actions[0];
  const MuteIcon = muteAction.icon;

  return (
    <div className={`glass-strong connect-channel-action-bar mb-4 grid ${gridCols} gap-1 rounded-3xl px-2 py-3`} dir="rtl">
      <button
        type="button"
        onClick={muteAction.onClick}
        className={cn(
          "connect-action-bar-btn relative flex flex-col items-center gap-1.5 rounded-xl px-1 py-1",
          "connect-action-bar-btn--mute",
          muteAction.toggled && "connect-action-bar-btn--on",
        )}
      >
        <span className="connect-action-bar-btn__ring glass flex h-10 w-10 items-center justify-center rounded-full">
          {MuteIcon ? <MuteIcon className="connect-action-bar-btn__icon h-4 w-4" strokeWidth={2.1} /> : null}
        </span>
        <span className="connect-action-bar-btn__label text-center text-[9px] leading-tight text-muted-foreground">
          {muteAction.label}
        </span>
      </button>

      <ConnectAudioOutputControl
        selection={audioSelection}
        devices={audioDevices}
        pickerOpen={audioPickerOpen}
        onOpenPicker={onOpenAudioPicker}
        onClosePicker={onCloseAudioPicker}
        onSelectDevice={onSelectAudioDevice}
        variant="action-bar"
        pickerAlign="center"
      />

      {actions.slice(1).map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            disabled={action.soon}
            className={cn(
              "connect-action-bar-btn relative flex flex-col items-center gap-1.5 rounded-xl px-1 py-1 disabled:opacity-80",
              `connect-action-bar-btn--${action.tone}`,
              action.toggled && "connect-action-bar-btn--on",
              action.soon && "connect-action-bar-btn--soon",
            )}
          >
            {action.soon ? (
              <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[7px] font-bold text-[#0a1430]" style={{ background: "oklch(0.78 0.16 75)" }}>
                قريباً
              </span>
            ) : null}
            <span className="connect-action-bar-btn__ring glass flex h-10 w-10 items-center justify-center rounded-full">
              {action.record ? (
                <span className="connect-action-bar-btn__record-dot h-3.5 w-3.5 rounded-full bg-destructive/70" />
              ) : Icon ? (
                <Icon className="connect-action-bar-btn__icon h-4 w-4" strokeWidth={2.1} />
              ) : null}
            </span>
            <span className="connect-action-bar-btn__label text-center text-[9px] leading-tight text-muted-foreground">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ConnectChannelsHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="فتح قائمة القنوات"
      className="glass flex h-11 min-w-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/10 px-2 text-foreground/80 active:scale-95"
    >
      <Menu className="connect-accent-icon h-4 w-4" />
      <span className="connect-accent-icon text-[8px] font-semibold">القنوات</span>
    </button>
  );
}

export function ConnectParticipantsHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="فتح قائمة المشاركين"
      className="glass flex h-11 min-w-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/10 px-2 text-foreground/80 active:scale-95"
    >
      <Users className="connect-accent-icon h-4 w-4" />
      <span className="connect-accent-icon text-[8px] font-semibold">المشاركون</span>
    </button>
  );
}

export function ConnectChannelEdgeGestures({
  enabled,
  channelsOpen,
  participantsOpen,
  onOpenChannels,
  onOpenParticipants,
  onCloseChannels,
  onCloseParticipants,
}: {
  enabled: boolean;
  channelsOpen: boolean;
  participantsOpen: boolean;
  onOpenChannels: () => void;
  onOpenParticipants: () => void;
  onCloseChannels: () => void;
  onCloseParticipants: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;

    const EDGE = 28;
    const TRIGGER = 64;
    const MAX_DRIFT = 56;
    let active: { x: number; y: number; mode: "open-channels" | "open-participants" | "close-channels" | "close-participants" } | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target;
      if (target instanceof Element && target.closest(".connect-channels-drawer, .connect-participants-drawer")) {
        return;
      }

      const x = event.clientX;
      const y = event.clientY;
      const width = window.innerWidth;

      if (channelsOpen) {
        active = { x, y, mode: "close-channels" };
        return;
      }
      if (participantsOpen) {
        active = { x, y, mode: "close-participants" };
        return;
      }

      if (x <= EDGE) active = { x, y, mode: "open-channels" };
      else if (x >= width - EDGE) active = { x, y, mode: "open-participants" };
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!active) return;
      const dx = event.clientX - active.x;
      const dy = Math.abs(event.clientY - active.y);
      const gesture = active.mode;
      active = null;
      if (dy > MAX_DRIFT) return;

      if (gesture === "open-channels" && dx > TRIGGER) onOpenChannels();
      if (gesture === "open-participants" && dx < -TRIGGER) onOpenParticipants();
      if (gesture === "close-channels" && dx < -TRIGGER) onCloseChannels();
      if (gesture === "close-participants" && dx > TRIGGER) onCloseParticipants();
    };

    const onPointerCancel = () => {
      active = null;
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [
    enabled,
    channelsOpen,
    participantsOpen,
    onOpenChannels,
    onOpenParticipants,
    onCloseChannels,
    onCloseParticipants,
  ]);

  return null;
}

export function ConnectChannelsMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="فتح قائمة القنوات"
      className="glass flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/10 text-foreground/80 active:scale-95"
    >
      <PanelLeftOpen className="h-4 w-4 text-neon-green" />
      <span className="h-[2px] w-4 rounded-full bg-neon-green/70" />
    </button>
  );
}

export function ConnectChannelModerationSheet({
  open,
  member,
  onClose,
  onAction,
}: {
  open: boolean;
  member: ChannelMember | null;
  onClose: () => void;
  onAction: (action: "kick" | "mute" | "block") => void;
}) {
  if (!open || !member) return null;

  return (
    <div className={`${connectBottomSheetHostClass()} z-[60]`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div dir="rtl" className="relative w-full max-w-[var(--alpha-content-narrow-width)] glass-strong rounded-t-3xl p-4 pb-[max(16px,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3 text-center text-sm font-semibold">إدارة {member.name}</p>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => onAction("mute")} className="glass rounded-2xl py-3 text-[12px] font-medium">
            {member.muted ? "إلغاء كتم" : "كتم"}
          </button>
          <button type="button" onClick={() => onAction("block")} className="glass rounded-2xl py-3 text-[12px] font-medium">
            {member.blocked ? "إلغاء حظر" : "حظر"}
          </button>
          <button type="button" onClick={() => onAction("kick")} className="rounded-2xl bg-destructive/15 py-3 text-[12px] font-medium text-destructive">
            طرد
          </button>
        </div>
      </div>
    </div>
  );
}

export { getConnectChannel, useConnectChannels, type ConnectChannelStatus } from "./connect-channels-registry";
