"use client";

import { useSoundPreference } from "@/hooks/useSoundPreference";

export default function SoundController() {
  const { enabled, toggleSound } = useSoundPreference();

  const helperText = enabled
    ? "Leiser Hintergrundton ist aktiviert. Der spätere Drone-/Wasser-Controller bleibt als Architektur vorbereitet."
    : "Ton aus. Keine Audiospur startet automatisch. Aktivieren, um den späteren Audio-Prototyp vorzubereiten.";

  return (
    <div className="pointer-events-auto shrink-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-black/25">
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full transition-colors ${
            enabled ? "bg-[#d6bc8a] shadow-[0_0_12px_rgba(214,188,138,0.62)]" : "bg-white/30"
          }`}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={enabled}
          aria-describedby="symbolraum-sound-status"
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] transition-colors ${
            enabled
              ? "bg-[#d6bc8a]/15 text-[#f8f2e5]"
              : "bg-white/5 text-[#efe4d1]/70"
          }`}
        >
          <span className="sr-only">Hintergrundton</span>
          <span>{enabled ? "Ton aus" : "Ton an"}</span>
        </button>
      </div>
      <p
        id="symbolraum-sound-status"
        aria-live="polite"
        className="mt-1 max-w-[18rem] text-[0.52rem] uppercase tracking-[0.22em] text-[#f0e7da]/56"
      >
        {helperText}
      </p>
    </div>
  );
}
