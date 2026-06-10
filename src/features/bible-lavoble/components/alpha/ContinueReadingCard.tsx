import { ChevronLeft } from "lucide-react";
import continueBook from "../../assets/continue-book.jpg";

interface ContinueReadingCardProps {
  onClick?: () => void;
}

export function ContinueReadingCard({ onClick }: ContinueReadingCardProps) {
  return (
    <button
      dir="rtl"
      onClick={onClick}
      className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] items-center gap-3 overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md p-3 ring-1 ring-[#ece1c6] shadow-[0_6px_18px_-8px_rgba(120,90,40,0.25)] text-right transition active:scale-[0.99]"
    >
      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#e6d2a0]">
        <img
          src={continueBook}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3
          className="text-[14px] font-bold text-[#1e2b54]"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          استمر في القراءة
        </h3>
        <p
          className="mt-0.5 text-[12px] font-bold text-[#b08a2e]"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          يوحنا 3:16
        </p>
        <p
          className="mt-1 text-[11px] leading-snug text-[#6a5a32] line-clamp-2"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          لأنه هكذا أحبَّ الله العالم، حتى بذل ابنه الوحيد…
        </p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdf6e3] ring-1 ring-[#e6d2a0] text-[#8a7544]">
        <ChevronLeft className="h-4 w-4" />
      </div>
    </button>
  );
}