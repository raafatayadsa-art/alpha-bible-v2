import type { ProfileFriend, ProfileJourneyEvent } from "./types";

export const PROFILE_FRIENDS: ProfileFriend[] = [
  {
    id: "f1",
    name: "مريم عادل",
    avatar: "https://ui-avatars.com/api/?name=%D9%85%D8%B1%D9%8A%D9%85&background=4a7ab8&color=fff&size=128&bold=true&rounded=true",
    online: true,
    role: "member",
  },
  {
    id: "f2",
    name: "كيرلس سامي",
    avatar: "https://ui-avatars.com/api/?name=%D9%83%D9%8A%D8%B1%D9%84%D8%B3&background=3a8c6e&color=fff&size=128&bold=true&rounded=true",
    online: true,
    role: "servant",
  },
  {
    id: "f3",
    name: "مارينا فهمي",
    avatar: "https://ui-avatars.com/api/?name=%D9%85%D8%A7%D8%B1%D9%8A%D9%86%D8%A7&background=b8893a&color=fff&size=128&bold=true&rounded=true",
    online: false,
    role: "member",
  },
  {
    id: "f4",
    name: "بولس رمزي",
    avatar: "https://ui-avatars.com/api/?name=%D8%A8%D9%88%D9%84%D8%B3&background=6a4ab5&color=fff&size=128&bold=true&rounded=true",
    online: false,
    role: "member",
  },
];

export const PROFILE_SUGGESTIONS: ProfileFriend[] = [
  {
    id: "s1",
    name: "هبة نادر",
    avatar: "https://ui-avatars.com/api/?name=%D9%87%D8%A8%D8%A9&background=d18a3a&color=fff&size=128&bold=true&rounded=true",
    online: false,
    role: "member",
  },
  {
    id: "s2",
    name: "جورج ملاك",
    avatar: "https://ui-avatars.com/api/?name=%D8%AC%D9%88%D8%B1%D8%AC&background=3a6a9b&color=fff&size=128&bold=true&rounded=true",
    online: true,
    role: "member",
  },
  {
    id: "s3",
    name: "سارة إميل",
    avatar: "https://ui-avatars.com/api/?name=%D8%B3%D8%A7%D8%B1%D8%A9&background=c44569&color=fff&size=128&bold=true&rounded=true",
    online: false,
    role: "member",
  },
];

export const PROFILE_JOURNEY: ProfileJourneyEvent[] = [
  { id: "j1", title: "انضممت إلى Alpha", date: "يناير 2019", accent: "gold" },
  { id: "j2", title: "انضممت إلى كنيسة مار جرجس", date: "مارس 2019", accent: "green" },
  { id: "j3", title: "حفظت آية من الكتاب المقدس", date: "أبريل 2025", accent: "purple" },
  { id: "j4", title: "حضرت مؤتمر الشباب", date: "يونيو 2025", accent: "blue" },
  { id: "j5", title: "أكملت خطة قراءة", date: "سبتمبر 2025", accent: "gold" },
];
