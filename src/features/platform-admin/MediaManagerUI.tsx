import { useRef, useState } from "react";
import { FileText, Film, ImageIcon, Music, Plus, Star, X } from "lucide-react";
import { MC } from "./platform-store";
import { formatPlatformNumber, PP_GOLD } from "./PlatformPremiumUI";
import {
  MEDIA_CATEGORY_FILTERS,
  MEDIA_TAB_LABELS,
  type MediaCategoryFilterKey,
  type MediaManagerStats,
  type MediaManagerTab,
} from "./media-manager-api";

const STATUS_TABS: MediaManagerTab[] = ["pending", "approved", "rejected", "primary", "featured"];

const STAT_DEFS = [
  { key: "pending", emoji: "🟡", label: "Pending", color: MC.gold },
  { key: "approved", emoji: "🟢", label: "Approved", color: MC.green },
  { key: "rejected", emoji: "🔴", label: "Rejected", color: MC.red },
  { key: "total", emoji: "🖼", label: "Total Media", color: PP_GOLD },
  { key: "primary", emoji: "⭐", label: "Primary", color: MC.purple },
] as const;

export function MediaManagerGlassStats({ stats, loading }: { stats: MediaManagerStats | null; loading?: boolean }) {
  const total = stats ? stats.pending + stats.approved + stats.rejected : 0;

  const values: Record<string, string> = stats
    ? {
        pending: formatPlatformNumber(stats.pending),
        approved: formatPlatformNumber(stats.approved),
        rejected: formatPlatformNumber(stats.rejected),
        total: formatPlatformNumber(total),
        primary: formatPlatformNumber(stats.primary),
      }
    : { pending: "…", approved: "…", rejected: "…", total: "…", primary: "…" };

  return (
    <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {STAT_DEFS.map((item) => (
        <div
          key={item.key}
          className="rounded-[18px] border p-3 text-right"
          style={{
            borderColor: `${item.color}44`,
            background: MC.panel,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px -12px ${item.color}55`,
          }}
        >
          <p className="text-[18px] leading-none">{item.emoji}</p>
          <p
            className={`mt-2 font-mono text-[22px] font-extrabold tabular-nums leading-none ${loading ? "animate-pulse" : ""}`}
            style={{ color: item.color }}
          >
            {values[item.key]}
          </p>
          <p className="mt-1 text-[10px] font-extrabold" style={{ color: MC.white }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MediaCategoryTabs({
  value,
  onChange,
}: {
  value: MediaCategoryFilterKey;
  onChange: (key: MediaCategoryFilterKey) => void;
}) {
  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MEDIA_CATEGORY_FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            className="shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-extrabold transition active:scale-95"
            style={{
              borderColor: active ? `${PP_GOLD}66` : MC.panelBorder,
              background: active ? `${PP_GOLD}18` : "rgba(0,0,0,0.28)",
              color: active ? MC.white : MC.muted,
              boxShadow: active ? `0 0 16px -6px ${PP_GOLD}55` : undefined,
            }}
          >
            {filter.labelAr}
          </button>
        );
      })}
    </div>
  );
}

export function MediaStatusTabs({
  tab,
  stats,
  onChange,
}: {
  tab: MediaManagerTab;
  stats: MediaManagerStats | null;
  onChange: (tab: MediaManagerTab) => void;
}) {
  const countFor = (item: MediaManagerTab): number | null => {
    if (!stats) return null;
    if (item === "pending") return stats.pending;
    if (item === "approved") return stats.approved;
    if (item === "rejected") return stats.rejected;
    if (item === "featured") return stats.featured;
    return stats.primary;
  };

  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STATUS_TABS.map((item) => {
        const active = tab === item;
        const count = countFor(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className="flex shrink-0 items-center gap-1.5 rounded-[12px] border px-3 py-2 transition active:scale-[0.98]"
            style={{
              borderColor: active ? `${MC.gold}55` : MC.panelBorder,
              background: active ? `${MC.gold}15` : "rgba(0,0,0,0.25)",
            }}
          >
            <span className="text-[10px] font-extrabold" style={{ color: active ? MC.gold : MC.muted }}>
              {MEDIA_TAB_LABELS[item]}
            </span>
            {count != null ? (
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-extrabold tabular-nums"
                style={{
                  background: active ? MC.gold : `${MC.panelBorder}`,
                  color: active ? MC.midnight : MC.white,
                }}
              >
                {formatPlatformNumber(count)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function MediaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[16px] border"
          style={{ borderColor: MC.panelBorder, background: MC.panel }}
        >
          <div
            className="aspect-[4/3] animate-pulse"
            style={{
              background: `linear-gradient(110deg, rgba(255,255,255,0.04) 8%, rgba(255,255,255,0.1) 18%, rgba(255,255,255,0.04) 33%)`,
              backgroundSize: "200% 100%",
              animation: "mediaShimmer 1.4s ease-in-out infinite",
            }}
          />
          <div className="space-y-2 px-2.5 py-2.5">
            <div className="ms-auto h-2.5 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="flex justify-between gap-2">
              <div className="h-4 w-12 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-10 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-white/8" />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes mediaShimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}

const UPLOAD_OPTIONS = [
  { id: "image", label: "رفع صورة", accept: "image/*", icon: ImageIcon },
  { id: "video", label: "رفع فيديو", accept: "video/*", icon: Film },
  { id: "pdf", label: "رفع PDF", accept: "application/pdf", icon: FileText },
  { id: "audio", label: "رفع صوت", accept: "audio/*", icon: Music },
] as const;

export function MediaUploadFab({
  uploading,
  onPick,
}: {
  uploading?: boolean;
  onPick: (file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [accept, setAccept] = useState("image/*");

  const openPicker = (acceptType: string) => {
    setAccept(acceptType);
    setOpen(false);
    window.setTimeout(() => inputRef.current?.click(), 0);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />

      {open ? (
        <button
          type="button"
          aria-label="إغلاق"
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className="fixed z-[60] flex flex-col items-end gap-2"
        style={{
          right: "max(16px, env(safe-area-inset-right))",
          bottom: "calc(72px + max(env(safe-area-inset-bottom), 12px))",
        }}
      >
        {open
          ? UPLOAD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={uploading}
                  onClick={() => openPicker(opt.accept)}
                  className="flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold shadow-lg transition active:scale-95 disabled:opacity-50"
                  style={{
                    borderColor: `${PP_GOLD}55`,
                    background: MC.panel,
                    color: MC.white,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.55), 0 0 20px -8px ${PP_GOLD}44`,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: PP_GOLD }} />
                  {opt.label}
                </button>
              );
            })
          : null}

        <button
          type="button"
          aria-label={open ? "إغلاق" : "رفع وسيط"}
          disabled={uploading}
          onClick={() => setOpen((v) => !v)}
          className="grid h-14 w-14 place-items-center rounded-full border shadow-xl transition active:scale-95 disabled:opacity-60"
          style={{
            borderColor: `${PP_GOLD}66`,
            background: `linear-gradient(155deg, ${PP_GOLD}, ${MC.greenBright})`,
            color: MC.midnight,
            boxShadow: `0 10px 32px rgba(0,0,0,0.55), 0 0 28px ${PP_GOLD}66`,
          }}
        >
          {uploading ? (
            <Star className="h-6 w-6 animate-spin" />
          ) : open ? (
            <X className="h-6 w-6" strokeWidth={2.5} />
          ) : (
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  );
}
