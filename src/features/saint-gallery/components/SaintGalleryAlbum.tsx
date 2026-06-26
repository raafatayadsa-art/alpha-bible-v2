import { Camera, Eye, Heart, Trophy } from "lucide-react";
import type { SaintGalleryImage } from "../types";
import { contributorLabel } from "../types";

type SaintGalleryAlbumProps = {
  images: SaintGalleryImage[];
  onImageClick?: (image: SaintGalleryImage, index: number) => void;
  showContest?: boolean;
};

export function SaintGalleryAlbum({ images, onImageClick, showContest = true }: SaintGalleryAlbumProps) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ead9b1] bg-white/85 p-6 text-center text-[12px] text-[#6a543a]">
        لا توجد صور معتمدة بعد. كن أول من يساهم!
      </div>
    );
  }

  const topLiked = [...images].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);

  return (
    <div className="space-y-4">
      {showContest && topLiked[0] ? (
        <div className="rounded-2xl border border-[#ead9b1] bg-gradient-to-l from-[#fff7e3] to-white p-3.5">
          <div className="flex items-center gap-2 text-[12px] font-extrabold text-[#3a2a18]">
            <Trophy className="h-4 w-4 text-[#b8893a]" />
            أفضل صورة · فائز الشهر
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
            {topLiked.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onImageClick?.(img, images.indexOf(img))}
                className="relative shrink-0 w-24 h-28 rounded-xl overflow-hidden border border-[#ead9b1] active:scale-95 transition-transform"
              >
                <img src={img.publicUrl} alt="" className="h-full w-full object-cover" />
                <span className="absolute top-1 right-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  #{i + 1}
                </span>
                <span className="absolute bottom-1 inset-x-1 flex items-center justify-center gap-1 rounded-full bg-black/45 px-1 py-0.5 text-[9px] text-white">
                  <Heart className="h-2.5 w-2.5" /> {img.likeCount}
                  <Eye className="h-2.5 w-2.5 mr-1" /> {img.viewCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2.5">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => onImageClick?.(img, index)}
            className="group relative overflow-hidden rounded-2xl border border-[#ead9b1] bg-white active:scale-[0.98] transition-transform text-right"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img src={img.publicUrl} alt={img.title ?? ""} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-2.5">
              {img.title ? (
                <p className="text-[11px] font-bold text-[#3a2a18] line-clamp-1">{img.title}</p>
              ) : null}
              <p className="mt-0.5 text-[10px] text-[#6a543a] inline-flex items-center gap-1">
                <Camera className="h-3 w-3" />
                بواسطة: {contributorLabel(img)}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[9.5px] font-bold text-[#8a6a3a]">
                <span className="inline-flex items-center gap-0.5">
                  <Heart className="h-3 w-3" /> {img.likeCount}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Eye className="h-3 w-3" /> {img.viewCount}
                </span>
              </div>
            </div>
            {img.isFeatured ? (
              <span className="absolute top-2 left-2 rounded-full bg-[#6a4ab5] px-2 py-0.5 text-[9px] font-bold text-white">
                غلاف
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
