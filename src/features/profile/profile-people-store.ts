import { useCallback, useEffect, useState } from "react";

export type ProfileLinkedPerson = {
  id: string;
  name: string;
  avatarUrl: string;
  alphaId?: string;
  linkedUserId?: string;
  relation?: string;
  addedAt: string;
};

type PeopleLists = {
  family: ProfileLinkedPerson[];
  connect: ProfileLinkedPerson[];
};

const STORAGE_KEY = "alpha:profile-people-links:v1";

function readLists(): PeopleLists {
  if (typeof window === "undefined") return { family: [], connect: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { family: [], connect: [] };
    const parsed = JSON.parse(raw) as PeopleLists;
    return {
      family: Array.isArray(parsed.family) ? parsed.family : [],
      connect: Array.isArray(parsed.connect) ? parsed.connect : [],
    };
  } catch {
    return { family: [], connect: [] };
  }
}

function writeLists(lists: PeopleLists) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function getProfileFamilyLinks(): ProfileLinkedPerson[] {
  return readLists().family;
}

export function getProfileConnectLinks(): ProfileLinkedPerson[] {
  return readLists().connect;
}

function isDuplicate(list: ProfileLinkedPerson[], person: Pick<ProfileLinkedPerson, "alphaId" | "linkedUserId" | "name">) {
  return list.some(
    (p) =>
      (person.linkedUserId && p.linkedUserId === person.linkedUserId) ||
      (person.alphaId && p.alphaId && p.alphaId === person.alphaId) ||
      p.name.trim() === person.name.trim(),
  );
}

export function addProfileFamilyLink(
  person: Omit<ProfileLinkedPerson, "id" | "addedAt">,
): ProfileLinkedPerson | null {
  const lists = readLists();
  if (isDuplicate(lists.family, person)) return null;
  const entry: ProfileLinkedPerson = {
    ...person,
    id: `fl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: new Date().toISOString(),
  };
  lists.family = [entry, ...lists.family];
  writeLists(lists);
  return entry;
}

export function addProfileConnectLink(
  person: Omit<ProfileLinkedPerson, "id" | "addedAt" | "relation">,
): ProfileLinkedPerson | null {
  const lists = readLists();
  if (isDuplicate(lists.connect, person)) return null;
  const entry: ProfileLinkedPerson = {
    ...person,
    id: `cl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: new Date().toISOString(),
  };
  lists.connect = [entry, ...lists.connect];
  writeLists(lists);
  return entry;
}

export function removeProfileFamilyLink(id: string) {
  const lists = readLists();
  lists.family = lists.family.filter((p) => p.id !== id);
  writeLists(lists);
}

export function removeProfileConnectLink(id: string) {
  const lists = readLists();
  lists.connect = lists.connect.filter((p) => p.id !== id);
  writeLists(lists);
}

export function clearProfilePeopleLinks() {
  writeLists({ family: [], connect: [] });
}

export function useProfilePeopleLinks() {
  const [family, setFamily] = useState<ProfileLinkedPerson[]>(() => getProfileFamilyLinks());
  const [connect, setConnect] = useState<ProfileLinkedPerson[]>(() => getProfileConnectLinks());

  const refresh = useCallback(() => {
    setFamily(getProfileFamilyLinks());
    setConnect(getProfileConnectLinks());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return { family, connect, refresh };
}
