import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { cn } from "@/lib/utils";
import cardChurch from "@/assets/home/card-church.jpg";
import { PublisherPublicBackdrop } from "./PublisherPublicBackdrop";

type Props = {
  publisherName: string;
  coverUrl?: string | null;
  logoUrl?: string | null;
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
};

export function PublisherPublicShell({
  publisherName,
  coverUrl,
  logoUrl,
  backLabel = "رجوع",
  onBack,
  children,
}: Props) {
  const { goBack } = useAlphaNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const lastScrollY = useRef(0);

  const logo = logoUrl?.trim() || coverUrl?.trim() || cardChurch;

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

  return (
    <main dir="rtl" className="relative min-h-dvh bg-[#f0e6d4] pb-28">
      <PublisherPublicBackdrop />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] transition-[background,box-shadow,border-color,transform] duration-300",
          showTitleBar
            ? "translate-y-0 border-b border-[#efe2c4]/70 bg-[#f5efe4]/94 shadow-[0_8px_24px_-18px_rgba(120,80,30,0.35)] backdrop-blur-xl"
            : "translate-y-0 border-b border-transparent bg-transparent",
        )}
      >
        <div className="flex items-center gap-2 px-5 pb-2 pt-[max(env(safe-area-inset-top),14px)]">
          <button
            type="button"
            onClick={onBack ?? goBack}
            aria-label={backLabel}
            className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#efe2c4] bg-white/85 text-[#3a2a18] shadow-[0_8px_18px_-10px_rgba(120,80,30,0.45)] backdrop-blur-xl transition active:scale-90"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </button>

          <div
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden transition-all duration-300",
              showTitleBar ? "max-h-10 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
            )}
          >
            <img
              src={logo}
              alt=""
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-[var(--gold)]/35"
            />
            <h1 className="min-w-0 truncate text-center text-[17px] font-bold tracking-tight text-foreground">
              {publisherName}
            </h1>
          </div>

          <span className="w-10 shrink-0" />
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] pt-[calc(max(env(safe-area-inset-top),14px)+40px)]">
        {children}
      </div>

      <BottomDock />
    </main>
  );
}
