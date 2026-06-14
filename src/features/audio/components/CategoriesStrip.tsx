import { useState, type CSSProperties } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  FolderOpen,
  Heart,
  Mic,
  type LucideIcon,
} from "lucide-react";
import {
  MESSAGING_CREAM_CARD,
  MESSAGING_CREAM_INNER,
} from "@/components/alpha/messaging-ui";

const GOLD_TONE = "#b8893a";

function categoryIcon3dStyle(pressed = false): CSSProperties {
  return {
    borderColor: `${GOLD_TONE}28`,
    background: `linear-gradient(155deg, rgba(255,255,255,0.58) 0%, rgba(247,232,196,0.42) 38%, rgba(200,149,42,0.18) 100%)`,
    boxShadow: pressed
      ? `inset 0 3px 7px rgba(0,0,0,0.12), 0 1px 3px -1px rgba(200,149,42,0.18)`
      : `inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -3px 6px rgba(120,80,30,0.1), 0 8px 18px -6px rgba(200,149,42,0.38), 0 3px 8px -3px rgba(0,0,0,0.12)`,
  };
}

const items: { icon: LucideIcon; label: string }[] = [
  { icon: Mic, label: "العظات" },
  { icon: BookOpen, label: "السلاسل التعليمية" },
  { icon: FolderOpen, label: "الموضوعات" },
  { icon: Calendar, label: "في مثل هذا اليوم" },
  { icon: Heart, label: "المفضلة" },
  { icon: Download, label: "التنزيلات" },
  { icon: Clock, label: "تاريخ الاستماع" },
];

export function CategoriesStrip() {
  const [active, setActive] = useState(0);

  return (
    <section className="mt-5">
      <div
        dir="rtl"
        className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1"
      >
        {items.map(({ icon: Icon, label }, index) => {
          const isActive = active === index;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={isActive}
              className={`${MESSAGING_CREAM_CARD} shrink-0 snap-start w-[122px] transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? "border-gold/34 shadow-[0_8px_24px_-8px_rgba(200,149,42,0.38),0_0_28px_-6px_rgba(231,201,122,0.35)]"
                  : "hover:border-gold/22 hover:shadow-[0_6px_18px_-8px_rgba(200,149,42,0.24)]"
              }`}
            >
              <div className={`${MESSAGING_CREAM_INNER} flex flex-col items-center gap-2.5 px-2.5 py-4`}>
                <div className="relative">
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 scale-[1.35] rounded-full bg-[radial-gradient(circle,rgba(231,201,122,0.42)_0%,rgba(200,149,42,0.12)_45%,transparent_72%)] blur-[2px]"
                    />
                  )}
                  <span
                    className="relative grid h-[78px] w-[78px] place-items-center rounded-[22px] border transition-all duration-200 active:translate-y-[1px] active:scale-[0.96]"
                    style={categoryIcon3dStyle(isActive)}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-2 top-1 h-[42%] rounded-t-[18px] bg-gradient-to-b from-white/62 to-transparent"
                    />
                    <Icon
                      className="relative z-[1] size-10 text-[var(--gold-deep)]"
                      style={{
                        filter:
                          "drop-shadow(0 1px 0 rgba(255,255,255,0.45)) drop-shadow(0 3px 6px rgba(140,100,40,0.35)) drop-shadow(0 0 10px rgba(231,201,122,0.28))",
                      }}
                      strokeWidth={1.85}
                    />
                  </span>
                </div>
                <span
                  className={`line-clamp-2 text-center text-[11.5px] font-semibold leading-tight ${
                    isActive ? "text-[#1F2937]" : "text-[#374151]/82"
                  }`}
                >
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {items.slice(0, 3).map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all ${
              i === 0
                ? "h-1.5 w-4 bg-gold shadow-[0_0_8px_rgba(200,149,42,0.35)]"
                : "h-1.5 w-1.5 bg-gold/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
