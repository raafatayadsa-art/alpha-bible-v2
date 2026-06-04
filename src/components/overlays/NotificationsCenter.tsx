import { useEffect, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read?: boolean;
  icon?: React.ReactNode;
  onOpen?: () => void;
}

interface NotificationsCenterProps {
  open: boolean;
  onClose: () => void;
  items: NotificationItem[];
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
}

/**
 * Top-right anchored notifications center (Facebook/Instagram style).
 * - Opens from top-right; backdrop dismisses.
 * - Cards: icon, title, description, time, read/unread dot.
 */
export function NotificationsCenter({
  open,
  onClose,
  items,
  onMarkAllRead,
  onDelete,
}: NotificationsCenterProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const unread = items.filter((i) => !i.read).length;

  return (
    <div
      dir="rtl"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[120] transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-[#3a2a18]/20 backdrop-blur-[4px]"
      />

      <div
        ref={panelRef}
        className={cn(
          "absolute mx-auto w-full max-w-[460px] left-1/2 -translate-x-1/2",
          "transition-all duration-280 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        )}
        style={{ top: "max(env(safe-area-inset-top), 10px)" }}
      >
        <div className="mx-2 mt-12 origin-top-right rounded-3xl bg-white/97 backdrop-blur-xl border border-[#ead9b1] shadow-[0_24px_60px_-20px_rgba(120,80,30,0.5)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ead9b1]/70">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#6a4ab5]/10 text-[#6a4ab5]">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <div className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] leading-none">
                  التنبيهات
                </div>
                <div className="text-[10.5px] text-[#6a543a] mt-0.5">
                  {unread > 0 ? `${unread} غير مقروء` : "لا يوجد جديد"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onMarkAllRead && unread > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-full bg-[#faf3e3] border border-[#ead9b1] px-2.5 h-8 text-[10.5px] font-bold text-[#3a2a18] active:scale-95 transition-transform"
                >
                  <Check className="h-3 w-3" /> تحديد الكل
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="grid h-8 w-8 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[70dvh] overflow-y-auto p-2.5 space-y-2">
            {items.length === 0 ? (
              <div className="rounded-2xl bg-[#faf3e3] border border-[#ead9b1] p-8 text-center text-[12.5px] text-[#6a543a]">
                لا توجد تنبيهات حالياً
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "relative rounded-2xl border p-3 flex items-start gap-3 transition-colors",
                    n.read
                      ? "bg-white border-[#ead9b1]"
                      : "bg-[#f8efdc] border-[#e0c98a]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      n.onOpen?.();
                      onClose();
                    }}
                    className="flex items-start gap-3 flex-1 text-right active:opacity-80 transition-opacity"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#6a4ab5]/10 text-[#6a4ab5]">
                      {n.icon ?? <Bell className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6a4ab5]" />
                        )}
                        <div className="text-[12.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                          {n.title}
                        </div>
                      </div>
                      <div className="text-[11.5px] text-[#5a4630] mt-0.5 line-clamp-2 leading-snug">
                        {n.description}
                      </div>
                      <div className="text-[10px] text-[#b08a55] mt-1">{n.time}</div>
                    </div>
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(n.id)}
                      aria-label="حذف"
                      className="grid h-7 w-7 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#b8423a] active:scale-90 transition-transform shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
