import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation/AlphaHeader";
import { PROFILE_BUILD_STEP } from "../profile-build-step";
import { ProfileCollection } from "./ProfileCollection";
import { ProfileFriends } from "./ProfileFriends";
import { ProfileHeroV3 } from "./ProfileHeroV3";
import { ProfileJourney } from "./ProfileJourney";
import { ProfileMembershipCardV3 } from "./ProfileMembershipCardV3";
import { ProfileMore } from "./ProfileMore";
import { ProfileMyChurch } from "./ProfileMyChurch";
import { ProfilePrayerSection } from "./ProfilePrayerSection";
import { ProfileSection } from "./shared";

export function ProfileV3Screen() {
  const step = PROFILE_BUILD_STEP;

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      <CopticWatermark tone="light" />

      <AlphaHeaderShell
        sticky
        className="z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(251,243,225,0.92) 0%, rgba(244,234,216,0.5) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <AlphaHeader variant="main" title="الملف الشخصي" />
      </AlphaHeaderShell>

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        {/* §1 Hero */}
        <ProfileHeroV3 />

        {step >= 2 && <ProfileMembershipCardV3 />}

        {step >= 3 && (
          <ProfileSection title="كنيستي">
            <ProfileMyChurch />
          </ProfileSection>
        )}

        {step >= 4 && (
          <ProfileSection title="الأصدقاء">
            <ProfileFriends />
          </ProfileSection>
        )}

        {step >= 5 && (
          <ProfileSection title="طلبات الصلاة">
            <ProfilePrayerSection />
          </ProfileSection>
        )}

        {step >= 6 && (
          <ProfileSection title="مجموعتي">
            <ProfileCollection />
          </ProfileSection>
        )}

        {step >= 7 && (
          <ProfileSection title="رحلتي">
            <ProfileJourney />
          </ProfileSection>
        )}

        {step >= 8 && (
          <ProfileSection title="المزيد">
            <ProfileMore />
          </ProfileSection>
        )}

        {step < 8 && (
          <p className="mt-10 text-center text-[10px] text-[#b8893a]/80 font-semibold">
            مراجعة القسم {step} من 8
          </p>
        )}

        {step >= 8 && (
          <p className="mt-8 text-center text-[10px] text-[#9a7e5a]">
            ⲁⲗⲫⲁ · Alpha Coptic · هويتك الروحية
          </p>
        )}
      </div>

      <BottomDock />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
