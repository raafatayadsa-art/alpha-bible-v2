import { Bell, Crown, LayoutGrid, Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminPermissions } from "../admin-team/useAdminPermissions";
import { MC } from "../platform-store";

export function FounderControlHeader({
  alertCount = 0,
  onOpenModules,
}: {
  alertCount?: number;
  onOpenModules?: () => void;
}) {
  const navigate = useNavigate();
  const { isHiddenOwner, loading: ownerLoading } = useAdminPermissions();

  return (
    <header className="mb-3 pt-[max(env(safe-area-inset-top),6px)]">
      {!ownerLoading && isHiddenOwner ? (
        <div
          className="mb-2 flex items-center justify-center gap-2 rounded-full border px-3 py-1.5"
          style={{ borderColor: `${MC.green}44`, background: `${MC.green}14` }}
        >
          <Crown className="h-4 w-4" style={{ color: MC.greenBright }} />
          <span className="text-[12px] font-extrabold" style={{ color: MC.greenBright }}>
            المؤسس · Alpha Control
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => navigate({ to: "/platform/approvals" })}
            className="relative grid h-10 w-10 place-items-center rounded-[12px] border active:scale-95"
            style={{
              borderColor: `${MC.green}44`,
              background: MC.panel,
            }}
          >
            <Bell className="h-[18px] w-[18px]" style={{ color: MC.green }} strokeWidth={2} />
            {alertCount > 0 ? (
              <span
                className="absolute -left-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 font-mono text-[8px] font-bold tabular-nums"
                style={{ background: MC.red, color: MC.white }}
              >
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            aria-label="Alpha Control Settings"
            onClick={() => navigate({ to: "/platform/settings" })}
            className="relative grid h-10 w-10 place-items-center rounded-full border font-extrabold transition active:scale-95"
            style={{
              borderColor: `${MC.green}55`,
              background: `${MC.green}18`,
              color: MC.greenBright,
            }}
          >
            <Settings className="h-[17px] w-[17px]" strokeWidth={2.2} />
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"
              style={{ borderColor: MC.midnight, background: MC.green, boxShadow: `0 0 6px ${MC.green}` }}
            />
          </button>
        </div>

        <div className="text-center">
          <p className="text-[16px] font-extrabold tracking-[0.08em]" style={{ color: MC.white }}>
            ALPHA
          </p>
          <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: MC.muted }}>
            Control Center
          </p>
        </div>

        <button
          type="button"
          aria-label="All modules"
          onClick={onOpenModules}
          className="grid h-10 w-10 place-items-center rounded-[12px] border active:scale-95"
          style={{ borderColor: MC.panelBorder, background: MC.panel }}
        >
          <LayoutGrid className="h-[18px] w-[18px]" style={{ color: MC.purple }} />
        </button>
      </div>
    </header>
  );
}
