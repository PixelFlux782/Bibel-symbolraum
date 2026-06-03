"use client";

import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import ReactFlow, {
  BaseEdge,
  Edge,
  EdgeProps,
  getBezierPath,
  Handle,
  Node,
  NodeProps,
  Position,
} from "reactflow";

import { JourneyGate } from "@/components/JourneyGate";
import { LetterOverlay } from "@/components/rooms/engine/LetterOverlay";
import {
  MeaningTransitionScene,
  type MeaningTransitionSymbol,
} from "@/components/MeaningTransitionScene";
import { RoomTransition, RoomTransitionButton } from "@/components/transitions/RoomTransition";
import { useRoomTransition } from "@/hooks/useRoomTransition";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { getJourneyContext } from "@/lib/meaning/getJourneyContext";
import { recordActivatedLetter, recordJourneyStart } from "@/lib/pathActivity";
import {
  buildSymbolMeaningNetwork,
  type SymbolMeaningJourney,
  type SymbolMeaningSatellite,
  type SymbolMeaningNetworkNode,
  type SymbolMeaningPath,
} from "@/lib/meaning/buildSymbolMeaningNetwork";

type SymbolNodeData = SymbolMeaningNetworkNode & {
  kind: "symbol";
  isActive: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  emergenceIndex?: number;
};

type MeaningNodeData = SymbolMeaningSatellite & {
  kind: "meaning";
  isRelated: boolean;
  isDimmed: boolean;
};

type JourneyGateState = {
  title: string;
  bridgeText?: string;
  journeyText?: string;
  hebrew: string;
  onComplete: () => void;
};

type MeaningTransitionSceneState = {
  fromSymbol: MeaningTransitionSymbol;
  toSymbol: MeaningTransitionSymbol;
  bridgeText?: string;
  journeyText?: string;
  meaningNodes: string[];
  letterBridge?: {
    glyph: string;
    name: string;
    text: string;
    symbols?: MeaningTransitionSymbol[];
  };
  onComplete: () => void;
};

type LetterBridgeContext = {
  fromLabel: string;
  toLabel: string;
};

type LivingConnectionData = {
  context: string;
  bridgeText: string;
  joint?: SymbolMeaningPath["joint"];
  isBridgeVisible: boolean;
  isVisible: boolean;
  isTraveling: boolean;
  onOpenLetter: () => void;
  onFollow: () => void;
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
};
const fallbackPosition = { x: 450, y: 290 };
const letterEmergencePositions = [
  { x: 210, y: 180 },
  { x: 690, y: 180 },
  { x: 450, y: 520 },
  { x: 180, y: 500 },
  { x: 720, y: 500 },
];
const missingPositionWarnings = new Set<string>();

function getNodePosition(nodeId: string) {
  const position = positions[nodeId];

  if (!position && process.env.NODE_ENV !== "production" && !missingPositionWarnings.has(nodeId)) {
    missingPositionWarnings.add(nodeId);
    console.warn(`SymbolNetwork: Position fuer Node "${nodeId}" fehlt. Fallback wird verwendet.`);
  }

  return position ?? fallbackPosition;
}

function getOtherSymbolId(path: SymbolMeaningPath, symbolId: string) {
  return path.from === symbolId ? path.to : path.from;
}

function getSymbolLabel(symbolId: string) {
  return network.nodes.find((node) => node.id === symbolId)?.label ?? symbolId;
}

function getTransitionSymbol(symbolId: string): MeaningTransitionSymbol {
  const symbol = network.nodes.find((node) => node.id === symbolId);

  return {
    label: symbol?.label ?? symbolId,
    hebrew: symbol?.hebrew ?? "",
  };
}

function getMeaningNodeLabel(meaningNodeId: string) {
  return network.meaningNodes.find((node) => node.id === meaningNodeId)?.label ?? meaningNodeId;
}

function getPathKey(from: string, to: string) {
  return [from, to].sort().join(":");
}

