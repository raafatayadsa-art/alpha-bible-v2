import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { cn } from "@/lib/utils";
import { CommunityPersonQuickMenu } from "./CommunityPersonQuickMenu";

type Props = {
  name: string;
  avatarUrl?: string;
  subtitle?: string;
  onOpen: () => void;
  onDismiss?: () => void;
  onQuickAdd?: () => void;
  busy?: boolean;
  showQuickAdd?: boolean;
  showDismiss?: boolean;
  className?: string;
};

/** Avatar chip — tap photo for card; + opens quick menu; X to remove from list. */
export function CommunityPersonAvatarChip({
  name,
  avatarUrl,
  subtitle,
  onOpen,
  onDismiss,
  onQuickAdd,
  busy = false,
  showQuickAdd = false,
  showDismiss = false,
  className,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = name.split(" ")[0];

  return (
    <article className={cn("flex w-[88px] shrink-0 flex-col items-center", className)}>
      <div className="relative z-10 pt-0.5">
        <button
          type="button"
          onClick={onOpen}
          className="block touch-manipulation active:scale-95"
          aria-label={`عرض ${name}`}
        >
          <PrayerUserAvatar name={name} avatarUrl={avatarUrl} size="lg" />
        </button>

        {showDismiss && onDismiss ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }}
            aria-label={`إزالة ${name}`}
            className="absolute -right-0.5 -top-0.5 z-[3] grid h-[20px] w-[20px] touch-manipulation place-items-center rounded-full border border-white/25 bg-[#2a2018]/70 text-white/90 backdrop-blur-[2px] active:scale-90"
          >
            <X className="h-2.5 w-2.5" strokeWidth={2.5} />
          </button>
        ) : null}

        {showQuickAdd && onQuickAdd ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              aria-label={`إجراءات ${name}`}
              aria-expanded={menuOpen}
              className="absolute -bottom-0.5 -right-0.5 z-[3] grid h-[22px] w-[22px] touch-manipulation place-items-center rounded-full border-2 border-[#1a1410]/20 bg-white text-[#1a1410] shadow-[0_3px_10px_-3px_rgba(0,0,0,0.35)] active:scale-90 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" strokeWidth={2.8} />
              )}
            </button>
            <CommunityPersonQuickMenu
              open={menuOpen}
              busy={busy}
              onClose={() => setMenuOpen(false)}
              onAdd={onQuickAdd}
              onProfile={onOpen}
            />
          </>
        ) : null}
      </div>

      <p className="mt-1.5 w-full truncate text-center text-[11px] font-extrabold text-alpha-heading">
        {displayName}
      </p>
      {subtitle ? (
        <p className="mt-0.5 w-full truncate text-center text-[9.5px] font-semibold text-alpha-muted">
          {subtitle}
        </p>
      ) : null}
    </article>
  );
}
