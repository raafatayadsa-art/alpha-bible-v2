import { useCallback, useState } from "react";
import {
  ArrowLeft,
  Ban,
  ChevronLeft,
  Crown,
  Lock,
  MicOff,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlphaIdentityRow } from "./AlphaIdentityRow";
import { PRESENCE_LABELS, resolvePresenceDotForUser } from "@/features/alpha-connect/presence";
import {
  channelRoleLabel,
  getChannelState,
  moderateChannelMember,
  patchChannelSettings,
  promoteChannelMember,
  removeChannelAdmin,
  resolveChannelMemberShieldRole,
  talkPermissionLabel,
  type ChannelMember,
  type ChannelModerationAction,
  type ChannelSettings,
  type ConnectTalkPermission,
  type ChannelInvitePolicy,
} from "./connect-channel-state";
import {
  connectViewerCanDeleteChannel,
  connectViewerCanManageAdmins,
  connectViewerCanManageChannel,
  connectViewerCanManageLifecycle,
  viewerHasAlphaOfficialShield,
} from "./connect-alpha-access";
import {
  deleteConnectChannel,
  getConnectChannelStatus,
  reactivateConnectChannel,
  suspendConnectChannel,
} from "./connect-channels-registry";
import { conversations } from "./messaging-data";

type ConnectChannelSettingsProps = {
  channelId: string;
  channelName: string;
  currentUserId: string;
  onBack: () => void;
  onToast: (message: string) => void;
  onChannelLifecycleChange?: () => void;
  onChannelDeleted?: () => void;
};

function SettingsToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="connect-settings-switch connect-settings-pressable flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-right transition-all active:scale-[0.99]"
    >
      <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="connect-settings-switch-label text-[13px] font-medium">{label}</span>
          <span className="connect-settings-switch-badge shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold">
            {checked ? "مفعّل" : "معطّل"}
          </span>
        </div>
        {hint ? <p className="text-right text-[10px] text-muted-foreground">{hint}</p> : null}
      </div>
      <span className="connect-settings-switch-track relative h-7 w-[52px] shrink-0 rounded-full border transition-all">
        <span className="connect-settings-switch-thumb absolute top-0.5 h-6 w-6 rounded-full shadow-md transition-all" />
      </span>
    </button>
  );
}

function SettingsSelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.id === value)?.label ?? "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="glass flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-right active:scale-[0.99]"
      >
        <ChevronLeft className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "-rotate-90" : ""}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-[12px] font-semibold">{current}</p>
        </div>
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1430]/95 shadow-xl backdrop-blur-md">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`flex w-full px-3 py-2.5 text-right text-[12px] hover:bg-white/5 ${
                option.id === value ? "font-semibold text-neon-green" : "text-foreground"
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

