import { Bell, Menu } from "lucide-react";
import { alphaOmegaLogo } from "@/assets/bible-home";
import { bibleV2Tokens } from "../tokens";

const HEADER_BTN =
  "grid h-11 w-11 place-items-center rounded-2xl border border-white/80 bg-white/75 shadow-[0_6px_18px_-8px_rgba(120,90,40,0.28)] backdrop-blur-md transition active:scale-95";

interface BibleV2HeaderProps {
  onMenu?: () => void;
  onNotifications?: () => void;
}

export function BibleV2Header({ onMenu, onNotifications }: BibleV2HeaderProps) {
  return (
    <header dir="rtl" className="relative px-4 pb-3 pt-[max(env(safe-area-inset-top),10px)]">
      <div className="flex items-start justify-between gap-2">
        <button type="button" aria-label="القائمة" onClick={onMenu} className={HEADER_BTN}>
          <Menu className="h-5 w-5" style={{ color: bibleV2Tokens.textPrimary }} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <img
            src={alphaOmegaLogo}
            alt=""
            className="h-12 w-12 object-contain drop-shadow-[0_6px_16px_rgba(212,175,55,0.4)]"
            draggable={false}
          />
          <p className="mt-0.5 text-[9px] font-semibold tracking-[0.28em] text-[#a07823]">ALPHA OMEGA</p>
          <h1
            className="mt-2 font-arabic-serif text-[22px] font-extrabold leading-tight"
            style={{ color: bibleV2Tokens.navy }}
          >
            الكتاب المقدس
          </h1>
          <p className="mt-1 text-[12px] font-medium" style={{ color: bibleV2Tokens.goldDeep }}>
            كلمة الله هي حياة
          </p>
          <div className="mt-2 flex w-full max-w-[200px] items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d4af37]/60 to-[#d4af37]" />
            <span className="text-[8px] text-[#d4af37]">◆</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#d4af37]" />
          </div>
        </div>

        <button type="button" aria-label="الإشعارات" onClick={onNotifications} className={HEADER_BTN}>
          <Bell className="h-5 w-5" style={{ color: bibleV2Tokens.textPrimary }} />
        </button>
      </div>
    </header>
  );
}
