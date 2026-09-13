"use client";

import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";

interface ActivePlayer {
  id: string;
  pause: () => void;
}

interface PlaybackContextValue {
  claimPlayback: (id: string, pause: () => void) => void;
  releasePlayback: (id: string) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const active = useRef<ActivePlayer | null>(null);

  const claimPlayback = useCallback((id: string, pause: () => void) => {
    if (active.current && active.current.id !== id) active.current.pause();
    active.current = { id, pause };
  }, []);

  const releasePlayback = useCallback((id: string) => {
    if (active.current?.id === id) active.current = null;
  }, []);

  return (
    <PlaybackContext.Provider value={{ claimPlayback, releasePlayback }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const value = useContext(PlaybackContext);
  if (!value) throw new Error("usePlayback must be used inside PlaybackProvider");
  return value;
}
