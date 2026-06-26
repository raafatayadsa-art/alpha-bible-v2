import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { POST_TYPE_META, type PostType } from "@/data/church-posts";
import { CopticWatermark } from "@/components/coptic";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { postsOfType } from "./feed-compose";
import { ChurchMixedPostCard } from "./ChurchMixedPostCard";
import { postCardStyle } from "./post-card-styles";
import { publicNav } from "./nav-context";

const TYPE_EMOJI: Record<PostType, string> = {
  news:         "📰",
  announcement: "📣",
  liturgy:      "✝️",
  meeting:      "👥",
  wedding:      "💍",
  condolence:   "🕯️",
  prayer:       "🙏",
  report:       "📊",
  event:        "📡",
  trip:         "🚌",
};

type Props = {
  churchId: string;
  placeId: string;
  churchName: string;
  postType: PostType;
};

export function ChurchDirectoryPostsTypeScreen({
  churchId,
  placeId,
  churchName,
  postType,
}: Props) {
  const { posts, loading } = useChurchPosts(churchId);
  const meta = POST_TYPE_META[postType];
  const style = postCardStyle(postType);
  const filtered = postsOfType(posts, postType);
  const nav = publicNav(placeId);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: "linear-gradient(180deg,#1a1008 0%,#0e0a04 100%)" }}
    >
      <CopticWatermark />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 pb-3 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background: "linear-gradient(180deg,rgba(18,12,6,0.98) 0%,rgba(18,12,6,0.82) 75%,rgba(18,12,6,0) 100%)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${style.tone}22`,
        }}
      >
        {/* top glow */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ background: `linear-gradient(90deg,transparent,${style.tone}88,transparent)` }}
        />
        <div className="flex items-center justify-between gap-3 px-4">
          <Link
            to="/church/directory/$placeId"
            params={{ placeId }}
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full active:scale-90 transition-transform"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" />
          </Link>

          <div className="flex flex-col items-center gap-1">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-[22px]"
              style={{
                background: `linear-gradient(145deg,${style.tone}28 0%,${style.tone}10 100%)`,
                border: `1px solid ${style.tone}44`,
                boxShadow: `0 0 20px ${style.tone}30`,
              }}
            >
              {TYPE_EMOJI[postType]}
            </span>
            <h1 className="text-[15px] font-extrabold leading-none" style={{ color: style.tone }}>
              {meta.label}
            </h1>
            <p className="text-[9.5px] font-bold text-white/40">{churchName}</p>
          </div>

          <span
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2.5 text-[12px] font-extrabold"
            style={{ background: `${style.tone}18`, border: `1px solid ${style.tone}35`, color: style.tone }}
          >
            {loading ? "…" : filtered.length}
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+32px)]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <span
              className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: style.tone }}
            />
            <p className="text-[13px] font-bold text-white/45">جاري التحميل…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-[24px] py-12 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[24px]">{TYPE_EMOJI[postType]}</p>
            <p className="mt-2 text-[13px] font-bold text-white/50">
              لا توجد منشورات من نوع {meta.label}
            </p>
            <Link
              to="/church/directory/$placeId"
              params={{ placeId }}
              className="mt-4 inline-flex items-center gap-1 text-[12px] font-extrabold"
              style={{ color: style.tone }}
            >
              العودة لصفحة الكنيسة
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((post) => (
              <ChurchMixedPostCard
                key={post.id}
                post={post}
                mode="type-list"
                navContext={nav}
                churchName={churchName}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
