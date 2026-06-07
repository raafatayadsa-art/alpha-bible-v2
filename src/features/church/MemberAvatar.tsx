import { useState } from "react";
import { User } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, #e8dff5 0%, #9b87c4 100%)",
  "linear-gradient(135deg, #e4f3ea 0%, #6aaf8a 100%)",
  "linear-gradient(135deg, #f5ead8 0%, #c79356 100%)",
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % GRADIENTS.length;
  return h;
}

function initials(name: string) {
  const part = name.trim().split(/\s+/)[0] ?? name;
  return [...part].slice(0, 2).join("") || "α";
}

const SIZES = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-[11px]",
} as const;

export function MemberAvatar({
  name,
  avatarUrl,
  size = "sm",
  className = "",
}: {
  name: string;
  avatarUrl?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const sz = SIZES[size];
  const [imgOk, setImgOk] = useState(true);
  const showImg = avatarUrl && imgOk;

  return (
    <span
      className={
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/80 shadow-[0_4px_10px_-6px_rgba(0,0,0,0.35)] font-extrabold text-white " +
        sz +
        " " +
        className
      }
      style={showImg ? undefined : { background: GRADIENTS[hashName(name)] }}
    >
      {showImg ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgOk(false)}
        />
      ) : initials(name) ? (
        <span>{initials(name)}</span>
      ) : (
        <User className="h-3.5 w-3.5 opacity-80" strokeWidth={2.2} />
      )}
    </span>
  );
}
