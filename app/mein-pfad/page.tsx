"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getPersonalPathEvents,
  getPersonalPathEventSentence,
  migrateLegacyPathState,
  type PersonalPathEvent,
  type PersonalPathEventType,
} from "@/lib/personalPathState";
import { getSymbolPathConfig, symbolPathConfigs } from "@/lib/symbols/symbolPathConfig";

const eventTypeLabels: Record<PersonalPathEventType, string> = {
  room_entered: "Hier warst du",
  codex_visited: "Codex beruehrt",
  question_answered: "Beantwortete Frage",
  resonance_saved: "Gespeicherte Resonanz",
  marker_added: "Wegmarke gesetzt",
};

const symbolMovement = ["wasser", "licht", "feuer", "wueste", "brot"];

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

function getEventHref(event: PersonalPathEvent) {
  if (event.type === "room_entered" && event.roomId) {
    return getSymbolPathConfig(event.roomId)?.roomHref ?? `/raeume/${event.roomId}`;
  }

  if (event.codexId) {
    return `/codex/${event.codexId}`;
  }

  if (event.roomId) {
    return getSymbolPathConfig(event.roomId)?.roomHref ?? `/raeume/${event.roomId}`;
  }

  return event.sourceRoute || undefined;
}

function getEventSentence(event: PersonalPathEvent) {
  return getPersonalPathEventSentence(event);
}

