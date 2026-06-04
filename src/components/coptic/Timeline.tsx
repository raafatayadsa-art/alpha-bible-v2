import * as React from "react";
import { cn } from "@/lib/utils";

const ACCENT_HEX: Record<string, string> = {
  purple: "#6a4ab5",
  gold: "#b8893a",
  green: "#3e7a55",
  blue: "#3a6a9b",
};

export function Timeline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative pr-6", className)}
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(184,137,58,0.35), rgba(184,137,58,0.15))",
        backgroundSize: "1.5px 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "calc(100% - 11px) 0",
      }}
    >
      {children}
    </div>
  );
}

export function TimelineItem({
  children,
  accent = "gold",
  className = "",
}: {
  children: React.ReactNode;
  accent?: "purple" | "gold" | "green" | "blue";
  className?: string;
}) {
  const color = ACCENT_HEX[accent] ?? ACCENT_HEX.gold;
  return (
    <div className={cn("relative mb-3", className)}>
      <span
        className="absolute top-4 -right-[2px] block h-2.5 w-2.5 rounded-full ring-2 ring-[#f4ead8]"
        style={{
          background: color,
          boxShadow: `0 0 0 3px ${color}22, 0 4px 8px -2px ${color}66`,
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}

export function HorizontalTimeline({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: { id: string; label: string; accent: "purple" | "gold" | "green" | "blue" | "red" | "orange" }[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  const HEX: Record<string, string> = {
    ...ACCENT_HEX,
    red: "#c0533a",
    orange: "#d18a3a",
  };
  return (
    <div className="relative px-2 py-3">
      <div className="absolute top-[26px] right-4 left-4 h-px bg-gradient-to-l from-[#b8893a]/30 via-[#b8893a]/50 to-[#b8893a]/30" aria-hidden />
      <ul className="relative flex items-start justify-between gap-1" dir="rtl">
        {nodes.map((n) => {
          const color = HEX[n.accent] ?? HEX.gold;
          const isActive = n.id === activeId;
          return (
            <li key={n.id} className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect?.(n.id)}
                className="grid place-items-center h-9 w-9 rounded-full active:scale-90 transition-transform"
                style={{
                  background: isActive ? "white" : color,
                  border: isActive ? `2px solid ${color}` : "2px solid white",
                  boxShadow: isActive
                    ? `0 0 0 3px ${color}33, 0 6px 12px -4px ${color}66`
                    : `0 4px 10px -4px ${color}88`,
                }}
                aria-current={isActive ? "true" : undefined}
                aria-label={n.label}
              >
                {isActive && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: color }}
                  />
                )}
              </button>
              <span
                className="text-[10.5px] font-bold leading-none whitespace-nowrap"
                style={{ color: isActive ? color : "#6a543a" }}
              >
                {n.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
