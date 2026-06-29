import { Sparkles } from "lucide-react";
import controlCenterBg from "@/assets/control-center-bg.png";
import { MC } from "../platform-store";
import { formatPlatformNumber } from "../PlatformPremiumUI";
import type { usePlatformDashboard } from "../use-platform-dashboard";

type Dash = ReturnType<typeof usePlatformDashboard>;

export function FounderWelcomeCard({ dash }: { dash: Dash }) {
  return (
    <article
      className="relative mb-3 overflow-hidden rounded-[18px] border"
      style={{ borderColor: MC.panelBorder, background: MC.panel }}
    >
      <img
        src={controlCenterBg}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(28,28,30,0.72) 100%)" }}
      />
      <div className="relative flex items-center gap-3 px-4 py-3.5 text-right" dir="rtl">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[15px] font-extrabold text-white">
              Alpha Control Center
            </h2>
            <Sparkles className="h-4 w-4 shrink-0" style={{ color: MC.green }} />
          </div>
          <p className="mt-1 text-[10px] font-bold leading-snug" style={{ color: MC.muted }}>
            {dash.loading
              ? "جاري تحميل البيانات…"
              : `${formatPlatformNumber(dash.stats.users)} مستخدم · ${formatPlatformNumber(dash.stats.churches)} كنيسة · Health ${dash.healthScore}%`}
          </p>
        </div>
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border font-extrabold"
          style={{
            borderColor: `${MC.green}44`,
            background: `${MC.green}18`,
            color: MC.greenBright,
          }}
        >
          α
        </div>
      </div>
    </article>
  );
}
