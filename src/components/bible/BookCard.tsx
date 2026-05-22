import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { PlaceholderArt } from "./primitives";

export function BookCard({
  name,
  chaptersCount,
  bookParam,
  tone = "gold",

  defaultSaved,
  onToggleSave,
}: {
  name: string;
  chaptersCount?: number;
  to?: string;
  tone?: "gold" | "purple" | "ivory";
  defaultSaved?: boolean;
  onToggleSave?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(!!defaultSaved);
  return (
    <div className="relative">
      <Pressable to={to} ariaLabel={name} className="rounded-2xl">
        <div className="rounded-2xl bg-[#fbf3e1] border border-[#efe2c4] p-2.5 text-right shadow-[0_8px_18px_-14px_rgba(120,80,30,0.4)]">
          <PlaceholderArt
            tone={tone}
            label={name.length > 14 ? name.slice(0, 12) + "…" : name}
            className="aspect-[4/5] w-full"
          />
          <h3 className="mt-2 text-[12px] font-extrabold text-[#3a2a18] leading-tight truncate">
            {name}
          </h3>
          {chaptersCount != null && (
            <p className="text-[10.5px] text-[#6a543a]">
              {chaptersCount} إصحاح
            </p>
          )}
        </div>
      </Pressable>
      <button
        type="button"
        aria-label={saved ? "إزالة من المحفوظات" : "حفظ السفر"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const next = !saved;
          setSaved(next);
          onToggleSave?.(next);
        }}
        className="absolute top-3 left-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 border border-[#efe2c4] text-[#7a4a26] shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] active:scale-90 transition-transform"
      >
        {saved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
