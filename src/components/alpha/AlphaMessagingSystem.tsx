import { useState } from "react";
import { AlphaChatScreen } from "./AlphaChatScreen";
import { AlphaConversationsScreen } from "./AlphaConversationsScreen";
import { AlphaMessageSettings } from "./AlphaMessageSettings";

type Screen = "list" | "chat" | "settings";

export function AlphaMessagingSystem() {
  const [screen, setScreen] = useState<Screen>("list");

  if (screen === "settings") {
    return <AlphaMessageSettings onBack={() => setScreen("list")} />;
  }

  if (screen === "chat") {
    return <AlphaChatScreen onBack={() => setScreen("list")} />;
  }

  return (
    <AlphaConversationsScreen
      onOpenChat={() => setScreen("chat")}
      onOpenSettings={() => setScreen("settings")}
    />
  );
}
