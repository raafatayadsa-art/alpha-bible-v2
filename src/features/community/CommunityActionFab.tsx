import { Link } from "@tanstack/react-router";
import { HandHeart, Plus, Sparkles, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { COMMUNITY_ROUTES } from "./community-routes";
import { COMMUNITY_GLASS_BTN, COMMUNITY_GLASS_CHIP } from "./community-glass-chrome";

const ACTIONS = [
  { label: "اكتشف أعضاء", to: COMMUNITY_ROUTES.discover, icon: UserPlus, accent: "#1f8a5a" },
  { label: "طلب صلاة", to: "/prayer-requests", icon: HandHeart, accent: "#8a6ec1" },
  { label: "السجل الروحي", to: "/community/spiritual-record", icon: Sparkles, accent: "#c98a3c" },
] as const;

type Props = {
  hidden?: boolean;
};

/** Floating quick-action hub on community screens (design Screen 1 FAB). */
export function CommunityActionFab({ hidden = false }: Props) {
  const [open, setOpen] = useState(false);

  if (hidden) return null;

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="إغلاق"
          className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        dir="rtl"
        className="fixed z-[46] flex flex-col items-end gap-2"
        style={{
          bottom: "calc(max(env(safe-area-inset-bottom), 8px) + 88px)",
          left: "max(16px, env(safe-area-inset-left))",
        }}
      >
        {open ? (
          <div className={`mb-1 flex flex-col gap-1.5 p-2 ${COMMUNITY_GLASS_CHIP} rounded-[20px]`}>
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-[0.98]"
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-xl border border-white/40 backdrop-blur-sm"
                    style={{ background: `${action.accent}18`, color: action.accent }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.1} />
                  </span>
                  {action.label}
                </Link>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={open ? "إغلاق القائمة" : "إجراءات المجتمع"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex h-12 min-w-[52px] items-center justify-center gap-1 rounded-2xl border-2 px-4 active:scale-95 transition-transform backdrop-blur-lg",
            open
              ? "border-[#3a2a18]/20 bg-[#3a2a18]/90 text-white shadow-[0_12px_28px_-8px_rgba(0,0,0,0.45)]"
              : `${COMMUNITY_GLASS_BTN} border-[#e7c97a]/55 text-[#3a2a18] shadow-[0_12px_28px_-8px_rgba(184,137,58,0.55)] bg-gradient-to-br from-[#f0d78c]/90 to-[#c79356]/88`,
          )}
        >
          {open ? <X className="h-5 w-5" strokeWidth={2.4} /> : <Plus className="h-6 w-6" strokeWidth={2.6} />}
        </button>
      </div>
    </>
  );
}
