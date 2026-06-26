import { Link } from "@tanstack/react-router";
import { Bus, Church, HandHeart } from "lucide-react";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { useResolvedTheme } from "@/lib/alpha-theme";
import { cn } from "@/lib/utils";

type ActivityRow = {
  glyph: string;
  label: string;
  value: string;
  accent: string;
  icon: typeof Church;
  to?: string;
  params?: Record<string, string>;
};

function ActivityCell({ row }: { row: ActivityRow }) {
  const isDark = useResolvedTheme() === "dark";
  const Icon = row.icon;
  const inner = (
    <div
      className="alpha-profile-ledger-cell flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-transform active:scale-[0.99]"
      dir="rtl"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
          style={{
            borderColor: `${row.accent}44`,
            background: `${row.accent}18`,
            color: row.accent,
          }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 text-right">
          <p className="text-[11.5px] font-extrabold text-alpha-profile-ledger">{row.label}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-alpha-profile-ledger-muted">{row.value}</p>
        </div>
      </div>
      <span
        aria-hidden
        className={cn(
          "shrink-0 select-none text-[16px] font-black leading-none",
          isDark ? "hero-ledger-glyph-gold" : "text-alpha-glyph",
        )}
      >
        {row.glyph}
      </span>
    </div>
  );

  if (row.to && row.params) {
    return (
      <Link to={row.to as "/church/post/$id"} params={row.params} className="block">
        {inner}
      </Link>
    );
  }
  if (row.to) {
    return (
      <Link to={row.to as "/church" | "/prayer-requests"} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function ProfileActivityLedger({
  lastMassTitle,
  lastMassWhen,
  lastMassPostId,
  lastTripTitle,
  lastTripDate,
  prayerCount,
  lastPrayerTitle,
}: {
  lastMassTitle: string | null;
  lastMassWhen: string | null;
  lastMassPostId?: string | null;
  lastTripTitle: string | null;
  lastTripDate: string | null;
  prayerCount: number;
  lastPrayerTitle: string | null;
}) {
  const rows: ActivityRow[] = [
    {
      glyph: "Ⲁ",
      label: "آخر قداس حضرته",
      value: lastMassTitle
        ? `${lastMassTitle}${lastMassWhen ? ` · ${lastMassWhen}` : ""}`
        : "سجّل حضورك من منشورات الكنيسة",
      accent: "#7a4a26",
      icon: Church,
      to: lastMassPostId ? "/church/post/$id" : "/church",
      params: lastMassPostId ? { id: lastMassPostId } : undefined,
    },
    {
      glyph: "Ⲱ",
      label: "آخر رحلة",
      value: lastTripTitle
        ? `${lastTripTitle}${lastTripDate ? ` · ${lastTripDate}` : ""}`
        : "لم تُسجّل رحلات بعد",
      accent: "#d4af37",
      icon: Bus,
      to: "/church",
    },
    {
      glyph: "Ⲁ",
      label: "طلبات صلاة قدّمتها",
      value: prayerCount > 0
        ? `${prayerCount} طلب${lastPrayerTitle ? ` · آخرها: ${lastPrayerTitle}` : ""}`
        : "لم تُقدّم طلبات بعد",
      accent: "#8a6ec1",
      icon: HandHeart,
      to: "/prayer-requests",
    },
  ];

  return (
    <section className="mt-4">
      <HeroLedgerStylesHost />
      <h2 className="mb-2.5 px-0.5 text-[13px] font-extrabold text-alpha-heading">نشاطي الأخير</h2>
      <div className="space-y-2">{rows.map((row) => <ActivityCell key={row.label} row={row} />)}</div>
    </section>
  );
}
