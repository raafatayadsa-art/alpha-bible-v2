import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Church, MapPin, Navigation, Share2, Star, ShieldCheck, Info,
} from "lucide-react";
import type { ChurchDirectoryRow } from "../types";
import { CHURCH_DIR } from "../tokens";
import { directoryLocationLine, formatDistanceKm, directionsUrlForRow, shareUrlForChurch } from "../normalize";
import { isFavoriteChurch, toggleFavoriteChurch } from "../favorites";
import { JoinChurchButton } from "@/features/church/JoinChurchButton";
import { ChurchDirectoryConnectActions } from "./ChurchDirectoryConnectActions";
import { useState } from "react";

type Props = {
  church: ChurchDirectoryRow | null;
  onClose: () => void;
};

export function ChurchDirectoryFloatingCard({ church, onClose }: Props) {
  const [saved, setSaved] = useState(() => (church ? isFavoriteChurch(church.id) : false));

  if (!church) return null;

  const location = directoryLocationLine(church);
  const distance = formatDistanceKm(church.distanceKm);
  const directionsUrl = directionsUrlForRow(church);

  const share = async () => {
    const url = shareUrlForChurch(church.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: church.name, text: location, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* ignore */
    }
  };

  const toggleSave = () => {
    const next = toggleFavoriteChurch(church.id);
    setSaved(next);
  };

  return (
    <AnimatePresence>
      <motion.div
        key={church.id}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="pointer-events-auto mx-3 rounded-[26px] border backdrop-blur-2xl overflow-hidden shadow-[0_24px_60px_-20px_rgba(93,50,145,0.45)]"
        style={{
          background: `linear-gradient(165deg, ${CHURCH_DIR.glass}, rgba(245,242,237,0.92))`,
          borderColor: CHURCH_DIR.border,
        }}
      >
        <div className="flex gap-3 p-3.5 text-right">
          <div
            className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[20px] border"
            style={{ borderColor: CHURCH_DIR.goldSoft }}
          >
            {church.logoUrl ? (
              <img src={church.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="grid h-full w-full place-items-center"
                style={{ background: CHURCH_DIR.purpleSoft, color: CHURCH_DIR.purple }}
              >
                <Church className="h-8 w-8" strokeWidth={2} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="text-[11px] font-bold opacity-50"
                style={{ color: CHURCH_DIR.sub }}
              >
                ✕
              </button>
              <div className="min-w-0 flex-1">
                <h3 className="font-arabic-serif text-[15px] font-extrabold leading-tight line-clamp-2" style={{ color: CHURCH_DIR.text }}>
                  {church.name}
                </h3>
                {church.patronSaint ? (
                  <p className="mt-0.5 text-[11px] font-bold line-clamp-1" style={{ color: CHURCH_DIR.purple }}>
                    {church.patronSaint}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center justify-end gap-1.5">
              {church.isVerified ? (
                <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" />
                  موثقة
                </span>
              ) : null}
              {distance ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
                  <MapPin className="h-3 w-3" />
                  {distance}
                </span>
              ) : null}
            </div>

            {location ? (
              <p className="mt-1 text-[11px] font-bold line-clamp-1" style={{ color: CHURCH_DIR.sub }}>
                {location}
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-3 pb-2">
          <JoinChurchButton churchId={church.id} compact />
        </div>

        <div className="grid grid-cols-4 gap-1.5 border-t px-2 py-2 church-dir-action-grid" style={{ borderColor: CHURCH_DIR.border }}>
          <ChurchDirectoryConnectActions
            church={{
              id: church.id,
              name: church.name,
              phone: church.phone,
              whatsapp: church.whatsapp,
            }}
          />
          <Link
            to="/church/directory/$placeId"
            params={{ placeId: church.id }}
            className="flex flex-col items-center gap-1 rounded-2xl py-2 active:scale-95 transition-transform"
          >
            <Info className="h-4 w-4" style={{ color: CHURCH_DIR.purple }} strokeWidth={2.2} />
            <span className="text-[9.5px] font-extrabold" style={{ color: CHURCH_DIR.text }}>التفاصيل</span>
          </Link>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-2xl py-2 active:scale-95 transition-transform"
          >
            <Navigation className="h-4 w-4" style={{ color: CHURCH_DIR.purple }} strokeWidth={2.2} />
            <span className="text-[9.5px] font-extrabold" style={{ color: CHURCH_DIR.text }}>الاتجاهات</span>
          </a>
          <button type="button" onClick={toggleSave} className="flex flex-col items-center gap-1 rounded-2xl py-2 active:scale-95">
            <Star className="h-4 w-4" style={{ color: saved ? CHURCH_DIR.gold : CHURCH_DIR.purple }} fill={saved ? CHURCH_DIR.gold : "none"} strokeWidth={2.2} />
            <span className="text-[9.5px] font-extrabold" style={{ color: CHURCH_DIR.text }}>{saved ? "محفوظة" : "حفظ"}</span>
          </button>
          <button type="button" onClick={share} className="flex flex-col items-center gap-1 rounded-2xl py-2 active:scale-95">
            <Share2 className="h-4 w-4" style={{ color: CHURCH_DIR.purple }} strokeWidth={2.2} />
            <span className="text-[9.5px] font-extrabold" style={{ color: CHURCH_DIR.text }}>مشاركة</span>
          </button>
        </div>
        <style>{`
          .church-dir-action-grid .action-tile {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            border-radius: 16px;
            padding: 0.65rem 0.25rem;
            font-size: 9.5px;
            font-weight: 800;
            color: #5D3291;
            background: rgba(255,255,255,0.72);
            border: 1px solid rgba(93,50,145,0.12);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
