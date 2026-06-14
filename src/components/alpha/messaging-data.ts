import type { ShieldRole } from "./AlphaShield";

// Avatar placeholders — no local files needed, use UI Avatars API
const avatar = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128&bold=true&rounded=true`;

const priestAvatar  = avatar("أبونا داود",  "7c5cbf");
const servantAvatar = avatar("مينا فادي",   "3a8c6e");
const memberAvatar  = avatar("مريم عادل",   "4a7ab8");
const officialAvatar = avatar("Alpha",       "b8893a");

export type Conversation = {
  id: string;
  name: string;
  role: ShieldRole;
  avatar: string;
  message: string;
  time: string;
  unread?: number;
  online?: boolean;
  kind: "private" | "group";
  /** Registered contact phone for voice calls */
  phone?: string;
};

export const conversations: Conversation[] = [
  { id: "priest",  name: "أبونا داود",          role: "priest",   avatar: priestAvatar,   message: "الرب يباركك يا رأفت، سأذكرك في الصلاة.", time: "الآن",    unread: 2, online: true, kind: "private", phone: "+201001234567" },
  { id: "alpha",   name: "Alpha الرسمي",         role: "official", avatar: officialAvatar, message: "تم تحديث إعدادات الحماية لحسابك بنجاح.",  time: "١٠:٢٤",  unread: 1, kind: "private", phone: "+20223456789" },
  { id: "servant", name: "مينا فادي",            role: "servant",  avatar: servantAvatar,  message: "ميعاد الخدمة اتأكد يوم الجمعة الساعة ٧.", time: "أمس",    kind: "private", phone: "+201112345678" },
  { id: "member",  name: "مريم عادل",            role: "member",   avatar: memberAvatar,   message: "شكرًا جدًا، التأمل كان جميل ومفرح.",      time: "أمس",    kind: "private", phone: "+201223456789" },
  { id: "group",   name: "خدام اجتماع الشباب",  role: "servant",  avatar: servantAvatar,  message: "يوسف: هنبدأ التحضير بعد القداس مباشرة.",  time: "الثلاثاء", unread: 8, kind: "group" },
];

export const priestProfile = conversations[0];

export function getConversationPhone(id: string): string | undefined {
  return conversations.find((c) => c.id === id)?.phone;
}
