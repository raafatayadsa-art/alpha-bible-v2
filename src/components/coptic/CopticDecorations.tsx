import { cn } from "@/lib/utils";

export function CopticCross({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2v20M4 12h16" />
      <path d="M9 6h6M9 18h6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function CopticWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className,
      )}
      aria-hidden
    >
      <span className="absolute -top-2 right-3 text-[120px] font-bold text-[#b8893a]/[0.06] leading-none">
        Ⲁ
      </span>
      <span className="absolute -bottom-6 left-3 text-[120px] font-bold text-[#6a4ab5]/[0.06] leading-none">
        Ⲱ
      </span>
    </div>
  );
}

export function CopticSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 my-4 px-1", className)} aria-hidden>
      <div className="h-px flex-1 bg-gradient-to-l from-[#b8893a]/40 to-transparent" />
      <CopticCross className="text-[#b8893a]" size={16} />
      <div className="flex items-center gap-1">
        <span className="h-1 w-1 rounded-full bg-[#b8893a]/50" />
        <span className="h-1 w-1 rounded-full bg-[#b8893a]/70" />
        <span className="h-1 w-1 rounded-full bg-[#b8893a]/50" />
      </div>
      <CopticCross className="text-[#b8893a]" size={16} />
      <div className="h-px flex-1 bg-gradient-to-r from-[#b8893a]/40 to-transparent" />
    </div>
  );
}
