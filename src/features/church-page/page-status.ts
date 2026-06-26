export type ChurchPageStatus = "inactive" | "pending_claim" | "verified" | "suspended";

export function deriveChurchPageStatus(input: {
  pageStatus?: string | null;
  isVerified?: boolean;
  isActive?: boolean | null;
}): ChurchPageStatus {
  const raw = input.pageStatus?.trim();
  if (
    raw === "inactive" ||
    raw === "pending_claim" ||
    raw === "verified" ||
    raw === "suspended"
  ) {
    return raw;
  }
  if (input.isActive === false) return "suspended";
  if (input.isVerified) return "verified";
  return "inactive";
}

export function churchPageStatusLabel(status: ChurchPageStatus): string {
  switch (status) {
    case "inactive":
      return "غير مفعّلة";
    case "pending_claim":
      return "طلب استلام قيد المراجعة";
    case "verified":
      return "كنيسة موثّقة";
    case "suspended":
      return "موقوفة";
    default:
      return status;
  }
}

export function churchPageStatusMessage(status: ChurchPageStatus): string | null {
  switch (status) {
    case "inactive":
      return "هذه الصفحة لم يتم تفعيلها بعد بواسطة الكنيسة.";
    case "pending_claim":
      return "يوجد طلب استلام قيد المراجعة من الإدارة.";
    case "suspended":
      return "تم إيقاف هذه الصفحة إداريًا.";
    default:
      return null;
  }
}
