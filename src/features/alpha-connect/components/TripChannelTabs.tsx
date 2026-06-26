import { cn } from "@/lib/utils";
import { resolveTripChannelTabs } from "@/features/alpha-connect/trip-channel-access";
import { findTripLinkByChannelId } from "@/features/alpha-connect/trip-channel-links";

export function TripChannelTabs({
  activeChannelId,
  currentUserId,
  onSelectChannel,
}: {
  activeChannelId: string;
  currentUserId: string;
  onSelectChannel: (channelId: string) => void;
}) {
  const link = findTripLinkByChannelId(activeChannelId);
  if (!link) return null;

  const tabs = resolveTripChannelTabs(link.postId, currentUserId);
  if (!tabs?.showOrganizer) return null;

  const onPublic = activeChannelId === tabs.publicId;
  const onOrganizer = activeChannelId === tabs.organizerId;

  return (
    <div className="mb-3 flex gap-2 rounded-2xl border border-white/10 bg-black/25 p-1" dir="rtl">
      <button
        type="button"
        onClick={() => onSelectChannel(tabs.publicId)}
        className={cn(
          "flex-1 rounded-xl px-3 py-2 text-[12px] font-extrabold transition active:scale-[0.98]",
          onPublic
            ? "bg-gradient-to-br from-[#7a5cb0] to-[#5a3d92] text-white shadow-[0_0_14px_rgba(122,92,176,0.45)]"
            : "text-white/65",
        )}
      >
        الرحلة
      </button>
      <button
        type="button"
        onClick={() => onSelectChannel(tabs.organizerId)}
        className={cn(
          "flex-1 rounded-xl px-3 py-2 text-[12px] font-extrabold transition active:scale-[0.98]",
          onOrganizer
            ? "bg-gradient-to-br from-[#c79356] to-[#7a4a26] text-white shadow-[0_0_14px_rgba(199,147,86,0.45)]"
            : "text-white/65",
        )}
      >
        التنظيم
      </button>
    </div>
  );
}
