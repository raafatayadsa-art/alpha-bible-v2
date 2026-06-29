import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CopticCross } from "@/components/coptic";
import { KatamerosDateStrip } from "@/features/katameros/components/KatamerosDateStrip";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import {
  HeroCardTopBar,
  HeroSpiritLedgerRow,
  readHeroMap,
  readHeroSet,
  seedHeroCount,
  writeHeroMap,
  writeHeroSet,
} from "./hero-card-chrome";
import type { VerseSharePayload } from "./PremiumVerseHeroCard";
import { LOGIN_REQUIRED_AR, useCanUsePersonalFeatures } from "@/features/auth";

const SAVED_KEY = "alpha.hero.saved-cards";

import { navigateHeroCard, type HeroCardRoute } from "./hero-stack-data";

export type HeroDailyCardData = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  link: HeroCardRoute;
  dateCoptic?: string;
  dateGregorian?: string;
};

type HeroDailyCardProps = {
  card: HeroDailyCardData;
  variant: "front" | "peek-left" | "peek-right" | "peek-back";
  onBrandedShare?: (payload: VerseSharePayload) => void;
};

function engagementDayId(cardId: string) {
  return `${new Date().toISOString().slice(0, 10)}::${cardId}`;
}

export function HeroDailyCard({ card, variant, onBrandedShare }: HeroDailyCardProps) {
  const navigate = useNavigate();
  const personalOn = useCanUsePersonalFeatures();
  const isFront = variant === "front";
  const isPeek = !isFront;
  const h = isFront ? 268 : 228;
  const eid = useMemo(() => engagementDayId(card.id), [card.id]);

  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [meditations, setMeditations] = useState(0);
  const [broadcasts, setBroadcasts] = useState(0);
  const [meditated, setMeditated] = useState(false);

  const likeKey = `alpha.hero.${card.id}.likes`;
  const shareKey = `alpha.hero.${card.id}.shares`;
  const likedKey = `alpha.hero.${card.id}.liked`;

  useEffect(() => {
    setSaved(readHeroSet(SAVED_KEY).has(card.id));
    const likeMap = readHeroMap(likeKey);
    const shareMap = readHeroMap(shareKey);
    const likedSet = readHeroSet(likedKey);
    setMeditations((likeMap[eid] ?? 0) + seedHeroCount(card.id, 7));
    setBroadcasts((shareMap[eid] ?? 0) + seedHeroCount(card.id, 13));
    setMeditated(likedSet.has(eid));
  }, [card.id, eid, likeKey, shareKey, likedKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const sharePayload: VerseSharePayload = useMemo(
    () => ({
      title: card.title,
      body: card.subtitle,
      meta: card.badge,
      imageSrc: card.image,
      accent: card.accent,
    }),
    [card],
  );

  const onToggleSaved = useCallback(() => {
    if (!personalOn) {
      setToast(LOGIN_REQUIRED_AR);
      return;
    }
    const set = readHeroSet(SAVED_KEY);
    if (set.has(card.id)) {
      set.delete(card.id);
      setSaved(false);
      setToast("تمت إزالة الحفظ");
    } else {
      set.add(card.id);
      setSaved(true);
      setToast("تم الحفظ");
    }
    writeHeroSet(SAVED_KEY, set);
  }, [card.id, personalOn]);

  const onToggleMeditation = useCallback(() => {
    if (!personalOn) {
      setToast(LOGIN_REQUIRED_AR);
      return;
    }
    const likeMap = readHeroMap(likeKey);
    const likedSet = readHeroSet(likedKey);
    const base = seedHeroCount(card.id, 7);
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
    writeHeroMap(likeKey, likeMap);
    writeHeroSet(likedKey, likedSet);
  }, [meditated, eid, card.id, likeKey, likedKey, personalOn]);

  const onShare = useCallback(() => {
    const shareMap = readHeroMap(shareKey);
    const base = seedHeroCount(card.id, 13);
    shareMap[eid] = (shareMap[eid] ?? 0) + 1;
    writeHeroMap(shareKey, shareMap);
    setBroadcasts(base + shareMap[eid]);

    if (onBrandedShare) {
      onBrandedShare(sharePayload);
      return;
    }
    openAlphaShareSheet(sharePayload);
  }, [card, eid, onBrandedShare, sharePayload, shareKey]);

  const onOpen = useCallback(() => {
    if (isFront) navigateHeroCard(navigate, card.link);
  }, [isFront, navigate, card.link]);

  const peekStyle =
    variant === "peek-left"
      ? { transform: "rotate(-3deg)", transformOrigin: "30% 80%" as const }
      : variant === "peek-right"
        ? { transform: "rotate(3deg)", transformOrigin: "70% 80%" as const }
        : variant === "peek-back"
          ? { transform: "scale(0.9)", transformOrigin: "50% 90%" as const }
          : undefined;

  return (
    <div className="relative" style={peekStyle}>
      <article
        role={isFront ? "button" : undefined}
        tabIndex={isFront ? 0 : undefined}
        onClick={(e) => {
          if (isPeek) return;
          if ((e.target as HTMLElement).closest("button, [data-hero-ledger='broadcast']")) return;
          onOpen();
        }}
        onKeyDown={(e) => {
          if (isPeek) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-label={card.title}
        className={`alpha-home-daily-card relative w-full overflow-hidden border ${isFront ? "cursor-pointer alpha-home-hero-card !rounded-[var(--alpha-radius-card)]" : ""}`}
        style={{
          height: h,
          borderRadius: isFront ? "var(--alpha-radius-card)" : "var(--alpha-radius-card-compact)",
          borderColor: `${card.accent}66`,
          background: "var(--alpha-bg-cinematic)",
          boxShadow: isFront
            ? `var(--alpha-shadow-hero), 0 0 36px ${card.accent}18`
            : "0 16px 36px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <img
          src={card.image}
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
              "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.04) 34%, rgba(0,0,0,0.12) 58%, rgba(0,0,0,0.82) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[calc(var(--alpha-radius-card)-1px)]"
          style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 28px ${card.accent}12` }}
        />

        <HeroCardTopBar
          badge={card.badge}
          accent={card.accent}
          saved={saved}
          compact={isPeek}
          saveLabel={saved ? "إزالة الحفظ" : `حفظ ${card.badge}`}
          shareLabel={`مشاركة ${card.badge}`}
          onShare={() => void onShare()}
          onToggleSave={onToggleSaved}
        />

        {(card.dateCoptic || card.dateGregorian) && isFront ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-3">
            <KatamerosDateStrip
              copticDate={card.dateCoptic ?? ""}
              gregorianDate={card.dateGregorian ?? ""}
              variant="image-hero"
              align="center"
            />
          </div>
        ) : null}

        <div className={`absolute inset-x-0 bottom-0 z-10 px-4 ${isPeek ? "pb-3 pt-10" : "pb-3 pt-12"}`}>
          <p
            className={`alpha-type-h2 text-right font-extrabold leading-tight text-white ${
              isPeek ? "line-clamp-2" : "line-clamp-2"
            }`}
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
          >
            {card.title}
          </p>

          {!isPeek ? (
            <>
              <p className="alpha-type-body mt-1 text-right font-medium leading-snug !text-white/82 line-clamp-2">
                {card.subtitle}
              </p>
              <div className="mt-1.5 flex items-center justify-end gap-2">
                <span
                  aria-hidden
                  className="h-px flex-1 max-w-[40px]"
                  style={{ background: `linear-gradient(to left, ${card.accent}99, transparent)` }}
                />
                <p className="alpha-type-caption font-bold tracking-wide" style={{ color: card.accent }}>
                  {card.badge}
                </p>
                <span style={{ color: card.accent }}>
                  <CopticCross size={8} className="opacity-80" />
                </span>
              </div>
              <HeroSpiritLedgerRow
                accent={card.accent}
                meditations={meditations}
                broadcasts={broadcasts}
                meditated={meditated}
                onMeditate={onToggleMeditation}
                onBroadcast={() => void onShare()}
              />
            </>
          ) : (
            <p className="alpha-type-caption mt-1 text-right font-bold line-clamp-1" style={{ color: card.accent }}>
              {card.subtitle}
            </p>
          )}
        </div>
      </article>

      {toast ? (
        <p className="absolute -bottom-7 inset-x-0 text-center alpha-type-desc font-bold text-alpha-gold-deep animate-in fade-in">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
