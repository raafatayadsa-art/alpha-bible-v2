import { useNavigate } from "@tanstack/react-router";
import { UserPlus, Users } from "lucide-react";
import { COMMUNITY_ROUTES } from "./community-routes";
import { cn } from "@/lib/utils";

type Props = {
  friendsCount?: number;
  className?: string;
};

/** Reference-style top pills: أصدقاء | أضف أصدقاء */
export function FriendsHubPills({ friendsCount = 0, className }: Props) {
  const navigate = useNavigate();

  return (
    <div className={cn("flex gap-2.5", className)}>
      <button
        type="button"
        onClick={() => void navigate({ to: COMMUNITY_ROUTES.friends })}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-alpha bg-alpha-surface py-3.5 text-[14px] font-extrabold text-alpha-heading shadow-[var(--alpha-shadow-mini)] active:scale-[0.98]"
      >
        <Users className="h-5 w-5 shrink-0 text-alpha-muted" strokeWidth={2.1} />
        أصدقاء
        {friendsCount > 0 ? (
          <span className="rounded-full bg-alpha-gold-bright/20 px-2 py-0.5 text-[11px] font-extrabold text-alpha-gold-deep">
            {friendsCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => void navigate({ to: COMMUNITY_ROUTES.addFriend })}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-alpha bg-alpha-surface py-3.5 text-[14px] font-extrabold text-alpha-heading shadow-[var(--alpha-shadow-mini)] active:scale-[0.98]"
      >
        <UserPlus className="h-5 w-5 shrink-0 text-alpha-muted" strokeWidth={2.1} />
        أضف أصدقاء
      </button>
    </div>
  );
}
