import { Link } from "@tanstack/react-router";
import { Compass, HandHeart, Sparkles, UserPlus } from "lucide-react";
import { COMMUNITY_ROUTES } from "./community-routes";
import { COMMUNITY_GLASS_CHIP } from "./community-glass-chrome";

const LINKS = [
  { to: COMMUNITY_ROUTES.discover, label: "اكتشف أعضاء", icon: Compass, accent: "#5b8fd1" },
  { to: COMMUNITY_ROUTES.friends, label: "أصدقائي", icon: UserPlus, accent: "#1f8a5a" },
  { to: COMMUNITY_ROUTES.spiritualRecord, label: "السجل", icon: Sparkles, accent: "#c98a3c" },
  { to: COMMUNITY_ROUTES.prayerRequests, label: "الصلاة", icon: HandHeart, accent: "#8a6ec1" },
] as const;

export function CommunityHubLinks() {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
      {LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex shrink-0 items-center gap-1.5 px-3.5 py-2 text-[10px] font-extrabold text-[#3a2a18] ${COMMUNITY_GLASS_CHIP}`}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: item.accent }} strokeWidth={2.2} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
