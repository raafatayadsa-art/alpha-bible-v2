import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, Menu, Scan, Search, Siren } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAdminPermissions } from "../admin-team/useAdminPermissions";
import { COMMAND_ICONS } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
const MODULE_LINKS = [
  { to: "/platform/approvals", title: "مركز الاعتمادات", icon: COMMAND_ICONS.approvals, accent: MC.gold },
  { to: "/platform/privacy", title: "الخصوصية والأمان", icon: COMMAND_ICONS.privacy, accent: MC.green },
  { to: "/platform/modules", title: "إدارة الموديولات", icon: COMMAND_ICONS.modules, accent: MC.purple },
  { to: "/platform/reports", title: "المحتوى المبلغ", icon: COMMAND_ICONS.reports, accent: MC.red },
  { to: "/platform/church-locations", title: "مدير مواقع الكنائس", icon: COMMAND_ICONS.churchLocations, accent: PP_GOLD },
  { to: "/platform/publisher-center", title: "مركز الناشرين", icon: COMMAND_ICONS.contentReview, accent: MC.gold },
  { to: "/platform/content-review", title: "مراجعة المحتوى", icon: COMMAND_ICONS.contentReview, accent: MC.cyan },
  { to: "/platform/media-manager", title: "Media Manager", icon: COMMAND_ICONS.mediaManager, accent: PP_GOLD },
  { to: "/platform/churches", title: "إدارة صفحات الكنائس", icon: COMMAND_ICONS.churches, accent: MC.purple },
  { to: "/platform/monasteries", title: "إدارة الأديرة", icon: COMMAND_ICONS.monasteries, accent: MC.cyan },
  { to: "/platform/analytics", title: "التحليلات", icon: COMMAND_ICONS.analytics, accent: MC.blue },
  { to: "/platform/ai", title: "AI Control", icon: COMMAND_ICONS.ai, accent: MC.purple },
  { to: "/platform/audit", title: "سجل التدقيق", icon: COMMAND_ICONS.audit, accent: MC.blue },
  { to: "/platform/team", title: "فريق Alpha", icon: COMMAND_ICONS.team, accent: PP_GOLD },
  { to: "/platform/settings", title: "إعدادات النظام", icon: COMMAND_ICONS.settings, accent: MC.steel },
  { to: "/platform/library", title: "مكتبة Alpha", icon: COMMAND_ICONS.library, accent: MC.blue },
  { to: "/platform/emergency", title: "مركز الطوارئ", icon: Siren, accent: MC.red },
  { to: "/platform/scan", title: "Scan Center", icon: Scan, accent: MC.purple },
] as const;

export function FounderModulesSheet({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const { canAccessRoute, loading: permsLoading } = useAdminPermissions();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;
  const setSheetOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowed = MODULE_LINKS.filter((m) => permsLoading || canAccessRoute(m.to));
    if (!q) return allowed;
    return allowed.filter((m) => m.title.toLowerCase().includes(q) || m.to.includes(q));
  }, [query, canAccessRoute, permsLoading]);

  return (
    <>
      {!isControlled ? (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mb-3 flex w-full items-center justify-between gap-2 rounded-[14px] border px-3.5 py-2.5 transition active:scale-[0.98]"
          style={{ borderColor: MC.panelBorder, background: MC.panel }}
        >
          <LayoutGrid className="h-4 w-4" style={{ color: MC.purple }} />
          <span className="text-[11px] font-extrabold" style={{ color: MC.white }}>
            All Modules
          </span>
          <Menu className="h-4 w-4" style={{ color: MC.gold }} />
        </button>
      ) : null}

      <Sheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next);
          if (!next) setQuery("");
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-sm overflow-y-auto border-l [&>button.absolute]:hidden"
          style={{ background: MC.midnight, borderColor: MC.panelBorder }}
        >
          <SheetHeader className="items-end text-right">
            <SheetTitle style={{ color: MC.white }}>Alpha Control Modules</SheetTitle>
          </SheetHeader>
          <div
            className="mt-3 flex items-center gap-2 rounded-[12px] border px-3 py-2"
            style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.25)" }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: MC.cyan }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث في الموديولات…"
              className="min-w-0 flex-1 bg-transparent text-[11px] font-bold outline-none placeholder:text-slate-500"
              style={{ color: MC.white }}
            />
          </div>
          <div className="mt-4 space-y-1.5">
            {filtered.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2.5 rounded-[12px] border px-3 py-2.5 transition active:scale-[0.98]"
                  style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}
                >
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px]"
                    style={{ background: `${m.accent}22`, color: m.accent }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-right text-[11px] font-extrabold" style={{ color: MC.white }}>
                    {m.title}
                  </span>
                </Link>
              );
            })}
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-[10px] font-bold" style={{ color: MC.muted }}>
                لا توجد نتائج
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
