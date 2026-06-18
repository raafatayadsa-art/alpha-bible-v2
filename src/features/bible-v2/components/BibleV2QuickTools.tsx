import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  bibleV2QuickTools,
  type BibleV2QuickToolAction,
  type BibleV2QuickToolDef,
  type QuickToolTone,
} from "../bible-v2-quick-tools";
import { bibleV2Tokens } from "../tokens";
import { BibleV2QuickToolIcon } from "./BibleV2QuickToolIcon";

const panelShadow = [
  "inset 0 1px 0 rgba(255,255,255,0.95)",
  "inset 0 -1px 0 rgba(255,255,255,0.35)",
  `0 16px 36px -16px ${bibleV2Tokens.shadowCard}`,
  `0 6px 18px -10px ${bibleV2Tokens.shadowWarm}`,
  "0 0 0 1px rgba(212,175,55,0.1)",
].join(", ");

const tileClass =
  "group flex w-full cursor-pointer touch-manipulation flex-col items-center gap-2 rounded-[18px] px-1 py-2.5 transition duration-200 hover:bg-white/55 hover:shadow-[inset_0_0_0_1px_rgba(212,175,55,0.12)] active:scale-[0.96] outline-none focus-visible:ring-2 focus-visible:ring-[#b8893a]/35";

function QuickToolTile({
  label,
  icon,
  tone,
  onActivate,
}: {
  label: string;
  icon: LucideIcon;
  tone: QuickToolTone;
  onActivate: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <button
      type="button"
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      className={tileClass}
      aria-label={label}
    >
      <BibleV2QuickToolIcon icon={icon} tone={tone} />
      <span
        className="max-w-full truncate whitespace-nowrap px-0.5 text-center text-[10.5px] font-semibold leading-tight transition-colors group-hover:text-[#2a1f12]"
        style={{ color: bibleV2Tokens.textSecondary }}
      >
        {label}
      </span>
    </button>
  );
}

function runQuickToolAction(
  action: BibleV2QuickToolAction,
  navigate: ReturnType<typeof useNavigate>,
) {
  switch (action.kind) {
    case "navigate":
      if (action.params) {
        void navigate({
          to: action.to as never,
          params: action.params as never,
          search: action.search as never,
        });
        return;
      }
      void navigate({
        to: action.to as never,
        search: action.search as never,
      });
      return;
    case "soon":
      toast.info("قريباً");
      return;
  }
}

export function BibleV2QuickTools() {
  const navigate = useNavigate();

  const activateTool = useCallback(
    (tool: BibleV2QuickToolDef) => {
      runQuickToolAction(tool.action, navigate);
    },
    [navigate],
  );

  return (
    <section dir="rtl" className="relative z-30 mx-4 mt-6 pointer-events-auto">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px]" style={{ color: bibleV2Tokens.gold }}>
          ✦
        </span>
        <h2 className="text-[15px] font-extrabold" style={{ color: bibleV2Tokens.navy }}>
          أدوات سريعة
        </h2>
      </div>

      <div
        className="rounded-[24px] border border-white/75 p-2 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(250,247,242,0.52) 48%, rgba(255,255,255,0.68) 100%)",
          boxShadow: panelShadow,
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        <div className="grid grid-cols-2 gap-1">
          {bibleV2QuickTools.map((tool) => (
            <QuickToolTile
              key={tool.id}
              label={tool.label}
              icon={tool.icon}
              tone={tool.tone}
              onActivate={() => activateTool(tool)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
