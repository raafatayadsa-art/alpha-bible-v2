import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #e8dff5 0%, #9b87c4 100%)",
  "linear-gradient(135deg, #dceaf7 0%, #6b9fd4 100%)",
  "linear-gradient(135deg, #f5ead8 0%, #c79356 100%)",
  "linear-gradient(135deg, #e4f3ea 0%, #6aaf8a 100%)",
  "linear-gradient(135deg, #f8f0e4 0%, #b8893a 100%)",
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % FALLBACK_GRADIENTS.length;
  return h;
}

export function firstNameFrom(full: string) {
  const cleaned = full.replace(/^أ\.\s*/, "").trim();
  const part = cleaned.split(/\s+/)[0] ?? cleaned;
  return part.replace(/\.$/, "");
}

export function initialsFrom(name: string) {
  const first = firstNameFrom(name);
  if (!first) return "α";
  const chars = [...first];
  return chars.slice(0, 2).join("");
}

type Size = "xs" | "sm" | "md";

const SIZE_CLASS: Record<Size, string> = {
  xs: "h-5 w-5 text-[8px] border",
  sm: "h-7 w-7 text-[10px] border-2",
  md: "h-9 w-9 text-[11px] border-2",
};

/** Circular user avatar — photo or Alpha-style initials fallback. */
export function PrayerUserAvatar({
  name,
  avatarUrl,
  size = "sm",
  className = "",
  anonymous = false,
}: {
  name: string;
  avatarUrl?: string;
  size?: Size;
  className?: string;
  anonymous?: boolean;
}) {
  const label = anonymous ? "?" : initialsFrom(name);
  const gradient = FALLBACK_GRADIENTS[hashName(name)];

  return (
    <Avatar
      className={`${SIZE_CLASS[size]} border-white/90 shadow-[0_2px_8px_-4px_rgba(60,40,16,0.35)] ${className}`}
    >
      {!anonymous && avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback
        className="font-extrabold text-[#3a2a18] border-0"
        style={{ background: anonymous ? "linear-gradient(135deg, #f0ebe4, #d8cfc0)" : gradient }}
      >
        {anonymous ? <UserIcon className="h-[55%] w-[55%] text-[#7a6a58] opacity-70" strokeWidth={2.2} /> : label}
      </AvatarFallback>
    </Avatar>
  );
}

/** Facebook-style overlapping pray-er avatars; falls back to count-only when no photos. */
export function PrayerStackAvatars({
  participants,
  total,
  size = "xs",
  maxVisible = 4,
}: {
  participants?: { name: string; avatarUrl?: string }[];
  total: number;
  size?: Size;
  maxVisible?: number;
}) {
  const withPhotos = (participants ?? []).filter((p) => p.avatarUrl);
  if (withPhotos.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#5a4a38] tabular-nums">
        {total.toLocaleString("ar-EG")}
      </span>
    );
  }

  const visible = withPhotos.slice(0, maxVisible);
  const extra = Math.max(0, total - visible.length);
  const overlap = size === "xs" ? "-ms-1.5" : "-ms-2";

  return (
    <span className="inline-flex items-center">
      {visible.map((p, i) => (
        <PrayerUserAvatar
          key={`${p.name}-${i}`}
          name={p.name}
          avatarUrl={p.avatarUrl}
          size={size}
          className={i > 0 ? overlap : ""}
        />
      ))}
      {extra > 0 ? (
        <span
          className={
            "inline-grid place-items-center rounded-full bg-[#f5ead8] border border-[#e8dcc8] font-extrabold text-[#5a4a38] shadow-sm " +
            (size === "xs" ? "h-5 w-5 text-[8px] " + overlap : "h-7 w-7 text-[9px] " + overlap)
          }
        >
          +{extra.toLocaleString("ar-EG")}
        </span>
      ) : null}
    </span>
  );
}
