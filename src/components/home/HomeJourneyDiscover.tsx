import { memo, useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { CopticCross } from "@/components/coptic";
import { useAutoMarquee } from "@/hooks/useAutoMarquee";
import { HeroBadgeEmblem, HeroCompactLedgerCell, HeroLedgerStylesHost } from "./hero-card-chrome";

export type JourneyDiscoverItem = {
  key: string;
  title: string;
  sub: string;
  image: string;
  to: string;
  accent: string;
};

const JOURNEY_BADGE: Record<string, string> = {
  bible: "الكتاب",
  bible2: "قراءة",
  agpeya: "أجبية",
  kholagy: "خولاجي",
  katameros: "قطمارس",
  synaxarium: "سنكسار",
  church: "كنيسة",
  community: "مجتمعي",
  audio: "صوتيات",
  kids: "أطفال",
  meditation: "تأمل",
};

const JOURNEY_CARD_WIDTH = "min(84vw, 300px)";
const JOURNEY_CENTER_PAD = "calc(50% - min(42vw, 150px))";

const JourneyDiscoverCard = memo(function JourneyDiscoverCard({
  title,
  sub,
  image,
  accent,
  badge,
  to,
  itemKey,
}: JourneyDiscoverItem & { badge: string; itemKey: string }) {
  return (
    <Link
      to={to as never}
      aria-label={title}
      data-journey-key={itemKey}
      className="journey-discover-card group relative z-[1] block shrink-0 active:scale-[0.98] transition-transform"
      style={{ width: JOURNEY_CARD_WIDTH, "--journey-accent": accent } as CSSProperties}
    >
      <article className="journey-discover-article alpha-home-daily-card relative h-[176px] w-full overflow-hidden border">
        <img
          src={image}
          alt=""
          draggable={false}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover alpha-media-polish"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.04) 36%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.88) 100%)",
          }}
        />
        <div aria-hidden className="journey-discover-inset pointer-events-none absolute inset-[1px] rounded-[calc(var(--alpha-radius-card-compact)-1px)]" />
        <div
          aria-hidden
          className="journey-glow-ring pointer-events-none absolute inset-0 rounded-[var(--alpha-radius-card-compact)]"
        />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-end px-3 pt-2.5">
          <div
            className="alpha-tag inline-flex items-center backdrop-blur-md"
            style={{ borderColor: `${accent}55`, background: "rgba(0,0,0,0.38)" }}
          >
            <HeroBadgeEmblem label={badge} compact />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-3 pt-10">
          <h3
            className="text-[17px] font-extrabold text-right leading-tight text-white line-clamp-1"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
          >
            {title}
          </h3>
          <p className="mt-1 text-right text-[13px] font-medium leading-snug !text-white/78 line-clamp-2">
            {sub}
          </p>
          <div className="mt-2 flex justify-end">
            <HeroCompactLedgerCell
              label="ادخل"
              sublabel={badge}
              accent={accent}
              className="min-w-[104px] shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
            />
          </div>
        </div>
      </article>
    </Link>
  );
});

export function HomeJourneyDiscover({ items }: { items: JourneyDiscoverItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const centeredRef = useRef<HTMLElement | null>(null);

  const marqueeItems = useMemo(() => [...items, ...items], [items]);

  const updateCenter = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const viewportCenter = el.getBoundingClientRect().left + el.clientWidth / 2;
    const cards = el.querySelectorAll<HTMLElement>(".journey-discover-card");
    let closest: HTMLElement | null = null;
    let closestDist = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = card;
      }
    });

    if (closest === centeredRef.current) return;

    if (centeredRef.current) {
      centeredRef.current.classList.remove("is-centered");
    }
    if (closest) {
      closest.classList.add("is-centered");
      centeredRef.current = closest;
    } else {
      centeredRef.current = null;
    }
  }, []);

  useAutoMarquee(trackRef, {
    speed: 18,
    direction: 1,
    loop: true,
    resumeMs: 2200,
    onFrame: updateCenter,
  });

  useEffect(() => {
    updateCenter();
    const el = trackRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>(".journey-discover-card");
    if (cards[0] && !centeredRef.current) {
      cards[0].classList.add("is-centered");
      centeredRef.current = cards[0];
    }

    const ro = new ResizeObserver(updateCenter);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateCenter, items.length]);

  if (!items.length) return null;

  return (
    <section className="mt-5">
      <HeroLedgerStylesHost />
      <style>{`
        .journey-discover-card {
          transform: translate3d(0, 0, 0) scale(1);
          transform-origin: center bottom;
          transition: transform var(--alpha-motion-standard);
          will-change: transform;
          backface-visibility: hidden;
          contain: layout style;
        }
        .journey-discover-card.is-centered {
          z-index: 2;
          transform: translate3d(0, -10px, 0) scale(1.025);
        }
        .journey-discover-article {
          border-color: color-mix(in srgb, var(--journey-accent) 55%, transparent);
          background: var(--alpha-bg-cinematic);
          box-shadow: var(--alpha-shadow-normal);
        }
        .journey-discover-inset {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            inset 0 0 32px color-mix(in srgb, var(--journey-accent) 10%, transparent),
            inset 0 0 0 1px rgba(231, 201, 122, 0.08);
        }
        .journey-discover-card.is-centered .journey-discover-article {
          border-color: rgba(240, 215, 140, 0.62);
          box-shadow:
            0 26px 48px -14px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(240, 215, 140, 0.28),
            0 0 32px color-mix(in srgb, var(--journey-accent) 18%, transparent);
        }
        .journey-discover-card.is-centered .journey-discover-inset {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            inset 0 0 40px rgba(240, 215, 140, 0.16),
            inset 0 0 0 1px rgba(240, 215, 140, 0.14);
        }
        .journey-glow-ring {
          opacity: 0;
          border: 1.5px solid rgba(240, 215, 140, 0.4);
          box-shadow: 0 0 20px rgba(240, 215, 140, 0.2);
          transition: opacity 200ms ease;
        }
        .journey-discover-card.is-centered .journey-glow-ring {
          opacity: 1;
          animation: journey-ring-breathe 2.2s ease-in-out infinite;
        }
        @keyframes journey-ring-breathe {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.012);
          }
        }
      `}</style>

      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="alpha-type-caption font-extrabold tracking-wide text-alpha-heading-muted">
            بوابات ألفا الروحية
          </p>
          <h2 className="alpha-type-h2 mt-0.5 flex items-center gap-1.5 tracking-tight text-alpha-heading">
            <span className="text-alpha-gold-bright">
              <CopticCross size={16} />
            </span>
            اكتشف رحلتك اليوم
          </h2>
        </div>
        <span className="alpha-tag border-alpha bg-alpha-surface !text-alpha-gold-deep backdrop-blur-sm">
          {items.length} أبواب
        </span>
      </div>

      <div
        ref={trackRef}
        onScroll={updateCenter}
        className="-mx-4 overflow-x-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="flex gap-3 pb-3 pt-4"
          style={{ paddingInline: JOURNEY_CENTER_PAD }}
        >
          {marqueeItems.map((item, i) => (
            <JourneyDiscoverCard
              key={`${item.key}-${i}`}
              itemKey={item.key}
              {...item}
              badge={JOURNEY_BADGE[item.key] ?? "رحلة"}
            />
          ))}
        </div>
      </div>

      <p className="alpha-type-caption mt-2 text-center font-semibold text-alpha-heading-muted">
        اسحب للتوقف · الكارت في المنتصف يُرفع تلقائياً
      </p>
    </section>
  );
}
