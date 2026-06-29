import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, UserPen, UserX } from "lucide-react";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { ProfileCopticAvatarFrame } from "./ProfileCopticAvatarFrame";
import type { ProfileAffiliationStatus } from "./profile-membership-status";
import { AFFILIATION_LABEL } from "./profile-membership-status";

type Props = {
  name: string;
  avatarUrl: string;
  alphaId: string;
  churchName: string;
  affiliation: ProfileAffiliationStatus;
  affiliationLoading?: boolean;
  /** Church shield only — omit when user is not church-affiliated. */
  shieldRole: ShieldRole | null;
  showShield: boolean;
};

function AffiliationBadge({
  status,
  loading,
}: {
  status: ProfileAffiliationStatus;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-alpha px-3 py-1.5 text-[14px] font-bold text-alpha-muted">
        …
      </span>
    );
  }

  const approved = status === "approved";
  const pending = status === "pending";
  const Icon = approved ? BadgeCheck : pending ? Clock : UserX;
  const color = approved ? "#1f8a5a" : pending ? "#c98a3c" : "#8a7a6a";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[14px] font-extrabold"
      style={{
        borderColor: `${color}44`,
        background: `${color}12`,
        color,
      }}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      {AFFILIATION_LABEL[status]}
    </span>
  );
}

export function ProfileSimpleHeader({
  name,
  avatarUrl,
  alphaId,
  churchName,
  affiliation,
  affiliationLoading,
  shieldRole,
  showShield,
}: Props) {
  const src = avatarUrl?.trim() || undefined;

  return (
    <header className="pt-[max(env(safe-area-inset-top),12px)] pb-6 text-center">
      <ProfileCopticAvatarFrame
        name={name}
        avatarUrl={src}
        shieldRole={shieldRole}
        showShield={showShield}
        className="mb-5"
      />

      <h1 className="text-[28px] font-extrabold leading-tight text-alpha-heading">{name}</h1>
      <p className="mt-1 font-mono text-[15px] font-bold tracking-wide text-alpha-muted">{alphaId}</p>
      <p className="mt-2 text-[17px] font-bold text-alpha-heading-muted">{churchName}</p>

      <div className="mt-3 flex justify-center">
        <AffiliationBadge status={affiliation} loading={affiliationLoading} />
      </div>

      <Link
        to="/profile/edit"
        className="mx-auto mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-alpha-gold-bright/40 bg-alpha-surface px-8 text-[16px] font-extrabold text-alpha-gold-deep shadow-[var(--alpha-shadow-mini)] active:scale-[0.98]"
      >
        <UserPen className="h-4 w-4" strokeWidth={2.2} />
        تعديل الملف الشخصي
      </Link>
    </header>
  );
}
