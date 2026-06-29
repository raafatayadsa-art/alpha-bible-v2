import { useEffect, useState } from "react";
import { MC } from "../platform-store";

const SECTIONS = [
  { id: "founder-core-ops", label: "Core" },
  { id: "founder-tools", label: "Tools" },
  { id: "founder-system", label: "System" },
  { id: "founder-emergency", label: "Emergency" },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function FounderSectionNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let bestId = SECTIONS[0].id;
        let bestRatio = 0;
        for (const s of SECTIONS) {
          const ratio = ratios.get(s.id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = s.id;
          }
        }
        if (bestRatio > 0) setActive(bestId);
      },
      { rootMargin: "-18% 0px -52% 0px", threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="sticky z-30 -mx-1 mb-3 border-b px-1 py-2 backdrop-blur-md"
      style={{
        top: 0,
        borderColor: MC.panelBorder,
        background: "rgba(0,0,0,0.92)",
      }}
    >
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSection(s.id)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide transition active:scale-95"
            style={{
              borderColor: isActive ? MC.green : MC.panelBorder,
              background: isActive ? MC.green : MC.panel,
              color: isActive ? "#000000" : MC.muted,
            }}
          >
            {s.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
