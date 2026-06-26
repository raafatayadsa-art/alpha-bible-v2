import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  BookOpen,
  Clock,
  Lightbulb,
  Map,
  MapPin,
  NotebookPen,
  Search,
  Users,
} from "lucide-react";

export type FeatureCardAction = "search" | "navigate";

export type FeatureCardData = {
  id: string;
  title: string;
  icon: LucideIcon;
  action: FeatureCardAction;
  route?: string;
  search?: Record<string, string>;
};

/** RTL visual order: row 1 R→L, row 2 R→L per reference image */
export const featureCardsData: FeatureCardData[] = [
  { id: "search", title: "البحث في الكتاب", icon: Search, action: "search" },
  { id: "journey", title: "رحلتي مع الكتاب", icon: Map, action: "navigate", route: "/bible/journey" },
  { id: "psalms", title: "المزامير", icon: BookOpen, action: "navigate", route: "/bible/psalms" },
  { id: "saved", title: "الآيات المحفوظة", icon: Bookmark, action: "navigate", route: "/bible/saved" },
  { id: "notes", title: "ملاحظات وتأملات", icon: NotebookPen, action: "navigate", route: "/bible/notes" },
  { id: "characters", title: "الشخصيات", icon: Users, action: "navigate", route: "/bible/characters" },
  { id: "timeline", title: "الخط الزمني", icon: Clock, action: "navigate", route: "/bible/timeline" },
  { id: "map", title: "خريطة الأماكن", icon: MapPin, action: "navigate", route: "/bible/places" },
  { id: "qa", title: "أسئلة وأجوبة", icon: Lightbulb, action: "navigate", route: "/bible/questions" },
];
