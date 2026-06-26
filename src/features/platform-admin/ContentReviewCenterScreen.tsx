import { useCallback, useEffect, useState } from "react";
import { Check, Eye, Loader2, X, Shield } from "lucide-react";
import { PUBLISHER_CONTENT_KIND_LABELS } from "@/features/publisher";
import {
  fetchPendingContentReviews,
  patchContentReviewStatus,
  type ContentReviewRow,
} from "./content-review-api";
import { ContentReviewPreviewSheet } from "./ContentReviewPreviewSheet";
import { MissionSubShell } from "./mission-control-ui";
import { MC } from "./platform-store";
import { PlatformControlHero, PlatformPremiumStyles, formatPlatformNumber } from "./PlatformPremiumUI";

export function ContentReviewCenterScreen() {
  const [rows, setRows] = useState<ContentReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [previewRow, setPreviewRow] = useState<ContentReviewRow | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setRows(await fetchPendingContentReviews());
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const decide = async (id: string, status: "approved" | "rejected" | "needs_changes") => {
    setActingId(id);
    await patchContentReviewStatus(id, status);
    setActingId(null);
    setPreviewRow((current) => (current?.id === id ? null : current));
    await reload();
  };

  return (
    <MissionSubShell title="Content Review Center" titleEn="ALPHA-110 · مراجعة محتوى الناشرين">
      <PlatformPremiumStyles />
      <PlatformControlHero subtitle="ألبومات · ترانيم · كتب · محاضرات — Pending Review فقط" />

      <div
        className="mb-3 flex items-center gap-2 rounded-[14px] border px-3 py-2.5"
        style={{ borderColor: MC.panelBorder, background: MC.panel }}
      >
        <Shield className="h-4 w-4" style={{ color: MC.gold }} />
        <p className="text-[11px] font-bold" style={{ color: MC.muted }}>
          {formatPlatformNumber(rows.length)} عنصر بانتظار المراجعة — لا يُنشر أي محتوى قبل الاعتماد.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: MC.purple }} />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-[14px] border px-3 py-2.5"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              <div className="text-right">
                <p className="text-[12px] font-extrabold" style={{ color: MC.white }}>
                  {row.title}
                </p>
                <p className="mt-0.5 text-[10px] font-bold" style={{ color: MC.muted }}>
                  {PUBLISHER_CONTENT_KIND_LABELS[row.contentKind]} · {row.publisherName}
                </p>
                {row.description ? (
                  <p className="mt-1 text-[10px] font-bold leading-relaxed" style={{ color: MC.cyan }}>
                    {row.description}
                  </p>
                ) : null}
              </div>
              <div className="mt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewRow(row)}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-full border py-2 text-[10px] font-extrabold"
                  style={{ borderColor: `${MC.cyan}44`, color: MC.cyan, background: `${MC.cyan}11` }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  عرض المحتوى
                </button>
                {actingId === row.id ? (
                  <div className="flex justify-center py-1">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: MC.purple }} />
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => void decide(row.id, "approved")}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-extrabold text-emerald-300"
                      style={{ background: "rgba(74,143,110,0.18)" }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      قبول
                    </button>
                    <button
                      type="button"
                      onClick={() => void decide(row.id, "needs_changes")}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-extrabold text-amber-300"
                      style={{ background: "rgba(196,165,116,0.15)" }}
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => void decide(row.id, "rejected")}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-extrabold text-red-300"
                      style={{ background: "rgba(184,92,88,0.18)" }}
                    >
                      <X className="h-3.5 w-3.5" />
                      رفض
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {!rows.length ? (
            <p className="py-10 text-center text-[11px] font-bold" style={{ color: MC.muted }}>
              لا يوجد محتوى pending حالياً.
            </p>
          ) : null}
        </div>
      )}

      <ContentReviewPreviewSheet
        row={previewRow}
        acting={previewRow ? actingId === previewRow.id : false}
        onClose={() => setPreviewRow(null)}
        onDecide={(status) => {
          if (previewRow) void decide(previewRow.id, status);
        }}
      />
    </MissionSubShell>
  );
}
