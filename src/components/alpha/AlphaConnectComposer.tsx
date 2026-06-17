import { useState } from "react";
import { Send } from "lucide-react";

type AlphaConnectComposerProps = {
  onSendText: (body: string) => Promise<boolean>;
  sending?: boolean;
  disabled?: boolean;
};

export function AlphaConnectComposer({ onSendText, sending, disabled }: AlphaConnectComposerProps) {
  const [text, setText] = useState("");

  const submit = async () => {
    const value = text.trim();
    if (!value || sending || disabled) return;
    const ok = await onSendText(value);
    if (ok) setText("");
  };

  return (
    <div className="mt-3 flex items-end gap-2" dir="rtl">
      <div className="glass-strong min-w-0 flex-1 rounded-2xl border border-white/10 px-3 py-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="اكتب رسالة…"
          disabled={disabled || sending}
          className="w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={disabled || sending || !text.trim()}
        aria-label="إرسال"
        className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-neon-green transition active:scale-95 disabled:opacity-40"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
