import { useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { toast } from "sonner";
import { DiscoverMemberRow } from "./DiscoverMemberRow";
import { DiscoverNewMembersCarousel } from "./DiscoverNewMembersCarousel";
import { CommunityMemberQuickSheet } from "./CommunityMemberQuickSheet";
import type { CommunityMemberPreview } from "./community-user-trust";
import { useDiscoverMembers } from "./useDiscoverMembers";
import type { DiscoverMember } from "./discover-members-api";
import { cn } from "@/lib/utils";

function toPreview(member: DiscoverMember): CommunityMemberPreview {
  return {
    userId: member.userId,
    userName: member.name,
    userAvatarUrl: member.avatarUrl,
    churchName: member.churchName,
    alphaId: member.alphaId,
    role: member.serviceLabel ?? "عضو",
    shieldRole: "member",
    verified: true,
  };
}

export function DiscoverMembersScreen() {
  const { goBack } = useAlphaNavigation();
  const { tabs, tab, setTab, query, setQuery, visible, newMembersCarousel, loading, refresh, sendRequest } =
    useDiscoverMembers();
  const [preview, setPreview] = useState<CommunityMemberPreview | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openMember = (member: DiscoverMember) => {
    setPreview(toPreview(member));
    setSheetOpen(true);
  };

  const onAdd = async (member: DiscoverMember) => {
    setBusyId(member.userId);
    try {
      const ok = await sendRequest(member.userId);
      if (ok) toast.success("تم إرسال طلب الصداقة");
      else toast.error("تعذّر إرسال الطلب");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div dir="rtl" className="relative min-h-screen bg-alpha-base">
      <CopticWatermark />

      <header className="sticky top-0 z-40 border-b border-alpha bg-alpha-surface-glass/95 px-5 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            aria-label="رجوع"
            className="grid h-10 w-10 place-items-center rounded-full border border-alpha active:scale-95"
          >
            <ArrowRight className="h-5 w-5 text-alpha-muted" />
          </button>
          <h1 className="flex-1 text-center text-[20px] font-extrabold text-alpha-heading">
            اكتشف أعضاء Alpha
          </h1>
          <div className="w-10" />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-alpha-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو Alpha ID"
            className="w-full rounded-[16px] border border-alpha bg-alpha-base py-3.5 pl-4 pr-11 text-[15px] font-bold text-alpha-heading placeholder:text-alpha-muted outline-none focus:border-alpha-gold-bright/45"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2.5 text-[14px] font-extrabold transition active:scale-95",
                  active
                    ? "border-alpha-gold-bright/50 bg-alpha-gold-bright/15 text-alpha-gold-deep"
                    : "border-alpha bg-alpha-surface text-alpha-muted",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-5 pb-32 pt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-alpha-glyph" />
          </div>
        ) : (
          <>
            {!query.trim() && newMembersCarousel.length > 0 ? (
              <DiscoverNewMembersCarousel
                members={newMembersCarousel}
                onOpen={openMember}
                onAdd={(member) => void onAdd(member)}
                busyId={busyId}
              />
            ) : null}

            {visible.length === 0 ? (
              <div className="rounded-[20px] border border-alpha bg-alpha-surface px-5 py-10 text-center">
                <p className="text-[16px] font-extrabold text-alpha-heading">لا يوجد أعضاء مطابقون</p>
                <p className="mt-2 text-[14px] font-medium text-alpha-muted">جرّب تبويباً آخر أو عدّل البحث</p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-4 rounded-full border border-alpha-gold-bright/40 px-5 py-2 text-[14px] font-extrabold text-alpha-gold-deep"
                >
                  تحديث
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[20px] border border-alpha bg-alpha-surface shadow-[var(--alpha-shadow-mini)]">
                {visible.map((member) => (
                  <DiscoverMemberRow
                    key={member.userId}
                    member={member}
                    onOpen={() => openMember(member)}
                    onAdd={() => void onAdd(member)}
                    busy={busyId === member.userId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomDock />

      <CommunityMemberQuickSheet
        member={preview}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdded={() => void refresh()}
      />
    </div>
  );
}
