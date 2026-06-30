import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Archive, Clock, Newspaper, Pen, Plus, UserCog } from "lucide-react";
import type { ChurchPost } from "@/data/church-posts";
import { useChurchDashboardData } from "@/features/church/church-dashboard-context";
import { PostBuilder } from "@/features/church/PostBuilder";
import {
  canCreateTripContent,
  canGrantTripOrganizerRole,
  canReviewTripPosts,
  filterPendingTripPosts,
  subscribeTripApprovalChanged,
  TripApprovalSheet,
  TripOrganizerGrantSheet,
} from "@/features/church/trip-organizer";
import { fetchChurchPosts } from "@/features/church/church-posts-api";
import { useCanManagePosts } from "@/features/church/post-store";
import { getCurrentUser } from "@/features/church/current-user";
import { composeMixedFeed } from "./feed-compose";
import { ChurchMixedFeedList } from "./ChurchMixedFeedList";
import { MEMBER_NAV } from "./nav-context";

type Props = {
  posts: ChurchPost[];
  loading: boolean;
  onRefresh: () => void;
};

// ─── Premium section header ───────────────────────────────────────
function FeedSectionHeader({
  churchName,
  postCount,
  canManage,
  canCreateTrip,
  tripOnlyBuilder,
  pendingCount,
  canReview,
  canGrant,
  onNew,
  onApproval,
  onGrant,
}: {
  churchName: string;
  postCount: number;
  canManage: boolean;
  canCreateTrip: boolean;
  tripOnlyBuilder: boolean;
  pendingCount: number;
  canReview: boolean;
  canGrant: boolean;
  onNew: () => void;
  onApproval: () => void;
  onGrant: () => void;
}) {
  return (
    <div
      className="mb-4 overflow-hidden rounded-[22px] px-4 py-3"
      style={{
        background:
          "linear-gradient(148deg, rgba(26,16,8,0.92) 0%, rgba(38,24,12,0.88) 60%, rgba(20,12,6,0.92) 100%)",
        border: "1px solid rgba(240,215,140,0.12)",
        boxShadow:
          "0 16px 32px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Top row: title + count */}
      <div className="mb-2.5 flex items-center justify-between gap-2" dir="rtl">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(145deg,rgba(240,215,140,0.18) 0%,rgba(199,147,86,0.08) 100%)",
              border: "1px solid rgba(240,215,140,0.22)",
            }}
          >
            <Newspaper className="h-4 w-4 text-[#f0d78c]" strokeWidth={2.2} />
          </span>
          <div>
            <h3 className="text-[14px] font-extrabold leading-none text-white/95">
              منشورات الكنيسة
            </h3>
            <p className="mt-0.5 text-[9.5px] font-bold text-white/40">{churchName}</p>
          </div>
        </div>
        {postCount > 0 ? (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
            style={{
              background: "rgba(240,215,140,0.12)",
              border: "1px solid rgba(240,215,140,0.25)",
              color: "#f0d78c",
            }}
          >
            {postCount} منشور
          </span>
        ) : null}
      </div>

      {/* Gold divider */}
      <div
        aria-hidden
        className="mb-3 h-px w-full"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(240,215,140,0.3),transparent)",
        }}
      />

      {/* Action buttons row */}
      <div className="flex items-center justify-end gap-2" dir="rtl">
        <Link
          to="/church/archive"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[10.5px] font-bold text-white/55 active:scale-95 transition-transform"
        >
          <Archive className="h-3 w-3" strokeWidth={2.2} />
          الأرشيف
        </Link>

        {canReview && pendingCount > 0 ? (
          <button
            type="button"
            onClick={onApproval}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e7c97a]/45 bg-[#e7c97a]/10 px-3 py-1.5 text-[10.5px] font-extrabold text-[#f0d78c] active:scale-95 transition-transform"
          >
            <Clock className="h-3 w-3" strokeWidth={2.2} />
            {pendingCount} للمراجعة
          </button>
        ) : null}

        {canGrant ? (
          <button
            type="button"
            title="صلاحيات الخدام"
            onClick={onGrant}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[10.5px] font-extrabold text-white/70 active:scale-95 transition-transform"
          >
            <UserCog className="h-3 w-3" strokeWidth={2.2} />
            صلاحيات الخدام
          </button>
        ) : null}

        {(canManage || canCreateTrip) ? (
          <button
            type="button"
            aria-label="منشور جديد"
            onClick={onNew}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold text-[#1a1008] active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg,#f0d78c 0%,#c98a3c 100%)",
              boxShadow: "0 8px 20px -8px rgba(199,147,86,0.6)",
            }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.8} />
            {tripOnlyBuilder ? "رحلة" : "منشور"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Floating Action Button ───────────────────────────────────────
function PostFAB({
  tripOnly,
  onOpen,
}: {
  tripOnly: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={tripOnly ? "إنشاء رحلة" : "إنشاء منشور جديد"}
      onClick={onOpen}
      className="fixed z-50 flex items-center gap-2 rounded-full shadow-[0_16px_40px_-12px_rgba(199,147,86,0.65)] active:scale-95 transition-transform"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 82px)",
        left: "16px",
        background: "linear-gradient(135deg,#f0d78c 0%,#c98a3c 100%)",
        border: "1px solid rgba(255,255,255,0.25)",
        padding: "12px 18px 12px 14px",
      }}
    >
      <Pen className="h-4 w-4 text-[#1a0e04]" strokeWidth={2.6} />
      <span className="text-[12px] font-extrabold text-[#1a0e04]">
        {tripOnly ? "رحلة جديدة" : "منشور جديد"}
      </span>
    </button>
  );
}

