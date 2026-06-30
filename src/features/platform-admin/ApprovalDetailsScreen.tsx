import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useApprovalsCenter } from "./approvals-store";
import {
  type DetailTab,
  RefAiPanel,
  RefApplicantCard,
  RefDetailsFooter,
  RefDetailsHeader,
  RefDetailTabs,
  RefDocumentLightbox,
  RefDocumentsSection,
  RefProposedServantsSection,
  RefReasonModal,
  RefReviewerNotes,
  RefSuccessModal,
  RefSystemNotes,
  RefVerificationPanel,
} from "./approvals-reference-ui";
import { MissionControlShell, usePlatformBack } from "./mission-control-ui";
import type { ApprovalDocument, ApprovalItem } from "./types";
import {
  canTakeApprovalDecision,
  enrichApprovalItem,
  getAiReview,
  getApprovalDocuments,
  getVerificationChecks,
  normalizeApprovalStatus,
} from "./types";
import { MC } from "./platform-store";

export function ApprovalDetailsScreen() {
  const { id } = useParams({ from: "/platform/approvals/$id" });
  const navigate = useNavigate();
  const goBack = usePlatformBack("/platform/approvals");
  const { refreshOne, startReview, approveRequest, rejectRequest, requestInfo } = useApprovalsCenter();
  const [item, setItem] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("details");
  const [sheet, setSheet] = useState<"reject" | "info" | "documents" | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ApprovalDocument | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const loaded = await refreshOne(id);
      if (cancelled) return;
      if (!loaded) {
        setItem(null);
        setLoadError("لم يتم العثور على الطلب في قاعدة البيانات");
        setLoading(false);
        return;
      }

      let current = loaded;
      if (normalizeApprovalStatus(loaded.status) === "pending") {
        await startReview(loaded.id);
        const updated = await refreshOne(loaded.id);
        if (updated) current = updated;
      }

      if (cancelled) return;
      setItem(current);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, refreshOne, startReview]);

  const enriched = useMemo(() => (item ? enrichApprovalItem(item) : null), [item]);
  const canDecide = enriched ? canTakeApprovalDecision(enriched.status) && !acting : false;
  const documents = enriched ? getApprovalDocuments(enriched) : [];
  const checks = enriched ? getVerificationChecks(enriched) : [];
  const ai = enriched ? getAiReview(enriched) : null;
  const approvalId = enriched?.id ?? id;

  const handleApprove = async () => {
    setActing(true);
    setActionError(null);
    const ok = await approveRequest(approvalId);
    setActing(false);
    if (ok) {
      setSuccess(true);
      return;
    }
    setActionError("تعذّر إتمام الاعتماد — تحقق من مزامنة حالة الناشر في قاعدة البيانات.");
  };

  if (loading) {
    return (
      <MissionControlShell toolbarActive="approvals">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: MC.purple }} />
          <p className="mt-3 text-[11px] font-bold" style={{ color: MC.muted }}>
            جاري تحميل بيانات الطلب…
          </p>
        </div>
      </MissionControlShell>
    );
  }

  if (!enriched) {
    return (
      <MissionControlShell toolbarActive="approvals">
        <div className="mt-8 rounded-[16px] border p-8 text-center" style={{ borderColor: MC.panelBorder }}>
          <p className="text-[12px] font-bold" style={{ color: MC.red }}>
            {loadError ?? "الطلب غير موجود"}
          </p>
          <Link to="/platform/approvals" className="mt-3 inline-block text-[11px] font-bold" style={{ color: MC.purple }}>
            ← العودة إلى Approvals Center
          </Link>
        </div>
      </MissionControlShell>
    );
  }

  const systemNotesText = [
    enriched.systemNotes,
    enriched.adminNotes ? `ملاحظات الإدارة: ${enriched.adminNotes}` : null,
    enriched.rejectionReason ? `سبب الرفض: ${enriched.rejectionReason}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <MissionControlShell toolbarActive="approvals" showNav={false}>
      <RefDetailsHeader
        requestNo={enriched.requestNo}
        status={enriched.status}
        onBack={goBack}
        onCopy={() => void navigator.clipboard?.writeText(enriched.requestNo)}
      />

      <RefDetailTabs active={tab} onChange={setTab} />

      {(tab === "details" || tab === "notes") && <RefApplicantCard item={enriched} />}

      {(tab === "details" || tab === "notes") && enriched.kind === "church_setup" && (
        <RefProposedServantsSection item={enriched} />
      )}

      {(tab === "documents" || tab === "details") && (
        <RefDocumentsSection documents={documents} onOpen={setPreviewDoc} />
      )}

      {(tab === "verification" || tab === "details") && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <RefVerificationPanel checks={checks} />
          {ai && <RefAiPanel ai={ai} />}
        </div>
      )}

      {(tab === "notes" || tab === "details") && (
        <RefReviewerNotes value={reviewerNotes} onChange={setReviewerNotes} />
      )}

      <RefSystemNotes notes={systemNotesText || "لا توجد ملاحظات نظام."} />

      {actionError ? (
        <p className="mb-3 text-center text-[11px] font-bold" style={{ color: MC.red }}>
          {actionError}
        </p>
      ) : null}

      {canDecide && (
        <RefDetailsFooter
          disabled={acting}
          onApprove={() => void handleApprove()}
          onReject={() => setSheet("reject")}
          onChanges={() => setSheet("info")}
          onRequestDocuments={enriched?.kind === "church_setup" ? () => setSheet("documents") : undefined}
        />
      )}

      <RefDocumentLightbox doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <RefReasonModal
        open={sheet === "reject"}
        title="سبب الرفض"
        placeholder="إجباري — اذكر سبب رفض الطلب"
        confirmLabel="تأكيد الرفض"
        variant="reject"
        onClose={() => setSheet(null)}
        onConfirm={(reason) => {
          setActing(true);
          void rejectRequest(approvalId, reason).then((ok) => {
            setActing(false);
            if (ok) navigate({ to: "/platform/approvals" });
          });
        }}
      />
      <RefReasonModal
        open={sheet === "info"}
        title="طلب معلومات إضافية"
        placeholder="إجباري — ما المطلوب من مقدم الطلب؟"
        confirmLabel="إرسال الطلب"
        variant="changes"
        onClose={() => setSheet(null)}
        onConfirm={(notes) => {
          setActing(true);
          void requestInfo(approvalId, notes).then((ok) => {
            setActing(false);
            if (ok) navigate({ to: "/platform/approvals" });
          });
        }}
      />
      <RefReasonModal
        open={sheet === "documents"}
        title="طلب مستندات"
        placeholder="اذكر المستندات المطلوبة (ترخيص الكنيسة، بطاقة الكاهن، صور…)"
        confirmLabel="إرسال طلب المستندات"
        variant="changes"
        onClose={() => setSheet(null)}
        onConfirm={(notes) => {
          setActing(true);
          void requestInfo(approvalId, `[مستندات مطلوبة]\n${notes.trim()}`).then((ok) => {
            setActing(false);
            if (ok) navigate({ to: "/platform/approvals" });
          });
        }}
      />

      <RefSuccessModal
        open={success}
        requestNo={enriched.requestNo}
        onClose={() => navigate({ to: "/platform/approvals" })}
      />
    </MissionControlShell>
  );
}
