import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlphaUserName } from "./AlphaUserName";
import { AlphaPresenceDot } from "./AlphaPresenceDot";
import { AlphaShield, type ShieldRole } from "./AlphaShield";
import { usePresenceDot } from "@/features/alpha-connect/useAlphaPresence";
import {
  ALPHA_IDENTITY_BLOCK,
  ALPHA_IDENTITY_BLOCK_DETAILS,
  ALPHA_IDENTITY_BLOCK_ROLE,
  ALPHA_IDENTITY_BLOCK_STACKED,
  ALPHA_IDENTITY_AVATAR_SIZES,
  ALPHA_IDENTITY_ROW,
  ALPHA_IDENTITY_ROW_SECONDARY,
  ALPHA_IDENTITY_ROW_STACKED,
  ALPHA_IDENTITY_TRAILING,
  type AlphaIdentityAvatarSize,
} from "./alpha-identity-layout";

export type AlphaIdentityRowProps = {
  name: string;
  role: ShieldRole;
  avatar: string;
  avatarAlt?: string;
  avatarSize?: AlphaIdentityAvatarSize;
  avatarRing?: "none" | "green" | "glass";
  presenceUserId?: string;
  onPresenceClick?: () => void;
  presenceAriaLabel?: string;
  presenceSize?: "xs" | "sm" | "md";
  variant?: "row" | "stacked" | "call-log" | "participant-grid";
  /** Role label / presence — stays inside the identity block with avatar + name + shield */
  meta?: ReactNode;
  /** Non-identity line (e.g. message preview) — outside identity block, not trailing */
  subtitle?: ReactNode;
  /** Actions, counters, controls — separated from identity */
  trailing?: ReactNode;
  avatarOverlay?: ReactNode;
  className?: string;
  detailsClassName?: string;
  nameClassName?: string;
  userAvatar?: string;
  isOnline?: boolean;
  as?: ElementType;
  onClick?: () => void;
  type?: "button";
};

