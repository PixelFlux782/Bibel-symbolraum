"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Fragment, useMemo, useState, useRef, useEffect } from "react";
import ReactFlow, {
  BaseEdge,
  Edge,
  EdgeProps,
  Handle,
  Node,
  NodeProps,
  Position,
  ReactFlowInstance,
} from "reactflow";

import { RoomTransition, RoomTransitionButton } from "@/components/transitions/RoomTransition";
import { useRoomTransition } from "@/hooks/useRoomTransition";
import { getCodexEntry, resolveCodexEntry } from "@/lib/codex/getCodexEntry";
import { calculateGematria } from "@/lib/hebrew/gematria";
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
  activeLens: SymbolLensMode | null;
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
  relationType: "symbol" | "letter" | "meaning" | "journey";
  routeIndex: number;
  routeOffset: number;
};

type SymbolGraphViewMode = "OVERVIEW" | "SYMBOL_FOCUS" | "RELATION_FOCUS";
type SymbolMobileLayer = "Uebersicht" | "Symbol" | "Linse" | "Info" | "Beziehung";
type SymbolLensMode = "hebrew" | "number" | "meaning" | "torah" | "journey" | "room";

type SymbolLensOrbitNode = {
  id: SymbolLensMode;
  label: string;
  eyebrow: string;
  preview: string;
  className: string;
};

type SymbolLensData = {
  symbolId: string;
  nodes: SymbolLensOrbitNode[];
  labels: Partial<Record<SymbolLensMode, string>>;
  notes: Partial<Record<SymbolLensMode, string>>;
  meaningNodeIds: Partial<Record<SymbolLensMode, MeaningNodeId[]>>;
  journeyPathKeys: Set<string>;
  scriptureAnchors: string[];
  journeyTitles: string[];
  roomHref?: string;
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
const SYMBOL_LENS_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste"];
const SYMBOL_LENS_MODE_LABELS: Record<SymbolLensMode, string> = {
  hebrew: "Hebraeisch",
  number: "Zahl",
  meaning: "Bedeutung",
  torah: "Thora",
  journey: "Journey",
  room: "Raum",
};
const SYMBOL_LENS_MODE_NOTES: Record<SymbolLensMode, string> = {
  hebrew: "Hebrew Codex direkt im Netz",
  number: "Gematria am aktiven Symbol",
  meaning: "Bedeutungsfelder als bestehender Layer",
  torah: "Schriftanker ohne Detailwelt",
  journey: "Pfade bleiben sichtbar markiert",
  room: "Symbolraum-Link im Inspector",
};
const SYMBOL_LENS_CLASS_NAMES: Record<SymbolLensMode, string> = {
  journey: "symbol-lens-orbit__node--journey",
  torah: "symbol-lens-orbit__node--torah",
  hebrew: "symbol-lens-orbit__node--hebrew",
  meaning: "symbol-lens-orbit__node--meaning",
  number: "symbol-lens-orbit__node--number",
  room: "symbol-lens-orbit__node--room",
};
const LETTER_RESONANCE_LABELS: Partial<Record<MeaningNodeId, string>> = {
  lack: "Leere",
};
const LETTER_RESONANCE_PRIORITY: Partial<Record<string, MeaningNodeId[]>> = {
  mem: ["depth", "lack", "nourishment"],
};
const SYMBOL_PORTS = [
  "top",
  "right",
  "bottom",
  "left",
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
] as const;
type SymbolPort = (typeof SYMBOL_PORTS)[number];
const PORT_POSITIONS: Record<SymbolPort, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
  "top-right": Position.Top,
  "top-left": Position.Top,
  "bottom-right": Position.Bottom,
  "bottom-left": Position.Bottom,
};
const PORT_STYLES: Record<SymbolPort, CSSProperties> = {
  top: { left: "50%" },
  right: { top: "50%" },
  bottom: { left: "50%" },
  left: { top: "50%" },
  "top-right": { left: "70%" },
  "top-left": { left: "30%" },
  "bottom-right": { left: "70%" },
  "bottom-left": { left: "30%" },
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

function pickPortForVector(dx: number, dy: number): SymbolPort {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX > absY * 1.25) return dx >= 0 ? "right" : "left";
  if (absY > absX * 1.25) return dy >= 0 ? "bottom" : "top";

  if (dx >= 0 && dy >= 0) return "bottom-right";
  if (dx >= 0 && dy < 0) return "top-right";
  if (dx < 0 && dy >= 0) return "bottom-left";
  return "top-left";
}

