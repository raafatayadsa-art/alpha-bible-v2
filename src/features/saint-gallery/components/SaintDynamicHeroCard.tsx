import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { CopticCross } from "@/components/coptic";
import { GlassSurface } from "@/components/bible/primitives";
import {
  ALPHA_HERO_ACCENT,
  HeroSpiritLedgerRow,
  readHeroMap,
  readHeroSet,
  seedHeroCount,
  writeHeroMap,
  writeHeroSet,
} from "@/components/home/hero-card-chrome";
import type { Saint } from "@/features/synaxarium";
import { useApprovedSaintGallery } from "../useSaintGallery";
import type { SaintGalleryImage } from "../types";
import { SaintShareImagePicker } from "./SaintShareImagePicker";

type SaintDynamicHeroCardProps = {
  saint: Saint;
  onOpenSaint?: () => void;
  onOpenAlbum?: () => void;
};

const LIKE_KEY = "alpha.synaxarium.hero.likes";
const SHARE_KEY = "alpha.synaxarium.hero.shares";
const LIKED_KEY = "alpha.synaxarium.hero.liked";

function buildImageList(fallback: string, approved: SaintGalleryImage[]): { url: string; image?: SaintGalleryImage }[] {
  if (approved.length === 0) return [{ url: fallback }];
  return approved.map((img) => ({ url: img.publicUrl, image: img }));
}

function engagementDayId(saintId: string) {
  return `${saintId}-${new Date().toISOString().slice(0, 10)}`;
}

export function SaintDynamicHeroCard({ saint, onOpenSaint, onOpenAlbum }: SaintDynamicHeroCardProps) {
  const { data: approved = [] } = useApprovedSaintGallery(saint.id);
  const images = useMemo(() => buildImageList(saint.image, approved), [saint.image, approved]);
  const [index, setIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [meditations, setMeditations] = useState(0);
  const [broadcasts, setBroadcasts] = useState(0);
  const [meditated, setMeditated] = useState(false);

  const eid = useMemo(() => engagementDayId(saint.id), [saint.id]);

  useEffect(() => {
    setIndex(0);
  }, [saint.id, approved.length]);

  useEffect(() => {
    const likeMap = readHeroMap(LIKE_KEY);
    const shareMap = readHeroMap(SHARE_KEY);
    const likedSet = readHeroSet(LIKED_KEY);
    setMeditations((likeMap[eid] ?? 0) + seedHeroCount(saint.id, 7));
    setBroadcasts((shareMap[eid] ?? 0) + seedHeroCount(saint.id, 13));
    setMeditated(likedSet.has(eid));
  }, [saint.id, eid]);

  const total = images.length;

  const cycleImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (total <= 1) return;
    setIndex((i) => (i + 1) % total);
    setFadeKey((k) => k + 1);
  };

  const onToggleMeditation = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      const likeMap = readHeroMap(LIKE_KEY);
      const likedSet = readHeroSet(LIKED_KEY);
      const base = seedHeroCount(saint.id, 7);
      if (meditated) {
        likeMap[eid] = Math.max(0, (likeMap[eid] ?? 0) - 1);
        likedSet.delete(eid);
        setMeditated(false);
        setMeditations(base + (likeMap[eid] ?? 0));
      } else {
        likeMap[eid] = (likeMap[eid] ?? 0) + 1;
        likedSet.add(eid);
        setMeditated(true);
        setMeditations(base + likeMap[eid]);
      }
      writeHeroMap(LIKE_KEY, likeMap);
      writeHeroSet(LIKED_KEY, likedSet);
    },
    [meditated, eid, saint.id],
  );

  const onShare = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      const shareMap = readHeroMap(SHARE_KEY);
      const base = seedHeroCount(saint.id, 13);
      shareMap[eid] = (shareMap[eid] ?? 0) + 1;
      writeHeroMap(SHARE_KEY, shareMap);
      setBroadcasts(base + shareMap[eid]);
      setShareOpen(true);
    },
    [eid, saint.id],
  );

  return (
    <>
      <GlassSurface className="overflow-hidden p-0 bg-white border-[#ead9b1] shadow-[0_18px_40px_-22px_rgba(120,80,30,0.55)]">
        <button type="button" onClick={onOpenSaint} className="block w-full text-right active:scale-[0.99] transition-transform">
          <div className="relative h-[230px] overflow-hidden">
            {images.map((img, i) => (
              <img
                key={`${fadeKey}-${img.url}-${i}`}
                src={img.url}
                alt={saint.name}
                loading={i === index ? "eager" : "lazy"}
                draggable={false}
                className="absolute inset-y-0 right-0 h-full w-[68%] object-cover object-center select-none transition-opacity duration-500 ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
              />
            ))}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to left, rgba(255,255,255,0) 30%, rgba(255,251,240,0.35) 50%, rgba(255,250,238,0.85) 60%, #ffffff 70%)",
              }}
            />

            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-[#3a2a18] border border-[#ead9b1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6a4ab5]" />
              قديس اليوم
            </div>

            {total > 1 ? (
              <span className="absolute top-3 left-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white z-10">
                {index + 1} / {total}
              </span>
            ) : null}

            <div className="absolute inset-y-0 left-0 right-[42%] p-6 pl-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#b8893a]">
                <CopticCross size={10} />
                <span>{saint.copticDate}</span>
              </div>
              <h2 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight text-right mt-1.5 line-clamp-2">
                {saint.name}
              </h2>
              <p className="text-[11.5px] text-[#6a543a] mt-1 text-right line-clamp-1">{saint.title}</p>
              <p className="text-[12px] text-[#3a2a18] mt-2.5 leading-relaxed line-clamp-2 text-right">{saint.summary}</p>

              <div
                className="pointer-events-auto mt-2.5"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <HeroSpiritLedgerRow
                  accent={ALPHA_HERO_ACCENT}
                  meditations={meditations}
                  broadcasts={broadcasts}
                  meditated={meditated}
                  meditateSublabel="وقف مع القديس"
                  onMeditate={() => onToggleMeditation()}
                  onBroadcast={() => onShare()}
                  className="mt-0 gap-2 px-1 py-0.5"
                />
              </div>

              {total > 1 ? (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={cycleImage}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 h-8 text-[10.5px] font-bold bg-white/90 border border-[#ead9b1] text-[#3a2a18] active:scale-95 transition-transform"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> تغيير الصورة
                  </button>
                </div>
              ) : null}

              {approved.length > 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenAlbum?.();
                  }}
                  className="mt-2 self-end inline-flex items-center gap-1 text-[10.5px] font-bold text-[#6a4ab5] active:scale-95 transition-transform"
                >
                  📷 {approved.length} صورة متاحة
                </button>
              ) : null}
            </div>
          </div>
        </button>
      </GlassSurface>

      <SaintShareImagePicker
        open={shareOpen}
        onOpenChange={setShareOpen}
        saintName={saint.name}
        saintSummary={saint.summary}
        images={images.map((img) => img.url)}
        initialIndex={index}
      />
    </>
  );
}
