import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** ALPHA-123 — surfaces backend errors verbatim in Alpha DNA */
export function AlphaErrorCard({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  if (!message.trim()) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2.5 rounded-2xl border border-[#a8344f]/25 bg-[#fff0f3]/90 px-3.5 py-3 text-start",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#a8344f]" aria-hidden />
      <p className="text-[13px] font-semibold leading-6 text-[#7a2038]">{message}</p>
    </div>
  );
}
