import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Church, MapPin, Navigation } from "lucide-react";
import {
  HeroBadgeEmblem,
  HeroLedgerStylesHost,
  HeroSpiritLedgerCell,
} from "@/components/home/hero-card-chrome";
import { fetchChurchDirectoryFacets } from "@/features/church-directory";
import cardChurch from "@/assets/home/card-church.jpg";

const PURPLE = "#5D3291";
const PURPLE_SOFT = "rgba(93, 50, 145, 0.45)";
const GOLD = "#D4AF37";
const GOLD_SOFT = "rgba(212, 175, 55, 0.35)";

export function ChurchDirectoryHomeCard() {
  const navigate = useNavigate();
  const goDirectory = () => navigate({ to: "/church/directory" });

  const { data: facets } = useQuery({
    queryKey: ["church-directory-home-facets"],
    queryFn: fetchChurchDirectoryFacets,
    staleTime: 1000 * 60 * 15,
  });

  const totalLabel = facets?.totalCount
    ? facets.totalCount.toLocaleString("ar-EG")
    : "1,241";

  return (
    <article
      className="group relative h-[156px] w-full overflow-hidden rounded-[26px] border"
      style={{
        borderColor: `${GOLD}44`,
        background: "#1a0f28",
        boxShadow:
          "0 20px 44px -18px rgba(93,50,145,0.55), 0 0 0 1px rgba(212,175,55,0.12), 0 0 32px rgba(93,50,145,0.15)",
      }}
    >
      <HeroLedgerStylesHost />

      <button
        type="button"
        aria-label="دليل الكنائس التفاعلي"
        className="absolute inset-0 z-0"
        onClick={goDirectory}
      />

      <img
        src={cardChurch}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        style={{
          opacity: 0.55,
          filter: "saturate(1.08) contrast(1.05)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(26,15,40,0.92) 0%, rgba(93,50,145,0.55) 42%, rgba(26,15,40,0.94) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-[0.18]"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 18% 50%, rgba(212,175,55,0.5) 0%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[25px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 28px rgba(93,50,145,0.2)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-3.5 py-3 pointer-events-none">
        <div className="flex items-start gap-3">
          <div
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border backdrop-blur-md"
            style={{
              borderColor: `${GOLD}55`,
              background: "rgba(93,50,145,0.35)",
              boxShadow: `0 0 20px ${PURPLE_SOFT}`,
            }}
          >
            <Church className="h-5 w-5 text-[#f5f2ed]" strokeWidth={2.1} />
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border border-white/30"
              style={{ background: PURPLE }}
            >
              <MapPin className="h-2.5 w-2.5 text-white" strokeWidth={2.4} />
            </span>
          </div>

          <div className="min-w-0 flex-1 text-right">
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <div
                className="inline-flex rounded-full border px-2 py-0.5 backdrop-blur-md"
                style={{ borderColor: `${GOLD}66`, background: "rgba(0,0,0,0.35)" }}
              >
                <HeroBadgeEmblem label="دليل الكنائس" compact />
              </div>
              <span className="text-[10px] font-bold text-white/50">·</span>
              <span className="text-[10px] font-extrabold" style={{ color: GOLD }}>
                Ⲁ Ⲱ
              </span>
            </div>
            <h3 className="mt-1 font-arabic-serif text-[16px] font-extrabold leading-tight text-white">
              دليل الكنائس التفاعلي
            </h3>
            <p className="mt-0.5 text-[10.5px] font-medium leading-snug text-white/75 line-clamp-1">
              خريطة ذكية · بحث بالقديس والمحافظة · {totalLabel} كنيسة
            </p>
          </div>

          <span
            className="pointer-events-auto shrink-0 self-center rounded-full border px-3 py-1.5 text-[10px] font-extrabold text-white backdrop-blur-md transition active:scale-95 group-hover:brightness-110"
            style={{
              borderColor: `${GOLD}55`,
              background: `linear-gradient(160deg, ${PURPLE}, #3d2066)`,
              boxShadow: `0 8px 20px -8px ${PURPLE_SOFT}`,
            }}
          >
            استكشف
          </span>
        </div>

        <div
          dir="rtl"
          className="pointer-events-auto relative z-20 mx-0.5 flex items-stretch gap-2 rounded-xl border px-2.5 py-1.5"
          style={{
            borderColor: `${GOLD}33`,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",
          }}
        >
          <HeroSpiritLedgerCell
            glyph="Ⲁ"
            label="كنائس"
            sublabel="معتمدة"
            value={totalLabel}
            accent={GOLD}
            variant="meditate"
            compact
            glyphPosition="edge"
            glyphEdge="start"
            leadingIcon={Church}
            leadingIconClassName="h-5 w-5 shrink-0"
            leadingIconColor="#c4a0e8"
            onClick={goDirectory}
          />
          <div
            aria-hidden
            className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#D4AF37]/35 to-transparent"
          />
          <HeroSpiritLedgerCell
            glyph="Ⲱ"
            label="خريطة"
            sublabel="تفاعلية"
            value="↗"
            accent={GOLD}
            variant="meditate"
            compact
            glyphPosition="edge"
            glyphEdge="end"
            leadingIcon={Navigation}
            leadingIconClassName="h-5 w-5 shrink-0"
            leadingIconColor="#8fd4ff"
            onClick={goDirectory}
          />
        </div>
      </div>
    </article>
  );
}
