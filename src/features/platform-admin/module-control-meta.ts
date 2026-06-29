import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bus,
  CalendarDays,
  Church,
  HandHeart,
  Headphones,
  MessageCircle,
  Sparkles,
  Baby,
  ScrollText,
  Music2,
  Ticket,
} from "lucide-react";
import type { PlatformModuleKey } from "./platform-store";
import { MC } from "./platform-store";

export type ModuleControlMeta = {
  icon: LucideIcon;
  accent: string;
  scopeAr: string;
};

export const MODULE_CONTROL_META: Record<PlatformModuleKey, ModuleControlMeta> = {
  bible: {
    icon: BookOpen,
    accent: MC.purple,
    scopeAr: "الكتاب المقدس، الفصول، الحفظ، الرحلة، البحث في الكتاب",
  },
  agpeya: {
    icon: ScrollText,
    accent: MC.gold,
    scopeAr: "الأجبية وصلوات السبع ساعات واختصار الشريط السفلي",
  },
  kholagy: {
    icon: Music2,
    accent: "#9b7ec8",
    scopeAr: "الخولاجي المقدس والتسبحة من الرئيسية والتنقل",
  },
  synaxarium: {
    icon: Church,
    accent: "#a85450",
    scopeAr: "السنكسار وسير القديسين",
  },
  katameros: {
    icon: CalendarDays,
    accent: MC.green,
    scopeAr: "القطمارس وقراءات اليوم",
  },
  audio: {
    icon: Headphones,
    accent: "#c44569",
    scopeAr: "الصوتيات والناشرين والمكتبة الصوتية",
  },
  kids: {
    icon: Baby,
    accent: "#e8b84a",
    scopeAr: "قسم الأطفال بالكامل",
  },
  meditations: {
    icon: Sparkles,
    accent: MC.cyan,
    scopeAr: "التأملات والرحلات الروحية",
  },
  community: {
    icon: Church,
    accent: "#1f8a5a",
    scopeAr: "المجتمع، الكنيسة، الأخبار، الدليل، طلبات الصلاة، الملف الكنسي",
  },
  messaging: {
    icon: MessageCircle,
    accent: "#34C759",
    scopeAr: "ألفا كونكت، الرسائل، المكالمات، القنوات",
  },
  trips: {
    icon: Bus,
    accent: "#5b8fd1",
    scopeAr: "رحلات الكنيسة، الحجز، قنوات الرحلة، بطاقات الرحلة في الرئيسية",
  },
  reservations: {
    icon: Ticket,
    accent: MC.steel,
    scopeAr: "نظام الحجوزات (قيد التطوير)",
  },
  donations: {
    icon: HandHeart,
    accent: "#c98a3c",
    scopeAr: "التبرعات وصفحات العطاء",
  },
};
