import { Link } from "@tanstack/react-router";
import { BookOpen, Church, HandHeart } from "lucide-react";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { cn } from "@/lib/utils";
import type { CommunityMoment } from "./community-types";
import { friendActivityIconKind, friendActivityLabel } from "./community-activity-copy";
import { formatCommunityTime } from "./community-store";

const ICONS = {
  reading: BookOpen,
  prayer: HandHeart,
  agpeya: Church,
} as const;

const ICON_TONE = {
  reading: { bg: "rgba(138,110,193,0.14)", color: "#8a6ec1", border: "rgba(138,110,193,0.28)" },
  prayer: { bg: "rgba(31,138,90,0.12)", color: "#1f8a5a", border: "rgba(31,138,90,0.28)" },
  agpeya: { bg: "rgba(201,138,60,0.14)", color: "#c98a3c", border: "rgba(201,138,60,0.28)" },
} as const;

function activityLink(moment: CommunityMoment): { to: string; params?: Record<string, string> } | null {
  if (moment.kind === "reading" && moment.payload.reading?.bookRoute) {
    return {
      to: "/$book/$chapter",
      params: {
        book: moment.payload.reading.bookRoute,
        chapter: String(moment.payload.reading.chapter ?? 1),
      },
    };
  }
  if (moment.kind === "agpeya" && moment.payload.agpeya?.prayerId) {
    return { to: "/agpeya/$prayerId", params: { prayerId: moment.payload.agpeya.prayerId } };
  }
  if (moment.kind === "prayer") return { to: "/prayer-requests" };
  return null;
}

export function CommunityFriendActivityItem({ moment }: { moment: CommunityMoment }) {
  const kind = friendActivityIconKind(moment);
  const Icon = ICONS[kind];
  const tone = ICON_TONE[kind];
  const label = friendActivityLabel(moment);
  const href = activityLink(moment);

  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[18px] border border-[#e7c97a]/22 bg-white/80 px-3 py-3 text-right shadow-[0_8px_22px_-16px_rgba(80,50,20,0.35)]",
        href ? "active:scale-[0.99] transition-transform" : "",
      )}
    >
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border"
        style={{ background: tone.bg, borderColor: tone.border, color: tone.color }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.1} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-snug text-[#3a2a18]">{label}</p>
        <p className="mt-0.5 text-[10px] font-semibold text-[#9a8468]">
          {moment.churchName ? `${moment.churchName} · ` : ""}
          {formatCommunityTime(moment.createdAt)}
        </p>
      </div>
      <PrayerUserAvatar name={moment.userName} avatarUrl={moment.userAvatarUrl} size="sm" />
    </div>
  );

  if (href?.params) {
    if (href.to === "/agpeya/$prayerId") {
      return (
        <Link to="/agpeya/$prayerId" params={{ prayerId: String(href.params.prayerId) }}>
          {inner}
        </Link>
      );
    }
    return (
      <Link to={href.to as "/$book/$chapter"} params={href.params as { book: string; chapter: string }}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return <Link to={href.to as "/prayer-requests"}>{inner}</Link>;
  }
  return inner;
}
