import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Church, MapPin, Sparkles } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { HeroBadgeEmblem, HeroCompactLedgerCell, HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { getCurrentUser } from "@/features/church/current-user";
import { listPilgrimagePassport } from "@/features/church/trip-reservations/pilgrimage-passport";
import { getFamilyProfile } from "@/features/church/trip-reservations/family-booking";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { useMemberChurch } from "@/features/church/use-member-church";
import { ProfileHeroV3 } from "./ProfileHeroV3";
import { ProfileActivityLedger } from "./ProfileActivityLedger";
import { CollapsiblePeopleOrbit } from "./CollapsiblePeopleOrbit";
import { ProfilePublisherRepostsSection } from "./ProfilePublisherRepostsSection";
import { ProfileContentRepostsSection } from "./ProfileContentRepostsSection";
import { ProfilePremiumShell } from "./ProfilePremiumShell";
import { ProfileTripTimelineSection } from "./ProfileTripTimelineSection";
import { ProfileAchievementsSection } from "./ProfileAchievementsSection";
import { MembershipBarcodeCard } from "./MembershipBarcodeCard";
import { AddProfilePersonSheet } from "./AddProfilePersonSheet";
import { useProfilePeopleLinks } from "./profile-people-store";
import { useProfileMembershipData } from "./useProfileMembershipData";
import { useProfileActivity } from "./useProfileActivity";
import { useProfileUser, resolveProfileAvatar } from "./profile-user-store";
import { formatBirthDateDisplay, formatProfileDate, isFieldVisibleOnProfile } from "./profile-privacy";
import { usePlatformModules } from "@/lib/platform-modules";
import { useResolvedTheme } from "@/lib/alpha-theme";

function monthsSinceJoin(joinedAt: string | null | undefined): number | null {
  if (!joinedAt) return null;
  try {
    const start = new Date(joinedAt).getTime();
    if (Number.isNaN(start)) return null;
    return Math.max(1, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 30.44)));
  } catch {
    return null;
  }
}

function formatTripDate(iso: string) {
  return formatProfileDate(iso) ?? iso;
}

