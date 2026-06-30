import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Church, MapPin, Navigation, ShieldCheck } from "lucide-react";
import type { ChurchDirectoryRow } from "../types";
import { CHURCH_DIR } from "../tokens";
import { directoryLocationLine, formatDistanceKm, directionsUrlForRow } from "../normalize";
import { JoinChurchButton } from "@/features/church/JoinChurchButton";

type Props = {
  rows: ChurchDirectoryRow[];
  selectedId: string | null;
  totalCount: number;
  loading: boolean;
  hasMore: boolean;
  onSelect: (row: ChurchDirectoryRow) => void;
  onLoadMore: () => void;
  loadingMore: boolean;
  topPadding?: number;
};

export function ChurchDirectoryListView({
  rows,
  selectedId,
  totalCount,
  loading,
  hasMore,
  onSelect,
  onLoadMore,
  loadingMore,
  topPadding = 148,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) onLoadMore();
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading && rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-[13px] font-bold" style={{ color: CHURCH_DIR.sub }}>
          جاري تحميل الكنائس القريبة…
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto px-3 pb-28 transition-all duration-300"
      style={{ paddingTop: `calc(env(safe-area-inset-top) + ${topPadding}px)` }}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-bold" style={{ color: CHURCH_DIR.sub }}>
          {rows.length.toLocaleString("ar-EG")} / {totalCount.toLocaleString("ar-EG")}
        </span>
        <h2 className="text-[13px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
          نتائج الدليل
        </h2>
      </div>

      <div className="space-y-2.5">
        {rows.map((church) => {
          const selected = church.id === selectedId;
          const location = directoryLocationLine(church);
          const distance = formatDistanceKm(church.distanceKm);
          return (
            <article
              key={church.id}
              ref={selected ? selectedRef : undefined}
              onClick={() => onSelect(church)}
              className="cursor-pointer rounded-[22px] border p-3 backdrop-blur-xl transition-transform active:scale-[0.99]"
              style={{
                background: selected
                  ? `linear-gradient(165deg, rgba(93,50,145,0.12), rgba(255,255,255,0.92))`
                  : `linear-gradient(165deg, ${CHURCH_DIR.glass}, rgba(245,242,237,0.88))`,
                borderColor: selected ? CHURCH_DIR.purpleGlow : CHURCH_DIR.border,
                boxShadow: selected ? `0 16px 36px -18px ${CHURCH_DIR.purpleGlow}` : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[18px] border"
                  style={{ borderColor: CHURCH_DIR.goldSoft }}
                >
                  {church.logoUrl ? (
                    <img src={church.logoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full w-full place-items-center" style={{ background: CHURCH_DIR.purpleSoft, color: CHURCH_DIR.purple }}>
                      <Church className="h-6 w-6" strokeWidth={2} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <h3 className="text-[13.5px] font-extrabold leading-tight line-clamp-2" style={{ color: CHURCH_DIR.text }}>
                    {church.name}
                  </h3>
                  {location ? (
                    <p className="mt-1 text-[11px] font-bold line-clamp-1" style={{ color: CHURCH_DIR.sub }}>
                      {location}
                    </p>
                  ) : null}
                  <div className="mt-1.5 flex items-center justify-end gap-2">
                    {church.isVerified ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700">
                        <ShieldCheck className="h-3 w-3" />
                        موثقة
                      </span>
                    ) : null}
                    {distance ? (
                      <span className="text-[10px] font-bold" style={{ color: CHURCH_DIR.purple }}>
                        {distance}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1.5">
                  <div onClick={(e) => e.stopPropagation()}>
                    <JoinChurchButton churchId={church.id} mini className="min-w-[32px]" />
                  </div>
                  <a
                    href={directionsUrlForRow(church)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="grid h-9 w-9 place-items-center rounded-full text-white active:scale-95"
                    style={{ background: `linear-gradient(160deg, #7b4cb8, ${CHURCH_DIR.purple})` }}
                    aria-label="الاتجاهات"
                  >
                    <Navigation className="h-4 w-4" strokeWidth={2.3} />
                  </a>
                  <Link
                    to="/church/directory/$placeId"
                    params={{ placeId: church.id }}
                    onClick={(e) => e.stopPropagation()}
                    className="grid h-9 w-9 place-items-center rounded-full border active:scale-95"
                    style={{ borderColor: CHURCH_DIR.border, color: CHURCH_DIR.purple, background: "rgba(255,255,255,0.85)" }}
                    aria-label="التفاصيل"
                  >
                    <MapPin className="h-4 w-4" strokeWidth={2.3} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div ref={sentinelRef} className="py-4 text-center">
        {loadingMore ? (
          <p className="text-[11px] font-bold" style={{ color: CHURCH_DIR.sub }}>تحميل المزيد…</p>
        ) : hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            className="text-[11px] font-extrabold underline"
            style={{ color: CHURCH_DIR.purple }}
          >
            تحميل 20 كنيسة أخرى
          </button>
        ) : rows.length > 0 ? (
          <p className="text-[10px] font-bold opacity-60" style={{ color: CHURCH_DIR.sub }}>نهاية النتائج</p>
        ) : (
          <p className="text-[12px] font-bold" style={{ color: CHURCH_DIR.sub }}>لا توجد نتائج</p>
        )}
      </div>
    </div>
  );
}
