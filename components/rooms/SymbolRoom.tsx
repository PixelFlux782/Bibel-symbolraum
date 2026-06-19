"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type FormEvent } from "react";
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  type StoredReflection,
} from "@/lib/reflections";
import {
  getConnectedNodes,
  getEdgesForNode,
  getMostImportantRelation,
  getNodeById,
  getStrongestConnections,
  type MeaningEdge,
  type SymbolNode,
} from "@/lib/symbolism";
import {
  RoomDecision,
  RoomEntrance,
  RoomExperience,
  RoomTransitionStage,
} from "@/components/rooms/RoomGrammar";
import { ResonanceGroup } from "@/components/rooms/engine/ResonanceGroup";
import { codexRegistry } from "@/lib/codex/codexRegistry";
import type { CodexEntry } from "@/lib/codex/types";
import { getAllResonanceConnections } from "@/lib/resonance";
import type {
  AtmosphereProfile,
  RoomEchoConfig,
  RoomEncounter,
  SymbolRoomDefinition,
} from "@/components/rooms/types";

const FALLBACK_SYMBOL = {
  id: "missing-symbol",
  label: "Symbol",
  hebrew: "",
  transliteration: "Symbol",
};

type RoomSymbol = SymbolNode | typeof FALLBACK_SYMBOL;

type ResolvedEncounter = {
  src: string;
  alt: string;
  title: string;
  text: string;
  node?: SymbolNode;
  strongestConnection?: MeaningEdge;
  connectedNodes: SymbolNode[];
  roomEncounter: RoomEncounter;
};

type ResonanceKind = "strong" | "secondary" | "mist";

type SemanticEcho = {
  query: string;
  matchedNodes: string[];
  primaryNode: string;
  interpretation: string;
  pathLabel: string;
};

function getRoomCodexEntry(definition: SymbolRoomDefinition): CodexEntry | undefined {
  return codexRegistry.find((entry) =>
    entry.type === "symbol" &&
    (entry.symbolRoomSlug === definition.slug ||
      entry.id === definition.slug ||
      entry.id === definition.centerNodeId),
  );
}

function getAtmosphereRendererHooks(profile: AtmosphereProfile) {
  return {
    className: [
      `symbol-room-atmosphere--${profile.id}`,
      `symbol-room-motion--${profile.motion}`,
      `symbol-room-particles--${profile.particles}`,
      `symbol-room-light--${profile.light}`,
      `symbol-room-materiality--${profile.materiality}`,
      `symbol-room-rhythm--${profile.rhythm}`,
    ].join(" "),
    dataAttributes: {
      "data-atmosphere": profile.id,
      "data-motion": profile.motion,
      "data-particles": profile.particles,
      "data-light": profile.light,
      "data-materiality": profile.materiality,
      "data-rhythm": profile.rhythm,
    },
  };
}

function MotionField({ motion, rhythm }: Pick<AtmosphereProfile, "motion" | "rhythm">) {
  return <div className={`symbol-room-motion-field symbol-room-motion-field--${motion} symbol-room-atmosphere-rhythm--${rhythm}`} />;
}

function ParticleField({ particles, rhythm }: Pick<AtmosphereProfile, "particles" | "rhythm">) {
  return <div className={`symbol-room-particle-field symbol-room-particle-field--${particles} symbol-room-atmosphere-rhythm--${rhythm}`} />;
}

function LightField({ light, rhythm }: Pick<AtmosphereProfile, "light" | "rhythm">) {
  return <div className={`symbol-room-light-field symbol-room-light-field--${light} symbol-room-atmosphere-rhythm--${rhythm}`} />;
}

function MaterialVeil({ materiality }: Pick<AtmosphereProfile, "materiality">) {
  return <div className={`symbol-room-material-veil symbol-room-material-veil--${materiality}`} />;
}

