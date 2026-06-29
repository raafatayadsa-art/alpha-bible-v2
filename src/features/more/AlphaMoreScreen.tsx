import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  Heart,
  HelpCircle,
  Info,
  Settings,
  Share2,
  Sparkles,
  Sun,
} from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { BackButton } from "@/components/bible";
import { CopticWatermark } from "@/components/coptic";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { usePlatformModules } from "@/lib/platform-modules";

type MoreRow = {
  id: string;
  label: string;
  icon: typeof Sun;
  to?: string;
  onClick?: () => void;
  cta?: { label: string; onClick: () => void };
};

export function AlphaMoreScreen() {
  const navigate = useNavigate();
  const { isModuleEnabled } = usePlatformModules();
  const donationsOn = isModuleEnabled("donations");

  const shareApp = () => {
    void openAlphaShareSheet({
      title: "Alpha Bible",
      body: "تطبيق Alpha Bible — الكتاب المقدس والمجتمع الكنسي والحياة الروحية في مكان واحد.",
      meta: "alpha-bible.app",
    });
  };

  const rows: MoreRow[] = [
    { id: "events", label: "أحداث", icon: CalendarDays, to: "/feasts" },
    { id: "verse", label: "آية اليوم", icon: Sun, to: "/bible/today" },
    ...(donationsOn
      ? [
          {
            id: "donate",
            label: "تبرع",
            icon: Heart,
            to: "/donate",
            cta: {
              label: "تبرع الآن",
              onClick: () => void navigate({ to: "/donate" }),
            },
          } satisfies MoreRow,
        ]
      : []),
    { id: "share", label: "شارك تطبيق Alpha Bible", icon: Share2, onClick: shareApp },
    { id: "reading", label: "إعدادات القراءة", icon: BookOpenCheck, to: "/settings/reading" },
    { id: "settings", label: "الإعدادات المتقدمة", icon: Settings, to: "/settings" },
    { id: "about", label: "من نحن", icon: Info, to: "/settings" },
    { id: "help", label: "مساعدة", icon: HelpCircle, to: "/settings/trust" },
  ];

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-[color-mix(in_srgb,var(--alpha-bg-base)_88%,transparent)] py-3 backdrop-blur-xl">
          <BackButton to="/home" compact tone="light" />
          <h1 className="font-arabic-serif text-[18px] font-extrabold text-alpha-heading">المزيد</h1>
          <span className="h-9 w-9 shrink-0" aria-hidden />
        </header>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-alpha-muted">
          <Sparkles className="h-3.5 w-3.5 text-alpha-gold-deep" />
          روابط سريعة — بسيطة وواضحة
        </p>

        <ul className="mt-5 overflow-hidden rounded-[22px] border border-alpha/50 bg-white/75 shadow-[var(--alpha-shadow-featured)] backdrop-blur-sm">
          {rows.map((row, index) => {
            const Icon = row.icon;
            const inner = (
              <>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-alpha/35 bg-white/80 text-alpha-gold-deep">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
                  </span>
                  <span className="text-[15px] font-bold text-alpha-heading">{row.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.cta ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        row.cta?.onClick();
                      }}
                      className="rounded-full border border-alpha/40 bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_90%,white)] px-3 py-1.5 text-[11px] font-extrabold text-alpha-heading active:scale-95"
                    >
                      {row.cta.label}
                    </button>
                  ) : null}
                  <ChevronLeft className="h-4 w-4 text-alpha-muted" />
                </div>
              </>
            );

            const className =
              "flex w-full items-center justify-between gap-3 px-4 py-4 text-right transition active:bg-white/90" +
              (index < rows.length - 1 ? " border-b border-alpha/25" : "");

            if (row.to) {
              return (
                <li key={row.id}>
                  <Link to={row.to as any} className={className}>
                    {inner}
                  </Link>
                </li>
              );
            }

            return (
              <li key={row.id}>
                <button type="button" onClick={row.onClick} className={className}>
                  {inner}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <BottomDock />
    </div>
  );
}
