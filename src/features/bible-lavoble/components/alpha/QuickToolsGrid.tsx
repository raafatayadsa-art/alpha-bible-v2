import type { LucideIcon } from "lucide-react";
import { Bookmark, Clock, FilePen, SearchCheck } from "lucide-react";

export interface QuickTool {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const quickTools: QuickTool[] = [
  { id: "favorites", label: "المفضلة", icon: Bookmark },
  { id: "last-read", label: "آخر قراءة", icon: Clock },
  { id: "notes", label: "ملاحظاتي", icon: FilePen },
  { id: "advanced-search", label: "بحث متقدم", icon: SearchCheck },
];

interface QuickToolCardProps {
  tool: QuickTool;
  onClick?: () => void;
}

export function QuickToolCard({ tool, onClick }: QuickToolCardProps) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-1 basis-0 flex-col items-center justify-center gap-1 rounded-2xl bg-[#fdf8ec] px-2 py-2.5 ring-1 ring-[#efe4c6] shadow-[0_3px_10px_-6px_rgba(120,90,40,0.18)] transition active:scale-95"
    >
      <Icon className="h-5 w-5 text-[#1e2b54]" strokeWidth={1.6} />
      <span
        className="text-[11px] font-medium text-[#3a2c10]"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        {tool.label}
      </span>
    </button>
  );
}

interface QuickToolsGridProps {
  onToolClick?: (id: string) => void;
}

export function QuickToolsGrid({ onToolClick }: QuickToolsGridProps) {
  return (
    <section dir="rtl" className="mx-5 mt-5">
      <div className="mb-3 flex items-center justify-start gap-2">
        <span className="text-[#c9a84c]">✦</span>
        <h2
          className="text-[14px] font-bold text-[#1e2b54]"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          أدوات سريعة
        </h2>
      </div>
      <div className="flex items-stretch gap-2.5">
        {quickTools.map((tool) => (
          <QuickToolCard
            key={tool.id}
            tool={tool}
            onClick={() => onToolClick?.(tool.id)}
          />
        ))}
      </div>
    </section>
  );
}