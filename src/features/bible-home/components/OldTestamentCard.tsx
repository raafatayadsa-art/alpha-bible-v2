import { Link } from "@tanstack/react-router";
import { Scroll } from "lucide-react";
import { bibleHomeColors } from "../tokens/colors";

const OLD_TESTAMENT_COVER = "/bible-icons/categories/old-testament/cover.webp";

export function OldTestamentCard({
  imageUrl: _imageUrl,
  bookCount = 39,
}: {
  imageUrl?: string;
  bookCount?: number;
}) {
  return (
    <Link
      to="/books"
      search={{ testament: "old" }}
      className="group relative block min-h-[248px] overflow-hidden rounded-[28px] border transition active:scale-[0.99]"
      style={{
        borderColor: bibleHomeColors.cardBorder,
        boxShadow: `0 0 0 1px rgba(231,201,122,0.35), 0 14px 32px -14px ${bibleHomeColors.shadowSoft}, 0 0 24px -8px ${bibleHomeColors.glowGold}`,
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={OLD_TESTAMENT_COVER}
          alt=""
          draggable={false}
          className="block h-full w-full min-h-full min-w-full object-cover object-center"
          style={{ objectPosition: "center center" }}
          loading="lazy"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,248,233,0.12) 0%, rgba(120,80,30,0.35) 55%, rgba(58,42,24,0.82) 100%)",
        }}
      />
      <div className="absolute top-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-white/35 backdrop-blur-sm">
        <Scroll className="h-5 w-5" style={{ color: bibleHomeColors.goldDeep }} strokeWidth={2.2} />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 text-right text-white" dir="rtl">
        <h3 className="font-arabic-serif text-[15px] font-extrabold leading-tight">العهد القديم</h3>
        <p className="mt-0.5 text-[10px] font-bold text-white/85">{bookCount} سفر</p>
        <p
          className="mt-2 text-[9.5px] leading-snug text-white/90"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.45)" }}
        >
          من التكوين إلى ملاخي
        </p>
      </div>
    </Link>
  );
}
