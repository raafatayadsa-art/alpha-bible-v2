export type ContactRoleType = "priest" | "servant" | "admin";

export type ChurchContact = {
  id: string;
  name: string;
  role: string;
  roleType: ContactRoleType;
  phone: string;
  whatsapp: string;
  initials: string;
  /** Whether the priest has allowed members to message this leader. */
  messagingAllowed: boolean;
};

export const CHURCH_CONTACTS: ChurchContact[] = [
  {
    id: "p1",
    name: "القمص داود عبد الملاك",
    role: "الكاهن المسؤول",
    roleType: "priest",
    phone: "+201001234567",
    whatsapp: "201001234567",
    initials: "✚",
    messagingAllowed: true,
  },
  {
    id: "s1",
    name: "أمين الخدمة - مايكل عادل",
    role: "خادم الشباب",
    roleType: "servant",
    phone: "+201112345678",
    whatsapp: "201112345678",
    initials: "م",
    messagingAllowed: true,
  },
  {
    id: "s2",
    name: "أمينة خدمة البنات - مارينا",
    role: "خادمة البنات",
    roleType: "servant",
    phone: "+201223456789",
    whatsapp: "201223456789",
    initials: "م",
    messagingAllowed: false,
  },
  {
    id: "a1",
    name: "إدارة الكنيسة",
    role: "السكرتارية",
    roleType: "admin",
    phone: "+20223456789",
    whatsapp: "20223456789",
    initials: "✱",
    messagingAllowed: true,
  },
];

export function getChurchContact(id: string): ChurchContact | undefined {
  return CHURCH_CONTACTS.find((c) => c.id === id);
}

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  /** ISO offset in minutes from "now" — negative = in the past */
  minutesAgo: number;
};

/** Seed conversation snippets per contact. */
export const SEED_CONVERSATIONS: Record<string, ChatMessage[]> = {
  p1: [
    { id: "m1", from: "them", text: "سلام ونعمة يا ابني، الرب يبارك حياتك.", minutesAgo: 180 },
    { id: "m2", from: "me", text: "أبونا أحتاج كلمة في موضوع مهم.", minutesAgo: 175 },
    { id: "m3", from: "them", text: "بكل سرور، تعالى بعد القداس يوم الأحد.", minutesAgo: 60 },
  ],
  s1: [
    { id: "m1", from: "them", text: "ميعاد اجتماع الشباب الخميس الساعة 7 مساءً.", minutesAgo: 240 },
    { id: "m2", from: "me", text: "تمام، إن شاء الله أكون موجود.", minutesAgo: 230 },
  ],
  s2: [
    { id: "m1", from: "them", text: "بركة القديسين معاكم.", minutesAgo: 1440 },
  ],
  a1: [
    { id: "m1", from: "them", text: "تم استلام طلبك، سيتم الرد قريباً.", minutesAgo: 90 },
  ],
};

export const ROLE_TONE_MAP: Record<ContactRoleType, { bg: string; tag: string; label: string }> = {
  priest: { bg: "linear-gradient(160deg, #7a4a26, #3a2a18)", tag: "#c79356", label: "كاهن" },
  servant: { bg: "linear-gradient(160deg, #6a4ab5, #4a2e8e)", tag: "#8a6ec1", label: "خادم" },
  admin: { bg: "linear-gradient(160deg, #1f8a5a, #136a44)", tag: "#1f8a5a", label: "إدارة" },
};
