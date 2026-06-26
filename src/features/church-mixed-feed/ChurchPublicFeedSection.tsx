import { useEffect } from "react";
import { prefetchPostInteractions } from "@/features/church/post-store";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { CHURCH_DIR } from "@/features/church-directory/tokens";
import { composeMixedFeed } from "./feed-compose";
import { ChurchMixedFeedList } from "./ChurchMixedFeedList";
import { publicNav } from "./nav-context";

type Props = {
  churchId: string;
  placeId: string;
  churchName: string;
};

export function ChurchPublicFeedSection({ churchId, placeId, churchName }: Props) {
  const { posts, loading } = useChurchPosts(churchId);
  const feedItems = composeMixedFeed(posts, {
    includePrayerWidget: false,
    includeMeetingsWidget: true,
  });

  useEffect(() => {
    if (posts.length) void prefetchPostInteractions(posts.map((p) => p.id));
  }, [posts]);

  if (!loading && !posts.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
          style={{ background: CHURCH_DIR.purpleSoft, color: CHURCH_DIR.purple }}
        >
          آخر الأخبار
        </span>
        <h3 className="font-arabic-serif text-[16px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
          منشورات {churchName}
        </h3>
      </div>
      <ChurchMixedFeedList
        items={feedItems}
        navContext={publicNav(placeId)}
        loading={loading}
        emptyMessage="لا توجد منشورات منشورة بعد"
        churchName={churchName}
      />
    </section>
  );
}
