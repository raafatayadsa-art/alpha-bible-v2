import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifUnreadCount } from "@/data/notifications-store";
import { useAlphaNotifications } from "@/components/navigation/AlphaNotificationsProvider";

export const ALPHA_HEADER_BTN =
  "grid h-11 w-11 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-95 transition";

/** Legacy deep-link path — opens overlay via redirect, not navigation target. */
export const ALPHA_NOTIFICATIONS_ROUTE = "/church/notifications" as const;

export type AlphaNotificationButtonProps = {
  tone?: "light" | "dark";
  className?: string;
};

/** Opens the global notifications overlay — does not navigate. */
export function AlphaNotificationButton({
  tone = "light",
  className,
}: AlphaNotificationButtonProps) {
  const unreadCount = useNotifUnreadCount();
  const { toggleNotifications } = useAlphaNotifications();

  const btnClass =
    tone === "dark"
      ? "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#0e1a2e]/55 backdrop-blur-xl text-[#f3e6c4] active:scale-95 transition"
      : ALPHA_HEADER_BTN;

  return (
    <button
      type="button"
      aria-label="الإشعارات"
      data-alpha-edge-ignore
      onClick={toggleNotifications}
      className={cn(btnClass, "relative", tone === "light" && "text-[#3a2a18]", className)}
    >
      <Bell className="h-5 w-5" strokeWidth={2} />
      {unreadCount > 0 ? (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d88a2a] px-1 text-[10px] font-bold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