function ChurchInfoCardDark({
  churchId,
  churchName,
  locationLine,
  diocese,
  coverImageUrl,
}: {
  churchId: string | null;
  churchName: string;
  locationLine: string;
  diocese: string | null;
  coverImageUrl: string | null;
}) {
  const accent = "#5b8fd1";
  const cover = coverImageUrl?.trim() || "/profile/profile-church-hero.webp";
  const target = churchId ? "/church" : "/church/directory";

  return (
    <Link
      to={target}
      aria-label={churchName}
      className="group relative mt-3 block active:scale-[0.985] transition-transform"
    >
      <HeroLedgerStylesHost />
      <article
        className="relative h-[188px] w-full overflow-hidden rounded-[22px] border"
        style={{
          borderColor: `${accent}55`,
          background: "#07040f",
          boxShadow:
            "0 22px 44px -16px rgba(0,0,0,0.72), 0 0 0 1px rgba(231,201,122,0.12), 0 0 28px rgba(91,143,209,0.14)",
        }}
      >
        <img
          src={cover}
          alt=""
          aria-hidden
          draggable={false}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[center_38%] saturate-[1.06] contrast-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.04) 34%, rgba(0,0,0,0.18) 58%, rgba(0,0,0,0.9) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-3 pt-2.5">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl border backdrop-blur-md"
            style={{
              borderColor: "rgba(240,215,140,0.35)",
              background: "rgba(42,31,69,0.55)",
              color: "#f0d78c",
            }}
          >
            <Church className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </div>
          <div
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 backdrop-blur-md"
            style={{ borderColor: `${accent}55`, background: "rgba(0,0,0,0.38)" }}
          >
            <Sparkles className="h-3 w-3" style={{ color: accent }} />
            <HeroBadgeEmblem label="كنيسة" compact />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-3 pt-8">
          <h3 className="line-clamp-1 text-right text-[16px] font-extrabold leading-tight text-white">
            {churchName}
          </h3>
          {diocese && diocese !== "—" ? (
            <p className="mt-1 inline-flex w-full items-center justify-end">
              <span className="rounded-full border border-[#f0d78c]/35 bg-black/35 px-2.5 py-0.5 text-[10px] font-bold text-[#f0d78c]/90 backdrop-blur-sm">
                {diocese}
              </span>
            </p>
          ) : null}
          <p className="mt-1 inline-flex w-full items-center justify-end gap-1 text-right text-[11px] font-medium text-white/78">
            <MapPin className="h-3 w-3 text-[#f0d78c]/85" />
            {locationLine || "افتح دليل الكنائس"}
          </p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] font-bold text-white/72 backdrop-blur-sm">
              خدمات · رحلات · فعاليات
            </span>
            <HeroCompactLedgerCell
              label="ادخل"
              sublabel="كنيسة"
              accent={accent}
              className="min-w-[104px] shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ProfilePremiumScreen() {
  const user = getCurrentUser();
  const m = useProfileMembershipData();
  const { isModuleEnabled } = usePlatformModules();
  const isDark = useResolvedTheme() === "dark";
  const communityOn = isModuleEnabled("community");
  const displayName = m.displayName;
  const { church: memberChurch } = useMemberChurch();
  const { posts } = useChurchPosts(memberChurch?.id);
  const { family: familyLinks, connect: connectLinks, refresh: refreshPeople } = useProfilePeopleLinks();
  const [addSheet, setAddSheet] = useState<"family" | "connect" | null>(null);

  const churchName = m.churchName;
  const churchLocation = m.churchLocation;
  const diocese = m.diocese;
  const joinLabel = m.memberSince;

  const familyPeople = useMemo(() => {
    const fromStore = familyLinks.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatarUrl,
    }));
    if (fromStore.length) return fromStore;
    const legacy = getFamilyProfile().members.filter((mem) => mem.name.trim());
    if (legacy.length) {
      return legacy.map((mem) => ({
        id: mem.id,
        name: mem.name,
        avatar: mem.avatarUrl ?? `https://i.pravatar.cc/72?u=fam-${mem.id}`,
      }));
    }
    return [];
  }, [familyLinks]);

  const connectPeople = useMemo(
    () =>
      connectLinks.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatarUrl,
      })),
    [connectLinks],
  );

  const trips = listPilgrimagePassport();
  const lastTrip = trips.length ? trips[trips.length - 1] : null;
  const activity = useProfileActivity(memberChurch?.id, posts);
  const { state: profileUser } = useProfileUser();
  const { privacy } = profileUser;
  const rawAvatar = resolveProfileAvatar(profileUser.customAvatarUrl, user.avatarUrl);
  const displayAvatar = isFieldVisibleOnProfile(privacy.avatar) ? rawAvatar : "";
  const displayBio = isFieldVisibleOnProfile(privacy.bio) && profileUser.bio.trim()
    ? profileUser.bio.trim()
    : null;
  const displayBirth = isFieldVisibleOnProfile(privacy.birthDate)
    ? formatBirthDateDisplay(profileUser.birthDate)
    : null;

  const showChurchUi = communityOn && isFieldVisibleOnProfile(privacy.church);
  const showFamilyUi = communityOn && isFieldVisibleOnProfile(privacy.family);
  const showConnectUi = communityOn && isFieldVisibleOnProfile(privacy.peopleConnect);
  const showSpiritualStats = communityOn && isFieldVisibleOnProfile(privacy.spiritualStats);
  const showAchievements = isFieldVisibleOnProfile(privacy.achievements);

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base"
    >
      <CopticWatermark />

      <ProfilePremiumShell name={displayName} avatarUrl={displayAvatar}>
        <ProfileHeroV3
          name={displayName}
          avatarUrl={displayAvatar}
          verified={m.verified}
          shieldRole={m.shieldRole}
          churchName={churchName}
          diocese={diocese}
          joinLabel={joinLabel}
          tripCount={trips.length}
          familyCount={familyPeople.length || 1}
          memberMonths={monthsSinceJoin(memberChurch?.joinedAt)}
          coverUrl={memberChurch?.coverImageUrl}
          hideTopBar
          alphaId={m.alphaId}
          bio={displayBio}
          birthDate={displayBirth}
          showChurch={showChurchUi}
          showStatsLedger={showSpiritualStats}
          showTripStat={communityOn}
          showFamilyStat={showFamilyUi}
          shieldProfileInfo={{
            churchName,
            diocese,
            memberSince: joinLabel,
            roleLabel: m.roleLabel,
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36 space-y-0">
        {showChurchUi ? (
          <ChurchInfoCardDark
            churchId={memberChurch?.id ?? null}
            churchName={churchName}
            locationLine={churchLocation}
            diocese={diocese !== "—" ? diocese : null}
            coverImageUrl={memberChurch?.coverImageUrl ?? null}
          />
        ) : null}

        {showAchievements ? <ProfileAchievementsSection /> : null}

        <div className="mt-4">
          <MembershipBarcodeCard
            alphaId={m.alphaId}
            qrPayload={m.qrPayload}
            roleLabel={m.roleLabel}
            shieldRole={m.shieldRole}
            userName={displayName}
            userAvatar={rawAvatar}
            churchName={churchName}
            memberSince={joinLabel}
            diocese={diocese}
            showChurchInfo={communityOn}
          />
        </div>

        {showSpiritualStats ? (
          <ProfileActivityLedger
            lastMassTitle={activity.lastMass?.title ?? null}
            lastMassWhen={activity.lastMass?.when ?? null}
            lastMassPostId={activity.lastMass?.postId}
            lastTripTitle={lastTrip?.title ?? null}
            lastTripDate={lastTrip ? formatTripDate(lastTrip.completedAt) : null}
            prayerCount={activity.prayerCount}
            lastPrayerTitle={activity.lastPrayerTitle}
          />
        ) : null}

          {communityOn ? <ProfileTripTimelineSection dark={isDark} /> : null}

          <ProfilePublisherRepostsSection dark={isDark} />
          <ProfileContentRepostsSection dark={isDark} />

          {showFamilyUi ? (
            <CollapsiblePeopleOrbit
              title="أفراد العائلة"
              subtitle="العائلة في Alpha"
              people={
                familyPeople.length
                  ? familyPeople
                  : [{ id: "self", name: displayName, avatar: displayAvatar || user.avatarUrl }]
              }
              addLabel="إضافة فرد"
              accent="#8a6ec1"
              glyph="Ⲁ"
              onAdd={() => setAddSheet("family")}
            />
          ) : null}

        {showConnectUi ? (
          <CollapsiblePeopleOrbit
            title="تواصل مع الأشخاص"
            subtitle="جهات التواصل"
            people={connectPeople}
            addLabel="إضافة جديد"
            accent="#6a4ab5"
            glyph="Ⲱ"
            onAdd={() => setAddSheet("connect")}
          />
        ) : null}

        <p className="mt-8 pb-2 text-center text-[10px] text-alpha-muted">
            ⲁⲗⲫⲁ · Alpha Coptic · إصدار 1.0
          </p>
        </div>
      </ProfilePremiumShell>

      <BottomDock />

      <AddProfilePersonSheet
        open={communityOn && addSheet === "family"}
        variant="family"
        onClose={() => setAddSheet(null)}
        onAdded={() => refreshPeople()}
      />
      <AddProfilePersonSheet
        open={communityOn && addSheet === "connect"}
        variant="connect"
        onClose={() => setAddSheet(null)}
        onAdded={() => refreshPeople()}
      />
    </div>
  );
}
