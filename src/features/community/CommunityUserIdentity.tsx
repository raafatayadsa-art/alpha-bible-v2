import type { ReactNode } from "react";
import { AlphaShield } from "@/components/alpha/AlphaShield";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { cn } from "@/lib/utils";
import { resolveCommunityShieldRole } from "./community-user-trust";

type Props = {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  avatarSize?: "sm" | "md";
  nameClassName?: string;
  meta?: ReactNode;
  onPress?: () => void;
  className?: string;
  hideVerified?: boolean;
};

/** RTL: avatar (right) → name → shield, meta below. */
export function CommunityUserIdentity(props: Props) {
  const { onPress, className, userName, hideVerified: _h, ...rest } = props;
  const {
    userId,
    userAvatarUrl,
    avatarSize,
    nameClassName,
    meta,
  } = rest;

  const shieldRole = resolveCommunityShieldRole(userId);

  const cluster = (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center justify-start gap-2">
        <PrayerUserAvatar
          name={userName}
          avatarUrl={userAvatarUrl}
          size={avatarSize}
          className="shrink-0 ring-1 ring-white/20"
        />
        <span className={cn("truncate text-[13px] font-extrabold leading-tight text-[#f0d78c]", nameClassName)}>
          {userName}
        </span>
        <AlphaShield role={shieldRole} size="sm" userName={userName} userAvatar={userAvatarUrl} />
      </div>
      {meta ? <div className="mt-0.5 text-right">{meta}</div> : null}
    </div>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        aria-label={`عرض ${userName}`}
        className="min-w-0 flex-1 text-right active:scale-[0.99]"
      >
        {cluster}
      </button>
    );
  }

  return cluster;
}