function SymbolRoomAtmosphere({ profile }: { profile: AtmosphereProfile }) {
  return (
    <div className="symbol-room-atmosphere" aria-hidden="true">
      <MotionField motion={profile.motion} rhythm={profile.rhythm} />
      <ParticleField particles={profile.particles} rhythm={profile.rhythm} />
      <LightField light={profile.light} rhythm={profile.rhythm} />
      <MaterialVeil materiality={profile.materiality} />
    </div>
  );
}

function getEncounters(definition: SymbolRoomDefinition): ResolvedEncounter[] {
  return definition.encounters.map((roomEncounter) => {
    const nodeId = roomEncounter.symbolNodeId;
    const node = getNodeById(definition.graph, nodeId);
    const strongestConnection =
      getMostImportantRelation(definition.graph, nodeId) ??
      getStrongestConnections(definition.graph, nodeId, 0)[0];
    const connectedNodes = node ? getConnectedNodes(definition.graph, node.id) : [];

    return {
      src: definition.theme.encounterImage.src,
      alt: definition.theme.encounterImage.alt,
      title: node?.label ?? roomEncounter.id,
      text: roomEncounter.impulse,
      node,
      strongestConnection,
      connectedNodes,
      roomEncounter,
    };
  });
}

export function SymbolRoom({ definition }: { definition: SymbolRoomDefinition }) {
  const entranceSymbol = getNodeById(definition.graph, definition.entrance.symbolNodeId) ?? FALLBACK_SYMBOL;
  const transitionSymbol = getNodeById(definition.graph, definition.transition.symbolNodeId) ?? entranceSymbol;
  const { theme } = definition;
  const atmosphereHooks = getAtmosphereRendererHooks(theme.atmosphereProfile);

  return (
    <div
      className={`symbol-page symbol-room symbol-room--${theme.id} ${atmosphereHooks.className}`}
      {...atmosphereHooks.dataAttributes}
      style={{
        "--symbol-room-background": theme.colors.background,
        "--symbol-room-accent-rgb": theme.colors.accentRgb,
        "--symbol-room-ambient-rgb": theme.colors.ambientRgb,
        "--symbol-room-shadow-rgb": theme.colors.shadowRgb,
        "--symbol-room-veil-rgb": theme.colors.veilRgb,
        "--symbol-room-depth-rgb": theme.colors.depthRgb,
        ...theme.overlayStyle,
      } as CSSProperties}
    >
      <SymbolRoomAtmosphere profile={theme.atmosphereProfile} />
      <SymbolRoomEntrance definition={definition} symbol={entranceSymbol} />
      <SymbolRoomExperience definition={definition} />
      <SymbolRoomTransition symbol={transitionSymbol} />
      {definition.reveal ? <SymbolRoomReveal definition={definition} /> : null}
      <SymbolRoomDecision definition={definition} symbol={entranceSymbol} />
    </div>
  );
}
function getOtherNodeId(edge: MeaningEdge, nodeId: string) {
  return edge.source === nodeId ? edge.target : edge.source;
}

function getResonanceKind(weight: number): ResonanceKind {
  if (weight > 0.8) {
    return "strong";
  }

  if (weight > 0.5) {
    return "secondary";
  }

  return "mist";
}

function getPrimaryQualities(definition: SymbolRoomDefinition, edges: MeaningEdge[]) {
  const preferredQualities = definition.theme.primaryMeaningQualities;
  const availableQualities = new Set(edges.map((edge) => edge.meaningQuality));
  const preferredLabels = preferredQualities
    .filter((quality) => availableQualities.has(quality))
    .map((quality) => definition.theme.meaningQualityLabels[quality]);
  const edgeLabels = edges
    .map((edge) => definition.theme.meaningQualityLabels[edge.meaningQuality])
    .filter((label, index, labels) => labels.indexOf(label) === index);

  return [...preferredLabels, ...edgeLabels]
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .slice(0, 3);
}

function getPoeticExplanation(explanation: string) {
  return explanation.split(/(?<=[.!?])\s+/)[0];
}

