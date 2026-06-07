import { useCallback, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  googleMapsUrl,
  openStreetMapEmbedUrl,
  parseLocationDisplay,
  resolveLocationLabel,
} from "./church-location";
import { setupGreenButtonSm, setupInput, setupSectionCard } from "./church-setup-styles";

export type LocationValue = {
  latitude: number;
  longitude: number;
  locationLabel: string;
  mapLocation: string;
};

type ChurchLocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  mapLocation: string;
  disabled?: boolean;
  onSelect: (value: LocationValue) => void;
};

const DEFAULT_ZOOM = 2;
const MIN_ZOOM = 0;
const MAX_ZOOM = 4;

function geolocationErrorMessage(code: number): string {
  if (code === 1) {
    return "لم يتم السماح بالوصول إلى موقعك. يرجى تفعيل خدمة الموقع من إعدادات الجهاز والمتصفح.";
  }
  if (code === 2) {
    return "تعذّر تحديد موقعك حالياً. تأكد من تفعيل خدمة الموقع وحاول مرة أخرى.";
  }
  if (code === 3) {
    return "انتهت مهلة تحديد الموقع. حاول مرة أخرى.";
  }
  return "تعذّر تحديد موقعك. حاول مرة أخرى.";
}

function AlphaMapPin() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[52%] z-10 -translate-x-1/2 -translate-y-full"
      aria-hidden
    >
      <div className="flex flex-col items-center">
        <span
          className="grid h-11 w-11 place-items-center rounded-full border-2 border-white/90 shadow-[0_10px_24px_-8px_rgba(124,58,237,0.55),0_4px_12px_-4px_rgba(212,168,87,0.45)]"
          style={{
            background: "linear-gradient(145deg, #D4A857 0%, #7C3AED 62%, #6D28D9 100%)",
          }}
        >
          <MapPin className="h-5 w-5 text-white" strokeWidth={2.2} />
        </span>
        <span
          className="-mt-1 h-2.5 w-2.5 rotate-45 rounded-[2px] border border-white/40 shadow-sm"
          style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
        />
      </div>
    </div>
  );
}

function LocationGlassOverlay({
  city,
  governorate,
}: {
  city: string;
  governorate: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-20 rounded-2xl border border-white/60 bg-white/55 px-3.5 py-2.5 shadow-[0_10px_28px_-12px_rgba(58,42,24,0.3)] backdrop-blur-md">
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#3a2a18]">
        <span aria-hidden>📍</span>
        الموقع المحدد
      </p>
      {city && (
        <p className="mt-1 text-[12.5px] font-bold leading-snug text-[#7C3AED]">{city}</p>
      )}
      {governorate && (
        <p className="mt-0.5 text-[11px] font-semibold text-[#6a543a]">{governorate}</p>
      )}
    </div>
  );
}

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div
      className="absolute bottom-3 left-3 z-20 flex flex-col overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_20px_-10px_rgba(58,42,24,0.35)] backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        aria-label="تكبير الخريطة"
        className="grid h-9 w-9 place-items-center text-[#3a2a18] transition hover:bg-[#f7eed6] active:scale-95 disabled:opacity-35"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <div className="h-px bg-[#efe2c4]/80" />
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="تصغير الخريطة"
        className="grid h-9 w-9 place-items-center text-[#3a2a18] transition hover:bg-[#f7eed6] active:scale-95 disabled:opacity-35"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function MapModal({
  lat,
  lng,
  zoom,
  city,
  governorate,
  onClose,
  onZoomIn,
  onZoomOut,
}: {
  lat: number;
  lng: number;
  zoom: number;
  city: string;
  governorate: string;
  onClose: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[#3a2a18]/45 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-[26px] border border-[#efe2c4]/90 bg-[#f7eed6] shadow-[0_24px_60px_-20px_rgba(58,42,24,0.55)] animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#efe2c4]/70 bg-white/50 px-4 py-3 backdrop-blur-md">
          <div className="min-w-0 text-right">
            <p className="text-[12px] font-extrabold text-[#3a2a18]">📍 الموقع المحدد</p>
            {city && <p className="text-[11px] font-bold text-[#7C3AED]">{city}</p>}
            {governorate && <p className="text-[10px] text-[#6a543a]">{governorate}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#efe2c4] bg-white/80 text-[#3a2a18] active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <iframe
            title="خريطة موقع الكنيسة"
            src={openStreetMapEmbedUrl(lat, lng, zoom)}
            className="h-[min(62vh,420px)] w-full border-0 bg-[#f4ead8]"
          />
          <AlphaMapPin />
          <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
        </div>
      </div>
    </div>
  );
}

function PremiumMapCard({
  lat,
  lng,
  city,
  governorate,
  onOpenModal,
}: {
  lat: number;
  lng: number;
  city: string;
  governorate: string;
  onOpenModal: () => void;
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-[24px] border border-[#efe2c4]/95 bg-[#f7eed6]/85 shadow-[0_20px_48px_-24px_rgba(120,80,30,0.55),0_0_36px_-18px_rgba(124,58,237,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl transition active:scale-[0.995]"
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenModal();
      }}
      aria-label="فتح الخريطة بحجم أكبر"
    >
      <iframe
        title="معاينة موقع الكنيسة"
        src={openStreetMapEmbedUrl(lat, lng, zoom)}
        className="pointer-events-none h-[220px] w-full border-0 bg-[#f4ead8]"
        loading="lazy"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f7eed6]/35 via-transparent to-[#fbf3e1]/15" />

      <LocationGlassOverlay city={city} governorate={governorate} />
      <AlphaMapPin />

      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 1, MAX_ZOOM))}
        onZoomOut={() => setZoom((z) => Math.max(z - 1, MIN_ZOOM))}
      />
    </div>
  );
}

