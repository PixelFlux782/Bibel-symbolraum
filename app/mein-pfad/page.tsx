'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllSymbols } from '@/lib/symbols';

const STORAGE_KEY = 'bibel-symbolraum-reflections';

export default function MeinPfadPage() {
  const [reflections, setReflections] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw) as Record<string, string>;
        setReflections(data);
        return;
      } catch {
        // ignore invalid storage
      }
    }
    setReflections({});
  }, []);

  const symbols = getAllSymbols();
  const entries = reflections ? Object.entries(reflections) : [];

  return (
    <main className="min-h-screen py-24 px-6 relative">
      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        <header className="space-y-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-soft">Mein Pfad</p>
          <h1 className="text-5xl md:text-6xl font-serif italic text-foreground-strong tracking-tight">
            Deine gespeicherten Reflexionen
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-soft font-serif italic">
            Hier findest du die Gedanken, die du zu den Symbolen festgehalten hast.
          </p>
        </header>

        {reflections === null ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-muted-soft">
            Lade deine Reflexionen…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-xl font-serif text-foreground-strong">Noch keine Reflexionen gespeichert.</p>
            <p className="mt-4 text-muted-soft max-w-xl mx-auto">
              Besuche eines der Symbole, beantworte die Frage und speichere deine Gedanken für später.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map(([slug, text]) => {
              const symbol = symbols.find((item) => item.slug === slug);
              if (!symbol) return null;

              return (
                <article key={slug} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-muted-soft">{symbol.hebrew}</p>
                      <h2 className="text-2xl font-serif italic text-foreground-strong">{symbol.name}</h2>
                    </div>
                    <Link href={`/symbole/${symbol.slug}`} className="text-sm uppercase tracking-[0.35em] text-gold/60 hover:text-gold transition">
                      Zum Symbol
                    </Link>
                  </div>
                  <p className="mt-6 text-lg leading-relaxed text-muted-soft whitespace-pre-line">{text}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
