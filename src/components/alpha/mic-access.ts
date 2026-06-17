import { loadAlphaConnectSettings } from "./AlphaConnectSettings";

type LegacyNavigator = Navigator & {
  getUserMedia?: (
    constraints: MediaStreamConstraints,
    success: (stream: MediaStream) => void,
    error: (error: DOMException) => void,
  ) => void;
  webkitGetUserMedia?: LegacyNavigator["getUserMedia"];
  mozGetUserMedia?: LegacyNavigator["getUserMedia"];
};

export function canRequestMic(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.mediaDevices?.getUserMedia) return true;
  const nav = navigator as LegacyNavigator;
  return Boolean(nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia);
}

/** Returns Arabic error text when mic cannot be used, otherwise null. */
export function explainMicBlocked(): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "الميكروفون متاح من المتصفح فقط";
  }

  if (!window.isSecureContext) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "الميكروفون غير متاح — جرّب إعادة تحميل الصفحة";
    }
    return "الميكروفون يحتاج HTTPS — افتح الرابط بـ https:// وليس http://";
  }

  if (!canRequestMic()) {
    return "المتصفح لا يدعم الميكروفون — استخدم Safari أو Chrome حديث";
  }

  if (typeof MediaRecorder === "undefined") {
    return "تسجيل الصوت غير مدعوم — حدّث iOS أو Safari";
  }

  return null;
}

export async function requestMicStream(): Promise<MediaStream> {
  const blocked = explainMicBlocked();
  if (blocked) {
    throw new DOMException(blocked, "NotSupportedError");
  }

  const settings = loadAlphaConnectSettings();
  const modernConstraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: settings.echoCancel,
      noiseSuppression: settings.noiseMute,
      autoGainControl: settings.audioEnhance,
    },
    video: false,
  };
  const simpleConstraints: MediaStreamConstraints = { audio: true, video: false };

  if (navigator.mediaDevices?.getUserMedia) {
    try {
      return await navigator.mediaDevices.getUserMedia(modernConstraints);
    } catch {
      return navigator.mediaDevices.getUserMedia(simpleConstraints);
    }
  }

  const nav = navigator as LegacyNavigator;
  const legacy = nav.getUserMedia ?? nav.webkitGetUserMedia ?? nav.mozGetUserMedia;
  if (!legacy) {
    throw new DOMException("الميكروفون غير مدعوم", "NotSupportedError");
  }

  return new Promise((resolve, reject) => {
    legacy.call(nav, simpleConstraints, resolve, reject);
  });
}
