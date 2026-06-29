import { useMemo } from "react";
import { ChurchDirectoryMapGate } from "@/features/church-directory/components/ChurchDirectoryMapGate";
import { useChurchDirectoryMapPins } from "@/features/church-directory";
import type { ChurchDirectoryMapPin } from "@/features/church-directory/types";
import "@/features/church-directory/church-directory-map.css";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";

export function FounderGlobeMap({
  className = "",
  onSelect,
  showPinBadge = true,
}: {
  className?: string;
  onSelect?: (pin: ChurchDirectoryMapPin) => void;
  showPinBadge?: boolean;
}) {
  const { data: pins = [], isLoading } = useChurchDirectoryMapPins();
  const selectedId = useMemo(() => null, []);

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border ${className}`}
      style={{
        borderColor: MC.panelBorder,
        background: "#060a14",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 32px -12px rgba(93,50,145,0.45)",
      }}
    >
      {showPinBadge && !isLoading ? (
        <div
          className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[9px] font-extrabold tabular-nums"
          style={{
            borderColor: `${PP_GOLD}55`,
            background: "rgba(6,10,20,0.88)",
            color: PP_GOLD,
            backdropFilter: "blur(8px)",
          }}
        >
          {formatPlatformNumber(pins.length)} كنيسة
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid h-full min-h-[240px] place-items-center text-[11px] font-bold" style={{ color: MC.muted }}>
          جاري تحميل خريطة الكنائس…
        </div>
      ) : (
        <ChurchDirectoryMapGate
          churches={pins}
          selectedId={selectedId}
          userLat={null}
          userLng={null}
          onSelect={(pin) => onSelect?.(pin)}
          mapTheme="dark"
          className="h-full min-h-[240px] w-full"
        />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
        style={{ background: "linear-gradient(180deg, rgba(6,10,20,0.55) 0%, transparent 100%)" }}
      />
    </div>
  );
}
