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
  const entries = reflections
    ? Object.entries(reflections).filter(([, text]) => text.trim().length > 0)
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-32 sm:px-8 lg:px-14">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.13),transparent_24%),radial-gradient(circle_at_26%_66%,rgba(91,152,174,0.1),transparent_28%),radial-gradient(circle_at_76%_74%,rgba(245,241,232,0.045),transparent_22%)]" />
        <div className="light-pulse absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.1),transparent_64%)] blur-sm" />
        <div className="absolute inset-x-[8%] top-[23rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-x-[14%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.28),rgba(2,5,12,0.72)_48%,rgba(2,5,12,0.92))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="symbol-fade-in mb-20 text-center">
          <p className="mb-8 text-[10px] uppercase tracking-[0.56em] text-gold/65">
            Mein Pfad
          </p>
          <h1 className="mx-auto max-w-5xl font-serif text-6xl italic leading-[0.94] text-foreground-strong hyphens-auto md:text-8xl">
            Gespeicherte Reflexionen
          </h1>
          <p className="mx-auto mt-10 max-w-3xl font-serif text-2xl italic leading-relaxed text-[#d8d1c2]/72 md:text-3xl">
            Ein stiller Raum für Gedanken, die im Symbol aufgeleuchtet sind und hier weiter nachklingen.
          </p>
        </header>

        {reflections === null ? (
          <div className="symbol-fade-in mx-auto max-w-3xl border-y border-gold/15 py-16 text-center font-serif text-xl italic text-muted-soft">
            Lade deine Reflexionen...
          </div>
        ) : entries.length === 0 ? (
          <div className="scroll-reveal mx-auto max-w-3xl border-y border-gold/15 px-2 py-16 text-center">
            <p className="font-serif text-3xl italic text-foreground-strong md:text-4xl">
              Noch keine Reflexionen gespeichert.
            </p>
            <p className="mx-auto mt-7 max-w-2xl font-serif text-xl italic leading-relaxed text-muted-soft">
              Besuche ein Symbol, beantworte die Frage und lege deine Gedanken später in diesem Archivraum ab.
            </p>
          </div>
        ) : (
          <div className="space-y-16 pb-12">
            {entries.map(([slug, text], index) => {
              const symbol = symbols.find((item) => item.slug === slug);
              if (!symbol) return null;

              return (
                <article
                  key={slug}
                  className="scroll-reveal group relative grid gap-8 border-t border-white/10 py-10 md:grid-cols-[12rem_1fr] md:py-14"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-60" />
                  <div className="pointer-events-none absolute -inset-x-6 inset-y-4 bg-[radial-gradient(circle_at_14%_50%,rgba(189,160,109,0.07),transparent_28%)] opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />

                  <div className="relative">
                    <p className="symbol-breathe font-serif text-6xl leading-none text-gold/80 md:text-7xl">
                      {symbol.hebrew}
                    </p>
                    <div className="mt-8 h-px w-20 bg-gradient-to-r from-gold/45 to-transparent" />
                    <p className="mt-6 text-[10px] uppercase tracking-[0.42em] text-[#7fb8c9]/62">
                      Archiv {String(index + 1).padStart(2, '0')}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
                          {symbol.name}
                        </h2>
                        <p className="mt-4 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-soft">
                          {symbol.shortMeaning}
                        </p>
                      </div>
                      <Link
                        href={`/symbole/${symbol.slug}`}
                        className="inline-flex shrink-0 items-center border border-gold/20 bg-black/[0.18] px-4 py-3 text-[10px] uppercase tracking-[0.32em] text-gold/65 backdrop-blur-md transition-colors duration-1000 hover:border-gold/35 hover:text-gold/85"
                      >
                        Zum Symbol
                      </Link>
                    </div>

                    <div className="mt-10 border-l border-gold/15 pl-6 md:pl-8">
                      <p className="whitespace-pre-line font-serif text-xl italic leading-relaxed text-[#d8d1c2]/76 md:text-2xl">
                        {text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
