import type { ReactNode } from "react";
import { AlphaShield, type AlphaShieldSize, type ShieldRole } from "./AlphaShield";
import { getDisplayShieldRoleSync } from "@/features/auth";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  userName?: string;
  userAvatar?: string;
  /** Override auto-detected shield (e.g. team cards always use official). */
  shieldRole?: ShieldRole | null;
  shieldSize?: AlphaShieldSize;
  className?: string;
  avatarClassName?: string;
};

/** Avatar wrapper — trust shield sits on the corner (Facebook-style), not over the face. */
export function AvatarWithDisplayShield({
  children,
  userName,
  userAvatar,
  shieldRole,
  shieldSize = "sm",
  className,
  avatarClassName,
}: Props) {
  const role = shieldRole === undefined ? getDisplayShieldRoleSync() : shieldRole;
  const badgeSize: AlphaShieldSize = shieldSize === "md" || shieldSize === "lg" ? "sm" : "xs";

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div className={cn("overflow-hidden rounded-full", avatarClassName)}>{children}</div>
      {role ? (
        <span
          className="absolute bottom-0 right-0 z-10 translate-x-[22%] translate-y-[22%]"
          aria-hidden={false}
        >
          <AlphaShield
            role={role}
            size={badgeSize}
            userName={userName}
            userAvatar={userAvatar}
            className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
          />
        </span>
      ) : null}
    </div>
  );
}
