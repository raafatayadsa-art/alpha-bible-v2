import type { CSSProperties } from "react";
import { Bus, MapPin } from "lucide-react";
import { CopticCross } from "@/components/coptic";
import { HeroBadgeEmblem, HeroCompactLedgerCell, HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import cardChurch from "@/assets/home/card-church.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import { listPilgrimagePassport } from "@/features/church/trip-reservations/pilgrimage-passport";
import { formatProfileDate } from "./profile-privacy";
import type { PilgrimagePassportEntry } from "@/features/church/trip-reservations/trip-features-roadmap";

const TRIP_CARD_WIDTH = "min(78vw, 272px)";

const DEMO_TRIPS: PilgrimagePassportEntry[] = [
  {
    id: "demo-trip-1",
    userId: "demo",
    kind: "trip",
    title: "رحلة دير القديس بولا — مطرانية المنيا",
    completedAt: "2025-10-18",
  },
  {
    id: "demo-trip-2",
    userId: "demo",
    kind: "monastery",
    title: "زيارة دير الأنبا أنطونيوس",
    completedAt: "2025-08-04",
  },
  {
    id: "demo-trip-3",
    userId: "demo",
    kind: "conference",
    title: "مؤتمر الشباب — كنيسة مارجرجس",
    completedAt: "2025-05-22",
  },
];

function tripVisuals(kind: PilgrimagePassportEntry["kind"]) {
  if (kind === "monastery" || kind === "retreat") {
    return { accent: "#1f8a5a", badge: kind === "retreat" ? "خلوة" : "دير", image: cardMeditation };
  }
  if (kind === "conference" || kind === "event") {
    return { accent: "#6a4ab5", badge: kind === "conference" ? "مؤتمر" : "فعالية", image: newsYouth };
  }
  return { accent: "#d4af37", badge: "رحلة", image: cardChurch };
}

function formatTripDate(iso: string) {
  return formatProfileDate(iso) ?? iso;
}

function ProfileTripDiscoverCard({ trip }: { trip: PilgrimagePassportEntry }) {
  const { accent, badge, image } = tripVisuals(trip.kind);
  const dateLabel = formatTripDate(trip.completedAt);

  return (
    <article
      className="relative shrink-0 overflow-hidden rounded-[22px] border"
      style={
        {
          width: TRIP_CARD_WIDTH,
          height: 176,
          "--trip-accent": accent,
          borderColor: `${accent}55`,
          background: "#07040f",
          boxShadow:
            "0 22px 44px -16px rgba(0,0,0,0.72), 0 0 0 1px rgba(231,201,122,0.12), 0 0 28px color-mix(in srgb, var(--trip-accent) 12%, transparent)",
        } as CSSProperties
      }
    >
      <img
        src={image}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.04) 36%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.88) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[21px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 32px color-mix(in srgb, var(--trip-accent) 10%, transparent), inset 0 0 0 1px rgba(231,201,122,0.08)",
        }}
      />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-end px-3 pt-2.5">
        <div
          className="inline-flex items-center rounded-full border px-2.5 py-1 backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.22)]"
          style={{ borderColor: `${accent}55`, background: "rgba(0,0,0,0.38)" }}
        >
          <HeroBadgeEmblem label={badge} compact />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-3 pt-10">
        <h3
          className="text-right text-[15px] font-extrabold leading-tight text-white line-clamp-2"
          style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
        >
          {trip.title}
        </h3>
        <p className="mt-1 text-right text-[10.5px] font-medium text-white/72 inline-flex items-center gap-1 justify-end w-full">
          <MapPin className="h-3 w-3 text-[#f0d78c]/80" />
          {dateLabel}
        </p>
        <div className="mt-2 flex justify-end">
          <HeroCompactLedgerCell
            label="سجّل"
            sublabel={badge}
            accent={accent}
            className="min-w-[104px] shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
          />
        </div>
      </div>
    </article>
  );
}

export function ProfileTripTimelineSection({ dark = false }: { dark?: boolean }) {
  const saved = listPilgrimagePassport();
  const trips = (saved.length ? saved : DEMO_TRIPS).slice(0, 8);
  const titleClass = dark ? "text-white/85" : "text-[#3a2a18]";
  const badgeClass = dark
    ? "border border-white/12 bg-white/8 text-white/55"
    : "border border-[#ead9b1] bg-white/60 text-[#7a5a30]";
  const hintClass = dark ? "text-white/35" : "text-[#9a7e5a]";

  return (
    <section className="mt-4">
      <HeroLedgerStylesHost />

      <div className="mb-2.5 flex items-end justify-between gap-2 px-0.5">
        <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold backdrop-blur-sm ${badgeClass}`}>
          {saved.length ? `${saved.length} رحلة` : "معاينة"}
        </span>
        <h2 className={`flex items-center gap-1.5 text-[13px] font-extrabold ${titleClass}`}>
          <span className="text-[#c79356]">
            <CopticCross size={12} />
          </span>
          <Bus className="h-4 w-4 text-[#b8893a]" />
          تايملاين الرحلات
        </h2>
      </div>

      <div
        className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex w-max gap-3">
          {trips.map((trip) => (
            <ProfileTripDiscoverCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>

      <p className={`mt-2 text-center text-[9px] font-semibold ${hintClass}`}>اسحب لعرض المزيد من الرحلات</p>
    </section>
  );
}
