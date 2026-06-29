import { useMemo, useState } from "react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { CalendarDays, Church, Luggage, Users, UserRound } from "lucide-react";
import { usePlatformModules } from "@/lib/platform-modules";
import { listPilgrimagePassport } from "@/features/church/trip-reservations/pilgrimage-passport";
import { useCommunityFriends } from "@/features/community/community-friends-store";
import { useProfilePeopleLinks } from "./profile-people-store";
import { useProfileMembershipData } from "./useProfileMembershipData";
import { useProfileAffiliationStatus } from "./profile-membership-status";
import { useProfileActivitySummary } from "./useProfileActivitySummary";
import { ProfileSimpleHeader } from "./ProfileSimpleHeader";
import { ProfileMyActivityCard } from "./ProfileMyActivityCard";
import { ProfileSectionList } from "./ProfileSectionList";
import { ProfileMembershipEntryCard } from "./ProfileMembershipEntryCard";
import { ProfileSuggestedFriendsSection } from "./ProfileSuggestedFriendsSection";
import { AddProfilePersonSheet } from "./AddProfilePersonSheet";
import { resolveProfileAvatar, useProfileUser } from "./profile-user-store";
import { isFieldVisibleOnProfile } from "./profile-privacy";
import { getChurchShieldRoleSync } from "@/features/auth";
import { COMMUNITY_ROUTES } from "@/features/community/community-routes";

export function ProfilePremiumScreen() {
  const m = useProfileMembershipData();
  const { status, loading: affiliationLoading, isApproved } = useProfileAffiliationStatus();
  const activitySummary = useProfileActivitySummary();
  const { isModuleEnabled } = usePlatformModules();
  const communityOn = isModuleEnabled("community");
  const tripsOn = isModuleEnabled("trips");
  const reservationsOn = isModuleEnabled("reservations");
  const { state: profileUser } = useProfileUser();
  const { family: familyLinks } = useProfilePeopleLinks();
  const { friends: communityFriends } = useCommunityFriends();
  const [familySheetOpen, setFamilySheetOpen] = useState(false);

  const displayAvatar = isFieldVisibleOnProfile(profileUser.privacy.avatar)
    ? resolveProfileAvatar(profileUser.customAvatarUrl, m.avatarUrl)
    : "";

  const churchShield = getChurchShieldRoleSync();
  const shieldRole = isApproved ? (churchShield ?? "member") : null;
  const trips = listPilgrimagePassport();

  const churchLifeItems = useMemo(() => {
    if (!communityOn) return [];
    const items = [];
    if (isFieldVisibleOnProfile(profileUser.privacy.church)) {
      items.push({
        id: "church",
        label: "كنيستي",
        subtitle: m.churchName,
        to: "/church",
        icon: Church,
        accent: "#5b8fd1",
      });
    }
    if (isFieldVisibleOnProfile(profileUser.privacy.family)) {
      items.push({
        id: "family",
        label: "العائلة",
        subtitle: `${familyLinks.length} فرد`,
        onClick: () => setFamilySheetOpen(true),
        icon: UserRound,
        accent: "#8a6ec1",
        badge: familyLinks.length ? String(familyLinks.length) : undefined,
      });
    }
    if (isFieldVisibleOnProfile(profileUser.privacy.peopleConnect)) {
      items.push({
        id: "connected",
        label: "الأشخاص المتصلون",
        subtitle: "اكتشف وأضف أعضاء Alpha",
        to: COMMUNITY_ROUTES.discover,
        icon: Users,
        accent: "#1f8a5a",
        badge: communityFriends.length ? String(communityFriends.length) : undefined,
      });
    }
    return items;
  }, [communityOn, profileUser.privacy, m.churchName, familyLinks.length, communityFriends.length]);

  const activityItems = useMemo(() => {
    const items = [];
    if (tripsOn) {
      items.push({
        id: "trips",
        label: "الرحلات السابقة",
        subtitle: trips.length ? `${trips.length} رحلة` : "لا توجد رحلات بعد",
        to: "/church",
        icon: Luggage,
        accent: "#c98a3c",
      });
    }
    if (reservationsOn) {
      items.push({
        id: "reservations",
        label: "الحجوزات",
        subtitle: "عرض حجوزاتك",
        to: "/church",
        icon: CalendarDays,
        accent: "#1f8a5a",
      });
    }
    return items;
  }, [tripsOn, reservationsOn, trips.length]);

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base">
      <CopticWatermark />

      <main className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-max-width)] px-5 pb-36">
        <ProfileSimpleHeader
          name={m.displayName}
          avatarUrl={displayAvatar}
          alphaId={m.alphaId}
          churchName={m.churchName}
          affiliation={status}
          affiliationLoading={affiliationLoading}
          shieldRole={shieldRole}
          showShield={isApproved && Boolean(shieldRole)}
        />

        {isFieldVisibleOnProfile(profileUser.privacy.spiritualStats) ? (
          <ProfileMyActivityCard summary={activitySummary} />
        ) : null}

        {communityOn ? (
          <ProfileSuggestedFriendsSection />
        ) : null}

        <ProfileSectionList title="حياتي الكنسية" items={churchLifeItems} />
        <ProfileSectionList title="أنشطتي" items={activityItems} />

        {isApproved ? <ProfileMembershipEntryCard /> : null}

        <p className="mt-4 pb-2 text-center text-[11px] text-alpha-muted">ⲁⲗⲫⲁ · Alpha Coptic</p>
      </main>

      <BottomDock />

      <AddProfilePersonSheet
        open={familySheetOpen}
        variant="family"
        onClose={() => setFamilySheetOpen(false)}
        onAdded={() => setFamilySheetOpen(false)}
      />
    </div>
  );
}