function getConnectionPorts(sourceId: string, targetId: string) {
  const sourceCenter = getNodeCenter(sourceId);
  const targetCenter = getNodeCenter(targetId);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  return {
    sourceHandle: pickPortForVector(dx, dy),
    targetHandle: pickPortForVector(-dx, -dy),
  };
}

function getRouteOffset(index: number, relationType: LivingConnectionData["relationType"]) {
  const spread = relationType === "journey" ? 22 : relationType === "letter" ? 14 : 10;
  const side = index % 2 === 0 ? 1 : -1;
  const lane = Math.floor(index / 2) + 1;

  return side * lane * spread;
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

function getJourneyPathKeys(symbolId: string) {
  return new Set(
    network.journeys
      .filter((journey) => journey.symbolPath.includes(symbolId))
      .flatMap((journey) => journey.symbolPath.slice(1).map((nextSymbolId, index) => getPathKey(journey.symbolPath[index], nextSymbolId))),
  );
}

function getSymbolLensData(symbolId: string): SymbolLensData | null {
  if (!SYMBOL_LENS_SYMBOL_IDS.includes(symbolId)) return null;

  const symbol = network.nodes.find((node) => node.id === symbolId);
  if (!symbol) return null;

  const codexEntry = getCodexEntry(symbolId);
  const hebrewProfile = getSymbolHebrewProfile(symbolId);
  const hebrewWord = hebrewProfile.hebrewWord;
  const hebrew = hebrewWord?.hebrew ?? symbol.hebrew;
  const transliteration = hebrewWord?.transliteration ?? symbol.transliteration;
  const meaningNodeIds = network.meaningLinks
    .filter((link) => link.symbolId === symbolId)
    .map((link) => link.meaningId);
  const scriptureAnchors = [
    ...(codexEntry?.scriptureAnchors.map((anchor) => anchor.reference) ?? []),
    ...(hebrewWord?.biblicalReferences.map((reference) => reference.reference) ?? []),
  ];
  const uniqueScriptureAnchors = Array.from(new Set(scriptureAnchors));
  const journeys = network.journeys.filter((journey) => journey.symbolPath.includes(symbolId));
  const labels: SymbolLensData["labels"] = {};
  const notes: SymbolLensData["notes"] = {};
  const lensMeaningNodeIds: SymbolLensData["meaningNodeIds"] = {};
  const nodes: SymbolLensOrbitNode[] = [];

  const addNode = (mode: SymbolLensMode, eyebrow: string, preview: string) => {
    labels[mode] = preview;
    notes[mode] = SYMBOL_LENS_MODE_NOTES[mode];
    nodes.push({
      id: mode,
      label: SYMBOL_LENS_MODE_LABELS[mode],
      eyebrow,
      preview,
      className: SYMBOL_LENS_CLASS_NAMES[mode],
    });
  };

  if (hebrew) {
    addNode("hebrew", transliteration, `${transliteration} / ${hebrew}`);
    labels.hebrew = hebrew;
  }

  const gematria = hebrew ? calculateGematria(hebrew) : 0;
  if (gematria > 0) {
    addNode("number", "Gematria", String(gematria));
  }

  if (meaningNodeIds.length > 0) {
    const primaryMeaning = getMeaningNodeLabel(meaningNodeIds[0]);
    addNode("meaning", "Meaning Graph", primaryMeaning);
    lensMeaningNodeIds.meaning = meaningNodeIds;
  }

  if (uniqueScriptureAnchors.length > 0) {
    addNode("torah", "Schriftanker", uniqueScriptureAnchors[0]);
    lensMeaningNodeIds.torah = [
      ...meaningNodeIds,
      ...(codexEntry?.meaningFields ?? []),
    ];
  }

  if (journeys.length > 0) {
    addNode("journey", "Resonanzpfad", journeys[0].title);
    lensMeaningNodeIds.journey = Array.from(new Set(journeys.flatMap((journey) => journey.meaningNodePath)));
  }

  if (symbol.roomHref || codexEntry?.symbolRoomSlug) {
    addNode("room", "Symbolraum", symbol.roomHref ?? `/raeume/${codexEntry?.symbolRoomSlug}`);
    labels.room = "Raum";
  }

  return {
    symbolId,
    nodes,
    labels,
    notes,
    meaningNodeIds: lensMeaningNodeIds,
    journeyPathKeys: getJourneyPathKeys(symbolId),
    scriptureAnchors: uniqueScriptureAnchors,
    journeyTitles: journeys.map((journey) => journey.title),
    roomHref: symbol.roomHref,
  };
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
      {SYMBOL_PORTS.map((port) => (
        <Fragment key={port}>
          <Handle id={port} type="source" position={PORT_POSITIONS[port]} className="symbol-network-port" style={PORT_STYLES[port]} />
          <Handle id={port} type="target" position={PORT_POSITIONS[port]} className="symbol-network-port" style={PORT_STYLES[port]} />
        </Fragment>
      ))}
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
      <Handle id="left" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="top" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
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
      <Handle id="left" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="opacity-0" />
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
  data,
}: EdgeProps<LivingConnectionData>) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const midpointX = (sourceX + targetX) / 2;
  const midpointY = (sourceY + targetY) / 2;
  const routeOffset = data?.routeOffset ?? 0;
  const relationType = data?.relationType ?? "symbol";
  const outwardLift = relationType === "journey" ? 30 : relationType === "letter" ? 18 : 8;
  const curveX = midpointX + normalX * (routeOffset + outwardLift);
  const curveY = midpointY + normalY * (routeOffset + outwardLift);
  const edgePath = `M ${sourceX},${sourceY} Q ${curveX},${curveY} ${targetX},${targetY}`;

  if (relationType === "journey") {
    return (
      <>
        <BaseEdge
          id={`${id}-journey-halo`}
          path={edgePath}
          style={{
            stroke: "rgba(189,160,109,0.18)",
            strokeWidth: 9,
            filter: "blur(3px)",
          }}
        />
        <BaseEdge id={id} path={edgePath} style={style} />
      </>
    );
  }

  return <BaseEdge id={id} path={edgePath} style={style} />;
}

