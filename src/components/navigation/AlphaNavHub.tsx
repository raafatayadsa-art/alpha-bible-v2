import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  BookMarked,
  Church,
  Heart,
  Home,
  Library,
  Settings,
  Sparkles,
  User,
  X,
  ChevronLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "الرئيسية", to: "/home", icon: Home, tone: "#b8893a" },
  { key: "bible", label: "الكتاب المقدس", to: "/bible", icon: BookOpen, tone: "#8a6ec1" },
  { key: "agpeya", label: "الأجبية", to: "/agpeya", icon: Heart, tone: "#1f8a5a" },
  { key: "katameros", label: "القطمارس", to: "/katameros", icon: BookMarked, tone: "#4a9e6e" },
  { key: "synaxarium", label: "السنكسار", to: "/synaxarium", icon: Sparkles, tone: "#c98a3c" },
  { key: "library", label: "المكتبة", to: "/books", icon: Library, tone: "#6a4ab5" },
  { key: "church", label: "كنيستك معاك", to: "/profile/church", icon: Church, tone: "#5b8fd1" },
  { key: "profile", label: "الملف الشخصي", to: "/profile", icon: User, tone: "#8a6ec1" },
  { key: "settings", label: "الإعدادات", to: "/settings", icon: Settings, tone: "#3f9d6e" },
] as const;

type AlphaNavHubProps = {
  open: boolean;
  onClose: () => void;
};

export function AlphaNavHub({ open, onClose }: AlphaNavHubProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const drawer = (
    <>
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-[#1a0f04]/42 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
        dir="rtl"
        className="fixed inset-y-0 right-0 z-[9999] flex w-[min(320px,100vw)] flex-col overflow-hidden border-l border-[#e7c97a]/35 bg-[#fbf3e1]/97 shadow-[-30px_0_60px_-20px_rgba(60,40,16,0.55)] backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#e7c97a]/25 px-4 py-4">
          <div dir="ltr" className="inline-flex items-center gap-1.5 isolate">
            <span className="text-[11px] font-bold text-[#b8893a]/65 select-none" aria-hidden>Ⲁ</span>
            <span dir="rtl" className="text-[15px] font-extrabold text-[#3a2a18]">التنقل</span>
            <span className="text-[11px] font-bold text-[#b8893a]/65 select-none" aria-hidden>Ⲱ</span>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#efe2c4] bg-white/80 text-[#3a2a18] active:scale-90 transition-transform"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to as any}
                onClick={() => setTimeout(onClose, 0)}
                className="flex w-full items-center gap-3 rounded-[18px] border border-white/80 bg-white/40 px-3 py-3 min-h-[52px] active:scale-[0.98] transition-transform"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-white/55 text-white"
                  style={{
                    background: `linear-gradient(160deg, ${item.tone}cc, ${item.tone}88)`,
                    boxShadow: "0 5px 12px -7px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.75)",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.3} />
                </span>
                <span className="flex-1 text-right text-[13px] font-extrabold text-[#3a2a18]">
                  {item.label}
                </span>
                <ChevronLeft className="h-4 w-4 shrink-0 -scale-x-100 text-[#b8893a]/60" strokeWidth={2.4} />
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#e7c97a]/25 px-4 py-3 text-center">
          <p className="text-[9.5px] font-bold text-[#b8893a]/66">
            Ⲁ · ألفا — كلمة الله دائماً معك · Ⲱ
          </p>
        </div>
      </aside>
    </>
  );

  return createPortal(drawer, document.body);
}
