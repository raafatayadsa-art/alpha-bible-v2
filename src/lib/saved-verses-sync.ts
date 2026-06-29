import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId } from "@/features/auth";
import { isAuthenticated } from "@/features/church/current-user";
import { canonicalBookName, dbBookNamesForQuery, resolveBibleRouteBookParam } from "@/lib/bible-book-names";
import { displayName } from "@/lib/bible-books";
import { type SavedVerse, verseKey } from "@/lib/reading-state";

export const SAVED_VERSES_SYNC_CHANGED = "ab:saved-verses-sync-changed";
const STORAGE_KEY = "ab:saved:verses";

export type RemoteSavedVerseRow = {
  id: number;
  user_id: string | null;
  book_name: string;
  chapter_number: number;
  verse_number: number;
  verse_text: string;
  note: string | null;
  created_at: string | null;
};

type BibleVerseHit = {
  ID: number;
  book_name: string;
  verse_text: string | null;
};

function readLocalSavedVerses(): SavedVerse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedVerse[];
  } catch {
    return [];
  }
}

function writeLocalSavedVerses(list: SavedVerse[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key: STORAGE_KEY } }));
  window.dispatchEvent(new Event(SAVED_VERSES_SYNC_CHANGED));
}

export async function resolveBibleVerseForSave(
  bookRoute: string,
  chapter: number,
  verse: number,
  fallbackText?: string,
): Promise<{ bookName: string; verseText: string; bibleVerseId?: number }> {
  const names = dbBookNamesForQuery(bookRoute);
  const { data, error } = await supabase
    .from("bible_verses")
    .select("ID, book_name, verse_text")
    .in("book_name", names)
    .eq("chapter_number", chapter)
    .eq("verse_number", verse)
    .limit(1);

  if (!error && data?.length) {
    const hit = data[0] as BibleVerseHit;
    const bookName = canonicalBookName(hit.book_name);
    const verseText = hit.verse_text?.trim() || fallbackText?.trim() || "";
    if (verseText) {
      return { bookName, verseText, bibleVerseId: hit.ID };
    }
  }

  const bookName = canonicalBookName(displayName(bookRoute));
  const verseText = fallbackText?.trim() || "";
  return { bookName, verseText };
}

export function remoteRowToLocal(row: RemoteSavedVerseRow): SavedVerse {
  const bookName = canonicalBookName(row.book_name);
  const bookRoute = resolveBibleRouteBookParam(bookName);
  const chapter = row.chapter_number;
  const verse = row.verse_number;
  return {
    id: verseKey(bookRoute, chapter, verse),
    book: bookRoute,
    bookName,
    chapter,
    verse,
    text: row.verse_text,
    savedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function mergeSavedLists(local: SavedVerse[], remote: SavedVerse[]): SavedVerse[] {
  const byId = new Map<string, SavedVerse>();
  for (const row of remote) byId.set(row.id, row);
  for (const row of local) {
    const prev = byId.get(row.id);
    if (!prev || row.savedAt >= prev.savedAt) byId.set(row.id, row);
  }
  return [...byId.values()].sort((a, b) => b.savedAt - a.savedAt);
}

export async function pushLocalSavedVersesToRemote(): Promise<void> {
  if (!isAuthenticated()) return;
  const local = readLocalSavedVerses();
  await Promise.all(local.map((verse) => pushSavedVerseToRemote(verse)));
}

export async function fetchRemoteSavedVerses(): Promise<RemoteSavedVerseRow[]> {
  if (!isAuthenticated()) return [];
  const uid = await getAuthUserId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from("saved_verses")
    .select("id, user_id, book_name, chapter_number, verse_number, verse_text, note, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[saved-verses] fetch", error.message);
    return [];
  }
  return (data ?? []) as RemoteSavedVerseRow[];
}

export async function syncSavedVersesFromRemote(replaceLocal = false): Promise<SavedVerse[]> {
  const remoteRows = await fetchRemoteSavedVerses();
  const remote = remoteRows.map(remoteRowToLocal);
  if (replaceLocal) {
    writeLocalSavedVerses(remote);
    return remote;
  }
  const local = readLocalSavedVerses();
  const merged = mergeSavedLists(local, remote);
  writeLocalSavedVerses(merged);
  return merged;
}

export async function pushSavedVerseToRemote(
  verse: Omit<SavedVerse, "savedAt" | "id"> & { note?: string | null },
): Promise<boolean> {
  if (!isAuthenticated()) return false;
  const uid = await getAuthUserId();
  if (!uid) return false;

  const resolved = await resolveBibleVerseForSave(
    verse.book,
    verse.chapter,
    verse.verse,
    verse.text,
  );
  if (!resolved.verseText) return false;

  const { error } = await supabase.from("saved_verses").upsert(
    {
      user_id: uid,
      book_name: resolved.bookName,
      chapter_number: verse.chapter,
      verse_number: verse.verse,
      verse_text: resolved.verseText,
      note: verse.note ?? null,
    },
    { onConflict: "user_id,book_name,chapter_number,verse_number" },
  );

  if (error) {
    const names = dbBookNamesForQuery(verse.book);
    const { data: existing } = await supabase
      .from("saved_verses")
      .select("id")
      .eq("user_id", uid)
      .in("book_name", names)
      .eq("chapter_number", verse.chapter)
      .eq("verse_number", verse.verse)
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("saved_verses")
        .update({
          verse_text: resolved.verseText,
          note: verse.note ?? null,
        })
        .eq("id", existing.id);
      if (!updateError) return true;
    }

    console.error("[saved-verses] upsert", error.message);
    return false;
  }
  return true;
}

export async function removeSavedVerseFromRemote(
  bookRoute: string,
  chapter: number,
  verse: number,
): Promise<boolean> {
  if (!isAuthenticated()) return false;
  const uid = await getAuthUserId();
  if (!uid) return false;

  const resolved = await resolveBibleVerseForSave(bookRoute, chapter, verse);
  const names = dbBookNamesForQuery(bookRoute);
  const { error } = await supabase
    .from("saved_verses")
    .delete()
    .eq("user_id", uid)
    .in("book_name", names.length ? names : [resolved.bookName])
    .eq("chapter_number", chapter)
    .eq("verse_number", verse);

  if (error) {
    console.error("[saved-verses] delete", error.message);
    return false;
  }
  return true;
}

export async function pushSavedVerseToggle(
  verse: Omit<SavedVerse, "savedAt" | "id"> & { id?: string },
  adding: boolean,
): Promise<void> {
  if (!isAuthenticated()) return;
  if (adding) {
    await pushSavedVerseToRemote(verse);
  } else {
    await removeSavedVerseFromRemote(verse.book, verse.chapter, verse.verse);
  }
}

export async function updateSavedVerseNoteRemote(
  bookRoute: string,
  chapter: number,
  verse: number,
  note: string | null,
): Promise<boolean> {
  if (!isAuthenticated()) return false;
  const uid = await getAuthUserId();
  if (!uid) return false;

  const resolved = await resolveBibleVerseForSave(bookRoute, chapter, verse);
  const { error } = await supabase
    .from("saved_verses")
    .update({ note })
    .eq("user_id", uid)
    .eq("book_name", resolved.bookName)
    .eq("chapter_number", chapter)
    .eq("verse_number", verse);

  if (error) {
    console.error("[saved-verses] note", error.message);
    return false;
  }
  return true;
}
