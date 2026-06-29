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
import { getRoomHebrewMovement, type RoomHebrewMovement } from "@/lib/hebrew/roomHebrewMovements";
import { visualAssets } from "@/lib/visualAssets";
import { getBridgeBySourceAndTarget } from "@/lib/meaning-bridges";
import type { MeaningBridge } from "@/lib/meaning-bridges";
import { derivePersonalWay, type PersonalWay } from "@/lib/personalWay";
import { recordActivatedLetter } from "@/lib/pathActivity";
import { STORED_REFLECTIONS_UPDATED_EVENT } from "@/lib/reflections";
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
  deriveResonanceConnectionsFromOntology,
  getOntologyDisplayText,
  getOntologyEntity,
  getOntologyEntityTitle,
  getOntologyRelationLabel,
  getOntologyRelationMarkerLabel,
  getOntologyRelationsForEntity,
  getPrimaryWayForEntity,
  normalizeOntologyStrength,
  mergeResonanceConnections,
  ontologyEntities,
  ontologyRelations,
  sortOntologyRelations,
  type OntologyRelation,
  type OntologyRelationType,
} from "@/lib/ontology";
import {
  getChildrenOf,
  getHierarchyEntry,
  isMetaNode,
  type SymbolHierarchyEntry,
  type SymbolHierarchyLevel,
  type SymbolZoomLevel,
} from "@/lib/symbols/hierarchy";
import {
  getJourneyStepForSymbol,
  getJourneysForSymbol,
  getNextJourneyStep,
  getPreviousJourneyStep,
  SYMBOL_JOURNEY_OVERVIEW_HREF,
} from "@/lib/symbols/symbolJourneys";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { getRoomTransition, getRoomTransitionInto, getRoomTransitionLabels } from "@/lib/symbols/roomTransitions";
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
  arrivalPresence?: SymbolArrivalPresence;
  transitionRole?: "source" | "horizon" | "cycle-horizon";
  isTouchedOnWay: boolean;
  isFamiliarOnWay: boolean;
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

type HierarchyNodeData = {
  kind: "hierarchy";
  title: string;
  summary: string;
  level: SymbolHierarchyLevel;
  isDeepAnchor: boolean;
  isHighlighted?: boolean;
};

type LivingConnectionData = {
  isTraveling: boolean;
  relationType: "symbol" | "letter" | "meaning" | "journey";
  resonanceType?: ResonanceType;
  isTransitionPath?: boolean;
  routeIndex: number;
  routeOffset: number;
};

type SymbolGraphViewMode = "OVERVIEW" | "SYMBOL_FOCUS" | "RELATION_FOCUS";
type SymbolMobileLayer = "Übersicht" | "Symbol" | "Resonanz" | "Info" | "Beziehung";
type SymbolLensMode = "meaning" | "story" | "hebrew" | "gematria" | "journey";
type SymbolInspectorFocus = "meaning" | "hebrew" | "gematria" | "story" | "subspaces" | "codex" | "room";
type SymbolCodexFocusParam = "overview" | "meaning" | "hebrew" | "gematria" | "story" | "spaces";
type SymbolRoomLensParam = "overview" | "meaning" | "hebrew" | "gematria" | "story";
type SymbolViewportMode = SymbolZoomLevel;
type SymbolArrivalPresence = "near" | "promise" | "horizon" | "ember" | "dark";

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

type SymbolSearchSuggestionKind = "Symbol" | "Hebräisch" | "Bedeutung" | "Thora" | "Spur";

type SymbolSearchSuggestion = {
  id: string;
  title: string;
  detail?: string;
  kind: SymbolSearchSuggestionKind;
  symbolId: string;
  value: string;
  priority: number;
};

type OntologyResonanceRow = {
  relation: OntologyRelation;
  endpointLabel: string;
  endpointHref?: string;
  relationLabel: string;
  deepeningText: string;
  markerLabel: string;
};

type SymbolInspectorStation = {
  title: string;
  text: string;
  cta?: string;
};

type SymbolInspectorCta = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type RoomTransitionWayStation = {
  id: string;
  label: string;
  detail?: string;
  href?: string;
  kind: "room" | "hebrew" | "verse";
};

type RoomTransitionWay = {
  sourceLabel: string;
  targetLabel: string;
  title: string;
  shortMeaning: string;
  isCycleReturn: boolean;
  stations: RoomTransitionWayStation[];
};

type LandscapeDisclosureLevel = 1 | 2 | 3 | 4;

type LandscapeDisclosureProfile = {
  response: string;
  movement: string[];
};

type SymbolNetworkInitialUrlState = {
  symbol?: string;
  lens?: string;
  path?: string;
};

const network = buildSymbolMeaningNetwork();
const manualResonanceConnections = getAllResonanceConnections();
const ontologyResonanceConnections = ontologyRelations
  ? deriveResonanceConnectionsFromOntology(ontologyRelations, { entityReferences: ontologyEntities })
  : [];
const resonanceConnections = mergeResonanceConnections(
  manualResonanceConnections,
  ontologyResonanceConnections,
);
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
const hierarchySatellitePositions: Record<string, { x: number; y: number }> = {
  quelle: { x: 46, y: 142 },
  brunnen: { x: 222, y: 132 },
  meer: { x: 306, y: 288 },
  fluss: { x: 202, y: 438 },
  tau: { x: 26, y: 424 },
  "schoepfung-wasser": { x: 410, y: 120 },
  schilfmeer: { x: 480, y: 278 },
  felswasser: { x: 390, y: 430 },
  "genesis-1-1": { x: 300, y: 24 },
  "genesis-1-2": { x: 572, y: 118 },
  morgenlicht: { x: 575, y: -18 },
  leuchte: { x: 827, y: -16 },
  stern: { x: 918, y: 138 },
  glanz: { x: 785, y: 292 },
  auge: { x: 582, y: 276 },
  "genesis-1-3": { x: 1010, y: 78 },
  flamme: { x: 580, y: 410 },
  glut: { x: 820, y: 412 },
  dornbusch: { x: 860, y: 560 },
  altar: { x: 700, y: 655 },
  laeuterung: { x: 545, y: 560 },
  "exodus-3-2": { x: 1010, y: 650 },
  leere: { x: 100, y: 440 },
  pruefung: { x: 255, y: 405 },
  stimme: { x: 405, y: 455 },
  weg: { x: 380, y: 620 },
  manna: { x: 320, y: 430 },
  korn: { x: 285, y: 188 },
  mehl: { x: 445, y: 132 },
  teig: { x: 615, y: 208 },
  tisch: { x: 575, y: 430 },
  bereschit: { x: 198, y: 116 },
  bara: { x: 360, y: 124 },
  schamajim: { x: 506, y: 42 },
  erez: { x: 486, y: 232 },
  elohim: { x: 232, y: 244 },
  tohu: { x: 468, y: 260 },
  vohu: { x: 560, y: 262 },
  tehom: { x: 642, y: 205 },
  ruach: { x: 756, y: 154 },
  majim: { x: 705, y: 300 },
  amar: { x: 850, y: 54 },
  wajehi: { x: 924, y: 194 },
  or: { x: 1000, y: 166 },
};
const missingPositionWarnings = new Set<string>();
const SYMBOL_NODE_SIZE = 176;
const MEANING_NODE_SIZE = 96;
const HIERARCHY_NODE_SIZE = 92;
const DEEP_HIERARCHY_NODE_SIZE = 76;
const MAIN_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste", "brot"];
const MOBILE_GATE_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste", "brot"];
const SYMBOL_ARRIVAL_PRESENCE: Record<string, SymbolArrivalPresence> = {
  wasser: "near",
  brot: "promise",
  licht: "horizon",
  feuer: "ember",
  wueste: "dark",
};
const LETTER_NODE_PREFIX = "letter:";
const LENS_LETTER_NODE_PREFIX = "lens-letter:";
const NUMBER_NODE_PREFIX = "number:";
const LETTER_RESONANCE_LIMIT = 3;
const SYMBOL_LENS_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste", "brot"];
const CURATED_RESONANCE_JOURNEY_ID = "journey-wasser-wueste-brot";
const GENESIS_ORIGIN_RESONANCE_JOURNEY_ID = "journey-genesis-ursprungspfad";
const DISCOVERABLE_RESONANCE_JOURNEY_IDS: Record<string, string> = {
  wasser: GENESIS_ORIGIN_RESONANCE_JOURNEY_ID,
  licht: GENESIS_ORIGIN_RESONANCE_JOURNEY_ID,
  brot: CURATED_RESONANCE_JOURNEY_ID,
  wueste: CURATED_RESONANCE_JOURNEY_ID,
};
const CURATED_RESONANCE_PRIMARY_CONNECTION_IDS = ["resonance-wasser-wueste", "resonance-wueste-brot"];
const CURATED_RESONANCE_SECONDARY_CONNECTION_IDS = ["resonance-wasser-brot"];
const CURATED_RESONANCE_INSCRIPTION = "Wasser ist Ursprung. Die Wüste ist der Weg. Das Brot ist die Erfüllung.";
const CURATED_RESONANCE_VISUAL_CONNECTIONS: ResonanceConnection[] = [
  {
    id: "resonance-wasser-wueste",
    sourceId: "wasser",
    targetId: "wueste",
    resonanceType: "story",
    title: "Weg der Prüfung",
    shortResonance: "Erst die Leere zeigt, wonach die Tiefe sucht.",
    explanation: "",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-wasser-brot",
    sourceId: "wasser",
    targetId: "brot",
    resonanceType: "meaning",
    title: "Von der Quelle zur Nahrung",
    shortResonance: "Was aus der Tiefe kommt, wird zur Gabe.",
    explanation: "",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-wueste-brot",
    sourceId: "wueste",
    targetId: "brot",
    resonanceType: "story",
    title: "Manna",
    shortResonance: "Im Mangel wird Versorgung als Gabe sichtbar.",
    explanation: "",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
];
const SYMBOL_LENS_MODE_LABELS: Record<SymbolLensMode, string> = {
  meaning: "Bedeutung",
  story: "Erzählung",
  hebrew: "Hebräisch",
  gematria: "Zahl",
  journey: "Erzählung",
};
const SYMBOL_LENS_MODE_NOTES: Record<SymbolLensMode, string> = {
  meaning: "Bedeutungsfelder und lokale Meaning-Verbindungen bleiben sichtbar.",
  story: "Story, Spur und Resonanz erscheinen als gemeinsame Erzählspur.",
  hebrew: "Das hebräische Wort öffnet seine Buchstaben als innere Spur.",
  gematria: "Zahlenresonanzen erscheinen als leise Zeichen im Raum.",
  journey: "Story, Spur und Resonanz erscheinen als gemeinsame Erzählspur.",
};
const SYMBOL_VIEWPORT_LABELS: Record<SymbolViewportMode, string> = {
  overview: "Übersicht",
  focus: "Fokus",
  detail: "Detail",
  deep: "Tiefe",
};
const SYMBOL_VIEWPORT_HINTS: Record<SymbolViewportMode, string> = {
  overview: "Die grossen Zeichen bleiben sichtbar.",
  focus: "Nahe Resonanzen treten hervor.",
  detail: "Unterräume werden leise sichtbar.",
  deep: "Erzählungen und Verse öffnen Tiefe.",
};
const BACK_VIEWPORT_TARGETS: Partial<Record<SymbolViewportMode, SymbolViewportMode>> = {
  deep: "detail",
  detail: "focus",
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
const INSPECTOR_CODEX_FOCUS_PARAMS: Partial<Record<SymbolInspectorFocus, SymbolCodexFocusParam>> = {
  meaning: "meaning",
  hebrew: "hebrew",
  gematria: "gematria",
  story: "story",
  subspaces: "spaces",
};
const LENS_CODEX_FOCUS_PARAMS: Partial<Record<SymbolLensMode, SymbolCodexFocusParam>> = {
  meaning: "meaning",
  hebrew: "hebrew",
  gematria: "gematria",
  story: "story",
  journey: "story",
};
const LETTER_RESONANCE_LABELS: Partial<Record<MeaningNodeId, string>> = {
  lack: "Leere",
};
const LETTER_RESONANCE_PRIORITY: Partial<Record<string, MeaningNodeId[]>> = {
  aleph: ["light", "fire", "word"],
  mem: ["depth", "lack", "nourishment"],
};
const MAX_ONTOLOGY_CONNECTIONS_PER_ACTIVE_ENTITY = 6;
const MAX_ONTOLOGY_PATTERN_CONNECTIONS_PER_ACTIVE_ENTITY = 2;
const INSPECTOR_ONTOLOGY_RELATION_TYPES = new Set<OntologyRelationType>([
  "resonates_with",
  "emerges_from",
  "is_expression_of",
  "is_threshold_to",
  "opens_into",
  "contrasts_with",
  "contains_pattern",
  "fulfills_pattern_of",
  "has_polarity",
  "structures_journey",
  "passes_through",
  "reveals",
  "nourishes",
  "tests",
  "appears_in_story",
]);
const ONTOLOGY_RESONANCE_LIMIT = 5;
const MOBILE_SYMBOL_RELATION_LIMIT = 3;
const LANDSCAPE_DISCLOSURE_PROFILES: Record<string, LandscapeDisclosureProfile> = {
  wasser: {
    response: "Aus der Tiefe hebt sich Licht.",
    movement: ["Majim", "Tehom", "Ruach", "Genesis 1,2", "Licht"],
  },
  licht: {
    response: "Was sichtbar wird, will verwandelt werden.",
    movement: ["Or", "Panim", "Kavod", "Genesis 1,3", "Feuer"],
  },
  feuer: {
    response: "Nach der Glut bleibt die Weite.",
    movement: ["Esch", "Mizbeach", "Korban", "Ruach", "Wüste"],
  },
  wueste: {
    response: "Im Mangel erscheint die Gabe.",
    movement: ["Midbar", "Derech", "Qol", "Manna", "Brot"],
  },
  brot: {
    response: "Die Gabe erinnert an ihren Ursprung.",
    movement: ["Manna", "Lechem", "Shever", "Seudah", "Wasser"],
  },
};

const ROOM_TRANSITION_STATION_ORDER: Record<string, string[]> = {
  wasser: ["majim", "tehom", "ruach", "genesis-1-2"],
  licht: ["or", "panim", "kavod", "genesis-1-3"],
  feuer: ["esch", "mizbeach", "korban", "ruach"],
  wueste: ["midbar", "derech", "qol", "manna"],
  brot: ["manna", "lechem", "shever", "seudah"],
};

const ROOM_TRANSITION_VERSE_LABELS: Record<string, string> = {
  "genesis-1-2": "Genesis 1,2",
  "genesis-1-3": "Genesis 1,3",
};
const PRIMARY_FOCUS_PATH_IDS: Record<string, string[]> = {
  wasser: ["creation"],
  licht: ["creation"],
  feuer: ["revelation"],
  wueste: ["desert-bread"],
  brot: ["desert-bread"],
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

const WATER_MEANING_STATIONS: SymbolInspectorStation[] = [
  { title: "Tiefe", text: "Das Verborgene unter dem Sichtbaren." },
  { title: "Ursprung", text: "Wo Leben aus dem Unsichtbaren hervortritt." },
  { title: "Reinigung", text: "Was trennt, löst und neu beginnen lässt." },
  { title: "Übergang", text: "Wasser als Schwelle zwischen zwei Zuständen." },
  { title: "Leben", text: "Was aus der Tiefe fruchtbar wird." },
];

const WATER_HEBREW_STATIONS: SymbolInspectorStation[] = [
  { title: "Mem", text: "Wasser, Tiefe, Mutterschoß, Verborgenes." },
  { title: "Jod", text: "Punkt, Anfang, Same, göttlicher Impuls." },
  { title: "Mem final", text: "Geschlossene Tiefe, Sammlung, Vollendung." },
];

const WATER_GEMATRIA_STATIONS: SymbolInspectorStation[] = [
  { title: "40 / Mem", text: "Zeit der Tiefe, Prüfung, Reifung, Wasser." },
  { title: "10 / Jod", text: "Punkt, Same, Anfangsimpuls." },
  { title: "90 / Majim", text: "Gesammelte Wasserbewegung." },
];

const WATER_STORY_STATIONS: SymbolInspectorStation[] = [
  { title: "Wasser", text: "Ursprung und Tiefe." },
  { title: "Wüste", text: "Entzug, Prüfung, Leere." },
  { title: "Brot", text: "Gabe, Versorgung, Erfüllung." },
];

const WATER_SUBSPACE_DETAILS: Record<string, string> = {
  quelle: "Ursprung des Wassers: der erste sichtbare Austritt aus der verborgenen Tiefe.",
  brunnen: "Verborgene Tiefe: Wasser wird zugänglich, bleibt aber im Inneren gesammelt.",
  meer: "Unbegrenzte Weite: Grenze, Gefahr und Durchgang liegen nah beieinander.",
  fluss: "Bewegung des Lebens: Wasser bekommt Richtung und trägt Fruchtbarkeit weiter.",
  tau: "Wasser des Himmels: eine leise Gabe zwischen Nacht, Morgen und Versorgung.",
};

const INSPECTOR_GUIDING_LINES: Record<Exclude<SymbolInspectorFocus, "codex" | "room">, string> = {
  meaning: "Wasser öffnet Übergänge zwischen Tiefe, Reinigung und Leben.",
  hebrew: "Das Wort selbst trägt die Bewegung von Tiefe – Ursprung – Tiefe.",
  gematria: "Die Zahl zeigt die verborgene Struktur des Wortes.",
  story: "Die Spur zeigt eine Bewegung vom Ursprung zur Gabe.",
  subspaces: "Die Gestalten des Wassers machen seine Bedeutungen erfahrbar.",
};

function getNodePosition(nodeId: string) {
  const position = positions[nodeId] ?? hierarchySatellitePositions[nodeId];

  if (!position && process.env.NODE_ENV !== "production" && !missingPositionWarnings.has(nodeId)) {
    missingPositionWarnings.add(nodeId);
    console.warn(`SymbolNetwork: Position für Node "${nodeId}" fehlt. Fallback wird verwendet.`);
  }

  return position ?? fallbackPosition;
}

function buildSymbolNetworkCodexHref({
  entryId,
  symbolId,
  activeInspectorFocus,
  activeResonanceLens,
  activeResonanceJourneyId,
}: {
  entryId: string;
  symbolId: string;
  activeInspectorFocus: SymbolInspectorFocus | null;
  activeResonanceLens: SymbolLensMode | null;
  activeResonanceJourneyId: string | null;
}) {
  const params = new URLSearchParams({ from: "symbolnetz" });
  const lens =
    activeResonanceJourneyId
      ? "story"
      : activeResonanceLens
        ?? (activeInspectorFocus === "meaning" || activeInspectorFocus === "hebrew" || activeInspectorFocus === "gematria" || activeInspectorFocus === "story"
          ? activeInspectorFocus
          : null);
  const focus =
    (activeInspectorFocus ? INSPECTOR_CODEX_FOCUS_PARAMS[activeInspectorFocus] : undefined)
    ?? (lens ? LENS_CODEX_FOCUS_PARAMS[lens] : undefined)
    ?? "overview";

  params.set("symbol", symbolId);
  params.set("focus", focus);

  if (lens) {
    params.set("lens", lens);
  }

  if (activeResonanceJourneyId) {
    params.set("path", activeResonanceJourneyId);
  }

  return `/codex/${entryId}?${params.toString()}`;
}

function buildSymbolNetworkRoomHref({
  roomHref,
  symbolId,
  activeInspectorFocus,
  activeResonanceLens,
  activeResonanceJourneyId,
}: {
  roomHref: string;
  symbolId: string;
  activeInspectorFocus: SymbolInspectorFocus | null;
  activeResonanceLens: SymbolLensMode | null;
  activeResonanceJourneyId: string | null;
}) {
  const params = new URLSearchParams({
    from: "symbolnetz",
    symbol: symbolId,
    lens: "overview",
  });
  const lens =
    activeResonanceJourneyId
      ? "story"
      : activeResonanceLens === "journey"
        ? "story"
        : activeResonanceLens
          ?? (activeInspectorFocus === "meaning" || activeInspectorFocus === "hebrew" || activeInspectorFocus === "gematria" || activeInspectorFocus === "story"
            ? activeInspectorFocus
            : null);

  if (lens) {
    params.set("lens", lens satisfies SymbolRoomLensParam);
  }

  if (activeResonanceJourneyId) {
    params.set("path", activeResonanceJourneyId);
  }

  return `${roomHref}?${params.toString()}`;
}

function getNodeSize(nodeId: string) {
  if (network.meaningNodes.some((node) => node.id === nodeId)) return MEANING_NODE_SIZE;
  const hierarchyEntry = getHierarchyEntry(nodeId);
  if (hierarchyEntry?.level === "story_anchor" || hierarchyEntry?.level === "verse_anchor") return DEEP_HIERARCHY_NODE_SIZE;
  if (hierarchyEntry?.parentId) return HIERARCHY_NODE_SIZE;
  return SYMBOL_NODE_SIZE;
}

function getNodeCenter(nodeId: string) {
  const size = getNodeSize(nodeId);
  const position = getNodePosition(nodeId);

  return {
    x: position.x + size / 2,
    y: position.y + size / 2,
  };
}

function isMainSymbolId(nodeId: string | null | undefined): nodeId is string {
  return Boolean(nodeId && network.nodes.some((node) => node.id === nodeId));
}

function normalizeSymbolNetworkLensParam(value: string | null): SymbolLensMode | null {
  if (value === "meaning" || value === "story" || value === "hebrew" || value === "gematria" || value === "journey") {
    return value === "journey" ? "story" : value;
  }

  return null;
}

function getInitialSymbolNetworkState(initialUrlState: SymbolNetworkInitialUrlState) {
  const symbolId = initialUrlState.symbol;

  if (!isMainSymbolId(symbolId)) {
    return {
      activeSymbolId: "wasser",
      hasSymbolFocus: false,
      activeResonanceLens: null,
      activeJourneyStepId: null,
      activeResonanceJourneyId: null,
    };
  }

  const activeResonanceLens = normalizeSymbolNetworkLensParam(initialUrlState.lens ?? null);
  const resonanceJourney = initialUrlState.path ? getResonanceJourney(initialUrlState.path) : undefined;

  return {
    activeSymbolId: symbolId,
    hasSymbolFocus: true,
    activeResonanceLens,
    activeJourneyStepId: resonanceJourney
      ? resonanceJourney.nodePath.includes(symbolId)
        ? symbolId
        : resonanceJourney.nodePath[0] ?? null
      : activeResonanceLens === "story"
        ? symbolId
        : null,
    activeResonanceJourneyId: resonanceJourney?.id ?? null,
  };
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
  if (entry.type === "hebrew-word" || entry.type === "hebrew-letter" || entry.type === "number") return "Hebräisch";
  if (entry.type === "scripture") return "Thora";
  if (entry.type === "journey") return "Spur";
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
      kind: "Hebräisch",
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
      kind: "Spur",
      symbolId,
      value: journey.title,
      priority: suggestionScore(query, values, 62),
    });
  }

  return uniqueSearchSuggestions(suggestions);
}

