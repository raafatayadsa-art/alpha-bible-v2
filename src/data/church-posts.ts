import { assignCategoryImage, assignPostImage } from "@/features/church/post-image-engine";

export type PostType =
  | "news"
  | "announcement"
  | "liturgy"
  | "meeting"
  | "wedding"
  | "condolence"
  | "prayer"
  | "report"
  | "event"
  | "trip";

/** Template-specific extra fields rendered on the details screen + cards. */
export type ChurchPostDetails = {
  /** Sub-type label, e.g. "تعزية" | "أربعين" | "ذكرى سنوية" | "إكليل" | "نصف إكليل" */
  eventType?: string;
  date?: string;
  time?: string;
  place?: string;
  priest?: string;
  audience?: string;
  groom?: string;
  bride?: string;
  personName?: string;
  deathDate?: string;
  verse?: string;
  returnDate?: string;
  seats?: number;
  places?: string;
  /** Trip price label e.g. "200 جنيه" */
  price?: string;
  /** Trip program / itinerary summary */
  program?: string;
  /** ALPHA-084 — trip approval workflow */
  approvalStatus?: "pending" | "changes_requested" | "approved" | "rejected";
  organizerUserId?: string;
  organizerName?: string;
  churchName?: string;
  approvedByUserId?: string;
  approvedByName?: string;
  approvalNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
};

export type ChurchPost = {
  id: string;
  type: PostType;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  date: string;
  author: string;
  /** Legacy boolean. Prefer pinnedUntil. If true with no pinnedUntil, treated as pinned indefinitely. */
  pinned?: boolean;
  /** Epoch ms — pinned while now < pinnedUntil. */
  pinnedUntil?: number;
  /** Epoch ms — post expires (hidden from main feed) once now >= expiresAt. */
  expiresAt?: number | null;
  /** Manually archived (always hidden from main feed). */
  archived?: boolean;
  /** Prayer requests: marked completed / closed. */
  closed?: boolean;
  details?: ChurchPostDetails;
  /** Optional extra images — shown in Facebook-style gallery below post text. */
  images?: string[];
  /** Epoch ms from `created_at` — used for feed ordering. */
  createdAt?: number;
};

export const POST_TYPE_META: Record<PostType, { label: string; tone: string }> = {
  news:         { label: "خبر",     tone: "#c98a3c" },
  announcement: { label: "إعلان",   tone: "#c44569" },
  liturgy:      { label: "قداس",    tone: "#7a4a26" },
  meeting:      { label: "اجتماع",  tone: "#5b8fd1" },
  wedding:      { label: "فرح",     tone: "#d97a8a" },
  condolence:   { label: "تعزية",   tone: "#6a543a" },
  prayer:       { label: "طلبة",    tone: "#8a6ec1" },
  report:       { label: "تقرير",   tone: "#3a6db0" },
  event:        { label: "فعالية",  tone: "#1f8a5a" },
  trip:         { label: "رحلة",    tone: "#b8893a" },
};


