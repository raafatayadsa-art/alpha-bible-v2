import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell, PCard } from "@/components/profile/Shell";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useState } from "react";

const options = [
  { id: "light", label: "فاتح — Alpha Cream", icon: Sun },
  { id: "dark", label: "داكن — Alpha Dark", icon: Moon },
  { id: "system", label: "حسب النظام", icon: Monitor },
];

function Appearance() {
  const [active, setActive] = useState("light");
  return (
    <ProfileSubShell title="المظهر">
      <PCard accent="#d8a83a" className="p-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[18px] hover:bg-[#fbf3e1] transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-[#d8a83a]/30 to-[#d8a83a]/10 border border-[#d8a83a66]">
              <o.icon className="h-4.5 w-4.5 text-[#8a5a14]" />
            </div>
            <div className="flex-1 text-right text-[13px] font-bold text-[#3a2a18]">{o.label}</div>
            {active === o.id && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#d8a83a] text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        ))}
      </PCard>
    </ProfileSubShell>
  );
}

export const Route = createFileRoute("/profile/appearance")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — المظهر" }] }),
  component: Appearance,
});
