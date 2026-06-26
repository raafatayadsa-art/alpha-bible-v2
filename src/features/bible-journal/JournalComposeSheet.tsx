import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import {
  journalEntryId,
  type BibleJournalEntry,
  type JournalKind,
} from "@/lib/bible-journal-state";
import { displayName } from "@/lib/bible-books";

import { JOURNAL_VAULT } from "./journal-vault-tokens";
import { JOURNAL_CUSTOM_KEYS, useJournalCustomOptions } from "./journal-custom-options";
import { MEDITATION_PROMPTS, NOTE_PROMPTS, STUDY_TAGS } from "./journal-prompts";
import { JournalReferencePicker, type JournalReferenceValue } from "./JournalReferencePicker";
import { JournalComposeMenuChip } from "./JournalComposeMenuChip";
import { JournalComposeBibleSearch } from "./JournalComposeBibleSearch";

type JournalComposeSheetProps = {
  open: boolean;
  kind: JournalKind;
  entry?: BibleJournalEntry | null;
  verseLink?: {
    book: string;
    bookName?: string;
    chapter: number;
    verse?: number;
    verseText?: string;
  };
  lockReference?: boolean;
  onClose: () => void;
  onSave: (entry: BibleJournalEntry) => void;
};

const emptyRef = (): JournalReferenceValue => ({
  book: "",
  bookName: "",
  chapter: undefined,
  verse: undefined,
});

