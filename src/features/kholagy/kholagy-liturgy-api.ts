import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCopticDisplay } from "@/lib/coptic-text";
import { inferLiturgyKey, isKholagyLiturgyKey } from "./kholagy-liturgy-meta";
import { filterLiturgyBlocks, parseLiturgyContent } from "./kholagy-liturgy-parser";
import type { KholagyLiturgyKey, KholagyLiturgySection, KholagyLiturgySummary } from "./types";

type LiturgyRow = {
  id: number;
  liturgy_type: string | null;
  section_title: string;
  content: string;
  sort_order: number;
  source_url: string;
};

type LiturgyMetaRow = Omit<LiturgyRow, "content"> & { content?: string };

function mapMetaRow(row: LiturgyMetaRow): KholagyLiturgySection {
  const liturgyKey = inferLiturgyKey(row.source_url ?? "", row.content ?? "");
  const parsed = row.content ? parseLiturgyContent(row.content) : [];
  const blocks = filterLiturgyBlocks(parsed);
  return {
    id: row.id,
    liturgyKey,
    sortOrder: row.sort_order,
    title: row.section_title.replace(/\s+/g, " ").trim(),
    sourceUrl: row.source_url ?? "",
    blocks: [],
    blockCount: blocks.length,
  };
}

async function mapFullRow(row: LiturgyRow): Promise<KholagyLiturgySection> {
  const liturgyKey = inferLiturgyKey(row.source_url ?? "", row.content ?? "");
  const parsed = parseLiturgyContent(row.content ?? "");
  const converted = await Promise.all(
    parsed.map(async (block) => ({
      ...block,
      copticText: block.copticText ? await formatCopticDisplay(block.copticText) : "",
    })),
  );
  const blocks = filterLiturgyBlocks(converted);

  return {
    id: row.id,
    liturgyKey,
    sortOrder: row.sort_order,
    title: row.section_title.replace(/\s+/g, " ").trim(),
    sourceUrl: row.source_url ?? "",
    blocks,
    blockCount: blocks.length,
  };
}

async function fetchLiturgyMetaRows(): Promise<KholagyLiturgySection[]> {
  const { data, error } = await supabase
    .from("kholagy_liturgies")
    .select("id, liturgy_type, section_title, sort_order, source_url, content")
    .order("sort_order")
    .order("id");

  if (error || !data?.length) return [];
  return (data as LiturgyRow[]).map(mapMetaRow);
}

export async function fetchKholagyLiturgySummaries(): Promise<KholagyLiturgySummary[]> {
  const sections = await fetchLiturgyMetaRows();
  const byKey = new Map<KholagyLiturgyKey, KholagyLiturgySection[]>();

  for (const section of sections) {
    const list = byKey.get(section.liturgyKey) ?? [];
    list.push(section);
    byKey.set(section.liturgyKey, list);
  }

  const summaries: KholagyLiturgySummary[] = [];
  for (const [liturgyKey, list] of byKey) {
    const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    summaries.push({
      liturgyKey,
      sectionCount: sorted.length,
      sections: sorted,
    });
  }

  return summaries.sort((a, b) => a.liturgyKey.localeCompare(b.liturgyKey));
}

export async function fetchKholagyLiturgySections(
  liturgyKey: KholagyLiturgyKey,
): Promise<KholagyLiturgySection[]> {
  const summaries = await fetchKholagyLiturgySummaries();
  return summaries.find((s) => s.liturgyKey === liturgyKey)?.sections ?? [];
}

export async function fetchKholagyLiturgySection(
  liturgyKey: KholagyLiturgyKey,
  sectionId: number,
): Promise<KholagyLiturgySection | null> {
  const { data, error } = await supabase
    .from("kholagy_liturgies")
    .select("id, liturgy_type, section_title, content, sort_order, source_url")
    .eq("id", sectionId)
    .maybeSingle();

  if (error || !data) return null;

  const section = await mapFullRow(data as LiturgyRow);
  if (section.liturgyKey !== liturgyKey) return null;
  return section;
}

export function adjacentLiturgySections(
  sections: KholagyLiturgySection[],
  sectionId: number,
): { prev: KholagyLiturgySection | null; next: KholagyLiturgySection | null } {
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? sections[idx - 1]! : null,
    next: idx < sections.length - 1 ? sections[idx + 1]! : null,
  };
}

export function parseLiturgyRouteKey(value: string): KholagyLiturgyKey | null {
  return isKholagyLiturgyKey(value) ? value : null;
}

export const kholagyLiturgySummariesQueryOptions = () =>
  queryOptions({
    queryKey: ["kholagy", "liturgies"],
    queryFn: fetchKholagyLiturgySummaries,
    staleTime: 1000 * 60 * 30,
  });

export const kholagyLiturgySectionsQueryOptions = (liturgyKey: KholagyLiturgyKey) =>
  queryOptions({
    queryKey: ["kholagy", "liturgy", liturgyKey],
    queryFn: () => fetchKholagyLiturgySections(liturgyKey),
    staleTime: 1000 * 60 * 30,
  });

export const kholagyLiturgySectionQueryOptions = (
  liturgyKey: KholagyLiturgyKey,
  sectionId: number,
) =>
  queryOptions({
    queryKey: ["kholagy", "liturgy", liturgyKey, sectionId],
    queryFn: () => fetchKholagyLiturgySection(liturgyKey, sectionId),
    staleTime: 1000 * 60 * 30,
  });
