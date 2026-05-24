'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSymbolBySlug, getAllSymbols, SymbolItem } from '@/lib/symbols';

const STORAGE_KEY = 'bibel-symbolraum-reflections';

export default function SymbolDetailClient({ symbol }: { symbol: SymbolItem }) {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const reflections = JSON.parse(raw) as Record<string, string>;
        if (reflections[symbol.slug]) {
          setValue(reflections[symbol.slug]);
        }
      } catch {
        // ignore invalid data
      }
    }
  }, [symbol.slug]);

  const question = useMemo(() => symbol.lifeQuestion, [symbol.lifeQuestion]);

  function saveReflection() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const reflections = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    reflections[symbol.slug] = value;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
    setSaved(true);
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
