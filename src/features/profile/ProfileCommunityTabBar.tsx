import { cn } from "@/lib/utils";

export type ProfileCommunityTab = "activity" | "verses" | "reflections" | "journey" | "spiritual";

const TABS: { key: ProfileCommunityTab; label: string }[] = [
  { key: "activity", label: "النشاط" },
  { key: "verses", label: "الآيات" },
  { key: "reflections", label: "تأملات" },
  { key: "journey", label: "رحلة" },
  { key: "spiritual", label: "السجل" },
];

type Props = {
  active: ProfileCommunityTab;
  onChange: (tab: ProfileCommunityTab) => void;
  dark?: boolean;
};

export function ProfileCommunityTabBar({ active, onChange, dark = false }: Props) {
  return (
    <div className="-mx-1 mt-4 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold transition active:scale-95",
            active === tab.key
              ? dark
                ? "border-[#f0d78c]/45 bg-[#f0d78c]/15 text-[#f0d78c]"
                : "border-[#e7c97a]/55 bg-[#e7c97a]/20 text-[#3a2a18]"
              : dark
                ? "border-white/10 bg-white/5 text-white/55"
                : "border-[#e7c97a]/22 bg-white/60 text-[#7a6548]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileReflectionsPlaceholder({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[22px] border px-5 py-8 text-center",
        dark ? "border-white/10 bg-white/[0.03]" : "border-[#e7c97a]/25 bg-white/75",
      )}
    >
      <p className={cn("text-[14px] font-extrabold", dark ? "text-white/90" : "text-[#3a2a18]")}>
        تأملاتك ستظهر هنا
      </p>
      <p className={cn("mt-2 text-[12px] font-medium", dark ? "text-white/45" : "text-[#6a543a]")}>
        دوّن تأملاتك من مذكرات الكتاب المقدس.
      </p>
    </div>
  );
}