// ─── Main section ─────────────────────────────────────────────────
export function ChurchMixedFeedSection({ posts, loading, onRefresh }: Props) {
  const { church, prayers } = useChurchDashboardData();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const canManage = useCanManagePosts();
  const canCreateTrip = canCreateTripContent(church.id);
  const canReview = canReviewTripPosts(getCurrentUser().id, church.id);
  const canGrant = canGrantTripOrganizerRole();
  const tripOnlyBuilder = canCreateTrip && !canManage;

  useEffect(() => {
    if (!canReview) return;
    const load = async () => {
      const rows = await fetchChurchPosts(church.id);
      setPendingCount(filterPendingTripPosts(rows).length);
    };
    void load();
    const unsub = subscribeTripApprovalChanged(() => void load());
    return unsub;
  }, [church.id, canReview]);

  const feedItems = composeMixedFeed(posts, {
    includePrayerWidget: true,
    includeMeetingsWidget: true,
  });

  return (
    <section>
      <FeedSectionHeader
        churchName={church.name}
        postCount={posts.length}
        canManage={canManage}
        canCreateTrip={canCreateTrip}
        tripOnlyBuilder={tripOnlyBuilder}
        pendingCount={pendingCount}
        canReview={canReview}
        canGrant={canGrant}
        onNew={() => setBuilderOpen(true)}
        onApproval={() => setApprovalOpen(true)}
        onGrant={() => setGrantOpen(true)}
      />

      {/* Fixed FAB — always visible for testing */}
      <PostFAB tripOnly={tripOnlyBuilder} onOpen={() => setBuilderOpen(true)} />

      <ChurchMixedFeedList
        items={feedItems}
        navContext={MEMBER_NAV}
        prayers={prayers}
        loading={loading}
        churchName={church.name}
      />

      {builderOpen ? (
        <PostBuilder
          churchId={church.id}
          churchName={church.name}
          tripOnly={tripOnlyBuilder}
          onClose={() => setBuilderOpen(false)}
          onCreated={() => void onRefresh()}
        />
      ) : null}
      {approvalOpen ? (
        <TripApprovalSheet
          churchId={church.id}
          churchName={church.name}
          onClose={() => setApprovalOpen(false)}
          onChanged={() => void onRefresh()}
        />
      ) : null}
      {grantOpen ? (
        <TripOrganizerGrantSheet churchId={church.id} onClose={() => setGrantOpen(false)} />
      ) : null}
    </section>
  );
}
