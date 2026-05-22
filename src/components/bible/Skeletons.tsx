import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#efe2c4]/60 rounded-xl",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:animate-[shimmer_1.6s_ease-in-out_infinite]",
        className,
      )}
    />
  );
}

export function BookGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-[#fbf3e1]/70 border border-[#efe2c4] p-2.5"
        >
          <Shimmer className="aspect-[4/5] w-full rounded-xl" />
          <Shimmer className="mt-2 h-3 w-3/4 rounded-md" />
          <Shimmer className="mt-1 h-2 w-1/2 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ChapterGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-5 gap-2.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <Shimmer className="aspect-square rounded-2xl" />
        </li>
      ))}
    </ul>
  );
}

export function VerseSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-5 space-y-2.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/55 border border-[#efe2c4]/70 px-3.5 py-3"
        >
          <Shimmer className="h-3 w-full rounded-md" />
          <Shimmer className="mt-2 h-3 w-[92%] rounded-md" />
          <Shimmer className="mt-2 h-3 w-[78%] rounded-md" />
        </div>
      ))}
    </div>
  );
}
