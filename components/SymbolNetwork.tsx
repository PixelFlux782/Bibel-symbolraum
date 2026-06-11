"use client";

/* eslint-disable react-hooks/preserve-manual-memoization */

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Fragment, useCallback, useMemo, useState, useRef, useEffect } from "react";
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
import { getCodexEntry, searchCodexEntries } from "@/lib/codex/getCodexEntry";
import type { CodexEntry } from "@/lib/codex/types";
import { calculateGematria } from "@/lib/hebrew/gematria";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { getBridgeBySourceAndTarget } from "@/lib/meaning-bridges";
import type { MeaningBridge } from "@/lib/meaning-bridges";
import { recordActivatedLetter } from "@/lib/pathActivity";
import { meaningNodes as allMeaningNodes } from "@/lib/meaning/meaningNodes";
import { biblicalMeaningLinks, hebrewMeaningLinks, symbolMeaningLinks } from "@/lib/meaning/meaningMappings";
import {
  buildSymbolMeaningNetwork,
  type SymbolMeaningSatellite,
  type SymbolMeaningNetworkNode,
  type SymbolMeaningPath,
} from "@/lib/meaning/buildSymbolMeaningNetwork";
import {
  getAllResonanceConnections,
  getJourneysForNode,
  getResonanceJourney,
  type ResonanceConnection,
  type ResonanceJourney,
  type ResonanceType,
} from "@/lib/resonance";
import {
  getChildrenOf,
  getHierarchyEntry,
  isMetaNode,
  type SymbolHierarchyLevel,
  type SymbolZoomLevel,
} from "@/lib/symbols/hierarchy";
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

type NumberNodeData = {
  kind: "number";
  value: number;
  label: string;
  note: string;
};

type LivingConnectionData = {
  isTraveling: boolean;
  relationType: "symbol" | "letter" | "meaning" | "journey";
  resonanceType?: ResonanceType;
  routeIndex: number;
  routeOffset: number;
};

type SymbolGraphViewMode = "OVERVIEW" | "SYMBOL_FOCUS" | "RELATION_FOCUS";
type SymbolMobileLayer = "Uebersicht" | "Symbol" | "Resonanz" | "Info" | "Beziehung";
type SymbolLensMode = "meaning" | "story" | "hebrew" | "gematria" | "journey";
type SymbolViewportMode = SymbolZoomLevel;

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
  storyPathKeys: Set<string>;
  storyConnectionIds: Set<string>;
  hebrewLetterIds: string[];
  gematriaNumberIds: string[];
  journeyTitles: string[];
};

type SearchResonanceGroupItem = {
  id: string;
  sourceId: string;
  targetId: string;
  text: string;
  registryIndex: number;
};

type SymbolSearchSuggestionKind = "Symbol" | "Hebraeisch" | "Bedeutung" | "Thora" | "Journey";

type SymbolSearchSuggestion = {
  id: string;
  title: string;
  detail?: string;
  kind: SymbolSearchSuggestionKind;
  symbolId: string;
  value: string;
  priority: number;
};

