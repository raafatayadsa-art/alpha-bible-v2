import { MessageCircle, Phone, Settings, Users } from "lucide-react";
import { useEffect } from "react";
import { AlphaConnectLogo } from "./AlphaConnectLogo";
import { cn } from "@/lib/utils";
import { ALPHA_TW } from "./alpha-responsive";
import { activateBottomNavLayout } from "@/components/navigation/alpha-bottom-nav-layout";
import {
  type AlphaConnectNavTab,
  alphaConnectModeToNavTab,
} from "@/features/alpha-connect/alpha-connect-nav";
import type { AlphaConnectMode } from "./alpha-connect-screen";

export type AlphaConnectBottomNavigationProps = {
  mode: AlphaConnectMode;
  settingsOpen?: boolean;
  visible?: boolean;
  unreadMessages?: number;
  themeClassName?: string;
  onTabPress: (tab: AlphaConnectNavTab) => void;
};

/** Alpha · Settings · Channels (center) · Messages · اتصال */
const TAB_ORDER: AlphaConnectNavTab[] = ["alpha", "settings", "channels", "messages", "calls"];

const TAB_LABELS: Record<AlphaConnectNavTab, string> = {
  alpha: "Alpha",
  settings: "الإعدادات",
  channels: "القنوات",
  messages: "الرسائل",
  calls: "اتصال",
};

const CENTER_TAB: AlphaConnectNavTab = "channels";

export function AlphaConnectBottomNavigation({
  mode,
  settingsOpen = false,
  visible = true,
  unreadMessages = 0,
  themeClassName,
  onTabPress,
}: AlphaConnectBottomNavigationProps) {
  const activeTab = alphaConnectModeToNavTab(mode, settingsOpen);

  useEffect(() => {
    if (!visible) return;
    return activateBottomNavLayout();
  }, [visible]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center pb-[max(16px,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        themeClassName,
        visible ? "translate-y-0 opacity-100" : "translate-y-[calc(100%+12px)] opacity-0",
      )}
      style={{ ["--alpha-connect-nav-dock-height" as string]: "72px" }}
    >
      <nav
        aria-label="Alpha Connect"
        className={cn("pointer-events-auto w-[calc(100%-32px)] shrink-0", ALPHA_TW.dockMax)}
      >
        <div className="connect-bottom-dock-bar alpha-dock-bar flex items-end gap-0.5 rounded-3xl px-1.5 py-2 sm:gap-1 sm:px-2 sm:py-2.5">
          {TAB_ORDER.map((tab) => {
            const active = tab === activeTab;
            const isCenter = tab === CENTER_TAB;
            const badge =
              tab === "messages" && unreadMessages > 0
                ? unreadMessages > 99
                  ? "99+"
                  : unreadMessages
                : undefined;

            return (
              <button
                key={tab}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onTabPress(tab)}
                className={cn(
                  "connect-dock-tab relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1 transition-transform active:scale-95 sm:gap-1 sm:py-1.5",
                  active && "connect-dock-tab--active",
                  isCenter && "connect-dock-tab--center -mt-1.5 sm:-mt-2",
                )}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center",
                    isCenter ? "h-8 w-8 sm:h-9 sm:w-9" : "h-6 w-6 sm:h-7 sm:w-7",
                  )}
                >
                  {tab === "alpha" ? (
                    <AlphaConnectLogo
                      size="sm"
                      animated={false}
                      className={cn(isCenter ? "scale-[0.5]" : "scale-[0.42]")}
                    />
                  ) : tab === "channels" ? (
                    <Users
                      className={cn(
                        "connect-dock-icon h-5 w-5 sm:h-[22px] sm:w-[22px]",
                        isCenter && "h-[22px] w-[22px] sm:h-6 sm:w-6",
                      )}
                      strokeWidth={2.1}
                    />
                  ) : tab === "calls" ? (
                    <Phone className="connect-dock-icon h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.1} />
                  ) : tab === "messages" ? (
                    <MessageCircle className="connect-dock-icon h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.1} />
                  ) : (
                    <Settings className="connect-dock-icon h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.1} />
                  )}
                  {badge ? (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "connect-dock-icon connect-dock-label text-[8.5px] leading-none sm:text-[9.5px]",
                    active && "font-semibold",
                  )}
                >
                  {TAB_LABELS[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
