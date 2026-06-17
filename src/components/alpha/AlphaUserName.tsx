import { AlphaShield, type ShieldRole } from "./AlphaShield";
import { usePresenceDot } from "@/features/alpha-connect/useAlphaPresence";
import { cn } from "@/lib/utils";
import {
  ALPHA_IDENTITY_NAME,
  ALPHA_IDENTITY_NAME_STACKED,
  ALPHA_IDENTITY_NAME_TEXT,
} from "./alpha-identity-layout";

type AlphaUserNameProps = {
  name: string;
  role: ShieldRole;
  size?: "sm" | "md" | "lg";
  className?: string;
  nameClassName?: string;
  userAvatar?: string;
  /** @deprecated use presenceUserId */
  isOnline?: boolean;
  presenceUserId?: string;
  layout?: "inline" | "stacked";
};

/** Username + shield — always follows global alpha-identity-name RTL layout. */
export function AlphaUserName({
  name,
  role,
  size = "sm",
  className,
  nameClassName,
  userAvatar,
  isOnline,
  presenceUserId,
  layout = "inline",
}: AlphaUserNameProps) {
  const presenceDot = usePresenceDot(presenceUserId ?? "");
  const shieldPresenceStatus = presenceUserId ? presenceDot : isOnline ? "available" : isOnline === false ? null : undefined;

  if (layout === "stacked") {
    return (
      <div className={cn(ALPHA_IDENTITY_NAME_STACKED, className)}>
        <span className={cn(ALPHA_IDENTITY_NAME_TEXT, "font-semibold leading-tight", nameClassName)}>{name}</span>
        <AlphaShield
          role={role}
          size={size}
          userName={name}
          userAvatar={userAvatar}
          isOnline={isOnline}
          presenceStatus={shieldPresenceStatus}
        />
      </div>
    );
  }

  return (
    <span className={cn(ALPHA_IDENTITY_NAME, className)}>
      <span className={cn(ALPHA_IDENTITY_NAME_TEXT, nameClassName)}>{name}</span>
      <AlphaShield
        role={role}
        size={size}
        userName={name}
        userAvatar={userAvatar}
        isOnline={isOnline}
        presenceStatus={shieldPresenceStatus}
      />
    </span>
  );
}
