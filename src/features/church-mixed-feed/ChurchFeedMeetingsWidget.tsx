import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ChevronLeft, Clock, MapPin, Users } from "lucide-react";
import type { ChurchPost } from "@/data/church-posts";
import { POST_TYPE_META } from "@/data/church-posts";
import type { ChurchFeedNavContext } from "./nav-context";

type Props = {
  meetings: ChurchPost[];
  navContext: ChurchFeedNavContext;
};

function hubLink(navContext: ChurchFeedNavContext, type: "meeting" | "liturgy") {
  if (navContext.scope === "public") {
    return {
      to: "/church/directory/$placeId/posts/$type" as const,
      params: { placeId: navContext.placeId, type },
    };
  }
  return { to: "/church/posts/$type" as const, params: { type } };
}

export function ChurchFeedMeetingsWidget({ meetings, navContext }: Props) {
  if (!meetings.length) return null;
  const meetingLink = hubLink(navContext, "meeting");

  return (
    <section
      id="church-meetings"
      className="mx-auto w-full max-w-[var(--alpha-content-narrow-width)] overflow-hidden rounded-[28px] border border-[#5b8fd1]/20 bg-[linear-gradient(155deg,#e8f1fc_0%,#ffffff_72%)] p-4 shadow-[0_14px_36px_-18px_rgba(91,143,209,0.22)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          {...meetingLink}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4a7fd4] active:scale-95"
        >
          عرض الكل
          <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
        </Link>
        <div className="text-right">
          <p className="text-[12px] font-extrabold text-[#3a4a6a]">الاجتماعات والقداسات</p>
          <p className="text-[10px] font-bold text-[#6a7a98]">{meetings.length} قادم</p>
        </div>
      </div>
      <div className="space-y-2">
        {meetings.slice(0, 3).map((m) => {
          const meta = POST_TYPE_META[m.type];
          const d = m.details;
          return (
            <Link
              key={m.id}
              to="/church/post/$id"
              params={{ id: m.id }}
              className="flex items-stretch gap-0 overflow-hidden rounded-2xl border border-white/80 bg-white/85 active:scale-[0.99] transition-transform"
            >
              <div
                className="flex w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/60"
                style={{ background: `linear-gradient(165deg, ${meta.tone}30, ${meta.tone}12)` }}
              >
                <Users className="h-4 w-4" style={{ color: meta.tone }} strokeWidth={2.2} />
                <span className="text-[8px] font-extrabold" style={{ color: meta.tone }}>
                  {meta.label}
                </span>
              </div>
              <div className="min-w-0 flex-1 p-2.5 text-right">
                <p className="line-clamp-1 text-[12.5px] font-extrabold text-[#3a2a18]">{m.title}</p>
                <div className="mt-1 space-y-0.5 text-[10px] text-[#6a543a]">
                  {d?.date ? (
                    <p className="flex items-center justify-end gap-1">
                      <span>{d.date}</span>
                      <CalendarDays className="h-3 w-3 shrink-0 text-[#b8893a]" />
                    </p>
                  ) : (
                    <p className="text-[#9a8468]">{m.date}</p>
                  )}
                  {d?.time ? (
                    <p className="flex items-center justify-end gap-1">
                      <span>{d.time}</span>
                      <Clock className="h-3 w-3 shrink-0 text-[#b8893a]" />
                    </p>
                  ) : null}
                  {d?.place ? (
                    <p className="flex items-center justify-end gap-1">
                      <span className="line-clamp-1">{d.place}</span>
                      <MapPin className="h-3 w-3 shrink-0 text-[#b8893a]" />
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex w-7 shrink-0 items-center justify-center">
                <ChevronLeft className="h-3.5 w-3.5 text-[#c79356]" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
