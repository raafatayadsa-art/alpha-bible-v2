import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { POST_TYPE_META, type ChurchPost } from "@/data/church-posts";
import { PostImage } from "@/features/church/PostImage";

export function CommunityChurchPostCard({ post, churchName }: { post: ChurchPost; churchName?: string }) {
  const meta = POST_TYPE_META[post.type] ?? { label: "منشور", tone: "#c98a3c" };

  return (
    <Link
      to="/church/post/$id"
      params={{ id: post.id }}
      className="flex items-stretch gap-3 overflow-hidden rounded-[20px] border border-[#e7c97a]/25 bg-white/82 p-2.5 active:scale-[0.99] transition-transform shadow-[0_10px_24px_-18px_rgba(80,50,20,0.35)]"
    >
      <PostImage
        post={post}
        alt=""
        className="h-[72px] w-[72px] shrink-0 rounded-[14px] object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1 py-0.5 text-right">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#7a6548]">
          من الكنيسة · {meta.label}
        </p>
        <p className="mt-0.5 text-[14px] font-extrabold leading-snug text-[#3a2a18] line-clamp-2">{post.title}</p>
        <p className="mt-1 line-clamp-1 text-[11px] font-medium text-[#6a543a]">{post.excerpt}</p>
        {churchName ? (
          <p className="mt-1 text-[10px] font-bold text-[#9a8468]">{churchName}</p>
        ) : null}
      </div>
      <ChevronLeft className="my-auto h-4 w-4 shrink-0 text-[#b8893a] opacity-70" />
    </Link>
  );
}
