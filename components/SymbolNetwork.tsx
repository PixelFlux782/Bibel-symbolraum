"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useMemo, useState, useRef, useEffect } from "react";
import ReactFlow, {
  BaseEdge,
  Edge,
  EdgeProps,
  getBezierPath,
  Handle,
  Node,
  NodeProps,
  Position,
  ReactFlowInstance,
} from "reactflow";

import { RoomTransition, RoomTransitionButton } from "@/components/transitions/RoomTransition";
import { useRoomTransition } from "@/hooks/useRoomTransition";
import { getCodexEntry, resolveCodexEntry } from "@/lib/codex/getCodexEntry";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { getBridgeBySourceAndTarget } from "@/lib/meaning-bridges";
import type { MeaningBridge } from "@/lib/meaning-bridges";
import { recordActivatedLetter } from "@/lib/pathActivity";
import { meaningNodes as allMeaningNodes } from "@/lib/meaning/meaningNodes";
import {
  buildSymbolMeaningNetwork,
  type SymbolMeaningSatellite,
  type SymbolMeaningNetworkNode,
  type SymbolMeaningPath,
} from "@/lib/meaning/buildSymbolMeaningNetwork";
import type { MeaningNodeId } from "@/types/meaningGraph";

type SymbolNodeData = SymbolMeaningNetworkNode & {
  kind: "symbol";
  isActive: boolean;
  isPreviewed: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  showActions: boolean;
  activeLens: WaterOrbitNodeId | null;
  lensLabel?: string;
  lensNote?: string;
  emergenceIndex?: number;
};

type MeaningNodeData = SymbolMeaningSatellite & {
  kind: "meaning";
  isRelated: boolean;
  isDimmed: boolean;
};

type LetterNodeData = {
  kind: "letter";
  glyph: string;
  name: string;
  transcription: string;
  isExpanded: boolean;
};

type LivingConnectionData = {
  isTraveling: boolean;
};

type SymbolGraphViewMode = "OVERVIEW" | "SYMBOL_FOCUS" | "RELATION_FOCUS";
type SymbolMobileLayer = "Uebersicht" | "Symbol" | "Orbit" | "Detail" | "Beziehung";
type WaterOrbitNodeId = "hebrew" | "number" | "meaning" | "torah" | "journey";

type WaterOrbitNode = {
  id: WaterOrbitNodeId;
  label: string;
  eyebrow: string;
  preview: string;
  sourceId: string;
  className: string;
};

const network = buildSymbolMeaningNetwork();
const positions: Record<string, { x: number; y: number }> = {
  wasser: { x: 90, y: 280 },
  licht: { x: 700, y: 70 },
  feuer: { x: 700, y: 500 },
  wueste: { x: 260, y: 520 },
  brot: { x: 450, y: 290 },
  depth: { x: 0, y: 80 },
  transition: { x: 0, y: 560 },
  purification: { x: 410, y: 650 },
  light: { x: 900, y: 0 },
  revelation: { x: 930, y: 180 },
  guidance: { x: 900, y: 350 },
  fire: { x: 900, y: 650 },
  transformation: { x: 650, y: 700 },
  presence: { x: 420, y: 60 },
  calling: { x: 600, y: 0 },
  testing: { x: 180, y: 720 },
  dependence: { x: 70, y: 600 },
  nourishment: { x: 470, y: 170 },
  gift: { x: 330, y: 210 },
  community: { x: 660, y: 300 },
  breaking: { x: 580, y: 430 },
  life: { x: 470, y: 540 },
  word: { x: 300, y: 390 },
  lack: { x: 360, y: 430 },
};
const fallbackPosition = { x: 450, y: 290 };
const letterEmergencePositions = [
  { x: 210, y: 180 },
  { x: 690, y: 180 },
  { x: 450, y: 520 },
  { x: 180, y: 500 },
  { x: 720, y: 500 },
];
const letterFocusCenterPosition = { x: 450, y: 315 };
const letterResonancePositions = [
  { x: 312, y: 205 },
  { x: 588, y: 205 },
  { x: 450, y: 470 },
];
const missingPositionWarnings = new Set<string>();
const SYMBOL_NODE_SIZE = 176;
const MEANING_NODE_SIZE = 96;
const MAIN_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste", "brot"];
const LETTER_NODE_PREFIX = "letter:";
const LETTER_RESONANCE_LIMIT = 3;
const WATER_LENS_NOTES: Record<WaterOrbitNodeId, string> = {
  hebrew: "Hebraeische Namen direkt im Netz",
  number: "Gematria an den Symbolen",
  meaning: "Bedeutungsfelder als Layer",
  torah: "Genesis-Anker im Netz",
  journey: "Pfade bleiben sichtbar markiert",
};
const SYMBOL_LENS_LABELS: Record<WaterOrbitNodeId, Record<string, string>> = {
  hebrew: {
    wasser: "מים",
    licht: "אור",
    feuer: "אש",
    wueste: "מדבר",
    brot: "לחם",
  },
  number: {
    wasser: "90",
    licht: "207",
    feuer: "301",
    wueste: "246",
    brot: "78",
  },
  meaning: {
    wasser: "Tiefe",
    licht: "Offenbarung",
    feuer: "Wandlung",
    wueste: "Pruefung",
    brot: "Nahrung",
  },
  torah: {
    wasser: "Genesis 1:2",
    licht: "Genesis 1:3",
    feuer: "Exodus 13:21",
    wueste: "Exodus 16",
    brot: "Exodus 16:4",
  },
  journey: {
    wasser: "Start",
    licht: "Sicht",
    feuer: "Wandlung",
    wueste: "Mangel",
    brot: "Gabe",
  },
};
const WATER_LENS_MEANING_IDS: Partial<Record<WaterOrbitNodeId, MeaningNodeId[]>> = {
  meaning: ["depth", "purification", "revelation", "transformation"],
  torah: ["depth", "revelation"],
};
const WATER_LENS_JOURNEY_PATH_KEYS = new Set([
  getPathKey("wasser", "licht"),
  getPathKey("wasser", "feuer"),
  getPathKey("wueste", "wasser"),
  getPathKey("wasser", "brot"),
]);
const LETTER_RESONANCE_LABELS: Partial<Record<MeaningNodeId, string>> = {
  lack: "Leere",
};
const LETTER_RESONANCE_PRIORITY: Partial<Record<string, MeaningNodeId[]>> = {
  mem: ["depth", "lack", "nourishment"],
};

