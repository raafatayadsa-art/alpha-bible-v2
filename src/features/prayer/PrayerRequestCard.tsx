import {
  Heart, Clock, HandHeart, Flame, ShieldCheck, Check, MessageSquareHeart,
} from "lucide-react";
import type { PrayerCategory, PrayerRequest } from "@/data/prayer-requests";
import { PrayerStackAvatars, PrayerUserAvatar } from "./prayer-avatars";

const CATEGORY_ACCENTS: Record<
  PrayerCategory,
  { soft: string; border: string; badge: string; text: string; icon: string }
> = {
  "شفاء": { soft: "rgba(155,135,196,0.14)", border: "rgba(138,110,193,0.28)", badge: "#8a6ec1", text: "#6a4ab5", icon: "#9b87c4" },
  "دراسة": { soft: "rgba(107,159,212,0.13)", border: "rgba(90,140,200,0.26)", badge: "#6b9fd4", text: "#4a7fb8", icon: "#7eb0d8" },
  "معيشة": { soft: "rgba(199,147,86,0.14)", border: "rgba(184,137,58,0.28)", badge: "#c79356", text: "#8a6325", icon: "#b8893a" },
  "زواج": { soft: "rgba(212,168,210,0.12)", border: "rgba(180,140,190,0.24)", badge: "#b491c4", text: "#7a5a90", icon: "#c4a0d4" },
  "راحة نفس": { soft: "rgba(244,234,216,0.55)", border: "rgba(210,195,170,0.32)", badge: "#a99070", text: "#6a543a", icon: "#b8893a" },
  "شكر": { soft: "rgba(106,175,138,0.13)", border: "rgba(31,138,90,0.22)", badge: "#6aaf8a", text: "#1f8a5a", icon: "#5cb88a" },
  "طلبة": { soft: "rgba(107,159,212,0.10)", border: "rgba(138,182,220,0.22)", badge: "#7eb0d8", text: "#4a7fb8", icon: "#6b9fd4" },
};

function categoryAccent(cat: PrayerCategory) {
  return CATEGORY_ACCENTS[cat] ?? CATEGORY_ACCENTS["طلبة"];
}

export type PrayerRequestCardProps = {
  req: PrayerRequest;
  hasPrayed?: boolean;
  onPray?: () => void;
  onEncourage?: () => void;
  compact?: boolean;
  className?: string;
};

/** Original prayer request card — shared between community screen and profile. */
export function PrayerRequestCard({
  req,
  hasPrayed = false,
  onPray,
  onEncourage,
  compact = false,
  className = "",
}: PrayerRequestCardProps) {
  const accent = categoryAccent(req.category);
  const liveCount = req.prayers;

  return (
    <article
      className={`rounded-[22px] p-3.5 backdrop-blur-xl ${compact ? "w-full" : "snap-start shrink-0 w-[78%] max-w-[300px]"} ${className}`}
      style={{
        background: `linear-gradient(160deg, ${accent.soft}, rgba(255,255,255,0.82))`,
        border: `1px solid ${accent.border}`,
        boxShadow:
          "0 16px 40px -22px rgba(90,70,40,0.28),inset 0 1px 0 rgba(255,255,255,0.88)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold border"
          style={{
            background: `${accent.badge}18`,
            color: accent.text,
            borderColor: `${accent.badge}33`,
          }}
        >
          <HandHeart className="h-2.5 w-2.5" strokeWidth={2.8} style={{ color: accent.icon }} />
          {req.category}
        </span>
        {req.status === "urgent" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#c4566e]/12 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#a8344f] border border-[#c4566e]/28">
            <Flame className="h-2.5 w-2.5" strokeWidth={2.8} />
            عاجلة
          </span>
        ) : req.status === "answered" ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold border"
            style={{
              background: "rgba(106,175,138,0.15)",
              color: "#1f8a5a",
              borderColor: "rgba(106,175,138,0.28)",
            }}
          >
            <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.8} />
            تمت الإجابة
          </span>
        ) : null}
        <span className="ms-auto inline-flex items-center gap-1 text-[9.5px] font-bold text-[#6a543a]">
          <Clock className="h-2.5 w-2.5 text-[#b8893a]" />
          {req.time}
        </span>
      </div>

      <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
        {req.title}
      </p>
      <p className="mt-1 text-[11.5px] text-[#5a4a38] leading-snug line-clamp-2 min-h-[2.6em]">
        {req.request}
      </p>

      <div className="mt-2 flex items-center gap-2 min-w-0">
        <PrayerUserAvatar
          name={req.anonymous ? "?" : req.name}
          avatarUrl={req.anonymous ? undefined : req.avatarUrl}
          size="sm"
          anonymous={req.anonymous}
        />
        <span className="min-w-0 text-[10.5px] font-bold text-[#5a4a38] truncate">
          {req.anonymous ? "طلب صلاة مجهول" : req.name}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white/55 border border-white/70 px-2 py-1.5">
        <span className="text-[9.5px] font-extrabold text-[#7a6a58]">صلوا لأجله</span>
        <span className="inline-flex items-center gap-1.5">
          <PrayerStackAvatars participants={req.prayerParticipants} total={liveCount} size="xs" />
          {(req.prayerParticipants ?? []).some((p) => p.avatarUrl) ? null : (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#5a4a38]">
              <Heart className="h-2.5 w-2.5 fill-current text-[#b8893a]/70" strokeWidth={0} />
              {liveCount.toLocaleString("ar-EG")}
            </span>
          )}
        </span>
      </div>

      {(onPray || onEncourage) && (
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          {onPray ? (
            <button
              type="button"
              onClick={onPray}
              aria-pressed={hasPrayed}
              className={
                "inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-extrabold transition-all active:scale-[0.98] border " +
                (hasPrayed
                  ? "bg-gradient-to-l from-[#1f8a5a] to-[#2ea870] text-white border-transparent shadow-[0_8px_18px_-12px_rgba(31,138,90,0.7)]"
                  : "bg-gradient-to-l from-[#b8893a] to-[#c79356] text-white border-transparent shadow-[0_8px_18px_-12px_rgba(184,137,58,0.55)]")
              }
            >
              {hasPrayed ? <Check className="h-3 w-3" strokeWidth={3} /> : <HandHeart className="h-3 w-3" strokeWidth={2.6} />}
              {hasPrayed ? "تمت" : "صليت"}
            </button>
          ) : null}
          {onEncourage ? (
            <button
              type="button"
              onClick={onEncourage}
              className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-extrabold border bg-white/85 text-[#5a4a38] border-[#efe2c4] active:scale-[0.98] transition-all"
            >
              <MessageSquareHeart className="h-3 w-3 text-[#8a6ec1]" strokeWidth={2.6} />
              تشجيع
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
