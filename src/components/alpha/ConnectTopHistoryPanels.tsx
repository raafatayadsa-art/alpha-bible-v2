import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function ConnectHistoryHandle({
  label,
  open,
  onToggle,
  onPullOpen,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  onPullOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      onPointerDown={(event) => {
        event.currentTarget.dataset.pullStartY = String(event.clientY);
      }}
      onPointerUp={(event) => {
        const target = event.currentTarget;
        const startY = Number(target.dataset.pullStartY ?? event.clientY);
        if (event.clientY - startY > 28) onPullOpen();
        delete target.dataset.pullStartY;
      }}
      aria-expanded={open}
      className="flex w-full items-center justify-center gap-1 py-0.5 text-[9px] font-medium text-muted-foreground/75 transition-colors active:text-muted-foreground"
    >
      <span>{label}</span>
      <ChevronDown
        className={cn("h-3 w-3 shrink-0 transition-transform duration-250", open ? "rotate-180" : "rotate-0")}
      />
    </button>
  );
}

function ConnectHistorySlidePanel({
  open,
  children,
  plain = false,
}: {
  open: boolean;
  children: ReactNode;
  plain?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "connect-history-panel mb-1.5 max-h-[min(52dvh,400px)] overflow-y-auto overscroll-y-contain",
            plain
              ? "p-0"
              : "glass-strong connect-history-panel-in rounded-3xl p-4",
            open && !plain ? "connect-history-panel-in" : undefined,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConnectHistoryPanel({
  label,
  children,
  className,
  plain = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  plain?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <ConnectHistoryHandle
        label={label}
        open={open}
        onToggle={() => setOpen((value) => !value)}
        onPullOpen={() => setOpen(true)}
      />
      <ConnectHistorySlidePanel open={open} plain={plain}>
        {children}
      </ConnectHistorySlidePanel>
    </div>
  );
}
