import { ChevronLeft, Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { alphaOmegaLogo, headerCathedralBg } from "@/assets/bible-home";
import { useBibleSearch } from "@/features/bible-search";
import { bibleHomeColors } from "../tokens/colors";

const HEADER_BTN =
  "grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/70 shadow-[0_8px_20px_rgba(120,90,40,0.1)] backdrop-blur-md transition active:scale-95";

export function BibleHeader({ onSearchClick }: { onSearchClick?: () => void }) {
  const router = useRouter();
  const { openSearch } = useBibleSearch();

  const handleSearch = () => {
    (onSearchClick ?? openSearch)();
  };

  const goBack = () => {
    const idx =
      typeof window !== "undefined"
        ? (((window.history.state as Record<string, unknown>)?.idx as number) ?? 0)
        : 0;
    if (idx > 0) { router.history.back(); return; }
    void router.navigate({ to: "/home" });
  };

  return (
    <header className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage: `url(${headerCathedralBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "blur(1px) saturate(1.1)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(253,251,247,0.55) 0%, rgba(253,251,247,0.92) 72%, rgba(253,251,247,1) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[440px] px-4 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
        <div className="flex items-center justify-between gap-2" dir="rtl">
          <button
              type="button"
              onClick={goBack}
              aria-label="رجوع"
              className={HEADER_BTN}
            >
              <ChevronLeft className="h-[18px] w-[18px] -scale-x-100" style={{ color: bibleHomeColors.textPrimary }} />
            </button>

          <div className="flex min-w-0 flex-1 flex-col items-center text-center" dir="rtl">
            <img
              src={alphaOmegaLogo}
              alt=""
              className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
              draggable={false}
            />
            <h1
              className="mt-1.5 font-arabic-serif text-[20px] font-extrabold leading-tight"
              style={{ color: bibleHomeColors.textPrimary }}
            >
              الكتاب المقدس
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px]" style={{ color: bibleHomeColors.textMuted }}>
              <span className="text-[10px]" style={{ color: bibleHomeColors.gold }}>✦</span>
              كلمة الله حياة
              <span className="text-[10px]" style={{ color: bibleHomeColors.gold }}>✦</span>
            </p>
          </div>

          <button
            type="button"
            aria-label="بحث"
            onClick={handleSearch}
            className={HEADER_BTN}
          >
            <Search className="h-[18px] w-[18px]" style={{ color: bibleHomeColors.textPrimary }} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  );
}
