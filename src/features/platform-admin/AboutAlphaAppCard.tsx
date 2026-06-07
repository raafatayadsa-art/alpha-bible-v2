import { useCallback, useRef } from "react";
import { APP_BUILD, APP_NAME, APP_VERSION } from "@/lib/app-meta";
import { GlassCard } from "@/features/settings/control-center-ui";

const TAP_WINDOW_MS = 3000;
const REQUIRED_TAPS = 5;

export function AboutAlphaAppCard({ onVersionUnlock }: { onVersionUnlock: () => void }) {
  const tapsRef = useRef<number[]>([]);

  const handleVersionTap = useCallback(() => {
    const now = Date.now();
    tapsRef.current = tapsRef.current.filter((t) => now - t < TAP_WINDOW_MS);
    tapsRef.current.push(now);
    if (tapsRef.current.length >= REQUIRED_TAPS) {
      tapsRef.current = [];
      onVersionUnlock();
    }
  }, [onVersionUnlock]);

  return (
    <div className="mx-1.5 my-2">
      <GlassCard accent="#b8893a">
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9a7e5a]">
            معلومات التطبيق
          </p>
          <h3 className="mt-2 font-arabic-serif text-[17px] font-extrabold text-[#3a2a18]">{APP_NAME}</h3>

          <div className="mt-4 space-y-2.5 text-right">
            <div className="flex items-center justify-between gap-3 rounded-[14px] bg-white/35 px-3 py-2.5">
              <button
                type="button"
                onClick={handleVersionTap}
                className="text-[14px] font-extrabold tabular-nums text-[#3a2a18] active:opacity-70"
                aria-label={`الإصدار ${APP_VERSION}`}
              >
                {APP_VERSION}
              </button>
              <span className="text-[11px] font-bold text-[#6a543a]">الإصدار الحالي</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[14px] bg-white/35 px-3 py-2.5">
              <span className="text-[13px] font-extrabold tabular-nums text-[#3a2a18]">{APP_BUILD}</span>
              <span className="text-[11px] font-bold text-[#6a543a]">رقم البناء Build</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
