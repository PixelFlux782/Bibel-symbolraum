"use client";

import { useSoundPreference } from "@/hooks/useSoundPreference";
import { symbolraumAudioEngine } from "@/lib/audio/symbolraumAudio";
import { Volume2, VolumeX, Waves } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

const MIN_ACTIVATION_VOLUME = 0.7;
const DEBUG_AUDIO = process.env.NODE_ENV === "development";
const DIRECT_BASE_AUDIO_SRC = "/audio/symbolraum/base_layer3.mp3";

type SymbolraumAudioDebugWindow = Window & typeof globalThis & {
  symbolraumAudioDebug?: {
    playBaseOnly: () => Promise<boolean>;
    playTestTone: () => Promise<boolean>;
  };
  symbolraumDirectBaseAudio?: HTMLAudioElement;
  webkitAudioContext?: typeof AudioContext;
};

export default function SoundController() {
  const pathname = usePathname();
  const { enabled, loaded, muted, setEnabled, setMuted, setVolume, volume } = useSoundPreference();
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    symbolraumAudioEngine.setRoomFromPath(pathname);
  }, [pathname]);

  useEffect(() => {
    symbolraumAudioEngine.setGlobalVolume(volume);
  }, [volume]);

  useEffect(() => {
    symbolraumAudioEngine.setMuted(muted || !enabled);
  }, [enabled, muted]);

  useEffect(() => {
    return () => {
      symbolraumAudioEngine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!DEBUG_AUDIO || typeof window === "undefined") {
      return;
    }

    const debugWindow = window as SymbolraumAudioDebugWindow;
    debugWindow.symbolraumAudioDebug = {
      playBaseOnly: () => symbolraumAudioEngine.playBaseOnly(),
      playTestTone: () => symbolraumAudioEngine.playTestTone(),
    };

    return () => {
      delete debugWindow.symbolraumAudioDebug;
    };
  }, []);

  const handleActivation = useCallback(async () => {
    if (sessionActive && enabled) {
      setEnabled(false);
      symbolraumAudioEngine.deactivate();
      setSessionActive(false);
      return;
    }

    const activationVolume = Math.max(volume, MIN_ACTIVATION_VOLUME);
    if (DEBUG_AUDIO) {
      console.log("[symbolraum audio] audio unlock clicked");
    }

    setEnabled(true);
    setMuted(false);
    if (activationVolume !== volume) {
      setVolume(activationVolume);
    }

    await symbolraumAudioEngine.activate({
      muted: false,
      pathname,
      volume: activationVolume,
    });
    setSessionActive(true);
  }, [enabled, pathname, sessionActive, setEnabled, setMuted, setVolume, volume]);

  const handleMute = useCallback(() => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    symbolraumAudioEngine.setMuted(nextMuted || !enabled);
  }, [enabled, muted, setMuted]);

  const handleVolume = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  }, [setVolume]);

  const handleDevTestTone = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const audioWindow = window as SymbolraumAudioDebugWindow;
      const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error("AudioContext is not available in this browser.");
      }

      const context = new AudioContextConstructor();
      await context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 220;
      gain.gain.value = 0.2;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 1);
      window.setTimeout(() => {
        void context.close().catch((error: unknown) => {
          console.error("[symbolraum audio] dev test tone context close failed", error);
        });
      }, 1200);
      console.log("[symbolraum audio] dev test tone played", {
        contextState: context.state,
        duration: 1,
        frequency: 220,
        gain: 0.2,
      });
    } catch (error) {
      console.error("[symbolraum audio] dev test tone failed", error);
    }
  }, []);

  const handleDevBaseDirect = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const audioWindow = window as SymbolraumAudioDebugWindow;
    const audio = new Audio(DIRECT_BASE_AUDIO_SRC);
    audioWindow.symbolraumDirectBaseAudio = audio;
    audio.volume = 1;
    audio.muted = false;

    try {
      await audio.play();
      console.log("[symbolraum audio] dev base direct played", {
        src: audio.currentSrc || audio.src,
        paused: audio.paused,
        muted: audio.muted,
        volume: audio.volume,
        readyState: audio.readyState,
        currentTime: audio.currentTime,
        error: audio.error,
      });
    } catch (error) {
      console.error("[symbolraum audio] dev base direct play failed", {
        src: audio.currentSrc || audio.src,
        paused: audio.paused,
        muted: audio.muted,
        volume: audio.volume,
        readyState: audio.readyState,
        currentTime: audio.currentTime,
        error: audio.error,
        playError: error,
      });
    }
  }, []);

  const isAudible = sessionActive && enabled && !muted;
  const status = isAudible ? "Klangraum aktiv" : "Klangraum stumm";

  return (
    <div className="pointer-events-auto shrink-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-black/25">
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full transition-colors ${
            isAudible ? "bg-[#d6bc8a] shadow-[0_0_12px_rgba(214,188,138,0.62)]" : "bg-white/30"
          }`}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={handleActivation}
          aria-pressed={isAudible}
          aria-describedby="symbolraum-sound-status"
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] transition-colors ${
            isAudible
              ? "bg-[#d6bc8a]/15 text-[#f8f2e5]"
              : "bg-white/5 text-[#efe4d1]/70"
          }`}
        >
          <Waves aria-hidden="true" className="h-3 w-3" strokeWidth={1.5} />
          <span>{sessionActive && enabled ? "Klang aus" : "Klang an"}</span>
        </button>
        <button
          type="button"
          onClick={handleMute}
          aria-label={muted ? "Klangraum hoerbar machen" : "Klangraum stummschalten"}
          aria-pressed={muted}
          disabled={!loaded}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[#efe4d1]/70 transition-colors hover:bg-white/10 hover:text-[#f8f2e5] disabled:opacity-45"
        >
          {muted ? (
            <VolumeX aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <Volume2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
        <label className="sr-only" htmlFor="symbolraum-audio-volume">Klangraum Lautstaerke</label>
        <input
          id="symbolraum-audio-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolume}
          className="h-1 w-14 accent-[#d6bc8a] opacity-70"
          aria-label="Klangraum Lautstaerke"
        />
        {DEBUG_AUDIO ? (
          <>
            <button
              type="button"
              onClick={handleDevTestTone}
              className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#efe4d1]/80 transition-colors hover:bg-white/15 hover:text-[#f8f2e5]"
            >
              Testton
            </button>
            <button
              type="button"
              onClick={handleDevBaseDirect}
              className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#efe4d1]/80 transition-colors hover:bg-white/15 hover:text-[#f8f2e5]"
            >
              Base direkt
            </button>
          </>
        ) : null}
      </div>
      <p
        id="symbolraum-sound-status"
        aria-live="polite"
        className="mt-1 max-w-[18rem] text-[0.52rem] uppercase tracking-[0.22em] text-[#f0e7da]/56"
      >
        {status}
      </p>
    </div>
  );
}
