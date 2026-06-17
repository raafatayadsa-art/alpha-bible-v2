import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { getAuthUserSync } from "@/features/auth";
import { downloadAlphaConnectAudio } from "@/features/alpha-connect/storage-api";
import {
  formatMessageRelativeTime,
  formatRetentionHint,
  formatVoiceDuration,
  isImmediateOnReadPolicy,
} from "@/features/alpha-connect/retention";
import type { AlphaConnectMessage } from "@/features/alpha-connect/types";

type AlphaConnectMessageThreadProps = {
  messages: AlphaConnectMessage[];
  loading?: boolean;
  error?: string | null;
  onMarkRead?: (messageId: string) => void;
  emptyHint?: string;
};

function OnReadTextObserver({
  message,
  onMarkRead,
}: {
  message: AlphaConnectMessage;
  onMarkRead?: (messageId: string) => void;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!onMarkRead || message.read_at || !isImmediateOnReadPolicy(message.retention_policy)) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.75)) {
          onMarkRead(message.id);
          observer.disconnect();
        }
      },
      { threshold: [0.75] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [message.id, message.read_at, message.retention_policy, onMarkRead]);

  return (
    <p ref={ref} className="text-[12px] leading-relaxed text-foreground whitespace-pre-wrap">
      {message.body}
    </p>
  );
}

export function AlphaConnectMessageThread({
  messages,
  loading,
  error,
  onMarkRead,
  emptyHint = "لا توجد رسائل بعد",
}: AlphaConnectMessageThreadProps) {
  const userId = getAuthUserSync()?.id;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const listenTargetRef = useRef<{ id: string; onMarkRead?: (id: string) => void } | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const playVoice = useCallback(
    async (message: AlphaConnectMessage) => {
      if (!message.audio_path) return;
      if (playingId === message.id) {
        audioRef.current?.pause();
        setPlayingId(null);
        return;
      }

      const blob = await downloadAlphaConnectAudio(message.audio_path);
      if (!blob) return;

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = url;
      listenTargetRef.current = {
        id: message.id,
        onMarkRead:
          message.sender_id !== userId && isImmediateOnReadPolicy(message.retention_policy)
            ? onMarkRead
            : undefined,
      };
      audio.onended = () => {
        setPlayingId(null);
        const target = listenTargetRef.current;
        if (target?.id === message.id && target.onMarkRead) {
          void target.onMarkRead(message.id);
        }
        listenTargetRef.current = null;
      };
      setPlayingId(message.id);
      void audio.play();
    },
    [playingId, onMarkRead, userId],
  );

  if (loading) {
    return (
      <div className="glass-strong rounded-3xl p-4 text-center text-[11px] text-muted-foreground">
        جاري تحميل الرسائل…
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-strong rounded-3xl p-4 text-center text-[11px] text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-4">
      <h3 className="mb-3 text-right text-sm font-semibold">الرسائل</h3>
      <div className="max-h-[280px] space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="py-2 text-center text-[11px] text-muted-foreground">{emptyHint}</p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === userId;
            const isVoice = message.kind === "voice" || message.kind === "ptt";
            const canConsume = !mine && onMarkRead && isImmediateOnReadPolicy(message.retention_policy);
            return (
              <div
                key={message.id}
                className={`flex ${mine ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-right ${
                    mine ? "bg-neon-green/15 border border-neon-green/25" : "bg-white/8 border border-white/10"
                  }`}
                >
                  {isVoice ? (
                    <button
                      type="button"
                      onClick={() => void playVoice(message)}
                      className="flex items-center gap-2 text-[12px] font-medium text-foreground"
                    >
                      <Play className={`h-4 w-4 ${playingId === message.id ? "text-neon-green" : ""}`} />
                      <span>{formatVoiceDuration(message.duration_ms ?? 0)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {message.kind === "ptt" ? "PTT" : "صوت"}
                      </span>
                    </button>
                  ) : canConsume ? (
                    <OnReadTextObserver message={message} onMarkRead={onMarkRead} />
                  ) : (
                    <p className="text-[12px] leading-relaxed text-foreground whitespace-pre-wrap">
                      {message.body}
                    </p>
                  )}
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    {formatMessageRelativeTime(message.created_at)}
                    {formatRetentionHint(message.retention_policy, message.expires_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