export function JournalComposeSheet({
  open,
  kind: initialKind,
  entry,
  verseLink,
  lockReference = false,
  onClose,
  onSave,
}: JournalComposeSheetProps) {
  const [kind, setKind] = useState<JournalKind>(initialKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [prompt, setPrompt] = useState<string | undefined>();
  const [refValue, setRefValue] = useState<JournalReferenceValue>(emptyRef);

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setKind(entry.kind);
      setTitle(entry.title ?? "");
      setBody(entry.body);
      setTag(entry.tag);
      setPrompt(entry.prompt);
      setRefValue({
        book: entry.book ?? "",
        bookName: entry.bookName ?? (entry.book ? displayName(entry.book) : ""),
        chapter: entry.chapter,
        verse: entry.verse,
      });
      return;
    }
    setKind(initialKind);
    setTitle("");
    setBody("");
    setTag(undefined);
    setPrompt(undefined);
    if (verseLink) {
      setRefValue({
        book: verseLink.book,
        bookName: verseLink.bookName ?? displayName(verseLink.book),
        chapter: verseLink.chapter,
        verse: verseLink.verse,
      });
      if (verseLink.verseText) {
        const excerpt = verseLink.verseText.slice(0, 160);
        setBody(`«${excerpt}${verseLink.verseText.length > 160 ? "…" : ""}»\n\n`);
      } else {
        setBody("");
      }
    } else {
      setRefValue(emptyRef());
    }
  }, [open, entry, initialKind, verseLink]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const accent = kind === "meditation" ? JOURNAL_VAULT.meditationAccent : JOURNAL_VAULT.noteAccent;
  const lockedRef = lockReference && verseLink && !entry;

  const appendPromptToBody = (p: string, prev: string) => {
    const trimmed = prev.trim();
    if (!trimmed) return `${p}\n\n`;
    if (trimmed.includes(p)) return prev;
    return `${trimmed}\n\n${p}\n\n`;
  };

  const handleMeditationPrompt = (p: string) => {
    setPrompt(p);
    setTitle(p);
    setBody((prev) => appendPromptToBody(p, prev));
  };

  const handleNotePrompt = (p: string) => {
    setPrompt(p);
    setBody((prev) => appendPromptToBody(p, prev));
  };

  const studyTagItems = useMemo(
    () => STUDY_TAGS.map((t) => ({ id: t.id, label: t.label, emoji: t.emoji })),
    [],
  );

  const notePromptItems = useMemo(
    () => NOTE_PROMPTS.map((p) => ({ id: p, label: p })),
    [],
  );

  const meditationPromptItems = useMemo(
    () => MEDITATION_PROMPTS.map((p) => ({ id: p, label: p })),
    [],
  );

  const { customItems: customStudyTags } = useJournalCustomOptions(JOURNAL_CUSTOM_KEYS.studyTags);

  const selectedTagLabel = useMemo(() => {
    if (!tag) return undefined;
    return STUDY_TAGS.find((t) => t.id === tag)?.label ?? customStudyTags.find((t) => t.id === tag)?.label ?? tag;
  }, [tag, customStudyTags]);

  const handleSave = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const now = Date.now();
    const ref = lockedRef
      ? {
          book: verseLink!.book,
          bookName: verseLink!.bookName ?? displayName(verseLink!.book),
          chapter: verseLink!.chapter,
          verse: verseLink!.verse,
        }
      : refValue.book
        ? refValue
        : null;

    onSave({
      id: entry?.id ?? journalEntryId(),
      kind,
      title: title.trim() || undefined,
      body: trimmed,
      book: ref?.book || undefined,
      bookName: ref?.bookName || undefined,
      chapter: ref?.chapter,
      verse: ref?.verse,
      verseText: lockedRef ? verseLink?.verseText : entry?.verseText,
      prompt,
      tag: kind === "note" ? tag : undefined,
      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" dir="rtl">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[92vh] overflow-hidden rounded-t-[28px] border-t border-x shadow-2xl"
        style={{
          borderColor: `${accent}44`,
          background: "linear-gradient(180deg, #0a0818 0%, #050814 100%)",
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={!body.trim()}
          className="flex w-full items-center justify-center gap-2 border-b py-3.5 text-[14px] font-bold transition active:scale-[0.99] disabled:opacity-40"
          style={{
            borderColor: `${accent}44`,
            background: `linear-gradient(180deg, ${accent} 0%, ${kind === "meditation" ? "#5a9e78" : "#4a8ec8"} 100%)`,
            color: "#0a1020",
          }}
        >
          حفظ {kind === "meditation" ? "التأمل" : "الملاحظة"}
        </button>

        <div
          className="flex items-center justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: JOURNAL_VAULT.textMuted }}
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-arabic-serif text-[16px] font-bold" style={{ color: JOURNAL_VAULT.text }}>
            {entry ? "تعديل" : kind === "meditation" ? "تأمل جديد" : "ملاحظة جديدة"}
          </p>
          <div className="h-9 w-9" aria-hidden />
        </div>

        <div className="overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-3">
          {kind === "meditation" ? (
            <JournalComposeMenuChip
              label="وصف التأمل"
              valueLabel={prompt}
              accent={accent}
              items={meditationPromptItems}
              selectedId={prompt}
              selectionMode="label"
              customStorageKey={JOURNAL_CUSTOM_KEYS.meditationPrompts}
              onSelect={(value) => {
                if (!value) {
                  setPrompt(undefined);
                  return;
                }
                handleMeditationPrompt(value);
              }}
              className="mb-4"
            />
          ) : (
            <div className="mb-4 flex gap-2">
              <JournalComposeMenuChip
                label="نوع الدراسة"
                valueLabel={selectedTagLabel}
                accent={accent}
                items={studyTagItems}
                selectedId={tag}
                customStorageKey={JOURNAL_CUSTOM_KEYS.studyTags}
                onSelect={(id) => setTag(id ? (tag === id ? undefined : id) : undefined)}
              />
              <JournalComposeMenuChip
                label="اقتراحات سريعة"
                valueLabel={prompt}
                accent={accent}
                items={notePromptItems}
                selectedId={prompt}
                selectionMode="label"
                customStorageKey={JOURNAL_CUSTOM_KEYS.notePrompts}
                onSelect={(value) => {
                  if (!value) {
                    setPrompt(undefined);
                    return;
                  }
                  handleNotePrompt(value);
                }}
              />
            </div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "meditation" ? "عنوان التأمل" : "عنوان الملاحظة (اختياري)"}
            className="mb-3 w-full rounded-xl border bg-black/30 px-3 py-2.5 text-[13px] outline-none"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: JOURNAL_VAULT.text }}
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              kind === "meditation"
                ? "اكتب تأملك… دع الكلمة تتفاعل مع قلبك"
                : "اكتب ملاحظتك… للدراسة والمراجعة"
            }
            rows={7}
            className="mb-4 w-full resize-none rounded-xl border bg-black/30 px-3 py-3 font-arabic-serif text-[15px] leading-[1.85] outline-none"
            style={{ borderColor: `${accent}33`, color: JOURNAL_VAULT.text }}
          />

          <JournalComposeBibleSearch />

          <JournalReferencePicker value={refValue} onChange={setRefValue} locked={Boolean(lockedRef)} />
        </div>
      </div>
    </div>
  );
}
