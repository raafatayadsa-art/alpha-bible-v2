import type { ChurchDashboardPrayer } from "@/features/church/church-dashboard-api";
import type { FeedItem } from "./feed-compose";
import type { ChurchFeedNavContext } from "./nav-context";
import { MEMBER_NAV } from "./nav-context";
import { ChurchFeedMeetingsWidget } from "./ChurchFeedMeetingsWidget";
import { ChurchFeedPrayerWidget } from "./ChurchFeedPrayerWidget";
import { ChurchMixedPostCard } from "./ChurchMixedPostCard";

type Props = {
  items: FeedItem[];
  navContext?: ChurchFeedNavContext;
  prayers?: ChurchDashboardPrayer[];
  loading?: boolean;
  emptyMessage?: string;
  churchName?: string;
};

export function ChurchMixedFeedList({
  items,
  navContext = MEMBER_NAV,
  prayers = [],
  loading,
  emptyMessage = "لا توجد منشورات بعد",
  churchName,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-[#fbf3e1]/80 py-8 text-center">
        <p className="text-[13px] font-bold text-[#6a543a]">جاري تحميل المنشورات…</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-[#fbf3e1]/80 py-8 text-center">
        <p className="text-[13px] font-bold text-[#6a543a]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        if (item.kind === "prayer-widget") {
          return <ChurchFeedPrayerWidget key={`prayer-${i}`} prayers={prayers} />;
        }
        if (item.kind === "meetings-widget") {
          return (
            <ChurchFeedMeetingsWidget
              key={`meetings-${i}`}
              meetings={item.meetings}
              navContext={navContext}
            />
          );
        }
        return (
          <ChurchMixedPostCard
            key={`${item.postType}-${item.post.id}`}
            post={item.post}
            typeCount={item.typeCount}
            mode="hub-preview"
            navContext={navContext}
            churchName={churchName}
          />
        );
      })}
    </div>
  );
}
