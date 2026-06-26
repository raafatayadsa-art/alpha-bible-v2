import { supabase } from "@/integrations/supabase/client";
import {
  PUBLISHER_LEGAL_POLICY_VERSION,
  type PublisherCopyrightReportKind,
} from "./publisher-legal";

export async function recordPublisherLegalConsent(
  consentKind: "publisher_application" | "content_upload",
  publisherId?: string,
): Promise<boolean> {
  const { error } = await supabase.rpc("record_publisher_legal_consent", {
    p_consent_kind: consentKind,
    p_publisher_id: publisherId ?? null,
    p_policy_version: PUBLISHER_LEGAL_POLICY_VERSION,
  });
  if (error) console.warn("[recordPublisherLegalConsent]", error.message);
  return !error;
}

export async function submitPublisherCopyrightReport(
  contentId: string,
  kind: PublisherCopyrightReportKind,
  description: string,
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("submit_publisher_copyright_report", {
    p_content_id: contentId,
    p_report_kind: kind,
    p_description: description.trim(),
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("invalid_description")) {
      return { ok: false, message: "اكتب وصفاً أوضح (10 أحرف على الأقل)." };
    }
    if (msg.includes("not_found")) {
      return { ok: false, message: "المحتوى غير متاح للإبلاغ." };
    }
    console.error("[submitPublisherCopyrightReport]", error);
    return { ok: false, message: "تعذّر إرسال البلاغ." };
  }
  return { ok: true };
}