function normalizeEchoQuery(query: string) {
  return query
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueNodeIds(nodeIds: string[]) {
  return nodeIds.filter((nodeId, index, ids) => ids.indexOf(nodeId) === index);
}

function getSemanticEchoRule(echo: RoomEchoConfig, query: string) {
  const normalizedQuery = normalizeEchoQuery(query);

  return (
    echo.rules.find((rule) =>
      rule.keywords.some((keyword) => normalizedQuery.includes(normalizeEchoQuery(keyword)))
    ) ?? echo.fallback
  );
}

function createSemanticEcho(definition: SymbolRoomDefinition, echo: RoomEchoConfig, query: string): SemanticEcho {
  const rule = getSemanticEchoRule(echo, query);
  const matchedNodes = uniqueNodeIds(rule.nodes).filter((nodeId) => getNodeById(definition.graph, nodeId));
  const primaryNode =
    matchedNodes
      .map((nodeId) => getNodeById(definition.graph, nodeId))
      .filter((node): node is SymbolNode => Boolean(node))
      .sort((leftNode, rightNode) => rightNode.importance - leftNode.importance)[0]?.id ??
    definition.graph.centerId;
  const pathLabel = matchedNodes
    .map((nodeId) => getNodeById(definition.graph, nodeId)?.label ?? nodeId)
    .join(" \u00b7 ");

  return {
    query: query.trim(),
    matchedNodes,
    primaryNode,
    interpretation: rule.interpretation,
    pathLabel,
  };
}

function SymbolRoomEntrance({ definition, symbol }: { definition: SymbolRoomDefinition; symbol: RoomSymbol }) {
  const { entrance } = definition;
  const { heroImage, backgroundImage } = entrance;
  const codexEntry = getRoomCodexEntry(definition);

  return (
    <RoomEntrance className="symbol-room-depth relative flex min-h-screen items-end overflow-hidden pb-24 pt-40 md:pt-36">
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.78]"
      />
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        priority
        sizes="100vw"
        className="sacred-drift object-cover opacity-[0.18] mix-blend-screen"
      />

      <div className="light-pulse symbol-room-entrance-glow absolute inset-0 mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(var(--symbol-room-depth-rgb),0.5),rgba(var(--symbol-room-depth-rgb),0.24)_36%,rgba(var(--symbol-room-shadow-rgb),0.94))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--symbol-room-veil-rgb),0.9),rgba(var(--symbol-room-veil-rgb),0.2)_52%,rgba(var(--symbol-room-veil-rgb),0.8))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(var(--symbol-room-shadow-rgb),0.58)_78%,rgba(var(--symbol-room-shadow-rgb),0.9)_100%)]" />
      <div className="absolute inset-x-[8%] top-[48%] h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

      <div className="symbol-fade-in relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-16 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
        <div className="min-w-0">
          <p className="symbol-kicker">
            {entrance.kickerPrefix} / {symbol.label ?? FALLBACK_SYMBOL.label}
          </p>
          <h1 className="symbol-breathe mt-7 max-w-full overflow-hidden font-serif text-[clamp(5rem,24vw,19rem)] leading-[0.78] text-gold/90 drop-shadow-[0_0_30px_rgba(189,160,109,0.14)]">
            {symbol.hebrew ?? FALLBACK_SYMBOL.hebrew}
          </h1>
        </div>

        <div className="max-w-[20rem] min-w-0 pb-4 sm:max-w-2xl">
          <p className="symbol-kicker symbol-room-ambient-text">
            {symbol.transliteration ?? FALLBACK_SYMBOL.transliteration} {"\u00b7"} {symbol.label ?? FALLBACK_SYMBOL.label}
          </p>
          <p className="symbol-copy mt-7 text-lg sm:text-3xl">
            {entrance.statement}
          </p>
          <div className="mt-14 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a
              href={entrance.ctaHref}
              className="symbol-cta gap-4"
            >
              {entrance.ctaLabel}
              <span className="h-px w-10 bg-gold/[0.42]" />
            </a>
            {codexEntry ? (
              <Link
                href={`/codex/${codexEntry.id}`}
                className="inline-flex border border-gold/20 px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-gold/75 transition-colors hover:border-gold/45 hover:text-gold focus-visible:border-gold/60 focus-visible:text-gold"
              >
                Im Codex ansehen
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </RoomEntrance>
  );
}

function SymbolRoomTransition({ symbol }: { symbol: RoomSymbol }) {
  return (
    <RoomTransitionStage className="symbol-room-depth symbol-room-glyph-chamber relative grid min-h-screen place-items-center overflow-hidden py-32">
      <div className="symbol-room-depth-breath absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="absolute inset-x-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-gold/[0.16] to-transparent" />
      <div className="relative text-center">
        <p className="symbol-breathe font-serif text-[clamp(8rem,32vw,24rem)] leading-none text-gold/85">
          {symbol.hebrew ?? FALLBACK_SYMBOL.hebrew}
        </p>
        <p className="symbol-kicker symbol-room-ambient-text mt-10">
          {symbol.transliteration ?? FALLBACK_SYMBOL.transliteration}
        </p>
      </div>
    </RoomTransitionStage>
  );
}

function SymbolRoomReveal({ definition }: { definition: SymbolRoomDefinition }) {
  const reveal = definition.reveal;
  const revealNode = reveal ? getNodeById(definition.graph, reveal.symbolNodeId) : undefined;

  return (
    <section className="symbol-section symbol-room-depth relative py-24 md:py-32">
      <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.07),transparent_62%)]" />
      <div className="relative mx-auto max-w-4xl">
        <p className="symbol-kicker text-center">
          {reveal?.kicker}
        </p>
        <div className="mt-16 grid gap-20 md:gap-28">
          {revealNode ? [revealNode].map((item) => (
            <article
              key={item.id}
              className="scroll-reveal symbol-room-letter-station relative grid min-h-[76svh] place-items-center border-y border-gold/[0.055] py-20 text-center md:min-h-[82vh]"
            >
              <div className="symbol-room-depth-breath absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45" />
              <div className="relative">
                <p className="symbol-breathe font-serif text-[11rem] leading-none text-gold/88 sm:text-[16rem]">
                  {item.hebrew}
                </p>
                <h3 className="symbol-kicker symbol-room-ambient-text mt-10">
                  {item.label}
                </h3>
                <p className="symbol-copy mx-auto mt-10 max-w-xl text-xl italic sm:text-2xl">
                  {reveal?.statement}
                </p>
              </div>
            </article>
          )) : null}
        </div>
      </div>
    </section>
  );
}

