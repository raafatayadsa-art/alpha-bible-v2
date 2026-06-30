import { supabase } from "@/integrations/supabase/client";

import { getAuthUserId, waitForAuthUserId } from "@/features/auth";

import type { ChurchSetupFormData } from "./types";



export type ChurchSetupSubmitResult = {
  setupRequestId: string;
  approvalId: string;
  requestNo: string;
  churchId?: string | null;
  churchCreated?: boolean;
};



export type ChurchSetupSubmitOutcome =

  | { ok: true; data: ChurchSetupSubmitResult }

  | { ok: false; message: string };



function nextRequestNumber(): string {

  const stamp = Date.now().toString(36).toUpperCase();

  const rand = Math.floor(100 + Math.random() * 900);

  return `CH-${new Date().getFullYear()}-${stamp}${rand}`;

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

  const waited = await waitForAuthUserId(6000);

  if (waited) return waited;

  return getAuthUserId();

}



function buildSetupRow(form: ChurchSetupFormData, submittedBy: string | null) {

  return {

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

    church_phone: form.churchPhone.trim() || null,

    submitted_by: submittedBy,

    status: "pending",

    documents: buildDocuments(form),

    payload: buildPayload(form),

    notes: buildNotes(form),

  };

}



function mapSubmitError(message: string): string {

  const msg = message.toLowerCase();

  if (msg.includes("invalid_form")) {

    return "يرجى التأكد من إكمال البيانات الأساسية قبل الإرسال.";

  }

  if (msg.includes("not_found")) {

    return "لم نجد الطلب السابق. أعد إرسال طلب جديد.";

  }

  if (msg.includes("jwt") || msg.includes("not authenticated")) {

    return "سجّل دخولك أولاً لإرسال طلب تأسيس الكنيسة.";

  }

  if (msg.includes("church_setup_requests") && msg.includes("does not exist")) {

    return "خدمة طلبات التأسيس غير مفعّلة على الخادم. تواصل مع الدعم.";

  }

  if (msg.includes("submit_church_setup_request") || msg.includes("pgrst202")) {

    return "خدمة الإرسال غير مفعّلة. يُرجى تشغيل RUN_CHURCH_SETUP_SUBMIT.sql على Supabase.";

  }

  return "تعذر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.";

}



function parseRpcResult(data: unknown): ChurchSetupSubmitResult | null {

  if (!data || typeof data !== "object") return null;

  const row = data as Record<string, unknown>;

  const setupRequestId = String(row.setupRequestId ?? row.setup_request_id ?? "");

  const approvalId = String(row.approvalId ?? row.approval_id ?? "");

  const requestNo = String(row.requestNo ?? row.request_no ?? "");

  if (!setupRequestId || !approvalId || !requestNo) return null;

  return { setupRequestId, approvalId, requestNo };

}



async function attachProvisionResult(
  result: ChurchSetupSubmitResult,
): Promise<ChurchSetupSubmitResult> {
  return result;
}



async function insertPlatformApproval(

  setupId: string,

  form: ChurchSetupFormData,

  submittedBy: string | null,

  notes: string | null,

  documents: unknown[],

): Promise<{ id: string; requestNo: string } | null> {

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

    source_id: setupId,

    submitted_by: submittedBy ?? form.priestName.trim(),

    payload: approvalPayload,

    documents,

    updated_at: new Date().toISOString(),

  };



  const { data: approval, error: approvalError } = await supabase

    .from("platform_approvals")

    .insert(approvalRow)

    .select("id, request_no")

    .single();



  if (approvalError || !approval) {

    console.error("[church_setup] platform_approval insert failed", approvalError?.message, approvalError?.code, approvalError?.details);

    return null;

  }



  return { id: approval.id, requestNo: approval.request_no ?? requestNo };

}



