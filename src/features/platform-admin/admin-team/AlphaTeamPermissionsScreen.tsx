import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Shield } from "lucide-react";
import { CyberBtn, CyberPanel, MissionSubShell, ModuleControlRow, PrivacyStrip } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import { notifyAdminPermissionsChanged, useAdminPermissions } from "./useAdminPermissions";
import {
  fetchAdminTeamMember,
  fetchAdminTeamPermissions,
  resetAdminTeamPermissions,
  roleLabelAr,
  saveAdminTeamPermissions,
} from "./admin-team-api";
import { ADMIN_PERMISSION_GROUPS, type AdminPermissionKey } from "./permissions";

export function AlphaTeamPermissionsScreen({ memberId }: { memberId: string }) {
  const navigate = useNavigate();
  const { has, isHiddenOwner, loading: permsLoading } = useAdminPermissions();
  const canView = isHiddenOwner || has("team.view");
  const canEditPerms = isHiddenOwner || has("team.permissions");
  const [loading, setLoading] = useState(true);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [resetting, setResetting] = useState(false);

  const reloadPermissions = async () => {
    const permData = await fetchAdminTeamPermissions(memberId);
    if (permData) setPerms(permData);
  };

  useEffect(() => {
    if (permsLoading) return;
    if (!canView) {
      setLoading(false);
      return;
    }
    void (async () => {
      const [memberData, permData] = await Promise.all([
        fetchAdminTeamMember(memberId),
        fetchAdminTeamPermissions(memberId),
      ]);
      if (memberData) {
        setMemberRole(memberData.member.role_key);
        setMemberName(memberData.member.full_name);
      }
      if (permData) setPerms(permData);
      else setError("تعذّر تحميل الصلاحيات — تأكد من تشغيل SQL فريق Alpha على Supabase");
      setLoading(false);
    })();
  }, [memberId, canView, permsLoading]);

  const toggle = (key: AdminPermissionKey) => {
    if (!canEditPerms) return;
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
    setSavedFlash(false);
  };

  const save = async () => {
    if (!canEditPerms) return;
    setSaving(true);
    setError(null);
    const result = await saveAdminTeamPermissions(memberId, perms);
    setSaving(false);
    if (!result.ok) {
      setError(
        result.error ??
          (memberRole === "super_admin" && !isHiddenOwner
            ? "فقط المؤسس يعدّل صلاحيات مسؤول أعلى"
            : "تعذّر حفظ الصلاحيات"),
      );
      return;
    }
    setDirty(false);
    setSavedFlash(true);
    notifyAdminPermissionsChanged();
    window.setTimeout(() => setSavedFlash(false), 2800);
  };

  const resetToRoleDefaults = async () => {
    if (!canEditPerms) return;
    setResetting(true);
    setError(null);
    const result = await resetAdminTeamPermissions(memberId);
    setResetting(false);
    if (!result.ok) {
      setError(
        result.error ??
          (memberRole === "super_admin" && !isHiddenOwner
            ? "فقط المؤسس يعدّل صلاحيات مسؤول أعلى"
            : "تعذّر إعادة الصلاحيات الافتراضية"),
      );
      return;
    }
    await reloadPermissions();
    setDirty(false);
    setSavedFlash(true);
    notifyAdminPermissionsChanged();
    window.setTimeout(() => setSavedFlash(false), 2800);
  };

  if (permsLoading) {
    return (
      <MissionSubShell title="صلاحيات العضو" titleEn="Permissions" navActive="settings">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: MC.purple }} />
        </div>
      </MissionSubShell>
    );
  }

  if (!canView) {
    return (
      <MissionSubShell title="صلاحيات العضو" titleEn="Permissions" navActive="settings">
        <CyberPanel>
          <p className="text-center text-[14px] font-bold" style={{ color: MC.muted }}>
            ليس لديك صلاحية عرض صلاحيات الأعضاء
          </p>
        </CyberPanel>
      </MissionSubShell>
    );
  }

  const enabledCount = Object.values(perms).filter(Boolean).length;

  return (
    <MissionSubShell title="صلاحيات العضو" titleEn="Permissions" navActive="settings">
      <PrivacyStrip>
        {isHiddenOwner
          ? "أنت المؤسس — صلاحياتك كاملة دائماً. يمكنك فتح/إغلاق أي صلاحية لمسؤول أو مسؤول أعلى؛ الدور يعطي قالباً افتراضياً تلقائياً."
          : "كل صلاحية مستقلة — الدور قالب افتراضي. بعد الحفظ تُطبَّق الصلاحيات فوراً."}
      </PrivacyStrip>

      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5"
        style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.25)" }}
      >
        <Shield className="h-6 w-6 shrink-0" style={{ color: MC.purple }} />
        <div className="flex-1 text-right">
          <p className="text-[16px] font-extrabold text-slate-100">
            {memberName ? `صلاحيات ${memberName}` : "إدارة الصلاحيات"}
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-slate-400">
            {memberRole ? roleLabelAr(memberRole) : "—"} · {enabledCount} صلاحية مفعّلة
          </p>
        </div>
      </div>

      {savedFlash ? (
        <p className="mb-3 flex items-center justify-end gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[13px] font-bold text-emerald-300">
          <Check className="h-4 w-4" />
          تم حفظ الصلاحيات — ستُطبَّق على العضو فوراً
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: MC.purple }} />
        </div>
      ) : (
        <div className="space-y-3">
          {ADMIN_PERMISSION_GROUPS.map((group) => (
            <CyberPanel key={group.key} glow={MC.steel} padding>
              <p className="mb-3 text-right text-[15px] font-extrabold" style={{ color: PP_GOLD }}>
                {group.labelAr}
              </p>
              <div className="space-y-2">
                {group.permissions.map((p) => (
                  <ModuleControlRow
                    key={p.key}
                    labelAr={p.labelAr}
                    labelEn={p.key}
                    icon={Shield}
                    accent={MC.cyan}
                    checked={!!perms[p.key]}
                    onChange={() => toggle(p.key)}
                    disabled={!canEditPerms}
                  />
                ))}
              </div>
            </CyberPanel>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] font-bold text-red-300">
          {error}
        </p>
      ) : null}

      <CyberBtn
        label={saving ? "جاري الحفظ…" : dirty ? "حفظ الصلاحيات" : "محفوظ"}
        variant={dirty ? "save" : "ghost"}
        className="mt-4 w-full !text-[14px]"
        disabled={!dirty || saving || loading || !canEditPerms}
        onClick={() => void save()}
      />

      {canEditPerms ? (
        <CyberBtn
          label={resetting ? "جاري الإعادة…" : "إعادة لصلاحيات الدور الافتراضية"}
          variant="ghost"
          className="mt-2 w-full !text-[14px]"
          disabled={resetting || saving || loading}
          onClick={() => void resetToRoleDefaults()}
        />
      ) : null}

      <CyberBtn
        label="رجوع لتفاصيل العضو"
        variant="ghost"
        className="mt-2 w-full !text-[14px]"
        onClick={() => void navigate({ to: "/platform/team/$memberId", params: { memberId } })}
      />
    </MissionSubShell>
  );
}
