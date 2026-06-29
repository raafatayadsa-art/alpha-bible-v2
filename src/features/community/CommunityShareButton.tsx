import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { shareToCommunity } from "./community-store";
import type { ShareToCommunityInput } from "./community-types";
import { toast } from "sonner";
import { isAuthenticated } from "@/features/church/current-user";
import { getCachedMemberChurch } from "@/features/church/member-church-api";

function shareMoment(input: ShareToCommunityInput): boolean {
  if (!isAuthenticated()) {
    toast.error("سجّل الدخول لمشاركة النشاط مع المجتمع");
    return false;
  }
  const church = getCachedMemberChurch();
  const moment = shareToCommunity(input, { churchId: church?.id, churchName: church?.name });
  if (!moment) {
    toast.error("تعذّرت المشاركة — تحقق من المحتوى");
    return false;
  }
  toast.success("تمت المشاركة مع المجتمع الكنسي");
  return true;
}

type CommunityShareButtonProps = {
  input: ShareToCommunityInput;
  className?: string;
  label?: string;
  compact?: boolean;
};

/** Shares structured spiritual content to the community hub — not a free-form post. */
export function CommunityShareButton({
  input,
  className,
  label = "المجتمع",
  compact = false,
}: CommunityShareButtonProps) {
  return (
    <button
      type="button"
      aria-label="شارك مع المجتمع الكنسي"
      onClick={() => shareMoment(input)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1f8a5a]/35 bg-[#1f8a5a]/10 font-extrabold text-[#1f8a5a] active:scale-95 transition",
        compact ? "min-h-[40px] min-w-[40px] px-2.5 py-2 text-[10px]" : "px-3.5 py-2 text-[11px]",
        className,
      )}
    >
      <Users className={compact ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2.2} />
      {!compact ? label : null}
    </button>
  );
}
