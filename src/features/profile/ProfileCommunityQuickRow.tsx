import { Link } from "@tanstack/react-router";
import { Trophy, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  friendCount: number;
  onAchievements: () => void;
  dark?: boolean;
};

export function ProfileCommunityQuickRow({ friendCount, onAchievements, dark = false }: Props) {
  return (
    <div className="mt-3 flex gap-2">
      <Link
        to="/community/friends"
        className={cn(
          "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 active:scale-[0.98]",
          dark ? "border-white/10 bg-white/5" : "border-[#1f8a5a]/28 bg-[#1f8a5a]/08",
        )}
      >
        <UserPlus className="h-4 w-4 text-[#1f8a5a]" strokeWidth={2.1} />
        <span className={cn("text-[11px] font-extrabold", dark ? "text-white/85" : "text-[#1f8a5a]")}>
          {friendCount} أصدقاء
        </span>
      </Link>
      <Link
        to="/community/groups"
        className={cn(
          "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 active:scale-[0.98]",
          dark ? "border-white/10 bg-white/5" : "border-[#8a6ec1]/28 bg-[#8a6ec1]/08",
        )}
      >
        <Users className="h-4 w-4 text-[#8a6ec1]" strokeWidth={2.1} />
        <span className={cn("text-[11px] font-extrabold", dark ? "text-white/85" : "text-[#5a3d92]")}>
          مجموعات
        </span>
      </Link>
      <button
        type="button"
        onClick={onAchievements}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 active:scale-[0.98]",
          dark ? "border-white/10 bg-white/5" : "border-[#c98a3c]/28 bg-[#c98a3c]/08",
        )}
      >
        <Trophy className="h-4 w-4 text-[#c98a3c]" strokeWidth={2.1} />
        <span className={cn("text-[11px] font-extrabold", dark ? "text-white/85" : "text-[#7a4a26]")}>
          إنجازات
        </span>
      </button>
    </div>
  );
}