function getSymbolLabel(symbolId: string) {
  return network.nodes.find((node) => node.id === symbolId)?.label
    ?? getCodexEntry(symbolId)?.title
    ?? getOntologyEntity(symbolId)?.title
    ?? getHierarchyEntry(symbolId)?.title
    ?? symbolId;
}

function getSymbolNetworkNodeSummary(id: string) {
  return getCodexEntry(id)?.summary
    ?? getOntologyEntity(id)?.summary
    ?? getHierarchyEntry(id)?.summary
    ?? "Ursprungsspur im Symbolnetz.";
}

function getMeaningNodeLabel(meaningNodeId: string) {
  return network.meaningNodes.find((node) => node.id === meaningNodeId)?.label
    ?? allMeaningNodes.find((node) => node.id === meaningNodeId)?.label
    ?? meaningNodeId;
}

function getOntologyDisplayLabel(id: string) {
  const meaningNodeLabel = network.meaningNodes.find((node) => node.id === id)?.label
    ?? allMeaningNodes.find((node) => node.id === id)?.label;

  return getCodexEntry(id)?.title
    ?? getOntologyEntity(id)?.title
    ?? getHierarchyEntry(id)?.title
    ?? network.nodes.find((node) => node.id === id)?.label
    ?? meaningNodeLabel
    ?? getOntologyEntityTitle(id);
}

function getOntologyCodexHref(id: string) {
  return getCodexEntry(id) || getOntologyEntity(id) ? `/codex/${id}?from=symbolnetz&focus=overview` : undefined;
}

function getOntologyRelationDeepeningText(relation: OntologyRelation) {
  const source = getOntologyEntity(relation.sourceId);
  const target = getOntologyEntity(relation.targetId);
  const displayText = getOntologyDisplayText(relation);

  if (displayText) return displayText;
  if (source?.summary && target?.title) {
    return `${source.summary} So berührt ${source.title} ${target.title}.`;
  }

  return `${getOntologyDisplayLabel(relation.sourceId)} und ${getOntologyDisplayLabel(relation.targetId)} öffnen hier eine gemeinsame Bedeutungsspur.`;
}

function collectOntologyContextIds(symbolId: string) {
  return new Set([
    symbolId,
    ...getChildrenOf(symbolId).map((entry) => entry.id),
  ]);
}

function getInspectorOntologyRows(symbolId: string): OntologyResonanceRow[] {
  const contextIds = collectOntologyContextIds(symbolId);
  const childIds = new Set(getChildrenOf(symbolId).map((entry) => entry.id));
  const relationById = new Map<string, { relation: OntologyRelation; tier: number }>();
  const connectedEntityIds = new Set<string>();
  const seenRelationKeys = new Set<string>();
  const seenDisplayTexts = new Set(manualResonanceConnections.map(getResonanceTextKey).filter(Boolean));

  contextIds.forEach((contextId) => {
    getOntologyRelationsForEntity(contextId).forEach((relation) => {
      if (INSPECTOR_ONTOLOGY_RELATION_TYPES.has(relation.type)) {
        relationById.set(relation.id, { relation, tier: 0 });
      }

      if (childIds.has(contextId)) {
        const connectedId = relation.sourceId === contextId ? relation.targetId : relation.sourceId;

        if (getOntologyEntity(connectedId)) {
          connectedEntityIds.add(connectedId);
        }
      }
    });
  });

  connectedEntityIds.forEach((entityId) => {
    getOntologyRelationsForEntity(entityId).forEach((relation) => {
      if (INSPECTOR_ONTOLOGY_RELATION_TYPES.has(relation.type) && !relationById.has(relation.id)) {
        relationById.set(relation.id, { relation, tier: 1 });
      }
    });
  });

  let patternCount = 0;

  return Array.from(relationById.values())
    .sort((left, right) => {
      if (left.tier !== right.tier) return left.tier - right.tier;

      const [sortedLeft, sortedRight] = sortOntologyRelations([left.relation, right.relation]);
      if (sortedLeft.id !== sortedRight.id) return sortedLeft.id === left.relation.id ? -1 : 1;

      return normalizeOntologyStrength(right.relation.strength) - normalizeOntologyStrength(left.relation.strength);
    })
    .filter(({ relation }) => {
      const relationKey = `${getPathKey(relation.sourceId, relation.targetId)}:${relation.type}`;
      const displayTextKey = normalizeResonanceDisplayText(getOntologyRelationDeepeningText(relation));
      const isPatternRelation = relation.type === "contains_pattern" || relation.type === "fulfills_pattern_of";

      if (seenRelationKeys.has(relationKey)) return false;
      if (displayTextKey && seenDisplayTexts.has(displayTextKey)) return false;
      if (isPatternRelation) {
        if (patternCount >= MAX_ONTOLOGY_PATTERN_CONNECTIONS_PER_ACTIVE_ENTITY) return false;
        patternCount += 1;
      }

      seenRelationKeys.add(relationKey);
      if (displayTextKey) seenDisplayTexts.add(displayTextKey);
      return true;
    })
    .slice(0, ONTOLOGY_RESONANCE_LIMIT)
    .map(({ relation }) => {
      const endpointId = contextIds.has(relation.sourceId) ? relation.targetId : relation.sourceId;

      return {
        relation,
        endpointLabel: getOntologyDisplayLabel(endpointId),
        endpointHref: getOntologyCodexHref(endpointId),
        relationLabel: getOntologyRelationLabel(relation.type),
        deepeningText: getOntologyRelationDeepeningText(relation),
        markerLabel: getOntologyRelationMarkerLabel(relation.type),
      };
    });
}

function getLetterResonanceLabel(meaningNodeId: MeaningNodeId) {
  return LETTER_RESONANCE_LABELS[meaningNodeId] ?? getMeaningNodeLabel(meaningNodeId);
}