function getUniqueEvents(events: PersonalPathEvent[], predicate: (event: PersonalPathEvent) => boolean) {
  const seen = new Set<string>();

  return events.filter((event) => {
    if (!predicate(event)) return false;

    const key = `${event.targetType}:${event.targetId}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMovementLabels(events: PersonalPathEvent[]) {
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const event of [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())) {
    const id = event.roomId ?? event.targetId;
    const label = getSymbolPathConfig(id)?.label ?? event.label;
    const key = `${event.targetType}:${id}`;

    if (seen.has(key)) continue;
    if (event.type !== "room_entered" && event.type !== "codex_visited" && event.type !== "question_answered" && event.targetId !== "erste-bewegung") continue;

    seen.add(key);
    labels.push(event.targetId === "erste-bewegung" ? event.label : label);
  }

  return labels.slice(-6);
}

function getNextThreshold(events: PersonalPathEvent[]) {
  const touchedSymbols = new Set(
    events
      .flatMap((event) => [event.roomId, event.targetId])
      .filter((id): id is string => Boolean(id && symbolMovement.includes(id)))
  );
  const nextSymbol = symbolMovement.find((symbolId) => !touchedSymbols.has(symbolId));
  const config = nextSymbol ? symbolPathConfigs[nextSymbol as keyof typeof symbolPathConfigs] : undefined;

  if (!config) {
    return {
      label: "Deine Spur ist offen",
      href: "/symbolnetz",
      text: "Du hast die bekannten Raeume bereits beruehrt. Von hier darf das Symbolnetz die naechste Schwelle zeigen.",
    };
  }

  return {
    label: config.roomLabel,
    href: config.roomHref,
    text: `Noch offen: ${config.roomLabel}. Diese Schwelle ist noch nicht Teil deiner sichtbaren Spur.`,
  };
}

export default function MeinPfadPage() {
  const [events, setEvents] = useState<PersonalPathEvent[] | null>(null);

  useEffect(() => {
    migrateLegacyPathState();
    window.queueMicrotask(() => setEvents(getPersonalPathEvents()));
  }, []);

  const sortedEvents = useMemo(
    () => [...(events ?? [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [events]
  );
  const touchedPlaces = useMemo(
    () => getUniqueEvents(sortedEvents, (event) => event.type === "room_entered" || event.type === "codex_visited").slice(0, 8),
    [sortedEvents]
  );
  const answeredQuestions = useMemo(
    () => sortedEvents.filter((event) => event.type === "question_answered").slice(0, 4),
    [sortedEvents]
  );
  const movementLabels = useMemo(() => getMovementLabels(sortedEvents), [sortedEvents]);
  const nextThreshold = useMemo(() => getNextThreshold(sortedEvents), [sortedEvents]);
  const latestEvent = sortedEvents[0];

  return (
    <div className="symbol-page symbol-section min-h-screen py-36 md:py-40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="symbol-path-memory-backdrop absolute inset-[-6%]" />
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_28%_68%,rgba(91,152,174,0.075),transparent_30%)]" />
        <div className="absolute inset-x-[8%] top-[22rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.18),rgba(2,5,12,0.76)_48%,rgba(2,5,12,0.94))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="symbol-fade-in mb-14 text-center">
          <p className="symbol-kicker mb-7">Deine Spur</p>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
            Dein Pfad zeigt nur, wo du wirklich warst
          </h1>
          <p className="symbol-copy mx-auto mt-8 max-w-2xl text-xl italic md:text-2xl">
            Hier bleiben betretene Raeume, beruehrte Codex-Seiten, beantwortete Fragen und gesetzte Wegmarken sichtbar.
          </p>
        </header>

        {events === null ? (
          <section className="symbol-path-empty mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Deine Spur wird gelesen</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Die letzten Orte treten hervor.
            </p>
          </section>
        ) : sortedEvents.length === 0 ? (
          <section className="symbol-path-empty mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Noch keine Spur</p>
            <p className="mt-6 font-serif text-3xl italic leading-tight text-foreground-strong md:text-4xl">
              Sobald du einen Raum betrittst oder eine Frage beantwortest, erscheint hier deine erste Wegstelle.
            </p>
            <div className="symbol-path-empty__entries mt-9">
              <Link href="/raeume/wasser" className="symbol-archive-action">
                Den Wasser-Raum betreten
              </Link>
              <Link href="/codex/wasser" className="symbol-archive-action symbol-archive-action--quiet">
                Wasser im Codex beruehren
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-10">
            {latestEvent ? (
              <section className="symbol-path-summary mx-auto max-w-3xl text-center" aria-label="Deine letzte Spur">
                <p className="symbol-kicker text-cyan-soft">Deine letzte Spur</p>
                <p className="symbol-copy mt-5 text-xl italic md:text-2xl">
                  {getEventSentence(latestEvent)}
                </p>
                <p className="symbol-path-summary__meta mt-5">{formatDate(latestEvent.timestamp)}</p>
              </section>
            ) : null}

            {movementLabels.length > 0 ? (
              <section className="symbol-personal-way" aria-label="Letzte Bewegung">
                <div className="symbol-personal-way__head">
                  <p className="symbol-kicker">Letzte Bewegung</p>
                  <h2>{movementLabels.join(" -> ")}</h2>
                  <p>Diese Bewegung entsteht nur aus Orten, die du betreten oder beruehrt hast.</p>
                </div>
              </section>
            ) : null}

            <section className="symbol-personal-way" aria-label="Noch offene Schwelle">
              <div className="symbol-personal-way__head">
                <p className="symbol-kicker">Noch offene Schwelle</p>
                <h2>{nextThreshold.label}</h2>
                <p>{nextThreshold.text}</p>
              </div>
              <Link href={nextThreshold.href} className="symbol-archive-action">
                Diese Schwelle ansehen
              </Link>
            </section>

            {touchedPlaces.length > 0 ? (
              <section className="symbol-personal-map" aria-label="Beruehrte Orte">
                <div className="symbol-personal-map__head">
                  <p className="symbol-kicker">Beruehrte Orte</p>
                  <h2>Hier warst du</h2>
                </div>
                <div className="symbol-personal-map__grid">
                  {touchedPlaces.map((event) => {
                    const href = getEventHref(event);

                    return (
                      <article key={event.id} className="symbol-personal-track">
                        <div className="symbol-personal-track__top">
                          <p className="symbol-personal-track__status">{eventTypeLabels[event.type]}</p>
                        </div>
                        <h3>{event.label}</h3>
                        <p className="symbol-personal-track__last">{formatDate(event.timestamp)}</p>
                        {href ? (
                          <Link href={href} className="symbol-archive-action">
                            Ort wieder oeffnen
                          </Link>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {answeredQuestions.length > 0 ? (
              <section className="symbol-path-list grid gap-5" aria-label="Beantwortete Fragen">
                <div className="symbol-personal-map__head">
                  <p className="symbol-kicker">Beantwortete Fragen</p>
                  <h2>Diese Fragen hast du mitgenommen</h2>
                </div>
                {answeredQuestions.map((event) => (
                  <article key={event.id} className="symbol-path-fragment px-5 py-5 sm:px-6 sm:py-6">
                    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="symbol-kicker text-cyan-soft">{event.label}</p>
                        <h3 className="mt-4 font-serif text-2xl italic leading-tight text-foreground-strong md:text-3xl">
                          {getEventSentence(event)}
                        </h3>
                        {event.answer ? (
                          <p className="symbol-copy mt-5 whitespace-pre-line break-words text-lg italic">
                            {event.answer}
                          </p>
                        ) : null}
                      </div>
                      <p className="symbol-copy text-xs uppercase tracking-[0.2em] text-muted-soft sm:text-right">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            <section className="symbol-path-list grid gap-5" aria-label="Deine Spur">
              {sortedEvents.map((event) => {
                const href = getEventHref(event);

                return (
                  <article key={event.id} className="symbol-path-fragment px-5 py-5 sm:px-6 sm:py-6">
                    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="symbol-kicker text-cyan-soft">{eventTypeLabels[event.type]}</p>
                        <h3 className="mt-4 font-serif text-2xl italic leading-tight text-foreground-strong md:text-3xl">
                          {event.label}
                        </h3>
                        <p className="symbol-copy mt-3 text-base italic text-gold/75">
                          {getEventSentence(event)}
                        </p>
                        {event.context ? (
                          <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{event.context}</p>
                        ) : null}
                      </div>
                      <p className="symbol-copy text-xs uppercase tracking-[0.2em] text-muted-soft sm:text-right">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                    {href ? (
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4">
                        <Link href={href} className="symbol-archive-action">
                          Zur Wegstelle
                        </Link>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