function MemberModerationRow({
  member,
  canManageAdmins,
  isAdminViewer,
  alphaSupreme,
  onAction,
}: {
  member: ChannelMember;
  canManageAdmins: boolean;
  isAdminViewer: boolean;
  alphaSupreme: boolean;
  onAction: (action: ChannelModerationAction | "promote_admin" | "promote_super_admin" | "demote") => void;
}) {
  const [promoteOpen, setPromoteOpen] = useState(false);
  const showModeration = isAdminViewer && (alphaSupreme || member.role !== "super_admin");

  return (
    <div className={`glass relative rounded-2xl px-3 py-2 ${promoteOpen ? "z-30" : ""}`}>
      <AlphaIdentityRow
        className="gap-2"
        name={member.name}
        role={resolveChannelMemberShieldRole(member)}
        avatar={member.avatar}
        avatarSize="xs"
        presenceUserId={member.id}
        nameClassName="text-[12px] font-semibold leading-tight"
        meta={<p className="text-[10px] text-neon-green">{channelRoleLabel(member.role)}</p>}
        trailing={
          <>
            {canManageAdmins && member.role === "member" && isAdminViewer ? (
              <div className="relative z-40 shrink-0">
                <button
                  type="button"
                  onClick={() => setPromoteOpen((current) => !current)}
                  className="glass rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-neon-green active:scale-95"
                >
                  ترقية
                </button>
                {promoteOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="إغلاق قائمة الترقية"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setPromoteOpen(false)}
                    />
                    <div className="absolute bottom-[calc(100%+4px)] left-0 z-50 min-w-[108px] overflow-hidden rounded-xl border border-white/10 bg-[#0a1430] shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md">
                      <button
                        type="button"
                        onClick={() => {
                          onAction("promote_admin");
                          setPromoteOpen(false);
                        }}
                        className="flex w-full px-2.5 py-2 text-right text-[11px] hover:bg-white/5"
                      >
                        أدمن
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAction("promote_super_admin");
                          setPromoteOpen(false);
                        }}
                        className="flex w-full px-2.5 py-2 text-right text-[11px] font-semibold text-neon-green hover:bg-white/5"
                      >
                        سوبر أدمن
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            {canManageAdmins && member.role === "admin" && isAdminViewer ? (
              <button
                type="button"
                onClick={() => onAction("demote")}
                className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium active:scale-95"
              >
                إزالة أدمن
              </button>
            ) : null}
            {member.muted ? <MicOff className="h-3.5 w-3.5 shrink-0 text-destructive" /> : null}
            {member.blocked ? <Ban className="h-3.5 w-3.5 shrink-0 text-destructive" /> : null}
          </>
        }
      />
      {showModeration ? (
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          <button type="button" onClick={() => onAction("mute")} className="rounded-lg bg-white/5 py-1.5 text-[10px] font-medium">
            {member.muted ? "إلغاء كتم" : "كتم"}
          </button>
          <button type="button" onClick={() => onAction("block")} className="rounded-lg bg-white/5 py-1.5 text-[10px] font-medium">
            {member.blocked ? "إلغاء حظر" : "حظر"}
          </button>
          <button type="button" onClick={() => onAction("kick")} className="rounded-lg bg-destructive/10 py-1.5 text-[10px] font-medium text-destructive">
            طرد
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ConnectChannelSettings({
  channelId,
  channelName,
  currentUserId,
  onBack,
  onToast,
  onChannelLifecycleChange,
  onChannelDeleted,
}: ConnectChannelSettingsProps) {
  const [tick, setTick] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const refresh = useCallback(() => setTick((value) => value + 1), []);
  void tick;

  const state = getChannelState(channelId);
  const canEdit = connectViewerCanManageChannel(channelId, currentUserId);
  const canManageAdminRoles = connectViewerCanManageAdmins(channelId, currentUserId, state.creatorId);
  const canManageLifecycle = connectViewerCanManageLifecycle(channelId, currentUserId);
  const canDelete = connectViewerCanDeleteChannel(channelId, currentUserId);
  const alphaSupreme = viewerHasAlphaOfficialShield(currentUserId);
  const channelStatus = getConnectChannelStatus(channelId);
  const settings = state.settings;

  const updateSettings = (patch: Partial<ChannelSettings>) => {
    if (!canEdit) {
      onToast("لا تملك صلاحية تعديل إعدادات القناة");
      return;
    }
    patchChannelSettings(channelId, patch);
    refresh();
    onToast("تم حفظ إعدادات القناة");
  };

  const handleMemberAction = (
    member: ChannelMember,
    action: ChannelModerationAction | "promote_admin" | "promote_super_admin" | "demote",
  ) => {
    if (action === "promote_admin") {
      const error = promoteChannelMember(channelId, member.id, "admin", currentUserId);
      onToast(error ?? `تمت ترقية ${member.name} إلى أدمن`);
    } else if (action === "promote_super_admin") {
      const error = promoteChannelMember(channelId, member.id, "super_admin", currentUserId);
      onToast(error ?? `تمت ترقية ${member.name} إلى سوبر أدمن`);
    } else if (action === "demote") {
      const error = removeChannelAdmin(channelId, member.id, currentUserId);
      onToast(error ?? `تمت إزالة ${member.name} من الأدمن`);
    } else {
      const error = moderateChannelMember(channelId, member.id, action, currentUserId);
      const labels: Record<ChannelModerationAction, string> = {
        kick: "تم طرد",
        mute: member.muted ? "تم إلغاء الكتم" : "تم الكتم",
        block: member.blocked ? "تم إلغاء الحظر" : "تم الحظر",
      };
      onToast(error ?? `${labels[action]} ${member.name}`);
    }
    refresh();
  };

  const promotableContacts = conversations
    .filter((contact) => contact.kind === "private")
    .filter((contact) => !state.members.some((member) => member.id === contact.id));

  const handleDeleteChannelConfirmed = () => {
    const error = deleteConnectChannel(channelId, currentUserId);
    if (error) {
      onToast(error);
      setDeleteConfirmOpen(false);
      return;
    }
    setDeleteConfirmOpen(false);
    onToast("تم حذف القناة وبياناتها");
    onChannelDeleted?.();
  };

  return (
    <>
    <div className="connect-settings-screen mx-auto w-full max-w-[430px] px-5 pb-10">
      <div className="mb-5 flex items-center justify-between pt-[max(env(safe-area-inset-top),14px)]">
        <button type="button" onClick={onBack} className="glass flex h-11 w-11 items-center justify-center rounded-2xl">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-[16px] font-bold">إعدادات القناة</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{channelName}</p>
        </div>
        <span className="h-11 w-11" />
      </div>

      <div className="space-y-4">
        <section>
          <p className="mb-2 text-right text-[11px] font-semibold text-neon-green">الصلاحيات والتحدث</p>
          <div className="space-y-2">
            <SettingsSelectRow
              label="من يستطيع التحدث في القناة"
              value={settings.talkPermission === "super_admin_only" ? "admins_only" : settings.talkPermission}
              options={[
                { id: "admins_only", label: talkPermissionLabel("admins_only") },
                { id: "everyone", label: talkPermissionLabel("everyone") },
              ]}
              onChange={(value) => updateSettings({ talkPermission: value as ConnectTalkPermission })}
            />
            <SettingsSelectRow
              label="من يستطيع دعوة أعضاء"
              value={settings.invitePolicy}
              options={[
                { id: "admins_only", label: "المسؤولون فقط" },
                { id: "everyone", label: "جميع الأعضاء" },
              ]}
              onChange={(value) => updateSettings({ invitePolicy: value as ChannelInvitePolicy })}
            />
            <SettingsToggle
              label="PTT فقط في القناة"
              hint="إلغاء المكالمات المفتوحة — ضغط مطول للتحدث"
              checked={settings.pttOnly}
              onChange={(value) => updateSettings({ pttOnly: value })}
            />
            <SettingsSelectRow
              label="الوضع البطيء بين الرسائل الصوتية"
              value={String(settings.slowModeSec) as "0" | "3" | "5" | "10"}
              options={[
                { id: "0", label: "معطّل" },
                { id: "3", label: "3 ثوانٍ" },
                { id: "5", label: "5 ثوانٍ" },
                { id: "10", label: "10 ثوانٍ" },
              ]}
              onChange={(value) => updateSettings({ slowModeSec: Number(value) })}
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-right text-[11px] font-semibold text-neon-green">الانضمام والعضوية</p>
          <div className="space-y-2">
            <SettingsToggle
              label="موافقة قبل الانضمام"
              hint="يحتاج العضو الجديد موافقة أدمن"
              checked={settings.joinApproval}
              onChange={(value) => updateSettings({ joinApproval: value })}
            />
            <SettingsSelectRow
              label="الحد الأقصى للأعضاء"
              value={String(settings.maxParticipants) as "25" | "50" | "100"}
              options={[
                { id: "25", label: "25 عضو" },
                { id: "50", label: "50 عضو" },
                { id: "100", label: "100 عضو" },
              ]}
              onChange={(value) => updateSettings({ maxParticipants: Number(value) })}
            />
            <SettingsToggle
              label="إشعار عند انضمام عضو"
              checked={settings.notifyOnJoin}
              onChange={(value) => updateSettings({ notifyOnJoin: value })}
            />
            <SettingsToggle
              label="تثبيت القناة في المفضلة"
              checked={settings.pinned}
              onChange={(value) => updateSettings({ pinned: value })}
            />
          </div>
        </section>

        {canManageAdminRoles ? (
          <section>
            <p className="mb-2 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-neon-green">
              <Crown className="h-3.5 w-3.5" />
              إدارة الأدمن (منشئ القناة وسوبر أدمن)
            </p>
            <div className="space-y-2">
              {promotableContacts.slice(0, 3).map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => {
                    const stateNow = getChannelState(channelId);
                    stateNow.members.push({
                      id: contact.id,
                      name: contact.name,
                      avatar: contact.avatar,
                      role: "admin",
                    });
                    saveChannelState(channelId, stateNow);
                    refresh();
                    onToast(`تمت إضافة ${contact.name} كأدمن`);
                  }}
                  className="glass flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right active:scale-[0.99]"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-neon-green" />
                  <span className="flex-1 text-[12px]">إضافة {contact.name} كأدمن</span>
                  <img src={contact.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <p className="mb-2 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-neon-green">
            <Users className="h-3.5 w-3.5" />
            الأعضاء والإشراف
          </p>
          <div className="relative space-y-2 overflow-visible">
            {state.members.map((member) => (
              <MemberModerationRow
                key={member.id}
                member={member}
                canManageAdmins={canManageAdminRoles}
                isAdminViewer={canEdit}
                alphaSupreme={alphaSupreme}
                onAction={(action) => handleMemberAction(member, action)}
              />
            ))}
          </div>
        </section>

        {canManageLifecycle ? (
          <section>
            <p className="mb-2 text-right text-[11px] font-semibold text-neon-green">إدارة القناة</p>
            <div className="space-y-2">
              {channelStatus === "active" ? (
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "هل تريد تعطيل القناة؟\n\nسيتم إخراج جميع المشاركين فوراً وتختفي القناة عنهم حتى إعادة التفعيل.",
                    );
                    if (!confirmed) return;
                    const error = suspendConnectChannel(channelId, currentUserId);
                    if (error) {
                      onToast(error);
                      return;
                    }
                    onToast("تم تعطيل القناة — تم إخراج جميع المشاركين");
                    onChannelLifecycleChange?.();
                    refresh();
                  }}
                  className="glass flex w-full items-center justify-end gap-2 rounded-2xl px-3 py-3 text-right active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">تعطيل القناة مؤقتاً</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">تختفي عن الأعضاء وتظهر للمسؤولين فقط</p>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const error = reactivateConnectChannel(channelId, currentUserId);
                    if (error) {
                      onToast(error);
                      return;
                    }
                    onToast("تم تفعيل القناة");
                    onChannelLifecycleChange?.();
                    refresh();
                  }}
                  className="glass flex w-full items-center justify-end gap-2 rounded-2xl border border-neon-green/30 px-3 py-3 text-right active:scale-[0.99]"
                >
                  <Lock className="h-4 w-4 text-neon-green" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-neon-green">تفعيل القناة</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">القناة حالياً غير مفعلة</p>
                  </div>
                </button>
              )}

              {canDelete ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="glass flex w-full items-center justify-end gap-2 rounded-2xl px-3 py-3 text-right active:scale-[0.99]"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-destructive">حذف القناة نهائياً</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">يمسح القناة والبيانات من النظام</p>
                  </div>
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="glass rounded-2xl px-3 py-3 text-right">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-green" />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              إعدادات القناة منفصلة عن إعدادات Alpha Connect العامة. الأمان والتشفير وخصوصية الحساب تبقى في الإعدادات
              العامة.
            </p>
          </div>
        </section>
      </div>
    </div>

      {deleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 backdrop-blur-[4px]"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div
            dir="rtl"
            className="w-[88%] max-w-[300px] overflow-hidden rounded-[28px] border border-white/20 bg-white/96 px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex justify-center">
              <div className="grid size-10 place-items-center rounded-full bg-[#FEE2E2]">
                <Trash2 className="size-[18px] text-[#B91C1C]" />
              </div>
            </div>
            <p className="mb-1 text-center text-[13px] font-bold text-[#1F2937]">حذف القناة نهائياً؟</p>
            <p className="mb-4 text-center text-[10px] text-[#6B7280]">
              سيتم مسح القناة وجميع بياناتها من النظام ولا يمكن التراجع.
            </p>
            <div className="flex gap-2.5">
              <Button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                variant="ghost"
                className="h-10 flex-1 rounded-2xl border border-[#E5E7EB] bg-white/80 text-[12px] text-[#374151]"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleDeleteChannelConfirmed}
                variant="ghost"
                className="h-10 flex-1 rounded-2xl bg-[#FEE2E2] text-[12px] font-bold text-[#B91C1C]"
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ConnectChannelInviteSheet({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (contactIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  if (!open) return null;

  const contacts = conversations.filter((contact) => contact.kind === "private");

  const toggle = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        dir="rtl"
        className="relative w-full max-w-[430px] glass-strong rounded-t-3xl pb-[max(16px,env(safe-area-inset-bottom))] pt-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <p className="mb-3 text-center text-sm font-semibold">دعوة أعضاء للقناة</p>
        <div className="max-h-[min(55dvh,400px)] space-y-2 overflow-y-auto px-3">
          {contacts.map((contact) => {
            const checked = selected.includes(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => toggle(contact.id)}
                className={`w-full rounded-2xl px-3 py-3 active:scale-[0.99] ${
                  checked ? "glass border border-neon-green/40 bg-neon-green/10" : "glass"
                }`}
              >
                <AlphaIdentityRow
                  name={contact.name}
                  role={contact.role}
                  avatar={contact.avatar}
                  avatarSize="sm"
                  presenceUserId={contact.id}
                  nameClassName="text-[13px] font-semibold"
                  meta={
                    (() => {
                      const visibleStatus = resolvePresenceDotForUser(contact.id);
                      return visibleStatus ? (
                        <p className="text-[10px] text-neon-green">{PRESENCE_LABELS[visibleStatus]}</p>
                      ) : null;
                    })()
                  }
                  trailing={
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        checked ? "border-neon-green bg-neon-green text-[#0a1430]" : "border-white/20"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </span>
                  }
                />
              </button>
            );
          })}
        </div>
        <div className="mt-3 px-3">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => {
              onInvite(selected);
              setSelected([]);
              onClose();
            }}
            className="flex w-full items-center justify-center rounded-2xl bg-neon-green py-3 text-[13px] font-bold text-[#0a1430] disabled:opacity-40"
          >
            دعوة {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
