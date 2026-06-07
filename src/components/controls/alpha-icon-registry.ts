/** Canonical Alpha domain icons — inner glyph from AlphaGlyph SVG family only. */
export type AlphaIconKind =
  | "home"
  | "bible"
  | "agpeya"
  | "prayer"
  | "katameros"
  | "synaxarium"
  | "church"
  | "library"
  | "audio"
  | "children"
  | "meetings"
  | "family"
  | "notifications"
  | "settings"
  | "profile"
  | "security"
  | "appearance"
  | "storage"
  | "support"
  | "accessibility"
  | "reminders"
  | "service"
  | "personal"
  | "community";

export type AlphaIconSize = "xs" | "sm" | "md" | "lg";

export const ALPHA_ICON_SIZES: Record<AlphaIconSize, { shell: number; glyph: number }> = {
  xs: { shell: 36, glyph: 16 },
  sm: { shell: 40, glyph: 18 },
  md: { shell: 44, glyph: 20 },
  lg: { shell: 52, glyph: 22 },
};

export type AlphaIconDef = {
  accent: string;
  label: string;
};

export const ALPHA_ICON_REGISTRY: Record<AlphaIconKind, AlphaIconDef> = {
  home: { accent: "#b8893a", label: "الرئيسية" },
  bible: { accent: "#8a6ec1", label: "الكتاب المقدس" },
  agpeya: { accent: "#1f8a5a", label: "الأجبية" },
  prayer: { accent: "#c98a3c", label: "الصلاة" },
  katameros: { accent: "#4a9e6e", label: "القطمارس" },
  synaxarium: { accent: "#c98a3c", label: "السنكسار" },
  church: { accent: "#5b8fd1", label: "الكنيسة" },
  library: { accent: "#6a4ab5", label: "المكتبة" },
  audio: { accent: "#c44569", label: "الصوتيات" },
  children: { accent: "#e8b84a", label: "الأطفال" },
  meetings: { accent: "#5b8fd1", label: "الاجتماعات" },
  family: { accent: "#a07ec4", label: "العائلة" },
  notifications: { accent: "#c98a3c", label: "الإشعارات" },
  settings: { accent: "#3f9d6e", label: "الإعدادات" },
  profile: { accent: "#4a86c1", label: "الملف الشخصي" },
  security: { accent: "#3f9d6e", label: "الخصوصية والأمان" },
  appearance: { accent: "#d8a83a", label: "المظهر والقراءة" },
  storage: { accent: "#6a543a", label: "التخزين والبيانات" },
  support: { accent: "#b8893a", label: "الدعم وحول Alpha" },
  accessibility: { accent: "#7a5c9e", label: "إمكانية الوصول" },
  reminders: { accent: "#1f8a5a", label: "الصلاة والتذكيرات" },
  service: { accent: "#a07ec4", label: "خدمتي" },
  personal: { accent: "#4a86c1", label: "البيانات الشخصية" },
  community: { accent: "#a07ec4", label: "المجتمع" },
};

export function getAlphaIcon(kind: AlphaIconKind): AlphaIconDef {
  return ALPHA_ICON_REGISTRY[kind];
}
