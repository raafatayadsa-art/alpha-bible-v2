import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { cn } from "@/lib/utils";
import { useResolvedTheme } from "@/lib/alpha-theme";

type Props = {
  name: string;
  avatarUrl: string;
  children: ReactNode;
  onBack?: () => void;
};

export function ProfilePremiumShell({ name, avatarUrl, children, onBack }: Props) {
  const { goBack } = useAlphaNavigation();
  const isDark = useResolvedTheme() === "dark";
  const [scrolled, setScrolled] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      setScrolled(y > 48);
      if (y < 40) {
        setTitleVisible(false);
      } else if (delta > 6) {
        setTitleVisible(false);
      } else if (delta < -6) {
        setTitleVisible(true);
      }
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showTitleBar = titleVisible && scrolled;
  const handleBack = onBack ?? goBack;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 alpha-motion-standard",
          showTitleBar
            ? isDark
              ? "border-b border-white/10 bg-[#120c08]/94 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.65)] backdrop-blur-xl"
              : "border-b border-alpha bg-alpha-surface-glass shadow-[0_8px_24px_-18px_rgba(120,80,30,0.12)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex w-full max-w-[var(--alpha-content-max-width)] items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)]">
          <button
            type="button"
            onClick={handleBack}
            aria-label="رجوع"
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full border backdrop-blur-xl transition active:scale-90",
              showTitleBar
                ? isDark
                  ? "border-white/15 bg-black/45 text-white"
                  : "border-alpha bg-alpha-surface text-alpha"
                : isDark
                  ? "border-white/20 bg-black/35 text-white"
                  : "border-alpha bg-alpha-surface text-alpha",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden transition-all duration-300",
              showTitleBar ? "max-h-10 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
            )}
            dir="rtl"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-[#f0d78c]/35"
              />
            ) : (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2a1f45] text-[11px] font-extrabold text-[#f0d78c]">
                {name.charAt(0)}
              </span>
            )}
            <h1 className={cn("min-w-0 truncate text-center text-[16px] font-extrabold", isDark ? "text-white" : "text-alpha-heading")}>
              {name}
            </h1>
          </div>

          <div className="w-10 shrink-0" aria-hidden />
        </div>
      </header>

      {children}
    </>
  );
}