async function insertChurchSetupRequestDirect(

  form: ChurchSetupFormData,

): Promise<ChurchSetupSubmitOutcome> {

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

    console.error("[church_setup] insert failed", setupError?.message, setupError?.code, setupError?.details);

    return { ok: false, message: mapSubmitError(setupError?.message ?? "insert failed") };

  }



  console.log("church_setup_request created", setup.id);



  const approval = await insertPlatformApproval(setup.id, form, submittedBy, notes, documents);

  if (!approval) {

    const retry = await insertPlatformApproval(setup.id, form, submittedBy, notes, []);

    if (!retry) {

      console.error("[church_setup] approval retry failed — setup row kept", setup.id);

      return {
        ok: true,
        data: await attachProvisionResult({
          setupRequestId: setup.id,
          approvalId: setup.id,
          requestNo: nextRequestNumber(),
        }),
      };
    }

    return {
      ok: true,
      data: await attachProvisionResult({
        setupRequestId: setup.id,
        approvalId: retry.id,
        requestNo: retry.requestNo,
      }),
    };
  }

  console.log("platform_approval created", approval.id);

  return {
    ok: true,
    data: await attachProvisionResult({
      setupRequestId: setup.id,
      approvalId: approval.id,
      requestNo: approval.requestNo,
    }),
  };
}



export async function insertChurchSetupRequest(

  form: ChurchSetupFormData,

): Promise<ChurchSetupSubmitOutcome> {

  if (!form.churchName.trim() || !form.priestName.trim()) {

    return { ok: false, message: "يرجى إكمال اسم الكنيسة واسم الكاهن." };

  }



  const submittedBy = await getSubmitterUserId();

  const row = buildSetupRow(form, submittedBy);



  const { data, error } = await supabase.rpc("submit_church_setup_request", {

    p_row: row as never,

  });



  if (error) {

    console.error("[church_setup] rpc failed", error.message, error.code, error.details);

    const missingRpc =

      error.code === "PGRST202" ||

      error.message?.includes("submit_church_setup_request") ||

      error.message?.includes("Could not find the function");

    if (missingRpc) {

      return insertChurchSetupRequestDirect(form);

    }

    return { ok: false, message: mapSubmitError(error.message) };

  }



  const parsed = parseRpcResult(data);

  if (!parsed) {

    console.error("[church_setup] rpc invalid payload", data);

    return { ok: false, message: "تعذر إرسال الطلب. حاول مرة أخرى." };

  }



  console.log("church_setup_request created via rpc", parsed.setupRequestId);

  return { ok: true, data: await attachProvisionResult(parsed) };

}



export async function updateChurchSetupRequest(

  setupRequestId: string,

  approvalId: string,

  form: ChurchSetupFormData,

): Promise<ChurchSetupSubmitOutcome> {

  const row = buildSetupRow(form, await getSubmitterUserId());



  const { data, error } = await supabase.rpc("update_church_setup_request", {

    p_setup_id: setupRequestId,

    p_approval_id: approvalId,

    p_row: row as never,

  });



  if (error) {

    console.error("[church_setup] rpc update failed", error.message, error.code, error.details);

    const missingRpc =

      error.code === "PGRST202" ||

      error.message?.includes("update_church_setup_request") ||

      error.message?.includes("Could not find the function");

    if (missingRpc) {

      return updateChurchSetupRequestDirect(setupRequestId, approvalId, form);

    }

    return { ok: false, message: mapSubmitError(error.message) };

  }



  const parsed = parseRpcResult(data);

  if (!parsed) {

    return { ok: false, message: "تعذر تحديث الطلب. حاول مرة أخرى." };

  }



  return { ok: true, data: await attachProvisionResult(parsed) };

}



async function updateChurchSetupRequestDirect(

  setupRequestId: string,

  approvalId: string,

  form: ChurchSetupFormData,

): Promise<ChurchSetupSubmitOutcome> {

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

    console.error("[church_setup] update failed", setupError?.message, setupError?.code, setupError?.details);

    return { ok: false, message: mapSubmitError(setupError.message) };

  }



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

    console.error("[church_setup] approval update failed", approvalError?.message, approvalError?.code, approvalError?.details);

    return { ok: false, message: mapSubmitError(approvalError.message) };

  }



  const existing = await supabase.from("platform_approvals").select("request_no").eq("id", approvalId).maybeSingle();



  return {
    ok: true,
    data: await attachProvisionResult({
      setupRequestId,
      approvalId,
      requestNo: existing.data?.request_no ?? nextRequestNumber(),
    }),
  };
}


