import {
  Bell,
  Users,
  Bus,
  HandHeart,
  Gift,
  Flame,
  Calendar,
  Clock,
  MapPin,
  Info,
  CheckCircle2,
  Ticket,
  PartyPopper,
} from "lucide-react";
import { FeedCard } from "./FeedCard";
import { ActionButton } from "./ActionButton";
import { CommentList } from "./CommentBox";
import { MemberStack } from "./Avatar";
import type {
  UrgentPost,
  MeetingPost,
  TripPost,
  PrayerPost,
  CelebrationPost,
  CondolencePost,
} from "./types";

/* ─────────────────────────── URGENT ─────────────────────────── */
export function UrgentCard({ post }: { post: UrgentPost }) {
  return (
    <FeedCard
      variant="urgent"
      pillIcon={<Bell className="w-3 h-3" />}
      pillLabel="عاجل"
      imageUrl={post.imageUrl}
      imageAlt={post.title}
      action={
        <ActionButton variant="urgent" icon={<Info className="w-4 h-4" />}>
          عرض التفاصيل
        </ActionButton>
      }
    >
      <h3 className="font-display font-extrabold text-[16px] leading-tight text-urgent text-right">
        {post.title}
      </h3>
      <p className="font-display text-[12px] leading-relaxed text-foreground/75 mt-1 text-right line-clamp-2">
        {post.description}
      </p>
      <p className="font-display text-[11px] text-muted-foreground mt-1.5 text-right">
        {post.date} — الساعة {post.time}
      </p>
      <div className="flex items-center justify-between mt-3">
        <MemberStack
          members={post.participants}
          extra={post.participantsCount}
        />
        <span className="font-display text-[10px] text-muted-foreground">
          {post.timeAgo}
        </span>
      </div>
    </FeedCard>
  );
}

/* ─────────────────────────── MEETING ─────────────────────────── */
export function MeetingCard({ post }: { post: MeetingPost }) {
  return (
    <FeedCard
      variant="meeting"
      pillIcon={<Users className="w-3 h-3" />}
      pillLabel="اجتماع"
      imageUrl={post.imageUrl}
      imageAlt={post.title}
      action={
        <ActionButton
          variant="meeting"
          icon={<CheckCircle2 className="w-4 h-4" />}
        >
          سأحضر
        </ActionButton>
      }
    >
      <h3 className="font-display font-extrabold text-[16px] leading-tight text-foreground text-right">
        {post.title}
      </h3>
      <ul className="mt-2 space-y-1 text-[11.5px] text-foreground/75 text-right font-display">
        <li className="flex items-center justify-end gap-1.5">
          <span>{post.date}</span>
          <Calendar className="w-3.5 h-3.5 text-meeting" />
          <span className="mx-1 opacity-50">·</span>
          <span>{post.time}</span>
          <Clock className="w-3.5 h-3.5 text-meeting" />
        </li>
        <li className="flex items-center justify-end gap-1.5">
          <span>{post.location}</span>
          <MapPin className="w-3.5 h-3.5 text-meeting" />
        </li>
      </ul>
      <div className="flex items-center justify-between mt-3">
        <MemberStack
          members={post.participants}
          extra={post.participantsCount}
        />
        <span className="font-display text-[11px] text-muted-foreground">
          {post.attendeesCount} سيحضرون
        </span>
      </div>
    </FeedCard>
  );
}

