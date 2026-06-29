import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Users } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { useConnectChannels, type ConnectChannel } from "@/components/alpha/connect-channels-registry";
import { CommunityActionFab } from "./CommunityActionFab";
import { getChannelState } from "@/components/alpha/connect-channel-state";
import { getCurrentUser } from "@/features/church/current-user";
import { useMemberChurch } from "@/features/church/use-member-church";

const GROUP_ICONS = new Set(["users", "book", "family", "music", "handshake"]);

type GroupTab = "all" | "mine" | "church" | "suggested";

const TAB_LABELS: { key: GroupTab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "mine", label: "مجموعاتي" },
  { key: "church", label: "كنيستي" },
  { key: "suggested", label: "مقترحة" },
];

function groupAccent(channel: ConnectChannel): string {
  if (channel.icon === "book") return "#1f8a5a";
  if (channel.icon === "family") return "#8a6ec1";
  if (channel.icon === "music") return "#c98a3c";
  return "#5b8fd1";
}

function isGroupChannel(channel: ConnectChannel): boolean {
  return GROUP_ICONS.has(channel.icon) && !channel.archived;
}

function isChannelMember(channelId: string, userId: string): boolean {
  if (!userId) return false;
  return getChannelState(channelId).members.some((m) => m.id === userId && !m.blocked);
}

function filterGroupChannels(channels: ConnectChannel[], tab: GroupTab, userId: string, churchName?: string): ConnectChannel[] {
  const base = channels.filter(isGroupChannel);
  if (tab === "all") return base;
  if (tab === "mine") return base.filter((c) => isChannelMember(c.id, userId));
  if (tab === "church") {
    const churchHint = churchName?.trim().toLowerCase();
    return base.filter(
      (c) =>
        c.favorite ||
        (churchHint ? c.name.toLowerCase().includes("كنيس") || c.adminName.toLowerCase().includes(churchHint.slice(0, 4)) : false),
    );
  }
  return base.filter((c) => !isChannelMember(c.id, userId));
}

export function CommunityGroupsScreen() {
  const [tab, setTab] = useState<GroupTab>("all");
  const { channels: allChannels } = useConnectChannels();
  const { church } = useMemberChurch();
  const userId = getCurrentUser().id;

  const channels = useMemo(
    () => filterGroupChannels(allChannels, tab, userId, church?.name),
    [allChannels, tab, userId, church?.name],
  );

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center gap-3 pt-[max(env(safe-area-inset-top),12px)] pb-4">
          <Link
            to="/community"
            aria-label="رجوع"
            className="alpha-chrome-btn grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-95"
          >
            <ArrowRight className="h-5 w-5 text-alpha" strokeWidth={2.1} />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-[17px] font-extrabold text-alpha-heading">اكتشف مجموعاتك</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-alpha-heading-muted">Alpha Connect · كنيستك</p>
          </div>
          <Link
            to="/alpha-connect"
            aria-label="إنشاء مجموعة"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e7c97a]/35 bg-[#e7c97a]/12 text-[#7a4a26] active:scale-95"
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
          </Link>
        </header>

        <div className="mb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold transition-colors ${
                tab === key
                  ? "border-[#e7c97a]/55 bg-[#e7c97a]/20 text-[#3a2a18]"
                  : "border-[#e7c97a]/22 bg-white/60 text-[#7a6548]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {channels.map((g) => {
            const accent = groupAccent(g);
            const joined = isChannelMember(g.id, userId);
            return (
              <Link
                key={g.id}
                to="/alpha-connect"
                search={{ tab: "groups", channel: g.id }}
                className="flex items-center gap-3 rounded-[20px] border border-[#e7c97a]/25 bg-white/82 p-3.5 active:scale-[0.99] transition-transform"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${accent}18`, color: accent }}
                >
                  <Users className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[14px] font-extrabold text-[#3a2a18]">{g.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#7a6548]">
                    {g.onlineCount} متصل · {g.adminName}
                    {joined ? " · عضو" : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {channels.length === 0 ? (
          <p className="mt-8 text-center text-[13px] font-semibold text-alpha-heading-muted">
            {tab === "mine"
              ? "لم تنضم لأي مجموعة بعد — جرّب «مقترحة» أو افتح Alpha Connect."
              : tab === "suggested"
                ? "لا توجد مجموعات مقترحة حالياً."
                : "لا توجد مجموعات — افتح Alpha Connect لإنشاء واحدة."}
          </p>
        ) : null}
      </div>

      <CommunityActionFab />
      <BottomDock />
    </div>
  );
}
