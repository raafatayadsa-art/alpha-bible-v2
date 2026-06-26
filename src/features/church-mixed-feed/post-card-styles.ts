import type { PostType } from "@/data/church-posts";
import { POST_TYPE_META } from "@/data/church-posts";

export type PostCardStyle = {
  tone: string;
  softTone: string;
  cardBg: string;
};

const SOFT_TONES: Record<PostType, string> = {
  news: "#faf3e4",
  announcement: "#fce8ee",
  liturgy: "#f5ede4",
  meeting: "#e8f1fc",
  wedding: "#fdf0f3",
  condolence: "#f2ede6",
  prayer: "#f0ebfa",
  report: "#e8f0fa",
  event: "#fce8e8",
  trip: "#e6f6ee",
};

export function postCardStyle(type: PostType): PostCardStyle {
  const meta = POST_TYPE_META[type];
  const soft = SOFT_TONES[type];
  let cardBg = "bg-white";
  if (type === "prayer") cardBg = "bg-[linear-gradient(155deg,#f7f3fc_0%,#ffffff_62%)]";
  else if (type === "wedding") cardBg = "bg-[linear-gradient(155deg,#fdf8ee_0%,#ffffff_62%)]";
  else if (type === "condolence") cardBg = "bg-[linear-gradient(155deg,#f5f2ee_0%,#ffffff_62%)]";
  else if (type === "trip") cardBg = "bg-[linear-gradient(155deg,#eefaf3_0%,#ffffff_62%)]";
  return { tone: meta.tone, softTone: soft, cardBg };
}

export function isLivePost(post: { type: PostType; title: string; excerpt: string }): boolean {
  if (post.type === "event") return true;
  const blob = `${post.title} ${post.excerpt}`;
  return /بث|مباشر|live/i.test(blob);
}