function getLetterDiscoveryText(letterId: string) {
  if (letterId === "aleph") {
    return "Der stille Anfang vor dem Wort. Licht und Feuer tragen beide diese erste Spur.";
  }

  if (letterId === "mem") {
    return "Die Wasserform des Werdens. Mem umhüllt, trägt und verbirgt den Ursprung im Inneren.";
  }

  return "";
}

function getPathKey(from: string, to: string) {
  return [from, to].sort().join(":");
}

function getRoomTransitionWay(symbolId: string): RoomTransitionWay | null {
  const transition = getRoomTransition(symbolId);
  if (!transition) return null;

  const labels = getRoomTransitionLabels(transition);
  const movement = getRoomHebrewMovement(symbolId);
  const orderedStationIds = ROOM_TRANSITION_STATION_ORDER[symbolId] ?? [];
  const hebrewStations = movement?.stations ?? [];
  const stations: RoomTransitionWayStation[] = [
    {
      id: transition.sourceRoom,
      label: labels.source,
      detail: "aktiver Raum",
      href: getSymbolPathConfig(transition.sourceRoom)?.roomHref,
      kind: "room",
    },
    ...orderedStationIds.flatMap<RoomTransitionWayStation>((stationId) => {
      const hebrewStation = hebrewStations.find((station) => station.codexId === stationId || station.label === stationId);
      if (hebrewStation) {
        return [{
          id: hebrewStation.id,
          label: hebrewStation.label,
          detail: hebrewStation.meaning,
          href: `/codex/${hebrewStation.codexId}?from=symbolnetz&symbol=${symbolId}&focus=hebrew&lens=hebrew`,
          kind: "hebrew" as const,
        }];
      }

      const hierarchyEntry = getHierarchyEntry(stationId);
      if (hierarchyEntry || ROOM_TRANSITION_VERSE_LABELS[stationId]) {
        return [{
          id: stationId,
          label: ROOM_TRANSITION_VERSE_LABELS[stationId] ?? hierarchyEntry?.title ?? stationId,
          detail: hierarchyEntry?.summary,
          href: getCodexEntry(stationId) ? `/codex/${stationId}?from=symbolnetz&symbol=${symbolId}&focus=story` : undefined,
          kind: "verse" as const,
        }];
      }

      return [];
    }),
    {
      id: transition.targetRoom,
      label: labels.target,
      detail: transition.targetRoom === "wasser" ? "Erinnerung an Ursprung" : "Horizont",
      href: getSymbolPathConfig(transition.targetRoom)?.roomHref,
      kind: "room" as const,
    },
  ];

  return {
    sourceLabel: labels.source,
    targetLabel: labels.target,
    title: transition.title,
    shortMeaning: transition.shortMeaning,
    isCycleReturn: transition.sourceRoom === "brot" && transition.targetRoom === "wasser",
    stations,
  };
}

function normalizeResonanceDisplayText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function getResonanceTextKey(connection: Pick<ResonanceConnection, "shortResonance" | "explanation" | "title">) {
  return normalizeResonanceDisplayText(connection.shortResonance)
    || normalizeResonanceDisplayText(connection.explanation)
    || normalizeResonanceDisplayText(connection.title);
}

function getResonanceConnectionForPath(from: string, to: string): ResonanceConnection | undefined {
  return resonanceConnections.find((connection) => getPathKey(connection.sourceId, connection.targetId) === getPathKey(from, to));
}

