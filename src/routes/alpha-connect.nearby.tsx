import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Users } from "lucide-react";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { AlphaConnectLogo } from "@/components/alpha/AlphaConnectLogo";
import { useNearbyMembers } from "@/features/nearby-members";
import {
  NearbyMemberRow,
  NearbyOptInBanner,
  NearbyRefreshButton,
  NearbySourceStrip,
} from "@/features/nearby-members/components/NearbyMemberRow";
import { useMemo, useState } from "react";
import type { NearbyMember } from "@/features/nearby-members";
import { emptyAlphaConnectSearch } from "@/features/alpha-connect/alpha-connect-nav";

export const Route = createFileRoute("/alpha-connect/nearby")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الأعضاء القريبون" },
      { name: "description", content: "اكتشاف أعضاء Alpha القريبين بأمان." },
    ],
  }),
  component: NearbyMembersScreen,
});

function NearbyMembersScreen() {
  const navigate = useNavigate();
  const {
    members,
    loading,
    error,
    discoverable,
    usingGps,
    refresh,
    enableDiscovery,
    disableDiscovery,
  } = useNearbyMembers();
  const [query, setQuery] = useState("");
  const [enabling, setEnabling] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.displayName.includes(q) ||
        m.churchName.includes(q) ||
        m.alphaIdShort.includes(q.toUpperCase()),
    );
  }, [members, query]);

  const onEnable = async () => {
    setEnabling(true);
    try {
      await enableDiscovery();
    } finally {
      setEnabling(false);
    }
  };

  const onMessage = (member: NearbyMember) => {
    void navigate({
      to: "/alpha-connect",
      search: { tab: "messages", chat: member.userId },
    });
  };

  return (
    <AlphaScreenFrame className="alpha-connect-theme alpha-connect-theme--secure min-h-dvh">
      <div className="relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-5 pb-10 pt-[max(env(safe-area-inset-top),12px)]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/alpha-connect"
            search={emptyAlphaConnectSearch()}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/10 text-foreground active:scale-95"
            aria-label="رجوع"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex flex-col items-center flex-1 min-w-0">
            <AlphaConnectLogo size="sm" />
            <h1 className="mt-1 text-[15px] font-extrabold truncate">الأعضاء القريبون</h1>
            <p className="text-[10px] text-muted-foreground">Alpha Connect · ALPHA-099</p>
          </div>
          <NearbyRefreshButton onRefresh={() => void refresh()} loading={loading} />
        </header>

        <NearbySourceStrip usingGps={usingGps && discoverable} />

        {!discoverable ? (
          <div className="mt-4">
            <NearbyOptInBanner onEnable={() => void onEnable()} loading={enabling} />
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="بحث بالاسم أو Alpha ID"
                  className="h-10 w-full rounded-2xl border border-white/10 bg-white/5 pr-10 pl-3 text-[12px] outline-none focus:border-neon-green/40"
                />
              </div>
              <button
                type="button"
                onClick={() => void disableDiscovery()}
                className="shrink-0 text-[10px] font-bold text-muted-foreground underline"
              >
                إيقاف الظهور
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[11px] font-bold text-red-200">
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="mt-8 text-center text-[12px] text-muted-foreground">جاري البحث عن الأعضاء القريبين...</p>
            ) : filtered.length === 0 ? (
              <div className="mt-8 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-3 text-[13px] font-bold">لا يوجد أعضاء قريبون الآن</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  داخل الكنيسة أو الاجتماعات — فعّل الظهور على جهازك وعلى أجهزة الآخرين.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {filtered.map((member) => (
                  <NearbyMemberRow
                    key={member.userId}
                    member={member}
                    onChanged={() => void refresh()}
                    onMessage={onMessage}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-[9.5px] text-muted-foreground/80 leading-relaxed px-4">
          لا يتم مشاركة رقم الهاتف · Alpha ID فقط · نفس الكنيسة · يمكن تعطيل الظهور من إعدادات Alpha Connect
        </p>
      </div>
    </AlphaScreenFrame>
  );
}
