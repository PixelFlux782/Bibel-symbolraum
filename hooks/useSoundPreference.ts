"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const SOUND_PREFERENCE_KEY = "symbolraum-audio-settings";

export type SymbolraumAudioSettings = {
  enabled: boolean;
  muted: boolean;
  volume: number;
};

const DEFAULT_AUDIO_SETTINGS: SymbolraumAudioSettings = {
  enabled: false,
  muted: false,
  volume: 0.7,
};

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function parseSettings(raw: string | null): SymbolraumAudioSettings {
  if (!raw) {
    return DEFAULT_AUDIO_SETTINGS;
  }

  if (raw === "true" || raw === "false") {
    return {
      ...DEFAULT_AUDIO_SETTINGS,
      enabled: raw === "true",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SymbolraumAudioSettings>;

    return {
      enabled: Boolean(parsed.enabled),
      muted: Boolean(parsed.muted),
      volume: typeof parsed.volume === "number"
        ? clampVolume(parsed.volume)
        : DEFAULT_AUDIO_SETTINGS.volume,
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function useSoundPreference() {
  const [settings, setSettings] = useState<SymbolraumAudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const hasLoadedPreferenceRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      try {
        setSettings(parseSettings(window.localStorage.getItem(SOUND_PREFERENCE_KEY)));
      } finally {
        hasLoadedPreferenceRef.current = true;
        setLoaded(true);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferenceRef.current || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, JSON.stringify(settings));
    } catch {
      // Lokaler Speicher ist optional. Der Klangraum bleibt bedienbar.
    }
  }, [settings]);

  const setEnabled = useCallback((enabled: boolean) => {
    setSettings((current) => ({ ...current, enabled }));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setSettings((current) => ({ ...current, muted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings((current) => ({ ...current, volume: clampVolume(volume) }));
  }, []);

  const toggleSound = useCallback(() => {
    setSettings((current) => ({ ...current, enabled: !current.enabled }));
  }, []);

  const toggleMuted = useCallback(() => {
    setSettings((current) => ({ ...current, muted: !current.muted }));
  }, []);

  return {
    ...settings,
    loaded,
    setEnabled,
    setMuted,
    setVolume,
    toggleMuted,
    toggleSound,
  };
}