function getLetterBridgeText(path: SymbolMeaningPath) {
  if (!path.joint) return undefined;

  const fromLabel = getSymbolLabel(path.from);
  const toLabel = getSymbolLabel(path.to);

  return path.joint.meanings.includes("Ursprung")
    ? `Ein gemeinsamer Ursprung verbindet ${fromLabel} und ${toLabel}.`
    : `Gemeinsames ${path.joint.letterName} verbindet ${fromLabel} und ${toLabel}.`;
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
      className={`group relative cursor-pointer transition-opacity duration-700 ${data.emergenceIndex !== undefined ? "letter-emergence-symbol" : ""} ${data.isDimmed ? "opacity-25" : "opacity-100"}`}
      style={data.emergenceIndex !== undefined ? { animationDelay: `${data.emergenceIndex * 220}ms` } : undefined}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <div
        className={`symbol-constellation-node relative grid h-44 w-44 place-items-center px-5 py-5 text-center transition-colors duration-700 ${
          data.isActive ? "is-active" : data.isRelated ? "is-related" : ""
        }`}
      >
        <div>
          <p className="symbol-breathe font-serif text-5xl leading-none" lang="he" dir="rtl">
            {data.hebrew}
          </p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.34em]">{data.label}</p>
        </div>
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
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 hidden w-48 -translate-x-1/2 border border-cyan/15 bg-[#02050c]/95 px-4 py-3 text-center group-hover:block group-focus:block">
        <p className="font-serif text-sm italic leading-relaxed text-[#d8d1c2]/80">{data.shortMeaning}</p>
      </div>
    </div>
  );
}

function LivingConnectionEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  style,
  data,
}: EdgeProps<LivingConnectionData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {data ? (
        <foreignObject x={labelX - 145} y={labelY - 92} width="290" height="184" className="living-connection-foreign-object">
          {data.joint ? (
            <span
              role="button"
              className={`letter-bridge nodrag nopan ${data.isBridgeVisible ? "is-visible" : ""}`}
              aria-label={`${data.joint.letterName}: verbindet ${data.context.replace(" \u2192 ", " und ")}`}
              tabIndex={data.isBridgeVisible ? 0 : -1}
              onClick={(event) => {
                event.stopPropagation();
                data.onOpenLetter();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  data.onOpenLetter();
                }
              }}
            >
              <span lang="he" dir="rtl">{data.joint.letter}</span>
            </span>
          ) : null}
          <div className={`living-connection-label nodrag nopan ${data.isVisible ? "is-visible" : ""} ${data.isTraveling ? "is-traveling" : ""}`}>
            <span>{data.context}</span>
            <p>{data.bridgeText}</p>
            {data.joint ? (
              <div className="living-connection-joint">
                <button type="button" onClick={data.onOpenLetter} aria-label={`${data.joint.letterName} im Hebrew Codex oeffnen`}>
                  <strong lang="he" dir="rtl">{data.joint.letter}</strong>
                </button>
                <i>Gemeinsames {data.joint.letterName} von {data.context.replace(" \u2192 ", " und ")}</i>
              </div>
            ) : null}
            <button type="button" tabIndex={data.isVisible ? 0 : -1} onClick={data.onFollow}>
              Verbindung folgen
            </button>
          </div>
        </foreignObject>
      ) : null}
    </>
  );
}

const nodeTypes = { symbol: SymbolGraphNode, meaning: MeaningGraphNode };
const edgeTypes = { living: LivingConnectionEdge };