function getVisibleOntologyConnectionsForActiveEntity(activeId: string): ResonanceConnection[] {
  const manualPathKeys = new Set(manualResonanceConnections.map((connection) => getPathKey(connection.sourceId, connection.targetId)));
  const seenTextKeys = new Set(manualResonanceConnections.map(getResonanceTextKey).filter(Boolean));
  let patternCount = 0;

  return ontologyResonanceConnections
    .filter((connection) => connection.sourceId === activeId || connection.targetId === activeId)
    .sort((left, right) => normalizeOntologyStrength(right.strength) - normalizeOntologyStrength(left.strength))
    .filter((connection) => {
      if (manualPathKeys.has(getPathKey(connection.sourceId, connection.targetId))) return false;

      const textKey = getResonanceTextKey(connection);
      if (textKey && seenTextKeys.has(textKey)) return false;

      if (connection.resonanceType === "pattern") {
        if (patternCount >= MAX_ONTOLOGY_PATTERN_CONNECTIONS_PER_ACTIVE_ENTITY) return false;
        patternCount += 1;
      }

      if (textKey) seenTextKeys.add(textKey);
      return true;
    })
    .slice(0, MAX_ONTOLOGY_CONNECTIONS_PER_ACTIVE_ENTITY);
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
    ?? `${getSymbolLabel(path.from)} und ${getSymbolLabel(path.to)} gehören in einer gemeinsamen Bedeutung zusammen.`;

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

function getLandscapeDisclosureProfile(symbol: SymbolMeaningNetworkNode): LandscapeDisclosureProfile {
  return LANDSCAPE_DISCLOSURE_PROFILES[symbol.id] ?? {
    response: symbol.shortMeaning,
    movement: network.paths
      .filter((path) => path.from === symbol.id || path.to === symbol.id)
      .slice(0, 4)
      .map((path) => getSymbolLabel(getOtherSymbolId(path, symbol.id))),
  };
}

function getPrimaryFocusPathIds(symbolId: string, connectedPaths: SymbolMeaningPath[]) {
  const configuredIds = PRIMARY_FOCUS_PATH_IDS[symbolId] ?? [];
  const configured = configuredIds.filter((pathId) => connectedPaths.some((path) => path.id === pathId));

  if (configured.length > 0) return new Set(configured);
  return new Set(connectedPaths[0] ? [connectedPaths[0].id] : []);
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

function getDetailHierarchyChildren(symbolId: string) {
  return getChildrenOf(symbolId).filter((entry) => DETAIL_HIERARCHY_LEVELS.has(entry.level));
}

function getExistingDeepHierarchyAnchors(symbolId: string) {
  const detailChildIds = getDetailHierarchyChildren(symbolId).map((entry) => entry.id);
  const candidates = [
    ...getChildrenOf(symbolId),
    ...detailChildIds.flatMap((childId) => getChildrenOf(childId)),
  ];

  return candidates.filter((entry) => DEEP_HIERARCHY_LEVELS.has(entry.level) && Boolean(getCodexEntry(entry.id)));
}

function getStoryDeepHierarchyAnchors(symbolId: string) {
  return getExistingDeepHierarchyAnchors(symbolId).filter((entry) => entry.level === "story_anchor");
}

function getVerseDeepHierarchyAnchors(symbolId: string) {
  return getExistingDeepHierarchyAnchors(symbolId).filter((entry) => entry.level === "verse_anchor");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSubspacesTitle(symbolLabel: string) {
  return `Unterräume von ${symbolLabel}`;
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
    addNode("meaning", "Bedeutung", primaryMeaning);
    lensMeaningNodeIds.meaning = meaningNodeIds;
  }

  if (storyConnections.length > 0 || journeys.length > 0 || resonanceJourneys.length > 0) {
    addNode("story", "Erzählspur", resonanceJourneys[0]?.title ?? storyConnections[0]?.title ?? journeys[0]?.title ?? "Erzählung");
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

function RoomTransitionWayInline({ way }: { way: RoomTransitionWay }) {
  return (
    <div className={`symbol-room-transition-way ${way.isCycleReturn ? "symbol-room-transition-way--cycle" : ""}`}>
      <p className="symbol-room-transition-way__title">{way.title}</p>
      <div className="symbol-room-transition-way__stations">
        {way.stations.map((station, index) => (
          <Fragment key={station.id}>
            {index > 0 ? <span className="symbol-room-transition-way__arrow" aria-hidden="true">-&gt;</span> : null}
            {station.href ? (
              <Link href={station.href} className={`symbol-room-transition-way__station symbol-room-transition-way__station--${station.kind}`}>
                <strong>{station.label}</strong>
                {station.detail ? <i>{station.detail}</i> : null}
              </Link>
            ) : (
              <span className={`symbol-room-transition-way__station symbol-room-transition-way__station--${station.kind}`}>
                <strong>{station.label}</strong>
                {station.detail ? <i>{station.detail}</i> : null}
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function MobileRoomTransitionWay({ way }: { way: RoomTransitionWay }) {
  return (
    <div className={`symbol-mobile-transition-way ${way.isCycleReturn ? "symbol-mobile-transition-way--cycle" : ""}`}>
      {way.stations.map((station, index) => (
        <Fragment key={station.id}>
          {index === 1 ? (
            <>
              <span className="symbol-mobile-transition-way__arrow" aria-hidden="true">&darr;</span>
              <p className="symbol-mobile-transition-way__title">{way.title}</p>
              <span className="symbol-mobile-transition-way__arrow" aria-hidden="true">&darr;</span>
            </>
          ) : index > 1 ? (
            <span className="symbol-mobile-transition-way__arrow" aria-hidden="true">&darr;</span>
          ) : null}
          <div className={`symbol-mobile-transition-way__station symbol-mobile-transition-way__station--${station.kind}`}>
            <strong>{station.label}</strong>
            {station.detail && (index === 0 || index === way.stations.length - 1) ? <i>{station.detail}</i> : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function InspectorLeitsatz({ children }: { children: string }) {
  return <p className="symbol-inspector-leitsatz">{children}</p>;
}

function InspectorStationList({
  stations,
  numbered = false,
}: {
  stations: SymbolInspectorStation[];
  numbered?: boolean;
}) {
  return (
    <div className={`symbol-inspector-stations ${numbered ? "symbol-inspector-stations--numbered" : ""}`}>
      {stations.map((station, index) => (
        <div key={`${station.title}-${index}`} className="symbol-inspector-station">
          {numbered ? <span className="symbol-inspector-station__index">{index + 1}</span> : null}
          <div>
            <strong>{station.title}</strong>
            <p>{station.text}</p>
            {station.cta ? <i>{station.cta}</i> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function InspectorCtaList({ ctas }: { ctas: SymbolInspectorCta[] }) {
  const visibleCtas = ctas.filter((cta) => cta.href || cta.onClick);

  if (visibleCtas.length === 0) return null;

  return (
    <div className="symbol-inspector-ctas">
      {visibleCtas.map((cta) => cta.href ? (
        <Link key={cta.label} href={cta.href} className="symbol-archive-action">
          {cta.label}
        </Link>
      ) : (
        <button key={cta.label} type="button" onClick={cta.onClick} className="symbol-archive-action">
          {cta.label}
        </button>
      ))}
    </div>
  );
}

function HebrewResonanceLinks({
  symbolId,
  excludeWordId,
}: {
  symbolId: string;
  excludeWordId?: string;
}) {
  const words = getSymbolHebrewProfile(symbolId).relatedHebrewWords
    .filter((word) => word.id !== excludeWordId)
    .slice(0, 6);

  if (words.length === 0) return null;

  return (
    <div className="symbol-inspector-ctas" aria-label="Nahe hebräische Resonanz">
      {words.map((word) => (
        <Link key={word.id} href={`/codex/${word.id}?from=symbolnetz&symbol=${symbolId}&focus=hebrew&lens=hebrew`} className="symbol-archive-action">
          <span lang="he" dir="rtl">{word.hebrew}</span> {word.transliteration}
        </Link>
      ))}
    </div>
  );
}

function InspectorHebrewMovement({ movement }: { movement: RoomHebrewMovement }) {
  return (
    <div className="symbol-hebrew-movement" aria-label={movement.title}>
      <p className="symbol-kicker text-cyan-soft">{movement.title}</p>
      <p className="symbol-hebrew-movement__summary">{movement.summary}</p>
      <div className="symbol-hebrew-movement__stations">
        {movement.stations.map((station, index) => (
          <Fragment key={station.id}>
            {index > 0 ? <span className="symbol-hebrew-movement__arrow" aria-hidden="true">-&gt;</span> : null}
            <Link href={`/codex/${station.codexId}?from=symbolnetz&symbol=${movement.symbolId}&focus=hebrew&lens=hebrew`}>
              <span lang="he" dir="rtl">{station.hebrew}</span>
              <strong>{station.label}</strong>
              <i>{station.meaning}</i>
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSymbolWayMemoryNotice(personalWay: PersonalWay | null, symbolId: string) {
  if (personalWay?.familiarSymbols.includes(symbolId)) {
    return "Dieses Zeichen kehrt auf deinem Weg wieder.";
  }

  if (personalWay?.touchedSymbols.includes(symbolId)) {
    return "Dieses Zeichen wurde auf deinem Weg schon berührt.";
  }

  return null;
}

function SymbolGraphNode({ data }: NodeProps<SymbolNodeData>) {
  return (
    <div
      className={`group relative cursor-pointer transition-opacity duration-700 ${data.transitionRole ? `symbol-transition-node symbol-transition-node--${data.transitionRole}` : ""} ${data.arrivalPresence ? `symbol-arrival-node symbol-arrival-node--${data.arrivalPresence}` : ""} ${data.emergenceIndex !== undefined ? "letter-emergence-symbol" : ""} ${data.isDimmed ? "opacity-[0.24]" : "opacity-100"}`}
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
        } ${data.transitionRole ? `is-transition-${data.transitionRole}` : ""} ${data.arrivalPresence ? `is-arrival-${data.arrivalPresence}` : ""} ${data.id === "wasser" ? "is-first-entry" : ""} ${data.isTouchedOnWay ? "is-touched-on-way" : ""} ${data.isFamiliarOnWay ? "is-familiar-on-way" : ""} ${data.activeLens ? `has-lens has-lens-${data.activeLens}` : ""}`}
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
      <span className="letter-focus-node__hint">{data.isExpanded ? "Resonanz" : data.transcription}</span>
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

function HierarchySatelliteNode({ data }: NodeProps<HierarchyNodeData>) {
  return (
    <div
      className={`hierarchy-satellite-node ${data.isDeepAnchor ? "hierarchy-satellite-node--deep" : ""} ${data.isHighlighted ? "is-highlighted" : ""}`}
      tabIndex={0}
      aria-label={`${data.title}: ${data.summary}`}
    >
      <Handle id="left" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="top" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="right" type="source" position={Position.Right} className="opacity-0" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="opacity-0" />
      <span>{data.title}</span>
      <i>{data.summary}</i>
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
  const isTransitionPath = Boolean(data?.isTransitionPath);
  const outwardLift = isTransitionPath ? 42 : relationType === "journey" ? 30 : relationType === "letter" ? 18 : 8;
  const curveX = midpointX + normalX * (routeOffset + outwardLift);
  const curveY = midpointY + normalY * (routeOffset + outwardLift);
  const edgePath = `M ${sourceX},${sourceY} Q ${curveX},${curveY} ${targetX},${targetY}`;
  const edgeStyle = data?.resonanceType === "polarity"
    ? { ...style, strokeDasharray: "8 7" }
    : style;

  if (relationType === "journey" || isTransitionPath) {
    return (
      <>
        <BaseEdge
          id={`${id}-journey-halo`}
          path={edgePath}
          style={{
            stroke: isTransitionPath ? "rgba(224,194,128,0.24)" : "rgba(189,160,109,0.18)",
            strokeWidth: isTransitionPath ? 12 : 9,
            filter: isTransitionPath ? "blur(4px)" : "blur(3px)",
          }}
        />
        <BaseEdge id={id} path={edgePath} style={edgeStyle} />
      </>
    );
  }

  return <BaseEdge id={id} path={edgePath} style={edgeStyle} />;
}

const nodeTypes = { symbol: SymbolGraphNode, meaning: MeaningGraphNode, letter: LetterGraphNode, number: NumberGraphNode, hierarchy: HierarchySatelliteNode };
const edgeTypes = { living: LivingConnectionEdge };
const reactFlowProOptions = { hideAttribution: true };
const reactFlowFitViewOptions = { padding: 0.2 };
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

function OntologyResonanceToken({ label }: { label: string }) {
  return <span className="symbol-ontology-resonance__token">{label}</span>;
}

function OntologyResonanceRows({
  rows,
  activeOntologyRelationId,
  onToggleRelation,
}: {
  rows: OntologyResonanceRow[];
  activeOntologyRelationId: string | null;
  onToggleRelation: (relationId: string) => void;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="symbol-ontology-resonances" aria-label="Ontologie-Resonanzen">
      {rows.map((row) => {
        const isActive = activeOntologyRelationId === row.relation.id;

        return (
          <div key={row.relation.id} className={`symbol-ontology-resonance ${isActive ? "is-active" : ""}`}>
            <button
              type="button"
              className="symbol-ontology-resonance__line"
              onClick={() => onToggleRelation(row.relation.id)}
              aria-expanded={isActive}
            >
              <span className="symbol-ontology-resonance__marker">{row.markerLabel}</span>
              <OntologyResonanceToken label={row.endpointLabel} />
            </button>
            {isActive ? (
              <div className="symbol-ontology-resonance__deepening">
                <p className="symbol-ontology-resonance__relation-label">{row.relationLabel}</p>
                <p>{row.deepeningText}</p>
                {row.endpointHref ? (
                  <Link href={row.endpointHref} className="symbol-ontology-resonance__codex-link">
                    Im Codex ansehen
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SymbolJourneyInspectorNotice({ symbolId }: { symbolId: string }) {
  const journey = getJourneysForSymbol(symbolId)[0];
  const step = journey ? getJourneyStepForSymbol(journey.id, symbolId) : undefined;
  const hebrewMovement = getRoomHebrewMovement(symbolId);
  const preparesTransition = getRoomTransition(symbolId);
  const remembersTransition = getRoomTransitionInto(symbolId);
  const preparesLabels = preparesTransition ? getRoomTransitionLabels(preparesTransition) : undefined;
  const remembersLabels = remembersTransition ? getRoomTransitionLabels(remembersTransition) : undefined;
  const transitionWay = getRoomTransitionWay(symbolId);

  if (!journey || !step) {
    return null;
  }

  const previousStep = getPreviousJourneyStep(journey.id, symbolId);
  const nextStep = getNextJourneyStep(journey.id, symbolId);

  return (
    <div className="symbol-inspector-journey-note">
      {transitionWay ? (
        <>
          <p><strong>{transitionWay.title}</strong> {transitionWay.shortMeaning}</p>
          <div className="symbol-inspector-room-movement">
            <span>Bereitet vor: {transitionWay.targetLabel}</span>
            <span>{transitionWay.isCycleReturn ? "Kein Neustart, sondern Rückbindung an den Ursprung." : `Aus ${transitionWay.sourceLabel} geht ${transitionWay.targetLabel} hervor.`}</span>
          </div>
          <p>Getragen von: {transitionWay.stations.slice(1, -1).map((station) => station.label).join(" - ")}</p>
          <RoomTransitionWayInline way={transitionWay} />
        </>
      ) : (
        <>
          <p>In dieser Spur: {journey.title}</p>
          {previousStep || nextStep ? (
            <div>
              {previousStep ? <span>Vorher sichtbar: {previousStep.label}</span> : null}
              {nextStep ? <span>Danach leuchtet: {nextStep.label}</span> : null}
            </div>
          ) : null}
          {preparesLabels || remembersLabels ? (
            <div className="symbol-inspector-room-movement">
              {preparesLabels ? <span>Bereitet vor: {preparesLabels.target}</span> : null}
              {remembersLabels ? <span>Erinnert an: {remembersLabels.source}</span> : null}
            </div>
          ) : null}
        </>
      )}
      <div>
        <Link href={SYMBOL_JOURNEY_OVERVIEW_HREF}>Spur in Mein Pfad öffnen</Link>
        <Link href={step.roomHref}>Den Raum dieser Spur betreten</Link>
      </div>
      {!transitionWay && hebrewMovement ? <InspectorHebrewMovement movement={hebrewMovement} /> : null}
    </div>
  );
}

function SymbolLensFocusDetail({
  activeSymbol,
  connectedPaths,
  lensData,
  activeResonanceLens,
  activeInspectorFocus,
  activeCodexEntry,
  codexHref,
  roomHref,
  detailHierarchyChildren,
  storyDeepHierarchyAnchors,
  verseDeepHierarchyAnchors,
  searchResonanceGroup,
  showResonanceJourneyOption,
  discoverableResonanceJourney,
  onSelectFocus,
  onPreviewPath,
  onActivateResonanceJourney,
  onFocusSubspace,
}: {
  activeSymbol: SymbolMeaningNetworkNode;
  connectedPaths: SymbolMeaningPath[];
  lensData: SymbolLensData;
  activeResonanceLens: SymbolLensMode | null;
  activeInspectorFocus: SymbolInspectorFocus | null;
  activeCodexEntry?: CodexEntry;
  codexHref?: string;
  roomHref: string;
  detailHierarchyChildren: SymbolHierarchyEntry[];
  storyDeepHierarchyAnchors: SymbolHierarchyEntry[];
  verseDeepHierarchyAnchors: SymbolHierarchyEntry[];
  searchResonanceGroup: SearchResonanceGroupItem[];
  showResonanceJourneyOption: boolean;
  discoverableResonanceJourney?: ResonanceJourney;
  onSelectFocus: (focus: SymbolInspectorFocus) => void;
  onPreviewPath: (path: SymbolMeaningPath) => void;
  onActivateResonanceJourney: (journeyId: string) => void;
  onFocusSubspace: (entryId: string) => void;
}) {
  const profile = getSymbolHebrewProfile(activeSymbol.id);
  const hebrewWord = profile.hebrewWord;
  const meaningItems = network.meaningLinks
    .filter((link) => link.symbolId === activeSymbol.id)
    .slice(0, 3)
    .map((link) => getMeaningNodeLabel(link.meaningId));
  const hebrewLettersText = profile.letters.map((letter) => letter.name).join(" - ");
  const uniqueLetters = getUniqueHebrewLettersForLens(activeSymbol.id);
  const storyJourney = getJourneysForNode(activeSymbol.id)[0];
  const storyConnections = getStoryConnectionsForLens(activeSymbol.id);
  const narrativePath = storyJourney?.nodePath.map(getSymbolLabel).join(" -> ");
  const hebrew = hebrewWord?.hebrew ?? activeSymbol.hebrew;
  const gematria = hebrew ? calculateGematria(hebrew) : 0;
  const activeLabel = activeInspectorFocus
    ? {
      meaning: "Bedeutung",
      hebrew: "Hebräisch",
      gematria: "Zahl",
      story: "Erzählspur",
      subspaces: "Unterräume",
      codex: "Codex",
      room: "Raum",
    }[activeInspectorFocus]
    : activeResonanceLens
      ? SYMBOL_LENS_MODE_LABELS[activeResonanceLens]
      : null;
  const firstSearchResonance = searchResonanceGroup[0];
  const firstSearchPath = firstSearchResonance
    ? connectedPaths.find((path) =>
      (path.from === firstSearchResonance.sourceId && path.to === firstSearchResonance.targetId)
      || (path.from === firstSearchResonance.targetId && path.to === firstSearchResonance.sourceId),
    )
    : undefined;
  const subspaceEntries = detailHierarchyChildren.slice(0, 5);
  const storyAnchor = storyDeepHierarchyAnchors[0] ?? verseDeepHierarchyAnchors[0];
  const ontologyRows = useMemo(() => getInspectorOntologyRows(activeSymbol.id), [activeSymbol.id]);
  const hebrewMovement = getRoomHebrewMovement(activeSymbol.id);
  const isWater = activeSymbol.id === "wasser";
  const waterBridge = getSymbolPathConfig("wasser");
  const memCodexHref = "/codex/mem?from=symbolnetz&symbol=wasser&focus=hebrew&lens=hebrew";
  const waterCodexHref = codexHref ?? `${waterBridge?.codexHref ?? "/codex/wasser"}?from=symbolnetz&symbol=wasser&focus=overview`;
  const number40CodexHref = "/codex/zahl-40?from=symbolnetz&symbol=wasser&focus=gematria&lens=gematria";
  const number90CodexHref = "/codex/zahl-90?from=symbolnetz&symbol=wasser&focus=gematria&lens=gematria";
  const [activeOntologyRelationId, setActiveOntologyRelationId] = useState<string | null>(null);
  const visibleActiveOntologyRelationId = ontologyRows.some((row) => row.relation.id === activeOntologyRelationId)
    ? activeOntologyRelationId
    : null;

  const toggleOntologyRelation = useCallback((relationId: string) => {
    setActiveOntologyRelationId((currentRelationId) => currentRelationId === relationId ? null : relationId);
  }, []);

  return (
    <>
      <div className="symbol-inspector-head">
        <p className="symbol-breathe font-serif text-6xl leading-none text-gold/90" lang="he" dir="rtl">{activeSymbol.hebrew}</p>
        <h2 className="font-serif text-3xl italic text-foreground-strong">{activeSymbol.label}</h2>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8d1c2]/50">{activeSymbol.transliteration}</p>
        <p className="symbol-copy text-base">{activeSymbol.shortMeaning}</p>
        {isWater ? (
          <p className="symbol-first-entry-note">Erster Eintritt: Wasser</p>
        ) : null}
        {activeLabel ? (
          <p className="symbol-inspector-current">
            <span>Aktiver Fokus</span>
            <strong>{activeLabel}</strong>
          </p>
        ) : null}
      </div>
      <SymbolJourneyInspectorNotice symbolId={activeSymbol.id} />

      <div className="symbol-inspector-accordion" aria-label={`${activeSymbol.label} vertiefen`}>
        <section className={activeInspectorFocus === "meaning" ? "is-open" : ""}>
          <button type="button" onClick={() => onSelectFocus("meaning")} aria-expanded={activeInspectorFocus === "meaning"}>
            Bedeutung vertiefen
          </button>
          {activeInspectorFocus === "meaning" ? (
            <div className="symbol-inspector-accordion__content">
              {isWater ? (
                <>
                  <InspectorLeitsatz>{INSPECTOR_GUIDING_LINES.meaning}</InspectorLeitsatz>
                  <h3>Was Wasser öffnet</h3>
                  <p>Wasser führt im Symbolraum nicht nur nach unten, sondern an Übergänge: vom Ursprung zur Reinigung, von der Tiefe zum Leben.</p>
                  <InspectorStationList stations={WATER_MEANING_STATIONS} />
                  <InspectorCtaList ctas={[
                    { label: waterBridge?.ctaLabels.codex ?? "Wasser im Codex lesen", href: waterCodexHref },
                  ]} />
                </>
              ) : (
                <>
                  <InspectorLeitsatz>{meaningItems.join(" - ") || lensData.labels.meaning || activeSymbol.shortMeaning}</InspectorLeitsatz>
                  <p>{activeSymbol.shortMeaning}</p>
                  <OntologyResonanceRows
                    rows={ontologyRows}
                    activeOntologyRelationId={visibleActiveOntologyRelationId}
                    onToggleRelation={toggleOntologyRelation}
                  />
                </>
              )}
              {firstSearchResonance && firstSearchPath ? (
                <button type="button" onClick={() => onPreviewPath(firstSearchPath)} className="symbol-focus-path">
                  <span>{getSymbolLabel(firstSearchResonance.sourceId)} - {getSymbolLabel(firstSearchResonance.targetId)}</span>
                  <i>{firstSearchResonance.text}</i>
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className={activeInspectorFocus === "hebrew" ? "is-open" : ""}>
          <button type="button" onClick={() => onSelectFocus("hebrew")} aria-expanded={activeInspectorFocus === "hebrew"}>
            Hebräisch entdecken
          </button>
          {activeInspectorFocus === "hebrew" ? (
            <div className="symbol-inspector-accordion__content">
              {isWater ? (
                <>
                  <InspectorLeitsatz>{INSPECTOR_GUIDING_LINES.hebrew}</InspectorLeitsatz>
                  <h3>Das hebräische Wort</h3>
                  <p lang="he" dir="rtl">{hebrewWord?.hebrew ?? activeSymbol.hebrew}</p>
                  <p>{hebrewWord?.transliteration ?? activeSymbol.transliteration}</p>
                  <p>Mem – Jod – Mem</p>
                  <p>Wasser beginnt und endet mit Mem. In der Mitte steht Jod – ein kleiner Punkt von Richtung, Same oder Ursprung.</p>
                  <InspectorStationList stations={WATER_HEBREW_STATIONS} />
                  <p className="symbol-kicker text-cyan-soft">Nahe hebräische Resonanz</p>
                  <HebrewResonanceLinks symbolId={activeSymbol.id} excludeWordId={hebrewWord?.id} />
                  {hebrewMovement ? <InspectorHebrewMovement movement={hebrewMovement} /> : null}
                  <InspectorCtaList ctas={[
                    { label: "Mem im Codex lesen", href: memCodexHref },
                    { label: waterBridge?.ctaLabels.codex ?? "Wasser im Codex lesen", href: waterCodexHref },
                  ]} />
                </>
              ) : (
                <>
                  <InspectorLeitsatz>{hebrewLettersText || "Das Wort öffnet seine Buchstaben als innere Bewegung."}</InspectorLeitsatz>
                  <p lang="he" dir="rtl">{hebrewWord?.hebrew ?? activeSymbol.hebrew}</p>
                  <p>{hebrewWord?.transliteration ?? activeSymbol.transliteration}</p>
                  <p>{hebrewLettersText || uniqueLetters.map((letter) => letter.name).join(" - ") || "Buchstaben noch nicht hinterlegt"}</p>
                  <p className="symbol-kicker text-cyan-soft">Wörter im selben Bedeutungsfeld</p>
                  <HebrewResonanceLinks symbolId={activeSymbol.id} excludeWordId={hebrewWord?.id} />
                  {hebrewMovement ? <InspectorHebrewMovement movement={hebrewMovement} /> : null}
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className={activeInspectorFocus === "gematria" ? "is-open" : ""}>
          <button type="button" onClick={() => onSelectFocus("gematria")} aria-expanded={activeInspectorFocus === "gematria"}>
            Zahl / Gematria ansehen
          </button>
          {activeInspectorFocus === "gematria" ? (
            <div className="symbol-inspector-accordion__content">
              {isWater ? (
                <>
                  <InspectorLeitsatz>{INSPECTOR_GUIDING_LINES.gematria}</InspectorLeitsatz>
                  <h3>Zahlbewegung von Majim</h3>
                  <p><span lang="he" dir="rtl">{hebrewWord?.hebrew ?? activeSymbol.hebrew}</span> = Mem 40 + Jod 10 + Mem 40 = 90</p>
                  <p>Die Zahl 90 sammelt die Bewegung von Tiefe – Punkt – Tiefe. Wasser erscheint hier als Raum, in dem Ursprung verborgen liegt und Leben vorbereitet wird.</p>
                  <InspectorStationList stations={WATER_GEMATRIA_STATIONS} />
                  <InspectorCtaList ctas={[
                    { label: "Zahl 40 im Codex lesen", href: number40CodexHref },
                    { label: "Zahl 90 im Codex lesen", href: number90CodexHref },
                  ]} />
                </>
              ) : (
                <>
                  <InspectorLeitsatz>Die Zahl zeigt die verborgene Struktur des Wortes.</InspectorLeitsatz>
                  <p>{gematria > 0 ? `${gematria}` : "Noch kein Zahlenwert hinterlegt"}</p>
                  <p>{profile.letters.slice(0, 3).map((letter) => `${letter.numericValue} als ${letter.name}-Resonanz`).join(" / ")}</p>
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className={activeInspectorFocus === "story" ? "is-open" : ""}>
          <button type="button" onClick={() => onSelectFocus("story")} aria-expanded={activeInspectorFocus === "story"}>
            Erzählspur öffnen
          </button>
          {activeInspectorFocus === "story" ? (
            <div className="symbol-inspector-accordion__content">
              {isWater ? (
                <>
                  <InspectorLeitsatz>{INSPECTOR_GUIDING_LINES.story}</InspectorLeitsatz>
                  <h3>Vom Ursprung zur Erfüllung</h3>
                  <p className="font-serif text-base italic text-gold/80">Wasser <span className="text-gold/55">→</span> Wüste <span className="text-gold/55">→</span> Brot</p>
                  <InspectorStationList stations={WATER_STORY_STATIONS} numbered />
                  <p>Die Erzählspur zeigt keine bloße Verbindung, sondern eine Bewegung: Was in der Tiefe beginnt, wird durch Entzug geprüft und als Gabe empfangen.</p>
                </>
              ) : (
                <>
                  <InspectorLeitsatz>Die Spur zeigt eine Bewegung, nicht nur eine Verbindung.</InspectorLeitsatz>
                  {narrativePath ? <p className="font-serif text-base italic text-gold/80">{narrativePath}</p> : null}
                  {storyJourney ? <p>{storyJourney.title}</p> : storyConnections[0] ? <p>{storyConnections[0].title}</p> : null}
                  {storyAnchor ? <p>{storyAnchor.title}</p> : null}
                </>
              )}
              {showResonanceJourneyOption && discoverableResonanceJourney ? (
                <button type="button" onClick={() => onActivateResonanceJourney(discoverableResonanceJourney.id)} className="symbol-archive-action">
                  Resonanzspur öffnen
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className={activeInspectorFocus === "subspaces" ? "is-open" : ""}>
          <button type="button" onClick={() => onSelectFocus("subspaces")} aria-expanded={activeInspectorFocus === "subspaces"}>
            Unterräume ansehen
          </button>
          {activeInspectorFocus === "subspaces" ? (
            <div className="symbol-inspector-accordion__content">
              {subspaceEntries.length > 0 ? (
                <>
                  <InspectorLeitsatz>{isWater ? INSPECTOR_GUIDING_LINES.subspaces : "Die Unterräume machen einzelne Gestalten des Symbols sichtbar."}</InspectorLeitsatz>
                  {isWater ? (
                    <>
                      <h3>Unterräume von Wasser</h3>
                      <p>Die Unterräume zeigen, wie Wasser in verschiedenen Gestalten erscheint: als Ursprung, Tiefe, Weite, Bewegung und himmlische Gabe.</p>
                    </>
                  ) : null}
                  <div className="symbol-inspector-subspace-list">
                    {subspaceEntries.map((entry) => (
                      <button key={entry.id} type="button" onClick={() => onFocusSubspace(entry.id)}>
                        <span>{entry.title}</span>
                        <i>{isWater ? WATER_SUBSPACE_DETAILS[entry.id] ?? entry.summary : entry.summary}</i>
                        <strong>anschauen</strong>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>Keine Unterräume für diesen Fokus sichtbar.</p>
              )}
            </div>
          ) : null}
        </section>

        {activeCodexEntry ? (
          <section className={activeInspectorFocus === "codex" ? "is-open" : ""}>
            <button type="button" onClick={() => onSelectFocus("codex")} aria-expanded={activeInspectorFocus === "codex"}>
              Im Codex lesen
            </button>
            {activeInspectorFocus === "codex" ? (
              <div className="symbol-inspector-accordion__content">
                <p>{activeCodexEntry.subtitle ?? activeCodexEntry.title}</p>
                <Link href={codexHref ?? `/codex/${activeCodexEntry.id}?from=symbolnetz&focus=overview`} className="symbol-archive-action">
                  {isWater ? waterBridge?.ctaLabels.codex ?? "Wasser im Codex lesen" : `${activeCodexEntry.title} im Codex lesen`}
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className={activeInspectorFocus === "room" ? "is-open" : ""}>
          <button type="button" onClick={() => onSelectFocus("room")} aria-expanded={activeInspectorFocus === "room"}>
            Raum betreten
          </button>
          {activeInspectorFocus === "room" ? (
            <div className="symbol-inspector-accordion__content">
              <p>{activeSymbol.label}-Raum</p>
              <RoomTransitionButton href={roomHref} className="symbol-cta w-full">
                {isWater ? waterBridge?.ctaLabels.room ?? "Den Wasserraum betreten" : `${activeSymbol.label}-Raum betreten`}
              </RoomTransitionButton>
            </div>
          ) : null}
        </section>
      </div>

      <SymbolWayTrace symbolId={activeSymbol.id} />
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
  const isWaterJourney = journey.id === CURATED_RESONANCE_JOURNEY_ID;

  return (
    <>
      <h2 className="mt-6 font-serif text-4xl italic text-foreground-strong">{journey.title}</h2>
      <InspectorLeitsatz>{isWaterJourney ? INSPECTOR_GUIDING_LINES.story : "Die Spur zeigt eine Bewegung, nicht nur eine Verbindung."}</InspectorLeitsatz>
      <p className="symbol-copy mt-5 text-lg">
        {isWaterJourney
          ? "Die Erzählspur zeigt keine bloße Verbindung, sondern eine Bewegung: Was in der Tiefe beginnt, wird durch Entzug geprüft und als Gabe empfangen."
          : journey.summary.replace(/\s*\n\s*/g, " ")}
      </p>
      <div className="mt-7 border-t border-white/[0.055] pt-5">
        <p className="symbol-kicker text-cyan-soft">Spurenfolge</p>
        <p className="mt-4 font-serif text-xl italic leading-relaxed text-gold/80">
          <JourneySequence items={journey.nodePath.map(getSymbolLabel)} />
        </p>
        {isWaterJourney ? <InspectorStationList stations={WATER_STORY_STATIONS} numbered /> : null}
      </div>
      <div className="mt-7 border-t border-white/[0.055] pt-5 max-md:hidden">
        <p className="symbol-kicker text-cyan-soft">Begleitende Resonanzen</p>
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

function SymbolWayTrace({
  symbolId,
}: {
  symbolId: string;
}) {
  const way = getPrimaryWayForEntity(symbolId);

  if (!way) return null;

  return (
    <div className="symbol-way-trace mt-7 border-t border-white/[0.055] pt-5">
      <p className="symbol-kicker text-cyan-soft">Wegspur</p>
      <Link href={`/codex/${way.id}?from=symbolnetz&symbol=${symbolId}&focus=story&path=${way.id}`} className="mt-4 block border-l border-gold/25 bg-white/[0.018] px-4 py-3 transition-colors hover:border-gold/45 hover:bg-white/[0.04]">
        <span className="block font-serif text-xl italic text-foreground-strong/90">{way.title}</span>
        {way.movementSteps.length > 0 ? (
          <span className="mt-2 block text-[10px] uppercase tracking-[0.18em] text-gold/70">
            {way.movementSteps.join(" -> ")}
          </span>
        ) : null}
        <span className="symbol-copy mt-2 block text-sm">{way.summary}</span>
        <span className="mt-3 inline-block text-[9px] uppercase tracking-[0.18em] text-cyan-soft/75">
          Weg im Codex lesen
        </span>
      </Link>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HierarchyChildrenDetail({
  entries,
  title,
  className = "",
}: {
  entries: SymbolHierarchyEntry[];
  title: string;
  className?: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div className={`symbol-subspaces mt-7 border-t border-white/[0.055] pt-5 ${className}`}>
      <p className="symbol-kicker text-cyan-soft">{title}</p>
      <div className="mt-4 grid gap-2">
        {entries.map((entry) => (
          <p key={entry.id}>
            <span>{entry.title}</span>
            <i>{entry.summary}</i>
          </p>
        ))}
      </div>
    </div>
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

function LandscapeDisclosureDetail({
  activeSymbol,
  connectedPaths,
  activeCodexEntry,
  codexHref,
  roomHref,
  searchResonanceGroup,
  disclosureLevel,
  onPreviewPath,
  onSelectFocus,
  onActivateResonanceJourney,
  showResonanceJourneyOption,
  discoverableResonanceJourney,
}: {
  activeSymbol: SymbolMeaningNetworkNode;
  connectedPaths: SymbolMeaningPath[];
  activeCodexEntry?: CodexEntry;
  codexHref?: string;
  roomHref: string;
  searchResonanceGroup: SearchResonanceGroupItem[];
  disclosureLevel: LandscapeDisclosureLevel;
  onPreviewPath: (path: SymbolMeaningPath) => void;
  onSelectFocus: (focus: SymbolInspectorFocus) => void;
  onActivateResonanceJourney: (journeyId: string) => void;
  showResonanceJourneyOption: boolean;
  discoverableResonanceJourney?: ResonanceJourney;
}) {
  const profile = getLandscapeDisclosureProfile(activeSymbol);
  const primaryPathIds = getPrimaryFocusPathIds(activeSymbol.id, connectedPaths);
  const primaryPath = connectedPaths.find((path) => primaryPathIds.has(path.id)) ?? connectedPaths[0];
  const supportingPaths = connectedPaths
    .filter((path) => path.id !== primaryPath?.id)
    .slice(0, 3);
  const symbolBridge = getSymbolPathConfig(activeSymbol.id);
  const visibleSearchResonances = searchResonanceGroup.slice(0, 3);

  return (
    <div className="symbol-disclosure" aria-label={`${activeSymbol.label} entfaltet sich`}>
      <div className="symbol-disclosure__voice">
        <p className="symbol-kicker text-cyan-soft">Warum ist dieses Zeichen bedeutsam?</p>
        <p className="symbol-breathe symbol-disclosure__glyph" lang="he" dir="rtl">{activeSymbol.hebrew}</p>
        <h2>{activeSymbol.label}</h2>
        <p className="symbol-disclosure__response">{profile.response}</p>
      </div>

      {disclosureLevel >= 2 ? (
        <div className="symbol-disclosure__layer symbol-disclosure__movement">
          <p className="symbol-kicker text-cyan-soft">Welche Bewegung beginnt hier?</p>
          <div>
            {profile.movement.map((item, index) => (
              <Fragment key={`${item}-${index}`}>
                {index > 0 ? <span aria-hidden="true">&darr;</span> : null}
                <strong>{item}</strong>
              </Fragment>
            ))}
          </div>
          {primaryPath ? (
            <button type="button" onClick={() => onPreviewPath(primaryPath)} className="symbol-focus-path">
              <span>{getSymbolLabel(primaryPath.from)} - {getSymbolLabel(primaryPath.to)}</span>
              <i>{getPathResonanceText(primaryPath, getBridgeForPath(primaryPath), getResonanceConnectionForPath(primaryPath.from, primaryPath.to))}</i>
            </button>
          ) : null}
        </div>
      ) : null}

      {disclosureLevel >= 3 ? (
        <div className="symbol-disclosure__layer">
          <p className="symbol-kicker text-cyan-soft">Welche drei Beziehungen tragen diese Bedeutung?</p>
          <div className="symbol-disclosure__relations">
            {(supportingPaths.length > 0 ? supportingPaths : connectedPaths.slice(0, 3)).map((path) => {
              const neighborId = getOtherSymbolId(path, activeSymbol.id);
              const resonanceConnection = getResonanceConnectionForPath(path.from, path.to);

              return (
                <button key={path.id} type="button" onClick={() => onPreviewPath(path)}>
                  <span>{getSymbolLabel(neighborId)}</span>
                  <i>{getPathResonanceText(path, getBridgeForPath(path), resonanceConnection)}</i>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {disclosureLevel >= 4 ? (
        <div className="symbol-disclosure__layer">
          <p className="symbol-kicker text-cyan-soft">Welche Türen öffnen sich?</p>
          <div className="symbol-disclosure__doors">
            <RoomTransitionButton href={roomHref} className="symbol-cta w-full">
              {symbolBridge?.ctaLabels.room ?? `${activeSymbol.label}-Raum betreten`}
            </RoomTransitionButton>
            {activeCodexEntry ? (
              <Link href={codexHref ?? `/codex/${activeCodexEntry.id}?from=symbolnetz&focus=overview`} className="symbol-cta symbol-cta-secondary">
                {symbolBridge?.ctaLabels.codex ?? `${activeCodexEntry.title} im Codex lesen`}
              </Link>
            ) : null}
            <button type="button" onClick={() => onSelectFocus("story")} className="symbol-archive-action">
              Journey öffnen
            </button>
            <button type="button" onClick={() => onSelectFocus("subspaces")} className="symbol-archive-action">
              Unterräume ansehen
            </button>
            <Link href={SYMBOL_JOURNEY_OVERVIEW_HREF} className="symbol-archive-action">
              Mein Pfad
            </Link>
            {showResonanceJourneyOption && discoverableResonanceJourney ? (
              <button type="button" onClick={() => onActivateResonanceJourney(discoverableResonanceJourney.id)} className="symbol-archive-action">
                Weitere Resonanzen
              </button>
            ) : visibleSearchResonances.length > 0 ? (
              <SearchResonanceGroup
                centerId={activeSymbol.id}
                centerLabel={activeSymbol.label}
                items={visibleSearchResonances}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileSymbolJourney({
  activeSymbol,
  hasSymbolFocus,
  connectedPaths,
  activeCodexEntry,
  codexHref,
  roomHref,
  transitionWay,
  disclosureLevel,
  onFocusSymbol,
}: {
  activeSymbol: SymbolMeaningNetworkNode;
  hasSymbolFocus: boolean;
  connectedPaths: SymbolMeaningPath[];
  activeCodexEntry?: CodexEntry;
  codexHref?: string;
  roomHref: string;
  transitionWay: RoomTransitionWay | null;
  disclosureLevel: LandscapeDisclosureLevel;
  onFocusSymbol: (symbolId: string) => void;
}) {
  const profile = getSymbolHebrewProfile(activeSymbol.id);
  const disclosure = getLandscapeDisclosureProfile(activeSymbol);
  const hebrew = profile.hebrewWord?.hebrew ?? activeSymbol.hebrew;
  const transliteration = profile.hebrewWord?.transliteration ?? activeSymbol.transliteration;
  const gematria = hebrew ? calculateGematria(hebrew) : 0;
  const primaryPathIds = getPrimaryFocusPathIds(activeSymbol.id, connectedPaths);
  const closeRelations = connectedPaths
    .filter((path) => !primaryPathIds.has(path.id))
    .slice(0, MOBILE_SYMBOL_RELATION_LIMIT);
  const symbolBridge = getSymbolPathConfig(activeSymbol.id);
  const gateSymbols = MOBILE_GATE_SYMBOL_IDS.flatMap((symbolId) => {
    const node = network.nodes.find((candidate) => candidate.id === symbolId);
    return node ? [node] : [];
  });

  if (!hasSymbolFocus) {
    return (
      <section className="symbol-mobile-guide md:hidden" aria-label="Mobile Symbolreise">
        <p className="symbol-kicker text-cyan-soft">Erster Eintritt</p>
        <h2>Die Landschaft liegt offen.</h2>
        <p className="symbol-copy mt-3 text-sm">Wasser liegt nah. Andere Räume warten weiter draussen.</p>
        <div className="symbol-mobile-gates">
          {gateSymbols.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`symbol-mobile-gate symbol-mobile-gate--${node.id}`}
              onClick={() => onFocusSymbol(node.id)}
            >
              <span className="symbol-mobile-gate__hebrew" lang="he" dir="rtl">{node.hebrew}</span>
              <span className="symbol-mobile-gate__title">{node.label}</span>
              <span className="symbol-mobile-gate__meaning">{node.shortMeaning}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="symbol-mobile-focus md:hidden" aria-label={`${activeSymbol.label} im mobilen Symbolnetz`}>
      <p className="symbol-kicker text-cyan-soft">Symbol-Fokus</p>
      <div className="symbol-mobile-focus__head">
        <p className="symbol-mobile-focus__hebrew" lang="he" dir="rtl">{hebrew}</p>
        <div>
          <h2>{activeSymbol.label}</h2>
          <p>{[transliteration, gematria > 0 ? `${gematria}` : null].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <p className="symbol-mobile-focus__essence">{disclosure.response}</p>

      {disclosureLevel >= 2 ? (
        <div className="symbol-mobile-movement">
          <p>{transitionWay ? "Welcher Weg beginnt hier?" : "Welche Bewegung beginnt hier?"}</p>
          {transitionWay ? (
            <MobileRoomTransitionWay way={transitionWay} />
          ) : (
            <div>
              {disclosure.movement.map((item, index) => (
                <Fragment key={`${item}-${index}`}>
                  {index > 0 ? <span aria-hidden="true">&darr;</span> : null}
                  <strong>{item}</strong>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {disclosureLevel >= 3 && closeRelations.length > 0 ? (
        <div className="symbol-mobile-relations">
          <p>Drei tragende Beziehungen</p>
          <ul>
            {closeRelations.map((path) => {
              const neighborId = getOtherSymbolId(path, activeSymbol.id);

              return (
                <li key={path.id}>
                  <span>{getSymbolLabel(neighborId)}</span>
                  <i>{path.summary}</i>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {disclosureLevel >= 4 ? <div className="symbol-mobile-actions">
        <RoomTransitionButton href={roomHref} className="symbol-cta">
          {symbolBridge?.ctaLabels.room ?? `${activeSymbol.label}-Raum betreten`}
        </RoomTransitionButton>
        {activeCodexEntry ? (
          <Link href={codexHref ?? `/codex/${activeCodexEntry.id}?from=symbolnetz&focus=overview`} className="symbol-cta symbol-cta-secondary">
            Im Codex vertiefen
          </Link>
        ) : null}
      </div> : null}
    </section>
  );
}

export default function SymbolNetwork({ initialUrlState = {} }: { initialUrlState?: SymbolNetworkInitialUrlState }) {
  const initialSymbolNetworkState = getInitialSymbolNetworkState(initialUrlState);
  const [activeSymbolId, setActiveSymbolId] = useState(initialSymbolNetworkState.activeSymbolId);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocusSymbolId, setSearchFocusSymbolId] = useState<string | null>(null);
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);
  const [hasSymbolFocus, setHasSymbolFocus] = useState(initialSymbolNetworkState.hasSymbolFocus);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [pendingPathId, setPendingPathId] = useState<string | null>(null);
  const [travelingPathId, setTravelingPathId] = useState<string | null>(null);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isLetterResonanceOpen, setIsLetterResonanceOpen] = useState(false);
  const [activeLetterResonanceId, setActiveLetterResonanceId] = useState<MeaningNodeId | null>(null);
  const [activeLetterSourcePathId, setActiveLetterSourcePathId] = useState<string | null>(null);
  const [activeResonanceLens, setActiveResonanceLens] = useState<SymbolLensMode | null>(initialSymbolNetworkState.activeResonanceLens);
  const [activeInspectorFocus, setActiveInspectorFocus] = useState<SymbolInspectorFocus | null>(null);
  const [landscapeDisclosureLevel, setLandscapeDisclosureLevel] = useState<LandscapeDisclosureLevel>(initialSymbolNetworkState.hasSymbolFocus ? 4 : 1);
  const [activeJourneyStepId, setActiveJourneyStepId] = useState<string | null>(initialSymbolNetworkState.activeJourneyStepId);
  const [activeResonanceJourneyId, setActiveResonanceJourneyId] = useState<string | null>(initialSymbolNetworkState.activeResonanceJourneyId);
  const [activeSubspaceId, setActiveSubspaceId] = useState<string | null>(null);
  const [symbolViewportMode, setSymbolViewportMode] = useState<SymbolViewportMode>("overview");
  const [flowViewport, setFlowViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [personalWay, setPersonalWay] = useState<PersonalWay | null>(null);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { isEntering } = useRoomTransition();
  const searchSuggestions = useMemo(() => getSymbolSearchSuggestions(searchQuery), [searchQuery]);
  const hasSearchInput = normalizeSymbolSearchTerm(searchQuery).length > 0;
  const showSearchSuggestions = isSearchSuggestionsOpen && hasSearchInput;
  const activeSymbol = network.nodes.find((node) => node.id === activeSymbolId) ?? network.nodes[0];
  const activeRoomTransition = hasSymbolFocus ? getRoomTransition(activeSymbolId) : undefined;
  const activeRoomTransitionWay = hasSymbolFocus ? getRoomTransitionWay(activeSymbolId) : null;
  const activeRoomTransitionPathKey = activeRoomTransition
    ? getPathKey(activeRoomTransition.sourceRoom, activeRoomTransition.targetRoom)
    : null;
  const activeCodexEntry = getCodexEntry(activeSymbol.id);
  const activeCodexHref = activeCodexEntry
    ? buildSymbolNetworkCodexHref({
        entryId: activeCodexEntry.id,
        symbolId: activeSymbol.id,
        activeInspectorFocus,
        activeResonanceLens,
        activeResonanceJourneyId,
      })
    : undefined;

  useEffect(() => {
    function refreshPersonalWay() {
      setPersonalWay(derivePersonalWay());
    }

    refreshPersonalWay();

    window.addEventListener("storage", refreshPersonalWay);
    window.addEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshPersonalWay);

    return () => {
      window.removeEventListener("storage", refreshPersonalWay);
      window.removeEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshPersonalWay);
    };
  }, []);
  const activeRoomHref = buildSymbolNetworkRoomHref({
    roomHref: activeSymbol.roomHref,
    symbolId: activeSymbol.id,
    activeInspectorFocus,
    activeResonanceLens,
    activeResonanceJourneyId,
  });

  const activeDetailHierarchyChildren = useMemo(() => getDetailHierarchyChildren(activeSymbolId), [activeSymbolId]);
  const activeDeepHierarchyAnchors = useMemo(() => getExistingDeepHierarchyAnchors(activeSymbolId), [activeSymbolId]);
  const activeStoryDeepHierarchyAnchors = useMemo(() => getStoryDeepHierarchyAnchors(activeSymbolId), [activeSymbolId]);
  const activeVerseDeepHierarchyAnchors = useMemo(() => getVerseDeepHierarchyAnchors(activeSymbolId), [activeSymbolId]);
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
    ? getJourneysForNode(activeSymbolId).find((journey) => journey.id === (DISCOVERABLE_RESONANCE_JOURNEY_IDS[activeSymbolId] ?? CURATED_RESONANCE_JOURNEY_ID))
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
      const connection = CURATED_RESONANCE_VISUAL_CONNECTIONS.find((item) => item.id === connectionId)
        ?? resonanceConnections.find((item) => item.id === connectionId);
      return connection ? [connection] : [];
    })
    : [];
  const activeResonancePrimaryConnections = activeResonanceJourney?.id === CURATED_RESONANCE_JOURNEY_ID
    ? activeResonanceJourneyConnections.filter((connection) => CURATED_RESONANCE_PRIMARY_CONNECTION_IDS.includes(connection.id))
    : activeResonanceJourneyConnections;
  const activeResonanceSecondaryConnections = activeResonanceJourney?.id === CURATED_RESONANCE_JOURNEY_ID
    ? activeResonanceJourneyConnections.filter((connection) => CURATED_RESONANCE_SECONDARY_CONNECTION_IDS.includes(connection.id))
    : [];
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
  const activeRoomTransitionInscriptionPosition = useMemo(() => {
    if (!activeRoomTransition || activePath || activeJourney || activeResonanceJourney || activeLetterId || activeResonanceLens) return null;

    const sourceCenter = getNodeCenter(activeRoomTransition.sourceRoom);
    const targetCenter = getNodeCenter(activeRoomTransition.targetRoom);

    return {
      x: ((sourceCenter.x + targetCenter.x) / 2) * flowViewport.zoom + flowViewport.x,
      y: (((sourceCenter.y + targetCenter.y) / 2) - 54) * flowViewport.zoom + flowViewport.y,
    };
  }, [activeJourney, activeLetterId, activePath, activeResonanceJourney, activeResonanceLens, activeRoomTransition, flowViewport.x, flowViewport.y, flowViewport.zoom]);
  const connectedPaths = useMemo(
    () => network.paths.filter((path) => path.from === activeSymbolId || path.to === activeSymbolId),
    [activeSymbolId],
  );
  const primaryFocusPathIds = useMemo(
    () => getPrimaryFocusPathIds(activeSymbolId, connectedPaths),
    [activeSymbolId, connectedPaths],
  );
  const visibleOntologyResonanceConnections = useMemo(
    () => symbolViewportMode === "overview" ? [] : getVisibleOntologyConnectionsForActiveEntity(activeSymbolId),
    [activeSymbolId, symbolViewportMode],
  );
  const searchResonanceGroup = useMemo(
    () => searchFocusSymbolId === activeSymbolId ? getSearchResonanceGroup(activeSymbolId) : [],
    [activeSymbolId, searchFocusSymbolId],
  );

  useEffect(() => {
    if (!hasSymbolFocus || activePathId || activeJourneyId || activeResonanceJourneyId || activeLetterId || activeResonanceLens || activeInspectorFocus) {
      const timer = window.setTimeout(() => setLandscapeDisclosureLevel(4), 0);
      return () => window.clearTimeout(timer);
    }

    const timers = [
      window.setTimeout(() => setLandscapeDisclosureLevel(2), 960),
      window.setTimeout(() => setLandscapeDisclosureLevel(3), 1960),
      window.setTimeout(() => setLandscapeDisclosureLevel(4), 3180),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activeInspectorFocus, activeJourneyId, activeLetterId, activePathId, activeResonanceJourneyId, activeResonanceLens, activeSymbolId, hasSymbolFocus]);

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
  const inspectorSymbolLensData = useMemo(
    () => activeSymbolLensData ?? getSymbolLensData(activeSymbol.id),
    [activeSymbol.id, activeSymbolLensData],
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
        ? [{ kind: "number", value: wordValue, label: profile.hebrewWord?.transliteration ?? symbol?.transliteration ?? "Wort", note: "Zahlenwert des hebräischen Wortes" }]
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
    : activeInspectorFocus || activeResonanceLens
      ? "Info"
      : isSymbolLensVisible
        ? "Resonanz"
        : hasSymbolFocus || activeLetterId
        ? "Symbol"
        : "Übersicht";
  const hasTransientBackState = Boolean(
    activeResonanceLens
    || activeInspectorFocus
    || activeResonanceJourneyId
    || activeJourneyId
    || activePathId
    || activeLetterId
    || isLetterResonanceOpen
    || searchFocusSymbolId,
  );
  const canNavigateBack = hasTransientBackState || hasSymbolFocus || symbolViewportMode !== "overview";
  const isArrivalMoment = !hasSymbolFocus && !hasTransientBackState && symbolViewportMode === "overview";
  const breadcrumbItems = useMemo(() => {
    const items = ["Übersicht"];

    if (hasSymbolFocus || hasTransientBackState || symbolViewportMode !== "overview") {
      items.push(activeSymbol.label);
    }

    if (activeResonanceLens) {
      items.push(SYMBOL_LENS_MODE_LABELS[activeResonanceLens]);
    } else if (activeInspectorFocus) {
      items.push({
        meaning: "Bedeutung",
        hebrew: "Hebräisch",
        gematria: "Zahl",
        story: "Erzählspur",
        subspaces: "Unterräume",
        codex: "Codex",
        room: "Raum",
      }[activeInspectorFocus]);
    } else if (activeResonanceJourney) {
      items.push("Resonanzspur");
    } else if (activeJourney) {
      items.push("Spur");
    } else if (activePath) {
      items.push("Beziehung");
    } else if (activeCodexLetter) {
      items.push("Hebräisch");
    } else if (symbolViewportMode !== "overview") {
      items.push(SYMBOL_VIEWPORT_LABELS[symbolViewportMode]);
    }

    return items;
  }, [
    activeCodexLetter,
    activeJourney,
    activePath,
    activeResonanceJourney,
    activeResonanceLens,
    activeInspectorFocus,
    activeSymbol.label,
    hasSymbolFocus,
    hasTransientBackState,
    symbolViewportMode,
  ]);
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
        ...(activeRoomTransition ? [activeRoomTransition.targetRoom] : []),
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
  }, [activeLensMeaningIds, activeLetterId, activeLetterNodeId, activePathFrom, activePathTo, activeRoomTransition, activeSymbolId, connectedPaths, graphViewMode, isJourneyFocus, isSymbolLensVisible, journeyFocusNodeIds, journeyStepId, letterSymbolIds]);

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
        instance.setCenter(center.x, center.y, { zoom: isSymbolLensVisible ? 1.04 : 0.84, duration: 1040 });
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
  const touchedSymbolIds = useMemo(() => new Set(personalWay?.touchedSymbols ?? []), [personalWay]);
  const familiarSymbolIds = useMemo(() => new Set(personalWay?.familiarSymbols ?? []), [personalWay]);
  const nodes = useMemo<Node<SymbolNodeData | MeaningNodeData | LetterNodeData | NumberNodeData | HierarchyNodeData>[]>(
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
                arrivalPresence: undefined,
                isTouchedOnWay: touchedSymbolIds.has(node.id),
                isFamiliarOnWay: familiarSymbolIds.has(node.id),
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
        ...(activeRoomTransition ? [activeRoomTransition.targetRoom] : []),
        ...connectedPaths.flatMap((path) => [path.from, path.to]),
        ...Array.from(activeLensSymbolIds),
      ]);
      const shouldShowDetailHierarchy = activeDetailHierarchyChildren.length > 0
        && (symbolViewportMode === "detail" || symbolViewportMode === "deep")
        && (!activeResonanceLens || activeResonanceLens === "meaning");
      const shouldShowDeepHierarchy = shouldShowDetailHierarchy
        && symbolViewportMode === "deep"
        && activeDeepHierarchyAnchors.length > 0;
      const visibleSymbolIds = new Set(
        symbolViewportMode === "overview"
          ? overviewSymbolIds
          : symbolViewportMode === "focus"
            ? Array.from(focusSymbolIds)
            : symbolViewportMode === "detail"
              ? Array.from(focusSymbolIds)
              : Array.from(focusSymbolIds),
      );
      const visibleSymbolNodes = network.nodes.filter((node) => visibleSymbolIds.has(node.id));
      const semanticSymbolNodes = visibleSymbolNodes.length > 0 ? visibleSymbolNodes : network.nodes;
      const showMeaningNodes = symbolViewportMode !== "overview"
        && Boolean(activePathId || isJourneyFocus || activeLensMeaningIds.size > 0);
      const shouldStageArrival = !hasGraphDisclosure && symbolViewportMode === "overview";
      const hierarchyNodes = [
        ...(shouldShowDetailHierarchy ? activeDetailHierarchyChildren.map((entry) => ({ entry, isDeepAnchor: false })) : []),
        ...(shouldShowDeepHierarchy ? activeDeepHierarchyAnchors.map((entry) => ({ entry, isDeepAnchor: true })) : []),
      ];
      const hierarchyNodeIds = new Set(hierarchyNodes.map(({ entry }) => entry.id));
      const activeJourneyCodexNodes = activeResonanceJourney
        ? activeResonanceJourney.nodePath
          .filter((nodeId) => !visibleSymbolIds.has(nodeId) && !hierarchyNodeIds.has(nodeId))
          .map((nodeId) => {
            const hierarchyEntry = getHierarchyEntry(nodeId);

            return {
              id: nodeId,
              type: "hierarchy" as const,
              position: getNodePosition(nodeId),
              selectable: false,
              data: {
                kind: "hierarchy" as const,
                title: getSymbolLabel(nodeId),
                summary: getSymbolNetworkNodeSummary(nodeId),
                level: hierarchyEntry?.level ?? "meta",
                isDeepAnchor: Boolean(hierarchyEntry && DEEP_HIERARCHY_LEVELS.has(hierarchyEntry.level)),
                isHighlighted: activeJourneyStepId === nodeId,
              },
            };
          })
        : [];

      return [
        ...semanticSymbolNodes.map((node) => {
          const isActiveSymbol = activeLetterId
            ? letterSymbolIds.has(node.id)
            : isJourneyFocus
              ? journeyFocusSymbolIds.has(node.id)
                : activePathId
                ? relationSymbolIds.has(node.id)
                : hasSymbolFocus && node.id === activeSymbolId;
          const transitionRole: SymbolNodeData["transitionRole"] = activeRoomTransition && !activePathId && !activeJourney && !activeResonanceJourney && !activeLetterId
            ? node.id === activeRoomTransition.sourceRoom
              ? "source"
              : node.id === activeRoomTransition.targetRoom
                ? activeRoomTransition.sourceRoom === "brot" && activeRoomTransition.targetRoom === "wasser"
                  ? "cycle-horizon"
                  : "horizon"
                : undefined
            : undefined;
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
                  : Boolean(transitionRole) || relatedIds.has(node.id),
              isDimmed: activeLetterId
                ? !letterSymbolIds.has(node.id)
                : isJourneyFocus
                  ? !journeyFocusSymbolIds.has(node.id)
                  : activePathId
                    ? !relationSymbolIds.has(node.id)
                  : isSymbolLensVisible
                    ? !activeLensSymbolIds.has(node.id)
                    : hasGraphDisclosure && node.id !== disclosureSymbolId && !transitionRole && !relatedIds.has(node.id),
              showActions: (isActiveSymbol || isPreviewedSymbol) && !isSymbolLensVisible,
              activeLens: isSymbolLensVisible && node.id === activeSymbolId ? activeResonanceLens : null,
              lensLabel,
              lensNote: undefined,
              emergenceIndex: activeLetterId && letterSymbolIds.has(node.id) ? letterSymbols.findIndex((symbol) => symbol.id === node.id) : undefined,
              arrivalPresence: shouldStageArrival ? SYMBOL_ARRIVAL_PRESENCE[node.id] : undefined,
              transitionRole,
              isTouchedOnWay: touchedSymbolIds.has(node.id),
              isFamiliarOnWay: familiarSymbolIds.has(node.id),
            },
          };
        }),
        ...hierarchyNodes.map(({ entry, isDeepAnchor }) => ({
          id: entry.id,
          type: "hierarchy",
          position: getNodePosition(entry.id),
          selectable: false,
          data: {
            kind: "hierarchy" as const,
            title: entry.title,
            summary: entry.summary,
            level: entry.level,
            isDeepAnchor,
            isHighlighted: activeSubspaceId === entry.id,
          },
        })),
        ...activeJourneyCodexNodes,
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
    [activeCodexLetter, activeDeepHierarchyAnchors, activeDetailHierarchyChildren, activeJourneyStepId, activeLensHebrewLetters, activeLensHebrewSymbolIds, activeLensMeaningIds, activeLensNumbers, activeLensStoryPathKeys, activeResonanceJourney, activeResonanceLens, activeLetterId, activeLetterNodeId, activeJourney, activePathId, activeRoomTransition, activeSubspaceId, activeSymbolId, activeSymbolLensData, connectedPaths, disclosureSymbolId, familiarSymbolIds, hasGraphDisclosure, hasSymbolFocus, isJourneyFocus, isLetterResonanceOpen, isSymbolLensVisible, journeyFocusMeaningIds, journeyFocusSymbolIds, letterMeaningIds, letterResonances, letterSymbolIds, letterSymbols, relatedIds, relationSymbolIds, symbolViewportMode, touchedSymbolIds]
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
        if (activeResonanceJourney) return [];

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
        const isPrimaryFocusPath = isFocused && !activeResonanceLens && primaryFocusPathIds.has(path.id);
        const isSecondaryFocusPath = isFocused && !activeResonanceLens && !primaryFocusPathIds.has(path.id);
        const isActiveRoomTransitionPath = Boolean(
          activeRoomTransitionPathKey
          && pathKey === activeRoomTransitionPathKey
          && hasSymbolFocus
          && !activePath
          && !activeJourney
          && !activeResonanceJourney
          && !activeLetterId
          && !activeResonanceLens,
        );

        if (isSymbolLensVisible && !isLensMeaningPath && !isLensStoryPath && !isLensJourneyPath) return [];
        if (hasSymbolFocus && !activeResonanceLens && !activePath && !isJourneyFocus && !isFocused) return [];

        const relationType: LivingConnectionData["relationType"] = isActiveRoomTransitionPath || isJourneyPath || isLensStoryPath ? "journey" : isLetterPath ? "letter" : "symbol";
        const ports = getConnectionPorts(path.from, path.to);

        return [{
          id: path.id,
          source: path.from,
          target: path.to,
          sourceHandle: ports.sourceHandle,
          targetHandle: ports.targetHandle,
          type: "living",
          className: `${isActiveRoomTransitionPath ? "is-room-transition-path" : isJourneyPath || isLensStoryPath ? "is-journey-path" : isLetterPath ? "is-letter-path" : "is-symbol-path"} ${isActiveRoomTransitionPath || isJourneyPath || isLensStoryPath || isSelected || isLetterPath || isPrimaryFocusPath ? "is-selected-path" : isSecondaryFocusPath ? "is-dormant" : isFocused && !activePath && !isJourneyFocus && !activeLetterId ? "is-awake" : "is-dormant"} ${isTraveling ? "is-traveling-path" : ""}`,
          style: {
            stroke: isActiveRoomTransitionPath
              ? "rgba(224,194,128,0.86)"
              : isJourneyPath || isLensStoryPath
                ? "rgba(189,160,109,0.68)"
              : isLetterPath
                ? "rgba(189,160,109,0.82)"
                : getResonanceStroke(
                  resonanceConnection?.resonanceType,
                  isSelected || isPrimaryFocusPath || isActiveRoomTransitionPath ? "selected" : isSecondaryFocusPath ? "dormant" : isFocused && !activePath && !isJourneyFocus && !activeLetterId ? "focused" : "dormant",
                ),
            strokeWidth: isActiveRoomTransitionPath ? 5.2 : isJourneyPath || isLensStoryPath ? 4.6 : isSelected || isLetterPath || isPrimaryFocusPath ? 2.4 : isSecondaryFocusPath ? 0.45 : isFocused && !activePath && !isJourneyFocus && !activeLetterId ? 1.6 : 0.7,
          },
          data: {
            isTraveling,
            relationType,
            resonanceType: resonanceConnection?.resonanceType,
            isTransitionPath: isActiveRoomTransitionPath,
            routeIndex: index,
            routeOffset: getRouteOffset(index, relationType),
          },
        }];
    }) : []),
    ...(hasEdgeDisclosure && !activeLetterId && symbolViewportMode !== "overview" ? visibleOntologyResonanceConnections.flatMap((connection, index) => {
      if (!renderedNodeIds.has(connection.sourceId) || !renderedNodeIds.has(connection.targetId)) return [];

      const ports = getConnectionPorts(connection.sourceId, connection.targetId);
      const isPattern = connection.resonanceType === "pattern";
      const isThreshold = connection.resonanceType === "threshold";
      const isFocused = connection.sourceId === activeSymbolId || connection.targetId === activeSymbolId;

      return [{
        id: `ontology-edge:${connection.id}`,
        source: connection.sourceId,
        target: connection.targetId,
        sourceHandle: ports.sourceHandle,
        targetHandle: ports.targetHandle,
        type: "living",
        className: `is-symbol-path ${isFocused ? "is-awake" : "is-dormant"}`,
        style: {
          stroke: isThreshold
            ? "rgba(189,160,109,0.42)"
            : isPattern
              ? "rgba(127,184,201,0.24)"
              : "rgba(127,184,201,0.3)",
          strokeDasharray: isPattern ? "3 8" : "4 10",
          strokeWidth: isPattern ? 0.9 : 1.1,
        },
        data: {
          isTraveling: false,
          relationType: "symbol" as const,
          resonanceType: connection.resonanceType,
          routeIndex: network.paths.length + index,
          routeOffset: getRouteOffset(network.paths.length + index, "symbol"),
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
    ...(!activeLetterId ? activeDetailHierarchyChildren.flatMap((entry, index) => {
      if (!renderedNodeIds.has(entry.id) || !renderedNodeIds.has(activeSymbolId)) return [];

      const ports = getConnectionPorts(activeSymbolId, entry.id);

      return [{
        id: `hierarchy:${activeSymbolId}-${entry.id}`,
        source: activeSymbolId,
        target: entry.id,
        sourceHandle: ports.sourceHandle,
        targetHandle: ports.targetHandle,
        type: "living",
        className: "is-meaning-path is-awake",
        style: {
          stroke: "rgba(127,184,201,0.26)",
          strokeWidth: 0.9,
          strokeDasharray: "3 9",
        },
        data: {
          isTraveling: false,
          relationType: "meaning" as const,
          routeIndex: index,
          routeOffset: getRouteOffset(index, "meaning"),
        },
      }];
    }) : []),
    ...(!activeLetterId ? activeDeepHierarchyAnchors.flatMap((entry, index) => {
      const sourceId = entry.parentId && renderedNodeIds.has(entry.parentId) ? entry.parentId : activeSymbolId;
      if (!renderedNodeIds.has(entry.id) || !renderedNodeIds.has(sourceId)) return [];

      const ports = getConnectionPorts(sourceId, entry.id);

      return [{
        id: `hierarchy:${sourceId}-${entry.id}`,
        source: sourceId,
        target: entry.id,
        sourceHandle: ports.sourceHandle,
        targetHandle: ports.targetHandle,
        type: "living",
        className: "is-journey-path",
        style: {
          stroke: "rgba(189,160,109,0.32)",
          strokeWidth: 1.1,
          strokeDasharray: "4 8",
        },
        data: {
          isTraveling: false,
          relationType: "journey" as const,
          routeIndex: index,
          routeOffset: getRouteOffset(index, "journey"),
        },
      }];
    }) : []),
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
    setActiveSubspaceId(null);
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
    setActiveInspectorFocus(null);
    setLandscapeDisclosureLevel(1);
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
    setActiveSubspaceId(null);
    setActiveResonanceLens(nextLens);
    setActiveInspectorFocus(nextLens);
    setLandscapeDisclosureLevel(4);
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

  function selectInspectorFocus(focus: SymbolInspectorFocus) {
    const nextFocus = activeInspectorFocus === focus ? null : focus;
    if (nextFocus !== "subspaces") {
      setActiveSubspaceId(null);
    }
    setActiveInspectorFocus(nextFocus);
    setLandscapeDisclosureLevel(4);
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

    if (nextFocus === "meaning" || nextFocus === "hebrew" || nextFocus === "gematria" || nextFocus === "story") {
      setActiveResonanceLens(nextFocus);
      setActiveJourneyStepId(nextFocus === "story" ? activeSymbolId : null);
      return;
    }

    setActiveResonanceLens(null);
    setActiveJourneyStepId(null);

    if (nextFocus === "subspaces") {
      setSymbolViewport("detail");
    }
  }

  function openLetterBridge(path: SymbolMeaningPath) {
    if (!path.joint) return;

    setActiveSubspaceId(null);
    const didRecordLetter = recordActivatedLetter({
      letterId: path.joint.letterId,
      pathId: path.id,
    });

    if (didRecordLetter) {
      setPersonalWay(derivePersonalWay());
    }

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
    setActiveInspectorFocus(null);
    setActiveJourneyStepId(null);
    setHasSymbolFocus(true);
  }

  function previewPath(path: SymbolMeaningPath) {
    setActiveSubspaceId(null);
    setActiveResonanceLens(null);
    setActiveInspectorFocus(null);
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

    setActiveSubspaceId(null);
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
    setActiveInspectorFocus(null);
  }

  function focusSubspace(entryId: string) {
    const entry = getHierarchyEntry(entryId);
    if (!entry) return;

    setActiveSubspaceId(entry.id);
    setHasSymbolFocus(true);
    setActiveInspectorFocus("subspaces");
    setActiveResonanceLens(null);
    setActiveJourneyStepId(null);
    setActivePathId(null);
    setPendingPathId(null);
    setTravelingPathId(null);
    setActiveJourneyId(null);
    setActiveResonanceJourneyId(null);
    setActiveLetterId(null);
    setIsLetterResonanceOpen(false);
    setActiveLetterResonanceId(null);
    setActiveLetterSourcePathId(null);
    setSymbolViewport("detail");

    const center = getNodeCenter(entry.id);
    reactFlowRef.current?.setCenter(center.x, center.y, { zoom: 1.04, duration: 560 });
    window.setTimeout(() => {
      const instance = reactFlowRef.current;
      if (instance) setFlowViewport(instance.getViewport());
    }, 32);
  }

  function navigateSymbolBack() {
    if (activeInspectorFocus) {
      setActiveInspectorFocus(null);
      if (activeResonanceLens) {
        setActiveResonanceLens(null);
        setActiveJourneyStepId(null);
      }
      return;
    }

    if (activeResonanceLens) {
      setActiveResonanceLens(null);
      setActiveJourneyStepId(null);
      return;
    }

    if (activeResonanceJourneyId) {
      setActiveResonanceJourneyId(null);
      setActiveJourneyStepId(null);
      setSymbolViewport("focus");
      return;
    }

    if (activeJourneyId) {
      setActiveJourneyId(null);
      setActiveJourneyStepId(null);
      setSymbolViewport("focus");
      return;
    }

    if (activePathId) {
      setActivePathId(null);
      setPendingPathId(null);
      setTravelingPathId(null);
      setSymbolViewport("focus");
      return;
    }

    if (isLetterResonanceOpen) {
      setIsLetterResonanceOpen(false);
      setActiveLetterResonanceId(null);
      return;
    }

    if (activeLetterId) {
      setActiveLetterId(null);
      setActiveLetterResonanceId(null);
      setActiveLetterSourcePathId(null);
      setSymbolViewport("focus");
      return;
    }

    if (searchFocusSymbolId) {
      setSearchFocusSymbolId(null);
      setSearchQuery("");
      setIsSearchSuggestionsOpen(false);
      setSymbolViewport("focus");
      return;
    }

    const nextViewport = BACK_VIEWPORT_TARGETS[symbolViewportMode];
    if (nextViewport) {
      setSymbolViewport(nextViewport);
      return;
    }

    if (symbolViewportMode === "focus" || hasSymbolFocus) {
      setHasSymbolFocus(false);
      setActiveJourneyStepId(null);
      setSymbolViewport("overview");
    }
  }

  return (
    <section className={`symbol-page symbol-section symbol-network-page relative min-h-[100svh] ${isArrivalMoment ? "is-arrival-moment" : ""}`}>
      <div className="symbol-network-backdrop fixed inset-0 h-screen min-h-[100svh]">
        <Image src={visualAssets.symbolnetzHero} alt="" fill priority sizes="100vw" className="sacred-drift object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,0.78)_78%,rgba(0,0,0,0.95)_100%)]" />
      </div>

      <div className="symbol-network-shell symbol-fade-in relative z-10 mx-auto grid w-full max-w-[92rem] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,21rem)]">
        <div className="symbol-network-main min-w-0">
          <div className="symbol-network-orientation">
            <p>Symbolnetz</p>
            <span>Wasser liegt nah. Brot wartet in der Mitte. Die anderen Räume stehen in der Ferne.</span>
          </div>

          <MobileSymbolJourney
            activeSymbol={activeSymbol}
            hasSymbolFocus={hasSymbolFocus}
            connectedPaths={connectedPaths}
            activeCodexEntry={activeCodexEntry}
            codexHref={activeCodexHref}
            roomHref={activeRoomHref}
            transitionWay={activeRoomTransitionWay}
            disclosureLevel={landscapeDisclosureLevel}
            onFocusSymbol={focusSymbol}
          />

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
              <span>Aktive Buchstabenspur</span>
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
                  aria-label="Suchvorschläge"
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
            {canNavigateBack ? (
              <div className="symbol-network-back-trace max-md:hidden">
                <button type="button" className="symbol-network-back-button" onClick={navigateSymbolBack}>
                  <span aria-hidden="true">&larr;</span>
                  Zurück
                </button>
                <p className="symbol-network-breadcrumb" aria-label="Aktuelle Position im Symbolnetz">
                  {breadcrumbItems.map((item, index) => (
                    <Fragment key={`${item}-${index}`}>
                      {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
                      <span>{item}</span>
                    </Fragment>
                  ))}
                </p>
              </div>
            ) : null}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              proOptions={reactFlowProOptions}
              fitView
              fitViewOptions={reactFlowFitViewOptions}
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
            {activeRoomTransitionWay && activeRoomTransitionInscriptionPosition ? (
              <p
                key={`${activeSymbolId}-room-transition`}
                className={`symbol-connection-resonance symbol-connection-resonance--room-transition ${activeRoomTransitionWay.isCycleReturn ? "symbol-connection-resonance--cycle" : ""}`}
                style={{
                  left: `${activeRoomTransitionInscriptionPosition.x}px`,
                  top: `${activeRoomTransitionInscriptionPosition.y}px`,
                }}
              >
                {activeRoomTransitionWay.title}
              </p>
            ) : null}
            <div className="symbol-viewport-controls" aria-label="Kartentiefe wählen">
              <button type="button" onClick={() => setSymbolViewport("overview")} aria-label="Übersicht anzeigen">
                <span>Übersicht</span>
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
            {(["Übersicht", "Symbol", "Resonanz", "Info", "Beziehung"] as const).map((layer) => (
              <span key={layer} className={mobileLayerStep === layer ? "is-active" : ""}>
                {layer}
              </span>
            ))}
          </div>
          {canNavigateBack ? (
            <div className="symbol-mobile-back-row md:hidden">
              <button type="button" className="symbol-network-back-button" onClick={navigateSymbolBack}>
                <span aria-hidden="true">&larr;</span>
                Zurück
              </button>
              <p className="symbol-network-breadcrumb" aria-label="Aktuelle Position im Symbolnetz">
                {breadcrumbItems.map((item, index) => (
                  <Fragment key={`${item}-${index}`}>
                    {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
                    <span>{item}</span>
                  </Fragment>
                ))}
              </p>
            </div>
          ) : null}
          {isLensPickerVisible && activeSymbolLensData ? (
            <div className="symbol-mobile-lens-bar md:hidden" aria-label="Resonanz-Linse wählen">
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
              Resonanzspur öffnen
            </button>
          ) : null}
          {activeResonanceJourney ? (
            <div className="mt-4 border-l border-gold/35 pl-4 md:hidden">
              <p className="symbol-kicker text-cyan-soft">Resonanzspur</p>
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

        <aside className={`symbol-detail-panel symbol-archive-fragment self-start p-6 ${isSymbolLensVisible ? "symbol-detail-panel--lens-focus" : ""} ${isArrivalMoment ? "symbol-detail-panel--arrival" : ""}`}>
          <p className="symbol-kicker text-cyan-soft">
            {activeSymbolLensNode ? `${activeSymbol.label}: ${activeSymbolLensNode.label}` : activeResonanceJourney ? "Resonanzspur" : activeJourney ? "Bedeutungsspur" : activePath ? "Bedeutungsspur" : activeCodexLetter ? "Buchstabenursprung" : hasSymbolFocus ? "Fokus" : "Erster Eintritt"}
          </p>
          <div className="mt-4 border-l border-cyan/[0.18] pl-3 text-[10px] uppercase tracking-[0.18em] text-cyan-soft/70">
            <p>Sichtbare Tiefe: {SYMBOL_VIEWPORT_LABELS[symbolViewportMode]}</p>
            <p className="mt-1 text-gold/60">{SYMBOL_VIEWPORT_HINTS[symbolViewportMode]}</p>
          </div>
          {!hasSymbolFocus && !activeResonanceJourney && !activeJourney && !activePath && !activeCodexLetter ? (
            <div className="symbol-inspector-empty mt-6">
              <p>Erster Eintritt.</p>
              <span>Die Räume sind schon da. Wasser ist der erste stille Nahepunkt.</span>
            </div>
          ) : null}
          {activeResonanceJourney ? (
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
              <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-gold/65">
                {activeCodexLetter.glyph} · {activeCodexLetter.numericValue}
              </p>
              {getLetterDiscoveryText(activeCodexLetter.id) ? (
                <p className="symbol-copy mt-5 text-base italic text-gold/80">
                  {getLetterDiscoveryText(activeCodexLetter.id)}
                </p>
              ) : null}
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
                    : `${activeCodexLetter.name} verbindet ${letterSymbols.map((symbol) => symbol.label).join(", ")}. Berühre den Buchstaben, um bis zu drei Resonanzen zu öffnen.`}
                </p>
                {isLetterResonanceOpen && letterResonances.length > 0 ? (
                  <div className="letter-resonance-pills mt-5" aria-label="Buchstabenresonanzen">
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
                  <p>{activeLetterSourcePath?.evidence ?? activeCodexLetter.biblicalReferences[0]?.reference ?? "Noch kein direkter Anker gewählt."}</p>
                </details>
                <details>
                  <summary>Spuren</summary>
                  <p>{network.journeys.find((journey) => journey.symbolPath.some((symbolId) => letterSymbolIds.has(symbolId)))?.title ?? "Noch keine Spur für diese Buchstabenspur."}</p>
                </details>
                <details>
                  <summary>Codex</summary>
                  <p>{activeCodexLetter.symbolism[0]?.description ?? activeCodexLetter.archetypalMeanings.slice(0, 3).join(", ")}</p>
                </details>
              </div>
            </>
          ) : inspectorSymbolLensData && (activeResonanceLens || activeInspectorFocus) ? (
            <SymbolLensFocusDetail
              activeSymbol={activeSymbol}
              connectedPaths={connectedPaths}
              lensData={inspectorSymbolLensData}
              activeResonanceLens={activeResonanceLens}
              activeInspectorFocus={activeInspectorFocus}
              activeCodexEntry={activeCodexEntry}
              codexHref={activeCodexHref}
              roomHref={activeRoomHref}
              detailHierarchyChildren={activeDetailHierarchyChildren}
              storyDeepHierarchyAnchors={activeStoryDeepHierarchyAnchors}
              verseDeepHierarchyAnchors={activeVerseDeepHierarchyAnchors}
              searchResonanceGroup={searchResonanceGroup}
              showResonanceJourneyOption={showResonanceJourneyOption}
              discoverableResonanceJourney={discoverableResonanceJourney}
              onSelectFocus={selectInspectorFocus}
              onPreviewPath={previewPath}
              onActivateResonanceJourney={activateResonanceJourney}
              onFocusSubspace={focusSubspace}
            />
          ) : hasSymbolFocus ? (
            <LandscapeDisclosureDetail
              activeSymbol={activeSymbol}
              connectedPaths={connectedPaths}
              activeCodexEntry={activeCodexEntry}
              codexHref={activeCodexHref}
              roomHref={activeRoomHref}
              searchResonanceGroup={searchResonanceGroup}
              disclosureLevel={landscapeDisclosureLevel}
              showResonanceJourneyOption={showResonanceJourneyOption}
              discoverableResonanceJourney={discoverableResonanceJourney}
              onPreviewPath={previewPath}
              onSelectFocus={selectInspectorFocus}
              onActivateResonanceJourney={activateResonanceJourney}
            />
          ) : null}

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
                      aria-label={`${activePath.joint.letterName} als Ursprung im Hebrew Codex lesen`}
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
