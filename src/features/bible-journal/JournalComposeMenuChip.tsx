import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { JOURNAL_VAULT } from "./journal-vault-tokens";
import { isJournalCustomOptionId, useJournalCustomOptions } from "./journal-custom-options";

type MenuItem = {
  id: string;
  label: string;
  emoji?: string;
};

type JournalComposeMenuChipProps = {
  label: string;
  valueLabel?: string;
  accent: string;
  items: MenuItem[];
  selectedId?: string;
  onSelect: (value: string) => void;
  className?: string;
  /** Persist custom favorites in localStorage when set. */
  customStorageKey?: string;
  /** Use item label as selection value (prompts) vs id (study tags). */
  selectionMode?: "id" | "label";
  addCustomLabel?: string;
  addCustomPlaceholder?: string;
};

export function JournalComposeMenuChip({
  label,
  valueLabel,
  accent,
  items: builtinItems,
  selectedId,
  onSelect,
  className = "",
  customStorageKey,
  selectionMode = "id",
  addCustomLabel = "إضافة خيار مفضل",
  addCustomPlaceholder = "اكتب خيارك…",
}: JournalComposeMenuChipProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { customItems, addCustom, removeCustom } = useJournalCustomOptions(
    customStorageKey ?? "ab:journal:custom:unused",
  );

  const items = useMemo(
    () => [...builtinItems, ...(customStorageKey ? customItems : [])],
    [builtinItems, customItems, customStorageKey],
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setDraft("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const itemValue = (item: MenuItem) => (selectionMode === "label" ? item.label : item.id);
  const isActive = (item: MenuItem) =>
    selectionMode === "label" ? selectedId === item.label : selectedId === item.id;

  const submitCustom = () => {
    if (!customStorageKey) return;
    const ok = addCustom(draft, selectionMode === "id" ? "✦" : undefined);
    if (!ok) return;
    setDraft("");
    setAdding(false);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 flex-1 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 text-right transition active:scale-[0.99]"
        style={{
          borderColor: open || selectedId ? `${accent}55` : "rgba(212,175,55,0.28)",
          background: open || selectedId ? `${accent}14` : "rgba(255,255,255,0.85)",
        }}
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
          style={{ color: accent }}
        />
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[9px] font-bold opacity-70" style={{ color: JOURNAL_VAULT.textMuted }}>
            {label}
          </p>
          <p className="truncate text-[11px] font-bold" style={{ color: valueLabel ? accent : JOURNAL_VAULT.textMuted }}>
            {valueLabel ?? "اختر…"}
          </p>
        </div>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[min(280px,42vh)] overflow-y-auto overscroll-contain rounded-2xl border py-1 shadow-xl"
          style={{
            borderColor: `${accent}44`,
            background: "linear-gradient(180deg, #FAF7F2 0%, #F5EFE4 100%)",
          }}
        >
          {items.map((item) => {
            const active = isActive(item);
            const isCustom = isJournalCustomOptionId(item.id);
            return (
              <div
                key={item.id}
                className="flex items-center gap-1 px-1"
                style={{ background: active ? `${accent}18` : "transparent" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(itemValue(item));
                    setOpen(false);
                    setAdding(false);
                    setDraft("");
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2.5 text-right transition active:bg-white/5"
                >
                  <span className="flex-1 text-[11px] font-bold" style={{ color: active ? accent : JOURNAL_VAULT.text }}>
                    {item.emoji ? `${item.emoji} ` : ""}
                    {item.label}
                  </span>
                  {active ? <Check className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} /> : null}
                </button>
                {isCustom && customStorageKey ? (
                  <button
                    type="button"
                    aria-label={`حذف ${item.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustom(item.id);
                      if (isActive(item)) onSelect("");
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition active:scale-95"
                    style={{ color: "#f87171" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}

          {customStorageKey ? (
            adding ? (
              <div className="border-t px-2 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="إلغاء"
                    onClick={() => {
                      setAdding(false);
                      setDraft("");
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                    style={{ color: JOURNAL_VAULT.textMuted }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitCustom();
                      }
                    }}
                    placeholder={addCustomPlaceholder}
                    className="min-w-0 flex-1 rounded-lg border bg-black/40 px-2.5 py-2 text-[11px] outline-none"
                    style={{ borderColor: `${accent}44`, color: JOURNAL_VAULT.text }}
                  />
                  <button
                    type="button"
                    disabled={!draft.trim()}
                    onClick={submitCustom}
                    className="rounded-lg px-2.5 py-2 text-[10px] font-bold disabled:opacity-40"
                    style={{ background: `${accent}22`, color: accent }}
                  >
                    إضافة
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2 border-t px-3 py-2.5 text-right transition active:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: accent }}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-[11px] font-bold">{addCustomLabel}</span>
              </button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
