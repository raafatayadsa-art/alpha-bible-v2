import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId } from "@/features/auth";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import { lookupUserByAlphaCode } from "@/features/identity/alpha-identity-lookup";
import { normalizeAlphaMemberCode } from "@/features/publisher/components/AlphaMemberScanSheet";

export type ResolvablePerson = {
  name: string;
  avatarUrl?: string;
  alphaId: string;
  linkedUserId?: string;
  churchName?: string;
  role?: string;
  source: "contact" | "directory" | "manual";
};

export async function fetchContactPeople(): Promise<ResolvablePerson[]> {
  const uid = await getAuthUserId();
  if (!uid) return [];

  const { data: contactRows } = await supabase
    .from("alpha_connect_contacts")
    .select("contact_user_id")
    .eq("user_id", uid);

  const ids = (contactRows ?? []).map((r) => r.contact_user_id as string).filter(Boolean);
  if (!ids.length) return [];

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", ids);

  return (profiles ?? []).map((p) => ({
    linkedUserId: p.user_id as string,
    name: (p.display_name as string)?.trim() || "عضو Alpha",
    avatarUrl: (p.avatar_url as string)?.trim() || undefined,
    alphaId: deriveAlphaIdShort(p.user_id as string),
    source: "contact" as const,
  }));
}

export async function loadPeopleDirectory(): Promise<ResolvablePerson[]> {
  return fetchContactPeople();
}

export async function resolvePersonFromCode(raw: string): Promise<ResolvablePerson | null> {
  const code = normalizeAlphaMemberCode(raw);
  if (!code) return null;

  const directory = await loadPeopleDirectory();
  const hit = directory.find((p) => p.alphaId.toUpperCase() === code);
  if (hit) return hit;

  const identity = await lookupUserByAlphaCode(code);
  if (identity) {
    return {
      linkedUserId: identity.userId,
      name: identity.displayName,
      avatarUrl: identity.avatarUrl,
      alphaId: identity.alphaIdShort,
      source: "directory",
    };
  }

  return null;
}

export async function searchPeople(query: string): Promise<ResolvablePerson[]> {
  const q = query.trim().toLowerCase();
  if (!q) return loadPeopleDirectory();

  const directory = await loadPeopleDirectory();
  return directory.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.alphaId.toLowerCase().includes(q) ||
      (p.linkedUserId?.toLowerCase().includes(q) ?? false),
  );
}

export function personToOrbit(p: ResolvablePerson | { name: string; avatarUrl: string; id?: string }) {
  return {
    id: "id" in p && p.id ? p.id : `${p.name}-${p.avatarUrl}`,
    name: p.name,
    avatar: p.avatarUrl,
  };
}
