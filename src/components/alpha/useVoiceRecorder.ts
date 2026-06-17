import { useCallback, useRef, useState } from "react";
import { loadAlphaConnectSettings } from "./AlphaConnectSettings";
import { explainMicBlocked, requestMicStream } from "./mic-access";

type UseVoiceRecorderOptions = {
  onRecorded: (blob: Blob, durationMs: number) => Promise<boolean>;
  onError?: (message: string) => void;
};

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const mimeTypeRef = useRef("audio/webm");
  const busyRef = useRef(false);
  const pendingStopRef = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const finalizeRecording = useCallback(async () => {
    setIsRecording(false);
    setIsSaving(true);
    releaseStream();

    recorderRef.current = null;

    const durationMs = Date.now() - startedAtRef.current;
    const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
    chunksRef.current = [];

    if (blob.size < 64 || durationMs < 80) {
      setIsSaving(false);
      busyRef.current = false;
      optionsRef.current.onError?.("التسجيل قصير جداً — استمر بالضغط");
      return;
    }

    try {
      const settings = loadAlphaConnectSettings();
      if (!settings.allowVoiceMessages) {
        optionsRef.current.onError?.("الرسائل الصوتية معطّلة في الإعدادات");
        return;
      }
      const ok = await optionsRef.current.onRecorded(blob, durationMs);
      if (!ok) optionsRef.current.onError?.("تعذّر إرسال الرسالة الصوتية");
    } catch {
      optionsRef.current.onError?.("تعذّر إرسال الرسالة الصوتية");
    } finally {
      setIsSaving(false);
      busyRef.current = false;
    }
  }, [releaseStream]);

  const start = useCallback(async () => {
    if (busyRef.current) return;
    const blocked = explainMicBlocked();
    if (blocked) {
      optionsRef.current.onError?.(blocked);
      return;
    }

    busyRef.current = true;
    pendingStopRef.current = false;
    chunksRef.current = [];

    try {
      const stream = await requestMicStream();
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      mimeTypeRef.current = mimeType ?? "audio/webm";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        void finalizeRecording();
      };
      recorder.onerror = () => {
        busyRef.current = false;
        setIsRecording(false);
        setIsSaving(false);
        releaseStream();
        optionsRef.current.onError?.("تعذّر التسجيل");
      };
      startedAtRef.current = Date.now();
      recorder.start(250);
      setIsRecording(true);

      if (pendingStopRef.current) {
        pendingStopRef.current = false;
        if (recorder.state === "recording") recorder.stop();
      }
    } catch (err) {
      busyRef.current = false;
      setIsRecording(false);
      const message = err instanceof DOMException ? err.message : "تعذّر الوصول للميكروفون";
      optionsRef.current.onError?.(message);
      releaseStream();
    }
  }, [finalizeRecording, releaseStream]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || !busyRef.current) return;
    if (recorder.state === "recording") {
      recorder.stop();
      return;
    }
    pendingStopRef.current = true;
  }, []);

  return { start, stop, isRecording, isSaving };
}
