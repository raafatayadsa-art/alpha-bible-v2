import {
  BookOpen,
  Handshake,
  Music,
  ShieldPlus,
  Users,
  Video,
} from "lucide-react";
import type { ConnectChannelIcon } from "./connect-channels-registry";

export function ConnectChannelIconView({ icon, size = "md" }: { icon: ConnectChannelIcon; size?: "md" | "lg" }) {
  const className =
    size === "lg"
      ? "connect-accent-icon relative z-[1] h-6 w-6"
      : "connect-accent-icon relative z-[1] h-5 w-5";
  switch (icon) {
    case "shield":
      return <ShieldPlus className={className} />;
    case "book":
      return <BookOpen className={className} />;
    case "music":
      return <Music className={className} />;
    case "video":
      return <Video className={className} />;
    case "handshake":
      return <Handshake className={className} />;
    case "family":
    case "users":
    default:
      return <Users className={className} />;
  }
}
