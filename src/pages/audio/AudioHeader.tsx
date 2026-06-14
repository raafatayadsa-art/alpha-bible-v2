import { Bell, Menu, Search } from "lucide-react";

function GlassButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="glass-circle relative grid h-11 w-11 place-items-center rounded-full text-ink transition active:scale-95"
    >
      {children}
    </button>
  );
}

export function AudioHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <GlassButton label="القائمة">
        <Menu className="h-5 w-5" strokeWidth={2} />
      </GlassButton>

      <h1 className="text-[17px] font-bold tracking-tight text-foreground">
        الصوتيات والترانيم
      </h1>

      <div className="flex items-center gap-2">
        <GlassButton label="الإشعارات">
          <Bell className="h-5 w-5" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--gold-deep)] ring-2 ring-[var(--ivory)]" />
        </GlassButton>
        <GlassButton label="البحث">
          <Search className="h-5 w-5" strokeWidth={2} />
        </GlassButton>
      </div>
    </header>
  );
}
