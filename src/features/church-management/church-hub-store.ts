import { useCallback, useEffect, useState } from "react";
import type { ChurchHubState, ChurchSetupFormData, ChurchSetupRequest } from "./types";
import { DEFAULT_CHURCH_HUB } from "./types";
import { insertChurchSetupRequest, updateChurchSetupRequest } from "./church-setup-api";

const STORAGE_KEY = "ab:church-hub";
const DRAFT_KEY = "ab:church-setup-draft";

function read(): ChurchHubState {
  if (typeof window === "undefined") return DEFAULT_CHURCH_HUB;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHURCH_HUB;
    return { ...DEFAULT_CHURCH_HUB, ...JSON.parse(raw) } as ChurchHubState;
  } catch {
    return DEFAULT_CHURCH_HUB;
  }
}

function write(state: ChurchHubState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("ab:church-hub", { detail: state }));
  } catch {
    /* ignore */
  }
}

export function readSetupDraft(): ChurchSetupFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChurchSetupFormData;
  } catch {
    return null;
  }
}

export function writeSetupDraft(data: ChurchSetupFormData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function clearSetupDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function buildLocalRequest(
  formData: ChurchSetupFormData,
  result: { setupRequestId: string; approvalId: string; requestNo: string },
  existing?: ChurchSetupRequest,
): ChurchSetupRequest {
  return {
    number: result.requestNo,
    submittedAt: Date.now(),
    statusLabel: "قيد المراجعة",
    formData,
    setupRequestId: result.setupRequestId,
    approvalId: result.approvalId,
    adminNotes: existing?.adminNotes,
  };
}

export function useChurchHub() {
  const [state, setState] = useState<ChurchHubState>(() => read());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener("ab:church-hub", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:church-hub", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((next: ChurchHubState) => {
    setState(next);
    write(next);
  }, []);

  const submitSetupRequest = useCallback(
    async (
      formData: ChurchSetupFormData,
    ): Promise<{ ok: true; churchCreated: boolean } | { ok: false; message: string }> => {
      setSubmitting(true);
      try {
        const result = await insertChurchSetupRequest(formData);
        if (!result.ok) return { ok: false, message: result.message };

        const request = buildLocalRequest(formData, result.data);
        persist({ status: "pending", request });
        writeSetupDraft(formData);
        return { ok: true, churchCreated: false };
      } finally {
        setSubmitting(false);
      }
    },
    [persist],
  );

  const resubmitRequest = useCallback(
    async (
      formData: ChurchSetupFormData,
    ): Promise<{ ok: true; churchCreated: boolean } | { ok: false; message: string }> => {
      setSubmitting(true);
      try {
        const existing = read();
        let result;

        if (existing.request?.setupRequestId && existing.request?.approvalId) {
          result = await updateChurchSetupRequest(
            existing.request.setupRequestId,
            existing.request.approvalId,
            formData,
          );
        } else {
          result = await insertChurchSetupRequest(formData);
        }

        if (!result.ok) return { ok: false, message: result.message };

        const request = buildLocalRequest(formData, result.data, existing.request);
        const churchCreated = result.data.churchCreated === true;
        persist({
          status: churchCreated ? "approved" : "pending",
          request,
          church: churchCreated
            ? {
                name: formData.churchName.trim(),
                diocese: formData.diocese.trim(),
                membersCount: 1,
                servantsCount: formData.servants.filter((s) => s.name.trim()).length,
              }
            : undefined,
        });
        writeSetupDraft(formData);
        return { ok: true, churchCreated: false };
      } finally {
        setSubmitting(false);
      }
    },
    [persist],
  );

  /** Dev-only: clears local hub + draft so the wizard can be tested again. */
  const devResetChurchSetup = useCallback(() => {
    if (!import.meta.env.DEV) return;
    clearSetupDraft();
    persist({ ...DEFAULT_CHURCH_HUB });
  }, [persist]);

  return {
    state,
    submitting,
    submitSetupRequest,
    resubmitRequest,
    devResetChurchSetup,
  };
}
