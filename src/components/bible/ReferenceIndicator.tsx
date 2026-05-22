import { LinkIcon } from "lucide-react";

export function ReferenceIndicator({
  count = 1,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`مراجع متقاطعة (${count})`}
      className="ml-1 inline-flex items-center gap-0.5 align-middle text-[#b8893a] hover:text-[#7a4a26] transition-colors"
    >
      <LinkIcon className="h-3 w-3" strokeWidth={2.2} />
      {count > 1 && (
        <span className="text-[9px] font-bold tabular-nums">{count}</span>
      )}
    </button>
  );
}
