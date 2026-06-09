import {
  Bus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  Gift,
  HandHeart,
  MapPin,
  Newspaper,
  PartyPopper,
  Ticket,
  Users,
} from "lucide-react";
import type { LabComment, LabDemoPost, LabMember } from "./mock-posts";

const CARD_HEIGHT = "min-h-[210px]";

function initial(name: string) {
  return [...name.trim()][0] ?? "α";
}

export function LabMemberAvatar({ member, size = 28 }: { member: LabMember; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.38),
        background: `linear-gradient(135deg, ${member.hue}dd, ${member.hue})`,
      }}
      aria-hidden
    >
      {initial(member.name)}
    </span>
  );
}

export function LabMemberStack({
  members,
  extra,
  tone,
}: {
  members: LabMember[];
  extra: number;
  tone: string;
}) {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 space-x-reverse">
        {members.slice(0, 3).map((m) => (
          <LabMemberAvatar key={m.name} member={m} size={26} />
        ))}
      </div>
      {extra > 0 ? (
        <span className="mr-1.5 text-[10px] font-bold" style={{ color: tone }}>
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function TypeBadge({ post }: { post: LabDemoPost }) {
  const icons = {
    news: Newspaper,
    meeting: Users,
    trip: Bus,
    prayer: HandHeart,
    congrats: Gift,
    condolence: Flame,
  } as const;
  const Icon = icons[post.kind];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{ backgroundColor: post.softTone, color: post.tone }}
    >
      <Icon className="h-3 w-3" strokeWidth={2.4} />
      {post.label}
    </span>
  );
}

function LabCommentPreview({ comment }: { comment: LabComment }) {
  return (
    <div className="rounded-xl border border-[#ede0c8]/80 bg-[#faf5eb]/90 px-2 py-1.5 text-right">
      <p className="text-[10px] leading-snug text-[#5a4630] line-clamp-2">
        <span className="font-bold text-[#4a3a28]">{comment.author}: </span>
        {comment.text}
      </p>
    </div>
  );
}

function SeatStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-[#f4f7f4] px-1 py-1 text-center">
      <p className="text-[12px] font-extrabold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="mt-0.5 text-[8.5px] font-semibold text-[#8a7355]">{label}</p>
    </div>
  );
}

function MetaRows({ post }: { post: LabDemoPost }) {
  if (post.kind === "meeting" && post.meeting) {
    const m = post.meeting;
    return (
      <ul className="mt-1.5 space-y-0.5 text-[10px] text-[#5a4630]">
        <li className="flex items-center justify-end gap-1">
          <span>{m.date}</span>
          <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
          <span className="opacity-40">·</span>
          <span>{m.time}</span>
          <Clock className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </li>
        <li className="flex items-center justify-end gap-1">
          <span className="line-clamp-1">{m.location}</span>
          <MapPin className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </li>
        <li className="pt-0.5 text-[10px] font-bold" style={{ color: post.tone }}>
          {m.attendees} سيحضرون
        </li>
      </ul>
    );
  }

  if (post.kind === "trip" && post.trip) {
    const t = post.trip;
    return (
      <div className="mt-1.5">
        <p className="flex items-center justify-end gap-1 text-[10px] text-[#5a4630]">
          <span>{t.date}</span>
          <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
          <span className="opacity-40">·</span>
          <span>{t.price}</span>
          <Ticket className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          <SeatStat label="إجمالي" value={t.total} color="#8a7355" />
          <SeatStat label="متاح" value={t.available} color={post.tone} />
          <SeatStat label="حجز" value={t.booked} color="#3d2e1c" />
        </div>
      </div>
    );
  }

  if (post.kind === "prayer" && post.prayer) {
    const p = post.prayer;
    return (
      <div className="mt-1.5 space-y-1">
        <div className="space-y-1">
          {p.comments.slice(0, 2).map((c) => (
            <LabCommentPreview key={c.id} comment={c} />
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 text-[10px]">
          <span>
            <b style={{ color: post.tone }}>{p.prayedCount}</b>{" "}
            <span className="text-[#8a7355]">صلوا من أجله</span>
          </span>
          <span>
            <b className="text-[#4a3a28]">{p.commentsCount}</b>{" "}
            <span className="text-[#8a7355]">تعليق</span>
          </span>
        </div>
      </div>
    );
  }

  if (post.kind === "congrats" && post.congrats) {
    return (
      <p className="mt-1.5 text-right text-[10px]">
        <b style={{ color: post.tone }}>{post.congrats.congratulationsCount}</b>{" "}
        <span className="text-[#8a7355]">تهنئة</span>
      </p>
    );
  }

  if (post.kind === "condolence" && post.condolence) {
    const c = post.condolence;
    return (
      <div className="mt-1.5 space-y-0.5 text-[10px] text-[#5a4630]">
        <p className="flex items-center justify-end gap-1">
          <span>{c.date}</span>
          <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <p className="flex items-center justify-end gap-1">
          <span className="line-clamp-1">{c.place}</span>
          <MapPin className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        </p>
        <p className="pt-0.5 font-bold" style={{ color: post.tone }}>
          {c.condolencesCount} تعزية
        </p>
      </div>
    );
  }

  if (post.kind === "news" && post.news) {
    return (
      <p className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-[#5a4630]">
        <span>{post.news.date}</span>
        <CalendarDays className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
        <span className="opacity-40">·</span>
        <span>{post.news.place}</span>
        <MapPin className="h-3 w-3 shrink-0" style={{ color: post.tone }} strokeWidth={2.4} />
      </p>
    );
  }

  return null;
}

function CtaIcon({ kind }: { kind: LabDemoPost["kind"] }) {
  switch (kind) {
    case "meeting":
      return <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} />;
    case "trip":
      return <Ticket className="h-4 w-4" strokeWidth={2.4} />;
    case "congrats":
      return <PartyPopper className="h-4 w-4" strokeWidth={2.4} />;
    case "prayer":
    case "condolence":
      return <HandHeart className="h-4 w-4" strokeWidth={2.4} />;
    default:
      return null;
  }
}

function cardBg(post: LabDemoPost) {
  if (post.kind === "prayer") {
    return "bg-[linear-gradient(155deg,#f7f3fc_0%,#ffffff_62%)]";
  }
  if (post.kind === "congrats") {
    return "bg-[linear-gradient(155deg,#fdf8ee_0%,#ffffff_62%)]";
  }
  if (post.kind === "condolence") {
    return "bg-[linear-gradient(155deg,#f5f2ee_0%,#ffffff_62%)]";
  }
  return "bg-white";
}

export function LabFeedCard({ post }: { post: LabDemoPost }) {
  const titleColor = post.kind === "news" ? post.tone : "#3d2e1c";

  return (
    <div className="px-0.5">
      <article
        className={
          "relative overflow-hidden rounded-[28px] border border-[#ede0c8]/90 " +
          cardBg(post) +
          " shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_36px_-18px_rgba(80,50,20,0.28),0_28px_50px_-32px_rgba(80,50,20,0.18)]"
        }
      >
        <div className={"flex " + CARD_HEIGHT} dir="rtl">
          <div className="relative w-[40%] shrink-0">
            <img
              src={post.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex w-[60%] min-w-0 flex-col p-3 pb-4">
            <div className="mb-1 flex items-start justify-end">
              <TypeBadge post={post} />
            </div>

            <h2
              className="text-right text-[14px] font-extrabold leading-snug line-clamp-2"
              style={{ color: titleColor }}
            >
              {post.title}
            </h2>

            <p className="mt-0.5 line-clamp-2 text-right text-[10.5px] leading-relaxed text-[#6a543a]">
              {post.excerpt}
            </p>

            <MetaRows post={post} />

            <div className="mt-auto flex items-end justify-between gap-2 pt-2">
              <LabMemberStack
                members={post.participants}
                extra={post.extraParticipants}
                tone={post.tone}
              />
              <span className="shrink-0 text-[9px] text-[#9a8468]">{post.timeAgo}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-13px] left-3 z-10">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35),0_4px_12px_-4px_rgba(0,0,0,0.2)] transition active:scale-[0.97]"
            style={{ backgroundColor: post.tone }}
          >
            {post.action}
            <CtaIcon kind={post.kind} />
          </button>
        </div>
      </article>
      <div className="h-5" aria-hidden />
    </div>
  );
}
