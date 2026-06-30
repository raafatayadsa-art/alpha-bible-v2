import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Camera, Clock, Copy, UserPen, UserX } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/bible";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { ProfileCopticAvatarFrame } from "./ProfileCopticAvatarFrame";
import { ProfileSelfPreviewSheet } from "./ProfileSelfPreviewSheet";
import type { ProfileAffiliationStatus } from "./profile-membership-status";
import { AFFILIATION_LABEL } from "./profile-membership-status";
import type { ProfileFieldPrivacy } from "./profile-privacy";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  avatarUrl: string;
  coverUrl?: string | null;
  onCoverChange?: (dataUrl: string) => void;
  alphaId: string;
  alphaIdFull?: string;
  userId?: string;
  churchName: string;
  bio: string;
  birthDate: string | null;
  roleLabel: string;
  affiliation: ProfileAffiliationStatus;
  affiliationLoading?: boolean;
  shieldRole: ShieldRole | null;
  showShield: boolean;
  privacy: ProfileFieldPrivacy;
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
  coverUrl,
  onCoverChange,
  alphaId,
  alphaIdFull,
  userId,
  churchName,
  bio,
  birthDate,
  roleLabel,
  affiliation,
  affiliationLoading,
  shieldRole,
  showShield,
  privacy,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const src = avatarUrl?.trim() || undefined;
  const coverSrc = coverUrl?.trim() || null;

  const pickCover = () => coverInputRef.current?.click();

  const copyIdentity = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`تم نسخ ${label}`);
    } catch {
      toast.error("تعذّر النسخ");
    }
  };

  const onCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onCoverChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onCoverChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="pb-6 text-center">
      <div className="relative -mx-5 mb-2">
        <div className="relative h-[168px] overflow-hidden rounded-b-[28px] border-b border-alpha/40 shadow-[var(--alpha-shadow-mini)]">
          {coverSrc ? (
            <img src={coverSrc} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--alpha-accent-purple-deep) 72%, #2a1f12) 0%, color-mix(in srgb, var(--alpha-gold-deep) 55%, #3a2a18) 48%, color-mix(in srgb, var(--alpha-accent-green-deep) 45%, #1a2820) 100%)",
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--alpha-bg-base)_88%,transparent)] via-transparent to-black/10" />
          {onCoverChange ? (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onCoverFile}
              />
              <button
                type="button"
                onClick={pickCover}
                aria-label="تغيير صورة الغلاف"
                className="absolute bottom-3 left-3 z-30 grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-black/30 text-white shadow-lg backdrop-blur-md active:scale-95"
              >
                <Camera className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </>
          ) : null}
        </div>

        <div className="absolute inset-x-0 top-[max(env(safe-area-inset-top),12px)] z-20 flex items-center justify-between px-5">
          <BackButton to="/home" compact tone="light" />
          <Link
            to="/profile/edit"
            aria-label="تعديل الملف الشخصي"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/40 bg-black/25 px-4 text-[13px] font-extrabold text-white shadow-lg backdrop-blur-md active:scale-[0.98]"
          >
            <UserPen className="h-4 w-4" strokeWidth={2.2} />
            تعديل
          </Link>
        </div>

        <div className={cn("relative z-10 -mt-[88px] flex justify-center")}>
          <ProfileCopticAvatarFrame
            name={name}
            avatarUrl={src}
            shieldRole={shieldRole}
            showShield={showShield}
            onClick={() => setPreviewOpen(true)}
          />
        </div>
      </div>

      <h1 className="text-[28px] font-extrabold leading-tight text-alpha-heading">{name}</h1>
      <div className="mt-1 flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => void copyIdentity(alphaIdFull || alphaId, "كود Alpha")}
          className="inline-flex items-center gap-1.5 font-mono text-[14px] font-bold tracking-wide text-alpha-heading-muted active:scale-[0.98]"
          dir="ltr"
        >
          {alphaIdFull || alphaId || "—"}
          <Copy className="h-3.5 w-3.5 opacity-60" />
        </button>
        {userId ? (
          <button
            type="button"
            onClick={() => void copyIdentity(userId, "معرّف المستخدم")}
            className="inline-flex max-w-[92vw] items-center gap-1.5 truncate font-mono text-[11px] font-semibold text-alpha-muted active:scale-[0.98]"
            dir="ltr"
            title={userId}
          >
            {userId.slice(0, 8)}…{userId.slice(-4)}
            <Copy className="h-3 w-3 shrink-0 opacity-50" />
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-[17px] font-bold text-alpha-heading-muted">{churchName}</p>

      <div className="mt-3 flex justify-center">
        <AffiliationBadge status={affiliation} loading={affiliationLoading} />
      </div>

      <ProfileSelfPreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        name={name}
        avatarUrl={src}
        alphaId={alphaId}
        churchName={churchName}
        bio={bio}
        birthDate={birthDate}
        roleLabel={roleLabel}
        affiliation={affiliation}
        shieldRole={shieldRole}
        showShield={showShield}
        privacy={privacy}
      />
    </header>
  );
}
