// Future Supabase-bound types. UI is built against these shapes.

export type Member = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  color: string; // tailwind-style hue identifier for the placeholder avatar
};

export type Priest = {
  id: string;
  name: string;
  imageUrl: string;
  phone: string;
};

export type Church = {
  id: string;
  name: string;
  diocese: string;
  imageUrl: string;
  coverImageUrl: string;
  greeting: string;
  status: "online" | "offline";
  memberCount: number;
  servantCount: number;
  priestCount: number;
  priest: Priest;
};

export type Comment = {
  id: string;
  member: Member;
  text: string;
  timeAgo: string;
  emoji?: string;
};

export type CategoryKey =
  | "urgent"
  | "meeting"
  | "trip"
  | "prayer"
  | "celebration"
  | "condolence"
  | "reflection";

type PostBase = {
  id: string;
  imageUrl: string;
  title: string;
  timeAgo: string;
  participants: Member[];
  participantsCount: number;
};

export type UrgentPost = PostBase & {
  kind: "urgent";
  description: string;
  date: string;
  time: string;
};

export type MeetingPost = PostBase & {
  kind: "meeting";
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
};

export type TripPost = PostBase & {
  kind: "trip";
  date: string;
  cost: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
};

export type PrayerPost = PostBase & {
  kind: "prayer";
  description: string;
  prayedCount: number;
  commentsCount: number;
  comments: Comment[];
};

export type CelebrationPost = PostBase & {
  kind: "celebration";
  description: string;
  congratulationsCount: number;
  comments: Comment[];
};

export type CondolencePost = PostBase & {
  kind: "condolence";
  description: string;
  comments: Comment[];
};

export type FeedPost =
  | UrgentPost
  | MeetingPost
  | TripPost
  | PrayerPost
  | CelebrationPost
  | CondolencePost;
