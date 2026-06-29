import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/features/church/current-user";
import { cn } from "@/lib/utils";
import { CommunityFriendActivityItem } from "@/features/community/CommunityFriendActivityItem";
import { useCommunityUserMoments } from "@/features/community/community-store";

export function ProfileCommunityActivitySection({ dark = false }: { dark?: boolean }) {
  const userId = getCurrentUser().id;
  const moments = useCommunityUserMoments(userId);

  if (!moments.length) {
    return (
      <div
        className={cn(
          "mt-4 rounded-[22px] border px-5 py-7 text-center",
          dark ? "border-white/10 bg-white/[0.03]" : "border-[#e7c97a]/25 bg-white/75",
        )}
      >
        <Sparkles className={cn("mx-auto h-9 w-9", dark ? "text-[#f0d78c]/60" : "text-[#c98a3c]/70")} />
        <p className={cn("mt-3 text-[14px] font-extrabold", dark ? "text-white/90" : "text-[#3a2a18]")}>
          لا يوجد نشاط مجتمعي بعد
        </p>
        <p className={cn("mt-2 text-[12px] font-medium", dark ? "text-white/45" : "text-[#6a543a]")}>
          شارك آية أو أكمل قراءة/صلاة — سيظهر نشاطك هنا ولدى أصدقائك.
        </p>
        <Link
          to="/community"
          className="mt-4 inline-flex rounded-full border border-[#1f8a5a]/35 bg-[#1f8a5a]/10 px-4 py-2 text-[12px] font-extrabold text-[#1f8a5a]"
        >
          افتح المجتمع
        </Link>
      </div>
    );
  }

  return (
    <section className="mt-4">
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <h3 className={cn("text-[14px] font-extrabold", dark ? "text-white/90" : "text-alpha-heading")}>
          نشاطك في المجتمع
        </h3>
        <Link
          to="/community"
          className={cn("text-[11px] font-bold", dark ? "text-white/45" : "text-alpha-heading-muted")}
        >
          عرض الكل
        </Link>
      </div>
      <div className="space-y-2.5">
        {moments.slice(0, 8).map((moment) => (
          <CommunityFriendActivityItem key={moment.id} moment={moment} />
        ))}
      </div>
    </section>
  );
}
