import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId } from "@/features/auth";
import type { ChurchSetupFormData } from "./types";

export type ChurchSetupSubmitResult = {
  setupRequestId: string;
  approvalId: string;
  requestNo: string;
};

function nextRequestNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `CH-${new Date().getFullYear()}-${n}`;
}

function buildDocuments(form: ChurchSetupFormData): unknown[] {
  if (!form.documentName?.trim()) return [];
  return [
    {
      id: "setup-doc-0",
      label: form.documentName.trim(),
      url: "",
      verified: false,
    },
  ];
}

function buildPayload(form: ChurchSetupFormData): Record<string, unknown> {
  return {
    locationLabel: form.locationLabel,
    mapLocation: form.mapLocation,
    priestRank: form.priestRank,
    priestDiocese: form.priestDiocese,
    ordinationDate: form.ordinationDate,
    priestIdNumber: form.priestIdNumber,
    priestNotes: form.priestNotes,
    churchPhone: form.churchPhone,
    whatsapp: form.whatsapp,
    facebook: form.facebook,
    youtube: form.youtube,
    website: form.website,
    servants: form.servants,
    additionalNotes: form.additionalNotes,
    submittedByName: form.priestName,
  };
}

function buildNotes(form: ChurchSetupFormData): string | null {
  const parts = [form.additionalNotes?.trim(), form.priestNotes?.trim()].filter(Boolean);
  return parts.length ? parts.join("\n\n") : null;
}

async function getSubmitterUserId(): Promise<string | null> {
  return getAuthUserId();
}

export async function insertChurchSetupRequest(
  form: ChurchSetupFormData,
): Promise<ChurchSetupSubmitResult | null> {
  const submittedBy = await getSubmitterUserId();
  const documents = buildDocuments(form);
  const payload = buildPayload(form);
  const notes = buildNotes(form);

  const setupRow = {
    church_name: form.churchName.trim(),
    diocese: form.diocese.trim() || null,
    governorate: form.governorate.trim() || null,
    city: form.city.trim() || null,
    address: form.address.trim() || null,
    location_lat: form.latitude,
    location_lng: form.longitude,
    priest_name: form.priestName.trim() || null,
    priest_phone: form.priestPhone.trim() || null,
    priest_email: form.priestEmail.trim() || null,
    submitted_by: submittedBy,
    status: "pending",
    documents,
    payload,
    notes,
    updated_at: new Date().toISOString(),
  };

  const { data: setup, error: setupError } = await supabase
    .from("church_setup_requests")
    .insert(setupRow)
    .select("id")
    .single();

  if (setupError || !setup) {
    console.error("supabase error", setupError);
    return null;
  }

  console.log("church_setup_request created", setup.id);

  const requestNo = nextRequestNumber();
  const approvalPayload = {
    churchName: form.churchName,
    diocese: form.diocese,
    governorate: form.governorate,
    city: form.city,
    address: form.address,
    priestName: form.priestName,
    phone: form.churchPhone || form.priestPhone,
    email: form.priestEmail,
    responsiblePriest: form.priestName,
    submittedBy: form.priestName,
    verificationStatus: "قيد المراجعة",
    applicantNotes: notes,
  };

  const approvalRow = {
    request_no: requestNo,
    kind: "church_setup",
    type: "church_setup",
    title: `طلب تأسيس — ${form.churchName.trim()}`,
    kind_label: "تأسيس كنيسة",
    submitted_at: new Date().toISOString(),
    status: "pending",
    priority: "high",
    source_table: "church_setup_requests",
    source_id: setup.id,
    submitted_by: submittedBy ?? form.priestName,
    payload: approvalPayload,
    documents,
    updated_at: new Date().toISOString(),
  };

  const { data: approval, error: approvalError } = await supabase
    .from("platform_approvals")
    .insert(approvalRow)
    .select("id")
    .single();

  if (approvalError || !approval) {
    console.error("supabase error", approvalError);
    return null;
  }

  console.log("platform_approval created", approval.id);

  return {
    setupRequestId: setup.id,
    approvalId: approval.id,
    requestNo,
  };
}

export async function updateChurchSetupRequest(
  setupRequestId: string,
  approvalId: string,
  form: ChurchSetupFormData,
): Promise<ChurchSetupSubmitResult | null> {
  const documents = buildDocuments(form);
  const payload = buildPayload(form);
  const notes = buildNotes(form);

  const { error: setupError } = await supabase
    .from("church_setup_requests")
    .update({
      church_name: form.churchName.trim(),
      diocese: form.diocese.trim() || null,
      governorate: form.governorate.trim() || null,
      city: form.city.trim() || null,
      address: form.address.trim() || null,
      location_lat: form.latitude,
      location_lng: form.longitude,
      priest_name: form.priestName.trim() || null,
      priest_phone: form.priestPhone.trim() || null,
      priest_email: form.priestEmail.trim() || null,
      status: "pending",
      documents,
      payload,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", setupRequestId);

  if (setupError) {
    console.error("supabase error", setupError);
    return null;
  }

  console.log("church_setup_request updated", setupRequestId);

  const approvalPayload = {
    churchName: form.churchName,
    diocese: form.diocese,
    city: form.city,
    address: form.address,
    priestName: form.priestName,
    phone: form.churchPhone || form.priestPhone,
    email: form.priestEmail,
    responsiblePriest: form.priestName,
    applicantNotes: notes,
  };

  const { error: approvalError } = await supabase
    .from("platform_approvals")
    .update({
      status: "pending",
      payload: approvalPayload,
      documents,
      admin_notes: null,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", approvalId);

  if (approvalError) {
    console.error("supabase error", approvalError);
    return null;
  }

  console.log("platform_approval updated", approvalId);

  const existing = await supabase.from("platform_approvals").select("request_no").eq("id", approvalId).maybeSingle();

  return {
    setupRequestId,
    approvalId,
    requestNo: existing.data?.request_no ?? nextRequestNumber(),
  };
}