export function ChurchLocationPicker({
  latitude,
  longitude,
  locationLabel,
  mapLocation,
  disabled = false,
  onSelect,
}: ChurchLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(DEFAULT_ZOOM);

  const hasSelection = latitude != null && longitude != null;
  const mapsUrl = hasSelection ? mapLocation || googleMapsUrl(latitude!, longitude!) : "";
  const { city, governorate } = parseLocationDisplay(locationLabel);

  const openPicker = useCallback(() => {
    if (disabled) return;
    if (hasSelection) {
      setMapModalOpen(true);
      return;
    }
    setOpen(true);
    setGeoError(null);
  }, [disabled, hasSelection]);

  const applyLocation = async (lat: number, lng: number) => {
    const label = await resolveLocationLabel(lat, lng);
    onSelect({
      latitude: lat,
      longitude: lng,
      locationLabel: label,
      mapLocation: googleMapsUrl(lat, lng),
    });
    setLoading(false);
    setOpen(false);
    setModalZoom(DEFAULT_ZOOM);
  };

  const useCurrentLocation = () => {
    if (disabled || loading) return;
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("متصفحك لا يدعم تحديد الموقع. جرّب متصفحاً آخر أو جهازاً مختلفاً.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void applyLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setLoading(false);
        setGeoError(geolocationErrorMessage(error.code));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const fieldLabel = hasSelection
    ? city || locationLabel || "موقع محدد على الخريطة"
    : "اضغط لتحديد موقع الكنيسة على الخريطة";

  const locationActionLabel = hasSelection ? "تغيير الموقع" : "استخدام موقعي الحالي";
  const LocationActionIcon = hasSelection ? Navigation : MapPin;

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className={cn(
            setupInput,
            "flex-1 cursor-pointer text-right font-bold",
            !hasSelection && "text-[#9a7e5a] font-semibold",
            hasSelection && "text-[#3a2a18]",
            disabled && "cursor-default opacity-70",
          )}
        >
          {fieldLabel}
        </button>
        {!disabled && (
          <button
            type="button"
            onClick={openPicker}
            className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-[#efe2c4] bg-white/70 text-[#7C3AED] active:scale-95 transition"
            aria-label="تحديد الموقع على الخريطة"
          >
            <MapPin className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasSelection && (
        <div className="space-y-2.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 rounded-2xl border border-[#16A34A]/25 bg-[#16A34A]/10 px-3.5 py-2.5 shadow-[0_6px_18px_-12px_rgba(22,163,74,0.35)] backdrop-blur-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A34A]" />
            <p className="text-[12px] font-extrabold text-[#16A34A]">
              ✓ تم تحديد موقع الكنيسة بنجاح
            </p>
          </div>

          <PremiumMapCard
            lat={latitude!}
            lng={longitude!}
            city={city}
            governorate={governorate}
            onOpenModal={() => setMapModalOpen(true)}
          />

          {!disabled && (
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={loading}
              className={cn(setupGreenButtonSm, "w-full", loading && "opacity-70")}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تحديد الموقع...
                </>
              ) : (
                <>
                  <LocationActionIcon className="h-4 w-4" />
                  {locationActionLabel}
                </>
              )}
            </button>
          )}

          {mapsUrl && (
            <div className="flex justify-end px-0.5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-extrabold text-[#16A34A] underline decoration-[#16A34A]/40 underline-offset-[3px] transition hover:text-[#15803d] active:scale-[0.98]"
              >
                عرض على Google Maps
              </a>
            </div>
          )}
        </div>
      )}

      {open && !disabled && !hasSelection && (
        <div
          className={cn(setupSectionCard, "p-3.5 animate-in fade-in duration-200")}
          style={{ boxShadow: "0 10px 24px -18px rgba(120,80,30,0.35), inset 0 1px 0 rgba(255,255,255,0.85)" }}
        >
          <p className="text-[12px] font-bold text-[#6a543a]">
            حدّد موقع الكنيسة لإرفاقه بطلب التأسيس.
          </p>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={loading}
            className={cn(setupGreenButtonSm, "mt-3 w-full", loading && "opacity-70")}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري تحديد الموقع...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                استخدام موقعي الحالي
              </>
            )}
          </button>
          {geoError && (
            <p className="mt-2.5 rounded-xl border border-[#cdb8ef]/50 bg-[#efe7fb]/70 px-3 py-2.5 text-[11.5px] leading-relaxed font-bold text-[#4a2f8a]">
              {geoError}
            </p>
          )}
        </div>
      )}

      {mapModalOpen && hasSelection && (
        <MapModal
          lat={latitude!}
          lng={longitude!}
          zoom={modalZoom}
          city={city}
          governorate={governorate}
          onClose={() => setMapModalOpen(false)}
          onZoomIn={() => setModalZoom((z) => Math.min(z + 1, MAX_ZOOM))}
          onZoomOut={() => setModalZoom((z) => Math.max(z - 1, MIN_ZOOM))}
        />
      )}
    </div>
  );
}
