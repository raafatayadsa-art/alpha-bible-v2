import { BibleBottomNavigation } from "@/features/bible-home/components/BibleBottomNavigation";

/** Bible 2 — same tabs as Bible 1; center tab stays on `/bible-2`. */
export function BibleV2BottomNav() {
  return <BibleBottomNavigation biblePath="/bible-2" booksPrefix="/books-v2" />;
}
