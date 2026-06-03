"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
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

const network = buildSymbolMeaningNetwork();

type ChronicleItem = {
  id: string;
  kind: "room" | "journey" | "letter" | "reflection";
  title: string;
  detail: string;
  href?: string;
  createdAt: string;
};

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

function getSymbol(symbolId?: string) {
  return network.nodes.find((node) => node.id === symbolId);
}

function getJourney(journeyId: string) {
  return network.journeys.find((journey) => journey.id === journeyId);
}

function getLetter(letterId: string) {
  return hebrewLetters.find((letter) => letter.id === letterId);
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function JourneySequence({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          {index > 0 ? <span className="text-gold/55"> &rarr; </span> : null}
          {item}
        </Fragment>
      ))}
    </>
  );
}

function buildChronicle(activity: StoredPathActivity, reflections: StoredReflection[]): ChronicleItem[] {
  const roomItems = activity.roomVisits.map((visit): ChronicleItem => {
    const symbol = getSymbol(visit.symbolId);

    return {
      id: visit.id,
      kind: "room",
      title: `${symbol?.label ?? visit.symbolId}-Raum geoeffnet`,
      detail: symbol?.shortMeaning ?? visit.roomHref,
      href: visit.roomHref,
      createdAt: visit.createdAt,
    };
  });
  const journeyItems = activity.journeyStarts.map((start): ChronicleItem => {
    const journey = getJourney(start.journeyId);

    return {
      id: start.id,
      kind: "journey",
      title: journey?.title ?? start.journeyId,
      detail: journey?.symbolLabels.join(" -> ") ?? "Meaning Journey begonnen",
      href: journey?.firstRoomHref,
      createdAt: start.createdAt,
    };
  });
  const letterItems = activity.activatedLetters.map((activation): ChronicleItem => {
    const letter = getLetter(activation.letterId);
    const path = network.paths.find((item) => item.id === activation.pathId);
    const symbol = getSymbol(activation.symbolId);

    return {
      id: activation.id,
      kind: "letter",
      title: `${letter?.name ?? activation.letterId} aktiviert`,
      detail: path
        ? `${getSymbol(path.from)?.label ?? path.from} -> ${getSymbol(path.to)?.label ?? path.to}`
        : symbol?.label ?? "Hebrew Codex",
      createdAt: activation.createdAt,
    };
  });
  const reflectionItems = reflections.map((reflection): ChronicleItem => ({
    id: reflection.id,
    kind: "reflection",
    title: `Reflexion: ${reflection.symbol}`,
    detail: reflection.stateTitle ?? reflection.question,
    href: reflection.roomHref,
    createdAt: reflection.createdAt,
  }));

  return [...roomItems, ...journeyItems, ...letterItems, ...reflectionItems].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export default function MeinPfadPage() {
  const [activity, setActivity] = useState<StoredPathActivity | null>(null);
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);

  useEffect(() => {
    const storedActivity = parseStoredPathActivity(
      window.localStorage.getItem(PATH_ACTIVITY_STORAGE_KEY)
    );
    const storedReflections = parseStoredReflections(
      window.localStorage.getItem(REFLECTION_STORAGE_KEY)
    );

    window.localStorage.setItem(PATH_ACTIVITY_STORAGE_KEY, JSON.stringify(storedActivity));
    window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(storedReflections));
    window.queueMicrotask(() => {
      setActivity(storedActivity);
      setReflections(storedReflections);
    });
  }, []);

  const chronicle = useMemo(
    () => buildChronicle(activity ?? { roomVisits: [], journeyStarts: [], activatedLetters: [] }, reflections ?? []),
    [activity, reflections]
  );
  const pathSummary = useMemo(
    () => [
      {
        label: "besuchte Raeume",
        value: uniqueBy([...(activity?.roomVisits ?? [])], (visit) => visit.symbolId).length,
      },
      {
        label: "aktivierte Buchstaben",
        value: uniqueBy([...(activity?.activatedLetters ?? [])], (activation) => activation.letterId).length,
      },
      {
        label: "gestartete Journeys",
        value: uniqueBy([...(activity?.journeyStarts ?? [])], (start) => start.journeyId).length,
      },
      {
        label: "gespeicherte Reflexionen",
        value: reflections?.length ?? 0,
      },
    ],
    [activity, reflections]
  );
  const personalJourneys = useMemo(
    () => uniqueBy([...(activity?.journeyStarts ?? [])], (start) => start.journeyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((start) => ({ start, journey: getJourney(start.journeyId) }))
      .filter((item) => item.journey),
    [activity]
  );
  const letterTraces = useMemo(() => {
    const grouped = new Map<string, string[]>();

    for (const activation of [...(activity?.activatedLetters ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )) {
      const path = network.paths.find((item) => item.id === activation.pathId);
      const symbolIds = path ? [path.from, path.to] : activation.symbolId ? [activation.symbolId] : [];
      const current = grouped.get(activation.letterId) ?? [];

      for (const symbolId of symbolIds) {
        if (!current.includes(symbolId)) {
          current.push(symbolId);
        }
      }

      grouped.set(activation.letterId, current);
    }

    return Array.from(grouped.entries())
      .map(([letterId, symbolIds]) => ({
        letter: getLetter(letterId),
        symbolIds,
      }))
      .filter((trace) => trace.letter && trace.symbolIds.length > 0);
  }, [activity]);
  const sortedReflections = useMemo(
    () => [...(reflections ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reflections]
  );
  const isEmpty = activity !== null && reflections !== null && chronicle.length === 0;

  function handleDeleteReflection(id: string) {
    setReflections((current) => {
      const next = (current ?? []).filter((reflection) => reflection.id !== id);

      window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="symbol-page symbol-section min-h-screen py-44 md:py-40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_26%_66%,rgba(91,152,174,0.075),transparent_30%),radial-gradient(circle_at_76%_74%,rgba(245,241,232,0.035),transparent_24%)]" />
        <div className="light-pulse absolute left-1/2 top-24 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.075),transparent_64%)] blur-sm" />
        <div className="absolute inset-x-[8%] top-[23rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.28),rgba(2,5,12,0.72)_48%,rgba(2,5,12,0.92))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="symbol-fade-in mb-20 text-center">
          <p className="symbol-kicker mb-8">Mein Pfad</p>
          <h1 className="mx-auto max-w-5xl font-serif text-6xl italic leading-[0.94] text-foreground-strong hyphens-auto md:text-8xl">
            Meine Bedeutungskarte
          </h1>
          <p className="symbol-copy mx-auto mt-10 max-w-3xl text-2xl italic md:text-3xl">
            Besuchte Raeume, aktivierte Buchstaben, gestartete Journeys und Reflexionen werden hier zur Geschichte im Symbolraum.
          </p>
          <p className="symbol-copy mx-auto mt-6 max-w-2xl text-base text-cyan-soft md:text-lg">
            Nur bestehende Daten. Nur dieses Geraet.
          </p>
        </header>

        {activity === null || reflections === null ? (
          <div className="symbol-path-empty scroll-reveal mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Der Weg wird gelesen</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Die Spuren oeffnen sich gerade.
            </p>
          </div>
        ) : isEmpty ? (
          <div className="symbol-path-empty scroll-reveal mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Noch keine Geschichte</p>
            <p className="mt-6 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
              Dein Pfad entsteht, sobald du einen Raum betrittst.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/symbolnetz" className="symbol-cta">
                Zum Symbolnetz
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            <section className="symbol-path-section">
              <p className="symbol-kicker text-cyan-soft">Kompakte Zusammenfassung</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pathSummary.map((item) => (
                  <article key={item.label} className="symbol-archive-fragment px-5 py-4">
                    <p className="font-serif text-4xl italic leading-none text-foreground-strong">
                      {item.value}
                    </p>
                    <p className="symbol-copy mt-3 text-xs uppercase tracking-[0.18em] text-muted-soft">
                      {item.label}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="symbol-path-section">
              <p className="symbol-kicker text-cyan-soft">Persoenliche Letter-Spuren</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {letterTraces.length > 0 ? letterTraces.map((trace) => (
                  <article key={trace.letter!.id} className="symbol-archive-fragment p-5">
                    <p className="font-serif text-5xl leading-none text-gold/90" lang="he" dir="rtl">
                      {trace.letter!.glyph}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl italic text-foreground-strong">
                      {trace.letter!.name}
                    </h2>
                    <div className="mt-5 grid justify-items-start gap-2">
                      {trace.symbolIds.map((symbolId, index) => {
                        const symbol = getSymbol(symbolId);

                        return (
                          <Fragment key={`${trace.letter!.id}-${symbolId}`}>
                            {index > 0 ? <span className="text-gold/55">&darr;</span> : null}
                            <Link href={symbol?.roomHref ?? "#"} className="symbol-copy text-lg italic text-foreground-strong">
                              {symbol?.label ?? symbolId}
                            </Link>
                          </Fragment>
                        );
                      })}
                    </div>
                  </article>
                )) : (
                  <p className="symbol-copy">Noch keine Letter Bridge aktiviert.</p>
                )}
              </div>
            </section>

            <section className="symbol-path-section">
              <p className="symbol-kicker text-cyan-soft">Meaning Journeys</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {personalJourneys.length > 0 ? personalJourneys.map(({ start, journey }) => (
                  <article key={start.id} className="symbol-archive-fragment p-5">
                    <h2 className="font-serif text-2xl italic text-foreground-strong">{journey!.title}</h2>
                    <p className="symbol-copy mt-3 text-sm">{journey!.description}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-cyan-soft">
                      <JourneySequence items={journey!.symbolLabels} />
                    </p>
                    <p className="mt-3 font-serif text-sm italic leading-relaxed text-gold/75">
                      <JourneySequence items={journey!.meaningNodeLabels} />
                    </p>
                  </article>
                )) : (
                  <p className="symbol-copy">Noch keine Meaning Journey begonnen.</p>
                )}
              </div>
            </section>

            <section className="symbol-path-section">
              <p className="symbol-kicker text-cyan-soft">Reflexionen direkt auf der Reise</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {sortedReflections.length > 0 ? sortedReflections.map((reflection) => (
                  <article key={reflection.id} className="symbol-path-fragment px-5 py-5">
                    <p className="symbol-kicker text-cyan-soft">
                      {reflection.symbol}{reflection.stateTitle ? ` / ${reflection.stateTitle}` : ""}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl italic leading-tight text-foreground-strong">
                      {reflection.question}
                    </h2>
                    <p className="symbol-copy mt-4 whitespace-pre-line break-words text-lg italic">
                      {reflection.answer}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
                      <p className="symbol-copy text-xs uppercase tracking-[0.2em] text-muted-soft">
                        {formatDate(reflection.createdAt)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteReflection(reflection.id)}
                        className="symbol-archive-action"
                      >
                        Spur loeschen
                      </button>
                    </div>
                  </article>
                )) : (
                  <p className="symbol-copy">Noch keine Reflexion gespeichert.</p>
                )}
              </div>
            </section>

            <details className="symbol-path-section group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="symbol-kicker text-cyan-soft">Reisechronik</span>
                <span className="symbol-archive-action">
                  <span className="group-open:hidden">Chronik anzeigen</span>
                  <span className="hidden group-open:inline">Chronik ausblenden</span>
                </span>
              </summary>
              <div className="symbol-path-list mt-6 space-y-4">
                {chronicle.map((item, index) => (
                  <article key={item.id} className="symbol-path-fragment grid gap-5 px-5 py-5 md:grid-cols-[8rem_1fr]">
                    <div>
                      <span className="symbol-path-counter">{String(index + 1).padStart(2, "0")}</span>
                      <p className="symbol-copy mt-4 text-xs uppercase tracking-[0.2em] text-muted-soft">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="symbol-kicker text-cyan-soft">{item.kind}</p>
                      <h2 className="mt-3 font-serif text-3xl italic leading-tight text-foreground-strong">
                        {item.title}
                      </h2>
                      <p className="symbol-copy mt-3 text-base">{item.detail}</p>
                      {item.href ? (
                        <Link href={item.href} className="symbol-archive-action mt-4">
                          Raum oeffnen
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
