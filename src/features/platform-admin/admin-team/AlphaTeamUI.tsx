import { Edit3, Eye, Loader2, ToggleLeft, ToggleRight, UserCog, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AvatarWithDisplayShield } from "@/components/alpha/AvatarWithDisplayShield";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";
import { roleLabelAr, statusLabelAr, type AdminTeamMember } from "./admin-team-api";

const STAT_DEFS = [
  { key: "total", emoji: "👥", label: "إجمالي الفريق", color: PP_GOLD },
  { key: "active", emoji: "🟢", label: "نشط", color: MC.green },
  { key: "disabled", emoji: "🔴", label: "معطّل", color: MC.red },
  { key: "pending", emoji: "🟡", label: "بانتظار التفعيل", color: MC.gold },
] as const;

export function TeamGlassStats({
  rows,
  loading,
}: {
  rows: AdminTeamMember[];
  loading?: boolean;
}) {
  const counts = {
    total: rows.length,
    active: rows.filter((m) => m.status === "active").length,
    disabled: rows.filter((m) => m.status === "disabled").length,
    pending: rows.filter((m) => m.status === "pending").length,
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5">
      {STAT_DEFS.map((item) => (
        <div
          key={item.key}
          className="rounded-[18px] border p-3.5 text-right"
          style={{
            borderColor: MC.panelBorder,
            background: MC.panel,
          }}
        >
          <p className="text-[20px] leading-none">{item.emoji}</p>
          <p
            className={`mt-2 font-mono text-[24px] font-extrabold tabular-nums leading-none ${loading ? "animate-pulse" : ""}`}
            style={{ color: item.color }}
          >
            {loading ? "…" : formatPlatformNumber(counts[item.key])}
          </p>
          <p className="mt-1.5 text-[14px] font-extrabold text-slate-100">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function MemberAvatar({ member }: { member: AdminTeamMember }) {
  const src = member.avatar_url?.trim() || null;

  return (
    <AvatarWithDisplayShield
      userName={member.full_name}
      userAvatar={src || undefined}
      shieldRole="official"
      shieldSize="sm"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-14 w-14 rounded-full border-2 object-cover"
          style={{ borderColor: `${PP_GOLD}55` }}
        />
      ) : (
        <div
          className="grid h-14 w-14 place-items-center rounded-full border-2 text-[18px] font-black"
          style={{ borderColor: `${PP_GOLD}44`, background: `${PP_GOLD}18`, color: PP_GOLD }}
        >
          {member.full_name?.trim()?.charAt(0) ?? "?"}
        </div>
      )}
    </AvatarWithDisplayShield>
  );
}

function TeamActionBtn({
  to,
  params,
  search,
  onClick,
  disabled,
  icon: Icon,
  label,
  accent,
}: {
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  onClick?: () => void;
  disabled?: boolean;
  icon: typeof Eye;
  label: string;
  accent: string;
}) {
  const className =
    "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border px-3 py-3 text-[14px] font-extrabold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35";
  const style = { borderColor: `${accent}55`, background: `${accent}12`, color: accent };
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      {label}
    </>
  );

  if (to && !disabled) {
    return (
      <Link
        to={to as "/platform/team/$memberId"}
        params={params}
        search={search}
        className={className}
        style={style}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={style}
    >
      {inner}
    </button>
  );
}

export function TeamMemberCard({
  member,
  actingId,
  onToggleStatus,
  canEdit,
  canPermissions,
  canDisable,
  fullAccess = false,
}: {
  member: AdminTeamMember;
  actingId: string | null;
  onToggleStatus: (member: AdminTeamMember) => void;
  canEdit: boolean;
  canPermissions: boolean;
  canDisable: boolean;
  fullAccess?: boolean;
}) {
  const statusColor =
    member.status === "active" ? MC.green : member.status === "disabled" ? MC.red : MC.gold;
  const accent = member.status === "active" ? MC.green : MC.steel;
  const roleLabel = roleLabelAr(member.role_key);
  const allowEdit = fullAccess || canEdit;
  const allowPermissions = fullAccess || canPermissions;
  const allowToggle = fullAccess || canDisable;
  const isActive = member.status === "active";
  const toggleLabel = member.status === "pending" ? "تفعيل" : isActive ? "تعطيل" : "تفعيل";

  return (
    <div
      dir="rtl"
      className="overflow-hidden rounded-[18px] border transition"
      style={{
        borderColor: MC.panelBorder,
        background: MC.panel,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-4">
        <MemberAvatar member={member} />
        <div className="min-w-0 flex-1 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className="rounded-full border px-2.5 py-0.5 text-[12px] font-extrabold"
              style={{ borderColor: `${statusColor}44`, color: statusColor }}
            >
              {statusLabelAr(member.status)}
            </span>
            <span
              className="rounded-full border px-2.5 py-0.5 text-[12px] font-extrabold"
              style={{ borderColor: `${PP_GOLD}44`, color: PP_GOLD }}
            >
              {roleLabel}
            </span>
          </div>
          <h3 className="mt-1 text-[17px] font-extrabold leading-tight text-slate-50">
            {member.full_name}
          </h3>
          <p className="mt-0.5 text-[13px] font-extrabold tracking-wide" style={{ color: PP_GOLD }}>
            {roleLabel}
          </p>
          <p className="mt-0.5 text-[14px] font-semibold" style={{ color: MC.muted }}>
            @{member.username}
          </p>
          <p className="mt-1 truncate text-[14px] font-medium text-slate-400">{member.email}</p>
          <p className="mt-2 text-[13px] font-semibold text-slate-400">
            آخر نشاط:{" "}
            {member.last_activity_at
              ? new Date(member.last_activity_at).toLocaleString("ar-EG")
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t px-3 py-3" style={{ borderColor: MC.panelBorder }}>
        <TeamActionBtn
          to="/platform/team/$memberId"
          params={{ memberId: member.id }}
          icon={Eye}
          label="عرض"
          accent={MC.white}
        />
        <TeamActionBtn
          to="/platform/team/$memberId"
          params={{ memberId: member.id }}
          search={{ edit: "1" }}
          disabled={!allowEdit}
          icon={Edit3}
          label="تعديل"
          accent={MC.cyan}
        />
        <TeamActionBtn
          to="/platform/team/$memberId/permissions"
          params={{ memberId: member.id }}
          disabled={!allowPermissions}
          icon={UserCog}
          label="صلاحيات"
          accent={MC.purple}
        />
        <button
          type="button"
          disabled={!allowToggle || actingId === member.id}
          onClick={() => onToggleStatus(member)}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border px-3 py-3 text-[14px] font-extrabold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            borderColor: isActive ? `${MC.red}55` : `${MC.green}55`,
            background: isActive ? `${MC.red}12` : `${MC.green}12`,
            color: isActive ? MC.red : MC.green,
          }}
        >
          {actingId === member.id ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : isActive ? (
            <ToggleLeft className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          ) : (
            <ToggleRight className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          )}
          {toggleLabel}
        </button>
      </div>
    </div>
  );
}

export function TeamHeaderPanel({ memberCount }: { memberCount: number }) {
  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5"
      style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.25)" }}
    >
      <Users className="h-6 w-6 shrink-0" style={{ color: PP_GOLD }} />
      <div className="flex-1 text-right">
        <p className="text-[16px] font-extrabold text-slate-100">فريق Alpha</p>
        <p className="mt-0.5 text-[13px] font-medium text-slate-400">
          {memberCount} عضو · صلاحيات مخصصة لكل مساعد
        </p>
      </div>
    </div>
  );
}
