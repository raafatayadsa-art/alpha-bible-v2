import { Link } from "@tanstack/react-router";
import {
  ChevronLeft, Settings, Shield, LifeBuoy, Church, Info,
} from "lucide-react";
import { ProfileGlassCard } from "./shared";

const MORE_ITEMS = [
  { to: "/settings", label: "الإعدادات", icon: Settings, accent: "#3f9d6e" },
  { to: "/settings/trust", label: "الخصوصية", icon: Shield, accent: "#6b9fd4" },
  { to: "/settings", label: "الدعم", icon: LifeBuoy, accent: "#8a6ec1" },
  { to: "/churches-directory", label: "دليل الكنائس", icon: Church, accent: "#b8893a" },
  { to: "/intro", label: "عن Alpha", icon: Info, accent: "#6a543a" },
] as const;

export function ProfileMore() {
  return (
    <ProfileGlassCard className="divide-y divide-[#efe2c4]/70">
      {MORE_ITEMS.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className="flex items-center justify-between gap-3 px-4 py-3.5 active:bg-white/40 transition"
        >
          <ChevronLeft className="h-4 w-4 text-[#b8893a]/60 shrink-0" />
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <span className="text-[13px] font-extrabold text-[#3a2a18]">{item.label}</span>
            <span
              className="grid h-9 w-9 place-items-center rounded-xl shrink-0"
              style={{
                background: `linear-gradient(160deg, ${item.accent}18, ${item.accent}30)`,
                color: item.accent,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6)`,
              }}
            >
              <item.icon className="h-4 w-4" strokeWidth={2.3} />
            </span>
          </div>
        </Link>
      ))}
    </ProfileGlassCard>
  );
}
