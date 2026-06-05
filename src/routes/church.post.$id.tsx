import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ChevronLeft, CalendarDays, Share2, Pin, Pencil, Trash2, User,
  Clock, MapPin, Users as UsersIcon, Crown, BookOpen, Heart, Ticket,
} from "lucide-react";
import { CopticWatermark } from "@/components/coptic";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import { getPost, useReplies, useReservations } from "@/features/church/post-store";
import {
  AttendButton, CondolencePopup, CongratsPopup, ReservePopup,
} from "@/features/church/PostActions";

export const Route = createFileRoute("/church/post/$id")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ألفا — منشور الكنيسة" }],
  }),
  component: ChurchPostScreen,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-[#f4ead8] text-[#3a2a18] font-bold">
      المنشور غير موجود
    </div>
  ),
});

function ChurchPostScreen() {
  const { id } = useParams({ from: "/church/post/$id" });
  const post = getPost(id);

  if (!post) {
    return (
      <main dir="rtl" className="min-h-screen w-full bg-[#f4ead8] grid place-items-center text-[#3a2a18]">
        <div className="text-center">
          <p className="font-extrabold mb-3">لم يتم العثور على المنشور</p>
          <Link to="/church" className="text-[#b8893a] font-bold">العودة لمنشورات الكنيسة</Link>
        </div>
      </main>
    );
  }

  const meta = POST_TYPE_META[post.type];

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)",
        }}
      />
      <CopticWatermark />

      {/* Hero image */}
      <div className="relative">
        <div className="relative h-[300px] w-full">
          <img src={post.image} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0603]/55 via-transparent to-[#f4ead8]" />
        </div>

        <header className="absolute top-0 left-0 right-0 px-4 pt-[max(env(safe-area-inset-top),14px)]">
          <div className="flex items-center justify-between">
            <Link
              to="/church"
              aria-label="رجوع"
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
            >
              <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
            </Link>
            <button
              type="button"
              aria-label="مشاركة"
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="absolute bottom-6 right-4 left-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center rounded-full font-extrabold text-white px-3 py-1 text-[11px] border border-white/30 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)]"
              style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
            >
              {meta.label}{post.details?.eventType ? ` · ${post.details.eventType}` : ""}
            </span>
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b8893a] px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/40 shadow">
                <Pin className="h-3 w-3" strokeWidth={2.8} /> مثبت
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative mx-auto w-full max-w-[440px] px-4 -mt-6 pb-[calc(env(safe-area-inset-bottom,0px)+40px)] space-y-4">
        <article className="relative rounded-[28px] border border-white/70 bg-[#fbf3e1]/95 backdrop-blur-xl p-5 shadow-[0_24px_50px_-26px_rgba(60,40,16,0.55),inset_0_1px_0_rgba(255,255,255,0.8)]">
          <h1 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-snug text-right">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 justify-end text-[11.5px] text-[#6a543a]">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#b8893a]" />
              {post.author}
            </span>
            <span className="text-[#c79356]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#b8893a]" />
              {post.date}
            </span>
          </div>

          {/* Template-specific details */}
          <TemplateDetails post={post} />

          <GoldDivider />

          <p className="text-right text-[14px] leading-[1.9] text-[#3a2a18] whitespace-pre-line">
            {post.body}
          </p>

          {post.details?.verse ? (
            <blockquote className="mt-4 rounded-2xl border-r-[3px] border-[#c79356] bg-white/70 p-3 text-right text-[13px] text-[#3a2a18] leading-relaxed">
              ✚ {post.details.verse}
            </blockquote>
          ) : null}
        </article>

        {/* Action area */}
        <PostActionArea post={post} />

        {/* Replies (condolences / congrats) */}
        {post.type === "condolence" ? <RepliesList postId={post.id} kind="condolence" /> : null}
        {post.type === "wedding" ? <RepliesList postId={post.id} kind="congrats" /> : null}

        {/* Admin actions */}
        <div className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl p-4">
          <p className="text-[10.5px] font-bold text-[#b8893a] tracking-wide mb-2 text-right">
            إجراءات الكهنة والخدام
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            <AdminBtn icon={Pin} label={post.pinned ? "إلغاء التثبيت" : "تثبيت"} tone="#b8893a" />
            <AdminBtn icon={Pencil} label="تعديل" tone="#5b8fd1" />
            <AdminBtn icon={Trash2} label="حذف" tone="#a85450" />
          </div>
        </div>
      </div>
    </main>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-2 justify-center my-4" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/60 to-transparent" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#c79356]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/60 to-transparent" />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center gap-2 text-right">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/85 border border-[#efe2c4] text-[#b8893a] shrink-0">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-[#b8893a] leading-none">{label}</p>
        <p className="mt-0.5 text-[12.5px] font-extrabold text-[#3a2a18] leading-tight truncate">{String(value)}</p>
      </div>
    </div>
  );
}