const network = buildSymbolMeaningNetwork();
const resonanceConnections = getAllResonanceConnections();
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
const LENS_LETTER_NODE_PREFIX = "lens-letter:";
const NUMBER_NODE_PREFIX = "number:";
const LETTER_RESONANCE_LIMIT = 3;
const SYMBOL_LENS_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste", "brot"];
const CURATED_RESONANCE_JOURNEY_ID = "journey-wasser-wueste-brot";
const CURATED_RESONANCE_PRIMARY_CONNECTION_IDS = ["resonance-wasser-wueste", "resonance-wueste-brot"];
const CURATED_RESONANCE_SECONDARY_CONNECTION_IDS = ["resonance-wasser-brot"];
const CURATED_RESONANCE_INSCRIPTION = "Wasser ist Ursprung. Die Wueste ist der Weg. Das Brot ist die Erfuellung.";
const SYMBOL_LENS_MODE_LABELS: Record<SymbolLensMode, string> = {
  meaning: "Bedeutung",
  story: "Erzaehlung",
  hebrew: "Hebraeisch",
  gematria: "Zahl",
  journey: "Erzaehlung",
};
const SYMBOL_LENS_MODE_NOTES: Record<SymbolLensMode, string> = {
  meaning: "Bedeutungsfelder und lokale Meaning-Verbindungen bleiben sichtbar.",
  story: "Story, Journey und Resonanzpfade erscheinen als gemeinsame Erzaehlspur.",
  hebrew: "Das hebraeische Wort oeffnet seine Buchstaben als interne Knoten.",
  gematria: "Zahlenresonanzen erscheinen als kleine Knoten im Netz.",
  journey: "Story, Journey und Resonanzpfade erscheinen als gemeinsame Erzaehlspur.",
};
const SYMBOL_VIEWPORT_LABELS: Record<SymbolViewportMode, string> = {
  overview: "Uebersicht",
  focus: "Fokus",
  detail: "Detail",
  deep: "Tiefe",
};
const SYMBOL_VIEWPORT_HINTS: Record<SymbolViewportMode, string> = {
  overview: "Zeigt Archetypen + kosmischen Rahmen",
  focus: "Zeigt Archetypen + Resonanzen",
  detail: "Zeigt Archetypen + Symbole",
  deep: "Zeigt Archetypen + Symbole + Erzaehlungen",
};
const OVERVIEW_HIERARCHY_LEVELS = new Set<SymbolHierarchyLevel>(["archetype", "cosmic_frame"]);
const DETAIL_HIERARCHY_LEVELS = new Set<SymbolHierarchyLevel>(["symbol"]);
const DEEP_HIERARCHY_LEVELS = new Set<SymbolHierarchyLevel>(["story_anchor", "verse_anchor"]);
const SYMBOL_LENS_CLASS_NAMES: Record<SymbolLensMode, string> = {
  meaning: "symbol-lens-orbit__node--meaning",
  story: "symbol-lens-orbit__node--story",
  hebrew: "symbol-lens-orbit__node--hebrew",
  gematria: "symbol-lens-orbit__node--gematria",
  journey: "symbol-lens-orbit__node--journey",
};
const LETTER_RESONANCE_LABELS: Partial<Record<MeaningNodeId, string>> = {
  lack: "Leere",
};
const LETTER_RESONANCE_PRIORITY: Partial<Record<string, MeaningNodeId[]>> = {
  mem: ["depth", "lack", "nourishment"],
};
const PATH_RESONANCE_FALLBACKS: Record<string, string> = {
  "wasser:licht": "Licht macht sichtbar,\nwas im Wasser verborgen ruht.",
  "feuer:licht": "Feuer verwandelt,\nLicht offenbart.",
  "feuer:wasser": "Wasser birgt.\nFeuer wandelt.",
  "feuer:wueste": "In der Leere brennt,\nwas den Weg verwandelt.",
  "licht:wueste": "In der Orientierungslosigkeit\nwird Richtung sichtbar.",
  "brot:licht": "Erkenntnis wird Nahrung,\nwenn sie geteilt wird.",
  "brot:feuer": "Was verwandelt wird,\nkann nähren.",
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

function isMainSymbolId(nodeId: string | null | undefined) {
  return Boolean(nodeId && network.nodes.some((node) => node.id === nodeId));
}

function getNodeHierarchyLevel(nodeId: string): SymbolHierarchyLevel {
  return getHierarchyEntry(nodeId)?.level ?? "archetype";
}

function isOverviewHierarchyNode(nodeId: string) {
  return OVERVIEW_HIERARCHY_LEVELS.has(getNodeHierarchyLevel(nodeId)) && !isMetaNode(nodeId);
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

function normalizeSymbolSearchTerm(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findSymbolBySearchTerm(value: string, allowPartial = true) {
  const query = normalizeSymbolSearchTerm(value);

  if (!query) return undefined;

  return network.nodes.find((node) => {
    const values = [
      node.id,
      node.label,
      node.transliteration,
      node.hebrew,
      node.shortMeaning,
    ].map(normalizeSymbolSearchTerm);

    return values.some((term) => term === query || (allowPartial && term.includes(query)));
  });
}

function searchTermMatches(query: string, values: Array<string | null | undefined>) {
  const normalizedQuery = normalizeSymbolSearchTerm(query);

  if (!normalizedQuery) return false;

  return values.some((value) => {
    const normalizedValue = normalizeSymbolSearchTerm(value ?? "");
    return normalizedValue === normalizedQuery || normalizedValue.includes(normalizedQuery);
  });
}

function suggestionScore(query: string, values: Array<string | null | undefined>, priority: number) {
  const normalizedQuery = normalizeSymbolSearchTerm(query);
  const normalizedValues = values
    .map((value) => normalizeSymbolSearchTerm(value ?? ""))
    .filter(Boolean);

  if (normalizedValues.some((value) => value === normalizedQuery)) return priority;
  if (normalizedValues.some((value) => value.startsWith(normalizedQuery))) return priority + 10;
  return priority + 20;
}

function getSymbolIdForHebrewWordId(hebrewWordId: string) {
  return network.nodes.find((node) => getSymbolHebrewProfile(node.id).hebrewWord?.id === hebrewWordId)?.id;
}

function getSymbolIdForMeaningNode(meaningNodeId: MeaningNodeId) {
  return network.meaningLinks.find((link) => link.meaningId === meaningNodeId)?.symbolId;
}

function getSymbolIdForCodexEntry(entry: CodexEntry) {
  if (isMainSymbolId(entry.id)) return entry.id;
  if (isMainSymbolId(entry.symbolRoomSlug)) return entry.symbolRoomSlug ?? undefined;

  const directRelation = entry.relations.find((relation) => isMainSymbolId(relation.targetId));
  if (directRelation) return directRelation.targetId;

  const hebrewRelation = entry.relations.find((relation) => relation.type === "has-hebrew-word");
  if (hebrewRelation) {
    const symbolId = getSymbolIdForHebrewWordId(hebrewRelation.targetId);
    if (symbolId) return symbolId;
  }

  return entry.meaningFields.flatMap((meaningNodeId) => getSymbolIdForMeaningNode(meaningNodeId)).find(Boolean);
}

function getCodexSuggestionKind(entry: CodexEntry): SymbolSearchSuggestionKind {
  if (entry.type === "symbol") return "Symbol";
  if (entry.type === "hebrew-word" || entry.type === "hebrew-letter" || entry.type === "number") return "Hebraeisch";
  if (entry.type === "scripture") return "Thora";
  if (entry.type === "journey") return "Journey";
  return "Bedeutung";
}

function uniqueSearchSuggestions(suggestions: SymbolSearchSuggestion[]) {
  const seen = new Set<string>();

  return suggestions
    .sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title, "de"))
    .filter((suggestion) => {
      const key = `${suggestion.kind}:${suggestion.title}:${suggestion.symbolId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

function getSymbolSearchSuggestions(query: string): SymbolSearchSuggestion[] {
  const normalizedQuery = normalizeSymbolSearchTerm(query);
  if (!normalizedQuery) return [];

  const suggestions: SymbolSearchSuggestion[] = [];

  for (const node of network.nodes) {
    const symbolLink = symbolMeaningLinks.find((link) => link.symbolId === node.id);
    const profile = getSymbolHebrewProfile(node.id);
    const values = [
      node.id,
      node.label,
      node.hebrew,
      node.transliteration,
      node.shortMeaning,
      profile.hebrewWord?.hebrew,
      profile.hebrewWord?.transliteration,
      ...(symbolLink?.aliases ?? []),
    ];

    if (searchTermMatches(query, values)) {
      suggestions.push({
        id: `symbol:${node.id}`,
        title: node.label,
        detail: [node.hebrew, node.transliteration].filter(Boolean).join(" / "),
        kind: "Symbol",
        symbolId: node.id,
        value: node.label,
        priority: suggestionScore(query, values, 0),
      });
    }
  }

  for (const entry of searchCodexEntries(query)) {
    const symbolId = getSymbolIdForCodexEntry(entry);
    if (!symbolId) continue;

    const values = [
      entry.id,
      entry.title,
      entry.subtitle,
      entry.hebrew,
      entry.transliteration,
      ...(entry.aliases ?? []),
      ...(entry.searchTerms ?? []),
    ];

    suggestions.push({
      id: `codex:${entry.id}`,
      title: entry.title,
      detail: [entry.hebrew, entry.transliteration].filter(Boolean).join(" / ") || entry.subtitle || undefined,
      kind: getCodexSuggestionKind(entry),
      symbolId,
      value: entry.title,
      priority: suggestionScore(query, values, entry.type === "symbol" ? 1 : 30),
    });
  }

  for (const link of hebrewMeaningLinks) {
    const values = [link.hebrewWordId, link.hebrew, link.transliteration];
    if (!searchTermMatches(query, values)) continue;

    const symbolId = getSymbolIdForHebrewWordId(link.hebrewWordId)
      ?? link.nodeIds.flatMap((meaningNodeId) => getSymbolIdForMeaningNode(meaningNodeId)).find(Boolean);
    if (!symbolId) continue;

    suggestions.push({
      id: `hebrew:${link.id}`,
      title: getSymbolLabel(symbolId),
      detail: `${link.hebrew} / ${link.transliteration}`,
      kind: "Hebraeisch",
      symbolId,
      value: link.transliteration,
      priority: suggestionScore(query, values, 12),
    });
  }

  for (const meaningNode of network.meaningNodes) {
    const values = [meaningNode.id, meaningNode.label, meaningNode.shortMeaning];
    if (!searchTermMatches(query, values)) continue;

    const symbolId = getSymbolIdForMeaningNode(meaningNode.id);
    if (!symbolId) continue;

    suggestions.push({
      id: `meaning:${meaningNode.id}`,
      title: meaningNode.label,
      detail: getSymbolLabel(symbolId),
      kind: "Bedeutung",
      symbolId,
      value: meaningNode.label,
      priority: suggestionScore(query, values, 42),
    });
  }

  for (const link of biblicalMeaningLinks) {
    const values = [link.biblicalReferenceId, link.label, ...(link.aliases ?? [])];
    if (!searchTermMatches(query, values)) continue;

    const symbolId = link.nodeIds.flatMap((meaningNodeId) => getSymbolIdForMeaningNode(meaningNodeId)).find(Boolean);
    if (!symbolId) continue;

    suggestions.push({
      id: `torah:${link.id}`,
      title: link.label,
      detail: getSymbolLabel(symbolId),
      kind: "Thora",
      symbolId,
      value: link.label,
      priority: suggestionScore(query, values, 52),
    });
  }

  for (const journey of network.journeys) {
    const values = [journey.id, journey.title, journey.description, ...journey.symbolLabels, ...journey.meaningNodeLabels];
    if (!searchTermMatches(query, values)) continue;

    const symbolId = journey.symbolPath.find((nodeId) => searchTermMatches(query, [nodeId, getSymbolLabel(nodeId)]))
      ?? journey.symbolPath[0];

    suggestions.push({
      id: `journey:${journey.id}`,
      title: journey.title,
      detail: journey.symbolLabels.slice(0, 3).join(" -> "),
      kind: "Journey",
      symbolId,
      value: journey.title,
      priority: suggestionScore(query, values, 62),
    });
  }

  return uniqueSearchSuggestions(suggestions);
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

function getResonanceConnectionForPath(from: string, to: string): ResonanceConnection | undefined {
  return resonanceConnections.find((connection) => getPathKey(connection.sourceId, connection.targetId) === getPathKey(from, to));
}

function getBridgeForPath(path: SymbolMeaningPath) {
  return getBridgeBySourceAndTarget(path.from as string, path.to as string)
    ?? getBridgeBySourceAndTarget(path.to as string, path.from as string);
}

function compactResonanceText(text: string) {
  const normalizedLines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const twoLineText = normalizedLines.length > 1
    ? normalizedLines.slice(0, 2).join("\n")
    : normalizedLines.join(" ");

  if (twoLineText.length <= 120) return twoLineText;

  const compacted = twoLineText.replace(/\s*\n\s*/g, " ");
  return compacted.length <= 120 ? compacted : `${compacted.slice(0, 117).trimEnd()}...`;
}

function getPathResonanceText(path: SymbolMeaningPath, bridge?: MeaningBridge, resonanceConnection?: ResonanceConnection) {
  const bridgeDescription = bridge && "description" in bridge
    ? (bridge as MeaningBridge & { description?: string }).description
    : undefined;
  const sourceText = resonanceConnection?.shortResonance
    ?? bridge?.summary
    ?? bridgeDescription
    ?? bridge?.title
    ?? PATH_RESONANCE_FALLBACKS[getPathKey(path.from, path.to)]
    ?? path.bridgeDescription
    ?? path.summary
    ?? `${getSymbolLabel(path.from)} und ${getSymbolLabel(path.to)} gehoeren in einer gemeinsamen Bedeutung zusammen.`;

  return compactResonanceText(sourceText);
}

function formatGermanList(items: string[]) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return items.join(" und ");

  return `${items.slice(0, -1).join(", ")} und ${items[items.length - 1]}`;
}

function getSearchResonanceGroup(symbolId: string): SearchResonanceGroupItem[] {
  return network.paths
    .filter((path) => path.from === symbolId || path.to === symbolId)
    .map((path) => {
      const resonanceConnection = getResonanceConnectionForPath(path.from, path.to);
      const registryIndex = resonanceConnection
        ? resonanceConnections.findIndex((connection) => connection.id === resonanceConnection.id)
        : Number.MAX_SAFE_INTEGER;

      return {
        id: path.id,
        sourceId: resonanceConnection?.sourceId ?? path.from,
        targetId: resonanceConnection?.targetId ?? path.to,
        text: getPathResonanceText(path, getBridgeForPath(path), resonanceConnection).replace(/\s*\n\s*/g, " "),
        registryIndex,
      };
    })
    .sort((left, right) => {
      if (left.registryIndex !== right.registryIndex) return left.registryIndex - right.registryIndex;
      return left.id.localeCompare(right.id, "de");
    });
}

function getResonanceStroke(
  resonanceType: ResonanceType | undefined,
  state: "selected" | "focused" | "dormant",
) {
  if (resonanceType === "story") {
    return state === "dormant" ? "rgba(189,160,109,0.2)" : state === "focused" ? "rgba(189,160,109,0.58)" : "rgba(211,180,112,0.86)";
  }

  if (resonanceType === "meaning") {
    return state === "dormant" ? "rgba(127,184,201,0.13)" : state === "focused" ? "rgba(127,184,201,0.48)" : "rgba(151,204,203,0.74)";
  }

  if (resonanceType === "polarity") {
    return state === "dormant" ? "rgba(189,160,109,0.16)" : state === "focused" ? "rgba(127,184,201,0.48)" : "rgba(221,194,128,0.78)";
  }

  return state === "dormant" ? "rgba(127,184,201,0.12)" : state === "focused" ? "rgba(127,184,201,0.48)" : "rgba(189,160,109,0.82)";
}

function getJourneyPathKeys(symbolId: string) {
  return new Set(
    network.journeys
      .filter((journey) => journey.symbolPath.includes(symbolId))
      .flatMap((journey) => journey.symbolPath.slice(1).map((nextSymbolId, index) => getPathKey(journey.symbolPath[index], nextSymbolId))),
  );
}

function getJourneySymbolIdsForLens(symbolId: string) {
  return new Set(
    network.journeys
      .filter((journey) => journey.symbolPath.includes(symbolId))
      .flatMap((journey) => journey.symbolPath),
  );
}

function getStoryConnectionsForLens(symbolId: string) {
  return resonanceConnections.filter(
    (connection) =>
      connection.resonanceType === "story"
      && (connection.sourceId === symbolId || connection.targetId === symbolId),
  );
}

function getStoryPathKeysForLens(symbolId: string) {
  return new Set(getStoryConnectionsForLens(symbolId).map((connection) => getPathKey(connection.sourceId, connection.targetId)));
}

function getNarrativePathKeysForLens(symbolId: string) {
  return new Set([
    ...Array.from(getStoryPathKeysForLens(symbolId)),
    ...Array.from(getJourneyPathKeys(symbolId)),
  ]);
}

function getNarrativeSymbolIdsForLens(symbolId: string) {
  return new Set([
    ...Array.from(getJourneySymbolIdsForLens(symbolId)),
    ...getStoryConnectionsForLens(symbolId).flatMap((connection) => [connection.sourceId, connection.targetId]),
  ]);
}

function getUniqueHebrewLettersForLens(symbolId: string) {
  const seen = new Set<string>();

  return getSymbolHebrewProfile(symbolId).letters.filter((letter) => {
    if (seen.has(letter.id)) return false;
    seen.add(letter.id);
    return true;
  });
}

function getGematriaNumberIdsForLens(symbolId: string) {
  const profile = getSymbolHebrewProfile(symbolId);
  const numberIds = new Set<string>();
  const hebrew = profile.hebrewWord?.hebrew ?? network.nodes.find((node) => node.id === symbolId)?.hebrew;
  const wordValue = hebrew ? calculateGematria(hebrew) : 0;

  if (wordValue > 0) numberIds.add(`${NUMBER_NODE_PREFIX}word:${wordValue}`);
  profile.letters.forEach((letter) => {
    if (letter.numericValue > 0) numberIds.add(`${NUMBER_NODE_PREFIX}letter:${letter.id}:${letter.numericValue}`);
  });

  return Array.from(numberIds);
}

function getSymbolLensData(symbolId: string): SymbolLensData | null {
  if (!SYMBOL_LENS_SYMBOL_IDS.includes(symbolId)) return null;

  const symbol = network.nodes.find((node) => node.id === symbolId);
  if (!symbol) return null;

  const hebrewProfile = getSymbolHebrewProfile(symbolId);
  const hebrewWord = hebrewProfile.hebrewWord;
  const hebrew = hebrewWord?.hebrew ?? symbol.hebrew;
  const transliteration = hebrewWord?.transliteration ?? symbol.transliteration;
  const meaningNodeIds = network.meaningLinks
    .filter((link) => link.symbolId === symbolId)
    .map((link) => link.meaningId);
  const journeys = network.journeys.filter((journey) => journey.symbolPath.includes(symbolId));
  const resonanceJourneys = getJourneysForNode(symbolId);
  const storyConnections = getStoryConnectionsForLens(symbolId);
  const uniqueLetters = getUniqueHebrewLettersForLens(symbolId);
  const gematriaNumberIds = getGematriaNumberIdsForLens(symbolId);
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

  if (meaningNodeIds.length > 0) {
    const primaryMeaning = getMeaningNodeLabel(meaningNodeIds[0]);
    addNode("meaning", "Meaning Graph", primaryMeaning);
    lensMeaningNodeIds.meaning = meaningNodeIds;
  }

  if (storyConnections.length > 0 || journeys.length > 0 || resonanceJourneys.length > 0) {
    addNode("story", "Erzaehlspur", resonanceJourneys[0]?.title ?? storyConnections[0]?.title ?? journeys[0]?.title ?? "Erzaehlung");
    lensMeaningNodeIds.story = Array.from(new Set(journeys.flatMap((journey) => journey.meaningNodePath)));
  }

  if (hebrew && uniqueLetters.length > 0) {
    addNode("hebrew", transliteration, `${transliteration} / ${hebrew}`);
    labels.hebrew = hebrew;
  }

  const gematria = hebrew ? calculateGematria(hebrew) : 0;
  if (gematria > 0 || gematriaNumberIds.length > 0) {
    addNode("gematria", "Zahlenwert", String(gematria));
    labels.gematria = String(gematria);
  }

  return {
    symbolId,
    nodes,
    labels,
    notes,
    meaningNodeIds: lensMeaningNodeIds,
    journeyPathKeys: getJourneyPathKeys(symbolId),
    storyPathKeys: getNarrativePathKeysForLens(symbolId),
    storyConnectionIds: new Set(storyConnections.map((connection) => connection.id)),
    hebrewLetterIds: uniqueLetters.map((letter) => letter.id),
    gematriaNumberIds,
    journeyTitles: [...resonanceJourneys.map((journey) => journey.title), ...journeys.map((journey) => journey.title)],
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

function NumberGraphNode({ data }: NodeProps<NumberNodeData>) {
  return (
    <div
      className="number-resonance-node"
      tabIndex={0}
      aria-label={`${data.label}: ${data.note}`}
    >
      <Handle id="left" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
      <span className="number-resonance-node__value">{data.value}</span>
      <span className="number-resonance-node__label">{data.label}</span>
    </div>
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
  const edgeStyle = data?.resonanceType === "polarity"
    ? { ...style, strokeDasharray: "8 7" }
    : style;

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
        <BaseEdge id={id} path={edgePath} style={edgeStyle} />
      </>
    );
  }

  return <BaseEdge id={id} path={edgePath} style={edgeStyle} />;
}

const nodeTypes = { symbol: SymbolGraphNode, meaning: MeaningGraphNode, letter: LetterGraphNode, number: NumberGraphNode };
const edgeTypes = { living: LivingConnectionEdge };
function SymbolLensOrbit({
  lensData,
  activeResonanceLens,
  position,
  onActivate,
}: {
  lensData: SymbolLensData;
  activeResonanceLens: SymbolLensMode | null;
  position: { x: number; y: number };
  onActivate: (nodeId: SymbolLensMode) => void;
}) {
  return (
    <div
      className="symbol-lens-orbit"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      aria-label={`${getSymbolLabel(lensData.symbolId)} Symbol-Linse`}
    >
      <div className="symbol-lens-orbit__ring" aria-hidden="true" />
      <div className="symbol-lens-orbit__ring symbol-lens-orbit__ring--outer" aria-hidden="true" />
      {lensData.nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onActivate(node.id)}
          aria-pressed={activeResonanceLens === node.id}
          className={`symbol-lens-orbit__node ${node.className} ${activeResonanceLens === node.id ? "is-active" : ""}`}
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
  activeResonanceLens,
  onPreviewPath,
}: {
  activeSymbol: SymbolMeaningNetworkNode;
  connectedPaths: SymbolMeaningPath[];
  lensData: SymbolLensData;
  activeResonanceLens: SymbolLensMode | null;
  onPreviewPath: (path: SymbolMeaningPath) => void;
}) {
  const visiblePaths = activeResonanceLens === "meaning" ? connectedPaths.slice(0, 3) : [];
  const lensNote = activeResonanceLens ? lensData.notes[activeResonanceLens] : undefined;
  const activeLabel = activeResonanceLens ? SYMBOL_LENS_MODE_LABELS[activeResonanceLens] : undefined;
  const profile = getSymbolHebrewProfile(activeSymbol.id);
  const hebrewWord = profile.hebrewWord;
  const hebrewLettersText = profile.letters.map((letter) => letter.name).join(" - ");
  const uniqueLetters = getUniqueHebrewLettersForLens(activeSymbol.id);
  const storyJourney = getJourneysForNode(activeSymbol.id)[0];
  const storyConnections = getStoryConnectionsForLens(activeSymbol.id);
  const narrativePath = storyJourney?.nodePath.map(getSymbolLabel).join(" -> ");
  const hebrew = hebrewWord?.hebrew ?? activeSymbol.hebrew;
  const gematria = hebrew ? calculateGematria(hebrew) : 0;

  return (
    <>
      <p className="symbol-breathe mt-5 font-serif text-5xl leading-none text-gold/90" lang="he" dir="rtl">{activeSymbol.hebrew}</p>
      <h2 className="mt-4 font-serif text-2xl italic text-foreground-strong">{activeSymbol.label}</h2>
      <p className="symbol-copy mt-4 text-sm">{activeSymbol.shortMeaning}</p>
      <div className="symbol-focus-hints mt-6">
        <p className="symbol-kicker text-cyan-soft">{activeLabel ? `${activeLabel}-Linse` : "Resonanz-Linse waehlen"}</p>
        <p>{lensNote ?? "Waehle eine Resonanz-Linse: Bedeutung, Hebraeisch, Zahl oder Erzaehlung."}</p>
      </div>
      {activeResonanceLens ? (
        <div className="mt-5 grid gap-2 text-sm text-muted-soft">
          {activeResonanceLens === "story" ? (
            <>
              <p className="symbol-kicker text-cyan-soft">Erzaehlung</p>
              {narrativePath ? <p className="font-serif text-base italic text-gold/80">{narrativePath}</p> : null}
              {lensData.journeyTitles.length > 0 ? <p>{lensData.journeyTitles.slice(0, 2).join(" / ")}</p> : null}
              {storyConnections.length > 0 ? <p>{storyConnections.map((connection) => connection.title).join(" / ")}</p> : null}
              {storyJourney ? <p>{storyJourney.summary.replace(/\s*\n\s*/g, " ")}</p> : null}
            </>
          ) : null}
          {activeResonanceLens === "hebrew" ? (
            <>
              <p className="symbol-kicker text-cyan-soft">Hebraeische Resonanz</p>
              <p>{hebrewWord ? `${hebrewWord.hebrew} / ${hebrewWord.transliteration}` : `${activeSymbol.hebrew} / ${activeSymbol.transliteration}`}</p>
              <p>Buchstaben: {hebrewLettersText || "noch nicht hinterlegt"}</p>
              <p>{uniqueLetters.map((letter) => letter.name).join(", ") || "Diese Spur"} verbindet vorhandene Symbolfelder im Hebrew Codex.</p>
            </>
          ) : null}
          {activeResonanceLens === "gematria" ? (
            <>
              <p className="symbol-kicker text-cyan-soft">Zahlenresonanz</p>
              <p>{hebrew} = {gematria}</p>
              <p>{profile.letters.map((letter) => `${letter.name}: ${letter.numericValue}`).join(" / ")}</p>
            </>
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

function ResonanceJourneyDetail({
  journey,
  connections,
}: {
  journey: ResonanceJourney;
  connections: ResonanceConnection[];
}) {
  return (
    <>
      <h2 className="mt-6 font-serif text-4xl italic text-foreground-strong">{journey.title}</h2>
      <p className="symbol-copy mt-5 text-lg">{journey.summary.replace(/\s*\n\s*/g, " ")}</p>
      <div className="mt-7 border-t border-white/[0.055] pt-5">
        <p className="symbol-kicker text-cyan-soft">Schritte</p>
        <p className="mt-4 font-serif text-xl italic leading-relaxed text-gold/80">
          <JourneySequence items={journey.nodePath.map(getSymbolLabel)} />
        </p>
      </div>
      <div className="mt-7 border-t border-white/[0.055] pt-5 max-md:hidden">
        <p className="symbol-kicker text-cyan-soft">Connection-Resonanzen</p>
        <div className="mt-4 grid gap-3">
          {connections.map((connection) => (
            <div key={connection.id} className="border-l border-gold/20 bg-white/[0.018] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-soft/70">
                {getSymbolLabel(connection.sourceId)} <span className="text-gold/65">&rarr;</span> {getSymbolLabel(connection.targetId)}
              </p>
              <h3 className="mt-2 font-serif text-xl italic text-foreground-strong/90">{connection.title}</h3>
              <p className="symbol-copy mt-2 text-sm">{connection.shortResonance}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SearchResonanceGroup({
  centerId,
  centerLabel,
  items,
}: {
  centerId: string;
  centerLabel: string;
  items: SearchResonanceGroupItem[];
}) {
  if (items.length === 0) return null;

  const neighborLabels = items.map((item) => {
    const neighborId = item.sourceId === centerId ? item.targetId : item.sourceId;
    return getSymbolLabel(neighborId);
  });

  return (
    <div className="mt-7 border-t border-white/[0.055] pt-5">
      <p className="symbol-kicker text-cyan-soft">Resonanzgruppe</p>
      <p className="symbol-copy mt-4 text-base italic text-gold/80">
        {centerLabel} resoniert mit {formatGermanList(neighborLabels)}.
      </p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="border-l border-gold/20 bg-white/[0.018] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-soft/70">
              {getSymbolLabel(item.sourceId)} <span className="text-gold/65">&rarr;</span> {getSymbolLabel(item.targetId)}
            </p>
            <p className="symbol-copy mt-2 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SymbolNetwork() {
  const [activeSymbolId, setActiveSymbolId] = useState("wasser");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocusSymbolId, setSearchFocusSymbolId] = useState<string | null>(null);
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);
  const [hasSymbolFocus, setHasSymbolFocus] = useState(false);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [pendingPathId, setPendingPathId] = useState<string | null>(null);
  const [travelingPathId, setTravelingPathId] = useState<string | null>(null);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isLetterResonanceOpen, setIsLetterResonanceOpen] = useState(false);
  const [activeLetterResonanceId, setActiveLetterResonanceId] = useState<MeaningNodeId | null>(null);
  const [activeLetterSourcePathId, setActiveLetterSourcePathId] = useState<string | null>(null);
  const [activeResonanceLens, setActiveResonanceLens] = useState<SymbolLensMode | null>(null);
  const [activeJourneyStepId, setActiveJourneyStepId] = useState<string | null>(null);
  const [activeResonanceJourneyId, setActiveResonanceJourneyId] = useState<string | null>(null);
  const [symbolViewportMode, setSymbolViewportMode] = useState<SymbolViewportMode>("overview");
  const [flowViewport, setFlowViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { isEntering } = useRoomTransition();
  const searchSuggestions = useMemo(() => getSymbolSearchSuggestions(searchQuery), [searchQuery]);
  const hasSearchInput = normalizeSymbolSearchTerm(searchQuery).length > 0;
  const showSearchSuggestions = isSearchSuggestionsOpen && hasSearchInput;
  const activeSymbol = network.nodes.find((node) => node.id === activeSymbolId) ?? network.nodes[0];
  const activeCodexEntry = getCodexEntry(activeSymbol.id);
  const activePath = network.paths.find((path) => path.id === activePathId);
  const activePathFrom = activePath?.from;
  const activePathTo = activePath?.to;
  const activeLetterSourcePath = network.paths.find((path) => path.id === activeLetterSourcePathId);
  const activeDisclosureSymbolId = hasSymbolFocus ? activeSymbolId : null;
  const disclosureSymbolId = activeDisclosureSymbolId;
  const focusedSymbolId = activeDisclosureSymbolId;
  const activeJourney = network.journeys.find((journey) => journey.id === activeJourneyId);
  const activeJourneySymbolPathKey = activeJourney?.symbolPath.join("|") ?? "";
  const activeResonanceJourney = activeResonanceJourneyId ? getResonanceJourney(activeResonanceJourneyId) : undefined;
  const activeResonanceJourneyNodePathKey = activeResonanceJourney?.nodePath.join("|") ?? "";
  const discoverableResonanceJourney = hasSymbolFocus
    ? getJourneysForNode(activeSymbolId).find((journey) => journey.id === CURATED_RESONANCE_JOURNEY_ID)
    : undefined;
  const showResonanceJourneyOption = Boolean(
    discoverableResonanceJourney
    && !activeResonanceJourney
    && !activeJourney
    && !activePath
    && !activeLetterId
    && !isLetterResonanceOpen,
  );
  const activeResonanceJourneyConnections = activeResonanceJourney
    ? activeResonanceJourney.connectionIds.flatMap((connectionId) => {
      const connection = resonanceConnections.find((item) => item.id === connectionId);
      return connection ? [connection] : [];
    })
    : [];
  const activeResonancePrimaryConnections = activeResonanceJourneyConnections.filter((connection) => CURATED_RESONANCE_PRIMARY_CONNECTION_IDS.includes(connection.id));
  const activeResonanceSecondaryConnections = activeResonanceJourneyConnections.filter((connection) => CURATED_RESONANCE_SECONDARY_CONNECTION_IDS.includes(connection.id));
  const activeResonanceJourneySymbolIds = useMemo(
    () => new Set(activeResonanceJourneyNodePathKey ? activeResonanceJourneyNodePathKey.split("|") : []),
    [activeResonanceJourneyNodePathKey],
  );
  const hasGraphDisclosure = Boolean(disclosureSymbolId || activePathId || activeJourneyId || activeLetterId || activeResonanceJourney);
  const hasEdgeDisclosure = Boolean(activeDisclosureSymbolId || activePathId || activeJourneyId || activeLetterId || activeResonanceJourney);
  const activeBridge = activePath
    ? getBridgeBySourceAndTarget(activePath.from as string, activePath.to as string) ?? getBridgeBySourceAndTarget(activePath.to as string, activePath.from as string)
    : undefined;
  const activeBridgeJourneyIds = activeBridge?.journeyIds?.join("|") ?? "";
  const activeResonanceConnection = activePath ? getResonanceConnectionForPath(activePath.from, activePath.to) : undefined;
  const activeResonanceText = activePath ? getPathResonanceText(activePath, activeBridge, activeResonanceConnection) : null;
  const activePathTitle = activeResonanceConnection?.title ?? activePath?.label;
  const activePathExplanation = activeResonanceConnection?.explanation.trim();
  const activeResonancePosition = useMemo(() => {
    if (!activePathFrom || !activePathTo) return null;

    const sourceCenter = getNodeCenter(activePathFrom);
    const targetCenter = getNodeCenter(activePathTo);
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const midpointX = (sourceCenter.x + targetCenter.x) / 2;
    const midpointY = (sourceCenter.y + targetCenter.y) / 2;
    const pathIndex = Math.max(network.paths.findIndex((path) => path.id === activePathId), 0);
    const curveX = midpointX + normalX * (getRouteOffset(pathIndex, "symbol") + 8);
    const curveY = midpointY + normalY * (getRouteOffset(pathIndex, "symbol") + 8);
    const inscriptionX = sourceCenter.x * 0.25 + curveX * 0.5 + targetCenter.x * 0.25;
    const inscriptionY = sourceCenter.y * 0.25 + curveY * 0.5 + targetCenter.y * 0.25;

    return {
      x: inscriptionX * flowViewport.zoom + flowViewport.x,
      y: inscriptionY * flowViewport.zoom + flowViewport.y,
    };
  }, [activePathFrom, activePathId, activePathTo, flowViewport.x, flowViewport.y, flowViewport.zoom]);
  const activeResonanceJourneyInscriptionPosition = useMemo(() => {
    if (!activeResonanceJourneyNodePathKey) return null;

    const centers = activeResonanceJourneyNodePathKey.split("|").map(getNodeCenter);
    const average = centers.reduce(
      (sum, center) => ({ x: sum.x + center.x, y: sum.y + center.y }),
      { x: 0, y: 0 },
    );

    return {
      x: (average.x / centers.length) * flowViewport.zoom + flowViewport.x,
      y: ((average.y / centers.length) - 92) * flowViewport.zoom + flowViewport.y,
    };
  }, [activeResonanceJourneyNodePathKey, flowViewport.x, flowViewport.y, flowViewport.zoom]);
  const connectedPaths = useMemo(
    () => network.paths.filter((path) => path.from === activeSymbolId || path.to === activeSymbolId),
    [activeSymbolId],
  );
  const searchResonanceGroup = useMemo(
    () => searchFocusSymbolId === activeSymbolId ? getSearchResonanceGroup(activeSymbolId) : [],
    [activeSymbolId, searchFocusSymbolId],
  );
  const activeCodexLetter = activeLetterId ? hebrewLetters.find((letter) => letter.id === activeLetterId) : undefined;
  const activeLetterNodeId = activeLetterId ? `${LETTER_NODE_PREFIX}${activeLetterId}` : null;
  const relationSymbolIds = useMemo(
    () => new Set(activePathFrom && activePathTo ? [activePathFrom, activePathTo] : []),
    [activePathFrom, activePathTo],
  );
  const graphViewMode: SymbolGraphViewMode = activePathId
    ? "RELATION_FOCUS"
    : hasSymbolFocus || activeJourney || activeResonanceJourney || activeLetterId
        ? "SYMBOL_FOCUS"
        : "OVERVIEW";
  const activeSymbolLensData = useMemo(
    () => (disclosureSymbolId ? getSymbolLensData(disclosureSymbolId) : null),
    [disclosureSymbolId],
  );
  const isSymbolLensVisible = Boolean(activeResonanceLens && activeSymbolLensData)
    && !activeJourney
    && !activeResonanceJourney
    && !activeCodexLetter
    && !activePathId;
  const isLensPickerVisible = Boolean(hasSymbolFocus && activeSymbolLensData)
    && !activeJourney
    && !activeResonanceJourney
    && !activeCodexLetter
    && !activePathId;
  const activeSymbolLensNode = isSymbolLensVisible && activeResonanceLens && activeSymbolLensData
    ? activeSymbolLensData.nodes.find((node) => node.id === activeResonanceLens)
    : undefined;
  const activeLensMeaningIds = useMemo(
    () => new Set(activeResonanceLens && activeSymbolLensData ? activeSymbolLensData.meaningNodeIds[activeResonanceLens] ?? [] : []),
    [activeResonanceLens, activeSymbolLensData],
  );
  const activeLensStoryPathKeys = useMemo(
    () => new Set(activeResonanceLens === "story" && activeSymbolLensData ? activeSymbolLensData.storyPathKeys : []),
    [activeResonanceLens, activeSymbolLensData],
  );
  const activeLensHebrewLetters = useMemo(
    () => activeResonanceLens === "hebrew" && activeSymbolLensData
      ? getUniqueHebrewLettersForLens(activeSymbolLensData.symbolId)
      : [],
    [activeResonanceLens, activeSymbolLensData],
  );
  const activeLensHebrewSymbolIds = useMemo(
    () => {
      if (activeResonanceLens !== "hebrew" || !activeSymbolLensData) return new Set<string>();

      const letterIds = new Set(activeLensHebrewLetters.map((letter) => letter.id));

      return new Set([
        activeSymbolLensData.symbolId,
        ...network.nodes
          .filter((node) => getSymbolHebrewProfile(node.id).letters.some((letter) => letterIds.has(letter.id)))
          .map((node) => node.id),
        ...activeLensHebrewLetters.flatMap((letter) => letter.relatedSymbolSlugs.filter(isMainSymbolId)),
      ]);
    },
    [activeLensHebrewLetters, activeResonanceLens, activeSymbolLensData],
  );
  const activeLensNumbers = useMemo(
    () => {
      if (activeResonanceLens !== "gematria" || !activeSymbolLensData) return [];

      const profile = getSymbolHebrewProfile(activeSymbolLensData.symbolId);
      const symbol = network.nodes.find((node) => node.id === activeSymbolLensData.symbolId);
      const hebrew = profile.hebrewWord?.hebrew ?? symbol?.hebrew ?? "";
      const wordValue = hebrew ? calculateGematria(hebrew) : 0;
      const numbers: NumberNodeData[] = wordValue > 0
        ? [{ kind: "number", value: wordValue, label: profile.hebrewWord?.transliteration ?? symbol?.transliteration ?? "Wort", note: "Zahlenwert des hebraeischen Wortes" }]
        : [];
      const seenLetterNumbers = new Set<string>();

      profile.letters.forEach((letter) => {
        const key = `${letter.id}:${letter.numericValue}`;
        if (seenLetterNumbers.has(key)) return;
        seenLetterNumbers.add(key);
        numbers.push({
          kind: "number",
          value: letter.numericValue,
          label: letter.name,
          note: `Zahlenwert von ${letter.name}`,
        });
      });

      return numbers;
    },
    [activeResonanceLens, activeSymbolLensData],
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
  const lensNarrativeSymbolIds = useMemo(
    () => activeResonanceLens === "story" && activeSymbolLensData ? getNarrativeSymbolIdsForLens(activeSymbolLensData.symbolId) : new Set<string>(),
    [activeResonanceLens, activeSymbolLensData],
  );
  const bridgeJourneys = useMemo(
    () => {
      const journeyIds = activeBridgeJourneyIds ? activeBridgeJourneyIds.split("|") : [];
      return network.journeys.filter((journey) => journeyIds.includes(journey.id));
    },
    [activeBridgeJourneyIds],
  );
  const bridgeJourneySymbolIds = useMemo(
    () => new Set(bridgeJourneys.flatMap((journey) => journey.symbolPath)),
    [bridgeJourneys],
  );
  const bridgeJourneyMeaningIds = useMemo(
    () => new Set<MeaningNodeId>(bridgeJourneys.flatMap((journey) => journey.meaningNodePath)),
    [bridgeJourneys],
  );
  const isJourneyLensFocus = isSymbolLensVisible && activeResonanceLens === "story" && Boolean(activeSymbolLensData);
  const isJourneyFocus = Boolean(activeJourney || activeResonanceJourney || isJourneyLensFocus || bridgeJourneys.length > 0);
  const journeyFocusSymbolIds = useMemo(
    () => new Set([
      ...Array.from(activeResonanceJourneySymbolIds),
      ...Array.from(journeySymbolIds),
      ...Array.from(lensNarrativeSymbolIds),
      ...Array.from(bridgeJourneySymbolIds),
    ]),
    [activeResonanceJourneySymbolIds, bridgeJourneySymbolIds, journeySymbolIds, lensNarrativeSymbolIds],
  );
  const journeyFocusMeaningIds = useMemo(
    () => new Set<MeaningNodeId>([
      ...Array.from(journeyMeaningIds),
      ...Array.from(activeResonanceLens === "story" ? activeLensMeaningIds : new Set<MeaningNodeId>()),
      ...Array.from(bridgeJourneyMeaningIds),
    ]),
    [activeLensMeaningIds, activeResonanceLens, bridgeJourneyMeaningIds, journeyMeaningIds],
  );
  const journeyFocusNodeIds = useMemo(
    () => new Set<string>([
      ...Array.from(journeyFocusSymbolIds),
      ...Array.from(journeyFocusMeaningIds),
    ]),
    [journeyFocusMeaningIds, journeyFocusSymbolIds],
  );
  const initialJourneyStepId = useMemo(() => {
    if (!isJourneyFocus) return null;

    if (activeResonanceLens === "story" && activeSymbolLensData?.symbolId && journeyFocusSymbolIds.has(activeSymbolLensData.symbolId)) {
      return activeSymbolLensData.symbolId;
    }

    const resonanceJourneyStartId = (activeResonanceJourneyNodePathKey ? activeResonanceJourneyNodePathKey.split("|") : [])
      .find((symbolId) => journeyFocusSymbolIds.has(symbolId));
    if (resonanceJourneyStartId) return resonanceJourneyStartId;

    const journeyStartId = (activeJourneySymbolPathKey ? activeJourneySymbolPathKey.split("|") : [])
      .find((symbolId) => journeyFocusSymbolIds.has(symbolId));
    if (journeyStartId) return journeyStartId;

    const bridgeStartId = bridgeJourneys
      .flatMap((journey) => journey.symbolPath)
      .find((symbolId) => journeyFocusSymbolIds.has(symbolId));
    if (bridgeStartId) return bridgeStartId;

    return Array.from(journeyFocusSymbolIds)[0] ?? null;
  }, [activeJourneySymbolPathKey, activeResonanceLens, activeResonanceJourneyNodePathKey, activeSymbolLensData, bridgeJourneys, isJourneyFocus, journeyFocusSymbolIds]);
  const journeyStepId = activeJourneyStepId && journeyFocusSymbolIds.has(activeJourneyStepId)
    ? activeJourneyStepId
    : initialJourneyStepId ?? activeSymbolId;
  const journeyPathKeys = useMemo(
    () => new Set([
      ...(activeJourneySymbolPathKey
        ? activeJourneySymbolPathKey.split("|").slice(1).map((symbolId, index) => getPathKey(activeJourneySymbolPathKey.split("|")[index], symbolId))
        : []),
      ...bridgeJourneys.flatMap((journey) => journey.symbolPath.slice(1).map((symbolId, index) => getPathKey(journey.symbolPath[index], symbolId))),
    ]),
    [activeJourneySymbolPathKey, bridgeJourneys]
  );

  const mobileLayerStep: SymbolMobileLayer = activePathId
    ? "Beziehung"
    : activeResonanceJourneyId
      ? "Resonanz"
    : activeResonanceLens
      ? "Info"
      : isSymbolLensVisible
        ? "Resonanz"
        : hasSymbolFocus || activeLetterId
        ? "Symbol"
        : "Uebersicht";
  const lensOrbitAnchorId = useMemo(() => {
    const anchorId = isLensPickerVisible
      ? activeSymbolId
      : isJourneyFocus && journeyStepId
        ? journeyStepId
        : focusedSymbolId;

    return isMainSymbolId(anchorId) ? anchorId : null;
  }, [activeSymbolId, focusedSymbolId, isJourneyFocus, isLensPickerVisible, journeyStepId]);
  const lensOrbitPosition = useMemo(() => {
    if (!lensOrbitAnchorId) return null;

    const center = getNodeCenter(lensOrbitAnchorId);

    return {
      x: center.x * flowViewport.zoom + flowViewport.x,
      y: center.y * flowViewport.zoom + flowViewport.y,
    };
  }, [flowViewport, lensOrbitAnchorId]);
  const isLensOrbitVisible = Boolean(
    isLensPickerVisible
    && activeSymbolLensData
    && lensOrbitAnchorId
    && lensOrbitPosition
    && activeSymbolLensData.symbolId === lensOrbitAnchorId,
  );

  const setSymbolViewport = useCallback((mode: SymbolViewportMode, duration = 680) => {
    setSymbolViewportMode(mode);

    const instance = reactFlowRef.current;

    if (!instance) return;

    if (mode === "overview") {
      instance.fitView({
        nodes: MAIN_SYMBOL_IDS.map((id) => ({ id })),
        padding: 0.24,
        minZoom: 0.46,
        maxZoom: 0.78,
        duration,
      });
      return;
    }

    if (mode === "focus" && isJourneyFocus && journeyFocusNodeIds.size > 0) {
      instance.fitView({
        nodes: Array.from(journeyFocusNodeIds).map((id) => ({ id })),
        padding: 0.34,
        minZoom: 0.42,
        maxZoom: 0.82,
        duration,
      });
      return;
    }

    if (mode === "focus" && graphViewMode === "RELATION_FOCUS" && activePathFrom && activePathTo) {
      instance.fitView({
        nodes: [{ id: activePathFrom }, { id: activePathTo }],
        padding: 0.36,
        minZoom: 0.5,
        maxZoom: 0.92,
        duration,
      });
      return;
    }

    if (mode === "focus" && activeLetterId && activeLetterNodeId) {
      instance.fitView({
        nodes: [...Array.from(letterSymbolIds).map((id) => ({ id })), { id: activeLetterNodeId }],
        padding: 0.28,
        minZoom: 0.5,
        maxZoom: 0.86,
        duration,
      });
      return;
    }

    if (mode === "focus" && activeSymbolId) {
      const focusIds = new Set([
        activeSymbolId,
        ...connectedPaths.flatMap((path) => [path.from, path.to]),
        ...Array.from(activeLensMeaningIds),
      ]);

      instance.fitView({
        nodes: Array.from(focusIds).map((id) => ({ id })),
        padding: 0.32,
        minZoom: 0.5,
        maxZoom: 0.92,
        duration,
      });
      return;
    }

    if ((mode === "detail" || mode === "deep") && isJourneyFocus) {
      const center = getNodeCenter(journeyStepId);
      instance.setCenter(center.x, center.y, { zoom: mode === "deep" ? 1.12 : 0.98, duration });
      return;
    }

    if ((mode === "detail" || mode === "deep") && activePathFrom && activePathTo) {
      const source = getNodeCenter(activePathFrom);
      const target = getNodeCenter(activePathTo);
      instance.setCenter((source.x + target.x) / 2, (source.y + target.y) / 2, { zoom: mode === "deep" ? 1.16 : 1.04, duration });
      return;
    }

    const center = getNodeCenter(activeSymbolId);
    instance.setCenter(center.x, center.y, { zoom: mode === "deep" ? 1.18 : isSymbolLensVisible ? 1.12 : 0.98, duration });
  }, [activeLensMeaningIds, activeLetterId, activeLetterNodeId, activePathFrom, activePathTo, activeSymbolId, connectedPaths, graphViewMode, isJourneyFocus, isSymbolLensVisible, journeyFocusNodeIds, journeyStepId, letterSymbolIds]);

  useEffect(() => {
    if (!isJourneyFocus || !initialJourneyStepId) return;
    if (activeJourneyStepId && journeyFocusSymbolIds.has(activeJourneyStepId)) return;

    const frameId = window.requestAnimationFrame(() => {
      setActiveJourneyStepId(initialJourneyStepId);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeJourneyStepId, initialJourneyStepId, isJourneyFocus, journeyFocusSymbolIds]);

  useEffect(() => {
    const instance = reactFlowRef.current;

    if (!instance) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) return;

    const frameId = window.requestAnimationFrame(() => {
      if (isJourneyFocus && journeyFocusNodeIds.size > 0) {
        setSymbolViewport("focus", 760);
        return;
      }

      if (graphViewMode === "RELATION_FOCUS" && activePathFrom && activePathTo) {
        instance.fitView({
          nodes: [{ id: activePathFrom }, { id: activePathTo }],
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
  }, [activeLetterId, activeLetterNodeId, activePathFrom, activePathTo, activeSymbolId, graphViewMode, isJourneyFocus, isSymbolLensVisible, journeyFocusNodeIds, letterSymbolIds, setSymbolViewport]);

  const relatedIds = useMemo(
    () => isJourneyFocus
      ? new Set([...journeyFocusSymbolIds, ...journeyFocusMeaningIds])
      : !focusedSymbolId
        ? new Set<string>()
      : new Set([
        ...relationSymbolIds,
        ...network.paths
          .filter((path) => path.from === focusedSymbolId || path.to === focusedSymbolId)
          .map((path) => getOtherSymbolId(path, focusedSymbolId)),
        ...network.meaningLinks.filter((link) => link.symbolId === focusedSymbolId).map((link) => link.meaningId),
      ]),
    [focusedSymbolId, isJourneyFocus, journeyFocusMeaningIds, journeyFocusSymbolIds, relationSymbolIds]
  );
  const nodes = useMemo<Node<SymbolNodeData | MeaningNodeData | LetterNodeData | NumberNodeData>[]>(
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

      const activeLensSymbolIds = new Set<string>([activeSymbolId]);

      if (activeResonanceLens === "story") {
        activeLensStoryPathKeys.forEach((pathKey) => {
          pathKey.split(":").forEach((symbolId) => activeLensSymbolIds.add(symbolId));
        });
      }

      if (activeResonanceLens === "meaning") {
        connectedPaths
          .filter((path) => getResonanceConnectionForPath(path.from, path.to)?.resonanceType === "meaning" || path.from === activeSymbolId || path.to === activeSymbolId)
          .forEach((path) => {
            activeLensSymbolIds.add(path.from);
            activeLensSymbolIds.add(path.to);
          });
      }

      if (activeResonanceLens === "hebrew") {
        activeLensHebrewSymbolIds.forEach((symbolId) => activeLensSymbolIds.add(symbolId));
      }

      const overviewSymbolIds = network.nodes
        .filter((node) => isOverviewHierarchyNode(node.id))
        .map((node) => node.id);
      const focusSymbolIds = new Set([
        activeSymbolId,
        ...connectedPaths.flatMap((path) => [path.from, path.to]),
        ...Array.from(activeLensSymbolIds),
      ]);
      const detailSymbolIds = getChildrenOf(activeSymbolId)
        .filter((entry) => DETAIL_HIERARCHY_LEVELS.has(entry.level) && network.nodes.some((node) => node.id === entry.id))
        .map((entry) => entry.id);
      const deepSymbolIds = getChildrenOf(activeSymbolId)
        .filter((entry) => DEEP_HIERARCHY_LEVELS.has(entry.level) && network.nodes.some((node) => node.id === entry.id))
        .map((entry) => entry.id);
      const visibleSymbolIds = new Set(
        symbolViewportMode === "overview"
          ? overviewSymbolIds
          : symbolViewportMode === "focus"
            ? Array.from(focusSymbolIds)
            : symbolViewportMode === "detail"
              ? [...Array.from(focusSymbolIds), ...detailSymbolIds]
              : [...Array.from(focusSymbolIds), ...detailSymbolIds, ...deepSymbolIds],
      );
      const visibleSymbolNodes = network.nodes.filter((node) => visibleSymbolIds.has(node.id));
      const semanticSymbolNodes = visibleSymbolNodes.length > 0 ? visibleSymbolNodes : network.nodes;
      const showMeaningNodes = symbolViewportMode !== "overview"
        && Boolean(activePathId || isJourneyFocus || activeLensMeaningIds.size > 0);

      return [
        ...semanticSymbolNodes.map((node) => {
          const isActiveSymbol = activeLetterId
            ? letterSymbolIds.has(node.id)
            : isJourneyFocus
              ? journeyFocusSymbolIds.has(node.id)
                : activePathId
                ? relationSymbolIds.has(node.id)
                : hasSymbolFocus && node.id === activeSymbolId;
          const isPreviewedSymbol = false;
          const lensLabel = activeResonanceLens && node.id === activeSymbolId
            ? activeSymbolLensData?.labels[activeResonanceLens]
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
              isRelated: activeLetterId
                ? letterSymbolIds.has(node.id)
                : isSymbolLensVisible
                  ? activeLensSymbolIds.has(node.id)
                  : relatedIds.has(node.id),
              isDimmed: activeLetterId
                ? !letterSymbolIds.has(node.id)
                : isJourneyFocus
                  ? !journeyFocusSymbolIds.has(node.id)
                  : activePathId
                    ? !relationSymbolIds.has(node.id)
                  : isSymbolLensVisible
                    ? !activeLensSymbolIds.has(node.id)
                    : hasGraphDisclosure && node.id !== disclosureSymbolId && !relatedIds.has(node.id),
              showActions: (isActiveSymbol || isPreviewedSymbol) && !isSymbolLensVisible,
              activeLens: isSymbolLensVisible && node.id === activeSymbolId ? activeResonanceLens : null,
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
            isDimmed: activeLetterId
              ? !letterMeaningIds.has(node.id)
              : isJourneyFocus
                ? !journeyFocusMeaningIds.has(node.id)
                : isSymbolLensVisible
                  ? !activeLensMeaningIds.has(node.id) && !relatedIds.has(node.id)
                  : !relatedIds.has(node.id),
          },
        })) : []),
        ...(activeResonanceLens === "hebrew" ? activeLensHebrewLetters.map((letter, index) => ({
          id: `${LENS_LETTER_NODE_PREFIX}${letter.id}`,
          type: "letter",
          position: letterResonancePositions[index % letterResonancePositions.length],
          selectable: false,
          data: {
            kind: "letter" as const,
            glyph: letter.glyph,
            name: letter.name,
            transcription: letter.transcription,
            isExpanded: false,
          },
        })) : []),
        ...(activeResonanceLens === "gematria" ? activeLensNumbers.map((numberNode, index) => ({
          id: index === 0 ? `${NUMBER_NODE_PREFIX}word:${numberNode.value}` : `${NUMBER_NODE_PREFIX}letter:${numberNode.label}:${numberNode.value}`,
          type: "number",
          position: [
            { x: 320, y: 190 },
            { x: 600, y: 205 },
            { x: 450, y: 500 },
            { x: 260, y: 430 },
            { x: 640, y: 430 },
          ][index % 5],
          selectable: false,
          data: numberNode,
        })) : []),
      ];
    },
    [activeCodexLetter, activeLensHebrewLetters, activeLensHebrewSymbolIds, activeLensMeaningIds, activeLensNumbers, activeLensStoryPathKeys, activeResonanceLens, activeLetterId, activeLetterNodeId, activePathId, activeSymbolId, activeSymbolLensData, connectedPaths, disclosureSymbolId, hasGraphDisclosure, hasSymbolFocus, isJourneyFocus, isLetterResonanceOpen, isSymbolLensVisible, journeyFocusMeaningIds, journeyFocusSymbolIds, letterMeaningIds, letterResonances, letterSymbolIds, letterSymbols, relatedIds, relationSymbolIds, symbolViewportMode]
  );

  useEffect(() => {
    const instance = reactFlowRef.current;

    if (!instance || !isJourneyFocus || journeyFocusNodeIds.size === 0) return;

    const nodeIds = new Set(nodes.map((node) => node.id));
    const hasJourneyNodes = Array.from(journeyFocusNodeIds).every((nodeId) => nodeIds.has(nodeId));

    if (!hasJourneyNodes) return;

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        setSymbolViewport("focus", 760);
        setFlowViewport(instance.getViewport());
      }, 32);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isJourneyFocus, journeyFocusNodeIds, nodes, setSymbolViewport]);

  const renderedNodeIds = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);

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
    ...(hasEdgeDisclosure && !activeLetterId ? network.paths.flatMap((path, index) => {
        if (!renderedNodeIds.has(path.from) || !renderedNodeIds.has(path.to)) return [];

        const isFocused = focusedSymbolId ? path.from === focusedSymbolId || path.to === focusedSymbolId : false;
        const isSelected = path.id === activePathId || path.id === pendingPathId;
        const pathKey = getPathKey(path.from, path.to);
        const resonanceConnection = getResonanceConnectionForPath(path.from, path.to);
        const isLensMeaningPath = isSymbolLensVisible
          && activeResonanceLens === "meaning"
          && isFocused
          && resonanceConnection?.resonanceType === "meaning";
        const isLensStoryPath = isSymbolLensVisible
          && activeResonanceLens === "story"
          && activeLensStoryPathKeys.has(pathKey);
        const isLensJourneyPath = isSymbolLensVisible && activeResonanceLens === "story" && Boolean(activeSymbolLensData?.journeyPathKeys.has(pathKey));
        const isJourneyPath = !activePath && (journeyPathKeys.has(pathKey) || isLensJourneyPath);
        const isTraveling = path.id === travelingPathId;
        const isLetterPath = Boolean(activeLetterId)
          && letterSymbolIds.has(path.from)
          && letterSymbolIds.has(path.to);
        const isDirectFocusPath = isFocused && !activeResonanceLens;

        if (isSymbolLensVisible && !isLensMeaningPath && !isLensStoryPath && !isLensJourneyPath) return [];
        if (hasSymbolFocus && !activeResonanceLens && !activePath && !isJourneyFocus && !isDirectFocusPath) return [];

        const relationType: LivingConnectionData["relationType"] = isJourneyPath || isLensStoryPath ? "journey" : isLetterPath ? "letter" : "symbol";
        const ports = getConnectionPorts(path.from, path.to);

        return [{
          id: path.id,
          source: path.from,
          target: path.to,
          sourceHandle: ports.sourceHandle,
          targetHandle: ports.targetHandle,
          type: "living",
          className: `${isJourneyPath || isLensStoryPath ? "is-journey-path" : isLetterPath ? "is-letter-path" : "is-symbol-path"} ${isJourneyPath || isLensStoryPath || isSelected || isLetterPath ? "is-selected-path" : isFocused && !activePath && !isJourneyFocus && !activeLetterId ? "is-awake" : "is-dormant"} ${isTraveling ? "is-traveling-path" : ""}`,
          style: {
            stroke: isJourneyPath || isLensStoryPath
              ? "rgba(189,160,109,0.68)"
              : isLetterPath
                ? "rgba(189,160,109,0.82)"
                : getResonanceStroke(
                  resonanceConnection?.resonanceType,
                  isSelected ? "selected" : isFocused && !activePath && !isJourneyFocus && !activeLetterId ? "focused" : "dormant",
                ),
            strokeWidth: isJourneyPath || isLensStoryPath ? 4.6 : isSelected || isLetterPath ? 2.4 : isFocused && !activePath && !isJourneyFocus && !activeLetterId ? 1.6 : 0.7,
          },
          data: {
            isTraveling,
            relationType,
            resonanceType: resonanceConnection?.resonanceType,
            routeIndex: index,
            routeOffset: getRouteOffset(index, relationType),
          },
        }];
    }) : []),
    ...(activeResonanceJourney && !activeLetterId ? [
      ...activeResonancePrimaryConnections.flatMap((connection, index) => {
        if (!renderedNodeIds.has(connection.sourceId) || !renderedNodeIds.has(connection.targetId)) return [];

        const ports = getConnectionPorts(connection.sourceId, connection.targetId);

        return [{
          id: `journey:${connection.id}`,
          source: connection.sourceId,
          target: connection.targetId,
          sourceHandle: ports.sourceHandle,
          targetHandle: ports.targetHandle,
          type: "living",
          className: "is-journey-path is-selected-path",
          style: {
            stroke: "rgba(221,194,128,0.92)",
            strokeWidth: 5,
          },
          data: {
            isTraveling: false,
            relationType: "journey" as const,
            resonanceType: connection.resonanceType,
            routeIndex: index,
            routeOffset: getRouteOffset(index, "journey"),
          },
        }];
      }),
      ...activeResonanceSecondaryConnections.flatMap((connection, index) => {
        if (!renderedNodeIds.has(connection.sourceId) || !renderedNodeIds.has(connection.targetId)) return [];

        const ports = getConnectionPorts(connection.sourceId, connection.targetId);

        return [{
          id: `journey-secondary:${connection.id}`,
          source: connection.sourceId,
          target: connection.targetId,
          sourceHandle: ports.sourceHandle,
          targetHandle: ports.targetHandle,
          type: "living",
          className: "is-journey-path",
          style: {
            stroke: "rgba(221,194,128,0.36)",
            strokeDasharray: "7 9",
            strokeWidth: 2.2,
          },
          data: {
            isTraveling: false,
            relationType: "journey" as const,
            resonanceType: connection.resonanceType,
            routeIndex: activeResonancePrimaryConnections.length + index,
            routeOffset: getRouteOffset(activeResonancePrimaryConnections.length + index, "journey"),
          },
        }];
      }),
    ] : []),
    ...((activePathId || isJourneyFocus || activeLensMeaningIds.size > 0) && !activeLetterId ? network.meaningLinks.flatMap((link, index) => {
      if (!renderedNodeIds.has(link.symbolId) || !renderedNodeIds.has(link.meaningId)) return [];

      const isFocused = isJourneyFocus
        ? journeyFocusSymbolIds.has(link.symbolId) && journeyFocusMeaningIds.has(link.meaningId)
        : activeLetterId ? letterSymbolIds.has(link.symbolId) : activeLensMeaningIds.has(link.meaningId) || link.symbolId === activeSymbolId;
      const ports = getConnectionPorts(link.symbolId, link.meaningId);

      return [{
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
      }];
    }) : []),
    ...(activeResonanceLens === "hebrew" && activeSymbolLensData ? activeLensHebrewLetters.map((letter, index) => {
      const targetId = `${LENS_LETTER_NODE_PREFIX}${letter.id}`;

      return {
        id: `${activeSymbolLensData.symbolId}-${targetId}`,
        source: activeSymbolLensData.symbolId,
        target: targetId,
        sourceHandle: index === 0 ? "top-right" : index === 1 ? "right" : "bottom-right",
        targetHandle: "left",
        type: "living",
        className: "is-letter-path is-selected-path",
        style: {
          stroke: "rgba(189,160,109,0.68)",
          strokeWidth: 2,
        },
        data: {
          isTraveling: false,
          relationType: "letter" as const,
          resonanceType: "hebrew" as const,
          routeIndex: index,
          routeOffset: getRouteOffset(index, "letter"),
        },
      };
    }) : []),
    ...(activeResonanceLens === "hebrew" && activeSymbolLensData ? activeLensHebrewLetters.flatMap((letter, letterIndex) => {
      const sourceId = `${LENS_LETTER_NODE_PREFIX}${letter.id}`;
      const relatedSymbolIds = Array.from(activeLensHebrewSymbolIds).filter(
        (symbolId) => symbolId !== activeSymbolLensData.symbolId
          && getSymbolHebrewProfile(symbolId).letters.some((symbolLetter) => symbolLetter.id === letter.id),
      );

      return relatedSymbolIds.map((symbolId, symbolIndex) => ({
        id: `${sourceId}-${symbolId}`,
        source: sourceId,
        target: symbolId,
        sourceHandle: "right",
        targetHandle: "left",
        type: "living",
        className: "is-letter-path is-selected-path",
        style: {
          stroke: "rgba(189,160,109,0.34)",
          strokeWidth: 1.2,
        },
        data: {
          isTraveling: false,
          relationType: "letter" as const,
          resonanceType: "shared_letter" as const,
          routeIndex: letterIndex + symbolIndex,
          routeOffset: getRouteOffset(letterIndex + symbolIndex, "letter"),
        },
      }));
    }) : []),
    ...(activeResonanceLens === "gematria" && activeSymbolLensData ? activeLensNumbers.map((numberNode, index) => {
      const targetId = index === 0 ? `${NUMBER_NODE_PREFIX}word:${numberNode.value}` : `${NUMBER_NODE_PREFIX}letter:${numberNode.label}:${numberNode.value}`;

      return {
        id: `${activeSymbolLensData.symbolId}-${targetId}`,
        source: activeSymbolLensData.symbolId,
        target: targetId,
        sourceHandle: index === 0 ? "top-right" : index === 1 ? "right" : "bottom-right",
        targetHandle: "left",
        type: "living",
        className: "is-gematria-path is-selected-path",
        style: {
          stroke: "rgba(221,194,128,0.58)",
          strokeWidth: index === 0 ? 2.2 : 1.3,
        },
        data: {
          isTraveling: false,
          relationType: "meaning" as const,
          resonanceType: "gematria" as const,
          routeIndex: index,
          routeOffset: getRouteOffset(index, "meaning"),
        },
      };
    }) : []),
  ];

  function focusSymbol(symbolId: string) {
    setActiveSymbolId(symbolId);
    setSearchFocusSymbolId(null);
    setActiveJourneyStepId(null);
    setHasSymbolFocus(true);
    setActivePathId(null);
    setActiveJourneyId(null);
    setActiveResonanceJourneyId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setActiveResonanceLens(null);
  }

  function focusSearchMatch(value: string, allowPartial = true) {
    const match = findSymbolBySearchTerm(value, allowPartial);

    if (!match) {
      setSearchFocusSymbolId(null);
      return;
    }

    focusSymbol(match.id);
    setSearchFocusSymbolId(match.id);
    setSearchQuery(match.label);
  }

  function activateSearchSuggestion(suggestion: SymbolSearchSuggestion) {
    setSearchQuery(suggestion.value);
    setIsSearchSuggestionsOpen(false);
    focusSymbol(suggestion.symbolId);
    setSearchFocusSymbolId(suggestion.symbolId);
  }

  function submitSearch() {
    const bestSuggestion = searchSuggestions[0];

    if (bestSuggestion) {
      activateSearchSuggestion(bestSuggestion);
      return;
    }

    setIsSearchSuggestionsOpen(false);
    focusSearchMatch(searchQuery);
  }

  function activateSymbolLens(nodeId: SymbolLensMode) {
    const nextLens = nodeId === "journey" ? "story" : nodeId;
    setActiveResonanceLens(nextLens);
    setActiveJourneyStepId(nextLens === "story" ? activeSymbolId : null);
    setHasSymbolFocus(true);
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveJourneyId(null);
    setActiveResonanceJourneyId(null);
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
    setActiveResonanceJourneyId(null);
    setActiveResonanceLens(null);
    setActiveJourneyStepId(null);
    setHasSymbolFocus(true);
  }

  function previewPath(path: SymbolMeaningPath) {
    setActiveResonanceLens(null);
    setActiveJourneyStepId(null);
    setPendingPathId(path.id);
    setActivePathId(path.id);
    setActiveJourneyId(null);
    setActiveResonanceJourneyId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setHasSymbolFocus(true);
  }

  function activateResonanceJourney(journeyId: string) {
    const journey = getResonanceJourney(journeyId);

    if (!journey) return;

    setActiveResonanceJourneyId(journey.id);
    setActiveJourneyStepId(journey.nodePath[0] ?? null);
    setHasSymbolFocus(true);
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveJourneyId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setActiveResonanceLens(null);
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
            className={`symbol-constellation-field symbol-constellation-field--${graphViewMode.toLowerCase().replace("_", "-")} relative mt-3 overflow-hidden ${isSymbolLensVisible ? "is-symbol-lens-focused" : ""} ${isJourneyFocus ? "is-journey-focused" : ""}`}
          >
            <form
              className="symbol-network-search"
              role="search"
              aria-label="Symbolnetz durchsuchen"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <label htmlFor="symbol-network-search" className="sr-only">Wort suchen</label>
              <input
                id="symbol-network-search"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearchQuery(nextValue);
                  setIsSearchSuggestionsOpen(Boolean(normalizeSymbolSearchTerm(nextValue)));
                  focusSearchMatch(nextValue, false);
                }}
                onFocus={() => setIsSearchSuggestionsOpen(Boolean(normalizeSymbolSearchTerm(searchQuery)))}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchSuggestionsOpen(false);
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Wort suchen…"
                className="symbol-network-search__input"
                autoComplete="off"
              />
              {showSearchSuggestions ? (
                <div
                  id="symbol-network-search-suggestions"
                  className="symbol-network-search__suggestions"
                  role="listbox"
                  aria-label="Suchvorschlaege"
                >
                  {searchSuggestions.length > 0 ? searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="symbol-network-search__suggestion"
                      role="option"
                      aria-selected={false}
                      onClick={() => activateSearchSuggestion(suggestion)}
                    >
                      <span>
                        <strong>{suggestion.title}</strong>
                        {suggestion.detail ? <small>{suggestion.detail}</small> : null}
                      </span>
                      <em>{suggestion.kind}</em>
                    </button>
                  )) : (
                    <p className="symbol-network-search__empty">Keine Resonanz gefunden</p>
                  )}
                </div>
              ) : null}
            </form>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              onInit={(instance) => {
                reactFlowRef.current = instance;
                setFlowViewport(instance.getViewport());
              }}
              onMove={(_, viewport) => setFlowViewport(viewport)}
              nodesDraggable={false}
              nodesConnectable={false}
              zoomOnScroll={false}
              panOnScroll={false}
              panOnDrag={false}
              preventScrolling={false}
              onNodeClick={(_, node) => {
                if (node.type === "letter") {
                  if (activeResonanceLens === "hebrew") return;
                  setIsLetterResonanceOpen(true);
                  setActiveLetterResonanceId(null);
                  return;
                }

                if (node.type === "meaning" && activeLetterId) {
                  setActiveLetterResonanceId(node.id as MeaningNodeId);
                  return;
                }

                if (node.type === "symbol" && isJourneyFocus && journeyFocusSymbolIds.has(node.id)) {
                  setActiveJourneyStepId(node.id);
                  const center = getNodeCenter(node.id);
                  reactFlowRef.current?.setCenter(center.x, center.y, { zoom: 0.98, duration: 560 });
                  window.setTimeout(() => {
                    const instance = reactFlowRef.current;
                    if (instance) setFlowViewport(instance.getViewport());
                  }, 32);
                  return;
                }

                if (node.type === "symbol") focusSymbol(node.id);
              }}
              className="symbol-network-flow bg-transparent"
            />
            {activeResonanceText && activeResonancePosition ? (
              <p
                key={activePathId}
                className="symbol-connection-resonance"
                style={{
                  left: `${activeResonancePosition.x}px`,
                  top: `${activeResonancePosition.y}px`,
                }}
              >
                {activeResonanceText}
              </p>
            ) : null}
            {activeResonanceJourney && activeResonanceJourneyInscriptionPosition ? (
              <p
                key={activeResonanceJourney.id}
                className="symbol-connection-resonance"
                style={{
                  left: `${activeResonanceJourneyInscriptionPosition.x}px`,
                  top: `${activeResonanceJourneyInscriptionPosition.y}px`,
                }}
              >
                {CURATED_RESONANCE_INSCRIPTION}
              </p>
            ) : null}
            <div className="symbol-viewport-controls" aria-label="Symbolnetz-Zoom steuern">
              <button type="button" onClick={() => setSymbolViewport("overview")} aria-label="Uebersicht anzeigen">
                <span>Uebersicht</span>
              </button>
              <button type="button" onClick={() => setSymbolViewport("focus")} aria-label="Fokus anzeigen">
                <span>Fokus</span>
              </button>
              <button type="button" onClick={() => setSymbolViewport("detail")} aria-label="Detail anzeigen">
                <span>Detail</span>
              </button>
              <button type="button" onClick={() => setSymbolViewport("deep")} aria-label="Tiefe anzeigen">
                <span>Tiefe</span>
              </button>
            </div>
            {isLensOrbitVisible && activeSymbolLensData && lensOrbitPosition ? (
              <SymbolLensOrbit
                key={lensOrbitAnchorId}
                lensData={activeSymbolLensData}
                activeResonanceLens={activeResonanceLens}
                position={lensOrbitPosition}
                onActivate={activateSymbolLens}
              />
            ) : null}
          </div>

          <div className="symbol-mobile-layer-stepper mt-3 md:hidden" aria-label="Mobile Symbolnetz-Ebene">
            {(["Uebersicht", "Symbol", "Resonanz", "Info", "Beziehung"] as const).map((layer) => (
              <span key={layer} className={mobileLayerStep === layer ? "is-active" : ""}>
                {layer}
              </span>
            ))}
          </div>
          {isLensPickerVisible && activeSymbolLensData ? (
            <div className="symbol-mobile-lens-bar md:hidden" aria-label="Resonanz-Linse waehlen">
              {activeSymbolLensData.nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={activeResonanceLens === node.id ? "is-active" : ""}
                  onClick={() => activateSymbolLens(node.id)}
                  aria-pressed={activeResonanceLens === node.id}
                >
                  {node.label}
                </button>
              ))}
            </div>
          ) : null}
          {showResonanceJourneyOption && discoverableResonanceJourney ? (
            <button
              type="button"
              className="symbol-mobile-resonance-hint md:hidden"
              onClick={() => activateResonanceJourney(discoverableResonanceJourney.id)}
            >
              Resonanzpfad entdecken
            </button>
          ) : null}
          {activeResonanceJourney ? (
            <div className="mt-4 border-l border-gold/35 pl-4 md:hidden">
              <p className="symbol-kicker text-cyan-soft">Resonanzpfad</p>
              <div className="mt-3 grid gap-2 font-serif text-lg italic text-gold/85">
                {activeResonanceJourney.nodePath.map((nodeId, index) => (
                  <Fragment key={nodeId}>
                    {index > 0 ? <span className="text-gold/45">&darr;</span> : null}
                    <span>{getSymbolLabel(nodeId)}</span>
                  </Fragment>
                ))}
              </div>
              <p className="symbol-copy mt-3 text-sm">{activeResonanceJourney.summary.replace(/\s*\n\s*/g, " ")}</p>
            </div>
          ) : null}
        </div>

        <aside className={`symbol-detail-panel symbol-archive-fragment self-start p-6 ${isSymbolLensVisible ? "symbol-detail-panel--lens-focus" : ""}`}>
          <p className="symbol-kicker text-cyan-soft">
            {activeSymbolLensNode ? `${activeSymbol.label}: ${activeSymbolLensNode.label}` : activeResonanceJourney ? "Resonanzpfad" : activeJourney ? "Meaning Journey" : activePath ? "Bedeutungsweg" : activeCodexLetter ? "Letter-Ursprung" : "Fokus"}
          </p>
          <div className="mt-4 border-l border-cyan/[0.18] pl-3 text-[10px] uppercase tracking-[0.18em] text-cyan-soft/70">
            <p>Aktuelle Ebene: {SYMBOL_VIEWPORT_LABELS[symbolViewportMode]}</p>
            <p className="mt-1 text-gold/60">{SYMBOL_VIEWPORT_HINTS[symbolViewportMode]}</p>
          </div>
          {isSymbolLensVisible && activeSymbolLensData ? (
            <SymbolLensFocusDetail
              activeSymbol={activeSymbol}
              connectedPaths={connectedPaths}
              lensData={activeSymbolLensData}
              activeResonanceLens={activeResonanceLens}
              onPreviewPath={previewPath}
            />
          ) : activeResonanceJourney ? (
            <ResonanceJourneyDetail
              journey={activeResonanceJourney}
              connections={activeResonanceJourneyConnections}
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
                {showResonanceJourneyOption && discoverableResonanceJourney ? (
                  <button
                    type="button"
                    onClick={() => activateResonanceJourney(discoverableResonanceJourney.id)}
                    className="mt-3 inline-flex w-full justify-center border border-gold/20 px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-gold/75 transition-colors hover:border-gold/45 hover:text-gold focus-visible:border-gold/60 focus-visible:text-gold"
                  >
                    Resonanzpfad entdecken
                  </button>
                ) : null}
                {activeCodexEntry ? (
                  <Link
                    href={`/codex/${activeCodexEntry.id}`}
                    className="mt-3 inline-flex w-full justify-center border border-gold/20 px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-gold/75 transition-colors hover:border-gold/45 hover:text-gold focus-visible:border-gold/60 focus-visible:text-gold"
                  >
                    Codex öffnen
                  </Link>
                ) : null}
              </div>
              <SearchResonanceGroup
                centerId={activeSymbol.id}
                centerLabel={activeSymbol.label}
                items={searchResonanceGroup}
              />
            </>
          )}

          {!activeJourney && activePath ? (
            <>
              <div className="mt-8 border-t border-white/[0.055] pt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-soft">
                  {getSymbolLabel(activePath.from)} <span className="text-gold/65">&rarr;</span> {getSymbolLabel(activePath.to)}
                </p>
                <h2 className="mt-6 font-serif text-4xl italic text-foreground-strong">{activePathTitle}</h2>
                <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-gold/70">{activePath.evidence}</p>
                <p className="symbol-copy mt-5 text-lg">{activePath.fromMeaning}<br /><span className="text-gold/65">→</span> {activePath.toMeaning}</p>
                <p className="mt-5 font-serif text-lg italic leading-relaxed text-foreground-strong/85">{activePathExplanation || activePath.summary}</p>
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
          ) : null}

          {isSymbolLensVisible && !activeJourney && !activeCodexLetter ? <div className="mt-8 border-t border-white/[0.055] pt-6 max-md:hidden">
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
