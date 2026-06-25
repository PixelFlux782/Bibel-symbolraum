'use client';

import { useEffect, useMemo, useState } from 'react';
import { symbolraumAudioEngine } from '@/lib/audio/symbolraumAudio';
import { getSymbolBySlug, SymbolItem } from '@/lib/symbols';
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  saveStoredReflection,
} from '@/lib/reflections';

export default function SymbolDetailClient({ symbol }: { symbol: SymbolItem }) {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const reflections = parseStoredReflections(
      window.localStorage.getItem(REFLECTION_STORAGE_KEY)
    );
    const latestReflection = reflections.find((reflection) => reflection.symbolSlug === symbol.slug);

    if (latestReflection) {
      window.queueMicrotask(() => setValue(latestReflection.answer));
    }
  }, [symbol.slug]);

  const question = useMemo(() => symbol.lifeQuestion, [symbol.lifeQuestion]);

  function saveReflection() {
    saveStoredReflection({
      id: `reflection-${symbol.slug}-${Date.now()}`,
      symbol: symbol.name,
      symbolSlug: symbol.slug,
      hebrew: symbol.hebrew,
      question,
      answer: value,
      roomHref: `/symbole/${symbol.slug}`,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    symbolraumAudioEngine.playInteraction('save_trace', {
      trigger: `symbol-reflection:${symbol.slug}`,
      dedupeKey: `save-trace:symbol:${symbol.slug}`,
      dedupeMs: 800,
    });
    window.setTimeout(() => setSaved(false), 1800);
  }

  const connectedNames = useMemo(() => {
    return symbol.connectedSymbols
      .map((slug) => getSymbolBySlug(slug))
      .filter(Boolean)
      .map((item) => item!.name);
  }, [symbol.connectedSymbols]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.35em] text-muted-soft">Reflexion</p>
        <h2 className="mt-3 text-2xl font-serif italic text-foreground-strong">{question}</h2>
      </div>

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Schreibe hier deine Gedanken nieder..."
        className="w-full min-h-[220px] rounded-3xl border border-white/10 bg-black/20 px-6 py-5 text-lg leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={saveReflection}
          className="rounded-full bg-gold/15 px-8 py-3 text-sm uppercase tracking-[0.35em] text-foreground transition hover:bg-gold/25"
        >
          Reflexion speichern
        </button>
        <span className={`text-sm transition-opacity ${saved ? 'opacity-100 text-gold' : 'opacity-0'}`}>
          Gespeichert.
        </span>
      </div>

      {connectedNames.length > 0 ? (
        <div className="mt-8 text-sm text-muted-soft">
          Verwandte Zeichen: {connectedNames.join(' · ')}
        </div>
      ) : null}
    </section>
  );
}