export default function SymbolNetwork() {
  const [activeId, setActiveId] = useState("wasser");
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [previewJourneyId, setPreviewJourneyId] = useState<string | null>(null);
  const [pendingPathId, setPendingPathId] = useState<string | null>(null);
  const [travelingPathId, setTravelingPathId] = useState<string | null>(null);
  const [journeyGate, setJourneyGate] = useState<JourneyGateState | null>(null);
  const [meaningTransitionScene, setMeaningTransitionScene] = useState<MeaningTransitionSceneState | null>(null);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [letterOverlayContext, setLetterOverlayContext] = useState<LetterBridgeContext | null>(null);
  const { isEntering, startRoomTransition } = useRoomTransition();
  const activeSymbol = network.nodes.find((node) => node.id === activeId) ?? network.nodes[0];
  const activePath = network.paths.find((path) => path.id === activePathId);
  const activeJourney = network.journeys.find((journey) => journey.id === (previewJourneyId ?? activeJourneyId));
  const connectedPaths = network.paths.filter((path) => path.from === activeId || path.to === activeId);
  const activeCodexLetter = activeLetterId ? hebrewLetters.find((letter) => letter.id === activeLetterId) : undefined;
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
  const letterMeaningIds = useMemo(
    () => new Set(activeLetterId
      ? network.meaningLinks
        .filter((link) => letterSymbolIds.has(link.symbolId))
        .map((link) => link.meaningId)
      : []),
    [activeLetterId, letterSymbolIds],
  );
  const journeySymbolIds = useMemo(() => new Set(activeJourney?.symbolPath ?? []), [activeJourney]);
  const journeyMeaningIds = useMemo(() => new Set(activeJourney?.meaningNodePath ?? []), [activeJourney]);
  const journeyPathKeys = useMemo(
    () => new Set(activeJourney?.symbolPath.slice(1).map((symbolId, index) => getPathKey(activeJourney.symbolPath[index], symbolId)) ?? []),
    [activeJourney]
  );
  const relatedIds = useMemo(
    () => activeJourney
      ? new Set([...journeySymbolIds, ...journeyMeaningIds])
      : new Set([
        ...connectedPaths.map((path) => getOtherSymbolId(path, activeId)),
        ...network.meaningLinks.filter((link) => link.symbolId === activeId).map((link) => link.meaningId),
      ]),
    [activeId, activeJourney, connectedPaths, journeyMeaningIds, journeySymbolIds]
  );
  const nodes = useMemo<Node<SymbolNodeData | MeaningNodeData>[]>(
    () =>
      [
        ...network.nodes.map((node) => ({
          id: node.id,
          type: "symbol",
          position: activeLetterId && letterSymbolIds.has(node.id)
            ? letterEmergencePositions[letterSymbols.findIndex((symbol) => symbol.id === node.id) % letterEmergencePositions.length]
            : getNodePosition(node.id),
          data: {
            ...node,
            kind: "symbol" as const,
            isActive: activeLetterId ? letterSymbolIds.has(node.id) : activeJourney ? journeySymbolIds.has(node.id) : node.id === activeId,
            isRelated: activeLetterId ? letterSymbolIds.has(node.id) : relatedIds.has(node.id),
            isDimmed: activeLetterId ? !letterSymbolIds.has(node.id) : activeJourney ? !journeySymbolIds.has(node.id) : node.id !== activeId && !relatedIds.has(node.id),
            emergenceIndex: activeLetterId && letterSymbolIds.has(node.id) ? letterSymbols.findIndex((symbol) => symbol.id === node.id) : undefined,
          },
        })),
        ...network.meaningNodes.map((node) => ({
          id: node.id,
          type: "meaning",
          position: getNodePosition(node.id),
          selectable: false,
          data: {
            ...node,
            kind: "meaning" as const,
            isRelated: activeLetterId ? letterMeaningIds.has(node.id) : relatedIds.has(node.id),
            isDimmed: activeLetterId ? !letterMeaningIds.has(node.id) : !relatedIds.has(node.id),
          },
        })),
      ],
    [activeId, activeJourney, activeLetterId, journeySymbolIds, letterMeaningIds, letterSymbolIds, letterSymbols, relatedIds]
  );

  const edges: Edge[] = [
    ...network.paths.map((path) => {
        const isFocused = path.from === activeId || path.to === activeId;
        const isSelected = path.id === activePathId || path.id === pendingPathId;
        const isJourneyPath = journeyPathKeys.has(getPathKey(path.from, path.to));
        const isTraveling = path.id === travelingPathId;
        const isLetterPath = Boolean(activeLetterId)
          && letterSymbolIds.has(path.from)
          && letterSymbolIds.has(path.to);
        const isBridgeVisible = Boolean(path.joint) && (isSelected || isFocused || isLetterPath);

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
            context: `${getSymbolLabel(path.from)} \u2192 ${getSymbolLabel(path.to)}`,
            bridgeText: path.bridgeDescription,
            joint: path.joint,
            isBridgeVisible,
            isVisible: isSelected,
            isTraveling,
            onOpenLetter: () => openLetterBridge(path),
            onFollow: () => followPathWithTransition(path),
          },
        };
    }),
    ...network.meaningLinks.map((link) => {
      const isFocused = activeJourney
        ? journeySymbolIds.has(link.symbolId) && journeyMeaningIds.has(link.meaningId)
        : activeLetterId ? letterSymbolIds.has(link.symbolId) : link.symbolId === activeId;

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
    }),
  ];

  function focusSymbol(symbolId: string) {
    setActiveId(symbolId);
    setActivePathId(null);
    setActiveJourneyId(null);
    setPreviewJourneyId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveLetterId(null);
    setLetterOverlayContext(null);
  }

  function openLetterBridge(path: SymbolMeaningPath) {
    if (!path.joint) return;

    recordActivatedLetter({
      letterId: path.joint.letterId,
      pathId: path.id,
    });
    setActiveLetterId(path.joint.letterId);
    setLetterOverlayContext({
      fromLabel: getSymbolLabel(path.from),
      toLabel: getSymbolLabel(path.to),
    });
  }

  function previewPath(path: SymbolMeaningPath) {
    setPendingPathId(path.id);
    setActivePathId(path.id);
    setActiveJourneyId(null);
  }

  function followPath(path: SymbolMeaningPath) {
    setPendingPathId(null);
    setTravelingPathId(null);
    setActivePathId(path.id);
    setActiveJourneyId(null);
    setActiveId(path.from === activeId ? path.to : path.to === activeId ? path.from : path.to);
  }

  function openPathGate(path: SymbolMeaningPath) {
    const targetId = getOtherSymbolId(path, activeId);
    const target = network.nodes.find((node) => node.id === targetId);

    if (!target) {
      followPath(path);
      return;
    }

    setPendingPathId(path.id);
    setTravelingPathId(path.id);
    setActivePathId(path.id);
    setActiveJourneyId(null);
    setMeaningTransitionScene({
      fromSymbol: getTransitionSymbol(activeId),
      toSymbol: getTransitionSymbol(targetId),
      bridgeText: path.bridgeDescription,
      journeyText: path.summary,
      meaningNodes: path.from === activeId
        ? [path.fromMeaning, path.toMeaning]
        : [path.toMeaning, path.fromMeaning],
      letterBridge: path.joint ? {
        glyph: path.joint.letter,
        name: path.joint.letterName,
        text: getLetterBridgeText(path) ?? "",
        symbols: [getTransitionSymbol(path.from), getTransitionSymbol(path.to)],
      } : undefined,
      onComplete: () => followPath(path),
    });
  }

  function followPathWithTransition(path: SymbolMeaningPath) {
    if (!travelingPathId) {
      openPathGate(path);
    }
  }

  function openJourneyGate(journey: SymbolMeaningJourney) {
    recordJourneyStart(journey.id);
    const firstSymbol = network.nodes.find((node) => node.id === journey.symbolPath[0]);

    if (!firstSymbol) {
      startRoomTransition({ href: journey.firstRoomHref });
      return;
    }

    const journeyContext = getJourneyContext({
      journeyId: journey.id,
      fromSymbolSlug: activeId,
      toSymbolSlug: firstSymbol.id,
    });

    setJourneyGate({
      title: journey.title,
      journeyText: journey.description,
      hebrew: firstSymbol.hebrew,
      onComplete: () => setMeaningTransitionScene({
        fromSymbol: getTransitionSymbol(activeId),
        toSymbol: getTransitionSymbol(firstSymbol.id),
        bridgeText: journeyContext?.bridgeText,
        journeyText: journey.description,
        meaningNodes: (journeyContext?.meaningNodeIds ?? journey.meaningNodePath).map(getMeaningNodeLabel),
        onComplete: () => startRoomTransition({ href: journey.firstRoomHref }),
      }),
    });
  }

  function completeJourneyGate() {
    const onComplete = journeyGate?.onComplete;

    setJourneyGate(null);
    onComplete?.();
  }

  function completeMeaningTransitionScene() {
    const onComplete = meaningTransitionScene?.onComplete;

    setMeaningTransitionScene(null);
    onComplete?.();
  }

  function focusJourney(journey: SymbolMeaningJourney) {
    setActiveJourneyId(journey.id);
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveId(journey.symbolPath[0]);
  }

  function focusJourneyStation(symbolId: string) {
    setActiveId(symbolId);
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
  }

  return (
    <section className="symbol-page symbol-section relative min-h-screen pb-32 pt-40 md:pt-36">
      <div className="absolute inset-0">
        <Image src="/Visuals/symbolnetz_backround.png" alt="" fill priority sizes="100vw" className="sacred-drift object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,0.78)_78%,rgba(0,0,0,0.95)_100%)]" />
      </div>

      <div className="symbol-fade-in relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="min-w-0">
          <p className="symbol-kicker">Symbolnetz als Bedeutungsnetz</p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
            Warum haengen Wasser, Licht, Feuer und Wueste zusammen?
          </h1>
          <p className="symbol-copy mt-6 max-w-2xl text-base sm:text-xl">
            Waehle ein Symbol. Oeffne eine Letter Bridge, um zu sehen, welche Raeume aus demselben Buchstaben hervorgehen.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 max-md:hidden" aria-label="Symbol fokussieren">
            {network.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => focusSymbol(node.id)}
                aria-pressed={activeId === node.id}
                className={`border px-4 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors ${
                  activeId === node.id ? "border-gold/30 bg-gold/[0.08] text-gold" : "border-white/[0.06] text-[#d8d1c2]/55 hover:border-cyan/25"
                }`}
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
              <button type="button" onClick={() => setActiveLetterId(null)}>Ansicht beenden</button>
            </div>
          ) : null}

          <div className="symbol-constellation-field relative mt-12 h-[650px] overflow-hidden max-md:hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              nodesConnectable={false}
              zoomOnScroll={false}
              panOnScroll={false}
              panOnDrag={false}
              preventScrolling={false}
              onNodeClick={(_, node) => {
                if (node.type === "symbol") focusSymbol(node.id);
              }}
              onEdgeClick={(_, edge) => {
                const path = network.paths.find((item) => item.id === edge.id);
                if (path) previewPath(path);
              }}
              onEdgeMouseEnter={(_, edge) => {
                const path = network.paths.find((item) => item.id === edge.id);
                if (path) previewPath(path);
              }}
              className="symbol-network-flow bg-transparent"
            />
            {activeCodexLetter ? (
              <div className="letter-emergence-field-center" aria-hidden="true">
                <div className="letter-emergence-center">
                  <p lang="he" dir="rtl">{activeCodexLetter.glyph}</p>
                  <span>{activeCodexLetter.name}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-10 border-y border-white/[0.055] py-6 md:hidden">
            <p className="symbol-kicker text-cyan-soft">{activeCodexLetter ? "Buchstabe als Ursprung" : "Vier Symbole, ein Netz"}</p>
            {activeCodexLetter ? (
              <div className="letter-emergence-mobile mt-5">
                <div className="letter-emergence-mobile__center">
                  <span lang="he" dir="rtl">{activeCodexLetter.glyph}</span>
                  <strong>{activeCodexLetter.name}</strong>
                </div>
                <div className="letter-emergence-mobile__symbols">
                  {letterSymbols.map((symbol, index) => (
                    <button
                      key={symbol.id}
                      type="button"
                      onClick={() => focusSymbol(symbol.id)}
                      className="letter-emergence-mobile__symbol"
                      style={{ animationDelay: `${index * 180}ms` }}
                    >
                      <span lang="he" dir="rtl">{symbol.hebrew}</span>
                      <strong>{symbol.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {network.nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => focusSymbol(node.id)}
                    aria-pressed={activeId === node.id}
                    className={`border px-2 py-4 text-center transition-colors ${
                      activeId === node.id ? "border-gold/30 bg-gold/[0.08]" : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    <span className="block font-serif text-3xl text-gold/85" lang="he" dir="rtl">{node.hebrew}</span>
                    <span className="mt-2 block text-[9px] uppercase tracking-[0.2em] text-[#d8d1c2]/70">{node.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {network.paths.map((path) => (
              <div key={path.id} className={`border px-5 py-4 ${pendingPathId === path.id || (activeLetterId && path.joint?.letterId === activeLetterId) ? "border-gold/30 bg-gold/[0.07]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <button type="button" onClick={() => previewPath(path)} className="w-full text-left">
                <span className="symbol-kicker text-cyan-soft">{path.label}</span>
                <span className="mt-2 block font-serif text-xl italic text-foreground-strong">{getSymbolLabel(path.from)} → {getSymbolLabel(path.to)}</span>
                <span className="symbol-copy mt-2 block text-sm">{path.bridgeDescription}</span>
              </button>
              {pendingPathId === path.id ? (
                <>
                  {path.joint ? (
                    <div className="mt-4 border-l border-gold/25 pl-3">
                      <button type="button" onClick={() => openLetterBridge(path)} aria-label={`${path.joint.letterName} im Hebrew Codex oeffnen`}>
                        <span className="font-serif text-3xl text-gold/85" lang="he" dir="rtl">{path.joint.letter}</span>
                      </button>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-cyan-soft">
                        Gemeinsames {path.joint.letterName} von {getSymbolLabel(path.from)} und {getSymbolLabel(path.to)}
                      </p>
                      <p className="symbol-copy mt-2 text-xs">{path.joint.meanings.join(". ")}.</p>
                    </div>
                  ) : null}
                  <button type="button" onClick={() => followPathWithTransition(path)} className="symbol-cta mt-4 w-full px-3 py-3 text-[9px]">
                    Verbindung folgen
                  </button>
                </>
              ) : null}
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-white/[0.055] pt-8">
            <p className="symbol-kicker text-cyan-soft">Meaning Journeys</p>
            <p className="symbol-copy mt-3 max-w-2xl text-sm">Aus den entdeckten Verbindungen werden Wege durch das Netz.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {network.journeys.map((journey) => (
                <div
                  key={journey.id}
                  onMouseEnter={() => setPreviewJourneyId(journey.id)}
                  onMouseLeave={() => setPreviewJourneyId(null)}
                  onFocus={() => setPreviewJourneyId(journey.id)}
                  onBlur={() => setPreviewJourneyId(null)}
                  onTouchStart={() => setPreviewJourneyId(journey.id)}
                  className={`border px-4 py-4 transition-colors ${
                    activeJourney?.id === journey.id
                      ? "border-gold/30 bg-gold/[0.07]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => focusJourney(journey)}
                    aria-pressed={activeJourneyId === journey.id}
                    className="block w-full text-left"
                  >
                    <span className="block font-serif text-xl italic text-foreground-strong">{journey.title}</span>
                    <span className="mt-3 block text-[9px] uppercase tracking-[0.2em] text-gold/70">Warum diese Reise existiert</span>
                    <span className="symbol-copy mt-2 block text-sm">{journey.description}</span>
                    <span className="mt-3 block text-[10px] uppercase tracking-[0.16em] text-cyan-soft">
                      <JourneySequence items={journey.symbolLabels} />
                    </span>
                    <span className="mt-2 block font-serif text-sm italic leading-relaxed text-[#d8d1c2]/60">
                      <JourneySequence items={journey.meaningNodeLabels} />
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isEntering || Boolean(journeyGate)}
                    onClick={() => openJourneyGate(journey)}
                    className="symbol-cta mt-4 w-full px-3 py-3 text-[9px]"
                  >
                    Reise beginnen
                  </button>
                </div>
              ))}
            </div>
          </div>

          {activeJourney ? (
            <nav className="mt-5 border-y border-white/[0.055] py-4 md:hidden" aria-label={`Pfad: ${activeJourney.title}`}>
              <p className="symbol-kicker text-cyan-soft">Dein Pfad</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                {activeJourney.symbolPath.map((symbolId, index) => (
                  <Fragment key={`${activeJourney.id}-${symbolId}-${index}`}>
                    {index > 0 ? <span className="text-gold/55">&rarr;</span> : null}
                    <button
                      type="button"
                      onClick={() => focusJourneyStation(symbolId)}
                      aria-current={activeId === symbolId ? "step" : undefined}
                      className={`text-[10px] uppercase tracking-[0.16em] transition-colors ${
                        activeId === symbolId ? "text-gold underline decoration-gold/45 underline-offset-4" : "text-[#d8d1c2]/55"
                      }`}
                    >
                      {getSymbolLabel(symbolId)}
                    </button>
                  </Fragment>
                ))}
              </div>
            </nav>
          ) : null}
        </div>

        <aside className="symbol-detail-panel symbol-archive-fragment self-start p-7 lg:mt-40">
          <p className="symbol-kicker text-cyan-soft">{activeJourney ? "Meaning Journey" : activePath ? "Bedeutungsweg" : activeCodexLetter ? "Letter-Ursprung" : "Fokus"}</p>
          {activeJourney ? (
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
              </div>
            </>
          ) : !activeJourney && activeCodexLetter ? (
            <>
              <div className="mt-8 border-t border-white/[0.055] pt-6">
                <p className="symbol-breathe font-serif text-7xl leading-none text-gold/90" lang="he" dir="rtl">{activeCodexLetter.glyph}</p>
                <h2 className="mt-7 font-serif text-4xl italic text-foreground-strong">{activeCodexLetter.name}</h2>
                <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/50">{activeCodexLetter.transcription}</p>
                <div className="mt-7 border-t border-white/[0.055] pt-5">
                  <p className="symbol-kicker text-cyan-soft">Was entsteht aus diesem Buchstaben?</p>
                  <p className="mt-4 font-serif text-lg italic leading-relaxed text-gold/75">
                    <JourneySequence items={[
                      ...Array.from(letterMeaningIds).map(getMeaningNodeLabel),
                      ...letterSymbols.map((symbol) => symbol.label),
                    ]} />
                  </p>
                </div>
              </div>
            </>
          ) : null}

          {!activeJourney ? <div className="mt-8 border-t border-white/[0.055] pt-6 max-md:hidden">
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
      {journeyGate ? (
        <JourneyGate
          title={journeyGate.title}
          bridgeText={journeyGate.bridgeText}
          journeyText={journeyGate.journeyText}
          hebrew={journeyGate.hebrew}
          onComplete={completeJourneyGate}
        />
      ) : null}
      {meaningTransitionScene ? (
        <MeaningTransitionScene
          fromSymbol={meaningTransitionScene.fromSymbol}
          toSymbol={meaningTransitionScene.toSymbol}
          bridgeText={meaningTransitionScene.bridgeText}
          journeyText={meaningTransitionScene.journeyText}
          meaningNodes={meaningTransitionScene.meaningNodes}
          letterBridge={meaningTransitionScene.letterBridge}
          onComplete={completeMeaningTransitionScene}
        />
      ) : null}
      {letterOverlayContext && activeLetterId ? (
        <LetterOverlay
          initialLetterId={activeLetterId}
          bridgeContext={letterOverlayContext}
          onActiveLetterChange={setActiveLetterId}
          onClose={() => setLetterOverlayContext(null)}
        />
      ) : null}
      <RoomTransition active={isEntering} />
    </section>
  );
}
