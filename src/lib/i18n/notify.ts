import { toast } from "sonner";
import i18n from "./index";

export function notify(key: string, values?: Record<string, unknown>) {
  toast(i18n.t(key, { ns: "notifications", ...(values ?? {}) }));
}

export function notifySuccess(key: string, values?: Record<string, unknown>) {
  toast.success(i18n.t(key, { ns: "notifications", ...(values ?? {}) }));
}

export function notifyError(key: string, values?: Record<string, unknown>) {
  toast.error(i18n.t(key, { ns: "notifications", ...(values ?? {}) }));
}
