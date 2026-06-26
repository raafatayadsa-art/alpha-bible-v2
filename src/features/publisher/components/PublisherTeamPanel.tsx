import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, UserPlus, Users } from "lucide-react";
import { PUBLISHER_TEAM_PERMISSION_LABELS, type PublisherTeamMember } from "../types";
import {
  fetchPublisherTeamMembers,
  removePublisherTeamMember,
  updatePublisherTeamMember,
} from "../publisher-team-api";

type DraftPerms = {
  canEditProfile: boolean;
  canManageContent: boolean;
  canSubmitPublication: boolean;
  canManageTeam: boolean;
};

type Props = {
  publisherId: string;
  onAddClick: () => void;
  refreshKey?: number;
};

export function PublisherTeamPanel({ publisherId, onAddClick, refreshKey = 0 }: Props) {
  const [members, setMembers] = useState<PublisherTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const rows = await fetchPublisherTeamMembers(publisherId);
    setMembers(rows);
    setLoading(false);
  }, [publisherId]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  const toggleMemberPerm = async (member: PublisherTeamMember, key: keyof DraftPerms, value: boolean) => {
    setSaving(true);
    const next = { ...member, [key]: value };
    const result = await updatePublisherTeamMember(member.id, {
      canEditProfile: next.canEditProfile,
      canManageContent: next.canManageContent,
      canSubmitPublication: next.canSubmitPublication,
      canManageTeam: next.canManageTeam,
    });
    setSaving(false);
    if (result.ok) await reload();
    else setFeedback(result.message ?? "تعذّر التحديث.");
  };

  const removeMember = async (memberId: string) => {
    setSaving(true);
    const result = await removePublisherTeamMember(memberId);
    setSaving(false);
    if (result.ok) await reload();
    else setFeedback(result.message ?? "تعذّر الإزالة.");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-extrabold text-white active:scale-[0.98]"
          style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          إضافة مساعد
        </button>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-[12px] font-extrabold text-[#3a3258]">فريق المساعدين</p>
            <p className="text-[10px] font-bold text-[#6b658a]">{members.length} مساعد</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#5D3291]/10 text-[#5D3291]">
            <Users className="h-4 w-4" />
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#5D3291]" />
        </div>
      ) : members.length ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-[rgba(93,50,145,0.1)] bg-[#faf8fc] px-3 py-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void removeMember(member.id)}
                  className="rounded-lg px-2 py-1 text-[10px] font-extrabold text-[#a8344f] hover:bg-red-50"
                >
                  إزالة
                </button>
                <div className="min-w-0 text-right">
                  <p className="truncate text-[12px] font-extrabold text-[#3a3258]">{member.displayName}</p>
                  <p className="truncate text-[9px] font-bold text-[#8a84a8]" dir="ltr">
                    {member.userId.slice(0, 8)}…
                  </p>
                </div>
              </div>
              <PermissionToggles
                values={member}
                disabled={saving}
                onToggle={(key, value) => void toggleMemberPerm(member, key, value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[rgba(93,50,145,0.16)] px-4 py-10 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-[#5D3291]/35" />
          <p className="text-[11px] font-extrabold text-[#3a3258]">لا يوجد مساعدون بعد</p>
          <p className="mt-1 text-[10px] font-bold text-[#6b658a]">اضغط «إضافة مساعد» لدعوة أول مساعد.</p>
        </div>
      )}

      {feedback ? <p className="text-center text-[11px] font-bold text-[#5D3291]">{feedback}</p> : null}
    </div>
  );
}

function PermissionToggles({
  values,
  onToggle,
  disabled,
}: {
  values: DraftPerms;
  onToggle: (key: keyof DraftPerms, value: boolean) => void;
  disabled?: boolean;
}) {
  const keys = Object.keys(PUBLISHER_TEAM_PERMISSION_LABELS) as (keyof DraftPerms)[];

  return (
    <div className="grid grid-cols-1 gap-1.5">
      {keys.map((key) => (
        <label
          key={key}
          className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(93,50,145,0.08)] bg-white px-2.5 py-2"
        >
          <input
            type="checkbox"
            checked={values[key]}
            disabled={disabled}
            onChange={(e) => onToggle(key, e.target.checked)}
            className="h-4 w-4 accent-[#5D3291]"
          />
          <span className="flex-1 text-right text-[10px] font-extrabold text-[#3a3258]">
            {PUBLISHER_TEAM_PERMISSION_LABELS[key]}
          </span>
        </label>
      ))}
    </div>
  );
}
