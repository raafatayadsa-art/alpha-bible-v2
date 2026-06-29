import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AvatarWithDisplayShield } from "@/components/alpha/AvatarWithDisplayShield";
import { CyberBtn, CyberPanel, CyberSearch, MissionSubShell } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import { useAdminPermissions } from "./useAdminPermissions";
import {
  fetchAdminTeamMember,
  roleLabelAr,
  statusLabelAr,
  updateAdminTeamMember,
  type AdminActivityRow,
  type AdminTeamMember,
} from "./admin-team-api";

export function AlphaTeamMemberScreen({
  memberId,
  editMode = false,
}: {
  memberId: string;
  editMode?: boolean;
}) {
  const navigate = useNavigate();
  const { has, isHiddenOwner, loading: permsLoading } = useAdminPermissions();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<AdminTeamMember | null>(null);
  const [activity, setActivity] = useState<AdminActivityRow[]>([]);
  const [editing, setEditing] = useState(editMode);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [roleKey, setRoleKey] = useState<"super_admin" | "admin">("admin");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permsLoading) return;
    if (!has("team.view") && !isHiddenOwner) {
      setLoading(false);
      return;
    }
    void (async () => {
      const data = await fetchAdminTeamMember(memberId);
      if (data) {
        setMember(data.member);
        setActivity(data.activity);
        setFullName(data.member.full_name);
        setUsername(data.member.username);
        setPhone(data.member.phone ?? "");
        setAvatarUrl(data.member.avatar_url ?? "");
        setRoleKey(data.member.role_key);
      }
      setLoading(false);
    })();
  }, [memberId, has, permsLoading]);

  const save = async () => {
    if (!has("team.edit") && !isHiddenOwner) return;
    setSaving(true);
    setError(null);
    const result = await updateAdminTeamMember(memberId, {
      fullName,
      username,
      phone,
      avatarUrl,
      roleKey,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "تعذّر الحفظ");
      return;
    }
    setEditing(false);
    const data = await fetchAdminTeamMember(memberId);
    if (data) {
      setMember(data.member);
      setActivity(data.activity);
    }
  };

  if (permsLoading || loading) {
    return (
      <MissionSubShell title="تفاصيل العضو" titleEn="Member Profile" navActive="settings">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: MC.purple }} />
        </div>
      </MissionSubShell>
    );
  }

  if (!has("team.view") && !isHiddenOwner) {
    return (
      <MissionSubShell title="تفاصيل العضو" titleEn="Member Profile" navActive="settings">
        <CyberPanel>
          <p className="text-center text-[14px] font-bold" style={{ color: MC.muted }}>
            ليس لديك صلاحية عرض تفاصيل الأعضاء
          </p>
        </CyberPanel>
      </MissionSubShell>
    );
  }

  if (!member) {
    return (
      <MissionSubShell title="تفاصيل العضو" titleEn="Member Profile" navActive="settings">
        <CyberPanel>
          <p className="text-center text-[14px] font-bold" style={{ color: MC.red }}>
            لم يُعثر على العضو
          </p>
        </CyberPanel>
      </MissionSubShell>
    );
  }

  const memberPhoto = member.avatar_url?.trim() || null;

  return (
    <MissionSubShell title="تفاصيل العضو" titleEn="Member Profile" navActive="settings">
      <CyberPanel glow={PP_GOLD} className="mb-4">
        <div className="text-right">
          <AvatarWithDisplayShield
            className="mx-auto mb-3"
            userName={member.full_name}
            userAvatar={memberPhoto || undefined}
            shieldRole="official"
            shieldSize="md"
          >
            {memberPhoto ? (
              <img
                src={memberPhoto}
                alt=""
                className="mx-auto h-20 w-20 rounded-full border-2 object-cover"
                style={{ borderColor: `${PP_GOLD}55` }}
              />
            ) : (
              <div
                className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 text-[22px] font-black"
                style={{ borderColor: `${PP_GOLD}44`, background: `${PP_GOLD}18`, color: PP_GOLD }}
              >
                {member.full_name?.trim()?.charAt(0) ?? "?"}
              </div>
            )}
          </AvatarWithDisplayShield>
          <p className="text-[18px] font-extrabold text-slate-50">{member.full_name}</p>
          <p className="mt-0.5 text-[14px] font-extrabold tracking-wide" style={{ color: PP_GOLD }}>
            {roleLabelAr(member.role_key)}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold" style={{ color: MC.cyan }}>
            @{member.username}
          </p>
          <p className="mt-1 text-[14px] font-medium text-slate-400">{member.email}</p>
          <p className="mt-2 text-[13px] font-extrabold" style={{ color: PP_GOLD }}>
            {statusLabelAr(member.status)}
          </p>
        </div>
      </CyberPanel>

      {editing && (has("team.edit") || isHiddenOwner) ? (
        <CyberPanel className="mb-4">
          <CyberSearch value={fullName} onChange={setFullName} placeholder="الاسم الكامل" />
          <CyberSearch value={username} onChange={setUsername} placeholder="Username" />
          <CyberSearch value={phone} onChange={setPhone} placeholder="الهاتف" />
          <CyberSearch value={avatarUrl} onChange={setAvatarUrl} placeholder="رابط الصورة" />
          <label className="mb-3 block text-right text-[13px] font-bold text-slate-400">
            الدور
            <select
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value as "super_admin" | "admin")}
              className="mt-1.5 w-full rounded-lg border bg-black/40 px-3 py-3 text-[14px] font-bold text-white"
              style={{ borderColor: MC.panelBorder }}
            >
              <option value="admin">مسؤول</option>
              <option value="super_admin">مسؤول أعلى</option>
            </select>
          </label>
          {error ? (
            <p className="mb-2 text-[13px] font-bold text-red-400">{error}</p>
          ) : null}
          <CyberBtn
            label={saving ? "جاري الحفظ…" : "حفظ التعديلات"}
            className="w-full !text-[14px]"
            onClick={() => void save()}
            disabled={saving}
          />
        </CyberPanel>
      ) : (
        <CyberPanel className="mb-4">
          <div className="space-y-2.5 text-right text-[14px] font-medium text-slate-400">
            <p>الهاتف: {member.phone ?? "—"}</p>
            <p>تاريخ الإنشاء: {new Date(member.created_at).toLocaleString("ar-EG")}</p>
            <p>
              آخر تسجيل دخول:{" "}
              {member.last_login_at ? new Date(member.last_login_at).toLocaleString("ar-EG") : "—"}
            </p>
            <p>عدد مرات الدخول: {member.login_count}</p>
            <p>آخر IP: {member.last_ip ?? "—"}</p>
            <p>
              آخر نشاط:{" "}
              {member.last_activity_at
                ? new Date(member.last_activity_at).toLocaleString("ar-EG")
                : "—"}
            </p>
          </div>
          {has("team.edit") ? (
            <CyberBtn
              label="تعديل البيانات"
              className="mt-4 w-full !text-[14px]"
              variant="ghost"
              onClick={() => setEditing(true)}
            />
          ) : null}
          {isHiddenOwner || has("team.permissions") ? (
            <Link to="/platform/team/$memberId/permissions" params={{ memberId }} className="mt-2 block">
              <CyberBtn label="إدارة الصلاحيات" className="w-full !text-[14px]" variant="ghost" />
            </Link>
          ) : null}
        </CyberPanel>
      )}

      <CyberPanel glow={MC.blue}>
        <p className="mb-3 text-[15px] font-extrabold text-slate-100">آخر العمليات</p>
        {activity.length === 0 ? (
          <p className="text-[14px] font-medium text-slate-500">لا توجد عمليات مسجّلة</p>
        ) : (
          <ul className="space-y-2">
            {activity.map((row, i) => (
              <li
                key={`${row.created_at}-${i}`}
                className="rounded-[12px] border px-3 py-2.5 text-right"
                style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}
              >
                <p className="text-[14px] font-extrabold text-slate-100">{row.action}</p>
                <p className="text-[12px] font-medium text-slate-500">
                  {new Date(row.created_at).toLocaleString("ar-EG")}
                  {row.ip_address ? ` · ${row.ip_address}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CyberPanel>

      <CyberBtn
        label="العودة لفريق Alpha"
        variant="ghost"
        className="mt-4 w-full !text-[14px]"
        onClick={() => void navigate({ to: "/platform/team" })}
      />
    </MissionSubShell>
  );
}
