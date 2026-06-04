import type { KatamerosDay } from "./types";

export const TODAY_KATAMEROS: KatamerosDay = {
  id: "today",
  copticDate: "٧ بشنس ١٧٤٢",
  gregorianDate: "١٥ مايو ٢٠٢٦",
  occasion: "الجمعة العظيمة",
  liturgicalDay: "قراءات أسبوع الآلام",
  accentHex: "#6a4ab5",
  readings: [
    {
      id: "psalm",
      type: "psalm",
      title: "المزمور",
      reference: "مز ٢٢: ١-١٨",
      source: "باكر",
      estimatedMin: 2,
      body: "إلهي إلهي لماذا تركتني، بعيداً عن خلاصي عن كلام زفيري. إلهي في النهار أدعو فلا تستجيب، وفي الليل فلا هدوء لي. أما أنت فقدوس، الجالس بين تسبيحات إسرائيل. عليك اتكل آباؤنا، اتكلوا فنجيتهم. إليك صرخوا فنجوا، عليك اتكلوا فلم يخزوا.",
    },
    {
      id: "pauline",
      type: "pauline",
      title: "البولس",
      reference: "عب ١٠: ١٩-٢٥",
      source: "القداس",
      estimatedMin: 3,
      body: "فإذ لنا أيها الإخوة ثقة بالدخول إلى الأقداس بدم يسوع، طريقاً كرَّسه لنا حديثاً حياً، بالحجاب أي جسده، وكاهن عظيم على بيت الله، لنتقدم بقلب صادق في يقين الإيمان، مرشوشة قلوبنا من ضمير شرير.",
    },
    {
      id: "catholic",
      type: "catholic",
      title: "الكاثوليكون",
      reference: "١بط ٣: ١٧-٢٢",
      source: "القداس",
      estimatedMin: 2,
      body: "لأن تألمكم إن شاءت مشيئة الله وأنتم صانعون خيراً، أفضل منه وأنتم صانعون شراً. فإن المسيح أيضاً تألم مرة واحدة من أجل الخطايا، البار من أجل الأثمة، لكي يقربنا إلى الله، مماتاً في الجسد ولكن محيى في الروح.",
    },
    {
      id: "praxis",
      type: "praxis",
      title: "الإبركسيس",
      reference: "أع ١٠: ٣٤-٤٣",
      source: "القداس",
      estimatedMin: 3,
      body: "ففتح بطرس فاه وقال: بالحق أنا أجد أن الله لا يقبل الوجوه، بل في كل أمة، الذي يتقيه ويصنع البر مقبول عنده. الكلمة التي أرسلها إلى بني إسرائيل يبشر بالسلام بيسوع المسيح. هذا هو رب الكل.",
    },
    {
      id: "gospel",
      type: "gospel",
      title: "الإنجيل",
      reference: "يو ١٩: ١٦-٣٧",
      source: "القداس",
      estimatedMin: 5,
      body: "فحينئذٍ أسلمه إليهم ليُصلب. فأخذوا يسوع ومضوا به. فخرج وهو حامل صليبه إلى الموضع الذي يقال له موضع الجمجمة، ويقال له بالعبرانية جلجثة، حيث صلبوه. وصلبوا معه آخرَين من هنا ومن هنا، ويسوع في الوسط.",
    },
  ],
  related: [
    {
      id: "saint-today",
      kind: "synaxarium",
      title: "سنكسار اليوم",
      subtitle: "ذكرى آلام السيد المسيح",
      to: "/synaxarium",
    },
    {
      id: "feast-today",
      kind: "feast",
      title: "مناسبة اليوم",
      subtitle: "الجمعة العظيمة",
      to: "/feasts",
    },
    {
      id: "prayer-related",
      kind: "prayer",
      title: "صلاة الساعة السادسة",
      subtitle: "من الأجبية",
      to: "/agpeya",
    },
    {
      id: "meditation-related",
      kind: "meditation",
      title: "تأمل في الصليب",
      subtitle: "محبة الله الفائقة",
    },
  ],
};

export function getTodayKatameros(): KatamerosDay {
  return TODAY_KATAMEROS;
}