function TemplateDetails({ post }: { post: ChurchPost }) {
  const d = post.details;
  if (!d) return null;

  const rows: React.ReactNode[] = [];

  if (post.type === "wedding") {
    rows.push(<DetailRow key="g" icon={Heart} label="العريس" value={d.groom} />);
    rows.push(<DetailRow key="b" icon={Heart} label="العروسة" value={d.bride} />);
    rows.push(<DetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} />);
    rows.push(<DetailRow key="p" icon={MapPin} label="المكان" value={d.place} />);
  } else if (post.type === "condolence") {
    rows.push(<DetailRow key="n" icon={User} label="المنتقل" value={d.personName} />);
    rows.push(<DetailRow key="dd" icon={CalendarDays} label="تاريخ الوفاة" value={d.deathDate} />);
  } else if (post.type === "liturgy") {
    rows.push(<DetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} />);
    rows.push(<DetailRow key="t" icon={Clock} label="الوقت" value={d.time} />);
    rows.push(<DetailRow key="p" icon={MapPin} label="المكان" value={d.place} />);
    rows.push(<DetailRow key="pr" icon={Crown} label="الكاهن" value={d.priest} />);
  } else if (post.type === "meeting") {
    rows.push(<DetailRow key="d" icon={CalendarDays} label="التاريخ" value={d.date} />);
    rows.push(<DetailRow key="t" icon={Clock} label="الوقت" value={d.time} />);
    rows.push(<DetailRow key="p" icon={MapPin} label="المكان" value={d.place} />);
    rows.push(<DetailRow key="a" icon={UsersIcon} label="الفئة" value={d.audience} />);
  } else if (post.type === "trip") {
    rows.push(<DetailRow key="d" icon={CalendarDays} label="الذهاب" value={d.date} />);
    rows.push(<DetailRow key="r" icon={CalendarDays} label="العودة" value={d.returnDate} />);
    rows.push(<DetailRow key="pl" icon={MapPin} label="أماكن الزيارة" value={d.places} />);
    rows.push(<DetailRow key="s" icon={Ticket} label="الأماكن المتاحة" value={d.seats} />);
  }

  const visible = rows.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-2xl bg-white/60 border border-[#efe2c4] p-3">
      {visible}
    </div>
  );
}

function PostActionArea({ post }: { post: ChurchPost }) {
  const [popup, setPopup] = useState<null | "condolence" | "congrats" | "reserve">(null);
  const res = useReservations(post.id, post.details?.seats);

  const wrap = (children: React.ReactNode) => (
    <div className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl p-4">{children}</div>
  );

  if (post.type === "liturgy" || post.type === "meeting") {
    return wrap(
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-bold text-[#6a543a] text-right">
          هل ستحضر؟ ساعدنا في تقدير الحضور.
        </p>
        <AttendButton postId={post.id} />
      </div>
    );
  }

  if (post.type === "trip") {
    return (
      <>
        {wrap(
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-right">
              <p className="text-[12px] font-bold text-[#6a543a]">حجوزاتك في هذه الرحلة</p>
              <span className="font-arabic-serif text-[18px] font-extrabold text-[#3a2a18]">
                {res.mine.toLocaleString("ar-EG")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-right text-[11px] text-[#7a5a30]">
              <span>إجمالي المحجوز: {res.reserved.toLocaleString("ar-EG")}</span>
              {res.remaining != null ? (
                <span>المتاح: {res.remaining.toLocaleString("ar-EG")}</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setPopup("reserve")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#1f8a5a] text-white text-[13px] font-extrabold py-2.5 shadow-[0_12px_24px_-12px_rgba(31,138,90,0.7)] active:scale-[0.98]"
            >
              <Ticket className="h-4 w-4" /> حجز مكان
            </button>
          </div>
        )}
        {popup === "reserve" ? (
          <ReservePopup postId={post.id} totalSeats={post.details?.seats} onClose={() => setPopup(null)} />
        ) : null}
      </>
    );
  }

  if (post.type === "wedding") {
    return (
      <>
        {wrap(
          <button
            type="button"
            onClick={() => setPopup("congrats")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#d97a8a] text-white text-[13px] font-extrabold py-2.5 shadow-[0_12px_24px_-12px_rgba(217,122,138,0.7)] active:scale-[0.98]"
          >
            <Heart className="h-4 w-4 fill-current" strokeWidth={0} /> شارك التهنئة
          </button>
        )}
        {popup === "congrats" ? <CongratsPopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      </>
    );
  }

  if (post.type === "condolence") {
    return (
      <>
        {wrap(
          <button
            type="button"
            onClick={() => setPopup("condolence")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#6a543a] text-white text-[13px] font-extrabold py-2.5 shadow-[0_12px_24px_-12px_rgba(106,84,58,0.7)] active:scale-[0.98]"
          >
            <BookOpen className="h-4 w-4" /> أرسل تعزية
          </button>
        )}
        {popup === "condolence" ? <CondolencePopup postId={post.id} onClose={() => setPopup(null)} /> : null}
      </>
    );
  }

  return null;
}

function RepliesList({ postId, kind }: { postId: string; kind: "condolence" | "congrats" }) {
  const replies = useReplies(kind, postId);
  if (replies.length === 0) return null;
  const title = kind === "condolence" ? "رسائل التعزية" : "رسائل التهنئة";
  return (
    <div className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl p-4 text-right">
      <p className="text-[11px] font-extrabold text-[#b8893a] mb-2">
        {title} ({replies.length.toLocaleString("ar-EG")})
      </p>
      <div className="space-y-2">
        {replies.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white/80 border border-[#efe2c4] p-2.5">
            <p className="font-arabic-serif text-[12.5px] font-extrabold text-[#3a2a18]">{r.name}</p>
            <p className="mt-1 text-[12px] text-[#3a2a18] leading-snug whitespace-pre-line">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBtn({ icon: Icon, label, tone }: { icon: any; label: string; tone: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-10px_rgba(0,0,0,0.25)] active:scale-95 transition-transform"
      style={{ color: tone }}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {label}
    </button>
  );
}
