import { useCallback, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Loader2, QrCode, Search, Share2 } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { PrayerUserAvatar } from "@/features/prayer/prayer-avatars";
import { toast } from "sonner";
import { CommunityAddFriendMethodsPanel } from "./CommunityAddFriendMethodsPanel";
import { CommunityPendingRequests } from "./CommunityPendingRequests";
import { useCommunityFriends } from "./community-friends-store";
import { sendFriendRequestFromUserId } from "./community-friends-api";
import { useCommunityPeopleSuggestions } from "./use-community-people-suggestions";
import { resolvePersonFromCode } from "@/features/profile/profile-people-resolve";
import { useProfileMembershipData } from "@/features/profile/useProfileMembershipData";
import { COMMUNITY_ROUTES } from "./community-routes";

type Tab = "suggestions" | "pending";

export function CommunityAddFriendScreen() {
  const [tab, setTab] = useState<Tab>("suggestions");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [methodsOpen, setMethodsOpen] = useState(false);
  const { friends, refresh } = useCommunityFriends();
  const people = useCommunityPeopleSuggestions(20);
  const m = useProfileMembershipData();

  const filteredPeople = useMemo(() => {
    const friendIds = new Set(friends.map((f) => f.linkedUserId).filter(Boolean));
    const friendNames = new Set(friends.map((f) => f.name.trim()));
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (friendIds.has(p.id) || friendNames.has(p.name.trim())) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [people, friends, query]);

  const sendRequest = useCallback(
    async (userId: string, name: string) => {
      setBusyId(userId);
      try {
        const outcome = await sendFriendRequestFromUserId(userId, "طلب صداقة من أضف أصدقاء");
        if (outcome === "sent") {
          toast.success(`تم إرسال طلب صداقة إلى ${name}`);
          await refresh();
          return true;
        }
        if (outcome === "invalid") {
          toast.error("تعذّر إرسال الطلب — معرّف غير صالح");
          return false;
        }
        toast.error("تعذّر إرسال الطلب");
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  const addSuggestion = useCallback(
    (person: (typeof filteredPeople)[number]) => {
      void sendRequest(person.id, person.name);
    },
    [sendRequest],
  );

  const addByQuery = useCallback(async () => {
    const code = query.trim();
    if (!code) return;
    setBusy(true);
    try {
      const person = await resolvePersonFromCode(code);
      if (!person?.linkedUserId) {
        toast.error("لم يُعثر على العضو");
        return;
      }
      const ok = await sendRequest(person.linkedUserId, person.name);
      if (ok) setQuery("");
    } finally {
      setBusy(false);
    }
  }, [query, sendRequest]);

  const shareProfile = async () => {
    const text = `${m.displayName}\nAlpha ID: ${m.alphaId}\n${m.qrPayload}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ملفي على Alpha", text });
        return;
      }
      await navigator.clipboard?.writeText(text);
      toast.success("تم نسخ المعرف");
    } catch {
      /* cancelled */
    }
  };

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center gap-3 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <Link
            to="/community"
            aria-label="رجوع"
            className="alpha-chrome-btn grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-95"
          >
            <ArrowRight className="h-5 w-5 text-alpha" strokeWidth={2.1} />
          </Link>
          <h1 className="flex-1 text-center text-[17px] font-extrabold text-alpha-heading">أضف أصدقاء</h1>
          <Link
            to={COMMUNITY_ROUTES.discover}
            className="shrink-0 rounded-full border border-alpha/35 px-3 py-1.5 text-[10px] font-extrabold text-alpha-gold-deep active:scale-95"
          >
            اكتشف
          </Link>
        </header>

        <div className="flex items-center gap-2 rounded-2xl border border-alpha/35 bg-white/80 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-alpha-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void addByQuery();
            }}
            placeholder="الاسم أو Alpha ID"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
          />
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-alpha-muted" /> : null}
        </div>

        <div className="mt-3 flex gap-2">
          {(
            [
              { id: "suggestions" as const, label: "أشخاص قد تعرفهم" },
              { id: "pending" as const, label: "معلق" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "flex-1 rounded-full px-3 py-2 text-[11px] font-extrabold transition active:scale-[0.98] " +
                (tab === t.id
                  ? "bg-alpha-heading text-white"
                  : "border border-alpha/30 bg-white/70 text-alpha-muted")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "pending" ? (
          <div className="mt-4">
            <CommunityPendingRequests onChanged={refresh} />
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {filteredPeople.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-3 rounded-[18px] border border-alpha/30 bg-white/82 px-3 py-3"
              >
                <PrayerUserAvatar name={person.name} avatarUrl={person.avatarUrl} size="md" />
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[14px] font-extrabold text-alpha-heading">{person.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-alpha-muted">{person.role}</p>
                </div>
                <button
                  type="button"
                  disabled={busy || busyId === person.id}
                  onClick={() => addSuggestion(person)}
                  className="rounded-full border border-alpha/35 bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_90%,white)] px-3 py-1.5 text-[11px] font-extrabold text-alpha-heading active:scale-95 disabled:opacity-50"
                >
                  {busyId === person.id ? "…" : "إضافة"}
                </button>
              </li>
            ))}
            {!filteredPeople.length ? (
              <p className="py-8 text-center text-[12px] text-alpha-muted">
                لا اقتراحات حالياً —{" "}
                <Link to={COMMUNITY_ROUTES.discover} className="font-extrabold text-alpha-gold-deep">
                  اكتشف أعضاء
                </Link>
              </p>
            ) : null}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setMethodsOpen((v) => !v)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-alpha/35 bg-white/70 px-4 py-3 text-[12px] font-extrabold text-alpha-heading active:scale-[0.99]"
        >
          <ChevronDown className={cnIcon(methodsOpen)} />
          <span className="inline-flex items-center gap-2">
            <QrCode className="h-4 w-4 text-alpha-gold-deep" />
            طرق أخرى (QR · كنيسة · موبايل)
          </span>
        </button>

        {methodsOpen ? (
          <div className="mt-3">
            <CommunityAddFriendMethodsPanel compact showShareSection={false} onAdded={refresh} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void shareProfile()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#c44569] to-[#8b2942] px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(196,69,105,0.45)] active:scale-[0.98]"
        >
          <Share2 className="h-4 w-4" />
          مشاركة ملفي الشخصي
        </button>
      </div>

      <BottomDock />
    </div>
  );
}

function cnIcon(open: boolean) {
  return "h-4 w-4 text-alpha-muted transition " + (open ? "rotate-180" : "");
}
