import { CommunityPersonAvatarChip } from "./CommunityPersonAvatarChip";

type Props = {
  name: string;
  avatarUrl?: string;
  subtitle?: string;
  onOpen: () => void;
  onAdd: () => void;
  onDismiss?: () => void;
  busy?: boolean;
  addLabel?: string;
  pending?: boolean;
  connected?: boolean;
  showDismiss?: boolean;
  className?: string;
  compact?: boolean;
};

/** Profile / discover suggestion card — delegates to shared avatar chip. */
export function SuggestedFriendCard({
  name,
  avatarUrl,
  subtitle,
  onOpen,
  onAdd,
  onDismiss,
  busy = false,
  connected = false,
  pending = false,
  showDismiss = true,
  className,
}: Props) {
  if (connected) {
    return (
      <article className={className}>
        <CommunityPersonAvatarChip
          name={name}
          avatarUrl={avatarUrl}
          subtitle={subtitle}
          onOpen={onOpen}
        />
        <span className="mt-1 block w-full rounded-[10px] border border-[#1f8a5a]/35 bg-[#1f8a5a]/12 py-2 text-center text-[11px] font-extrabold text-[#1f8a5a]">
          صديق
        </span>
      </article>
    );
  }

  if (pending) {
    return (
      <article className={className}>
        <CommunityPersonAvatarChip
          name={name}
          avatarUrl={avatarUrl}
          subtitle={subtitle}
          onOpen={onOpen}
        />
        <span className="mt-1 block w-full rounded-[10px] border border-alpha-gold-bright/40 bg-alpha-gold-bright/12 py-2 text-center text-[10px] font-extrabold text-alpha-gold-deep">
          تم الإرسال
        </span>
      </article>
    );
  }

  return (
    <CommunityPersonAvatarChip
      className={className}
      name={name}
      avatarUrl={avatarUrl}
      subtitle={subtitle}
      busy={busy}
      showQuickAdd
      showDismiss={showDismiss}
      onOpen={onOpen}
      onQuickAdd={onAdd}
      onDismiss={onDismiss}
    />
  );
}
