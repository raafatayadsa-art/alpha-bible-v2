import avatarMina from "@/assets/avatar-mina.jpg";
import avatarPriest from "@/assets/avatar-priest.jpg";

export type ConnectCallLogEntry = {
  id: string;
  contactId: string;
  contactName: string;
  duration: string;
  time: string;
  avatar: string;
  tone: "green" | "red";
  missed?: boolean;
  section: string;
};

/** Demo call log until a live call-history backend exists. */
export const CONNECT_CALL_LOG_ENTRIES: ConnectCallLogEntry[] = [
  {
    id: "1",
    contactId: "servant",
    contactName: "مينا فادي",
    duration: "12:46",
    time: "منذ 35 دقيقة",
    avatar: avatarMina,
    tone: "green",
    section: "اليوم",
  },
  {
    id: "2",
    contactId: "priest",
    contactName: "أبونا داود",
    duration: "4:12",
    time: "منذ ساعتين",
    avatar: avatarPriest,
    tone: "green",
    section: "اليوم",
  },
  {
    id: "3",
    contactId: "member",
    contactName: "مريم عادل",
    duration: "",
    time: "أمس 6:20 م",
    avatar: avatarMina,
    tone: "red",
    missed: true,
    section: "الأمس",
  },
  {
    id: "4",
    contactId: "servant",
    contactName: "مينا فادي",
    duration: "2:08",
    time: "أمس 9:15 م",
    avatar: avatarMina,
    tone: "green",
    section: "الأمس",
  },
];

export function getConnectMissedCallsCount(): number {
  return CONNECT_CALL_LOG_ENTRIES.filter((entry) => entry.missed).length;
}
