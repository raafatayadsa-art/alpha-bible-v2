import type { ShieldRole } from "@/components/alpha/AlphaShield";
import type { ChurchPost } from "@/data/church-posts";
import type { PrayerRequest } from "@/data/prayer-requests";

export type ProfileMember = {
  displayName: string;
  username: string;
  role: ShieldRole;
  membershipLabel: string;
  churchName: string;
  diocese: string;
  churchRole: string;
  churchImage: string;
  coverImage: string;
  avatarUrl?: string;
  verified: boolean;
  joinDate: string;
};

export type ProfileFriend = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  role: ShieldRole;
};

export type ProfileJourneyEvent = {
  id: string;
  title: string;
  date: string;
  accent: "gold" | "green" | "purple" | "blue";
};

export type ProfileCollectionItem = {
  id: string;
  refType: "church_post";
  refId: string;
  addedByName: string;
  addedAgo: string;
  addedAt: number;
};

export type ProfileCollectionEntry = ProfileCollectionItem & {
  post: ChurchPost | null;
};

export type ProfilePrayerEntry = PrayerRequest & {
  approved: boolean;
};
