"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  type StoredReflection,
} from "@/lib/reflections";

function formatReflectionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ohne Datum";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function MeinPfadPage() {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);

  useEffect(() => {
    const storedReflections = parseStoredReflections(
      window.localStorage.getItem(REFLECTION_STORAGE_KEY)
    );

    setReflections(storedReflections);

    if (storedReflections.length > 0) {
      window.localStorage.setItem(
        REFLECTION_STORAGE_KEY,
        JSON.stringify(storedReflections)
      );
    }
  }, []);

  const sortedReflections = useMemo(
    () =>
      [...(reflections ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [reflections]
  );

  const handleDelete = (id: string) => {
    setReflections((current) => {
      const next = (current ?? []).filter((reflection) => reflection.id !== id);
      window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="symbol-page symbol-section min-h-screen py-40 md:py-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_26%_66%,rgba(91,152,174,0.075),transparent_30%),radial-gradient(circle_at_76%_74%,rgba(245,241,232,0.035),transparent_24%)]" />
        <div className="light-pulse absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.075),transparent_64%)] blur-sm" />
        <div className="absolute inset-x-[8%] top-[23rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-x-[14%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.28),rgba(2,5,12,0.72)_48%,rgba(2,5,12,0.92))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="symbol-fade-in mb-20 text-center">
          <p className="symbol-kicker mb-8">
            Mein Pfad
          </p>
          <h1 className="mx-auto max-w-5xl font-serif text-6xl italic leading-[0.94] text-foreground-strong hyphens-auto md:text-8xl">
            Gespeicherte Reflexionen
          </h1>
          <p className="symbol-copy mx-auto mt-10 max-w-3xl text-2xl italic md:text-3xl">
            Ein stiller Raum für Gedanken, die im Symbol aufgeleuchtet sind und hier weiter nachklingen.
          </p>
          <p className="symbol-copy mx-auto mt-6 max-w-2xl text-base text-cyan-soft md:text-lg">
            Deine Reflexion bleibt nur auf diesem Gerät gespeichert.
          </p>
        </header>

        {reflections === null ? (
          <div className="symbol-fade-in mx-auto max-w-3xl border-y border-gold/15 py-16 text-center font-serif text-xl italic text-muted-soft">
            Lade deine Reflexionen...
          </div>
        ) : sortedReflections.length === 0 ? (
          <div className="scroll-reveal mx-auto max-w-3xl border-y border-gold/15 px-2 py-16 text-center">
            <p className="font-serif text-3xl italic text-foreground-strong md:text-4xl">
              Noch keine Reflexionen gespeichert.
            </p>
            <p className="symbol-copy mx-auto mt-7 max-w-2xl text-xl italic">
              Besuche den Wasserraum, beantworte die Frage und lege deinen Gedanken hier als stillen Eintrag ab.
            </p>
            <Link href="/raeume/wasser" className="symbol-cta mt-10">
              Zum Wasserraum
            </Link>
          </div>
        ) : (
          <div className="space-y-12 pb-12">
            {sortedReflections.map((reflection, index) => (
              <article
                key={reflection.id}
                className="scroll-reveal group relative grid gap-8 border-t border-white/10 py-10 md:grid-cols-[12rem_1fr] md:py-14"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-60" />
                <div className="pointer-events-none absolute -inset-x-6 inset-y-4 bg-[radial-gradient(circle_at_14%_50%,rgba(189,160,109,0.07),transparent_28%)] opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />

                <div className="relative">
                  <p className="symbol-breathe font-serif text-6xl leading-none text-gold/80 md:text-7xl">
                    {reflection.hebrew}
                  </p>
                  <div className="mt-8 h-px w-20 bg-gradient-to-r from-gold/45 to-transparent" />
                  <p className="symbol-kicker mt-6 text-cyan-soft">
                    {reflection.symbol}
                  </p>
                  <p className="symbol-copy mt-4 text-sm text-muted-soft">
                    {formatReflectionDate(reflection.createdAt)}
                  </p>
                </div>

                <div className="relative min-w-0">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="symbol-kicker text-cyan-soft">
                        Reflexion {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-4 font-serif text-3xl italic leading-tight text-foreground-strong md:text-5xl">
                        {reflection.question}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(reflection.id)}
                      className="symbol-cta symbol-cta-secondary shrink-0"
                    >
                      Löschen
                    </button>
                  </div>

                  <div className="mt-10 border-l border-gold/15 pl-6 md:pl-8">
                    <p className="symbol-copy whitespace-pre-line break-words text-xl italic md:text-2xl">
                      {reflection.answer}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
