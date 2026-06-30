import { Link } from "@tanstack/react-router";
import { ChevronLeft, UserPlus } from "lucide-react";
import { PROFILE_FRIENDS, PROFILE_SUGGESTIONS } from "../profile-seed";
import type { ProfileFriend } from "../types";
import { ProfileGlassCard } from "./shared";

function FriendAvatar({ friend }: { friend: ProfileFriend }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1.5 shrink-0 w-[68px] active:scale-95 transition-transform"
      aria-label={friend.name}
    >
      <div className="relative">
        <img
          src={friend.avatar}
          alt=""
          className="h-[52px] w-[52px] rounded-full border-2 border-[#f0d78c]/80 object-cover shadow-[0_6px_14px_-8px_rgba(58,42,24,0.35)]"
        />
        <span
          aria-hidden
          className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#fbf3e1]"
          style={{ background: friend.online ? "#2dbb7a" : "#b8a890" }}
        />
      </div>
      <span className="text-[10px] font-bold text-[#3a2a18] truncate w-full text-center leading-tight">
        {friend.name.split(" ")[0]}
      </span>
    </button>
  );
}

function SuggestionAvatar({ friend }: { friend: ProfileFriend }) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 w-[68px]">
      <div className="relative">
        <img
          src={friend.avatar}
          alt=""
          className="h-[48px] w-[48px] rounded-full border border-[#efe2c4] object-cover opacity-90"
        />
        <span
          aria-hidden
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#fbf3e1]"
          style={{ background: friend.online ? "#2dbb7a" : "#b8a890" }}
        />
      </div>
      <span className="text-[9.5px] font-semibold text-[#6a543a] truncate w-full text-center">
        {friend.name.split(" ")[0]}
      </span>
    </div>
  );
}

export function ProfileFriends() {
  return (
    <div className="space-y-4">
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar px-0.5 pb-1"
        style={{ scrollPaddingInline: 4 }}
      >
        {PROFILE_FRIENDS.map((f) => (
          <FriendAvatar key={f.id} friend={f} />
        ))}
      </div>

      <Link
        to="/messages"
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#efe2c4] bg-white/70 py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-[0.98] transition"
      >
        عرض كل الأصدقاء
        <ChevronLeft className="h-3.5 w-3.5 text-[#b8893a]" />
      </Link>

      <div>
        <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
          <UserPlus className="h-3.5 w-3.5 text-[#b8893a]" />
          <h3 className="text-[12.5px] font-extrabold text-[#5a4a38]">أشخاص قد تعرفهم</h3>
        </div>
        <ProfileGlassCard className="p-3">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {PROFILE_SUGGESTIONS.map((f) => (
              <SuggestionAvatar key={f.id} friend={f} />
            ))}
          </div>
        </ProfileGlassCard>
      </div>
    </div>
  );
}