export const CHURCH_POSTS: ChurchPost[] = [
  {
    id: "feast-cross",
    type: "announcement",
    title: "قداس عيد الصليب المجيد",
    excerpt: "يُقام القداس الإلهي يوم الجمعة 17 سبتمبر الساعة 7 صباحًا. الكل مدعوّ للمشاركة.",
    body:
      "تتشرف كنيسة الشهيد مار جرجس بدعوتكم لحضور القداس الإلهي بمناسبة عيد الصليب المجيد، " +
      "والذي يُقام يوم الجمعة الموافق 17 سبتمبر في تمام السابعة صباحًا. " +
      "يسبق القداس صلاة باكر ورفع بخور، وتُلقى عظة بمناسبة العيد.",
    image: assignCategoryImage("announcement", "feast-cross"),
    date: "12 سبتمبر 2025",
    author: "القمص داود عبد الملاك",
    pinned: true,
  },
  {
    id: "sunday-mass",
    type: "news",
    title: "قداس الأحد بحضور نيافة الأنبا",
    excerpt: "يحضر نيافة الأنبا القداس الإلهي بكنيستنا يوم الأحد القادم.",
    body:
      "يتشرف الآباء الكهنة وشعب الكنيسة باستقبال نيافة الحبر الجليل خلال قداس الأحد القادم. " +
      "نرجو الحضور مبكرًا والالتزام بالهدوء داخل الكنيسة.",
    image: assignCategoryImage("news", "sunday-mass"),
    date: "10 سبتمبر 2025",
    author: "خدمة الإعلام",
  },
  {
    id: "youth-meeting",
    type: "event",
    title: "اجتماع الشباب الأسبوعي",
    excerpt: "موضوع هذا الأسبوع: الرجاء المسيحي في وسط الضيقات.",
    body:
      "يُعقد اجتماع الشباب الأسبوعي يوم الجمعة في تمام السابعة والنصف مساءً بقاعة الكنيسة. " +
      "سيتحدث أبونا حول موضوع الرجاء المسيحي يعقبه نقاش مفتوح وأجاباي.",
    image: assignCategoryImage("event", "youth-meeting"),
    date: "9 سبتمبر 2025",
    author: "خدمة الشباب",
  },
  {
    id: "trip-monastery",
    type: "trip",
    title: "رحلة روحية إلى دير الأنبا بيشوي",
    excerpt: "رحلة يوم كامل بوادي النطرون يوم السبت 25 سبتمبر.",
    body:
      "تنظم الكنيسة رحلة روحية إلى دير الأنبا بيشوي بوادي النطرون يوم السبت 25 سبتمبر. " +
      "تشمل الرحلة الانتقالات ووجبة الغداء وزيارة الأديرة المجاورة. للحجز يرجى التواصل مع خدمة الرحلات.",
    image: assignCategoryImage("trip", "trip-monastery"),
    date: "8 سبتمبر 2025",
    author: "لجنة الرحلات",
  },
  {
    id: "wedding-mark-mary",
    type: "wedding",
    title: "إكليل مبارك للأخ مرقس والأخت مريم",
    excerpt: "نهنئ العروسين بمناسبة سر الزيجة المقدس.",
    body:
      "تتقدم أسرة الكنيسة بأحر التهاني للأخ مرقس والأخت مريم بمناسبة سر الزيجة المقدس. " +
      "أقام القداس وصلوات الإكليل أبونا داود عبد الملاك. عقبال الفرح الدائم في الرب.",
    image: assignPostImage({
      id: "wedding-mark-mary",
      type: "wedding",
      details: { eventType: "إكليل" },
    }),
    date: "6 سبتمبر 2025",
    author: "خدمة الإعلام",
    details: { eventType: "إكليل" },
  },
  {
    id: "condolence-tadros",
    type: "condolence",
    title: "نياحة المتنيح الأستاذ تادرس",
    excerpt: "نطلب من الرب أن ينيح نفسه في فردوس النعيم.",
    body:
      "بقلوب مؤمنة بقيامة الموتى ننعى إليكم المتنيح الأستاذ تادرس، أحد خدام الكنيسة الأمناء. " +
      "تُقام صلوات الجناز يوم الإثنين بكنيستنا. الرب ينيح نفسه ويعزّي أهله.",
    image: assignCategoryImage("condolence", "condolence-tadros"),
    date: "5 سبتمبر 2025",
    author: "مجلس الكنيسة",
  },
  {
    id: "prayer-request",
    type: "prayer",
    title: "طلبة من أجل المرضى",
    excerpt: "نطلب صلواتكم من أجل شفاء إخوتنا المرضى.",
    body:
      "نطلب من أبنائنا الأحباء الصلاة من أجل عدد من إخوتنا المرضى الذين يحتاجون لمعونة الرب. " +
      "يمكنكم إرسال أسماء من تريدون الصلاة عنهم عبر خدمة طلبات الصلاة بالتطبيق.",
    image: assignCategoryImage("prayer", "prayer-request"),
    date: "3 سبتمبر 2025",
    author: "خدمة الافتقاد",
  },
  {
    id: "service-report",
    type: "report",
    title: "تقرير خدمة شهر أغسطس",
    excerpt: "ملخص نشاط الخدمة والاجتماعات والافتقاد خلال الشهر.",
    body:
      "خلال شهر أغسطس شهدت الخدمة نموًا ملحوظًا في عدد المخدومين بكافة الفصول، " +
      "كما تمت زيارة 42 أسرة ضمن خدمة الافتقاد، وأُقيمت 3 رحلات روحية للأطفال والشباب.",
    image: assignCategoryImage("report", "service-report"),
    date: "1 سبتمبر 2025",
    author: "أمين الخدمة",
  },
];

export function getChurchPost(id: string): ChurchPost | undefined {
  return CHURCH_POSTS.find((p) => p.id === id);
}