/* ─────────────────────────── TRIP ─────────────────────────── */
export function TripCard({ post }: { post: TripPost }) {
  return (
    <FeedCard
      variant="trip"
      pillIcon={<Bus className="w-3 h-3" />}
      pillLabel="رحلة"
      imageUrl={post.imageUrl}
      imageAlt={post.title}
      action={
        <ActionButton variant="trip" icon={<Ticket className="w-4 h-4" />}>
          احجز الآن
        </ActionButton>
      }
    >
      <h3 className="font-display font-extrabold text-[16px] leading-tight text-foreground text-right">
        {post.title}
      </h3>
      <p className="font-display text-[11px] text-muted-foreground mt-1 text-right">
        <Calendar className="w-3 h-3 inline -mt-0.5 ml-1 text-trip" />
        {post.date} — التكلفة {post.cost}
      </p>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <SeatStat label="إجمالي" value={post.totalSeats} tone="muted" />
        <SeatStat label="متاح" value={post.availableSeats} tone="trip" />
        <SeatStat label="حجز" value={post.bookedSeats} tone="foreground" />
      </div>

      {/* progress */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-trip-soft overflow-hidden">
        <div
          className="h-full bg-trip rounded-full"
          style={{
            width: `${Math.round((post.bookedSeats / post.totalSeats) * 100)}%`,
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <MemberStack
          members={post.participants}
          extra={post.participantsCount}
        />
        <span className="font-display text-[10px] text-muted-foreground">
          {post.timeAgo}
        </span>
      </div>
    </FeedCard>
  );
}

function SeatStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "muted" | "trip" | "foreground";
}) {
  const color =
    tone === "trip"
      ? "text-trip"
      : tone === "foreground"
        ? "text-foreground"
        : "text-muted-foreground";
  return (
    <div className="rounded-xl bg-secondary/60 py-1.5 text-center">
      <div className={"font-display font-extrabold text-[15px] " + color}>
        {value}
      </div>
      <div className="font-display text-[9.5px] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────── PRAYER ─────────────────────────── */
export function PrayerCard({ post }: { post: PrayerPost }) {
  return (
    <FeedCard
      variant="prayer"
      pillIcon={<HandHeart className="w-3 h-3" />}
      pillLabel="طلب صلاة"
      imageUrl={post.imageUrl}
      imageAlt={post.title}
      action={
        <ActionButton
          variant="prayer"
          icon={<HandHeart className="w-4 h-4" />}
        >
          صليت من أجله
        </ActionButton>
      }
    >
      <h3 className="font-display font-extrabold text-[16px] leading-tight text-prayer text-right">
        {post.title}
      </h3>
      <p className="font-display text-[12px] leading-relaxed text-foreground/75 mt-1 text-right line-clamp-2">
        {post.description}
      </p>

      <div className="mt-2">
        <CommentList comments={post.comments} />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <MemberStack
          members={post.participants}
          extra={post.participantsCount}
        />
        <div className="flex items-center gap-3 font-display text-[11px]">
          <span>
            <b className="text-foreground">{post.commentsCount}</b>{" "}
            <span className="text-muted-foreground">تعليق</span>
          </span>
          <span>
            <b className="text-prayer">{post.prayedCount}</b>{" "}
            <span className="text-muted-foreground">صلوا من أجله</span>
          </span>
        </div>
      </div>
    </FeedCard>
  );
}

/* ─────────────────────────── CELEBRATION ─────────────────────────── */
export function CelebrationCard({ post }: { post: CelebrationPost }) {
  return (
    <FeedCard
      variant="celebration"
      pillIcon={<Gift className="w-3 h-3" />}
      pillLabel="تهنئة"
      imageUrl={post.imageUrl}
      imageAlt={post.title}
      action={
        <ActionButton
          variant="celebration"
          icon={<PartyPopper className="w-4 h-4" />}
        >
          هنّئه
        </ActionButton>
      }
    >
      <h3 className="font-display font-extrabold text-[15.5px] leading-tight text-celebration text-right">
        {post.title}
      </h3>
      <p className="font-display text-[12px] leading-relaxed text-foreground/75 mt-1 text-right line-clamp-2">
        {post.description}
      </p>

      <div className="mt-2">
        <CommentList comments={post.comments} />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <MemberStack
          members={post.participants}
          extra={post.participantsCount}
        />
        <span className="font-display text-[11px]">
          <b className="text-celebration">{post.congratulationsCount}</b>{" "}
          <span className="text-muted-foreground">تهنئة</span>
        </span>
      </div>
    </FeedCard>
  );
}

/* ─────────────────────────── CONDOLENCE ─────────────────────────── */
export function CondolenceCard({ post }: { post: CondolencePost }) {
  return (
    <FeedCard
      variant="condolence"
      pillIcon={<Flame className="w-3 h-3" />}
      pillLabel="تعزية"
      imageUrl={post.imageUrl}
      imageAlt={post.title}
      action={
        <ActionButton
          variant="condolence"
          icon={<HandHeart className="w-4 h-4" />}
        >
          قدّم التعزية
        </ActionButton>
      }
    >
      <h3 className="font-display font-extrabold text-[15.5px] leading-tight text-foreground text-right">
        {post.title}
      </h3>
      <p className="font-display text-[12px] leading-relaxed text-foreground/75 mt-1 text-right line-clamp-2">
        {post.description}
      </p>

      <div className="mt-2">
        <CommentList comments={post.comments} />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <MemberStack
          members={post.participants}
          extra={post.participantsCount}
        />
        <span className="font-display text-[10px] text-muted-foreground">
          {post.timeAgo}
        </span>
      </div>
    </FeedCard>
  );
}
