import { Link } from "@tanstack/react-router";
import { Compass, HandHeart, UserPlus } from "lucide-react";
import { COMMUNITY_ROUTES } from "./community-routes";
import {
  COMMUNITY_GLASS_TAB_DEFAULT,
  COMMUNITY_GLASS_TAB_PRAYER,
} from "./community-glass-chrome";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: COMMUNITY_ROUTES.discover, label: "اكتشف أعضاء", icon: Compass, accent: "#5b8fd1", large: false },
  { to: COMMUNITY_ROUTES.friends, label: "أصدقائي", icon: UserPlus, accent: "#1f8a5a", large: false },
  { to: COMMUNITY_ROUTES.prayerRequests, label: "الصلاة", icon: HandHeart, accent: "#8a6ec1", large: true },
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
            className={cn(
              "flex items-center gap-1.5 font-extrabold text-alpha-heading",
              item.large ? COMMUNITY_GLASS_TAB_PRAYER : COMMUNITY_GLASS_TAB_DEFAULT,
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
            />
            <Icon className={cn("shrink-0", item.large ? "h-4 w-4" : "h-3.5 w-3.5")} style={{ color: item.accent }} strokeWidth={2.2} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
