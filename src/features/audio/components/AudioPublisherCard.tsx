import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Headphones, Heart, ShieldCheck, UserPlus } from "lucide-react";
import type { AudioPublisherCardModel } from "@/features/publisher/publisher-discovery-api";
import { PUBLISHER_TYPE_LABELS } from "@/features/publisher/types";
import { fetchPublisherFollowState, togglePublisherFollow } from "@/features/publisher/publisher-follow-api";
import cardChurch from "@/assets/home/card-church.jpg";

type Props = {
  publisher: AudioPublisherCardModel;
  onFollowChange?: (publisherId: string, following: boolean, followerCount: number) => void;
};

export function AudioPublisherCard({ publisher, onFollowChange }: Props) {
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const logo = publisher.logoUrl?.trim() || publisher.coverUrl?.trim() || cardChurch;
  const typeLabel = PUBLISHER_TYPE_LABELS[publisher.publisherType];

  useEffect(() => {
    void fetchPublisherFollowState(publisher.id).then((s) => setFollowing(s.following));
  }, [publisher.id]);

  const onFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (followBusy) return;
    setFollowBusy(true);
    const next = await togglePublisherFollow(publisher.id);
    setFollowBusy(false);
    if (next) {
      setFollowing(next.following);
      onFollowChange?.(publisher.id, next.following, next.count);
    }
  };

  return (
    <Link
      to="/publisher/$publisherId"
      params={{ publisherId: publisher.id }}
      className="group block rounded-[22px] border border-[rgba(93,50,145,0.12)] bg-white/95 p-3 shadow-[0_10px_28px_-14px_rgba(93,50,145,0.22)] ring-1 ring-[var(--gold)]/15 transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="h-[72px] w-[72px] overflow-hidden rounded-2xl ring-2 ring-[var(--gold)]/30 shadow-[0_8px_20px_-8px_rgba(140,100,40,0.4)]">
            <img src={logo} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
          {publisher.isTrusted ? (
            <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full bg-[#5D3291] text-white ring-2 ring-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-right">
          <p className="text-[10px] font-bold text-[#8a84a8]">{typeLabel}</p>
          <p className="truncate text-[14px] font-extrabold text-[#3a3258]">{publisher.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#e85d7a]">
              <Heart className="h-3.5 w-3.5 fill-current" />
              {publisher.likesCount.toLocaleString("ar-EG")}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#5D3291]">
              <Headphones className="h-3.5 w-3.5" />
              {publisher.listenCount.toLocaleString("ar-EG")} استماع
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => void onFollow(e)}
          disabled={followBusy}
          className="inline-flex shrink-0 flex-col items-center gap-0.5 rounded-2xl px-2.5 py-2 text-[9px] font-extrabold transition active:scale-95 disabled:opacity-60"
          style={{
            background: following
              ? "linear-gradient(160deg, rgba(123,76,184,0.15), rgba(93,50,145,0.12))"
              : "linear-gradient(160deg, #7b4cb8, #5D3291)",
            color: following ? "#5D3291" : "#fff",
            boxShadow: following ? "none" : "0 6px 18px -6px rgba(93,50,145,0.55)",
          }}
        >
          <UserPlus className="h-4 w-4" />
          {following ? "متابَع" : "متابعة"}
        </button>
      </div>
    </Link>
  );
}
