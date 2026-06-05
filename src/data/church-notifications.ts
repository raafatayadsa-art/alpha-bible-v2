export type NotifCategory =
  | "prayer"
  | "prayer-comment"
  | "encouragement"
  | "post"
  | "announcement"
  | "meeting"
  | "live"
  | "service"
  | "message"
  | "membership";

export type ChurchNotification = {
  id: string;
  category: NotifCategory;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href: string;
};

export const CHURCH_NOTIFICATIONS: ChurchNotification[] = [
  {
    id: "n1",
    category: "live",
    title: "البث المباشر بدأ الآن",
    description: "قداس الجمعة من كنيسة الشهيد مار جرجس — انضم الآن",
    time: "الآن",
    read: false,
    href: "/church",
  },
  {
    id: "n2",
    category: "prayer",
    title: "طلب صلاة عاجل",
    description: "مينا طلب صلواتكم من أجل والدته في العملية",
    time: "منذ 5 دقائق",
    read: false,
    href: "/prayer-requests",
  },
  {
    id: "n3",
    category: "encouragement",
    title: "رسالة تشجيع جديدة",
    description: "مريم أرسلت لكِ رسالة: «ربنا معاكي يا حبيبتي»",
    time: "منذ 12 دقيقة",
    read: false,
    href: "/prayer-requests",
  },
  {
    id: "n4",
    category: "post",
    title: "منشور جديد من الكنيسة",
    description: "صور قداس عيد الصليب — شاهد الألبوم الكامل",
    time: "منذ 30 دقيقة",
    read: false,
    href: "/church",
  },
  {
    id: "n5",
    category: "prayer-comment",
    title: "تعليق جديد على طلبك",
    description: "أبونا بولس علّق: «صلواتنا معك ومع عائلتك»",
    time: "منذ ساعة",
    read: true,
    href: "/prayer-requests",
  },
  {
    id: "n6",
    category: "meeting",
    title: "اجتماع الشباب — تذكير",
    description: "اجتماع الجمعة الساعة 7 مساءً في قاعة الكنيسة",
    time: "منذ ساعتين",
    read: true,
    href: "/church",
  },
  {
    id: "n7",
    category: "message",
    title: "رسالة خاصة جديدة",
    description: "أبونا أنطونيوس: «سلام ونعمة، محتاج أكلمك بخصوص الخدمة»",
    time: "منذ 3 ساعات",
    read: false,
    href: "/church",
  },
  {
    id: "n8",
    category: "announcement",
    title: "إعلان هام من الكنيسة",
    description: "تغيير في مواعيد قداسات الأسبوع القادم — اضغط للتفاصيل",
    time: "أمس",
    read: true,
    href: "/church",
  },
  {
    id: "n9",
    category: "service",
    title: "تحديث الخدمة",
    description: "تم إضافتك إلى خدمة مدارس الأحد — مرحبًا بك",
    time: "أمس",
    read: true,
    href: "/profile/service",
  },
  {
    id: "n10",
    category: "membership",
    title: "تجديد العضوية",
    description: "تم تجديد عضويتك في الكنيسة بنجاح للسنة الجديدة",
    time: "منذ يومين",
    read: true,
    href: "/profile/membership",
  },
];
