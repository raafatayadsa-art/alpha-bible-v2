import { Loader2, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  busy?: boolean;
  onAdd: () => void;
  onProfile: () => void;
  onClose: () => void;
  className?: string;
};

/** Small anchored menu — add friend or open profile card (Threads-style). */
export function CommunityPersonQuickMenu({
  open,
  busy = false,
  onAdd,
  onProfile,
  onClose,
  className,
}: Props) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="إغلاق القائمة"
        className="fixed inset-0 z-[45]"
        onClick={onClose}
      />
      <div
        role="menu"
        className={cn(
          "absolute bottom-[calc(100%+6px)] left-1/2 z-[50] min-w-[156px] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-150",
          className,
        )}
      >
        <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#1a1410]/94 p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onAdd();
            }}
            className="flex w-full items-center justify-end gap-2.5 rounded-xl px-3 py-2.5 text-right transition active:bg-white/8 disabled:opacity-50"
          >
            <span className="text-[12px] font-extrabold text-white">إضافة</span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2.4} />
              )}
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onProfile();
            }}
            className="flex w-full items-center justify-end gap-2.5 rounded-xl px-3 py-2.5 text-right transition active:bg-white/8"
          >
            <span className="text-[12px] font-extrabold text-white">الملف الشخصي</span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white">
              <UserRound className="h-4 w-4" strokeWidth={2.2} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
