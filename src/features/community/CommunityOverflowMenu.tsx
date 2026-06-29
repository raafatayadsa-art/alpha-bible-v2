import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type OverflowMenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  items: OverflowMenuItem[];
  align?: "start" | "end";
  className?: string;
};

/** Vertical 3-dot menu — far left in RTL feed cards. */
export function CommunityOverflowMenu({ items, align = "start", className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!items.length) return null;

  return (
    <div ref={ref} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-label="المزيد"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 bg-black/25 text-white/70 active:scale-95"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute top-9 z-30 min-w-[156px] overflow-hidden rounded-xl border border-white/15 bg-[#1a1028]/96 py-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md",
            align === "start" ? "left-0" : "right-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-[11px] font-extrabold active:bg-white/5",
                item.danger ? "text-rose-200" : "text-white/88",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
