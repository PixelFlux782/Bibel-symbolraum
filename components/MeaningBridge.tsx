"use client";

import type { SymbolMeaningPath } from "@/lib/meaning/buildSymbolMeaningNetwork";

type MeaningBridgeProps = {
  path: SymbolMeaningPath;
  fromLabel: string;
  toLabel: string;
  onClose: () => void;
  onFollow: () => void;
};

export function MeaningBridge({
  path,
  fromLabel,
  toLabel,
  onClose,
  onFollow,
}: MeaningBridgeProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#01030a]/80 px-5 py-10 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="meaning-bridge-title"
        className="w-full max-w-xl border border-gold/20 bg-[#030711]/95 px-6 py-7 shadow-[0_0_70px_rgba(189,160,109,0.08)] sm:px-9 sm:py-9"
      >
        <p className="symbol-kicker text-cyan-soft">Warum diese Verbindung?</p>
        <h2 id="meaning-bridge-title" className="mt-5 font-serif text-3xl italic text-foreground-strong sm:text-4xl">
          {fromLabel} <span className="text-gold/65">&rarr;</span> {toLabel}
        </h2>
        <p className="mt-6 font-serif text-xl italic leading-relaxed text-[#d8d1c2]/88">
          {path.bridgeDescription}
        </p>

        {path.joint?.letterName === "Aleph" ? (
          <div className="mt-7 border-l border-gold/25 pl-4">
            <p className="font-serif text-4xl text-gold/90" lang="he">{path.joint.letter}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-cyan-soft">{path.joint.letterName}</p>
            <p className="mt-3 font-serif text-sm italic leading-relaxed text-gold/75">
              {path.joint.meanings.map((meaning) => <span className="block" key={meaning}>{meaning}.</span>)}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={onFollow} className="symbol-cta px-5 py-3">
            Verbindung folgen
          </button>
          <button type="button" onClick={onClose} className="px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-[#d8d1c2]/55 transition-colors hover:text-cyan-soft">
            Im Netz bleiben
          </button>
        </div>
      </section>
    </div>
  );
}
