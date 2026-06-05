import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  ChevronLeft, Send, ShieldCheck, Lock, Phone, MessageCircle, Check, CheckCheck,
} from "lucide-react";
import { CopticWatermark } from "@/components/coptic";
import {
  getChurchContact,
  SEED_CONVERSATIONS,
  ROLE_TONE_MAP,
  type ChatMessage,
} from "@/data/church-contacts";

export const Route = createFileRoute("/church/chat/$contactId")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ألفا — محادثة خاصة" }],
  }),
  component: ChatScreen,
});

const messageSchema = z
  .string()
  .trim()
  .min(1, "الرسالة فارغة")
  .max(500, "الحد الأقصى 500 حرف");

function formatTime(minutesAgo: number) {
  const d = new Date(Date.now() - minutesAgo * 60_000);
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

function ChatScreen() {
  const { contactId } = useParams({ from: "/church/chat/$contactId" });
  const contact = getChurchContact(contactId);
  const tone = contact ? ROLE_TONE_MAP[contact.roleType] : null;

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => SEED_CONVERSATIONS[contactId] ?? []
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canMessage = contact?.messagingAllowed ?? false;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => b.minutesAgo - a.minutesAgo),
    [messages]
  );

  if (!contact || !tone) {
    return (
      <main dir="rtl" className="min-h-screen w-full bg-[#f4ead8] grid place-items-center text-[#3a2a18]">
        <div className="text-center">
          <p className="font-extrabold mb-3">لم يتم العثور على المحادثة</p>
          <Link to="/church" className="text-[#b8893a] font-bold">عودة إلى الكنيسة</Link>
        </div>
      </main>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMessage) return;
    const parsed = messageSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      from: "me",
      text: parsed.data,
      minutesAgo: 0,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setDraft("");
  };

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f4ead8]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.22), transparent 65%)",
        }}
      />
      <CopticWatermark />

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.7) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>

          <div className="flex flex-1 items-center gap-3 min-w-0">
            <div
              className="h-11 w-11 shrink-0 rounded-full grid place-items-center text-[#f3e6c4] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)]"
              style={{ background: tone.bg }}
            >
              {contact.initials}
            </div>
            <div className="min-w-0">
              <p className="font-arabic-serif text-[14.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
                {contact.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-[#7a5a30]">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: tone.tag }}
                />
                {contact.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${contact.phone}`}
              aria-label="اتصال"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
            >
              <Phone className="h-4 w-4" strokeWidth={2.2} />
            </a>
            <a
              href={`https://wa.me/${encodeURIComponent(contact.whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="واتساب"
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#25d366] to-[#128c44] text-white active:scale-90 transition-transform shadow-[0_8px_18px_-10px_rgba(37,211,102,0.7)]"
            >
              <MessageCircle className="h-4 w-4 fill-current" strokeWidth={0} />
            </a>
          </div>
        </div>

        {/* Permissions banner */}
        <div
          className={
            "mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold border " +
            (canMessage
              ? "bg-[#e7f6ee] border-[#1f8a5a]/30 text-[#136a44]"
              : "bg-[#fbeaec] border-[#c44569]/30 text-[#8a2540]")
          }
        >
          {canMessage ? <ShieldCheck className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {canMessage
            ? "المحادثة مفعّلة بإذن الكاهن"
            : "المحادثة المباشرة معطّلة لهذا القائد بإذن الكاهن"}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-3 py-3"
      >
        <div className="mx-auto w-full max-w-[440px] space-y-2.5">
          {sortedMessages.length === 0 ? (
            <div className="mt-10 text-center text-[12px] text-[#7a5a30]">
              ابدأ المحادثة بسلام ونعمة 🕊️
            </div>
          ) : (
            sortedMessages.map((msg) => {
              const mine = msg.from === "me";
              return (
                <div
                  key={msg.id}
                  className={"flex " + (mine ? "justify-start" : "justify-end")}
                >
                  <div
                    className={
                      "relative max-w-[78%] rounded-[20px] px-3.5 py-2 text-[13px] leading-relaxed shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] " +
                      (mine
                        ? "bg-gradient-to-br from-[#c79356] to-[#b8772f] text-white rounded-bl-[6px]"
                        : "bg-white/90 border border-white/80 text-[#3a2a18] rounded-br-[6px]")
                    }
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <div
                      className={
                        "mt-1 flex items-center gap-1 text-[9.5px] font-bold " +
                        (mine ? "text-white/80 justify-start" : "text-[#7a5a30] justify-end")
                      }
                    >
                      <span>{formatTime(msg.minutesAgo)}</span>
                      {mine ? (
                        msg.minutesAgo < 1 ? (
                          <Check className="h-3 w-3" strokeWidth={2.6} />
                        ) : (
                          <CheckCheck className="h-3 w-3" strokeWidth={2.6} />
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-30 border-t border-[#efe2c4]/70 bg-[#fbf3e1]/95 backdrop-blur-xl px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]"
      >
        {error ? (
          <p className="mb-1.5 text-center text-[10.5px] font-bold text-[#8a2540]">{error}</p>
        ) : null}
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-3xl border border-[#efe2c4] bg-white/90 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <textarea
              dir="rtl"
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              maxLength={500}
              disabled={!canMessage}
              placeholder={canMessage ? "اكتب رسالتك..." : "المحادثة معطّلة"}
              className="w-full resize-none bg-transparent text-[13px] font-medium text-[#3a2a18] placeholder:text-[#a08862] focus:outline-none disabled:cursor-not-allowed"
              style={{ maxHeight: 120 }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as React.FormEvent);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!canMessage || draft.trim().length === 0}
            aria-label="إرسال"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c79356] to-[#b8772f] text-white shadow-[0_10px_24px_-12px_rgba(199,147,86,0.7)] active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 -scale-x-100" strokeWidth={2.4} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[9.5px] text-[#a08862]">
          {draft.length}/500 · الرسائل خاضعة لإشراف الكاهن
        </p>
      </form>
    </main>
  );
}
