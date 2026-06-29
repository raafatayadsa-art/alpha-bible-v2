import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { CyberSearch, MissionSubShell } from "./mission-control-ui";
import { MC } from "./platform-store";
import { PlatformPremiumStyles } from "./PlatformPremiumUI";
import { MediaManagerSidePanel } from "./MediaManagerSidePanel";
import {
  MediaCategoryTabs,
  MediaGridSkeleton,
  MediaManagerGlassStats,
  MediaStatusTabs,
  MediaUploadFab,
} from "./MediaManagerUI";
import {
  approveMediaItem,
  deleteMediaItem,
  fetchMediaLibraryRows,
  fetchMediaManagerStats,
  formatMediaDate,
  mediaCategoryLabel,
  MEDIA_CATEGORY_FILTERS,
  MEDIA_STATUS_LABELS_AR,
  MEDIA_TYPE_LABELS,
  rejectMediaItem,
  setMediaPrimary,
  uploadMediaFile,
  type MediaCategoryFilterKey,
  type MediaLibraryRow,
  type MediaManagerStats,
  type MediaManagerTab,
} from "./media-manager-api";

function statusColor(status: MediaLibraryRow["status"]): string {
  if (status === "approved") return MC.green;
  if (status === "rejected") return MC.red;
  return MC.gold;
}

export function MediaManagerScreen() {
  const [tab, setTab] = useState<MediaManagerTab>("pending");
  const [categoryFilter, setCategoryFilter] = useState<MediaCategoryFilterKey>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState<MediaLibraryRow[]>([]);
  const [stats, setStats] = useState<MediaManagerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [acting, setActing] = useState(false);
  const [selected, setSelected] = useState<MediaLibraryRow | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const categoryDbValue = useMemo(() => {
    const match = MEDIA_CATEGORY_FILTERS.find((f) => f.key === categoryFilter);
    return match?.dbValue ?? null;
  }, [categoryFilter]);

  const uploadCategory = categoryDbValue ?? "hero";

  const reload = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    const [nextRows, nextStats] = await Promise.all([
      fetchMediaLibraryRows(tab, { category: categoryDbValue, search: debouncedSearch }),
      fetchMediaManagerStats(),
    ]);
    setRows(nextRows);
    setStats(nextStats);
    setLoading(false);
  }, [tab, categoryDbValue, debouncedSearch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const refreshAfterAction = async (options?: { closeId?: string; keepId?: string }) => {
    const [nextRows, nextStats] = await Promise.all([
      fetchMediaLibraryRows(tab, { category: categoryDbValue, search: debouncedSearch }),
      fetchMediaManagerStats(),
    ]);
    setRows(nextRows);
    setStats(nextStats);
    if (options?.closeId) {
      setSelected(null);
    } else if (options?.keepId) {
      setSelected(nextRows.find((r) => r.id === options.keepId) ?? null);
    }
  };

  const runAction = async (fn: () => Promise<{ ok: boolean; error?: string }>, closeOnSuccess = true) => {
    if (!selected) return;
    setActing(true);
    setActionError(null);
    const result = await fn();
    setActing(false);
    if (!result.ok) {
      setActionError(result.error ?? "تعذّر تنفيذ العملية");
      return;
    }
    const keepId = closeOnSuccess ? undefined : selected.id;
    if (closeOnSuccess) setSelected(null);
    await refreshAfterAction({ closeId: closeOnSuccess ? selected.id : undefined, keepId });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setActionError(null);
    const result = await uploadMediaFile(file, uploadCategory);
    setUploading(false);
    if (!result.ok) {
      setActionError(result.error ?? "تعذّر رفع الوسيط");
      return;
    }
    setTab("pending");
    await reload();
  };

  const showSkeleton = loading || rows.length === 0;

  return (
    <MissionSubShell title="Media Manager" titleEn="إدارة جميع وسائط Alpha">
      <PlatformPremiumStyles />

      <MediaManagerGlassStats stats={stats} loading={loading} />

      <CyberSearch
        value={search}
        onChange={setSearch}
        placeholder="بحث: اسم القديس · عنوان الصورة · اسم المستخدم"
      />

      <MediaCategoryTabs value={categoryFilter} onChange={setCategoryFilter} />

      <MediaStatusTabs tab={tab} stats={stats} onChange={setTab} />

      {actionError ? (
        <div
          className="mb-3 rounded-[12px] border px-3 py-2 text-[10px] font-bold"
          style={{ borderColor: `${MC.red}55`, background: `${MC.red}11`, color: MC.red }}
        >
          {actionError}
        </div>
      ) : null}

      {showSkeleton ? (
        <MediaGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                setActionError(null);
                setSelected(row);
              }}
              className="group overflow-hidden rounded-[16px] border text-right transition active:scale-[0.98]"
              style={{
                borderColor: MC.panelBorder,
                background: MC.panel,
                boxShadow: `0 10px 28px -12px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)`,
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={row.previewUrl}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-8">
                  <p className="truncate text-[10px] font-extrabold text-white">{row.title ?? "بدون عنوان"}</p>
                </div>
                {row.isPrimary ? (
                  <span
                    className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full"
                    style={{ background: `${MC.gold}cc`, color: MC.midnight }}
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </span>
                ) : null}
              </div>
              <div className="space-y-1 px-2.5 py-2">
                <p className="truncate text-[9px] font-bold" style={{ color: MC.muted }}>
                  {row.saintName ?? mediaCategoryLabel(row.category)}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[8px] font-extrabold"
                    style={{
                      color: statusColor(row.status),
                      background: `${statusColor(row.status)}18`,
                    }}
                  >
                    {MEDIA_STATUS_LABELS_AR[row.status]}
                  </span>
                  <span className="text-[8px] font-bold" style={{ color: MC.cyan }}>
                    {MEDIA_TYPE_LABELS[row.mediaType] ?? row.mediaType}
                  </span>
                </div>
                <p className="truncate text-[8px] font-bold" style={{ color: MC.muted }}>
                  {row.uploaderName} · {formatMediaDate(row.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <MediaUploadFab uploading={uploading} onPick={(file) => void handleUpload(file)} />

      <MediaManagerSidePanel
        row={selected}
        acting={acting}
        rejectOpen={rejectOpen}
        actionError={actionError}
        onClose={() => {
          setRejectOpen(false);
          setSelected(null);
        }}
        onApprove={() => void runAction(() => approveMediaItem(selected!.id))}
        onReject={() => setRejectOpen(true)}
        onRejectConfirm={(reason) =>
          void runAction(() => rejectMediaItem(selected!.id, reason)).then(() => setRejectOpen(false))
        }
        onRejectClose={() => setRejectOpen(false)}
        onSetPrimary={() => void runAction(() => setMediaPrimary(selected!), false)}
        onDelete={() => {
          if (!selected) return;
          if (!window.confirm("حذف هذا الوسيط نهائياً؟")) return;
          void runAction(() => deleteMediaItem(selected));
        }}
      />
    </MissionSubShell>
  );
}
