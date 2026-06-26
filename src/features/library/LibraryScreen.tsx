import { Link } from "@tanstack/react-router";
import { BookOpen, ShieldCheck } from "lucide-react";
import type { DiscoveryContentItem } from "@/features/publisher/publisher-discovery-api";
import type { PublisherRecord } from "@/features/publisher/types";
import cardChurch from "@/assets/home/card-church.jpg";

export function TrustedLibrariesSection({ libraries }: { libraries: PublisherRecord[] }) {
  if (!libraries.length) return null;

  return (
    <section className="mt-6 space-y-3">
      <h2 className="px-5 text-right text-[15px] font-extrabold text-[#3a3258]">مكتبات موثوقة</h2>
      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {libraries.map((lib) => {
          const cover = lib.coverUrl?.trim() || lib.logoUrl?.trim() || cardChurch;
          return (
            <Link
              key={lib.id}
              to="/publisher/$publisherId"
              params={{ publisherId: lib.id }}
              className="relative w-[220px] shrink-0 snap-start overflow-hidden rounded-[22px] ring-1 ring-[rgba(93,50,145,0.12)]"
            >
              <div className="relative h-[120px]">
                <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1030]/90 to-transparent" />
                {lib.isTrusted ? (
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#5D3291]/90 px-2 py-0.5 text-[9px] font-extrabold text-white">
                    <ShieldCheck className="h-3 w-3" />
                    موثوق
                  </span>
                ) : null}
              </div>
              <div className="bg-white/95 px-3 py-2.5 text-right">
                <p className="text-[12px] font-extrabold text-[#3a3258]">{lib.name}</p>
                <p className="mt-0.5 text-[10px] font-bold text-[#6b658a]">
                  {lib.contentCount.toLocaleString("ar-EG")} محتوى · {lib.followerCount.toLocaleString("ar-EG")} قارئ
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function LatestBooksSection({ books }: { books: DiscoveryContentItem[] }) {
  if (!books.length) return null;

  return (
    <section className="mt-8 space-y-3 pb-4">
      <h2 className="px-5 text-right text-[15px] font-extrabold text-[#3a3258]">أحدث الإصدارات</h2>
      <div dir="rtl" className="grid grid-cols-2 gap-3 px-5">
        {books.map((book) => {
          const cover = book.coverUrl?.trim() || cardChurch;
          return (
            <Link
              key={book.id}
              to="/publisher/$publisherId"
              params={{ publisherId: book.publisherId }}
              className="rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/90 p-2 text-right"
            >
              <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-xl">
                <img src={cover} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#5D3291]/90 text-white">
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="line-clamp-2 text-[11px] font-extrabold text-[#3a3258]">{book.title}</p>
              <p className="mt-0.5 truncate text-[9px] font-bold text-[#6b658a]">{book.publisherName}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
