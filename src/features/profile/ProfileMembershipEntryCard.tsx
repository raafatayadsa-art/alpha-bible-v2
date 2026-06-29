import { Link } from "@tanstack/react-router";
import { ChevronLeft, IdCard } from "lucide-react";
import { ProfileAccentIcon } from "./ProfileAccentIcon";

export function ProfileMembershipEntryCard() {
  return (
    <section className="mb-6">
      <Link
        to="/profile/membership"
        className="flex items-center gap-3 rounded-[20px] border border-alpha-gold-bright/30 bg-[color-mix(in_srgb,var(--alpha-gold-bright)_10%,var(--alpha-surface))] px-4 py-4 shadow-[var(--alpha-shadow-mini)] active:scale-[0.99]"
      >
        <ProfileAccentIcon icon={IdCard} accent="#8a6ec1" size="md" />
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[18px] font-extrabold text-alpha-heading">بطاقة العضوية</p>
          <p className="mt-0.5 text-[14px] font-medium text-alpha-muted">عرض بطاقة العضوية الكاملة</p>
        </div>
        <ChevronLeft className="h-5 w-5 shrink-0 text-alpha-gold-deep/70" />
      </Link>
    </section>
  );
}
