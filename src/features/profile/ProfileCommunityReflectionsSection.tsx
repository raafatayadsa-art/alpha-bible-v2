import { Link } from "@tanstack/react-router";
import { Feather, Share2 } from "lucide-react";
import type { BibleJournalEntry } from "@/lib/bible-journal-state";
import { useBibleJournal } from "@/lib/bible-journal-state";
import { shareSpiritualMomentToCommunity } from "@/features/community";
import { cn } from "@/lib/utils";

function formatJournalDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(new Date(ts));
  } catch {
    return "";
  }
}

function verseRef(entry: { bookName?: string; book?: string; chapter?: number; verse?: number }): string | null {
  const book = entry.bookName ?? entry.book;
  if (!book) return null;
  if (entry.chapter && entry.verse) return `${book} ${entry.chapter}:${entry.verse}`;
  if (entry.chapter) return `${book} ${entry.chapter}`;
  return book;
}

function shareReflection(entry: BibleJournalEntry, ref: string | null, preview: string) {
  shareSpiritualMomentToCommunity({
    kind: "reading",
    reading: {
      reference: ref ?? entry.title?.trim() ?? "تأمل",
      text: preview.slice(0, 280),
      bookRoute: entry.book,
      chapter: entry.chapter,
      verse: entry.verse,
    },
  });
}

export function ProfileCommunityReflectionsSection({ dark = false }: { dark?: boolean }) {
  const { meditations } = useBibleJournal();
  const items = [...meditations].sort((a, b) => b.updatedAt - a.updatedAt);

  if (!items.length) {
    return (
      <div
        className={cn(
          "rounded-[22px] border px-5 py-8 text-center",
          dark ? "border-white/10 bg-white/[0.03]" : "border-[#e7c97a]/25 bg-white/75",
        )}
      >
        <Feather className={cn("mx-auto h-9 w-9", dark ? "text-[#f0d78c]/60" : "text-[#8a6ec1]/70")} />
        <p className={cn("mt-3 text-[14px] font-extrabold", dark ? "text-white/90" : "text-[#3a2a18]")}>
          لا توجد تأملات بعد
        </p>
        <p className={cn("mt-2 text-[12px] font-medium", dark ? "text-white/45" : "text-[#6a543a]")}>
          دوّن تأملاتك من مذكرات الكتاب المقدس.
        </p>
        <Link
          to="/bible/notes"
          search={{ tab: "meditation" }}
          className="mt-4 inline-flex rounded-full border border-[#8a6ec1]/35 bg-[#8a6ec1]/10 px-4 py-2 text-[12px] font-extrabold text-[#5a3d92]"
        >
          ابدأ تأملاً
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.slice(0, 10).map((entry) => {
        const ref = verseRef(entry);
        const preview = entry.body.trim().split(/\n+/)[0] ?? entry.body;
        return (
          <div
            key={entry.id}
            className={cn(
              "rounded-[18px] border px-3.5 py-3 text-right",
              dark ? "border-white/10 bg-white/5" : "border-[#8a6ec1]/22 bg-white/82",
            )}
          >
            <div className="flex items-start gap-2">
              <Link
                to="/bible/notes"
                search={{ tab: "meditation" }}
                className="min-w-0 flex-1 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-[#8a6ec1]/35 bg-[#8a6ec1]/12 px-2 py-0.5 text-[9px] font-extrabold text-[#5a3d92]">
                    تأمل
                  </span>
                  <span className={cn("text-[10px] font-semibold", dark ? "text-white/40" : "text-[#9a8468]")}>
                    {formatJournalDate(entry.updatedAt)}
                  </span>
                </div>
                {entry.title?.trim() ? (
                  <p className={cn("mt-2 text-[13px] font-extrabold", dark ? "text-white/90" : "text-[#3a2a18]")}>
                    {entry.title.trim()}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "mt-1 font-arabic-serif text-[13px] font-medium leading-relaxed line-clamp-3",
                    dark ? "text-white/75" : "text-[#4a3828]",
                  )}
                >
                  {preview}
                </p>
                {ref ? <p className="mt-1.5 text-[11px] font-extrabold text-[#8a6ec1]">{ref}</p> : null}
              </Link>
              <button
                type="button"
                aria-label="مشاركة على مجتمعي"
                onClick={() => shareReflection(entry, ref, preview)}
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border active:scale-95",
                  dark
                    ? "border-[#1f8a5a]/35 bg-[#1f8a5a]/12 text-[#1f8a5a]"
                    : "border-[#1f8a5a]/30 bg-[#1f8a5a]/10 text-[#1f8a5a]",
                )}
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        );
      })}
      <Link
        to="/bible/notes"
        search={{ tab: "meditation" }}
        className={cn(
          "block rounded-2xl border py-2.5 text-center text-[12px] font-extrabold",
          dark
            ? "border-white/10 bg-white/5 text-[#f0d78c]/80"
            : "border-[#8a6ec1]/30 bg-[#8a6ec1]/10 text-[#5a3d92]",
        )}
      >
        كل التأملات في المذكرات
      </Link>
    </div>
  );
}
