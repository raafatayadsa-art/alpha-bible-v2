import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Phone, Users } from "lucide-react";
import { AlphaConnectLogo } from "./AlphaConnectLogo";
import { useAlphaConnectHomeActivity } from "@/features/alpha-connect/useAlphaConnectHomeActivity";
import {
  buildAlphaConnectSearch,
  emptyAlphaConnectSearch,
} from "@/features/alpha-connect/alpha-connect-nav";
import {
  HeroBadgeEmblem,
  HeroLedgerStylesHost,
  HeroSpiritLedgerCell,
} from "@/components/home/hero-card-chrome";
import controlCenterBg from "@/assets/control-center-bg.png";

const CONNECT_ACCENT = "#e7c97a";
/** Messages — matches Connect neon-blue */
const CONNECT_MSG_ICON = "#8fd4ff";
/** Calls / channels — Connect accent green; red when missed */
const CONNECT_CALL_ICON = "#6ecf9a";
const CONNECT_MISSED_ICON = "#ff6b6b";
const CONNECT_CHANNEL_ICON = "#9fd4ff";

export function AlphaConnectHomeCard() {
  const activity = useAlphaConnectHomeActivity();
  const navigate = useNavigate();

  const rightLabel = activity.missedCalls > 0 ? "مكالمات" : "قنوات";
  const rightSublabel = activity.missedCalls > 0 ? "فائتة" : "نشطة";
  const rightValue =
    activity.missedCalls > 0 ? activity.missedCalls : activity.activeChannels;

  const goHub = () =>
    navigate({ to: "/alpha-connect", search: emptyAlphaConnectSearch() });
  const goMessages = () =>
    navigate({
      to: "/alpha-connect",
      search: buildAlphaConnectSearch({ tab: "messages" }),
    });
  const goRight = () =>
    navigate({
      to: "/alpha-connect",
      search: buildAlphaConnectSearch({
        tab: activity.missedCalls > 0 ? "calls" : "channels",
      }),
    });

  return (
    <article
      className="group relative h-[128px] w-full overflow-hidden rounded-[22px] border"
      style={{
        borderColor: "rgba(231,201,122,0.32)",
        background: "#030208",
        boxShadow:
          "0 16px 36px -14px rgba(0,0,0,0.72), 0 0 0 1px rgba(231,201,122,0.1), 0 0 24px rgba(110,181,240,0.08)",
      }}
    >
      <HeroLedgerStylesHost />

      <button
        type="button"
        aria-label="ألفا كونكت — الصفحة الرئيسية"
        className="absolute inset-0 z-0"
        onClick={goHub}
      />

      <img
        src={controlCenterBg}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        style={{
          opacity: 0.92,
          filter: "brightness(1.42) contrast(1.06) saturate(0.9)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.52) 38%, rgba(0,0,0,0.88) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-[0.14]"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 72% 42%, rgba(231,201,122,0.55) 0%, transparent 68%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[21px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 24px rgba(110,181,240,0.08)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-3 py-2.5 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/15 bg-black/25">
            <AlphaConnectLogo
              size="sm"
              animated={activity.hasAnyActivity}
              className="scale-[0.68]"
            />
            {activity.hasAnyActivity ? (
              <span
                aria-hidden
                className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#00ff50] ring-2 ring-[#07040f]"
                style={{ boxShadow: "0 0 8px rgba(0,255,80,0.5)" }}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 text-right">
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <div
                className="inline-flex rounded-full border px-2 py-0.5 backdrop-blur-md"
                style={{ borderColor: `${CONNECT_ACCENT}70`, background: "rgba(0,0,0,0.35)" }}
              >
                <HeroBadgeEmblem label="ألفا كونكت" compact />
              </div>
              <span className="text-[10px] font-bold text-white/55">·</span>
              <span className="text-[11px] font-extrabold text-white/92">Alpha Connect</span>
            </div>
            <p className="mt-0.5 text-right text-[10.5px] font-medium leading-snug text-white/72 line-clamp-1">
              {activity.loading ? "جاري تحميل النشاط…" : activity.activityLine}
            </p>
          </div>
        </div>

        <div
          dir="rtl"
          className="pointer-events-auto relative z-20 mx-1 flex items-stretch gap-2 rounded-xl border px-2.5 py-1.5"
          style={{
            borderColor: `${CONNECT_ACCENT}33`,
            background: "rgba(0,0,0,0.42)",
            backdropFilter: "blur(8px)",
          }}
        >
          <HeroSpiritLedgerCell
            glyph="Ⲁ"
            label="رسائل"
            sublabel="جديد"
            value={activity.unreadMessages}
            accent={CONNECT_ACCENT}
            variant="meditate"
            compact
            glyphPosition="edge"
            glyphEdge="start"
            notifyPulse={activity.unreadMessages > 0}
            notifyPulseTone="blue"
            leadingIcon={MessageCircle}
            leadingIconClassName="h-5 w-5 shrink-0"
            leadingIconColor={CONNECT_MSG_ICON}
            onClick={goMessages}
          />
          <div
            aria-hidden
            className="my-1.5 w-px shrink-0 bg-gradient-to-b from-transparent via-[#e7c97a]/35 to-transparent"
          />
          <HeroSpiritLedgerCell
            glyph="Ⲱ"
            label={rightLabel}
            sublabel={rightSublabel}
            value={rightValue}
            accent={CONNECT_ACCENT}
            variant="meditate"
            compact
            glyphPosition="edge"
            glyphEdge="end"
            notifyPulse={activity.missedCalls > 0}
            notifyPulseTone="red"
            leadingIcon={activity.missedCalls > 0 ? Phone : Users}
            leadingIconClassName="h-5 w-5 shrink-0"
            leadingIconColor={
              activity.missedCalls > 0
                ? CONNECT_MISSED_ICON
                : activity.activeChannels > 0
                  ? CONNECT_CHANNEL_ICON
                  : CONNECT_CALL_ICON
            }
            onClick={goRight}
          />
        </div>
      </div>
    </article>
  );
}
