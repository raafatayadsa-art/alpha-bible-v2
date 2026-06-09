import type {
  Church,
  Comment,
  Member,
  UrgentPost,
  MeetingPost,
  TripPost,
  PrayerPost,
  CelebrationPost,
  CondolencePost,
} from "./types";

import churchCover from "@/assets/church-cover.jpg";
import priestImg from "@/assets/priest.jpg";
import urgentImg from "@/assets/urgent.jpg";
import meetingImg from "@/assets/meeting.jpg";
import tripImg from "@/assets/trip.jpg";
import prayerImg from "@/assets/prayer.jpg";
import celebrationImg from "@/assets/celebration.jpg";
import condolenceImg from "@/assets/condolence.jpg";

// Placeholder avatars: pure CSS gradients keyed by `color`. No image calls needed.
const m = (
  id: string,
  name: string,
  initials: string,
  color: string,
): Member => ({ id, name, initials, color });

const members: Member[] = [
  m("u1", "مينا فؤاد", "م.ف", "260"),
  m("u2", "مارينا ج.", "م.ج", "300"),
  m("u3", "سارة م.", "س.م", "60"),
  m("u4", "بيتر س.", "ب.س", "200"),
  m("u5", "إيهاب ن.", "إ.ن", "20"),
  m("u6", "نادية ف.", "ن.ف", "340"),
  m("u7", "كيرلس ع.", "ك.ع", "120"),
  m("u8", "مريم و.", "م.و", "320"),
  m("u9", "بولا ر.", "ب.ر", "180"),
];

export const church: Church = {
  id: "ch1",
  name: "كنيسة العذراء مريم",
  diocese: "بطريركية الأقباط الأرثوذكس",
  imageUrl: churchCover,
  coverImageUrl: churchCover,
  greeting: "أهلاً بك يا مريم",
  status: "online",
  memberCount: 1248,
  servantCount: 86,
  priestCount: 4,
  priest: {
    id: "p1",
    name: "القس يوأنس ميخائيل",
    imageUrl: priestImg,
    phone: "+20 100 000 0000",
  },
};

export const urgent: UrgentPost = {
  id: "post-urgent",
  kind: "urgent",
  imageUrl: urgentImg,
  title: "تغيير موعد اجتماع الخدمة العام",
  description:
    "سيتم تأجيل اجتماع الخدمة العام إلى يوم الجمعة القادم — 7 يونيو — الساعة 7:00 مساءً.",
  date: "7 يونيو",
  time: "7:00 مساءً",
  timeAgo: "منذ 30 دقيقة",
  participants: [members[0], members[1], members[2]],
  participantsCount: 22,
};

export const meeting: MeetingPost = {
  id: "post-meeting",
  kind: "meeting",
  imageUrl: meetingImg,
  title: "اجتماع خدمة الشباب",
  date: "الجمعة 7 يونيو",
  time: "7:00 مساءً",
  location: "قاعة الكنيسة الرئيسية",
  attendeesCount: 35,
  timeAgo: "منذ ساعة",
  participants: [members[3], members[6], members[7]],
  participantsCount: 28,
};

export const trip: TripPost = {
  id: "post-trip",
  kind: "trip",
  imageUrl: tripImg,
  title: "رحلة دير الأنبا بيشوي",
  date: "السبت 15 يونيو",
  cost: "150 جنيه",
  totalSeats: 68,
  bookedSeats: 40,
  availableSeats: 28,
  timeAgo: "منذ 3 ساعات",
  participants: [members[0], members[4], members[8]],
  participantsCount: 9,
};

const prayerComments: Comment[] = [
  {
    id: "pc1",
    member: members[0],
    text: "ربنا يتمم الشفاء على سيدنا",
    timeAgo: "منذ 15 دقيقة",
    emoji: "🙏",
  },
  {
    id: "pc2",
    member: members[1],
    text: "صلينا من أجله في القداس اليوم",
    timeAgo: "منذ 45 دقيقة",
    emoji: "🙏",
  },
];

export const prayer: PrayerPost = {
  id: "post-prayer",
  kind: "prayer",
  imageUrl: prayerImg,
  title: "من أجل الأنبا ثاؤفيلس",
  description: "يحتاج إلى عملية قسطرة في القلب — صلواتكم من أجله",
  prayedCount: 45,
  commentsCount: 12,
  timeAgo: "منذ ساعتين",
  comments: prayerComments,
  participants: [members[0], members[1], members[2], members[5]],
  participantsCount: 53,
};

const celebrationComments: Comment[] = [
  {
    id: "cc1",
    member: members[2],
    text: "كل سنة وانت طيب يا يوسف 🎉",
    timeAgo: "منذ ساعة",
  },
  {
    id: "cc2",
    member: members[3],
    text: "ربنا يبارككم ويقويكم 🤍",
    timeAgo: "منذ ساعتين",
  },
];

export const celebration: CelebrationPost = {
  id: "post-celebration",
  kind: "celebration",
  imageUrl: celebrationImg,
  title: "تهنئة بعيد ميلاد الخادم يوسف",
  description:
    "كل سنة وانت طيب يا يوسف، ربنا يبارك حياتك ويجعلك في خدمة الكنيسة.",
  congratulationsCount: 45,
  timeAgo: "منذ 5 ساعات",
  comments: celebrationComments,
  participants: [members[2], members[3], members[6], members[7]],
  participantsCount: 53,
};

const condolenceComments: Comment[] = [
  {
    id: "dc1",
    member: members[4],
    text: "ربنا يعزي الأسرة الكريمة",
    timeAgo: "منذ 30 دقيقة",
  },
  {
    id: "dc2",
    member: members[5],
    text: "البقاء لله وحده",
    timeAgo: "منذ ساعة",
  },
];

export const condolence: CondolencePost = {
  id: "post-condolence",
  kind: "condolence",
  imageUrl: condolenceImg,
  title: "تعزية في نياحة الحاج عادل صليب",
  description:
    "صلاة الراحة غداً الجمعة بعد القداس الإلهي الساعة 10:00 صباحاً في الكنيسة الرئيسية.",
  timeAgo: "منذ 6 ساعات",
  comments: condolenceComments,
  participants: [members[4], members[5], members[8]],
  participantsCount: 31,
};
