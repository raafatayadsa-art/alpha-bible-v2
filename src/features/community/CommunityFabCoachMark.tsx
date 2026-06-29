import { useEffect, useState } from "react";

const COACH_KEY = "ab:community-fab-coach-v1";

export function CommunityFabCoachMark() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(COACH_KEY)) return;
    const t = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COACH_KEY, "1");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        aria-label="إغلاق التلميح"
        className="fixed inset-0 z-[44] bg-black/10"
        onClick={dismiss}
      />
      <div
        dir="rtl"
        className="fixed z-[47] max-w-[220px] rounded-[16px] border border-[#e7c97a]/40 bg-[#3a2a18] px-3.5 py-3 text-right shadow-lg"
        style={{
          bottom: "calc(max(env(safe-area-inset-bottom), 8px) + 158px)",
          left: "max(16px, env(safe-area-inset-left))",
        }}
      >
        <p className="text-[12px] font-extrabold leading-snug text-[#f0d78c]">مركز المجتمع</p>
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/70">
          اضغط + لإضافة صديق، طلب صلاة، أو فتح السجل الروحي.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 rounded-full bg-[#e7c97a]/20 px-3 py-1 text-[10px] font-extrabold text-[#f0d78c]"
        >
          فهمت
        </button>
      </div>
    </>
  );
}
