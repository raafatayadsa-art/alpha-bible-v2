import { cn } from "@/lib/utils";

export function kholagyColumnShellClass(
  index: number,
  dark: boolean,
  minHeightClass = "min-h-[3.5rem]",
): string {
  return cn(
    "flex min-w-0 flex-col px-2 py-2.5 sm:px-4 sm:py-3.5",
    minHeightClass,
    index > 0 && cn(dark ? "border-r border-white/10" : "border-r border-[#c4b0e8]/25"),
  );
}

export function kholagyColumnTextClass(col: "ar" | "cop" | "en", active: boolean, dark: boolean): string {
  return cn(
    "min-w-0 max-w-full flex-1 whitespace-pre-wrap break-words leading-[1.85]",
    col === "cop" && "kholagy-text-cop font-coptic-text text-[0.94em] sm:text-[1.02em]",
    col === "ar" && "font-semibold text-[0.94em] sm:text-[0.98em]",
    col === "en" && "text-[0.94em] sm:text-[0.98em] italic opacity-90",
    dark
      ? col === "ar"
        ? active
          ? "text-[#fff8e8]"
          : "text-[#f3ecff]/75"
        : col === "cop"
          ? active
            ? "text-[#f5e6b8]"
            : "text-[#d8ccff]/65"
          : active
            ? "text-white/78"
            : "text-white/50"
      : col === "ar"
        ? active
          ? "text-[#3a2560]"
          : "text-[#2a1848]/72"
        : col === "cop"
          ? active
            ? "text-[#5a4088]"
            : "text-[#4a3080]/65"
          : active
            ? "text-[#6a5488]"
            : "text-[#6a5488]/60",
  );
}
