import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Premium Apple-style 3D glass icon — matches Profile / Home Alpha family. */
export function AlphaIcon3D({
  color,
  size = 52,
  isOpen = false,
  children,
}: {
  color: string;
  size?: number;
  isOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 grid place-items-center rounded-[18px] border overflow-hidden transition-transform duration-300 ease-out",
        isOpen && "rotate-6 scale-[1.06]",
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(120% 90% at 30% 20%, ${color}66, ${color}1a 70%)`,
        borderColor: `${color}66`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -6px 10px ${color}33, 0 8px 18px -8px ${color}99`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
