export type NotifCategory =
  | "prayer"
  | "prayer-comment"
  | "encouragement"
  | "post"
  | "announcement"
  | "meeting"
  | "live"
  | "service"
  | "message"
  | "membership";

export type NotifScope = "spiritual" | "church" | "community" | "system";

export type ChurchNotification = {
  id: string;
  category: NotifCategory;
  scope?: NotifScope;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href: string;
};
