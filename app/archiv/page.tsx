"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LetterOverlay } from "@/components/rooms/engine/LetterOverlay";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { buildSymbolMeaningNetwork } from "@/lib/meaning/buildSymbolMeaningNetwork";
import {
  parseStoredPathActivity,
  PATH_ACTIVITY_STORAGE_KEY,
  type StoredPathActivity,
} from "@/lib/pathActivity";
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  type StoredReflection,
} from "@/lib/reflections";

const emptyActivity: StoredPathActivity = {
  roomVisits: [],
  journeyStarts: [],
  activatedLetters: [],
};

const network = buildSymbolMeaningNetwork();

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ohne Datum";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getLetterWords(letterId: string) {
  return hebrewWords.filter((word) => word.letterIds.includes(letterId));
}

function getLetterRooms(letterId: string) {
  return network.nodes.filter((symbol) =>
    getSymbolHebrewProfile(symbol.id).letters.some((letter) => letter.id === letterId)
  );
}

function getDiscoveryLetterIds(activity: StoredPathActivity) {
  return Array.from(new Set(activity.activatedLetters.map((activation) => activation.letterId)))
    .filter((letterId) => hebrewLetters.some((letter) => letter.id === letterId));
}

function getLastDiscovery(activity: StoredPathActivity, letterId: string) {
  return [...activity.activatedLetters]
    .filter((activation) => activation.letterId === letterId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function getDiscoveryContext(activity: StoredPathActivity, letterId: string) {
  const activation = getLastDiscovery(activity, letterId);

  if (!activation) return "Noch verborgen";

  const path = network.paths.find((item) => item.id === activation.pathId);
  if (path) {
    const from = network.nodes.find((node) => node.id === path.from)?.label ?? path.from;
    const to = network.nodes.find((node) => node.id === path.to)?.label ?? path.to;

    return `Letter Bridge: ${from} / ${to}`;
  }

  const symbol = network.nodes.find((node) => node.id === activation.symbolId);

  return symbol ? `LetterOverlay: ${symbol.label}` : "Im Hebrew Codex geoeffnet";
}

export default function ArchivPage() {
  const [activity, setActivity] = useState<StoredPathActivity | null>(null);
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);
  const [overlayLetterId, setOverlayLetterId] = useState<string | null>(null);

  useEffect(() => {
    const storedActivity = parseStoredPathActivity(window.localStorage.getItem(PATH_ACTIVITY_STORAGE_KEY));
    const storedReflections = parseStoredReflections(window.localStorage.getItem(REFLECTION_STORAGE_KEY));

    window.queueMicrotask(() => {
      setActivity(storedActivity);
      setReflections(storedReflections);
    });
  }, []);

  const discoveredLetterIds = useMemo(
    () => getDiscoveryLetterIds(activity ?? emptyActivity),
    [activity]
  );
  const discoveredLetterSet = useMemo(() => new Set(discoveredLetterIds), [discoveredLetterIds]);
  const sortedReflections = useMemo(
    () => [...(reflections ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reflections]
  );

  return (
    <main className="symbol-page symbol-section relative min-h-screen overflow-hidden py-40 md:py-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/Visuals/hebr_archiv_waende_background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="sacred-drift object-cover opacity-[0.32]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(189,160,109,0.1),transparent_28%),linear-gradient(180deg,rgba(2,5,12,0.5),rgba(2,5,12,0.82)_48%,rgba(2,5,12,0.97))]" />
        <div className="absolute inset-x-[8%] top-[24rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="symbol-fade-in mb-16 max-w-5xl">
          <p className="symbol-kicker mb-8 text-gold/75">Archivraum</p>
          <h1 className="max-w-5xl font-serif text-6xl italic leading-[0.96] text-foreground-strong md:text-8xl">
            Entdeckter Hebrew Codex
          </h1>
          <p className="symbol-copy mt-9 max-w-3xl text-xl italic md:text-2xl">
            Mein Pfad erzaehlt die persoenliche Reise. Der Archivraum sammelt, was sich im Codex bereits geoeffnet hat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mein-pfad" className="symbol-archive-action">
              Mein Pfad
            </Link>
            <Link href="/symbolnetz" className="symbol-archive-action">
              Symbolnetz
            </Link>
          </div>
        </header>

        {activity === null || reflections === null ? (
          <section className="symbol-path-empty scroll-reveal mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Archiv wird gelesen</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Die Buchstaben treten aus der Dunkelheit.
            </p>
          </section>
        ) : (
          <div className="grid gap-12">
            <section className="symbol-path-section">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="symbol-kicker text-cyan-soft">Hebraeisches Alphabet</p>
                  <h2 className="mt-4 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
                    {discoveredLetterIds.length} von 22 Buchstaben entdeckt
                  </h2>
                </div>
                <p className="symbol-copy max-w-xl text-sm">
                  Entdeckt bedeutet: im LetterOverlay geoeffnet, als Letter Bridge aktiviert oder im persoenlichen Pfad als activatedLetters gespeichert.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {hebrewLetters.map((letter) => {
                  const isDiscovered = discoveredLetterSet.has(letter.id);
                  const words = getLetterWords(letter.id);
                  const rooms = getLetterRooms(letter.id);
                  const primarySymbolism = letter.symbolism[0];

                  return (
                    <article
                      key={letter.id}
                      className={`symbol-archive-fragment p-5 transition-opacity duration-700 ${
                        isDiscovered ? "opacity-100" : "opacity-[0.38]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => isDiscovered ? setOverlayLetterId(letter.id) : undefined}
                          disabled={!isDiscovered}
                          aria-label={isDiscovered ? `${letter.name} im Hebrew Codex oeffnen` : `${letter.name} ist noch verborgen`}
                          className={`font-serif text-6xl leading-none transition-colors ${
                            isDiscovered ? "text-gold/90 hover:text-gold" : "text-gold/25"
                          }`}
                          lang="he"
                          dir="rtl"
                        >
                          {letter.glyph}
                        </button>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-soft">
                            {String(letter.alphabetPosition).padStart(2, "0")} / 22
                          </p>
                          <p className={isDiscovered ? "mt-2 text-[10px] uppercase tracking-[0.22em] text-gold/70" : "mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-soft/55"}>
                            {isDiscovered ? "entdeckt" : "noch verborgen"}
                          </p>
                        </div>
                      </div>

                      <h3 className="mt-5 font-serif text-2xl italic text-foreground-strong">
                        {letter.name}
                      </h3>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-cyan-soft/75">
                        Zahlenwert {letter.numericValue}
                      </p>

                      {isDiscovered ? (
                        <>
                          <p className="symbol-copy mt-4 text-sm">
                            {primarySymbolism?.description ?? (letter.archetypalMeanings.join(", ") || "Fuer diesen Buchstaben ist noch keine Kurzdeutung im Codex hinterlegt.")}
                          </p>
                          <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-gold/65">
                            {getDiscoveryContext(activity, letter.id)}
                          </p>

                          <div className="mt-5 grid gap-4 border-t border-white/[0.055] pt-5">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-soft/70">Woerter</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {words.length > 0 ? words.map((word) => (
                                  <span key={word.id} className="border border-white/[0.07] bg-white/[0.025] px-3 py-2">
                                    <span className="block font-serif text-xl text-gold/80" lang="he" dir="rtl">{word.hebrew}</span>
                                    <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-muted-soft">
                                      {word.transliteration} / {word.germanMeaning}
                                    </span>
                                  </span>
                                )) : <span className="symbol-copy text-sm">Noch keine verknuepften Woerter.</span>}
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-soft/70">Raeume</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {rooms.length > 0 ? rooms.map((room) => (
                                  <Link key={room.id} href={room.roomHref} className="symbol-archive-action">
                                    {room.label}
                                  </Link>
                                )) : <span className="symbol-copy text-sm">Noch keine verknuepften Raeume.</span>}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="symbol-copy mt-4 text-sm text-muted-soft/55">
                          Details bleiben im Archiv geschlossen, bis dieser Buchstabe im Symbolraum auftaucht.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="symbol-path-section">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="symbol-kicker text-cyan-soft">Reflexionen</p>
                  <h2 className="mt-4 font-serif text-4xl italic text-foreground-strong">
                    Persoenliche Notizen bleiben darunter
                  </h2>
                </div>
                <p className="symbol-copy max-w-xl text-sm">
                  Sie gehoeren weiter zum Archiv, aber der Raum wird zuerst vom entdeckten Codex getragen.
                </p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {sortedReflections.length > 0 ? sortedReflections.map((reflection) => (
                  <article key={reflection.id} className="symbol-path-fragment px-5 py-5">
                    <p className="symbol-kicker text-cyan-soft">
                      {reflection.symbol}{reflection.stateTitle ? ` / ${reflection.stateTitle}` : ""}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl italic leading-tight text-foreground-strong">
                      {reflection.question}
                    </h3>
                    <p className="symbol-copy mt-4 whitespace-pre-line break-words text-lg italic">
                      {reflection.answer}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
                      <p className="symbol-copy text-xs uppercase tracking-[0.2em] text-muted-soft">
                        {formatDate(reflection.createdAt)}
                      </p>
                      {reflection.roomHref ? (
                        <Link href={reflection.roomHref} className="symbol-archive-action">
                          Raum oeffnen
                        </Link>
                      ) : null}
                    </div>
                  </article>
                )) : (
                  <p className="symbol-copy">Noch keine Reflexion gespeichert.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {overlayLetterId ? (
        <LetterOverlay
          initialLetterId={overlayLetterId}
          visibleLetterIds={discoveredLetterIds}
          onActiveLetterChange={setOverlayLetterId}
          onClose={() => setOverlayLetterId(null)}
        />
      ) : null}
    </main>
  );
}
