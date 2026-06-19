"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  persistStoredReflections,
  getJourneyReflectionForStep,
  getReflectionContextLabel,
  getReflectionPreview,
  readStoredReflections,
  resolveReflectionReturnLinks,
  type ReflectionReturnLink,
  type StoredReflection,
} from "@/lib/reflections";
import {
  buildSymbolRoomHref,
  getSymbolPathConfigFromReflectionLike,
  symbolPathConfigs,
  type ConfiguredSymbolId,
  type SymbolPathConfig,
} from "@/lib/symbols/symbolPathConfig";
import { symbolJourneys, type SymbolJourney } from "@/lib/symbols/symbolJourneys";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ohne Datum";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
  }).format(date);
}

function normalizeTraceText(value: string) {
  return value.toLocaleLowerCase("de-DE").replace(/\s+/g, " ").trim();
}

function cleanTraceLabel(value: string | undefined) {
  return value?.split(/[?#]/, 1)[0].replace(/\s*->\s*/g, " in ").trim();
}

function isTechnicalTraceLabel(value: string | undefined) {
  return Boolean(value && (/_|->/.test(value) || /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(value)));
}

function getSafeTraceLabel(value: string | undefined, fallback = "Symbol-Spur") {
  const label = cleanTraceLabel(value);

  return label && !isTechnicalTraceLabel(label) ? label : fallback;
}

function getTraceBaseTitle(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (bridge) {
    return bridge.label;
  }

  return getSafeTraceLabel(reflection.title || reflection.symbol);
}

function getTouchedLabel(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  return bridge?.label || getSafeTraceLabel(reflection.title || reflection.symbol);
}

function getRoomContextLabel(reflection: StoredReflection) {
  const title = getTraceBaseTitle(reflection);
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (bridge && (reflection.sourceType === "room" || reflection.roomHref === bridge.roomHref)) {
    return bridge.reflectionSource.contextLabel;
  }

  if (reflection.sourceType === "room") {
    return `Aus dem ${title}-Raum`;
  }

  if (reflection.roomHref) {
    return `Aus dem ${title}-Raum`;
  }

  return undefined;
}

function getTraceContext(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (isConfiguredRoomReflection(reflection)) {
    const configuredBridge = getSymbolPathConfigFromReflectionLike(reflection);
    const pathLabel = cleanTraceLabel(reflection.pathLabel);

    return pathLabel || configuredBridge?.traceLabel || "Symbol-Spur";
  }

  const roomContext = getRoomContextLabel(reflection);

  if (roomContext) {
    return reflection.stateTitle ? `${roomContext} / ${reflection.stateTitle}` : roomContext;
  }

  if (reflection.sourceType === "symbol") {
    return "Aus dem Symbolnetz";
  }

  if (
    reflection.sourceType === "pattern" ||
    reflection.sourceType === "journey" ||
    reflection.sourceType === "core" ||
    reflection.sourceType === "letter" ||
    reflection.codexHref
  ) {
    return "Aus dem Codex";
  }

  if (bridge) {
    return bridge.traceLabel;
  }

  return "Aeltere Spur";
}

function getTraceTitle(reflection: StoredReflection) {
  if (isConfiguredRoomReflection(reflection)) {
    const configuredBridge = getSymbolPathConfigFromReflectionLike(reflection);

    return configuredBridge?.reflectionSource.label ?? "Spur aus dem Raum";
  }

  const title = getTraceBaseTitle(reflection);
  const pathLabel = getSafeTraceLabel(reflection.pathLabel, "");

  if (pathLabel) {
    return normalizeTraceText(pathLabel).includes(normalizeTraceText(title))
      ? pathLabel
      : `${title} in ${pathLabel}`;
  }

  if (reflection.stateTitle) {
    return `${title} / ${reflection.stateTitle}`;
  }

  return title;
}

function isConfiguredRoomReflection(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  return Boolean(bridge && (reflection.sourceType === "room" || reflection.roomHref === bridge.roomHref));
}

type ReflectionGroupKey = "rooms" | "codex" | "network" | "older";

type ReflectionGroup = {
  key: ReflectionGroupKey;
  label: string;
  reflections: StoredReflection[];
};

type SymbolFilterKey = "all" | ConfiguredSymbolId;

type PersonalSymbolTrack = {
  symbolId: ConfiguredSymbolId;
  config: SymbolPathConfig;
  reflections: StoredReflection[];
  count: number;
  lastPathLabel?: string;
  href: string;
  ctaLabel: string;
};

const personalSymbolOrder = ["wasser", "licht", "feuer", "wueste", "brot"] as const satisfies ConfiguredSymbolId[];

const groupOrder: Array<{ key: ReflectionGroupKey; label: string }> = [
  { key: "rooms", label: "Spuren aus Raeumen" },
  { key: "codex", label: "Spuren aus dem Codex" },
  { key: "network", label: "Spuren aus dem Netz" },
  { key: "older", label: "Aeltere Spuren" },
];

function getReflectionGroupKey(reflection: StoredReflection): ReflectionGroupKey {
  if (reflection.sourceType === "room" || reflection.roomHref) return "rooms";
  if (reflection.sourceType === "symbol") return "network";
  if (
    reflection.sourceType === "pattern" ||
    reflection.sourceType === "journey" ||
    reflection.sourceType === "core" ||
    reflection.sourceType === "letter" ||
    reflection.codexHref
  ) {
    return "codex";
  }

  return "older";
}

function buildReflectionGroups(reflections: StoredReflection[]): ReflectionGroup[] {
  return groupOrder
    .map(({ key, label }) => ({
      key,
      label,
      reflections: reflections.filter((reflection) => getReflectionGroupKey(reflection) === key),
    }))
    .filter((group) => group.reflections.length > 0);
}

function getRepeatedTouches(reflections: StoredReflection[]) {
  const counts = new Map<string, { label: string; count: number }>();

  reflections.forEach((reflection) => {
    const label = getTouchedLabel(reflection);
    if (!label) return;

    const key = normalizeTraceText(label);
    const current = counts.get(key);

    counts.set(key, { label, count: current ? current.count + 1 : 1 });
  });

  return [...counts.values()]
    .filter((item) => item.count > 1)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de-DE"))
    .slice(0, 3)
    .map((item) => item.label);
}

function getTouchedSummary(reflections: StoredReflection[]) {
  const labels: string[] = [];
  const seen = new Set<string>();

  reflections.forEach((reflection) => {
    const label = getTouchedLabel(reflection);
    if (!label) return;

    const key = normalizeTraceText(label);
    if (seen.has(key)) return;

    seen.add(key);
    labels.push(label);
  });

  return labels.slice(0, 3);
}

function getTraceCountLabel(count: number) {
  return count === 1 ? "Eine Spur" : `${count} Spuren`;
}

function getReflectionSymbolId(reflection: StoredReflection): ConfiguredSymbolId | undefined {
  return getSymbolPathConfigFromReflectionLike(reflection)?.symbolId as ConfiguredSymbolId | undefined;
}

function getReflectionPathId(reflection: StoredReflection) {
  return (reflection.pathContext?.path ?? reflection.path)?.split(/[?#]/, 1)[0];
}

function getReflectionKnownPathLabel(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);
  const pathLabel = getSafeTraceLabel(reflection.pathLabel, "");
  const stateTitle = getSafeTraceLabel(reflection.stateTitle, "");

  if (pathLabel) return pathLabel;
  if (stateTitle) return stateTitle;

  return bridge?.traceLabel;
}

function getTrackCtaLabel(config: SymbolPathConfig, hasTrace: boolean) {
  if (!hasTrace) {
    return `Den ${config.roomLabel} betreten`;
  }

  return `Zur ${config.traceLabel.replace("-Spur", "spur")} zurueckkehren`;
}

function buildPersonalSymbolTracks(reflections: StoredReflection[]): PersonalSymbolTrack[] {
  return personalSymbolOrder.map((symbolId) => {
    const config = symbolPathConfigs[symbolId];
    const symbolReflections = reflections.filter((reflection) => getReflectionSymbolId(reflection) === symbolId);
    const lastReflection = symbolReflections[0];
    const pathId = lastReflection ? getReflectionPathId(lastReflection) : undefined;
    const hasTrace = symbolReflections.length > 0;

    return {
      symbolId,
      config,
      reflections: symbolReflections,
      count: symbolReflections.length,
      lastPathLabel: lastReflection ? getReflectionKnownPathLabel(lastReflection) : undefined,
      href: hasTrace
        ? buildSymbolRoomHref(symbolId, { from: "mein-pfad", path: pathId, symbol: symbolId })
        : config.roomHref,
      ctaLabel: getTrackCtaLabel(config, hasTrace),
    };
  });
}

function filterReflectionsBySymbol(reflections: StoredReflection[], filter: SymbolFilterKey) {
  if (filter === "all") {
    return reflections;
  }

  return reflections.filter((reflection) => getReflectionSymbolId(reflection) === filter);
}

export default function MeinPfadPage() {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);
  const [activeSymbolFilter, setActiveSymbolFilter] = useState<SymbolFilterKey>("all");

  useEffect(() => {
    const storedReflections = readStoredReflections();

    persistStoredReflections(storedReflections);
    window.queueMicrotask(() => setReflections(storedReflections));
  }, []);

  const sortedReflections = useMemo(
    () => [...(reflections ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reflections]
  );
  const symbolTracks = useMemo(() => buildPersonalSymbolTracks(sortedReflections), [sortedReflections]);
  const filteredReflections = useMemo(
    () => filterReflectionsBySymbol(sortedReflections, activeSymbolFilter),
    [activeSymbolFilter, sortedReflections]
  );
  const reflectionGroups = useMemo(() => buildReflectionGroups(filteredReflections), [filteredReflections]);
  const showGroups = filteredReflections.length >= 4 && reflectionGroups.length > 1;
  const repeatedTouches = useMemo(() => getRepeatedTouches(sortedReflections), [sortedReflections]);
  const touchedSummary = useMemo(() => getTouchedSummary(sortedReflections), [sortedReflections]);
  const waterToBreadJourney = symbolJourneys[0];

  function handleRemoveReflection(id: string) {
    setReflections((current) => {
      const next = (current ?? []).filter((reflection) => reflection.id !== id);

      persistStoredReflections(next);
      return next;
    });
  }

  return (
    <div className="symbol-page symbol-section min-h-screen py-36 md:py-40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_28%_68%,rgba(91,152,174,0.075),transparent_30%)]" />
        <div className="absolute inset-x-[8%] top-[22rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.18),rgba(2,5,12,0.76)_48%,rgba(2,5,12,0.94))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="symbol-fade-in mb-14 text-center">
          <p className="symbol-kicker mb-7">Mein Pfad</p>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
            Bewahrte Spuren
          </h1>
          <p className="symbol-copy mx-auto mt-8 max-w-2xl text-xl italic md:text-2xl">
            Hier sammeln sich die Spuren, die du im SYMBOLRAUM bewahrt hast.
          </p>
        </header>

        {reflections === null ? (
          <div className="symbol-path-empty mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Der Pfad wird still</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Die bewahrten Spuren oeffnen sich gerade.
            </p>
          </div>
        ) : (
          <>
            <PersonalSymbolMap tracks={symbolTracks} />
            <PersonalJourneyCard journey={waterToBreadJourney} reflections={sortedReflections} />

            {sortedReflections.length === 0 ? (
              <div className="symbol-path-empty mx-auto mt-12 max-w-3xl text-center">
                <p className="symbol-kicker">Dein Pfad ist noch still</p>
                <p className="mt-6 font-serif text-3xl italic leading-tight text-foreground-strong md:text-4xl">
                  Im Wasser-Raum kann deine erste Spur sichtbar werden.
                </p>
                <div className="symbol-path-empty__entries mt-9">
                  <Link href="/raeume/wasser" className="symbol-archive-action">
                    Den Wasser-Raum betreten
                  </Link>
                  <Link href="/symbolnetz" className="symbol-archive-action symbol-archive-action--quiet">
                    Symbolnetz oeffnen
                  </Link>
                </div>
              </div>
            ) : null}

            {sortedReflections.length > 0 ? (
              <section className="symbol-path-summary mx-auto mb-10 max-w-3xl text-center" aria-label="Pfadverdichtung">
                <p className="symbol-copy text-xl italic md:text-2xl">
                  Dein Pfad sammelt keine Antworten.
                  <br />
                  Er bewahrt die Stellen, an denen etwas in dir nachklang.
                </p>
                <p className="symbol-path-summary__meta mt-5">
                  {sortedReflections.length === 1
                    ? touchedSummary.length > 0
                      ? `${touchedSummary[0]} bewahrt`
                      : "Eine Spur bewahrt"
                    : [getTraceCountLabel(sortedReflections.length), ...touchedSummary].join(" / ")}
                </p>
                {repeatedTouches.length > 0 ? (
                  <p className="symbol-path-resonance mt-4">
                    Mehrfach beruehrt: {repeatedTouches.join(", ")}
                  </p>
                ) : null}
              </section>
            ) : null}

            {sortedReflections.length > 0 ? (
              <SymbolPathFilters
                tracks={symbolTracks}
                activeFilter={activeSymbolFilter}
                onSelectFilter={setActiveSymbolFilter}
              />
            ) : null}

            {sortedReflections.length === 0 ? null : filteredReflections.length === 0 ? (
              <section className="symbol-path-empty mx-auto max-w-3xl text-center" aria-label="Keine Spuren in diesem Filter">
                <p className="symbol-kicker">Noch keine Spur</p>
                <p className="mt-5 font-serif text-2xl italic text-foreground-strong">
                  Diese Symbolspur wartet noch auf ihren ersten Eintrag.
                </p>
              </section>
            ) : showGroups ? (
              <div className="grid gap-10" aria-label="Bewahrte Spuren">
                {reflectionGroups.map((group) => (
                  <section key={group.key} className="symbol-path-group">
                    <h2 className="symbol-path-group__title">{group.label}</h2>
                    <div className="symbol-path-list grid gap-5">
                      {group.reflections.map((reflection) => (
                        <ReflectionArticle
                          key={reflection.id}
                          reflection={reflection}
                          returnLinks={resolveReflectionReturnLinks(reflection)}
                          onRemove={handleRemoveReflection}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <section className="symbol-path-list grid gap-5" aria-label="Bewahrte Spuren">
                {filteredReflections.map((reflection) => (
                  <ReflectionArticle
                    key={reflection.id}
                    reflection={reflection}
                    returnLinks={resolveReflectionReturnLinks(reflection)}
                    onRemove={handleRemoveReflection}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getJourneyStepCtaLabel(hasTrace: boolean) {
  return hasTrace ? "In diesen Raum zurueckkehren" : "Diesen Raum betreten";
}

function PersonalJourneyCard({
  journey,
  reflections,
}: {
  journey: SymbolJourney;
  reflections: StoredReflection[];
}) {
  const reflectionByStep = new Map(
    journey.steps.map((step) => [step.symbol, getJourneyReflectionForStep(reflections, step)])
  );
  const hasAnyTrace = [...reflectionByStep.values()].some(Boolean);

  return (
    <section className="symbol-journey-card" aria-label="Spurenfeld Vom Wasser zum Brot">
      <div className="symbol-journey-card__head">
        <p className="symbol-kicker">Verbundenes Spurenfeld</p>
        <h2>{journey.title}</h2>
        <p className="symbol-journey-card__subtitle">Deine fuenf Grundspuren in Resonanz</p>
        <p className="symbol-copy">
          Wasser, Licht, Feuer, Wueste und Brot bilden zusammen eine Bewegung: Ursprung, Offenbarung, Wandlung,
          Laeuterung und Gabe.
        </p>
      </div>

      {!hasAnyTrace ? (
        <div className="symbol-journey-empty">
          <p className="symbol-kicker">Das Spurenfeld ist noch still</p>
          <p>Wasser kann sich zuerst oeffnen, oder ein anderer Raum ruft leise.</p>
          <div>
            <Link href={journey.steps[0]?.roomHref ?? "/raeume/wasser"} className="symbol-archive-action">
              Den Wasser-Raum betreten
            </Link>
            {journey.steps.slice(1).map((step) => (
              <Link key={step.symbol} href={step.roomHref} className="symbol-archive-action">
                {step.label}-Raum betreten
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <ol className="symbol-journey-steps">
        {journey.steps.map((step, index) => {
          const reflection = reflectionByStep.get(step.symbol);
          const hasTrace = Boolean(reflection);
          const reflectionContext = reflection ? getReflectionContextLabel(reflection) : undefined;

          return (
            <li key={step.symbol} className="symbol-journey-step">
              <article>
                <span className="symbol-journey-step__index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.label}</h3>
                <p className="symbol-journey-step__status">
                  {hasTrace ? "Spur bewahrt" : "Noch still"}
                </p>
                <p>{step.text}</p>
                {reflection ? (
                  <div className="symbol-journey-step__reflection">
                    <p className="symbol-journey-step__reflection-title">Deine Spur</p>
                    {reflectionContext ? (
                      <p className="symbol-journey-step__reflection-context">{reflectionContext}</p>
                    ) : null}
                    <p className="symbol-journey-step__reflection-preview">
                      {getReflectionPreview(reflection) || "Eine Spur ist bereits hier."}
                    </p>
                  </div>
                ) : (
                  <p className="symbol-journey-step__still">Dieser Raum ist noch still.</p>
                )}
                <div className="symbol-journey-step__actions">
                  <Link href={step.roomHref} className="symbol-archive-action">
                    {getJourneyStepCtaLabel(hasTrace)}
                  </Link>
                  <Link href={step.codexHref} className="symbol-archive-action symbol-archive-action--quiet">
                    {hasTrace ? "Im Codex vertiefen" : "Im Codex ansehen"}
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function PersonalSymbolMap({ tracks }: { tracks: PersonalSymbolTrack[] }) {
  return (
    <section className="symbol-personal-map" aria-label="Persoenliches Spurenfeld">
      <div className="symbol-personal-map__head">
        <p className="symbol-kicker">Persoenliches Spurenfeld</p>
        <h2>Fünf innere Spuren</h2>
      </div>

      <div className="symbol-personal-map__grid">
        {tracks.map((track) => (
          <article key={track.symbolId} className="symbol-personal-track">
            <div className="symbol-personal-track__top">
              <p className="symbol-personal-track__hebrew" aria-hidden="true">
                {track.config.hebrew}
              </p>
              <p className="symbol-personal-track__status">
                {track.count > 0 ? "Spur bewahrt" : "Noch still"}
              </p>
            </div>

            <h3>{track.config.traceLabel}</h3>
            <p className="symbol-personal-track__count">
              {track.count > 0 ? getTraceCountLabel(track.count) : "Noch keine Spur"}
            </p>
            <p className="symbol-personal-track__last">
              {track.lastPathLabel ? `Zuletzt beruehrt: ${track.lastPathLabel}` : "Diese Spur wartet still."}
            </p>

            <Link href={track.href} className="symbol-archive-action">
              {track.ctaLabel}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function SymbolPathFilters({
  tracks,
  activeFilter,
  onSelectFilter,
}: {
  tracks: PersonalSymbolTrack[];
  activeFilter: SymbolFilterKey;
  onSelectFilter: (filter: SymbolFilterKey) => void;
}) {
  return (
    <div className="symbol-path-filters" aria-label="Spuren nach Symbol filtern">
      <button
        type="button"
        className={activeFilter === "all" ? "is-active" : undefined}
        aria-pressed={activeFilter === "all"}
        onClick={() => onSelectFilter("all")}
      >
        Alle
      </button>
      {tracks.map((track) => (
        <button
          key={track.symbolId}
          type="button"
          className={activeFilter === track.symbolId ? "is-active" : undefined}
          aria-pressed={activeFilter === track.symbolId}
          onClick={() => onSelectFilter(track.symbolId)}
        >
          {track.config.label}
        </button>
      ))}
    </div>
  );
}

function ReflectionArticle({
  reflection,
  returnLinks,
  onRemove,
}: {
  reflection: StoredReflection;
  returnLinks: ReflectionReturnLink[];
  onRemove: (id: string) => void;
}) {
  return (
    <article className="symbol-path-fragment px-5 py-5 sm:px-6 sm:py-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="symbol-kicker text-cyan-soft">{getTraceContext(reflection)}</p>
          <h3 className="mt-4 font-serif text-2xl italic leading-tight text-foreground-strong md:text-3xl">
            {getTraceTitle(reflection)}
          </h3>
          <p className="symbol-copy mt-3 text-base italic text-gold/75">
            {reflection.question}
          </p>
          <p className="symbol-copy mt-5 whitespace-pre-line break-words text-lg italic">
            {reflection.answer}
          </p>
        </div>
        <p className="symbol-copy text-xs uppercase tracking-[0.2em] text-muted-soft sm:text-right">
          {formatDate(reflection.createdAt)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4">
        {returnLinks.map((link) => (
          <Link key={`${link.key}-${link.href}`} href={link.href} className="symbol-archive-action">
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => onRemove(reflection.id)}
          className="symbol-archive-action"
        >
          Spur entfernen
        </button>
      </div>
    </article>
  );
}
