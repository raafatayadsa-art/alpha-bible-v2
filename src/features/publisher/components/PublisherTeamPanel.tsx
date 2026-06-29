import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, UserPlus, Users } from "lucide-react";
import { PUBLISHER_TEAM_PERMISSION_LABELS, type PublisherTeamMember } from "../types";
import {
  fetchPublisherTeamMembers,
  removePublisherTeamMember,
  updatePublisherTeamMember,
} from "../publisher-team-api";
import {
  PUBLISHER_ACCENT_ICON_MD,
  PUBLISHER_MEMBER_CARD,
  PUBLISHER_PERM_ROW,
  PUBLISHER_PURPLE_GRADIENT,
  PUBLISHER_TEXT_FEEDBACK,
  PUBLISHER_TEXT_MUTED,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";

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
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 alpha-type-desc font-extrabold text-white active:scale-[0.98]"
          style={{ background: PUBLISHER_PURPLE_GRADIENT }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          إضافة مساعد
        </button>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className={PUBLISHER_TEXT_TITLE}>فريق المساعدين</p>
            <p className={PUBLISHER_TEXT_SUB}>{members.length} مساعد</p>
          </div>
          <span className={PUBLISHER_ACCENT_ICON_MD}>
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
              className={PUBLISHER_MEMBER_CARD}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void removeMember(member.id)}
                  className="rounded-lg px-2 py-1 alpha-type-caption font-extrabold text-[#a8344f] hover:bg-red-50"
                >
                  إزالة
                </button>
                <div className="min-w-0 text-right">
                  <p className={`truncate ${PUBLISHER_TEXT_TITLE}`}>{member.displayName}</p>
                  <p className={`truncate ${PUBLISHER_TEXT_MUTED}`} dir="ltr">
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
          <p className={`${PUBLISHER_TEXT_TITLE} text-[11px]`}>لا يوجد مساعدون بعد</p>
          <p className={`mt-1 ${PUBLISHER_TEXT_SUB}`}>اضغط «إضافة مساعد» لدعوة أول مساعد.</p>
        </div>
      )}

      {feedback ? <p className={PUBLISHER_TEXT_FEEDBACK}>{feedback}</p> : null}
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
          className={`${PUBLISHER_PERM_ROW} bg-white`}
        >
          <input
            type="checkbox"
            checked={values[key]}
            disabled={disabled}
            onChange={(e) => onToggle(key, e.target.checked)}
            className="h-4 w-4 accent-[#5D3291]"
          />
          <span className={`flex-1 text-right ${PUBLISHER_TEXT_TITLE} text-[10px]`}>
            {PUBLISHER_TEAM_PERMISSION_LABELS[key]}
          </span>
        </label>
      ))}
    </div>
  );
}
