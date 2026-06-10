import { useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface SearchOptionsRowProps {
  onOptions?: () => void;
}

export function SearchOptionsRow({ onOptions }: SearchOptionsRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div dir="rtl" className="mx-5 mt-4 flex items-center gap-3">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-1 items-center gap-2 rounded-full bg-white/85 backdrop-blur-md px-4 py-3 ring-1 ring-[#ece1c6] shadow-[0_4px_14px_-6px_rgba(120,90,40,0.25)] cursor-text transition active:scale-[0.99]"
      >
        <Search className="h-4 w-4 text-[#8a7544]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="ابحث في الكتاب المقدس"
          className="flex-1 bg-transparent text-[13px] text-[#3a2c10] placeholder:text-[#a89370] outline-none text-right"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        />
      </div>
      <button
        onClick={onOptions}
        className="flex items-center gap-2 rounded-full bg-white/85 backdrop-blur-md px-4 py-3 ring-1 ring-[#ece1c6] shadow-[0_4px_14px_-6px_rgba(120,90,40,0.25)] text-[#5a4a2a] transition active:scale-95"
      >
        <span
          className="text-[13px] font-medium"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          خيارات
        </span>
        <SlidersHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}