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
  getKnownSymbolPathLabel,
  getSymbolPathConfig,
  getSymbolPathConfigFromReflectionLike,
  symbolPathConfigs,
  type ConfiguredSymbolId,
  type SymbolPathConfig,
} from "@/lib/symbols/symbolPathConfig";
import { symbolJourneys, type SymbolJourney } from "@/lib/symbols/symbolJourneys";
import { derivePersonalWay, type PersonalWay, type PersonalWayOpening } from "@/lib/personalWay";

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

function getSafeTraceLabel(value: string | undefined, fallback = "Symbolzeichen") {
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

    return pathLabel || configuredBridge?.label || "Symbolzeichen";
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

  return "Fruehere Wegstelle";
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
const MAX_WAY_MEMORY_ITEMS = 4;
const MAX_WAY_FAMILIAR_ITEMS = 5;
const MAX_WAY_OPENINGS = 3;

const groupOrder: Array<{ key: ReflectionGroupKey; label: string }> = [
  { key: "rooms", label: "Aus den Raeumen" },
  { key: "codex", label: "Aus dem Codex" },
  { key: "network", label: "Aus dem Symbolnetz" },
  { key: "older", label: "Fruehere Wegstellen" },
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
  return count === 1 ? "Eine Wegstelle" : `${count} Wegstellen`;
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

  return `In den ${config.roomLabel} zurueckkehren`;
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

function hasPersonalWay(personalWay: PersonalWay | null) {
  return Boolean(
    personalWay &&
      (
        personalWay.visitedRooms.length > 0 ||
        personalWay.reflectedAnchors.length > 0 ||
        personalWay.familiarSymbols.length > 0 ||
        personalWay.nextOpenings.length > 0
      )
  );
}

function getWaySymbolLabel(symbolId: string) {
  return getSymbolPathConfig(symbolId)?.label ?? getKnownSymbolPathLabel(symbolId);
}

function getWayRoomLabel(symbolId: string) {
  return getSymbolPathConfig(symbolId)?.roomLabel ?? getWaySymbolLabel(symbolId);
}

function getWayAnchorLabel(anchorId: string) {
  return getKnownSymbolPathLabel(anchorId) ?? getSymbolPathConfig(anchorId)?.label;
}

function buildWayMemoryItems(personalWay: PersonalWay) {
  const roomItems = personalWay.visitedRooms
    .map((symbolId) => getWayRoomLabel(symbolId))
    .filter(Boolean)
    .map((label) => `${label} liegt hinter dir und nimmt deine Spur auf.`);

  const anchorItems = personalWay.reflectedAnchors
    .map((anchorId) => getWayAnchorLabel(anchorId))
    .filter(Boolean)
    .map((label) => `${label} bleibt als beruehrter Anker nahe.`);

  return [...roomItems, ...anchorItems].slice(0, MAX_WAY_MEMORY_ITEMS);
}

function buildWayFamiliarItems(personalWay: PersonalWay) {
  return personalWay.familiarSymbols
    .map((symbolId) => getWaySymbolLabel(symbolId))
    .filter(Boolean)
    .slice(0, MAX_WAY_FAMILIAR_ITEMS)
    .map((label) => `${label} ist dir vertraut geworden.`);
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
  const personalWay = useMemo(
    () => (reflections === null ? null : derivePersonalWay({ reflections: sortedReflections })),
    [reflections, sortedReflections]
  );
  const hasWay = hasPersonalWay(personalWay);
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
        <div className="symbol-path-memory-backdrop absolute inset-[-6%]" />
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_28%_68%,rgba(91,152,174,0.075),transparent_30%)]" />
        <div className="absolute inset-x-[8%] top-[22rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.18),rgba(2,5,12,0.76)_48%,rgba(2,5,12,0.94))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="symbol-fade-in mb-14 text-center">
          <p className="symbol-kicker mb-7">Der Weg</p>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
            Dein Weg durch den SYMBOLRAUM
          </h1>
          <p className="symbol-copy mx-auto mt-8 max-w-2xl text-xl italic md:text-2xl">
            Hier bleiben die Orte lesbar, an denen ein Zeichen in dir nachgeklungen hat.
          </p>
        </header>

        {reflections === null ? (
          <div className="symbol-path-empty mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Der Weg wird still</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Deine Wegstellen oeffnen sich gerade.
            </p>
          </div>
        ) : (
          <>
            {hasWay ? (
              <>
                <PersonalSymbolMap tracks={symbolTracks} />
                {personalWay ? <PersonalWaySection personalWay={personalWay} /> : null}
                <PersonalJourneyCard journey={waterToBreadJourney} reflections={sortedReflections} />
              </>
            ) : null}

            {!hasWay ? (
              <div className="symbol-path-empty mx-auto mt-12 max-w-3xl text-center">
                <p className="symbol-kicker">Der Weg ist noch still</p>
                <p className="mt-6 font-serif text-3xl italic leading-tight text-foreground-strong md:text-4xl">
                  Im Wasser-Raum kann der erste Nachklang sichtbar werden.
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
                  Dein Weg sammelt keine Antworten.
                  <br />
                  Er bewahrt die Stellen, an denen etwas in dir nachklang.
                </p>
                <p className="symbol-path-summary__meta mt-5">
                  {sortedReflections.length === 1
                    ? touchedSummary.length > 0
                      ? `${touchedSummary[0]} bewahrt`
                      : "Eine Wegstelle"
                    : [getTraceCountLabel(sortedReflections.length), ...touchedSummary].join(" / ")}
                </p>
                {repeatedTouches.length > 0 ? (
                  <p className="symbol-path-resonance mt-4">
                    Wiederkehrend nahe: {repeatedTouches.join(", ")}
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
              <section className="symbol-path-empty mx-auto max-w-3xl text-center" aria-label="Keine Wegstelle in diesem Zeichen">
                <p className="symbol-kicker">Noch still</p>
                <p className="mt-5 font-serif text-2xl italic text-foreground-strong">
                  Dieses Zeichen wartet noch auf seinen ersten Nachklang.
                </p>
              </section>
            ) : showGroups ? (
              <div className="grid gap-10" aria-label="Wegstellen">
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
              <section className="symbol-path-list grid gap-5" aria-label="Wegstellen">
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

function PersonalWaySection({ personalWay }: { personalWay: PersonalWay }) {
  const memoryItems = buildWayMemoryItems(personalWay);
  const familiarItems = buildWayFamiliarItems(personalWay);
  const openings = personalWay.nextOpenings.slice(0, MAX_WAY_OPENINGS);
  const hasWayContent = memoryItems.length > 0 || familiarItems.length > 0 || openings.length > 0;

  if (!hasWayContent) {
    return null;
  }

  return (
    <section className="symbol-personal-way" aria-label="Der Weg">
      <div className="symbol-personal-way__head">
        <p className="symbol-kicker">Der Weg</p>
        <h2>Der Weg</h2>
        <p>
          Nicht alles, was du beruehrt hast, liegt hinter dir. Manche Zeichen bleiben nahe und oeffnen von hier aus
          einen naechsten Raum.
        </p>
      </div>

      <div className="symbol-personal-way__grid">
        <WayQuietArea
          title="Was hinter dir liegt"
          emptyText="Noch liegt der Weg still vor dir."
          items={memoryItems}
        />
        <WayQuietArea
          title="Was vertraut geworden ist"
          emptyText="Manches Zeichen wartet noch darauf, vertraut zu werden."
          items={familiarItems}
        />
        <WayOpeningsArea openings={openings} />
      </div>
    </section>
  );
}

function WayQuietArea({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: string[];
}) {
  return (
    <article className="symbol-personal-way__area">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </article>
  );
}

function WayOpeningsArea({ openings }: { openings: PersonalWayOpening[] }) {
  return (
    <article className="symbol-personal-way__area symbol-personal-way__area--openings">
      <h3>Was sich leise oeffnet</h3>
      {openings.length > 0 ? (
        <div className="symbol-personal-way__openings">
          {openings.map((opening) => (
            <Link key={opening.id} href={opening.href} className="symbol-personal-way__opening">
              <span>{opening.label}</span>
              <small>{opening.reason}</small>
            </Link>
          ))}
        </div>
      ) : (
        <p>Der naechste Raum muss sich nicht draengen. Dein Weg bleibt lesbar.</p>
      )}
    </article>
  );
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
    <section className="symbol-journey-card" aria-label="Weg vom Wasser zum Brot">
      <div className="symbol-journey-card__head">
        <p className="symbol-kicker">Verbundener Weg</p>
        <h2>{journey.title}</h2>
        <p className="symbol-journey-card__subtitle">Fuenf Zeichen in Resonanz</p>
        <p className="symbol-copy">
          Wasser, Licht, Feuer, Wueste und Brot bilden zusammen eine Bewegung: Ursprung, Offenbarung, Wandlung,
          Laeuterung und Gabe.
        </p>
      </div>

      {!hasAnyTrace ? (
        <div className="symbol-journey-empty">
          <p className="symbol-kicker">Der Weg ist noch still</p>
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
                  {hasTrace ? "Auf deinem Weg" : "Noch still"}
                </p>
                <p>{step.text}</p>
                {reflection ? (
                  <div className="symbol-journey-step__reflection">
                    <p className="symbol-journey-step__reflection-title">Dein Nachklang</p>
                    {reflectionContext ? (
                      <p className="symbol-journey-step__reflection-context">{reflectionContext}</p>
                    ) : null}
                    <p className="symbol-journey-step__reflection-preview">
                      {getReflectionPreview(reflection) || "Ein Nachklang ist bereits hier."}
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
    <section className="symbol-personal-map" aria-label="Persoenlicher Weg">
      <div className="symbol-personal-map__head">
        <p className="symbol-kicker">Wegzeichen</p>
        <h2>Fuenf innere Zeichen</h2>
      </div>

      <div className="symbol-personal-map__grid">
        {tracks.map((track) => (
          <article key={track.symbolId} className="symbol-personal-track">
            <div className="symbol-personal-track__top">
              <p className="symbol-personal-track__hebrew" aria-hidden="true">
                {track.config.hebrew}
              </p>
              <p className="symbol-personal-track__status">
                {track.count > 0 ? "Auf deinem Weg" : "Noch still"}
              </p>
            </div>

            <h3>{track.config.label}</h3>
            <p className="symbol-personal-track__count">
              {track.count > 0 ? getTraceCountLabel(track.count) : "Noch unberuehrt"}
            </p>
            <p className="symbol-personal-track__last">
              {track.lastPathLabel ? `Zuletzt nahe: ${track.lastPathLabel}` : "Dieses Zeichen wartet still."}
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
    <div className="symbol-path-filters" aria-label="Wegzeichen ansehen">
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
          Wegstelle loesen
        </button>
      </div>
    </article>
  );
}
