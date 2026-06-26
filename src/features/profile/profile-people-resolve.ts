import { supabase } from "@/integrations/supabase/client";
import { getAuthUserId } from "@/features/auth";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import { normalizeAlphaMemberCode } from "@/features/publisher/components/AlphaMemberScanSheet";

export type ResolvablePerson = {
  name: string;
  avatarUrl: string;
  alphaId: string;
  linkedUserId?: string;
  churchName?: string;
  source: "contact" | "demo" | "manual";
};

const FALLBACK_AVATAR = (name: string) => `https://i.pravatar.cc/96?u=${encodeURIComponent(name)}`;

/** Demo suggestions — same faces as profile mock until full directory ships. */
export const DEMO_SUGGESTIONS: ResolvablePerson[] = [
  { name: "أحمد نبيل", avatarUrl: "https://i.pravatar.cc/96?u=ahmed", alphaId: "A-DEMO01", linkedUserId: "demo-ahmed", source: "demo" },
  { name: "مارينا فادي", avatarUrl: "https://i.pravatar.cc/96?u=marina", alphaId: "A-DEMO02", linkedUserId: "demo-marina", source: "demo" },
  { name: "مينا جورج", avatarUrl: "https://i.pravatar.cc/96?u=mina", alphaId: "A-DEMO03", linkedUserId: "demo-mina", source: "demo" },
  { name: "سارة عادل", avatarUrl: "https://i.pravatar.cc/96?u=sara", alphaId: "A-DEMO04", linkedUserId: "demo-sara", source: "demo" },
];

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
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);

  return (profiles ?? []).map((p) => ({
    linkedUserId: p.id as string,
    name: (p.display_name as string)?.trim() || "عضو Alpha",
    avatarUrl: (p.avatar_url as string)?.trim() || FALLBACK_AVATAR(p.id as string),
    alphaId: deriveAlphaIdShort(p.id as string),
    source: "contact" as const,
  }));
}

export async function loadPeopleDirectory(): Promise<ResolvablePerson[]> {
  const contacts = await fetchContactPeople();
  const contactIds = new Set(contacts.map((c) => c.linkedUserId ?? c.alphaId));
  const demos = DEMO_SUGGESTIONS.filter((d) => !contactIds.has(d.linkedUserId ?? d.alphaId));
  return [...contacts, ...demos];
}

export async function resolvePersonFromCode(raw: string): Promise<ResolvablePerson | null> {
  const code = normalizeAlphaMemberCode(raw);
  if (!code) return null;

  const directory = await loadPeopleDirectory();
  const hit = directory.find((p) => p.alphaId.toUpperCase() === code);
  if (hit) return hit;

  const demoHit = DEMO_SUGGESTIONS.find((p) => p.alphaId === code);
  if (demoHit) return demoHit;

  return {
    name: `عضو ${code}`,
    avatarUrl: FALLBACK_AVATAR(code),
    alphaId: code,
    source: "manual",
  };
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
