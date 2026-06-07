export type PrayerCategory =
  | "شفاء"
  | "دراسة"
  | "معيشة"
  | "زواج"
  | "راحة نفس"
  | "شكر"
  | "طلبة";

export type PrayerStatus = "active" | "urgent" | "answered";

export type PrayerParticipant = {
  name: string;
  avatarUrl?: string;
};

export type PrayerRequest = {
  id: string;
  name: string;
  title: string;
  request: string;
  time: string;
  /** Sort key — lower = newer. */
  ageMinutes: number;
  prayers: number;
  category: PrayerCategory;
  status: PrayerStatus;
  /** true = belongs to the current user (mock). */
  mine?: boolean;
  /** Posted anonymously — hides the name. */
  anonymous?: boolean;
  /** Requester profile photo when available. */
  avatarUrl?: string;
  /** Recent pray-ers — used for avatar stack when photos exist. */
  prayerParticipants?: PrayerParticipant[];
};


export const PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: "1",
    name: "مينا س.",
    title: "طلبة من أجل المرضى",
    request: "صلاة من أجل الشفاء العاجل لأبي من العملية الجراحية",
    time: "منذ ساعتين",
    ageMinutes: 120,
    prayers: 42,
    category: "شفاء",
    status: "urgent",
    avatarUrl: "https://i.pravatar.cc/80?u=mmina",
    prayerParticipants: [
      { name: "مارينا", avatarUrl: "https://i.pravatar.cc/80?u=marina-pray" },
      { name: "بولس", avatarUrl: "https://i.pravatar.cc/80?u=paul-pray" },
      { name: "سارة", avatarUrl: "https://i.pravatar.cc/80?u=sara-pray" },
      { name: "جورج", avatarUrl: "https://i.pravatar.cc/80?u=george-pray" },
      { name: "مريم" },
    ],
  },
  {
    id: "2",
    name: "مريم ج.",
    title: "طلبة من أجل النجاح",
    request: "أطلب صلواتكم من أجل نجاحي في الامتحانات الجامعية",
    time: "منذ ٥ ساعات",
    ageMinutes: 300,
    prayers: 28,
    category: "دراسة",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/80?u=maryam-j",
    prayerParticipants: [
      { name: "أبونا داود", avatarUrl: "https://i.pravatar.cc/80?u=abodaoud" },
      { name: "كيرلس", avatarUrl: "https://i.pravatar.cc/80?u=kyrillos" },
      { name: "هبة", avatarUrl: "https://i.pravatar.cc/80?u=heba-pray" },
    ],
  },
  {
    id: "3",
    name: "أبو تادرس",
    title: "طلبة من أجل الرزق",
    request: "صلاة من أجل ابني الذي يمر بضائقة مالية",
    time: "منذ يوم",
    ageMinutes: 1440,
    prayers: 67,
    category: "معيشة",
    status: "active",
    prayerParticipants: [
      { name: "أنطون" },
      { name: "فادي" },
    ],
  },
  {
    id: "4",
    name: "سارة م.",
    title: "طلبة من أجل الزواج المبارك",
    request: "أرجوكم ادعوا لأختي بالزواج المبارك",
    time: "منذ يومين",
    ageMinutes: 2880,
    prayers: 35,
    category: "زواج",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/80?u=sara-m",
    prayerParticipants: [
      { name: "مارينا", avatarUrl: "https://i.pravatar.cc/80?u=marina2" },
      { name: "بيشوي", avatarUrl: "https://i.pravatar.cc/80?u=bishoy" },
    ],
  },
  {
    id: "5",
    name: "جورج ع.",
    title: "طلبة لراحة الأنفس",
    request: "صلوا من أجل راحة نفس جدتي الراحلة",
    time: "منذ ٣ أيام",
    ageMinutes: 4320,
    prayers: 89,
    category: "راحة نفس",
    status: "answered",
    avatarUrl: "https://i.pravatar.cc/80?u=george-a",
    prayerParticipants: [
      { name: "مينا", avatarUrl: "https://i.pravatar.cc/80?u=mmina2" },
      { name: "مريم", avatarUrl: "https://i.pravatar.cc/80?u=mariam2" },
      { name: "بeter", avatarUrl: "https://i.pravatar.cc/80?u=peter2" },
      { name: "john", avatarUrl: "https://i.pravatar.cc/80?u=john2" },
    ],
  },
  {
    id: "6",
    name: "أنت",
    title: "طلبة شخصية",
    request: "صلوا من أجل سلام قلبي وثبات إيماني في التجارب",
    time: "منذ ٤ ساعات",
    ageMinutes: 240,
    prayers: 12,
    category: "طلبة",
    status: "active",
    mine: true,
    prayerParticipants: [
      { name: "مارينا", avatarUrl: "https://i.pravatar.cc/80?u=marina3" },
    ],
  },
];

export type PrayerFilter = "all" | "urgent" | "answered" | "mine";

export const PRAYER_TABS: { key: PrayerFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "urgent", label: "عاجلة" },
  { key: "answered", label: "تمت الصلاة" },
  { key: "mine", label: "طلباتي" },
];

export function filterPrayers(
  list: PrayerRequest[],
  filter: PrayerFilter
): PrayerRequest[] {
  switch (filter) {
    case "urgent":
      return list.filter((p) => p.status === "urgent");
    case "answered":
      return list.filter((p) => p.status === "answered");
    case "mine":
      return list.filter((p) => p.mine);
    default:
      return list;
  }
}

export function prayerStats(list: PrayerRequest[]) {
  const active = list.filter((p) => p.status !== "answered").length;
  const peoplePrayed = list.reduce((sum, p) => sum + p.prayers, 0);
  return { active, peoplePrayed };
}

export type EncouragementMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
  anonymous?: boolean;
  avatarUrl?: string;
  churchName?: string;
};


export const ENCOURAGEMENT_MESSAGES: EncouragementMessage[] = [
  {
    id: "m1",
    author: "أ. مارينا",
    text: "الرب يقويك ويعطيك سلامه",
    time: "منذ ساعة",
    avatarUrl: "https://i.pravatar.cc/80?u=marina-enc",
    churchName: "كنيسة مارجرجس",
  },
  {
    id: "m2",
    author: "أ. بيشوي",
    text: "نصلي من أجلك ومن أجل أسرتك",
    time: "منذ ٣ ساعات",
    avatarUrl: "https://i.pravatar.cc/80?u=bishoy-enc",
    churchName: "كنيسة مارجرجس",
  },
  {
    id: "m3",
    author: "أ. مريم",
    text: "المسيح معك في كل لحظة",
    time: "منذ ٥ ساعات",
    avatarUrl: "https://i.pravatar.cc/80?u=mary-enc",
  },
];

export const ENCOURAGEMENT_TOTAL = 45;

export const ENCOURAGEMENT_CHIPS: { emoji: string; text: string }[] = [
  { emoji: "🙏", text: "نصلي من أجلك" },
  { emoji: "❤️", text: "الرب معك" },
  { emoji: "✝️", text: "المسيح يعزيك" },
  { emoji: "🌿", text: "سلام المسيح" },
];

export const ENCOURAGEMENT_MAX = 100;