export function AlphaIdentityRow({
  name,
  role,
  avatar,
  avatarAlt = "",
  avatarSize = "md",
  avatarRing = "none",
  presenceUserId,
  onPresenceClick,
  presenceAriaLabel,
  presenceSize,
  variant = "row",
  meta,
  subtitle,
  trailing,
  avatarOverlay,
  className,
  detailsClassName,
  nameClassName,
  userAvatar,
  isOnline,
  as,
  onClick,
  type,
}: AlphaIdentityRowProps) {
  const Tag = as ?? (onClick ? "button" : "div");
  const isStacked = variant === "stacked";
  const isCallLog = variant === "call-log";
  const isParticipantGrid = variant === "participant-grid";
  const resolvedPresenceSize =
    presenceSize ?? (avatarSize === "xs" ? "xs" : avatarSize === "lg" ? "md" : "sm");
  const shieldPresenceStatus = usePresenceDot(presenceUserId ?? "");
  const resolvedShieldPresence = presenceUserId
    ? shieldPresenceStatus
    : isOnline
      ? "available"
      : isOnline === false
        ? null
        : undefined;

  const avatarImg = (
    <img
      src={avatar}
      alt={avatarAlt || name}
      loading="lazy"
      className={cn("alpha-identity-avatar__img", avatarRing === "none" && "border border-white/15")}
    />
  );

  const avatarCell = (
    <div className={cn("alpha-identity-block__avatar", isCallLog && "connect-call-log-row__avatar", ALPHA_IDENTITY_AVATAR_SIZES[avatarSize])}>
        {avatarRing === "none" ? (
          avatarImg
        ) : (
          <div
            className={cn(
              "alpha-identity-avatar__ring h-full w-full",
              avatarRing === "green" ? "alpha-identity-avatar__ring--green" : "alpha-identity-avatar__ring--glass",
            )}
          >
            {avatarImg}
          </div>
        )}
        {presenceUserId ? (
          <AlphaPresenceDot
            userId={presenceUserId}
            size={resolvedPresenceSize}
            onClick={onPresenceClick}
            ariaLabel={presenceAriaLabel}
          />
        ) : null}
        {avatarOverlay}
      </div>
  );

  if (isParticipantGrid) {
    return (
      <Tag
        type={Tag === "button" ? type ?? "button" : undefined}
        onClick={onClick}
        className={cn(
          "alpha-identity-row connect-participant-row connect-participant-row--grid connect-identity-grid-row",
          className,
        )}
      >
        <div className="connect-participant-row__avatar">
          {avatarRing === "none" ? (
            avatarImg
          ) : (
            <div
              className={cn(
                "alpha-identity-avatar__ring h-full w-full",
                avatarRing === "green" ? "alpha-identity-avatar__ring--green" : "alpha-identity-avatar__ring--glass",
              )}
            >
              {avatarImg}
            </div>
          )}
          {presenceUserId ? (
            <AlphaPresenceDot
              userId={presenceUserId}
              size="xs"
              onClick={onPresenceClick}
              ariaLabel={presenceAriaLabel}
            />
          ) : null}
          {avatarOverlay}
        </div>
        <div className={cn("connect-participant-row__details", detailsClassName)}>
          <p className={cn("truncate text-[12px] font-semibold leading-tight", nameClassName)}>{name}</p>
          {subtitle ? <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{subtitle}</p> : null}
          {!subtitle && meta ? <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{meta}</div> : null}
        </div>
        <div className="connect-participant-row__shield">
          <AlphaShield
            role={role}
            size="sm"
            userName={name}
            userAvatar={userAvatar ?? avatar}
            isOnline={isOnline}
            presenceStatus={resolvedShieldPresence}
          />
        </div>
        {trailing ? <div className="connect-identity-grid-row__trailing">{trailing}</div> : null}
      </Tag>
    );
  }

  if (isCallLog) {
    return (
      <Tag
        type={Tag === "button" ? type ?? "button" : undefined}
        onClick={onClick}
        className={cn("alpha-identity-row connect-call-log-row", className)}
      >
        {avatarCell}
        <div className={cn("connect-call-log-row__details", detailsClassName)}>
          <span className={cn("alpha-identity-name__text w-full truncate text-right", nameClassName)}>{name}</span>
          {meta ? <div className={cn(ALPHA_IDENTITY_BLOCK_ROLE, "w-full text-right")}>{meta}</div> : null}
        </div>
        <div className="connect-call-log-row__shield">
          <AlphaShield
            role={role}
            size="sm"
            userName={name}
            userAvatar={userAvatar ?? avatar}
            isOnline={isOnline}
            presenceStatus={resolvedShieldPresence}
          />
        </div>
        {trailing ? <div className="connect-call-log-row__trailing">{trailing}</div> : null}
      </Tag>
    );
  }

  const identityBlock = (
    <div className={cn(isStacked ? ALPHA_IDENTITY_BLOCK_STACKED : ALPHA_IDENTITY_BLOCK)}>
      {avatarCell}

      <div className={cn(ALPHA_IDENTITY_BLOCK_DETAILS, detailsClassName)}>
        <AlphaUserName
          name={name}
          role={role}
          size="sm"
          layout={isStacked ? "stacked" : "inline"}
          nameClassName={nameClassName}
          userAvatar={userAvatar ?? avatar}
          isOnline={isOnline}
          presenceUserId={presenceUserId}
        />
        {meta ? <div className={ALPHA_IDENTITY_BLOCK_ROLE}>{meta}</div> : null}
      </div>
    </div>
  );

  return (
    <Tag
      type={Tag === "button" ? type ?? "button" : undefined}
      onClick={onClick}
      className={cn(isStacked ? ALPHA_IDENTITY_ROW_STACKED : ALPHA_IDENTITY_ROW, className)}
    >
      {identityBlock}
      {subtitle && !isStacked ? <div className={ALPHA_IDENTITY_ROW_SECONDARY}>{subtitle}</div> : null}
      {trailing && !isStacked ? <div className={ALPHA_IDENTITY_TRAILING}>{trailing}</div> : null}
    </Tag>
  );
}
