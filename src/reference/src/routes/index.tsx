import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/alpha/PhoneFrame";
import { ChurchHeaderCard } from "@/components/alpha/ChurchHeaderCard";
import { CategoryRow } from "@/components/alpha/CategoryRow";
import { BottomTabBar } from "@/components/alpha/BottomTabBar";
import {
  UrgentCard,
  MeetingCard,
  TripCard,
  PrayerCard,
  CelebrationCard,
  CondolenceCard,
} from "@/components/alpha/cards";
import {
  church,
  urgent,
  meeting,
  trip,
  prayer,
  celebration,
  condolence,
} from "@/components/alpha/sample-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ألفا بايبل — كنيستي" },
      {
        name: "description",
        content:
          "الصفحة اليومية لأبناء كنيسة العذراء مريم: إعلانات، اجتماعات، رحلات، طلبات صلاة، تهانٍ وتعازي.",
      },
      { property: "og:title", content: "ألفا بايبل — كنيستي" },
      {
        property: "og:description",
        content: "تجربة الكنيسة اليومية على ألفا بايبل.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PhoneFrame tabBar={<BottomTabBar />}>
      <ChurchHeaderCard church={church} />
      <CategoryRow active="urgent" />

      <div className="flex flex-col gap-2 mt-2">
        <UrgentCard post={urgent} />
        <MeetingCard post={meeting} />
        <TripCard post={trip} />
        <PrayerCard post={prayer} />
        <CelebrationCard post={celebration} />
        <CondolenceCard post={condolence} />
      </div>
    </PhoneFrame>
  );
}

