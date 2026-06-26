import { Component, type ErrorInfo, type ReactNode, lazy, Suspense, useEffect, useState } from "react";
import type { ChurchDirectoryMapPin } from "../types";
import { CHURCH_DIR } from "../tokens";

const LazyMap = lazy(() =>
  import("./ChurchDirectoryMapView").then((m) => ({ default: m.ChurchDirectoryMapView })),
);

type MapProps = {
  churches: ChurchDirectoryMapPin[];
  selectedId: string | null;
  userLat: number | null;
  userLng: number | null;
  onSelect: (row: ChurchDirectoryMapPin) => void;
  className?: string;
  mapTheme?: "light" | "dark";
};

function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`grid place-items-center ${className ?? "h-full w-full"}`}
      style={{ background: CHURCH_DIR.beigeDeep }}
    >
      <p className="text-[12px] font-bold" style={{ color: CHURCH_DIR.sub }}>
        جاري تحميل الخريطة…
      </p>
    </div>
  );
}

class MapErrorBoundary extends Component<
  { children: ReactNode; onError: () => void; className?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ChurchDirectoryMap]", error, info);
    this.props.onError();
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          className={`grid place-items-center px-6 text-center ${this.props.className ?? "h-full w-full"}`}
          style={{ background: CHURCH_DIR.beigeDeep }}
        >
          <p className="text-[13px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
            تعذّر تحميل الخريطة
          </p>
          <p className="mt-1 text-[11px] font-bold" style={{ color: CHURCH_DIR.sub }}>
            استخدم عرض القائمة للبحث عن الكنائس
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ChurchDirectoryMapGate(props: MapProps & { onMapError?: () => void }) {
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) {
    return <MapSkeleton className={props.className} />;
  }

  return (
    <MapErrorBoundary
      className={props.className}
      onError={() => props.onMapError?.()}
    >
      <Suspense fallback={<MapSkeleton className={props.className} />}>
        <LazyMap {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
}
