import { ChevronLeft } from "lucide-react";

export function SectionHeader({ title, action = "عرض الكل" }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between px-5">
      <h3 className="text-[17px] font-bold tracking-tight text-foreground">{title}</h3>
      <button className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[var(--gold-deep)]">
        {action}
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
