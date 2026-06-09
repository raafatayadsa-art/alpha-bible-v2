export type ContinueReadingData = {
  id: string;
  label: string;
  reference: string;
  preview: string;
  progressPercent: number;
  ctaLabel: string;
  bookParam?: string;
  chapter?: number;
  imageUrl: string;
};

export const defaultContinueReading: ContinueReadingData = {
  id: "continue-default",
  label: "آخر متابعة",
  reference: "إنجيل يوحنا 3 : 16",
  preview:
    "لأنه هكذا أحب الله العالم حتى بذل ابنه الوحيد، لكي لا يهلك كل من يؤمن به، بل تكون له الحياة الأبدية.",
  progressPercent: 60,
  ctaLabel: "متابعة القراءة",
  bookParam: "John",
  chapter: 3,
  imageUrl: "", // resolved in screen via assets
};
