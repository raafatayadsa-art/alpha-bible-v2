import { Menu, Bell, ArrowRight, Search } from "lucide-react";

type Variant = "home" | "inner";

interface AlphaTopHeaderProps {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  onMenu?: () => void;
  onNotifications?: () => void;
  onBack?: () => void;
  onSearch?: () => void;
}

export function AlphaTopHeader({
  variant = "home",
  title = "الكتاب المقدس",
  subtitle = "كلمة الله هي حياة",
  onMenu,
  onNotifications,
  onBack,
  onSearch,
}: AlphaTopHeaderProps) {
  return (
    <header
      dir="rtl"
      className="relative w-full px-5 pb-2"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
    >
      <div className="relative flex items-start justify-between">
        {/* Right (RTL start): back on inner, menu on home */}
        <button
          onClick={variant === "inner" ? onBack : onMenu}
          aria-label={variant === "inner" ? "رجوع" : "القائمة"}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md shadow-[0_4px_14px_-4px_rgba(120,90,40,0.25)] ring-1 ring-[#e9dcc0] text-[#5a4a2a] transition active:scale-95"
        >
          {variant === "inner" ? <ArrowRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Center logo */}
        <div className="absolute left-1/2 -top-1 -translate-x-1/2 flex flex-col items-center">
          <div
            className="text-[38px] leading-none font-serif tracking-wider"
            style={{
              fontFamily: "'Amiri', serif",
              background: "linear-gradient(180deg,#d4a93a 0%,#a07823 70%,#7a5a18 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            A <span className="mx-1">✟</span> Ω
          </div>
          <div className="text-[10px] tracking-[0.3em] text-[#a07823] mt-1">ΛΛΦΛ  ΟΜΕGΛ</div>
          <div className="text-[7px] tracking-[0.2em] text-[#a07823]/80 mt-1 leading-tight">IC ✟ XC<br/>NI · KA</div>
        </div>

        {/* Left (RTL end): notifications on home, search on inner */}
        <button
          onClick={variant === "inner" ? onSearch : onNotifications}
          aria-label={variant === "inner" ? "بحث" : "الإشعارات"}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md shadow-[0_4px_14px_-4px_rgba(120,90,40,0.25)] ring-1 ring-[#e9dcc0] text-[#5a4a2a] transition active:scale-95"
        >
          {variant === "inner" ? <Search className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </button>
      </div>

      {/* Title block */}
      <div className="mt-16 flex flex-col items-center text-center">
        <h1
          className="text-[32px] font-bold text-[#1e2b54] leading-tight"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {title}
        </h1>
        <p
          className="mt-0.5 text-[13px] text-[#8a7544]"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {subtitle}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[#c9a84c]">
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          <span className="text-[10px]">✦</span>
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
        </div>
      </div>
    </header>
  );
}