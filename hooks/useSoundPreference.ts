"use client";

import { useCallback, useEffect, useState } from "react";

const SOUND_PREFERENCE_KEY = "symbolraum-sound-enabled";

export function useSoundPreference() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(SOUND_PREFERENCE_KEY);

      if (stored === "true") {
        setEnabled(true);
      }
    } catch {
      // Lokaler Speicher ist optional. Der Fall bleibt still.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
    } catch {
      // Lokaler Speicher ist optional. Der Fall bleibt still.
    }
  }, [enabled]);

  const toggleSound = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  return {
    enabled,
    setEnabled,
    toggleSound,
  };
}

export { SOUND_PREFERENCE_KEY };
