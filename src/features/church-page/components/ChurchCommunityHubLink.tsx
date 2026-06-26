import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import type { ChurchPageStatus } from "../page-status";
import { CHURCH_DIR } from "@/features/church-directory/tokens";

type Props = {
  pageStatus: ChurchPageStatus;
  isMember: boolean;
};

export function ChurchCommunityHubLink({ pageStatus, isMember }: Props) {
  if (pageStatus !== "verified") return null;

  return (
    <div
      className="rounded-[22px] border p-3.5"
      style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.glass }}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/church"
          className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-extrabold text-white active:scale-[0.98]"
          style={{ background: `linear-gradient(160deg, #7b4cb8, ${CHURCH_DIR.purple})` }}
        >
          <Users className="h-4 w-4" />
          {isMember ? "افتح مجتمع الكنيسة" : "استكشف مجتمع الكنيسة"}
        </Link>
        <div className="text-right">
          <p className="text-[12px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
            مجتمع الكنيسة
          </p>
          <p className="mt-0.5 text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
            منشورات · أحداث · خدمات
          </p>
        </div>
      </div>
    </div>
  );
}
