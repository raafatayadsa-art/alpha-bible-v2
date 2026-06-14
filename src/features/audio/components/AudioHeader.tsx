import { Link } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { AlphaNotificationButton } from "@/components/navigation/AlphaNotificationButton";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";

function GlassButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="glass-circle relative grid h-11 w-11 place-items-center rounded-full text-[var(--ink)] transition active:scale-95"
    >
      {children}
    </button>
  );
}

export function AudioHeader() {
  const { openNavHub } = useAlphaNavigation();

  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <GlassButton label="القائمة" onClick={openNavHub}>
        <Menu className="h-5 w-5" strokeWidth={2} />
      </GlassButton>

      <h1 className="text-[17px] font-bold tracking-tight text-foreground">
        الصوتيات والترانيم
      </h1>

      <div className="flex items-center gap-2">
        <AlphaNotificationButton />
        <Link to="/search" aria-label="البحث" className="glass-circle relative grid h-11 w-11 place-items-center rounded-full text-[var(--ink)] transition active:scale-95">
          <Search className="h-5 w-5" strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
