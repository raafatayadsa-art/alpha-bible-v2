import {
  BookOpenCheck,
  CalendarDays,
  Heart,
  HelpCircle,
  Settings,
  Share2,
  Sun,
} from "lucide-react";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { usePlatformModules } from "@/lib/platform-modules";
import { ProfileSectionList, type ProfileSectionItem } from "./ProfileSectionList";

export function ProfileServicesSection() {
  const { isModuleEnabled } = usePlatformModules();
  const donationsOn = isModuleEnabled("donations");

  const shareApp = () => {
    void openAlphaShareSheet({
      title: "Alpha Bible",
      body: "تطبيق Alpha Bible — الكتاب المقدس والمجتمع الكنسي والحياة الروحية في مكان واحد.",
      meta: "alpha-bible.app",
    });
  };

  const items: ProfileSectionItem[] = [
    { id: "events", label: "أحداث", subtitle: "الأعياد والمناسبات", to: "/feasts", icon: CalendarDays, accent: "#c98a3c" },
    { id: "verse", label: "آية اليوم", subtitle: "قراءة يومية", to: "/bible/today", icon: Sun, accent: "#d8a83a" },
    ...(donationsOn
      ? [{ id: "donate", label: "تبرع", subtitle: "ادعم رسالة Alpha", to: "/donate", icon: Heart, accent: "#c44569" } satisfies ProfileSectionItem]
      : []),
    { id: "share", label: "شارك التطبيق", subtitle: "Alpha Bible", onClick: shareApp, icon: Share2, accent: "#5b8fd1" },
    { id: "reading", label: "إعدادات القراءة", subtitle: "خط · حواشي · حفظ آخر قراءة", to: "/settings/reading", icon: BookOpenCheck, accent: "#1f8a5a" },
    { id: "settings", label: "الإعدادات", subtitle: "أمان · خصوصية · مظهر", to: "/settings", icon: Settings, accent: "#8a6ec1" },
    { id: "help", label: "مساعدة وثقة", subtitle: "الدعم والسياسات", to: "/settings/trust", icon: HelpCircle, accent: "#6a543a" },
  ];

  return <ProfileSectionList title="المزيد والخدمات" items={items} />;
};
