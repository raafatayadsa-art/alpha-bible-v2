import type { LucideIcon } from "lucide-react";
import { BarChart3, Bookmark, FilePen, Star } from "lucide-react";

export type QuickToolTone = "gold" | "navy";

export type BibleV2QuickToolAction =
  | {
      kind: "navigate";
      to: string;
      params?: Record<string, string>;
      search?: Record<string, string>;
    }
  | { kind: "soon" };

export type BibleV2QuickToolDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: QuickToolTone;
  action: BibleV2QuickToolAction;
};

/** Bible 2 quick tools — extend this list to add tools without layout changes. */
export const bibleV2QuickTools: BibleV2QuickToolDef[] = [
  {
    id: "saved",
    label: "المحفوظات",
    icon: Star,
    tone: "gold",
    action: { kind: "navigate", to: "/bible/saved", search: { from: "bible-2" } },
  },
  {
    id: "notes",
    label: "ملاحظاتي",
    icon: FilePen,
    tone: "navy",
    action: { kind: "navigate", to: "/bible/notes", search: { from: "bible-2" } },
  },
  {
    id: "bookmarks",
    label: "العلامات المرجعية",
    icon: Bookmark,
    tone: "navy",
    action: { kind: "soon" },
  },
  {
    id: "reading-plan",
    label: "خطة القراءة",
    icon: BarChart3,
    tone: "gold",
    action: { kind: "soon" },
  },
];