const nodeTypes = { symbol: SymbolGraphNode, meaning: MeaningGraphNode, letter: LetterGraphNode };
const edgeTypes = { living: LivingConnectionEdge };
function SymbolLensOrbit({
  lensData,
  activeLensMode,
  onActivate,
}: {
  lensData: SymbolLensData;
  activeLensMode: SymbolLensMode | null;
  onActivate: (nodeId: SymbolLensMode) => void;
}) {
  return (
    <div className="symbol-lens-orbit" aria-label={`${getSymbolLabel(lensData.symbolId)} Symbol-Linse`}>
      <div className="symbol-lens-orbit__ring" aria-hidden="true" />
      <div className="symbol-lens-orbit__ring symbol-lens-orbit__ring--outer" aria-hidden="true" />
      {lensData.nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onActivate(node.id)}
          aria-pressed={activeLensMode === node.id}
          className={`symbol-lens-orbit__node ${node.className} ${activeLensMode === node.id ? "is-active" : ""}`}
        >
          <span className="symbol-lens-orbit__dot" aria-hidden="true" />
          <span className="symbol-lens-orbit__label">{node.label}</span>
          <span className="symbol-lens-orbit__preview">
            <i>{node.eyebrow}</i>
            <strong>{node.preview}</strong>
          </span>
        </button>
      ))}
    </div>
  );
}

