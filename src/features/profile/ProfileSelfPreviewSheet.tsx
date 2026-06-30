import { AlphaShield } from "@/components/alpha/AlphaShield";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { CommunityShieldSheet } from "@/features/community/CommunityShieldSheet";
import { COMMUNITY_SHIELD_INNER, COMMUNITY_SHIELD_SHEET_MAX_HEIGHT } from "@/features/community/community-shield-chrome";
import type { ProfileAffiliationStatus } from "./profile-membership-status";
import { AFFILIATION_LABEL } from "./profile-membership-status";
import {
  isFieldVisibleToViewer,
  type ProfileFieldPrivacy,
} from "./profile-privacy";

type Props = {
  open: boolean;
  onClose: () => void;
  name: string;
  avatarUrl?: string;
  alphaId: string;
  churchName: string;
  bio: string;
  birthDate: string | null;
  roleLabel: string;
  affiliation: ProfileAffiliationStatus;
  shieldRole: ShieldRole | null;
  showShield: boolean;
  privacy: ProfileFieldPrivacy;
};

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${COMMUNITY_SHIELD_INNER}`}>
      <p className="text-[10px] font-bold text-[#94A3B8]">{label}</p>
      <p className="mt-0.5 text-[13px] font-extrabold text-[#1F2937]">{value}</p>
    </div>
  );
}

/** Bottom sheet — how your profile appears to others (privacy-respected). */
export function ProfileSelfPreviewSheet({
  open,
  onClose,
  name,
  avatarUrl,
  alphaId,
  churchName,
  bio,
  birthDate,
  roleLabel,
  affiliation,
  shieldRole,
  showShield,
  privacy,
}: Props) {
  const viewer = "everyone" as const;
  const showAvatar = isFieldVisibleToViewer(privacy.avatar, viewer);
  const showBio = isFieldVisibleToViewer(privacy.bio, viewer) && bio.trim().length > 0;
  const showChurch = isFieldVisibleToViewer(privacy.church, viewer);
  const showBirth = isFieldVisibleToViewer(privacy.birthDate, viewer) && Boolean(birthDate);
  const role = showShield && shieldRole ? shieldRole : null;

  return (
    <CommunityShieldSheet
      open={open}
      onClose={onClose}
      title={name}
      subtitle={role ? "عضو موثّق · Alpha" : "معاينة الملف الشخصي"}
      maxHeight={COMMUNITY_SHIELD_SHEET_MAX_HEIGHT}
      variant="solid"
    >
      <div className="space-y-3">
        <div className={`flex items-center gap-3 px-3 py-3 ${COMMUNITY_SHIELD_INNER}`}>
          <div className="relative shrink-0">
            {showAvatar ? (
              <PrayerUserAvatar name={name} avatarUrl={avatarUrl} size="md" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#CBD5E1] bg-[#F1F5F9] text-[11px] font-extrabold text-[#94A3B8]">
                Ⲁ
              </div>
            )}
            {role ? (
              <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border border-white/60 bg-white/90 shadow-sm">
                <AlphaShield role={role} size="sm" userName={name} userAvatar={avatarUrl} />
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[14px] font-extrabold text-[#1F2937]">{name}</p>
            {showChurch ? (
              <p className="mt-0.5 text-[10px] font-semibold text-[#6B7280]">{churchName}</p>
            ) : null}
            <p className="mt-1 font-mono text-[10px] font-bold text-[#94A3B8]" dir="ltr">
              {alphaId}
            </p>
          </div>
        </div>

        <PreviewRow label="حالة الانتماء" value={AFFILIATION_LABEL[affiliation]} />
        {role ? <PreviewRow label="الدور الكنسي" value={roleLabel} /> : null}
        {showBio ? <PreviewRow label="نبذة" value={bio.trim()} /> : null}
        {showBirth && birthDate ? <PreviewRow label="تاريخ الميلاد" value={birthDate} /> : null}

        {!role ? (
          <p className="py-1 text-center text-[11px] font-semibold leading-relaxed text-[#6B7280]">
            لا يظهر درع الثقة — العضو غير منتسب لكنيسة أو لم تُعتمد العضوية بعد
          </p>
        ) : null}
      </div>
    </CommunityShieldSheet>
  );
}
