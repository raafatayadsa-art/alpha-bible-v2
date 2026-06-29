import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import {
  CyberBtn,
  CyberFilterChip,
  CyberPanel,
  CyberSearch,
  MissionSubShell,
  PrivacyStrip,
} from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import { AdminPermissionGate } from "./AdminPermissionGate";
import { AlphaTeamInviteSheet } from "./AlphaTeamInviteSheet";
import { TeamGlassStats, TeamHeaderPanel, TeamMemberCard } from "./AlphaTeamUI";
import { useAdminPermissions } from "./useAdminPermissions";
import {
  fetchAdminTeamList,
  setAdminTeamStatus,
  type AdminTeamMember,
} from "./admin-team-api";

type RoleFilter = "all" | "super_admin" | "admin";
type StatusFilter = "all" | "active" | "disabled" | "pending";
type SortFilter = "newest" | "oldest";

const ROLE_FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "super_admin", label: "مسؤول أعلى" },
  { key: "admin", label: "مسؤول" },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشط" },
  { key: "disabled", label: "معطّل" },
  { key: "pending", label: "بانتظار" },
];

export function AlphaTeamScreen() {
  const { has, isHiddenOwner, loading: permsLoading } = useAdminPermissions();
  const [rows, setRows] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("newest");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    const list = await fetchAdminTeamList();
    setRows(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (permsLoading) return;
    if (has("team.view")) void reload();
    else setLoading(false);
  }, [has, permsLoading, reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...rows];
    if (q) {
      list = list.filter((m) =>
        [m.full_name, m.username, m.email, m.role_key].join(" ").toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") list = list.filter((m) => m.role_key === roleFilter);
    if (statusFilter !== "all") list = list.filter((m) => m.status === statusFilter);
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortFilter === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [rows, search, roleFilter, statusFilter, sortFilter]);

  const toggleStatus = async (member: AdminTeamMember) => {
    if (!has("team.disable") && !isHiddenOwner) return;
    setActingId(member.id);
    const next =
      member.status === "active" ? "disabled" : "active";
    const result = await setAdminTeamStatus(member.id, next);
    setActingId(null);
    if (!result.ok) {
      setActionError(result.error ?? "تعذّر تحديث الحالة");
      return;
    }
    await reload();
  };

  const canEdit = isHiddenOwner || has("team.edit");
  const canPermissions = isHiddenOwner || has("team.permissions") || has("team.view");
  const canDisable = isHiddenOwner || has("team.disable");

  if (permsLoading) {
    return (
      <MissionSubShell title="فريق Alpha" titleEn="Team Management" navActive="settings">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: MC.purple }} />
        </div>
      </MissionSubShell>
    );
  }

  if (!has("team.view")) {
    return (
      <MissionSubShell title="فريق Alpha" titleEn="Team Management" navActive="settings">
        <CyberPanel>
          <p className="text-center text-[14px] font-bold" style={{ color: MC.muted }}>
            ليس لديك صلاحية عرض فريق Alpha
          </p>
        </CyberPanel>
      </MissionSubShell>
    );
  }

  return (
    <MissionSubShell title="فريق Alpha" titleEn="Team Management" navActive="settings">
      <PrivacyStrip>
        ادعُ المساعدين وحدّد صلاحيات كل عضو على حدة. المالك مخفي ولا يظهر في القائمة — الصلاحيات
        تُطبَّق فور الحفظ على لوحة Alpha Control.
      </PrivacyStrip>

      <TeamHeaderPanel memberCount={rows.length} />
      <TeamGlassStats rows={rows} loading={loading} />

      <AdminPermissionGate permission="team.invite">
        <CyberBtn
          label="➕ دعوة عضو جديد"
          className="mb-4 w-full !text-[14px]"
          onClick={() => setInviteOpen(true)}
        />
      </AdminPermissionGate>

      <CyberSearch
        value={search}
        onChange={setSearch}
        placeholder="بحث: الاسم · Username · البريد · الدور"
      />

      <p className="mb-2 text-right text-[13px] font-extrabold text-slate-300">تصفية حسب الدور</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {ROLE_FILTERS.map(({ key, label }) => (
          <CyberFilterChip
            key={key}
            active={roleFilter === key}
            onClick={() => setRoleFilter(key)}
            label={label}
            size="lg"
          />
        ))}
      </div>

      <p className="mb-2 text-right text-[14px] font-extrabold text-slate-300">تصفية حسب الحالة</p>
      <div className="mb-4 flex flex-wrap gap-2.5">
        {STATUS_FILTERS.map(({ key, label }) => (
          <CyberFilterChip
            key={key}
            active={statusFilter === key}
            onClick={() => setStatusFilter(key)}
            label={label}
            size="lg"
          />
        ))}
        <CyberFilterChip
          active={sortFilter === "newest"}
          onClick={() => setSortFilter("newest")}
          label="الأحدث"
          size="lg"
        />
        <CyberFilterChip
          active={sortFilter === "oldest"}
          onClick={() => setSortFilter("oldest")}
          label="الأقدم"
          size="lg"
        />
      </div>

      {actionError ? (
        <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] font-bold text-red-300">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: MC.purple }} />
        </div>
      ) : filtered.length === 0 ? (
        <CyberPanel glow={PP_GOLD}>
          <div className="py-6 text-center">
            <UserPlus className="mx-auto mb-3 h-8 w-8" style={{ color: PP_GOLD }} />
            <p className="text-[15px] font-extrabold text-slate-200">لا يوجد أعضاء مطابقون</p>
            <p className="mt-1 text-[13px] font-medium text-slate-500">
              جرّب تغيير الفلاتر أو ادعُ عضواً جديداً
            </p>
          </div>
        </CyberPanel>
      ) : (
        <ul className="space-y-3">
          {filtered.map((member) => (
            <li key={member.id}>
              <TeamMemberCard
                member={member}
                actingId={actingId}
                onToggleStatus={(m) => void toggleStatus(m)}
                canEdit={canEdit}
                canPermissions={canPermissions}
                canDisable={canDisable}
                fullAccess={isHiddenOwner}
              />
            </li>
          ))}
        </ul>
      )}

      <AlphaTeamInviteSheet
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSent={() => {
          setInviteOpen(false);
          void reload();
        }}
      />
    </MissionSubShell>
  );
}