function SymbolLensFocusDetail({
  activeSymbol,
  connectedPaths,
  lensData,
  activeLensMode,
  onPreviewPath,
}: {
  activeSymbol: SymbolMeaningNetworkNode;
  connectedPaths: SymbolMeaningPath[];
  lensData: SymbolLensData;
  activeLensMode: SymbolLensMode | null;
  onPreviewPath: (path: SymbolMeaningPath) => void;
}) {
  const visiblePaths = connectedPaths.slice(0, 2);
  const lensNote = activeLensMode ? lensData.notes[activeLensMode] : undefined;
  const activeLabel = activeLensMode ? SYMBOL_LENS_MODE_LABELS[activeLensMode] : undefined;

  return (
    <>
      <p className="symbol-breathe mt-5 font-serif text-5xl leading-none text-gold/90" lang="he" dir="rtl">{activeSymbol.hebrew}</p>
      <h2 className="mt-4 font-serif text-2xl italic text-foreground-strong">{activeSymbol.label}</h2>
      <p className="symbol-copy mt-4 text-sm">{activeSymbol.shortMeaning}</p>
      <div className="symbol-focus-hints mt-6">
        <p className="symbol-kicker text-cyan-soft">{activeLabel ? `${activeLabel}-Linse` : "Linse waehlen"}</p>
        <p>{lensNote ?? "Hebraeisch, Zahl, Bedeutung, Thora, Journey oder Raum veraendern nur die Betrachtungsebene."}</p>
      </div>
      {activeLensMode ? (
        <div className="mt-5 grid gap-2 text-sm text-muted-soft">
          {activeLensMode === "torah" && lensData.scriptureAnchors.length > 0 ? <p>{lensData.scriptureAnchors.slice(0, 2).join(" / ")}</p> : null}
          {activeLensMode === "journey" && lensData.journeyTitles.length > 0 ? <p>{lensData.journeyTitles.slice(0, 2).join(" / ")}</p> : null}
          {activeLensMode === "room" && lensData.roomHref ? (
            <RoomTransitionButton href={lensData.roomHref} className="symbol-cta w-full">
              {activeSymbol.label}-Raum oeffnen
            </RoomTransitionButton>
          ) : null}
        </div>
      ) : null}
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
  const [activeSymbolId, setActiveSymbolId] = useState("wasser");
  const [hasSymbolFocus, setHasSymbolFocus] = useState(false);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [pendingPathId, setPendingPathId] = useState<string | null>(null);
  const [travelingPathId, setTravelingPathId] = useState<string | null>(null);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isLetterResonanceOpen, setIsLetterResonanceOpen] = useState(false);
  const [activeLetterResonanceId, setActiveLetterResonanceId] = useState<MeaningNodeId | null>(null);
  const [activeLetterSourcePathId, setActiveLetterSourcePathId] = useState<string | null>(null);
  const [activeLensMode, setActiveLensMode] = useState<SymbolLensMode | null>(null);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { isEntering } = useRoomTransition();
  const activeSymbol = network.nodes.find((node) => node.id === activeSymbolId) ?? network.nodes[0];
  const activeCodexEntry = getCodexEntry(activeSymbol.id);
  const activePath = network.paths.find((path) => path.id === activePathId);
  const activeLetterSourcePath = network.paths.find((path) => path.id === activeLetterSourcePathId);
  const activeDisclosureSymbolId = hasSymbolFocus ? activeSymbolId : null;
  const disclosureSymbolId = activeDisclosureSymbolId;
  const focusedSymbolId = activeDisclosureSymbolId;
  const hasGraphDisclosure = Boolean(disclosureSymbolId || activePathId || activeJourneyId || activeLetterId);
  const hasEdgeDisclosure = Boolean(activeDisclosureSymbolId || activePathId || activeJourneyId || activeLetterId);
  const activeJourney = network.journeys.find((journey) => journey.id === activeJourneyId);
  const connectedPaths = network.paths.filter((path) => path.from === activeSymbolId || path.to === activeSymbolId);
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
  const activeSymbolLensData = useMemo(
    () => (disclosureSymbolId ? getSymbolLensData(disclosureSymbolId) : null),
    [disclosureSymbolId],
  );
  const isSymbolLensVisible = Boolean(activeSymbolLensData)
    && !activeJourney
    && !activeCodexLetter
    && !activePathId;
  const activeSymbolLensNode = isSymbolLensVisible && activeLensMode && activeSymbolLensData
    ? activeSymbolLensData.nodes.find((node) => node.id === activeLensMode)
    : undefined;
  const activeLensMeaningIds = useMemo(
    () => new Set(activeLensMode && activeSymbolLensData ? activeSymbolLensData.meaningNodeIds[activeLensMode] ?? [] : []),
    [activeLensMode, activeSymbolLensData],
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
    : activeLensMode
      ? "Info"
      : isSymbolLensVisible
        ? "Linse"
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
        const center = getNodeCenter(activeSymbolId);
        instance.setCenter(center.x, center.y, { zoom: isSymbolLensVisible ? 1.04 : 0.86, duration: 680 });
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
  }, [activeLetterId, activeLetterNodeId, activePath, activeSymbolId, graphViewMode, isSymbolLensVisible, letterSymbolIds]);

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

      const showMeaningNodes = Boolean(hasSymbolFocus || activePathId || activeJourney || activeLensMeaningIds.size > 0);

      return [
        ...network.nodes.map((node) => {
          const isActiveSymbol = activeLetterId
            ? letterSymbolIds.has(node.id)
            : activeJourney
              ? journeySymbolIds.has(node.id)
              : activePath
                ? relationSymbolIds.has(node.id)
                : isSymbolLensVisible && activeLensMode === "journey"
                  ? MAIN_SYMBOL_IDS.includes(node.id)
                : hasSymbolFocus && node.id === activeSymbolId;
          const isPreviewedSymbol = false;
          const lensLabel = activeLensMode && node.id === activeSymbolId
            ? activeSymbolLensData?.labels[activeLensMode]
            : undefined;

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
                  : isSymbolLensVisible
                    ? false
                    : hasGraphDisclosure && node.id !== disclosureSymbolId && !relatedIds.has(node.id),
              showActions: (isActiveSymbol || isPreviewedSymbol) && !isSymbolLensVisible,
              activeLens: isSymbolLensVisible && node.id === activeSymbolId ? activeLensMode : null,
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
            isRelated: activeLetterId ? letterMeaningIds.has(node.id) : activeLensMeaningIds.has(node.id) || relatedIds.has(node.id),
            isDimmed: activeLetterId ? !letterMeaningIds.has(node.id) : isSymbolLensVisible ? !activeLensMeaningIds.has(node.id) && !relatedIds.has(node.id) : !relatedIds.has(node.id),
          },
        })) : []),
      ];
    },
    [activeCodexLetter, activeJourney, activeLensMeaningIds, activeLensMode, activeLetterId, activeLetterNodeId, activePath, activePathId, activeSymbolId, activeSymbolLensData, disclosureSymbolId, hasGraphDisclosure, hasSymbolFocus, isLetterResonanceOpen, isSymbolLensVisible, journeySymbolIds, letterMeaningIds, letterResonances, letterSymbolIds, letterSymbols, relatedIds, relationSymbolIds]
  );

  const edges: Edge[] = [
    ...(activeLetterId && activeLetterNodeId ? [
      ...letterSymbols.map((symbol, index) => {
        const ports = getConnectionPorts(symbol.id, activeLetterNodeId);

        return {
          id: `${symbol.id}-${activeLetterNodeId}`,
          source: symbol.id,
          target: activeLetterNodeId,
          sourceHandle: ports.sourceHandle,
          targetHandle: "left",
          type: "living",
          className: "is-letter-path is-selected-path",
          style: {
            stroke: "rgba(189,160,109,0.72)",
            strokeWidth: 2.4,
          },
          data: {
            isTraveling: false,
            relationType: "letter" as const,
            routeIndex: index,
            routeOffset: getRouteOffset(index, "letter"),
          },
        };
      }),
      ...(isLetterResonanceOpen ? letterResonances.map((resonance, index) => ({
        id: `${activeLetterNodeId}-${resonance.id}`,
        source: activeLetterNodeId,
        target: resonance.id,
        sourceHandle: "bottom",
        targetHandle: index === 2 ? "top" : "left",
        type: "living",
        className: "is-meaning-path is-awake",
        style: {
          stroke: "rgba(127,184,201,0.36)",
          strokeWidth: 1.2,
        },
        data: {
          isTraveling: false,
          relationType: "meaning" as const,
          routeIndex: index,
          routeOffset: getRouteOffset(index, "meaning"),
        },
      })) : []),
    ] : []),
    ...(hasEdgeDisclosure && !activeLetterId ? network.paths.map((path, index) => {
        const isFocused = focusedSymbolId ? path.from === focusedSymbolId || path.to === focusedSymbolId : false;
        const isSelected = path.id === activePathId || path.id === pendingPathId;
        const pathKey = getPathKey(path.from, path.to);
        const isLensJourneyPath = isSymbolLensVisible && activeLensMode === "journey" && Boolean(activeSymbolLensData?.journeyPathKeys.has(pathKey));
        const isJourneyPath = journeyPathKeys.has(pathKey) || isLensJourneyPath;
        const isTraveling = path.id === travelingPathId;
        const isLetterPath = Boolean(activeLetterId)
          && letterSymbolIds.has(path.from)
          && letterSymbolIds.has(path.to);
        const relationType: LivingConnectionData["relationType"] = isJourneyPath ? "journey" : isLetterPath ? "letter" : "symbol";
        const ports = getConnectionPorts(path.from, path.to);

        return {
          id: path.id,
          source: path.from,
          target: path.to,
          sourceHandle: ports.sourceHandle,
          targetHandle: ports.targetHandle,
          type: "living",
          className: `${isJourneyPath ? "is-journey-path" : isLetterPath ? "is-letter-path" : "is-symbol-path"} ${isJourneyPath || isSelected || isLetterPath ? "is-selected-path" : isFocused && !activeJourney && !activeLetterId ? "is-awake" : "is-dormant"} ${isTraveling ? "is-traveling-path" : ""}`,
          style: {
            stroke: isJourneyPath ? "rgba(189,160,109,0.58)" : isSelected || isLetterPath ? "rgba(189,160,109,0.82)" : isFocused && !activeJourney && !activeLetterId ? "rgba(127,184,201,0.48)" : "rgba(127,184,201,0.12)",
            strokeWidth: isJourneyPath ? 4.2 : isSelected || isLetterPath ? 2.4 : isFocused && !activeJourney && !activeLetterId ? 1.6 : 0.7,
          },
          data: {
            isTraveling,
            relationType,
            routeIndex: index,
            routeOffset: getRouteOffset(index, relationType),
          },
        };
    }) : []),
    ...((hasSymbolFocus || activeJourney || activeLensMeaningIds.size > 0) && !activeLetterId ? network.meaningLinks.map((link, index) => {
      const isFocused = activeJourney
        ? journeySymbolIds.has(link.symbolId) && journeyMeaningIds.has(link.meaningId)
        : activeLetterId ? letterSymbolIds.has(link.symbolId) : activeLensMeaningIds.has(link.meaningId) || link.symbolId === activeSymbolId;
      const ports = getConnectionPorts(link.symbolId, link.meaningId);

      return {
        id: `${link.symbolId}-${link.meaningId}`,
        source: link.symbolId,
        target: link.meaningId,
        sourceHandle: ports.sourceHandle,
        targetHandle: ports.targetHandle === "top" || ports.targetHandle === "top-left" || ports.targetHandle === "top-right" ? "top" : "left",
        type: "living",
        className: `is-meaning-path ${isFocused ? "is-awake" : "is-dormant"}`,
        style: {
          stroke: isFocused ? "rgba(127,184,201,0.42)" : "rgba(127,184,201,0.07)",
          strokeWidth: isFocused ? 1.3 : 0.5,
        },
        data: {
          isTraveling: false,
          relationType: "meaning" as const,
          routeIndex: index,
          routeOffset: getRouteOffset(index, "meaning"),
        },
      };
    }) : []),
  ];

  function focusSymbol(symbolId: string) {
    setActiveSymbolId(symbolId);
    setHasSymbolFocus(true);
    setActivePathId(null);
    setActiveJourneyId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setActiveLensMode(null);
  }

  function activateSymbolLens(nodeId: SymbolLensMode) {
    setActiveLensMode(nodeId);
    setHasSymbolFocus(true);
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
    setActiveLensMode(null);
    setHasSymbolFocus(true);
  }

  function previewPath(path: SymbolMeaningPath) {
    setActiveLensMode(null);
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
                aria-pressed={hasSymbolFocus && activeSymbolId === node.id}
                className={hasSymbolFocus && activeSymbolId === node.id ? "is-active" : ""}
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
            className={`symbol-constellation-field symbol-constellation-field--${graphViewMode.toLowerCase().replace("_", "-")} relative mt-3 overflow-hidden ${isSymbolLensVisible ? "is-symbol-lens-focused" : ""}`}
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
            {isSymbolLensVisible && activeSymbolLensData ? (
              <SymbolLensOrbit lensData={activeSymbolLensData} activeLensMode={activeLensMode} onActivate={activateSymbolLens} />
            ) : null}
          </div>

          <div className="symbol-mobile-layer-stepper mt-3 md:hidden" aria-label="Mobile Symbolnetz-Ebene">
            {(["Uebersicht", "Symbol", "Linse", "Info", "Beziehung"] as const).map((layer) => (
              <span key={layer} className={mobileLayerStep === layer ? "is-active" : ""}>
                {layer}
              </span>
            ))}
          </div>
        </div>

        <aside className={`symbol-detail-panel symbol-archive-fragment self-start p-6 ${isSymbolLensVisible ? "symbol-detail-panel--lens-focus" : ""}`}>
          <p className="symbol-kicker text-cyan-soft">
            {activeSymbolLensNode ? `${activeSymbol.label}: ${activeSymbolLensNode.label}` : activeJourney ? "Meaning Journey" : activePath ? "Bedeutungsweg" : activeCodexLetter ? "Letter-Ursprung" : "Fokus"}
          </p>
          {isSymbolLensVisible && activeSymbolLensData ? (
            <SymbolLensFocusDetail
              activeSymbol={activeSymbol}
              connectedPaths={connectedPaths}
              lensData={activeSymbolLensData}
              activeLensMode={activeLensMode}
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
