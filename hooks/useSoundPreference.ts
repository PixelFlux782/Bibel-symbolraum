"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_PREFERENCE_KEY = "symbolraum-sound-enabled";

export function useSoundPreference() {
  const [enabled, setEnabled] = useState(false);
  const hasLoadedPreferenceRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(SOUND_PREFERENCE_KEY);

        hasLoadedPreferenceRef.current = true;

        if (stored === "true") {
          setEnabled(true);
        }
      } catch {
        hasLoadedPreferenceRef.current = true;
        // Lokaler Speicher ist optional. Der Fall bleibt still.
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferenceRef.current) {
      return;
    }

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