function getNodePosition(nodeId: string) {
  const position = positions[nodeId];

  if (!position && process.env.NODE_ENV !== "production" && !missingPositionWarnings.has(nodeId)) {
    missingPositionWarnings.add(nodeId);
    console.warn(`SymbolNetwork: Position fuer Node "${nodeId}" fehlt. Fallback wird verwendet.`);
  }

  return position ?? fallbackPosition;
}

function getNodeCenter(nodeId: string) {
  const isMeaningNode = network.meaningNodes.some((node) => node.id === nodeId);
  const size = isMeaningNode ? MEANING_NODE_SIZE : SYMBOL_NODE_SIZE;
  const position = getNodePosition(nodeId);

  return {
    x: position.x + size / 2,
    y: position.y + size / 2,
  };
}

function getOtherSymbolId(path: SymbolMeaningPath, symbolId: string) {
  return path.from === symbolId ? path.to : path.from;
}

function getSymbolLabel(symbolId: string) {
  return network.nodes.find((node) => node.id === symbolId)?.label ?? symbolId;
}

function getMeaningNodeLabel(meaningNodeId: string) {
  return network.meaningNodes.find((node) => node.id === meaningNodeId)?.label
    ?? allMeaningNodes.find((node) => node.id === meaningNodeId)?.label
    ?? meaningNodeId;
}

function getLetterResonanceLabel(meaningNodeId: MeaningNodeId) {
  return LETTER_RESONANCE_LABELS[meaningNodeId] ?? getMeaningNodeLabel(meaningNodeId);
}

function getPathKey(from: string, to: string) {
  return [from, to].sort().join(":");
}

function JourneySequence({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          {index > 0 ? <span className="text-gold/60"> &rarr; </span> : null}
          {item}
        </Fragment>
      ))}
    </>
  );
}

