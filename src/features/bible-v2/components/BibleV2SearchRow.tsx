import { useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { bibleV2Tokens } from "../tokens";

interface BibleV2SearchRowProps {
  onOptions?: () => void;
  onSearch?: () => void;
}

export function BibleV2SearchRow({ onOptions, onSearch }: BibleV2SearchRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div dir="rtl" className="mx-4 mt-4 flex items-center gap-2.5">
      <div
        role="search"
        onClick={() => {
          inputRef.current?.focus();
          onSearch?.();
        }}
        className="flex flex-1 cursor-text items-center gap-2.5 rounded-full border border-[#ece1c6]/90 bg-white/90 px-4 py-3 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.22)] backdrop-blur-md transition active:scale-[0.99]"
      >
        <Search className="h-4 w-4 shrink-0 text-[#8a7544]" />
        <input
          ref={inputRef}
          type="search"
          placeholder="ابحث في الكتاب المقدس"
          className="flex-1 bg-transparent text-right text-[13px] text-[#3a2c10] outline-none placeholder:text-[#a89370]"
        />
      </div>
      <button
        type="button"
        onClick={onOptions}
        className="flex shrink-0 items-center gap-2 rounded-full border border-[#ece1c6]/90 bg-white/90 px-4 py-3 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.22)] backdrop-blur-md transition active:scale-95"
        style={{ color: bibleV2Tokens.textSecondary }}
      >
        <span className="text-[13px] font-semibold">خيارات</span>
        <SlidersHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
