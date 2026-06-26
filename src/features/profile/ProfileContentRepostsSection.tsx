import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { cn } from "@/lib/utils";
import {
  PROFILE_CONTENT_REPOSTS_EVENT,
  readProfileContentReposts,
  type ProfileContentRepost,
} from "@/lib/alpha-share-sheet";

function ContentRepostRow({ item, dark }: { item: ProfileContentRepost; dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-2.5",
        dark ? "border-white/10 bg-white/5" : "border-[#efe2c4]/90 bg-white/88",
      )}
    >
      <img
        src={item.imageSrc}
        alt=""
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1 text-right">
        <p className={cn("text-[12px] font-extrabold line-clamp-1", dark ? "text-white/90" : "text-alpha")}>
          {item.title}
        </p>
        <p className={cn("mt-0.5 text-[10px] line-clamp-2", dark ? "text-white/55" : "text-alpha-muted")}>
          {item.body}
        </p>
        {item.meta ? (
          <p className={cn("mt-1 text-[9px] font-bold", dark ? "text-[#f0d78c]/70" : "text-alpha-gold-deep")}>
            {item.meta}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileContentRepostsSection({ dark = false }: { dark?: boolean }) {
  const [items, setItems] = useState<ProfileContentRepost[]>(() => readProfileContentReposts());

  useEffect(() => {
    const sync = () => setItems(readProfileContentReposts());
    window.addEventListener(PROFILE_CONTENT_REPOSTS_EVENT, sync);
    return () => window.removeEventListener(PROFILE_CONTENT_REPOSTS_EVENT, sync);
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-4 px-4">
      <HeroLedgerStylesHost />
      <div
        className={cn(
          "rounded-[22px] border p-3.5",
          dark ? "border-white/10 bg-white/[0.03]" : "border-alpha bg-alpha-surface-glass",
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Share2 className={cn("h-4 w-4", dark ? "text-[#f0d78c]" : "text-alpha-glyph")} />
          <div className="text-right">
            <h3 className={cn("text-[13px] font-extrabold", dark ? "text-white/92" : "text-alpha-heading")}>
              انتشار على صفحتي
            </h3>
            <p className={cn("text-[10px] font-medium", dark ? "text-white/45" : "text-alpha-muted")}>
              ما شاركته مع مجتمع ألفا
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => (
            <ContentRepostRow key={item.id} item={item} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  );
}
