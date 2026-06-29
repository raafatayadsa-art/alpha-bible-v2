/** Permission keys — permission-based Alpha Control (not role-only). */
export const ADMIN_PERMISSION_KEYS = [
  "users.view",
  "users.edit",
  "users.delete",
  "posts.view",
  "posts.approve",
  "posts.delete",
  "content.view",
  "content.edit",
  "content.publish",
  "churches.view",
  "churches.manage",
  "community.moderate",
  "community.delete",
  "notifications.send",
  "reports.view",
  "analytics.view",
  "security.audit_log",
  "security.sessions",
  "settings.manage",
  "ai.manage",
  "team.view",
  "team.invite",
  "team.edit",
  "team.disable",
  "team.permissions",
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSION_KEYS)[number];

export type AdminPermissionGroup = {
  key: string;
  labelAr: string;
  permissions: { key: AdminPermissionKey; labelAr: string }[];
};

export const ADMIN_PERMISSION_GROUPS: AdminPermissionGroup[] = [
  {
    key: "users",
    labelAr: "المستخدمون",
    permissions: [
      { key: "users.view", labelAr: "عرض المستخدمين" },
      { key: "users.edit", labelAr: "تعديل المستخدمين" },
      { key: "users.delete", labelAr: "حذف المستخدمين" },
    ],
  },
  {
    key: "posts",
    labelAr: "المنشورات",
    permissions: [
      { key: "posts.view", labelAr: "عرض المنشورات" },
      { key: "posts.approve", labelAr: "اعتماد المنشورات" },
      { key: "posts.delete", labelAr: "حذف المنشورات" },
    ],
  },
  {
    key: "content",
    labelAr: "المحتوى",
    permissions: [
      { key: "content.view", labelAr: "عرض المحتوى" },
      { key: "content.edit", labelAr: "تعديل المحتوى" },
      { key: "content.publish", labelAr: "نشر المحتوى" },
    ],
  },
  {
    key: "churches",
    labelAr: "الكنائس",
    permissions: [
      { key: "churches.view", labelAr: "عرض الكنائس" },
      { key: "churches.manage", labelAr: "إدارة الكنائس" },
    ],
  },
  {
    key: "community",
    labelAr: "المجتمع",
    permissions: [
      { key: "community.moderate", labelAr: "إشراف المجتمع" },
      { key: "community.delete", labelAr: "حذف محتوى المجتمع" },
    ],
  },
  {
    key: "notifications",
    labelAr: "الإشعارات",
    permissions: [{ key: "notifications.send", labelAr: "إرسال إشعارات" }],
  },
  {
    key: "reports",
    labelAr: "البلاغات",
    permissions: [{ key: "reports.view", labelAr: "عرض البلاغات" }],
  },
  {
    key: "analytics",
    labelAr: "التحليلات",
    permissions: [{ key: "analytics.view", labelAr: "عرض التحليلات" }],
  },
  {
    key: "security",
    labelAr: "الأمان",
    permissions: [
      { key: "security.audit_log", labelAr: "سجل التدقيق" },
      { key: "security.sessions", labelAr: "إدارة الجلسات" },
    ],
  },
  {
    key: "settings",
    labelAr: "الإعدادات",
    permissions: [{ key: "settings.manage", labelAr: "إدارة الإعدادات" }],
  },
  {
    key: "ai",
    labelAr: "Alpha AI",
    permissions: [{ key: "ai.manage", labelAr: "إدارة الذكاء الاصطناعي" }],
  },
  {
    key: "team",
    labelAr: "فريق Alpha",
    permissions: [
      { key: "team.view", labelAr: "عرض الفريق" },
      { key: "team.invite", labelAr: "دعوة أعضاء" },
      { key: "team.edit", labelAr: "تعديل الأعضاء" },
      { key: "team.disable", labelAr: "تعطيل الأعضاء" },
      { key: "team.permissions", labelAr: "إدارة الصلاحيات" },
    ],
  },
];

/** Route → required permission (hide entirely if missing). */
export const PLATFORM_ROUTE_PERMISSION: Record<string, AdminPermissionKey | AdminPermissionKey[] | undefined> = {
  "/platform/team": "team.view",
  "/platform/approvals": "posts.approve",
  "/platform/privacy": "security.sessions",
  "/platform/modules": "settings.manage",
  "/platform/reports": "reports.view",
  "/platform/church-locations": "churches.manage",
  "/platform/publisher-center": "content.publish",
  "/platform/content-review": "content.view",
  "/platform/media-manager": "content.edit",
  "/platform/churches": "churches.manage",
  "/platform/monasteries": "churches.manage",
  "/platform/analytics": "analytics.view",
  "/platform/ai": "ai.manage",
  "/platform/audit": "security.audit_log",
  "/platform/settings": "settings.manage",
  "/platform/library": "content.view",
  "/platform/emergency": "settings.manage",
  "/platform/scan": "security.sessions",
};

export function routeRequiresPermission(path: string): AdminPermissionKey | AdminPermissionKey[] | undefined {
  const normalized = path.replace(/\/+$/, "") || "/";
  if (PLATFORM_ROUTE_PERMISSION[normalized] != null) return PLATFORM_ROUTE_PERMISSION[normalized];
  if (normalized.endsWith("/permissions") && normalized.startsWith("/platform/team/")) {
    return ["team.view", "team.permissions"];
  }
  if (/^\/platform\/team\/[^/]+$/.test(normalized)) {
    return "team.view";
  }
  const prefixes = Object.entries(PLATFORM_ROUTE_PERMISSION).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [prefix, perm] of prefixes) {
    if (normalized.startsWith(`${prefix}/`)) return perm;
  }
  return undefined;
}
