import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCopticDisplay } from "@/lib/coptic-text";
import {
  classifyKholagyCategory,
  kholagyGroupKey,
  normalizeKholagyTitle,
} from "./kholagy-groups";
import type { KholagyGroup, KholagyVerse } from "./types";

type KholagyRow = {
  id: number;
  title: string;
  arabic_text: string;
  coptic_text: string;
  english_text: string;
  source_url: string;
};

async function mapRow(row: KholagyRow): Promise<KholagyVerse> {
  const rawCoptic = row.coptic_text?.trim() ?? "";
  const copticText =
    rawCoptic && rawCoptic !== "-" ? await formatCopticDisplay(rawCoptic) : "";

  return {
    id: row.id,
    title: normalizeKholagyTitle(row.title),
    arabicText: row.arabic_text?.trim() ?? "",
    copticText,
    englishText: row.english_text?.trim() ?? "",
    sourceUrl: row.source_url ?? "",
  };
}

function buildGroups(rows: KholagyVerse[]): KholagyGroup[] {
  const byTitle = new Map<string, KholagyVerse[]>();
  for (const row of rows) {
    const list = byTitle.get(row.title) ?? [];
    list.push(row);
    byTitle.set(row.title, list);
  }

  const groups: KholagyGroup[] = [];
  for (const [title, verses] of byTitle) {
    const sorted = [...verses].sort((a, b) => a.id - b.id);
    const first = sorted[0]!;
    groups.push({
      key: kholagyGroupKey(first.id),
      title,
      category: classifyKholagyCategory(title),
      verses: sorted,
      verseCount: sorted.length,
      preview: first.arabicText.slice(0, 120),
    });
  }

  return groups.sort((a, b) => Number(a.key) - Number(b.key));
}

async function fetchAllKholagyRows(): Promise<KholagyVerse[]> {
  const { data, error } = await supabase
    .from("kholagy")
    .select("id, title, arabic_text, coptic_text, english_text, source_url")
    .order("id");
  if (error || !data?.length) return [];
  return Promise.all((data as KholagyRow[]).map(mapRow));
}

export async function fetchKholagyGroups(): Promise<KholagyGroup[]> {
  const rows = await fetchAllKholagyRows();
  return buildGroups(rows);
}

export async function fetchKholagyGroup(groupKey: string): Promise<KholagyGroup | null> {
  const id = Number(groupKey);
  if (!Number.isFinite(id)) return null;

  const { data: anchor, error: anchorErr } = await supabase
    .from("kholagy")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  if (anchorErr || !anchor?.title) return null;

  const title = normalizeKholagyTitle(anchor.title as string);
  const { data, error } = await supabase
    .from("kholagy")
    .select("id, title, arabic_text, coptic_text, english_text, source_url")
    .eq("title", anchor.title)
    .order("id");
  if (error || !data?.length) return null;

  const verses = await Promise.all((data as KholagyRow[]).map(mapRow));
  return {
    key: kholagyGroupKey(verses[0]!.id),
    title,
    category: classifyKholagyCategory(title),
    verses,
    verseCount: verses.length,
    preview: verses[0]!.arabicText.slice(0, 120),
  };
}

export function adjacentKholagyGroups(
  groups: KholagyGroup[],
  groupKey: string,
): { prev: KholagyGroup | null; next: KholagyGroup | null } {
  const idx = groups.findIndex((g) => g.key === groupKey);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? groups[idx - 1]! : null,
    next: idx < groups.length - 1 ? groups[idx + 1]! : null,
  };
}

export const kholagyGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["kholagy", "groups"],
    queryFn: fetchKholagyGroups,
    staleTime: 1000 * 60 * 30,
  });

export const kholagyGroupQueryOptions = (groupKey: string) =>
  queryOptions({
    queryKey: ["kholagy", "group", groupKey],
    queryFn: () => fetchKholagyGroup(groupKey),
    staleTime: 1000 * 60 * 30,
  });
