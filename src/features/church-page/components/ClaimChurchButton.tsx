import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircle, ShieldPlus } from "lucide-react";
import { useAlphaAuth } from "@/features/auth";
import type { ChurchPageStatus } from "../page-status";
import { submitChurchClaim } from "../church-claim-api";

type Props = {
  churchId: string;
  churchName?: string;
  pageStatus: ChurchPageStatus;
  className?: string;
  onStatusChange?: (status: ChurchPageStatus) => void;
};

export function ClaimChurchButton({
  churchId,
  churchName,
  pageStatus,
  className = "",
  onStatusChange,
}: Props) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAlphaAuth();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => setFeedback(null), [churchId, pageStatus]);

  const handleClaim = useCallback(async () => {
    setFeedback(null);
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (pageStatus === "verified" || pageStatus === "pending_claim" || pageStatus === "suspended") {
      return;
    }

    setSubmitting(true);
    const result = await submitChurchClaim(churchId);
    setSubmitting(false);

    if (result.ok) {
      onStatusChange?.(result.pageStatus);
      setFeedback("تم إرسال طلب الاستلام — قيد المراجعة.");
      return;
    }

    if (result.reason === "not_authenticated") {
      navigate({ to: "/login" });
      return;
    }

    setFeedback(result.message);
  }, [churchId, isAuthenticated, navigate, onStatusChange, pageStatus]);

  if (pageStatus === "verified") return null;

  if (pageStatus === "pending_claim") {
    return (
      <p className={`text-center text-[11px] font-bold leading-relaxed ${className}`} style={{ color: "#6b658a" }}>
        طلب الاستلام قيد المراجعة من الإدارة.
      </p>
    );
  }

  if (pageStatus === "suspended") {
    return (
      <p className={`text-center text-[11px] font-bold leading-relaxed text-red-700 ${className}`}>
        لا يمكن طلب إدارة كنيسة موقوفة.
      </p>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleClaim()}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border h-11 text-[13px] font-extrabold active:scale-[0.98] transition-transform disabled:opacity-70"
        style={{ borderColor: "#5D3291", color: "#5D3291", background: "rgba(255,255,255,0.85)" }}
      >
        {submitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldPlus className="h-4 w-4" strokeWidth={2.3} />
        )}
        {submitting ? "جاري الإرسال…" : churchName ? `طلب إدارة ${churchName}` : "طلب إدارة الكنيسة"}
      </button>
      {feedback ? (
        <p className="mt-2 text-center text-[11px] font-bold leading-relaxed" style={{ color: "#5D3291" }}>
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
