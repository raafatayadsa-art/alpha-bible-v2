import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { getCurrentUser } from "@/features/church/current-user";
import { cn } from "@/lib/utils";
import { formatCommunityTime, useCommunityUserMoments } from "@/features/community/community-store";
import { COMMUNITY_KIND_META } from "@/features/community/community-types";

export function ProfileCommunityVersesSection({ dark = false }: { dark?: boolean }) {
  const userId = getCurrentUser().id;
  const moments = useCommunityUserMoments(userId);
  const verses = moments.filter((m) => m.kind === "reading" || m.kind === "agpeya" || m.kind === "prayer");

  if (!verses.length) {
    return (
      <div
        className={cn(
          "rounded-[22px] border px-5 py-8 text-center",
          dark ? "border-white/10 bg-white/[0.03]" : "border-[#e7c97a]/25 bg-white/75",
        )}
      >
        <BookOpen className={cn("mx-auto h-9 w-9", dark ? "text-[#f0d78c]/60" : "text-[#c98a3c]/70")} />
        <p className={cn("mt-3 text-[14px] font-extrabold", dark ? "text-white/90" : "text-[#3a2a18]")}>
          لا توجد آيات مشاركة بعد
        </p>
        <p className={cn("mt-2 text-[12px] font-medium", dark ? "text-white/45" : "text-[#6a543a]")}>
          شارك آية من الكتاب أو صلاة من الأجبية مع مجتمعك.
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
    <div className="space-y-2.5">
      {verses.slice(0, 12).map((moment) => {
        const meta = COMMUNITY_KIND_META[moment.kind];
        const body =
          moment.kind === "reading"
            ? moment.payload.reading?.text
            : moment.kind === "prayer"
              ? moment.payload.prayer?.body
              : moment.payload.agpeya?.excerpt ?? moment.payload.agpeya?.title;
        const ref =
          moment.kind === "reading"
            ? moment.payload.reading?.reference
            : moment.kind === "agpeya"
              ? "الأجبية"
              : moment.payload.prayer?.title;

        return (
          <div
            key={moment.id}
            className={cn(
              "rounded-[18px] border px-3.5 py-3 text-right",
              dark ? "border-white/10 bg-white/5" : "border-[#e7c97a]/22 bg-white/82",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full border px-2 py-0.5 text-[9px] font-extrabold"
                style={{ borderColor: `${meta.accent}44`, color: meta.accent, background: `${meta.accent}12` }}
              >
                {meta.badge}
              </span>
              <span className={cn("text-[10px] font-semibold", dark ? "text-white/40" : "text-[#9a8468]")}>
                {formatCommunityTime(moment.createdAt)}
              </span>
            </div>
            <p className={cn("mt-2 font-arabic-serif text-[14px] font-bold leading-relaxed line-clamp-3", dark ? "text-white/90" : "text-[#3a2a18]")}>
              {body}
            </p>
            {ref ? (
              <p className="mt-1 text-[11px] font-extrabold" style={{ color: meta.accent }}>
                {ref}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
