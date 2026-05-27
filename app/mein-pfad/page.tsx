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
    <div className="symbol-page symbol-section min-h-screen py-44 md:py-40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_26%_66%,rgba(91,152,174,0.075),transparent_30%),radial-gradient(circle_at_76%_74%,rgba(245,241,232,0.035),transparent_24%)]" />
        <div className="light-pulse absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.075),transparent_64%)] blur-sm" />
        <div className="absolute inset-x-[8%] top-[23rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-x-[14%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.28),rgba(2,5,12,0.72)_48%,rgba(2,5,12,0.92))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="symbol-fade-in mb-24 text-center">
          <p className="symbol-kicker mb-8">
            Mein Pfad
          </p>
          <h1 className="mx-auto max-w-5xl font-serif text-6xl italic leading-[0.94] text-foreground-strong hyphens-auto md:text-8xl">
            Ein Logbuch innerer Spuren
          </h1>
          <p className="symbol-copy mx-auto mt-10 max-w-3xl text-2xl italic md:text-3xl">
            Keine Liste, sondern eine Reise aus Fragmente, Licht und Stille. Jede Reflexion bleibt hier wie ein Eintrag in einem stillen Buch.
          </p>
          <p className="symbol-copy mx-auto mt-6 max-w-2xl text-base text-cyan-soft md:text-lg">
            Nur auf diesem Gerät gespeichert. Keine Oberfläche, kein Dashboard — nur Spur, Zeit und Erinnerung.
          </p>
        </header>

        {reflections === null ? (
          <div className="symbol-fade-in mx-auto max-w-3xl rounded-none border border-white/[0.06] bg-white/[0.01] px-8 py-16 text-center backdrop-blur-[10px]">
            <p className="symbol-kicker">Der Weg wird gelesen</p>
            <p className="mt-6 font-serif text-2xl italic text-foreground-strong md:text-3xl">
              Die Lichtspuren öffnen sich gerade.
            </p>
          </div>
        ) : sortedReflections.length === 0 ? (
          <div className="symbol-path-empty scroll-reveal mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Noch keine Spur</p>
            <p className="mt-6 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
              Der Weg ist leer, bis ein Bild antwortet.
            </p>
            <p className="symbol-copy mx-auto mt-8 max-w-2xl text-xl italic">
              Im Wasserraum gesammelt, wird jede Reflexion hier als ruhiger Eintrag sichtbar — langsam, weich und ohne Anspruch.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/raeume/wasser" className="symbol-cta">
                Zum Wasserraum
              </Link>
            </div>
          </div>
        ) : (
          <div className="symbol-path-list relative space-y-6 pb-16">
            {sortedReflections.map((reflection, index) => (
              <article
                key={reflection.id}
                className="symbol-path-fragment scroll-reveal relative grid gap-8 px-4 py-6 md:px-6 md:py-8 md:grid-cols-[11rem_1fr]"
                style={{ animationDelay: `${index * 130}ms` }}
              >
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <p className="symbol-kicker text-cyan-soft">
                      Lichtspur
                    </p>
                    <span className="symbol-path-counter">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="symbol-breathe mt-5 font-serif text-6xl leading-none text-gold/80 md:text-7xl" lang="he" dir="rtl">
                    {reflection.hebrew}
                  </p>
                  <div className="mt-5 h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
                  <p className="symbol-kicker mt-5 text-cyan-soft">
                    {reflection.symbol}
                  </p>
                  <p className="symbol-copy mt-4 text-xs uppercase tracking-[0.24em] text-muted-soft">
                    {formatReflectionDate(reflection.createdAt)}
                  </p>
                </div>

                <div className="relative min-w-0">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="symbol-kicker text-cyan-soft">
                        Archivfragment {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-4 font-serif text-3xl italic leading-tight text-foreground-strong md:text-5xl">
                        {reflection.question}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-8 border-l border-gold/[0.08] pl-5 md:pl-6">
                    <p className="symbol-copy whitespace-pre-line break-words text-xl italic md:text-2xl">
                      {reflection.answer}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.05] pt-4">
                    <p className="symbol-copy text-xs uppercase tracking-[0.22em] text-muted-soft">
                      Nur dieses Gerät · keine Rückmeldung
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(reflection.id)}
                      className="symbol-archive-action shrink-0"
                    >
                      Spur löschen
                    </button>
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
