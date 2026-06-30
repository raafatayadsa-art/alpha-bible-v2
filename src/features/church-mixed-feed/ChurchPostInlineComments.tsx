import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useAlphaAuth } from "@/features/auth";
import { MemberAvatar } from "@/features/church/MemberAvatar";
import { getCurrentUser } from "@/features/church/current-user";
import { addCommentAsCurrentUser, useComments } from "@/features/church/post-store";

type Props = {
  postId: string;
  open: boolean;
  tone: string;
};

export function ChurchPostInlineComments({ postId, open, tone }: Props) {
  const comments = useComments(postId);
  const [draft, setDraft] = useState("");
  const user = getCurrentUser();
  const { isAuthenticated } = useAlphaAuth();

  if (!open) return null;

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addCommentAsCurrentUser(postId, text);
    setDraft("");
  };

  return (
    <div
      className="border-t bg-black/25 px-3 py-2.5"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {comments.length === 0 ? (
        <p className="mb-2 text-center text-[10px] font-semibold text-white/40">كن أول من يعلّق</p>
      ) : (
        <ul className="mb-2 max-h-36 space-y-1.5 overflow-y-auto">
          {comments.slice(0, 6).map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-right" dir="rtl">
              <MemberAvatar name={c.name} size="xs" className="shrink-0" />
              <div className="min-w-0 flex-1 rounded-xl bg-white/6 px-2 py-1.5">
                <p className="text-[10px] font-extrabold text-white/75">{c.name}</p>
                <p className="text-[11px] leading-relaxed text-white/85">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <MemberAvatar name={user.name || "أنت"} avatarUrl={user.avatarUrl} size="xs" className="shrink-0" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب تعليقاً…"
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-[12px] font-medium text-white placeholder:text-white/35 outline-none focus:border-white/25"
            style={{ borderColor: `${tone}44` }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <button
            type="button"
            aria-label="إرسال"
            onClick={submit}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-white active:scale-95"
            style={{ borderColor: `${tone}55`, background: `${tone}22`, color: tone }}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <Link to="/login" className="block text-center text-[11px] font-bold" style={{ color: tone }}>
          سجّل الدخول للتعليق
        </Link>
      )}
    </div>
  );
}
