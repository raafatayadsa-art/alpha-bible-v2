import { useCallback, useState } from "react";
import type { AudioOutput } from "./AlphaConnectSettings";

/** In-call / PTT routes — always starts on earpiece; loudspeaker is optional per session. */
export type ConnectAudioRoute = Extract<AudioOutput, "earpiece" | "speaker">;

export function useConnectAudioOutput() {
  const [output, setOutput] = useState<ConnectAudioRoute>("earpiece");

  const toggleSpeaker = useCallback(() => {
    setOutput((prev) => (prev === "speaker" ? "earpiece" : "speaker"));
  }, []);

  return {
    output,
    isEarpiece: output === "earpiece",
    isSpeaker: output === "speaker",
    toggleSpeaker,
  };
}

export function connectAudioRouteLabel(route: ConnectAudioRoute): string {
  return route === "earpiece" ? "سماعة الأذن" : "السماعة الخارجية";
}

export function connectAudioToggleLabel(route: ConnectAudioRoute): string {
  return route === "earpiece" ? "التبديل للسماعة" : "سماعة الأذن";
}
