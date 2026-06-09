import type { Member } from "./types";

/**
 * Pure-CSS gradient avatar with Arabic initials.
 * `color` is an oklch hue value (e.g. "260").
 */
export function Avatar({
  member,
  size = 28,
  ring = true,
}: {
  member: Member;
  size?: number;
  ring?: boolean;
}) {
  const hue = member.color;
  const bg = `linear-gradient(135deg, oklch(0.72 0.12 ${hue}), oklch(0.5 0.15 ${hue}))`;
  return (
    <span
      className={
        "inline-flex items-center justify-center font-display font-bold text-white shrink-0 " +
        (ring ? "ring-2 ring-card" : "")
      }
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        fontSize: Math.max(9, size * 0.36),
        letterSpacing: "-0.02em",
      }}
      aria-label={member.name}
    >
      {member.initials}
    </span>
  );
}

export function MemberStack({
  members,
  extra,
  size = 26,
}: {
  members: Member[];
  extra?: number;
  size?: number;
}) {
  const visible = members.slice(0, 3);
  return (
    <div className="flex items-center" dir="ltr">
      <div className="flex -space-x-2">
        {visible.map((m) => (
          <Avatar key={m.id} member={m} size={size} />
        ))}
      </div>
      {extra && extra > 0 ? (
        <span
          className="mr-2 ml-0 text-[11px] font-display font-bold text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full shadow-soft"
          style={{ marginInlineStart: 8 }}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}
