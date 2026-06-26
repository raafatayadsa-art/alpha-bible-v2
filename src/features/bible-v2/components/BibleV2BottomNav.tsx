import { BibleBottomNavigation } from "@/features/bible-home/components/BibleBottomNavigation";

/** Canonical Bible bottom nav — center tab on `/bible`, books on `/books`. */
export function BibleV2BottomNav() {
  return <BibleBottomNavigation biblePath="/bible" booksPrefix="/books" />;
}