function SymbolGraphNode({ data }: NodeProps<SymbolNodeData>) {
  return (
    <div
      className={`group relative cursor-pointer transition-opacity duration-700 ${data.emergenceIndex !== undefined ? "letter-emergence-symbol" : ""} ${data.isDimmed ? "opacity-[0.14]" : "opacity-100"}`}
      style={data.emergenceIndex !== undefined ? { animationDelay: `${data.emergenceIndex * 220}ms` } : undefined}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <div
        className={`symbol-constellation-node relative grid h-44 w-44 place-items-center px-5 py-5 text-center transition-colors duration-700 ${
          data.isActive ? "is-active" : data.isPreviewed ? "is-previewed" : data.isRelated ? "is-related" : ""
        } ${data.activeLens ? `has-lens has-lens-${data.activeLens}` : ""}`}
      >
        <div>
          <p className="symbol-breathe font-serif text-5xl leading-none" lang="he" dir="rtl">
            {data.hebrew}
          </p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.34em]">{data.label}</p>
        </div>
        {data.activeLens && data.lensLabel ? (
          <div className="symbol-constellation-node__lens" aria-label={`${data.label}: ${data.lensLabel}`}>
            <span lang={data.activeLens === "hebrew" ? "he" : undefined} dir={data.activeLens === "hebrew" ? "rtl" : undefined}>
              {data.lensLabel}
            </span>
            {data.lensNote ? <i>{data.lensNote}</i> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
function MeaningGraphNode({ data }: NodeProps<MeaningNodeData>) {
  return (
    <div
      className={`group relative transition-opacity duration-700 ${data.isDimmed ? "opacity-20" : "opacity-100"}`}
      tabIndex={0}
      aria-label={`${data.label}: ${data.shortMeaning}`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className={`grid h-24 w-24 place-items-center rounded-full border px-3 text-center transition-colors ${
        data.isRelated ? "border-cyan/25 bg-cyan/[0.06] text-cyan-soft" : "border-white/[0.06] bg-black/15 text-[#d8d1c2]/45"
      }`}>
        <p className="font-serif text-sm italic leading-tight">{data.label}</p>
      </div>
    </div>
  );
}

function LetterGraphNode({ data }: NodeProps<LetterNodeData>) {
  return (
    <button
      type="button"
      className={`letter-focus-node ${data.isExpanded ? "is-expanded" : ""}`}
      aria-label={`${data.name} Resonanz entfalten`}
    >
      <span className="letter-focus-node__glyph" lang="he" dir="rtl">{data.glyph}</span>
      <span className="letter-focus-node__name">{data.name}</span>
      <span className="letter-focus-node__hint">{data.isExpanded ? "Resonanz" : "Oeffnen"}</span>
    </button>
  );
}

function LivingConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps<LivingConnectionData>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <BaseEdge id={id} path={edgePath} style={style} />;
}

const nodeTypes = { symbol: SymbolGraphNode, meaning: MeaningGraphNode, letter: LetterGraphNode };
const edgeTypes = { living: LivingConnectionEdge };
const WATER_ORBIT_NODES: WaterOrbitNode[] = [
  {
    id: "journey",
    label: "Journey",
    eyebrow: "Resonanzpfad",
    preview: "Wasser und Geist",
    sourceId: "journey-wasser-geist",
    className: "symbol-water-orbit__node--journey",
  },
  {
    id: "torah",
    label: "Thora",
    eyebrow: "Genesis",
    preview: "Genesis 1:2",
    sourceId: "genesis-1-2",
    className: "symbol-water-orbit__node--torah",
  },
  {
    id: "hebrew",
    label: "Hebraeisch",
    eyebrow: "Majim",
    preview: "majim / מים",
    sourceId: "majim",
    className: "symbol-water-orbit__node--hebrew",
  },
  {
    id: "meaning",
    label: "Bedeutung",
    eyebrow: "Meaning Graph",
    preview: "Tiefe",
    sourceId: "tiefe",
    className: "symbol-water-orbit__node--meaning",
  },
  {
    id: "number",
    label: "Zahl",
    eyebrow: "Gematria",
    preview: "90",
    sourceId: "zahl-90",
    className: "symbol-water-orbit__node--number",
  },
];

function WaterResonanceOrbit({
  activeOrbitId,
  onActivate,
}: {
  activeOrbitId: WaterOrbitNodeId | null;
  onActivate: (nodeId: WaterOrbitNodeId) => void;
}) {
  return (
    <div className="symbol-water-orbit" aria-label="Wasser Resonanz-Orbit">
      <div className="symbol-water-orbit__ring" aria-hidden="true" />
      <div className="symbol-water-orbit__ring symbol-water-orbit__ring--outer" aria-hidden="true" />
      {WATER_ORBIT_NODES.map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onActivate(node.id)}
          aria-pressed={activeOrbitId === node.id}
          className={`symbol-water-orbit__node ${node.className} ${activeOrbitId === node.id ? "is-active" : ""}`}
        >
          <span className="symbol-water-orbit__dot" aria-hidden="true" />
          <span className="symbol-water-orbit__label">{node.label}</span>
          <span className="symbol-water-orbit__preview">
            <i>{node.eyebrow}</i>
            <strong>{node.preview}</strong>
          </span>
        </button>
      ))}
    </div>
  );
}

function WaterFocusDetail({
  activeSymbol,
  connectedPaths,
  activeLens,
  onPreviewPath,
}: {
  activeSymbol: SymbolMeaningNetworkNode;
  connectedPaths: SymbolMeaningPath[];
  activeLens: WaterOrbitNodeId | null;
  onPreviewPath: (path: SymbolMeaningPath) => void;
}) {
  const visiblePaths = connectedPaths.slice(0, 2);

  return (
    <>
      <p className="symbol-breathe mt-5 font-serif text-5xl leading-none text-gold/90" lang="he" dir="rtl">{activeSymbol.hebrew}</p>
      <h2 className="mt-4 font-serif text-2xl italic text-foreground-strong">{activeSymbol.label}</h2>
      <p className="symbol-copy mt-4 text-sm">{activeSymbol.shortMeaning}</p>
      <div className="symbol-focus-hints mt-6">
        <p className="symbol-kicker text-cyan-soft">{activeLens ? "Aktive Linse" : "Orbit waehlen"}</p>
        <p>{activeLens ? WATER_LENS_NOTES[activeLens] : "Hebraeisch, Zahl, Bedeutung, Thora oder Journey veraendern nur die Betrachtungsebene."}</p>
      </div>
      {visiblePaths.length > 0 ? (
        <div className="mt-6 grid gap-2">
          {visiblePaths.map((path) => (
            <button key={path.id} type="button" onClick={() => onPreviewPath(path)} className="symbol-focus-path">
              <span>{path.label}</span>
              <i>{path.summary}</i>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default function SymbolNetwork() {
  const [activeId, setActiveId] = useState("wasser");
  const [hasSymbolFocus, setHasSymbolFocus] = useState(false);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [pendingPathId, setPendingPathId] = useState<string | null>(null);
  const [travelingPathId, setTravelingPathId] = useState<string | null>(null);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isLetterResonanceOpen, setIsLetterResonanceOpen] = useState(false);
  const [activeLetterResonanceId, setActiveLetterResonanceId] = useState<MeaningNodeId | null>(null);
  const [activeLetterSourcePathId, setActiveLetterSourcePathId] = useState<string | null>(null);
  const [activeWaterOrbitId, setActiveWaterOrbitId] = useState<WaterOrbitNodeId | null>(null);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { isEntering } = useRoomTransition();
  const activeSymbol = network.nodes.find((node) => node.id === activeId) ?? network.nodes[0];
  const activeCodexEntry = getCodexEntry(activeSymbol.id);
  const activePath = network.paths.find((path) => path.id === activePathId);
  const activeLetterSourcePath = network.paths.find((path) => path.id === activeLetterSourcePathId);
  const activeDisclosureSymbolId = hasSymbolFocus ? activeId : null;
  const disclosureSymbolId = activeDisclosureSymbolId;
  const focusedSymbolId = activeDisclosureSymbolId;
  const hasGraphDisclosure = Boolean(disclosureSymbolId || activePathId || activeJourneyId || activeLetterId);
  const hasEdgeDisclosure = Boolean(activeDisclosureSymbolId || activePathId || activeJourneyId || activeLetterId);
  const activeJourney = network.journeys.find((journey) => journey.id === activeJourneyId);
  const connectedPaths = network.paths.filter((path) => path.from === activeId || path.to === activeId);
  const activeCodexLetter = activeLetterId ? hebrewLetters.find((letter) => letter.id === activeLetterId) : undefined;
  const activeLetterNodeId = activeLetterId ? `${LETTER_NODE_PREFIX}${activeLetterId}` : null;
  const relationSymbolIds = useMemo(
    () => new Set(activePath ? [activePath.from, activePath.to] : []),
    [activePath],
  );
  const graphViewMode: SymbolGraphViewMode = activePath
    ? "RELATION_FOCUS"
    : hasSymbolFocus || activeJourney || activeLetterId
        ? "SYMBOL_FOCUS"
        : "OVERVIEW";
  const isWaterOrbitVisible = disclosureSymbolId === "wasser"
    && !activeJourney
    && !activeCodexLetter
    && !activePathId;
  const activeWaterOrbitNode = isWaterOrbitVisible && activeWaterOrbitId
    ? WATER_ORBIT_NODES.find((node) => node.id === activeWaterOrbitId)
    : undefined;
  const activeWaterLensMeaningIds = useMemo(
    () => new Set(activeWaterOrbitId ? WATER_LENS_MEANING_IDS[activeWaterOrbitId] ?? [] : []),
    [activeWaterOrbitId],
  );
  const letterSymbolIds = useMemo(
    () => new Set(activeLetterId
      ? network.nodes
        .filter((node) => getSymbolHebrewProfile(node.id).letters.some((letter) => letter.id === activeLetterId))
        .map((node) => node.id)
      : []),
    [activeLetterId],
  );
  const letterSymbols = useMemo(
    () => network.nodes.filter((node) => letterSymbolIds.has(node.id)),
    [letterSymbolIds],
  );
  const letterResonances = useMemo(
    () => {
      if (!activeLetterId || !activeCodexLetter) return [];

      const candidateScores = new Map<MeaningNodeId, number>();
      const addScore = (meaningId: string, score: number) => {
        if (!allMeaningNodes.some((node) => node.id === meaningId)) return;
        const id = meaningId as MeaningNodeId;
        candidateScores.set(id, (candidateScores.get(id) ?? 0) + score);
      };

      letterSymbols.forEach((symbol) => {
        const symbolLinks = network.meaningLinks.filter((link) => link.symbolId === symbol.id);
        symbolLinks.forEach((link, index) => addScore(link.meaningId, index === 0 ? 28 : 10));
      });

      network.paths.forEach((path) => {
        if (!letterSymbolIds.has(path.from) || !letterSymbolIds.has(path.to)) return;
        const fromMeaning = allMeaningNodes.find((node) => node.label === path.fromMeaning)?.id;
        const toMeaning = allMeaningNodes.find((node) => node.label === path.toMeaning)?.id;
        if (fromMeaning) addScore(fromMeaning, path.id === activeLetterSourcePathId ? 24 : 18);
        if (toMeaning) addScore(toMeaning, path.id === activeLetterSourcePathId ? 24 : 18);
      });

      activeCodexLetter.archetypalMeanings.forEach((meaningLabel) => {
        const directMatch = allMeaningNodes.find((node) => node.label.toLocaleLowerCase("de") === meaningLabel.toLocaleLowerCase("de"));
        if (directMatch) addScore(directMatch.id, 16);
      });

      LETTER_RESONANCE_PRIORITY[activeLetterId]?.forEach((meaningId, index) => {
        addScore(meaningId, 120 - index);
      });

      return Array.from(candidateScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, LETTER_RESONANCE_LIMIT)
        .flatMap(([meaningId]) => {
          const meaning = allMeaningNodes.find((node) => node.id === meaningId);
          return meaning
            ? [{ id: meaning.id, label: getLetterResonanceLabel(meaning.id), shortMeaning: meaning.description }]
            : [];
        });
    },
    [activeCodexLetter, activeLetterId, activeLetterSourcePathId, letterSymbolIds, letterSymbols],
  );
  const letterMeaningIds = useMemo(() => new Set(letterResonances.map((node) => node.id)), [letterResonances]);
  const activeLetterResonance = letterResonances.find((node) => node.id === activeLetterResonanceId);
  const journeySymbolIds = useMemo(() => new Set(activeJourney?.symbolPath ?? []), [activeJourney]);
  const journeyMeaningIds = useMemo(() => new Set(activeJourney?.meaningNodePath ?? []), [activeJourney]);
  const journeyPathKeys = useMemo(
    () => new Set(activeJourney?.symbolPath.slice(1).map((symbolId, index) => getPathKey(activeJourney.symbolPath[index], symbolId)) ?? []),
    [activeJourney]
  );

  const activeBridge = activePath
    ? getBridgeBySourceAndTarget(activePath.from as string, activePath.to as string) ?? getBridgeBySourceAndTarget(activePath.to as string, activePath.from as string)
    : undefined;

  const activeBridgeOrEphemeral: MeaningBridge | undefined = activeBridge;
  const mobileLayerStep: SymbolMobileLayer = activePath
    ? "Beziehung"
    : activeWaterOrbitId
      ? "Orbit"
      : isWaterOrbitVisible
        ? "Orbit"
        : hasSymbolFocus || activeLetterId
        ? "Symbol"
        : "Uebersicht";

  useEffect(() => {
    const instance = reactFlowRef.current;

    if (!instance) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) return;

    const frameId = window.requestAnimationFrame(() => {
      if (graphViewMode === "RELATION_FOCUS" && activePath) {
        instance.fitView({
          nodes: [{ id: activePath.from }, { id: activePath.to }],
          padding: 0.36,
          minZoom: 0.5,
          maxZoom: 0.92,
          duration: 720,
        });
        return;
      }

      if (activeLetterId && activeLetterNodeId) {
        instance.fitView({
          nodes: [...Array.from(letterSymbolIds).map((id) => ({ id })), { id: activeLetterNodeId }],
          padding: 0.28,
          minZoom: 0.5,
          maxZoom: 0.86,
          duration: 680,
        });
        return;
      }

      if (graphViewMode === "SYMBOL_FOCUS") {
        const center = getNodeCenter(activeId);
        instance.setCenter(center.x, center.y, { zoom: activeId === "wasser" ? 1.04 : 0.86, duration: 680 });
        return;
      }

      instance.fitView({
        nodes: MAIN_SYMBOL_IDS.map((id) => ({ id })),
        padding: 0.24,
        minZoom: 0.46,
        maxZoom: 0.78,
        duration: 620,
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeId, activeLetterId, activeLetterNodeId, activePath, graphViewMode, letterSymbolIds]);

  const relatedIds = useMemo(
    () => activeJourney
      ? new Set([...journeySymbolIds, ...journeyMeaningIds])
      : !focusedSymbolId
        ? new Set<string>()
      : new Set([
        ...relationSymbolIds,
        ...network.paths
          .filter((path) => path.from === focusedSymbolId || path.to === focusedSymbolId)
          .map((path) => getOtherSymbolId(path, focusedSymbolId)),
        ...network.meaningLinks.filter((link) => link.symbolId === focusedSymbolId).map((link) => link.meaningId),
      ]),
    [activeJourney, focusedSymbolId, journeyMeaningIds, journeySymbolIds, relationSymbolIds]
  );
  const nodes = useMemo<Node<SymbolNodeData | MeaningNodeData | LetterNodeData>[]>(
    () => {
      if (activeLetterId && activeCodexLetter && activeLetterNodeId) {
        return [
          ...letterSymbols.map((node) => {
            const emergenceIndex = letterSymbols.findIndex((symbol) => symbol.id === node.id);

            return {
              id: node.id,
              type: "symbol",
              position: letterEmergencePositions[emergenceIndex % letterEmergencePositions.length],
              data: {
                ...node,
                kind: "symbol" as const,
                isActive: true,
                isPreviewed: false,
                isRelated: true,
                isDimmed: false,
                showActions: false,
                activeLens: null,
                emergenceIndex,
              },
            };
          }),
          {
            id: activeLetterNodeId,
            type: "letter",
            position: letterFocusCenterPosition,
            data: {
              kind: "letter" as const,
              glyph: activeCodexLetter.glyph,
              name: activeCodexLetter.name,
              transcription: activeCodexLetter.transcription,
              isExpanded: isLetterResonanceOpen,
            },
          },
          ...(isLetterResonanceOpen ? letterResonances.map((node, index) => ({
            id: node.id,
            type: "meaning",
            position: letterResonancePositions[index % letterResonancePositions.length],
            selectable: true,
            data: {
              ...node,
              kind: "meaning" as const,
              isRelated: true,
              isDimmed: false,
            },
          })) : []),
        ];
      }

      const showMeaningNodes = Boolean(hasSymbolFocus || activePathId || activeJourney || activeWaterLensMeaningIds.size > 0);

      return [
        ...network.nodes.map((node) => {
          const isActiveSymbol = activeLetterId
            ? letterSymbolIds.has(node.id)
            : activeJourney
              ? journeySymbolIds.has(node.id)
              : activePath
                ? relationSymbolIds.has(node.id)
                : activeWaterOrbitId === "journey"
                  ? MAIN_SYMBOL_IDS.includes(node.id)
                : hasSymbolFocus && node.id === activeId;
          const isPreviewedSymbol = false;
          const lensLabel = activeWaterOrbitId ? SYMBOL_LENS_LABELS[activeWaterOrbitId]?.[node.id] : undefined;

          return {
            id: node.id,
            type: "symbol",
            position: activeLetterId && letterSymbolIds.has(node.id)
              ? letterEmergencePositions[letterSymbols.findIndex((symbol) => symbol.id === node.id) % letterEmergencePositions.length]
              : getNodePosition(node.id),
            data: {
              ...node,
              kind: "symbol" as const,
              isActive: isActiveSymbol,
              isPreviewed: isPreviewedSymbol,
              isRelated: activeLetterId ? letterSymbolIds.has(node.id) : relatedIds.has(node.id),
              isDimmed: activeLetterId
                ? !letterSymbolIds.has(node.id)
                : activeJourney
                  ? !journeySymbolIds.has(node.id)
                  : activePath
                    ? !relationSymbolIds.has(node.id)
                  : isWaterOrbitVisible
                    ? false
                    : hasGraphDisclosure && node.id !== disclosureSymbolId && !relatedIds.has(node.id),
              showActions: (isActiveSymbol || isPreviewedSymbol) && !isWaterOrbitVisible,
              activeLens: isWaterOrbitVisible ? activeWaterOrbitId : null,
              lensLabel,
              lensNote: undefined,
              emergenceIndex: activeLetterId && letterSymbolIds.has(node.id) ? letterSymbols.findIndex((symbol) => symbol.id === node.id) : undefined,
            },
          };
        }),
        ...(showMeaningNodes ? network.meaningNodes.map((node) => ({
          id: node.id,
          type: "meaning",
          position: getNodePosition(node.id),
          selectable: false,
          data: {
            ...node,
            kind: "meaning" as const,
            isRelated: activeLetterId ? letterMeaningIds.has(node.id) : activeWaterLensMeaningIds.has(node.id) || relatedIds.has(node.id),
            isDimmed: activeLetterId ? !letterMeaningIds.has(node.id) : isWaterOrbitVisible ? !activeWaterLensMeaningIds.has(node.id) && !relatedIds.has(node.id) : !relatedIds.has(node.id),
          },
        })) : []),
      ];
    },
    [activeCodexLetter, activeId, activeJourney, activeLetterId, activeLetterNodeId, activePath, activePathId, activeWaterLensMeaningIds, activeWaterOrbitId, disclosureSymbolId, hasGraphDisclosure, hasSymbolFocus, isLetterResonanceOpen, isWaterOrbitVisible, journeySymbolIds, letterMeaningIds, letterResonances, letterSymbolIds, letterSymbols, relatedIds, relationSymbolIds]
  );

  const edges: Edge[] = [
    ...(activeLetterId && activeLetterNodeId ? [
      ...letterSymbols.map((symbol) => ({
        id: `${symbol.id}-${activeLetterNodeId}`,
        source: symbol.id,
        target: activeLetterNodeId,
        type: "living",
        className: "is-selected-path",
        style: {
          stroke: "rgba(189,160,109,0.72)",
          strokeWidth: 2.4,
        },
        data: {
          isTraveling: false,
        },
      })),
      ...(isLetterResonanceOpen ? letterResonances.map((resonance) => ({
        id: `${activeLetterNodeId}-${resonance.id}`,
        source: activeLetterNodeId,
        target: resonance.id,
        className: "is-awake",
        style: {
          stroke: "rgba(127,184,201,0.36)",
          strokeWidth: 1.2,
        },
      })) : []),
    ] : []),
    ...(hasEdgeDisclosure && !activeLetterId ? network.paths.map((path) => {
        const isFocused = focusedSymbolId ? path.from === focusedSymbolId || path.to === focusedSymbolId : false;
        const isSelected = path.id === activePathId || path.id === pendingPathId;
        const pathKey = getPathKey(path.from, path.to);
        const isWaterLensPath = isWaterOrbitVisible && activeWaterOrbitId === "journey" && WATER_LENS_JOURNEY_PATH_KEYS.has(pathKey);
        const isJourneyPath = journeyPathKeys.has(pathKey) || isWaterLensPath;
        const isTraveling = path.id === travelingPathId;
        const isLetterPath = Boolean(activeLetterId)
          && letterSymbolIds.has(path.from)
          && letterSymbolIds.has(path.to);
        return {
          id: path.id,
          source: path.from,
          target: path.to,
          type: "living",
          className: `${isJourneyPath || isSelected || isLetterPath ? "is-selected-path" : isFocused && !activeJourney && !activeLetterId ? "is-awake" : "is-dormant"} ${isTraveling ? "is-traveling-path" : ""}`,
          style: {
            stroke: isJourneyPath || isSelected || isLetterPath ? "rgba(189,160,109,0.9)" : isFocused && !activeJourney && !activeLetterId ? "rgba(127,184,201,0.55)" : "rgba(127,184,201,0.12)",
            strokeWidth: isJourneyPath || isSelected || isLetterPath ? 3 : isFocused && !activeJourney && !activeLetterId ? 1.8 : 0.7,
          },
          data: {
            isTraveling,
          },
        };
    }) : []),
    ...((hasSymbolFocus || activeJourney || activeWaterLensMeaningIds.size > 0) && !activeLetterId ? network.meaningLinks.map((link) => {
      const isFocused = activeJourney
        ? journeySymbolIds.has(link.symbolId) && journeyMeaningIds.has(link.meaningId)
        : activeLetterId ? letterSymbolIds.has(link.symbolId) : activeWaterLensMeaningIds.has(link.meaningId) || link.symbolId === activeId;

      return {
        id: `${link.symbolId}-${link.meaningId}`,
        source: link.symbolId,
        target: link.meaningId,
        className: isFocused ? "is-awake" : "is-dormant",
        style: {
          stroke: isFocused ? "rgba(127,184,201,0.42)" : "rgba(127,184,201,0.07)",
          strokeWidth: isFocused ? 1.3 : 0.5,
        },
      };
    }) : []),
  ];

  function focusSymbol(symbolId: string) {
    setActiveId(symbolId);
    setHasSymbolFocus(true);
    setActivePathId(null);
    setActiveJourneyId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setActiveWaterOrbitId(null);
  }

  function activateWaterOrbit(nodeId: WaterOrbitNodeId) {
    setActiveWaterOrbitId(nodeId);
    setHasSymbolFocus(true);
    setActiveId("wasser");
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveJourneyId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
  }

  function openLetterBridge(path: SymbolMeaningPath) {
    if (!path.joint) return;

    recordActivatedLetter({
      letterId: path.joint.letterId,
      pathId: path.id,
    });
    setActiveLetterId(path.joint.letterId);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(path.id);
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveJourneyId(null);
    setActiveWaterOrbitId(null);
    setHasSymbolFocus(true);
  }

  function previewPath(path: SymbolMeaningPath) {
    setActiveWaterOrbitId(null);
    setPendingPathId(path.id);
    setActivePathId(path.id);
    setActiveJourneyId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setHasSymbolFocus(true);
  }

  return (
    <section className="symbol-page symbol-section symbol-network-page relative min-h-[100svh]">
      <div className="absolute inset-0">
        <Image src="/Visuals/symbolnetz_backround.png" alt="" fill priority sizes="100vw" className="sacred-drift object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,0.78)_78%,rgba(0,0,0,0.95)_100%)]" />
      </div>

      <div className="symbol-network-shell symbol-fade-in relative z-10 mx-auto grid w-full max-w-[92rem] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,21rem)]">
        <div className="symbol-network-main min-w-0">
          <div className="symbol-network-orientation">
            <p>Symbolnetz</p>
            <span>Waehle ein Symbol. Folge einer Spur.</span>
          </div>

          <div className={`${hasSymbolFocus ? "symbol-symbol-strip" : "hidden"} max-md:hidden`} aria-label="Symbol fokussieren">
            {network.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => focusSymbol(node.id)}
                aria-pressed={hasSymbolFocus && activeId === node.id}
                className={hasSymbolFocus && activeId === node.id ? "is-active" : ""}
              >
                {node.label}
              </button>
            ))}
          </div>
          {activeLetterId ? (
            <div className="letter-filter-trace mt-5">
              <span>Aktive Letter-Ansicht</span>
              <strong lang="he" dir="rtl">
                {hebrewLetters.find((letter) => letter.id === activeLetterId)?.glyph}
              </strong>
              <i>{letterSymbols.map((symbol) => symbol.label).join(" + ")}</i>
              <button
                type="button"
                onClick={() => {
                  setActiveLetterId(null);
                  setIsLetterResonanceOpen(false);
                  setActiveLetterResonanceId(null);
                  setActiveLetterSourcePathId(null);
                }}
              >
                Ansicht beenden
              </button>
            </div>
          ) : null}

          <div
            className={`symbol-constellation-field symbol-constellation-field--${graphViewMode.toLowerCase().replace("_", "-")} relative mt-3 overflow-hidden ${isWaterOrbitVisible ? "is-water-focused" : ""}`}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              onInit={(instance) => {
                reactFlowRef.current = instance;
              }}
              nodesDraggable={false}
              nodesConnectable={false}
              zoomOnScroll={false}
              panOnScroll={false}
              panOnDrag={false}
              preventScrolling={false}
              onNodeClick={(_, node) => {
                if (node.type === "letter") {
                  setIsLetterResonanceOpen(true);
                  setActiveLetterResonanceId(null);
                  return;
                }

                if (node.type === "meaning" && activeLetterId) {
                  setActiveLetterResonanceId(node.id as MeaningNodeId);
                  return;
                }

                if (node.type === "symbol") focusSymbol(node.id);
              }}
              className="symbol-network-flow bg-transparent"
            />
            {isWaterOrbitVisible ? (
              <WaterResonanceOrbit activeOrbitId={activeWaterOrbitId} onActivate={activateWaterOrbit} />
            ) : null}
          </div>

          <div className="symbol-mobile-layer-stepper mt-3 md:hidden" aria-label="Mobile Symbolnetz-Ebene">
            {(["Uebersicht", "Symbol", "Orbit", "Detail", "Beziehung"] as const).map((layer) => (
              <span key={layer} className={mobileLayerStep === layer ? "is-active" : ""}>
                {layer}
              </span>
            ))}
          </div>
        </div>

        <aside className={`symbol-detail-panel symbol-archive-fragment self-start p-6 ${isWaterOrbitVisible ? "symbol-detail-panel--water-focus" : ""}`}>
          <p className="symbol-kicker text-cyan-soft">
            {activeWaterOrbitNode ? `Wasser-Linse: ${activeWaterOrbitNode.label}` : activeJourney ? "Meaning Journey" : activePath ? "Bedeutungsweg" : activeCodexLetter ? "Letter-Ursprung" : "Fokus"}
          </p>
          {isWaterOrbitVisible ? (
            <WaterFocusDetail
              activeSymbol={activeSymbol}
              connectedPaths={connectedPaths}
              activeLens={activeWaterOrbitId}
              onPreviewPath={previewPath}
            />
          ) : activeJourney ? (
            <>
              <h2 className="mt-6 font-serif text-4xl italic text-foreground-strong">{activeJourney.title}</h2>
              <p className="symbol-copy mt-5 text-lg">{activeJourney.description}</p>
              <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-cyan-soft">
                <JourneySequence items={activeJourney.symbolLabels} />
              </p>
              <p className="mt-4 font-serif text-base italic leading-relaxed text-gold/75">
                <JourneySequence items={activeJourney.meaningNodeLabels} />
              </p>
            </>
          ) : activeCodexLetter ? (
            <>
              <p className="symbol-breathe mt-6 font-serif text-7xl leading-none text-gold/90" lang="he" dir="rtl">{activeCodexLetter.glyph}</p>
              <h2 className="mt-6 font-serif text-4xl italic text-foreground-strong">{activeCodexLetter.name.toUpperCase()}</h2>
              <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/50">{activeCodexLetter.transcription}</p>
              <div className="mt-7 border-t border-white/[0.055] pt-5">
                <p className="symbol-kicker text-cyan-soft">Verbunden mit</p>
                <p className="mt-4 font-serif text-xl italic leading-relaxed text-gold/80">
                  <JourneySequence items={letterSymbols.map((symbol) => symbol.label)} />
                </p>
              </div>
              <div className="mt-7 border-t border-white/[0.055] pt-5">
                <p className="symbol-kicker text-cyan-soft">Kernresonanz</p>
                <h3 className="mt-4 font-serif text-3xl italic text-foreground-strong">
                  {activeLetterResonance ? activeLetterResonance.label : letterResonances[0]?.label ?? "Noch verborgen"}
                </h3>
                <p className="symbol-copy mt-4 text-base">
                  {activeLetterResonance
                    ? `${activeCodexLetter.name} verbindet ${letterSymbols.map((symbol) => symbol.label).join(", ")} durch die Erfahrung der ${activeLetterResonance.label}.`
                    : `${activeCodexLetter.name} verbindet ${letterSymbols.map((symbol) => symbol.label).join(", ")}. Klicke den Buchstaben, um bis zu drei Resonanzen zu oeffnen.`}
                </p>
                {isLetterResonanceOpen && letterResonances.length > 0 ? (
                  <div className="letter-resonance-pills mt-5" aria-label="Letter-Resonanzen">
                    {letterResonances.map((resonance) => (
                      <button
                        key={resonance.id}
                        type="button"
                        onClick={() => setActiveLetterResonanceId(resonance.id)}
                        className={activeLetterResonanceId === resonance.id ? "is-active" : ""}
                      >
                        {resonance.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="letter-inspector-accordions mt-7">
                <details>
                  <summary>Bibelanker</summary>
                  <p>{activeLetterSourcePath?.evidence ?? activeCodexLetter.biblicalReferences[0]?.reference ?? "Noch kein direkter Anker gewaehlt."}</p>
                </details>
                <details>
                  <summary>Journeys</summary>
                  <p>{network.journeys.find((journey) => journey.symbolPath.some((symbolId) => letterSymbolIds.has(symbolId)))?.title ?? "Noch keine Journey fuer diese Letter-Spur."}</p>
                </details>
                <details>
                  <summary>Codex</summary>
                  <p>{activeCodexLetter.symbolism[0]?.description ?? activeCodexLetter.archetypalMeanings.slice(0, 3).join(", ")}</p>
                </details>
              </div>
            </>
          ) : (
            <>
              <p className="symbol-breathe mt-8 font-serif text-7xl leading-none text-gold/90" lang="he" dir="rtl">{activeSymbol.hebrew}</p>
              <h2 className="mt-7 font-serif text-4xl italic text-foreground-strong">{activeSymbol.label}</h2>
              <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/50">{activeSymbol.transliteration}</p>
              <p className="symbol-copy mt-6 text-lg">{activeSymbol.shortMeaning}</p>
              <div className="symbol-detail-panel__cta">
                <RoomTransitionButton href={activeSymbol.roomHref} className="symbol-cta w-full">
                  {activeSymbol.label}-Raum öffnen
                </RoomTransitionButton>
                {activeCodexEntry ? (
                  <Link
                    href={`/codex/${activeCodexEntry.id}`}
                    className="mt-3 inline-flex w-full justify-center border border-gold/20 px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-gold/75 transition-colors hover:border-gold/45 hover:text-gold focus-visible:border-gold/60 focus-visible:text-gold"
                  >
                    Codex öffnen
                  </Link>
                ) : null}
              </div>
            </>
          )}

          {!activeJourney && activePath ? (
            <>
              <div className="mt-8 border-t border-white/[0.055] pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-soft">
                  {getSymbolLabel(activePath.from)} <span className="text-gold/65">&rarr;</span> {getSymbolLabel(activePath.to)}
                </p>
                <h2 className="mt-6 font-serif text-4xl italic text-foreground-strong">{activePath.label}</h2>
                <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-gold/70">{activePath.evidence}</p>
                <p className="symbol-copy mt-5 text-lg">{activePath.fromMeaning}<br /><span className="text-gold/65">→</span> {activePath.toMeaning}</p>
                <p className="mt-5 font-serif text-lg italic leading-relaxed text-foreground-strong/85">{activePath.summary}</p>
                {activePath.joint ? (
                  <div className="mt-7 border-l border-gold/25 pl-4">
                    <button
                      type="button"
                      onClick={() => openLetterBridge(activePath)}
                      className="font-serif text-4xl text-gold/85"
                      lang="he"
                      aria-label={`${activePath.joint.letterName} als Ursprung im Hebrew Codex oeffnen`}
                    >
                      {activePath.joint.letter}
                    </button>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cyan-soft">
                      Gemeinsames {activePath.joint.letterName} von {getSymbolLabel(activePath.from)} und {getSymbolLabel(activePath.to)}
                    </p>
                    <p className="symbol-copy mt-2 text-sm">{activePath.joint.note}</p>
                    <p className="mt-2 font-serif text-sm italic leading-relaxed text-gold/75">
                      {activePath.joint.meanings.join(". ")}.
                    </p>
                  </div>
                ) : null}
                {activeBridgeOrEphemeral ? (
                  <div className="mt-6 border-t border-white/[0.035] pt-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-soft">Bridge</p>
                    <h3 className="mt-2 font-serif text-2xl italic text-foreground-strong">{activeBridgeOrEphemeral.title}</h3>
                    <p className="symbol-copy mt-2 text-sm leading-relaxed">{activeBridgeOrEphemeral.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeBridgeOrEphemeral.meaningFields.map((f) => (
                        <span key={f} className="inline-flex border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm leading-tight text-muted-soft">
                          {getMeaningNodeLabel(f)}
                        </span>
                      ))}
                      {activeBridgeOrEphemeral.scriptureAnchors?.map((anchor) => {
                        const linked = resolveCodexEntry(anchor);
                        const label = linked?.title ?? anchor;

                        return linked ? (
                          <Link key={anchor} href={`/codex/${linked.id}`} className="inline-flex border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm leading-tight text-muted-soft hover:border-gold/20 hover:text-foreground-strong">
                            {label}
                          </Link>
                        ) : (
                          <span key={anchor} className="inline-flex border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm leading-tight text-muted-soft">{label}</span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {!activeJourney && !activeCodexLetter ? <div className="mt-8 border-t border-white/[0.055] pt-6 max-md:hidden">
            <p className="symbol-kicker text-cyan-soft">Verbindungen folgen</p>
            <div className="mt-4 grid gap-3">
              {connectedPaths.map((path) => (
                <button key={path.id} type="button" onClick={() => previewPath(path)} className="border-l border-cyan/[0.18] bg-white/[0.018] px-4 py-3 text-left transition-colors hover:border-gold/30 hover:bg-white/[0.04]">
                  <span className="block font-serif text-lg italic text-foreground-strong/85">{path.label}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-cyan-soft/70">{path.evidence}</span>
                  <span className="symbol-copy mt-2 block text-sm">{path.summary}</span>
                </button>
              ))}
            </div>
          </div> : null}
        </aside>
      </div>
      <RoomTransition active={isEntering} />
    </section>
  );
}
