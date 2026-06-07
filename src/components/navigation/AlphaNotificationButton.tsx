import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifUnreadCount } from "@/data/notifications-store";

export const ALPHA_HEADER_BTN =
  "grid h-11 w-11 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition";

export const ALPHA_NOTIFICATIONS_ROUTE = "/church/notifications" as const;

export type AlphaNotificationButtonProps = {
  tone?: "light" | "dark";
  className?: string;
};

/** Official notifications control — reads unread count from shared store. */
export function AlphaNotificationButton({
  tone = "light",
  className,
}: AlphaNotificationButtonProps) {
  const unreadCount = useNotifUnreadCount();

  const btnClass =
    tone === "dark"
      ? "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#0e1a2e]/55 backdrop-blur-xl text-[#f3e6c4] active:scale-95 transition"
      : ALPHA_HEADER_BTN;

  return (
    <Link
      to={ALPHA_NOTIFICATIONS_ROUTE}
      aria-label="الإشعارات"
      data-alpha-edge-ignore
      className={cn(btnClass, "relative", tone === "light" && "text-[#3a2a18]", className)}
    >
      <Bell className="h-5 w-5" strokeWidth={2} />
      {unreadCount > 0 ? (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d88a2a] px-1 text-[10px] font-bold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