function SymbolRoomExperience({ definition }: { definition: SymbolRoomDefinition }) {
  const { echo, theme } = definition;
  const [echoQuery, setEchoQuery] = useState("");
  const [semanticEcho, setSemanticEcho] = useState<SemanticEcho | null>(null);
  const encounters = getEncounters(definition);
  const firstActiveNodeId = encounters[0]?.node?.id ?? definition.centerNodeId;
  const [activeEncounterId, setActiveEncounterId] = useState(firstActiveNodeId);
  const activeEncounter = encounters.find((encounter) => encounter.node?.id === activeEncounterId) ?? encounters[0];
  const activeDepthIndex = Math.max(1, Math.round((activeEncounter?.roomEncounter.experienceState.density ?? 0.25) * 4));
  const activeNodeId = activeEncounter?.node?.id ?? firstActiveNodeId;
  const activeEdges = activeNodeId
    ? getEdgesForNode(definition.graph, activeNodeId).sort((a, b) => b.weight - a.weight)
    : [];
  const resonancePath = activeEdges.slice(0, 4);
  const resonanceNodeIds = new Set([
    ...activeEdges.map((edge) => getOtherNodeId(edge, activeNodeId)),
    ...(semanticEcho?.matchedNodes ?? []),
  ]);
  const primaryQualities = getPrimaryQualities(definition, activeEdges);
  const strongestConnection = activeEdges[0];
  const connectedQualityLabels = activeEdges
    .map((edge) => definition.theme.meaningQualityLabels[edge.meaningQuality])
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .slice(0, 5);
  const semanticEchoNodeIds = new Set(semanticEcho?.matchedNodes ?? []);
  const resonanceConnections = getAllResonanceConnections();

  const handleSemanticEchoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = echoQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    if (!echo) {
      return;
    }

    const nextEcho = createSemanticEcho(definition, echo, trimmedQuery);

    setSemanticEcho(nextEcho);
    setActiveEncounterId(nextEcho.primaryNode);
  };

  return (
    <RoomExperience id="symbolreise" className={`symbol-room-depth relative overflow-hidden py-24 md:py-32 ${semanticEcho ? "symbol-room-semantic-echo-active" : ""}`}>
      <div
        className="pointer-events-none absolute inset-0 transition duration-1000"
        style={{
          background:
            `radial-gradient(circle_at_${30 + activeDepthIndex * 5}%_${18 + activeDepthIndex * 6}%,rgba(var(--symbol-room-ambient-rgb),${0.06 + activeDepthIndex * 0.012}),transparent_28%),` +
            `radial-gradient(circle_at_${72 - activeDepthIndex * 4}%_${64 + activeDepthIndex * 4}%,rgba(var(--symbol-room-accent-rgb),${0.055 + activeDepthIndex * 0.012}),transparent_34%),` +
            `linear-gradient(180deg,rgba(var(--symbol-room-depth-rgb),${0.12 + activeDepthIndex * 0.08}),rgba(var(--symbol-room-shadow-rgb),${0.55 + activeDepthIndex * 0.06}))`,
        }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="symbol-kicker text-center md:text-left">
              {theme.journeyKicker}
            </p>
            <p className="symbol-copy mx-auto mt-5 max-w-2xl text-center text-base md:mx-0 md:text-left">
              {theme.journeyStatement}
            </p>
            {echo ? <form className="symbol-room-semantic-echo mt-8" onSubmit={handleSemanticEchoSubmit}>
              <input
                type="text"
                value={echoQuery}
                onChange={(event) => setEchoQuery(event.target.value)}
                placeholder={echo.inputPlaceholder}
                aria-label={echo.inputLabel}
                className="symbol-room-semantic-echo__input"
              />
              <button type="submit" className="symbol-room-semantic-echo__submit">
                {echo.submitLabel}
              </button>
            </form> : null}
          </div>
          {echo && activeEncounter?.node ? (
            <div className={`symbol-room-resonance-display md:max-w-md ${semanticEcho ? "symbol-room-resonance-display--echo" : ""}`}>
              <p className="symbol-room-oracle-kicker">
                {semanticEcho ? echo?.answerKicker : echo?.idleKicker}
              </p>
              <p className="mt-3 font-serif text-2xl italic leading-tight text-foreground-strong">
                {semanticEcho ? semanticEcho.pathLabel : echo?.idleStatement}
              </p>
              {semanticEcho ? (
                <p className="symbol-copy mt-3 text-sm text-gold/80">
                  {semanticEcho.interpretation}
                </p>
              ) : null}
              {semanticEcho && activeNodeId ? (
                <ResonanceGroup
                  nodeId={activeNodeId}
                  resonanceConnections={resonanceConnections}
                  graph={definition.graph}
                />
              ) : null}
              <p className={`symbol-room-oracle-murmur mt-3 ${semanticEcho ? "hidden" : ""}`}>
                {(primaryQualities.length ? primaryQualities : theme.fallbackQualities).join(" \u00b7 ")}
              </p>
            </div>
          ) : null}
        </div>
        {resonancePath.length ? (
          <div className="symbol-room-resonance-path mt-12" aria-label="Resonanzspur">
            {resonancePath.map((edge, index) => {
              const targetNode = getNodeById(definition.graph, getOtherNodeId(edge, activeNodeId));
              const kind = getResonanceKind(edge.weight);

              return (
                <div
                  key={`${edge.source}-${edge.target}-${index}`}
                  className={`symbol-room-resonance-thread symbol-room-resonance-thread--${kind}`}
                  style={{ "--resonance-strength": edge.weight, "--resonance-delay": `${index * 180}ms` } as CSSProperties}
                >
                  <span className="symbol-room-resonance-thread__mist" aria-hidden="true" />
                  <span className="symbol-room-resonance-thread__vein" aria-hidden="true" />
                  <span className="symbol-room-resonance-thread__motion-field" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-lg italic text-foreground-strong">
                      {targetNode?.label ?? getOtherNodeId(edge, activeNodeId)}
                    </span>
                    <span className="symbol-room-oracle-murmur mt-1 block">
                      {definition.theme.meaningQualityLabels[edge.meaningQuality]}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="mt-16 grid gap-32 md:gap-44">
          {encounters.map((encounter, index) => {
            const isRelevant = true;
            const isActive = activeEncounterId === encounter.node?.id;
            const encounterEdge = encounter.node?.id
              ? activeEdges.find(
                  (edge) =>
                    getOtherNodeId(edge, activeNodeId) === encounter.node?.id ||
                    edge.source === encounter.node?.id ||
                    edge.target === encounter.node?.id
                )
              : undefined;
            const encounterResonanceKind = encounterEdge ? getResonanceKind(encounterEdge.weight) : "mist";
            const isResonating = Boolean(encounter.node?.id && resonanceNodeIds.has(encounter.node.id));
            const isSemanticMatch = Boolean(encounter.node?.id && semanticEchoNodeIds.has(encounter.node.id));
            const visualDepth = activeDepthIndex + (isRelevant ? 0 : 2);

            return (
              <article
                key={`${encounter.node?.id ?? encounter.title}-${index}`}
                data-room-state={encounter.roomEncounter.state}
                data-experience-mood={encounter.roomEncounter.experienceState.mood}
                data-experience-motion={encounter.roomEncounter.experienceState.motion}
                data-experience-light={encounter.roomEncounter.experienceState.light}
                data-experience-transition={encounter.roomEncounter.experienceState.transition}
                className={`scroll-reveal symbol-room-journey-station symbol-room-encounter symbol-room-encounter--${encounterResonanceKind} group relative grid min-h-[82svh] items-end overflow-hidden py-10 transition duration-700 md:min-h-[92vh] md:py-16 ${
                  isActive ? "symbol-room-engine-encounter-active is-resonance-origin scale-[1.012]" : isResonating ? "is-resonating scale-[1.006]" : isRelevant ? "scale-100" : "scale-[0.985] opacity-60"
                } ${
                  isSemanticMatch ? "is-semantic-echo" : ""
                }`}
                onMouseEnter={() => setActiveEncounterId(encounter.node?.id ?? activeEncounterId)}
                onFocus={() => setActiveEncounterId(encounter.node?.id ?? activeEncounterId)}
                onClick={() => setActiveEncounterId(encounter.node?.id ?? activeEncounterId)}
                tabIndex={0}
                style={{
                  "--resonance-strength": encounterEdge?.weight ?? 0.18,
                  "--resonance-delay": `${index * 95}ms`,
                  "--symbol-room-depth-pressure": encounter.roomEncounter.experienceState.density,
                  transform: `translateY(${visualDepth * 0.35}rem) scale(${isActive ? 1.012 : isResonating ? 1.006 : isRelevant ? 1 : 0.985})`,
                } as CSSProperties}
              >
              <div className="symbol-room-resonance-veil" aria-hidden="true" />
              <div className="symbol-room-encounter-motion-field" aria-hidden="true" />
              <div className="symbol-room-resonance-veins" aria-hidden="true" />
              <div className="symbol-room-encounter-image absolute inset-0">
                <Image
                  src={encounter.src}
                  alt={encounter.alt}
                  fill
                  sizes="100vw"
                  className={`sacred-drift object-cover transition duration-1000 ${isRelevant ? "opacity-[0.78]" : "opacity-[0.46]"}`}
                />
                <div
                  className="absolute inset-0 transition duration-1000"
                  style={{
                    background:
                      `radial-gradient(circle_at_62%_34%,rgba(var(--symbol-room-ambient-rgb),${isRelevant ? 0.17 : 0.07}),transparent_30%),` +
                      `linear-gradient(180deg,rgba(var(--symbol-room-depth-rgb),${0.18 + activeDepthIndex * 0.07}),rgba(var(--symbol-room-depth-rgb),${0.7 + activeDepthIndex * 0.035})_70%,rgba(var(--symbol-room-shadow-rgb),0.97))`,
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--symbol-room-veil-rgb),0.82),rgba(var(--symbol-room-veil-rgb),0.22)_54%,rgba(var(--symbol-room-veil-rgb),0.72))]" />
                <div className={`symbol-room-encounter-glow absolute inset-0 transition duration-700 group-hover:opacity-100 group-focus:opacity-100 ${isRelevant ? "opacity-30" : "opacity-0"}`} />
              </div>
              <div
                className={`relative max-w-4xl pb-8 transition duration-700 ${
                  index % 2 === 1 ? "md:ml-auto" : ""
                }`}
              >
                <div className="symbol-room-fragment-shell">
                  <div className="symbol-room-fragment-trace" aria-hidden="true" />
                  <div className="symbol-room-fragment-orbit" aria-label="Umliegende Zeichen">
                    {encounter.connectedNodes.slice(0, isRelevant ? 6 : 3).map((connectedNode, connectedIndex) => (
                      <span
                        key={connectedNode.id}
                        className="symbol-room-fragment-sign"
                        style={{
                          "--sign-x": `${connectedIndex % 2 === 0 ? -0.35 : 0.35}rem`,
                          "--sign-delay": `${connectedIndex * 160}ms`,
                        } as CSSProperties}
                      >
                        <span lang={connectedNode.hebrew ? "he" : undefined} dir={connectedNode.hebrew ? "rtl" : undefined}>
                          {connectedNode.hebrew ?? connectedNode.label}
                        </span>
                        <span>{connectedNode.label}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {encounter.strongestConnection ? (
                      <span className="symbol-room-meaning-quality">
                        {definition.theme.meaningQualityLabels[encounter.strongestConnection.meaningQuality]}
                      </span>
                    ) : null}
                    {isSemanticMatch ? (
                      <span className="symbol-room-semantic-echo__mark">
                        eine Antwort
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,0.68fr)_minmax(12rem,0.32fr)] md:items-end">
                    <div>
                      <h2 className="symbol-room-light-inscription font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
                        {encounter.node?.label ?? encounter.title}
                      </h2>
                      <p className="symbol-room-reflection-text mt-8 text-xl italic sm:text-3xl">
                        {encounter.text}
                      </p>
                    </div>
                    <div className="symbol-room-glass-shard">
                      <p className="font-serif text-5xl leading-none text-gold/85 sm:text-6xl" lang="he" dir="rtl">
                        {encounter.node?.hebrew ?? " "}
                      </p>
                      <p className="symbol-room-depth-inscription mt-4">
                        {encounter.node?.transliteration ?? "Symbol"}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-9 grid gap-5 transition duration-700 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 md:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] ${
                    isRelevant ? "opacity-80" : "opacity-0"
                  }`}>
                    <div className="symbol-room-fragment-constellation">
                      {encounter.connectedNodes.slice(0, isRelevant ? 5 : 2).map((connectedNode) => (
                        <span key={connectedNode.id}>
                          {connectedNode.hebrew ?? connectedNode.label}
                        </span>
                      ))}
                    </div>
                    {encounter.strongestConnection ? (
                      <p className="symbol-room-whisper-line text-sm md:text-base">
                        {getPoeticExplanation(encounter.strongestConnection.explanation)}
                      </p>
                    ) : null}
                  </div>
                  {isActive && strongestConnection ? (
                    <div className="symbol-room-resonance-detail mt-8">
                      <div>
                        {semanticEcho ? (
                          <div className="symbol-room-semantic-echo__answer">
                            <p className="symbol-kicker symbol-room-ambient-text">{echo?.detailAnswerKicker}</p>
                            <p className="mt-3 font-serif text-2xl italic text-foreground-strong">
                              {semanticEcho.pathLabel}
                            </p>
                            <p className="symbol-copy mt-3 text-sm">
                              {semanticEcho.interpretation}
                            </p>
                          </div>
                        ) : null}
                        <p className="symbol-room-oracle-kicker">{echo?.inscriptionKicker}</p>
                        <p className="mt-3 font-serif text-2xl italic text-foreground-strong">
                          {getNodeById(definition.graph, getOtherNodeId(strongestConnection, activeNodeId))?.label ?? getOtherNodeId(strongestConnection, activeNodeId)}
                        </p>
                        <p className="symbol-room-oracle-text mt-3">
                          {getPoeticExplanation(strongestConnection.explanation)}
                        </p>
                      </div>
                      <div className="symbol-room-oracle-qualities">
                        <p className="symbol-room-quality-murmur">
                          {connectedQualityLabels.join(" \u00b7 ")}
                        </p>
                      </div>
                    </div>
                  ) : encounterEdge ? (
                    <p className="symbol-room-resonance-whisper mt-7">
                      {getPoeticExplanation(encounterEdge.explanation)}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </RoomExperience>
  );
}

function SymbolRoomDecision({ definition, symbol }: { definition: SymbolRoomDefinition; symbol: RoomSymbol }) {
  const [answer, setAnswer] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "empty">("idle");
  const { decision } = definition;

  const handleSave = () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setSaveStatus("empty");
      return;
    }

    const savedReflections = parseStoredReflections(
      window.localStorage.getItem(REFLECTION_STORAGE_KEY)
    );
    const reflection: StoredReflection = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      symbol: symbol.label ?? FALLBACK_SYMBOL.label,
      hebrew: symbol.hebrew ?? FALLBACK_SYMBOL.hebrew ?? "",
      question: decision.reflectionQuestion,
      answer: trimmedAnswer,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify([reflection, ...savedReflections])
    );

    setAnswer("");
    setSaveStatus("saved");
  };

  return (
    <RoomDecision className="symbol-room-depth relative min-h-screen pb-40 pt-32">
      <div className="symbol-room-decision-line absolute inset-x-[10%] top-1/2 h-px" />
      <div className="relative mx-auto max-w-4xl border-y border-gold/[0.08] py-20 text-center">
        <p className="symbol-kicker">
          {decision.kicker}
        </p>
        <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl italic leading-tight text-foreground-strong sm:text-6xl">
          {decision.reflectionQuestion}
        </h2>
        <textarea
          aria-label={decision.textareaLabel}
          placeholder={decision.placeholder}
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setSaveStatus("idle");
          }}
          className="symbol-reflection-field mt-14 min-h-52 w-full resize-y p-6 font-serif text-xl leading-relaxed"
        />
        <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="symbol-copy text-left text-sm sm:text-base">
            {decision.storageNotice}
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="symbol-cta shrink-0"
          >
            {decision.saveLabel}
          </button>
        </div>
        <p className="symbol-copy symbol-room-ambient-text mt-5 min-h-7 text-sm" aria-live="polite">
          {saveStatus === "saved"
            ? decision.savedMessage
            : saveStatus === "empty"
              ? decision.emptyMessage
              : ""}
        </p>
      </div>
    </RoomDecision>
  );
}


