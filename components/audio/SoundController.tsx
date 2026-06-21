"use client";

import { useSoundPreference } from "@/hooks/useSoundPreference";
import {
  symbolraumAudioEngine,
  type SymbolraumAudioDebugSnapshot,
} from "@/lib/audio/symbolraumAudio";
import { Volume2, VolumeX, Waves } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

const MIN_ACTIVATION_VOLUME = 0.7;
const NODE_ENV_LABEL = process.env.NODE_ENV ?? "unknown";
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
  const [isAudioDebugQuery, setIsAudioDebugQuery] = useState(false);
  const [debugSnapshot, setDebugSnapshot] = useState<SymbolraumAudioDebugSnapshot>(() => (
    symbolraumAudioEngine.getDebugSnapshot()
  ));
  const [directBaseError, setDirectBaseError] = useState<string | null>(null);

  const showAudioDebug = isAudioDebugQuery;

  useEffect(() => {
    symbolraumAudioEngine.setRoomFromPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsAudioDebugQuery(new URLSearchParams(window.location.search).get("audioDebug") === "1");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!showAudioDebug || typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setDebugSnapshot(symbolraumAudioEngine.getDebugSnapshot());
    });
    const intervalId = window.setInterval(() => {
      setDebugSnapshot(symbolraumAudioEngine.getDebugSnapshot());
    }, 500);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
    };
  }, [showAudioDebug, pathname]);

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
    if (!showAudioDebug || typeof window === "undefined") {
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
  }, [showAudioDebug]);

  const handleActivation = useCallback(async () => {
    if (sessionActive && enabled) {
      setEnabled(false);
      symbolraumAudioEngine.deactivate();
      setSessionActive(false);
      return;
    }

    const activationVolume = Math.max(volume, MIN_ACTIVATION_VOLUME);
    if (showAudioDebug) {
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
  }, [enabled, pathname, sessionActive, setEnabled, setMuted, setVolume, showAudioDebug, volume]);

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
    audio.addEventListener("error", () => {
      setDirectBaseError(audio.error
        ? `${DIRECT_BASE_AUDIO_SRC} (${audio.error.code}: ${audio.error.message || "audio load failed"})`
        : `${DIRECT_BASE_AUDIO_SRC} (audio load failed)`);
    }, { once: true });

    try {
      await audio.play();
      setDirectBaseError(null);
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
      setDirectBaseError(error instanceof Error ? error.message : String(error));
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
  const assetLoadError = Object.values(debugSnapshot.assetLoadErrors).join(" | ") || directBaseError || "none";

  return (
    <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-1.5">
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
      </div>
      {showAudioDebug ? (
        <div className="flex w-full max-w-[18rem] flex-col items-end gap-1 rounded-md border border-amber-200/20 bg-black/65 px-2 py-1.5 text-right shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur">
          <div className="flex flex-wrap justify-end gap-1.5">
            <button
              type="button"
              onClick={handleDevTestTone}
              className="rounded-full bg-amber-200/16 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f8f2e5] transition-colors hover:bg-amber-200/24"
            >
              Testton
            </button>
            <button
              type="button"
              onClick={handleDevBaseDirect}
              className="rounded-full bg-amber-200/16 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f8f2e5] transition-colors hover:bg-amber-200/24"
            >
              Base direkt
            </button>
          </div>
          <dl className="grid w-full grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[0.58rem] leading-tight text-[#f0e7da]/78">
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">pathname</dt>
            <dd className="break-all">{pathname}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">NODE_ENV</dt>
            <dd>{NODE_ENV_LABEL}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">showAudioDebug</dt>
            <dd>{String(showAudioDebug)}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">enabled</dt>
            <dd>{String(enabled)}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">muted</dt>
            <dd>{String(muted)}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">volume</dt>
            <dd>{volume.toFixed(2)}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">current room</dt>
            <dd>{debugSnapshot.currentRoom ?? "none"}</dd>
            <dt className="uppercase tracking-[0.16em] text-[#f0e7da]/45">asset load error</dt>
            <dd className="break-all">{assetLoadError}</dd>
          </dl>
        </div>
      ) : null}
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
