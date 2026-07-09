"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  BaseEdge,
  Edge,
  EdgeProps,
  Handle,
  Node,
  NodeProps,
  Position,
} from "reactflow";

import { resolveCodexEntry, searchCodexEntries } from "@/lib/codex/getCodexEntry";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { biblicalMeaningLinks, hebrewMeaningLinks, symbolMeaningLinks } from "@/lib/meaning/meaningMappings";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { buildSymbolMeaningNetwork } from "@/lib/meaning/buildSymbolMeaningNetwork";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

type SymbolNetworkInitialUrlState = {
  symbol?: string;
  lens?: string;
  path?: string;
};

type FocusKind = "symbol" | "word" | "letter" | "meaning" | "scripture";
type FocusDepth = "direct" | "near" | "deep";

type FocusNode = {
  id: string;
  kind: FocusKind;
  label: string;
  detail: string;
  summary: string;
  hebrew?: string | null;
  transliteration?: string | null;
  codexHref?: string;
  roomHref?: string;
  scriptureAnchors?: string[];
  terms: string[];
};

type FocusRelation = {
  id: string;
  from: string;
  to: string;
  label: string;
  strength?: "direct" | "near" | "deep";
};

type FocusGraphNodeData = FocusNode & {
  isFocus: boolean;
  isSoft: boolean;
  onFocus: (id: string) => void;
  onHover: (id: string | null) => void;
};

type SearchSuggestion = {
  node: FocusNode;
  score: number;
};

const network = buildSymbolMeaningNetwork();
const MAIN_SYMBOL_IDS = ["wasser", "licht", "feuer", "wueste", "brot"];
const FOCUS_DEPTH_LABELS: Record<FocusDepth, string> = {
  direct: "Direkt",
  near: "Nah",
  deep: "Tief",
};
const KIND_LABELS: Record<FocusKind, string> = {
  symbol: "Raum",
  word: "Wort",
  letter: "Buchstabe",
  meaning: "Bedeutung",
  scripture: "Bibelstelle",
};
const KIND_GROUP_LABELS: Record<FocusKind, string> = {
  word: "Wörter",
  meaning: "Bedeutungsfelder",
  letter: "Buchstaben",
  scripture: "Schriftanker",
  symbol: "Räume",
};
const OVERVIEW_POSITIONS: Record<string, { x: number; y: number }> = {
  wasser: { x: 80, y: 245 },
  licht: { x: 680, y: 80 },
  feuer: { x: 680, y: 405 },
  wueste: { x: 230, y: 430 },
  brot: { x: 430, y: 245 },
};

const FOCUS_CENTER = { x: 430, y: 245 };
const MAX_DIRECT_NODES = 12;
const MAX_NEAR_NODES = 16;
const MAX_DEEP_NODES = 18;
const MAX_VISIBLE_RELATIONS = 24;
const MAX_GROUP_ENTRIES = 6;
const ORBIT_POSITIONS = [
  { x: 440, y: 42 },
  { x: 660, y: 112 },
  { x: 720, y: 310 },
  { x: 560, y: 470 },
  { x: 330, y: 470 },
  { x: 160, y: 310 },
  { x: 220, y: 112 },
  { x: 440, y: 610 },
  { x: 840, y: 240 },
  { x: 40, y: 240 },
];

const CORE_MEANINGS: Record<string, string[]> = {
  wasser: ["depth", "transition", "purification"],
  licht: ["light", "revelation", "guidance"],
  feuer: ["fire", "transformation", "presence"],
  wueste: ["desert", "testing", "guidance"],
  brot: ["nourishment", "gift", "community"],
  majim: ["origin", "depth", "transition"],
  or: ["light", "revelation", "knowledge"],
  ruach: ["breath", "life", "presence"],
  davar: ["word", "order", "revelation"],
  tehom: ["origin", "depth", "hiddenness"],
  esch: ["fire", "transformation", "presence"],
  midbar: ["desert", "testing", "voice"],
  lechem: ["nourishment", "gift", "community"],
};

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u0591-\u05c7]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function buildFocusNode(input: Omit<FocusNode, "terms"> & { terms?: string[] }): FocusNode {
  return {
    ...input,
    terms: unique([
      input.id,
      input.label,
      input.detail,
      input.summary,
      input.hebrew ?? "",
      input.transliteration ?? "",
      KIND_LABELS[input.kind],
      ...(input.scriptureAnchors ?? []),
      ...(input.terms ?? []),
    ].filter(Boolean)),
  };
}

function createFocusData() {
  const nodes = new Map<string, FocusNode>();
  const relations: FocusRelation[] = [];

  function addNode(node: FocusNode) {
    nodes.set(node.id, node);
  }

  function addRelation(from: string, to: string, label: string, strength: FocusRelation["strength"] = "direct") {
    if (!nodes.has(from) || !nodes.has(to)) return;

    const id = [from, to].sort().join("__");
    const existing = relations.find((relation) => relation.id === id);
    if (existing) {
      if (strength === "direct" && existing.strength !== "direct") {
        existing.strength = "direct";
        existing.label = label;
      }
      return;
    }

    relations.push({ id, from, to, label, strength });
  }

  for (const symbol of network.nodes) {
    const config = getSymbolPathConfig(symbol.id);
    addNode(buildFocusNode({
      id: symbol.id,
      kind: "symbol",
      label: symbol.label,
      detail: config?.roomLabel ?? "Symbolraum",
      summary: symbol.shortMeaning,
      hebrew: symbol.hebrew,
      transliteration: symbol.transliteration,
      codexHref: `${config?.codexHref ?? `/codex/${symbol.id}`}?from=symbolnetz&symbol=${encodeURIComponent(symbol.id)}`,
      roomHref: config?.roomHref ?? symbol.roomHref,
      terms: [config?.pathLabel ?? "", ...(config?.codexGates?.meaningFields.map((field) => field.label) ?? [])],
    }));
  }

  for (const word of hebrewWords) {
    const codex = resolveCodexEntry(word.id);
    addNode(buildFocusNode({
      id: word.id,
      kind: "word",
      label: codex?.title ?? word.transliteration,
      detail: word.germanMeaning,
      summary: codex?.summary ?? word.meaningThreshold,
      hebrew: word.hebrew,
      transliteration: word.transliteration,
      codexHref: `/codex/${word.id}?from=symbolnetz&symbol=${encodeURIComponent(word.id)}`,
      scriptureAnchors: word.biblicalReferences.map((reference) => reference.reference),
      terms: [
        word.slug,
        word.germanMeaning,
        word.meaningThreshold,
        ...word.meaningFields.flatMap((field) => [field.label, field.description, ...field.experienceFields]),
        ...word.biblicalReferences.flatMap((reference) => [reference.reference, reference.context, reference.relation]),
      ],
    }));
  }

  for (const letter of hebrewLetters) {
    addNode(buildFocusNode({
      id: letter.id,
      kind: "letter",
      label: letter.name,
      detail: `${letter.glyph} · ${letter.numericValue}`,
      summary: letter.symbolism[0]?.description ?? letter.archetypalMeanings.join(", "),
      hebrew: letter.glyph,
      transliteration: letter.transcription,
      codexHref: `/codex/${letter.id}?from=symbolnetz&symbol=${encodeURIComponent(letter.id)}`,
      scriptureAnchors: letter.biblicalReferences.map((reference) => reference.reference),
      terms: [
        letter.glyph,
        letter.transcription,
        String(letter.numericValue),
        ...letter.archetypalMeanings,
        ...letter.experienceFields,
        ...letter.relatedWordIds,
      ],
    }));
  }

  for (const meaning of meaningNodes) {
    addNode(buildFocusNode({
      id: meaning.id,
      kind: "meaning",
      label: meaning.label,
      detail: "Bedeutungsfeld",
      summary: meaning.description,
      codexHref: resolveCodexEntry(meaning.id)
        ? `/codex/${meaning.id}?from=symbolnetz&symbol=${encodeURIComponent(meaning.id)}`
        : `/codex?meaning=${meaning.id}`,
      terms: [meaning.description],
    }));
  }

  for (const scripture of biblicalMeaningLinks) {
    const codex = resolveCodexEntry(scripture.biblicalReferenceId);
    addNode(buildFocusNode({
      id: scripture.biblicalReferenceId,
      kind: "scripture",
      label: codex?.title ?? scripture.label,
      detail: "Bibelanker",
      summary: codex?.summary ?? scripture.nodeIds.map((id) => meaningNodes.find((node) => node.id === id)?.label ?? id).join(", "),
      codexHref: `/codex/${scripture.biblicalReferenceId}?from=symbolnetz&symbol=${encodeURIComponent(scripture.id)}`,
      scriptureAnchors: [scripture.label],
      terms: [scripture.label, ...(scripture.aliases ?? [])],
    }));
  }

  for (const link of symbolMeaningLinks) {
    for (const meaningId of link.nodeIds) {
      addRelation(
        link.symbolId,
        meaningId,
        "Bedeutung",
        CORE_MEANINGS[link.symbolId]?.includes(meaningId) ? "direct" : "near",
      );
    }
  }

  for (const link of hebrewMeaningLinks) {
    for (const meaningId of link.nodeIds) {
      addRelation(
        link.hebrewWordId,
        meaningId,
        "Bedeutung",
        CORE_MEANINGS[link.hebrewWordId]?.includes(meaningId) ? "direct" : "near",
      );
    }
  }

  for (const word of hebrewWords) {
    for (const letterId of word.letterIds) {
      addRelation(word.id, letterId, "Buchstabe", "deep");
    }
    for (const symbolId of word.relatedSymbolSlugs) {
      addRelation(word.id, symbolId, "Symbol", "near");
    }
    for (const reference of word.biblicalReferences) {
      const normalizedReference = normalize(reference.reference);
      const scriptureId = biblicalReferences.find((anchor) => (
        normalizedReference.startsWith(normalize(anchor.reference))
        || normalize(anchor.reference).startsWith(normalizedReference)
      ))?.id;

      if (scriptureId) addRelation(word.id, scriptureId, "Schriftspur", "near");
    }
  }

  for (const scripture of biblicalMeaningLinks) {
    for (const [index, meaningId] of scripture.nodeIds.entries()) {
      addRelation(scripture.biblicalReferenceId, meaningId, "Bedeutung", index < 3 ? "direct" : "near");
    }
  }

  for (const path of network.paths) {
    addRelation(path.from, path.to, path.label, "near");
  }

  [
    ["wasser", "majim", "Wort"],
    ["wasser", "tehom", "Tiefe"],
    ["wasser", "ruach", "Atem"],
    ["wasser", "exodus-14", "Wasser wird Weg"],
    ["majim", "tehom", "Tiefe"],
    ["majim", "ruach", "Ruach ueber den Wassern"],
    ["majim", "genesis-1-2", "Genesis 1,2"],
    ["majim", "transition", "Uebergang"],
    ["majim", "purification", "Reinigung", "near"],
    ["tehom", "genesis-1-2", "Genesis 1,2"],
    ["ruach", "genesis-1-2", "Genesis 1,2"],
    ["ruach", "davar", "Atem trägt Wort", "near"],
    ["ruach", "aleph", "Unsichtbarer Anfang", "deep"],
    ["licht", "or", "Wort"],
    ["or", "raah", "Licht und Sehen", "near"],
    ["or", "tov", "Licht und Gut", "near"],
    ["or", "genesis-1-3", "Genesis 1,3"],
    ["or", "genesis-1-4", "Genesis 1,4", "near"],
    ["raah", "genesis-1-4", "Genesis 1,4"],
    ["tov", "genesis-1-4", "Genesis 1,4"],
    ["licht", "genesis-1-3", "Genesis 1,3"],
    ["licht", "genesis-1-4", "Genesis 1,4"],
    ["licht", "aleph", "Ursprung des Lichts", "near"],
    ["licht", "resh", "Ausrichtung", "deep"],
    ["feuer", "esch", "Wort"],
    ["feuer", "exodus-3-2", "Offenbarung"],
    ["feuer", "shin", "Wandlung", "near"],
    ["wueste", "midbar", "Wort"],
    ["wueste", "exodus-wilderness", "Weg im Mangel"],
    ["wueste", "davar", "Wort im Hören", "near"],
    ["wueste", "bet", "Innenraum", "deep"],
    ["brot", "lechem", "Wort"],
    ["brot", "exodus-16-4", "Gabe im Mangel"],
    ["brot", "lamed", "Lernen und Weisung", "near"],
    ["brot", "davar", "Innere Nahrung", "deep"],
    ["tehom", "mem", "Verborgene Tiefe", "near"],
    ["tehom", "birth", "Hervortreten", "deep"],
    ["midbar", "bet", "Innenraum des Hörens", "near"],
    ["midbar", "resh", "Ausrichtung", "near"],
    ["davar", "bet", "Wort im Haus", "near"],
    ["davar", "resh", "Richtung", "near"],
    ["lechem", "lamed", "Weisung", "near"],
    ["mem", "depth", "Tiefe"],
    ["mem", "hiddenness", "Verborgenheit"],
    ["mem", "birth", "Mutterraum", "near"],
    ["mem", "transition", "Bewegung", "near"],
    ["aleph", "origin", "Ursprung"],
    ["aleph", "breath", "Atem", "near"],
    ["shin", "fire", "Feuer"],
    ["shin", "transformation", "Wandlung", "near"],
    ["bet", "house", "Haus"],
    ["bet", "origin", "Anfangsraum", "near"],
    ["resh", "origin", "Anfang"],
    ["resh", "guidance", "Ausrichtung", "near"],
    ["lamed", "knowledge", "Lernen"],
    ["lamed", "guidance", "Weisung", "near"],
  ].forEach(([from, to, label, strength]) => addRelation(
    from,
    to,
    label,
    (strength as FocusRelation["strength"] | undefined) ?? "direct",
  ));

  return { nodes, relations };
}

const focusData = createFocusData();

function scoreNode(node: FocusNode, query: string): number {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  let score = 0;
  for (const term of node.terms) {
    const normalizedTerm = normalize(term);
    if (normalizedTerm === normalizedQuery) score = Math.max(score, 300);
    else if (normalizedTerm.startsWith(normalizedQuery)) score = Math.max(score, 120);
    else if (normalizedTerm.includes(normalizedQuery)) score = Math.max(score, 55);
  }

  if (normalize(node.label) === normalizedQuery) score += 180;
  if (node.transliteration && normalize(node.transliteration) === normalizedQuery) score += 160;
  if (node.hebrew && normalize(node.hebrew) === normalizedQuery) score += 160;
  if (normalize(node.id) === normalizedQuery) score += 170;
  if (node.kind === "symbol") score += 6;
  if (node.kind === "word") score += 5;
  if (node.kind === "scripture") score += 4;

  return score;
}

function getSuggestions(query: string): SearchSuggestion[] {
  const local = Array.from(focusData.nodes.values())
    .map((node) => ({ node, score: scoreNode(node, query) }))
    .filter((suggestion) => suggestion.score > 0);
  const localIds = new Set(local.map((suggestion) => suggestion.node.id));

  for (const entry of searchCodexEntries(query).slice(0, 8)) {
    if (localIds.has(entry.id)) continue;

    const node = focusData.nodes.get(entry.symbolRoomSlug ?? entry.id);
    if (node) {
      local.push({ node, score: 38 });
      localIds.add(node.id);
    }
  }

  const ranked = local
    .sort((a, b) => b.score - a.score || a.node.label.localeCompare(b.node.label, "de"));
  const hasExactMatch = (ranked[0]?.score ?? 0) >= 300;

  return ranked
    .filter((suggestion) => !hasExactMatch || suggestion.score >= 300)
    .slice(0, hasExactMatch ? 5 : 8);
}

function getRelationIds(id: string, strengths: FocusRelation["strength"][] = ["direct"]) {
  return focusData.relations
    .filter((relation) => strengths.includes(relation.strength) && (relation.from === id || relation.to === id))
    .map((relation) => relation.from === id ? relation.to : relation.from);
}

const KIND_PRIORITY: Record<FocusKind, number> = {
  word: 0,
  meaning: 1,
  symbol: 2,
  scripture: 3,
  letter: 4,
};

function rankNodeIds(ids: string[]) {
  return unique(ids).sort((leftId, rightId) => {
    const left = focusData.nodes.get(leftId);
    const right = focusData.nodes.get(rightId);
    if (!left || !right) return leftId.localeCompare(rightId);
    return KIND_PRIORITY[left.kind] - KIND_PRIORITY[right.kind]
      || left.label.localeCompare(right.label, "de");
  });
}

function getVisibleNodeIds(focusId: string | null, depth: FocusDepth) {
  if (!focusId) return new Set(MAIN_SYMBOL_IDS);

  const visible = new Set<string>([focusId]);
  const direct = rankNodeIds(getRelationIds(focusId));
  direct.forEach((id) => visible.add(id));

  if (depth === "near") {
    rankNodeIds(getRelationIds(focusId, ["direct", "near"])).forEach((id) => visible.add(id));
    rankNodeIds(direct.flatMap((id) => getRelationIds(id))).forEach((id) => visible.add(id));
  }

  if (depth === "deep") {
    const prioritizedRoots = [
      ...getRelationIds(focusId, ["direct"]),
      ...getRelationIds(focusId, ["near"]),
      ...getRelationIds(focusId, ["deep"]),
    ];
    const queue = rankNodeIds(prioritizedRoots);
    while (queue.length && visible.size < MAX_DEEP_NODES) {
      const current = queue.shift();
      if (!current || visible.has(current)) continue;
      visible.add(current);
      rankNodeIds(getRelationIds(current, ["direct", "near", "deep"])).forEach((id) => {
        if (!visible.has(id) && !queue.includes(id)) queue.push(id);
      });
    }
  }

  const uniqueLabels = new Set<string>();
  const calmSelection = Array.from(visible).filter((id) => {
    const node = focusData.nodes.get(id);
    if (!node) return false;
    const label = normalize(node.label);
    if (uniqueLabels.has(label)) return false;
    uniqueLabels.add(label);
    return true;
  });

  const nodeLimit = depth === "direct"
    ? MAX_DIRECT_NODES
    : depth === "near"
      ? MAX_NEAR_NODES
      : MAX_DEEP_NODES;
  return new Set(calmSelection.slice(0, nodeLimit));
}

const KIND_ARCS: Record<FocusKind, number> = {
  meaning: -0.45,
  word: 0.55,
  scripture: 1.5,
  letter: 2.45,
  symbol: 3.45,
};

function getNodePositions(nodes: FocusNode[], focusId: string | null, directIds: Set<string>) {
  const positions = new Map<string, { x: number; y: number }>();
  if (!focusId) {
    nodes.forEach((node, index) => positions.set(node.id, OVERVIEW_POSITIONS[node.id] ?? ORBIT_POSITIONS[index % ORBIT_POSITIONS.length]));
    return positions;
  }

  positions.set(focusId, FOCUS_CENTER);
  const satellites = nodes.filter((node) => node.id !== focusId);
  const grouped = new Map<FocusKind, FocusNode[]>();
  satellites.forEach((node) => grouped.set(node.kind, [...(grouped.get(node.kind) ?? []), node]));

  grouped.forEach((group, kind) => {
    group.forEach((node, index) => {
      const isDirect = directIds.has(node.id);
      const spread = Math.min(0.62, 0.18 * Math.max(1, group.length - 1));
      const offset = group.length === 1 ? 0 : (index / (group.length - 1) - 0.5) * spread * 2;
      const angle = KIND_ARCS[kind] + offset;
      const radiusX = isDirect ? 270 : 405;
      const radiusY = isDirect ? 195 : 285;
      positions.set(node.id, {
        x: FOCUS_CENTER.x + Math.cos(angle) * radiusX,
        y: FOCUS_CENTER.y + Math.sin(angle) * radiusY,
      });
    });
  });
  return positions;
}

const FocusGraphNode = memo(function FocusGraphNode({ data }: NodeProps<FocusGraphNodeData>) {
  const handlePointerEnter = useCallback(() => data.onHover(data.id), [data]);
  const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) return;
    data.onHover(null);
  }, [data]);

  return (
    <button
      type="button"
      className={`symbol-focus-node symbol-focus-node--${data.kind} ${data.isFocus ? "is-focus" : ""} ${data.isSoft ? "is-soft" : ""}`}
      onClick={() => data.onFocus(data.id)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={() => data.onHover(data.id)}
      onBlur={() => data.onHover(null)}
    >
      <Handle type="target" position={Position.Top} />
      <span className="symbol-focus-node__kind">{KIND_LABELS[data.kind]}</span>
      {data.hebrew ? <span className="symbol-focus-node__hebrew" lang="he" dir="rtl">{data.hebrew}</span> : null}
      <strong>{data.label}</strong>
      <i>{data.detail}</i>
      <Handle type="source" position={Position.Bottom} />
    </button>
  );
});

type FocusEdgeData = { label?: string; relation: string; strength: FocusRelation["strength"]; isActive: boolean; showLabel: boolean };

const FocusGraphEdge = memo(function FocusGraphEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps<FocusEdgeData>) {
  const path = `M ${sourceX},${sourceY} C ${sourceX},${(sourceY + targetY) / 2} ${targetX},${(sourceY + targetY) / 2} ${targetX},${targetY}`;
  const relationClass = normalize(data?.relation ?? "").replace(/\s+/g, "-");

  return (
    <g className={`symbol-focus-edge relation-${relationClass} strength-${data?.strength ?? "direct"} ${data?.isActive ? "is-active" : ""}`}>
      <BaseEdge id={id} path={path} />
      {data?.label && data.showLabel ? (
        <text className="symbol-focus-edge__label">
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {data.label}
          </textPath>
        </text>
      ) : null}
    </g>
  );
});

const nodeTypes = { focus: FocusGraphNode };
const edgeTypes = { focus: FocusGraphEdge };
const reactFlowOptions = { hideAttribution: true };
const fitViewOptions = { padding: 0.16, maxZoom: 1.05 };

function getInitialFocus(initialUrlState?: SymbolNetworkInitialUrlState) {
  if (initialUrlState?.symbol && focusData.nodes.has(initialUrlState.symbol)) {
    return initialUrlState.symbol;
  }

  if (initialUrlState?.path && initialUrlState.path !== "erste-bewegung" && focusData.nodes.has(initialUrlState.path)) {
    return initialUrlState.path;
  }

  return null;
}

export default function SymbolNetwork({ initialUrlState }: { initialUrlState?: SymbolNetworkInitialUrlState }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [query, setQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [focusId, setFocusId] = useState<string | null>(() => getInitialFocus(initialUrlState));
  const [depth, setDepth] = useState<FocusDepth>("direct");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusTrace, setFocusTrace] = useState<string[]>(() => {
    const initial = getInitialFocus(initialUrlState);
    return initial ? [initial] : [];
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const focusNode = focusId ? focusData.nodes.get(focusId) : undefined;
  const suggestions = useMemo(() => getSuggestions(query), [query]);
  const visibleIds = useMemo(() => getVisibleNodeIds(focusId, depth), [focusId, depth]);
  const visibleNodes = useMemo(
    () => Array.from(visibleIds).map((id) => focusData.nodes.get(id)).filter((node): node is FocusNode => Boolean(node)),
    [visibleIds],
  );
  const directIds = useMemo(() => new Set(focusId ? getRelationIds(focusId) : []), [focusId]);
  const nodePositions = useMemo(
    () => getNodePositions(visibleNodes, focusId, directIds),
    [directIds, focusId, visibleNodes],
  );
  const visibleRelations = useMemo(
    () => focusData.relations.filter((relation) => {
      if (!visibleIds.has(relation.from) || !visibleIds.has(relation.to)) return false;
      if (!focusId) return false;
      if (depth === "direct") return relation.strength === "direct" && (relation.from === focusId || relation.to === focusId);
      const touchesFocus = relation.from === focusId || relation.to === focusId;
      const bridgesFromDirect = directIds.has(relation.from) !== directIds.has(relation.to);
      return touchesFocus || bridgesFromDirect;
    }).sort((left, right) => {
      const leftTouchesFocus = left.from === focusId || left.to === focusId;
      const rightTouchesFocus = right.from === focusId || right.to === focusId;
      const strengthPriority: Record<NonNullable<FocusRelation["strength"]>, number> = {
        direct: 0,
        near: 1,
        deep: 2,
      };
      return Number(rightTouchesFocus) - Number(leftTouchesFocus)
        || strengthPriority[left.strength ?? "direct"] - strengthPriority[right.strength ?? "direct"]
        || left.id.localeCompare(right.id);
    }).slice(0, MAX_VISIBLE_RELATIONS),
    [depth, directIds, focusId, visibleIds],
  );

  const focusNodeById = useCallback((id: string, searchTerm?: string) => {
    const node = focusData.nodes.get(id);
    if (!node) return;

    setFocusId(id);
    setFocusTrace((trace) => [...trace.filter((traceId) => traceId !== id), id].slice(-5));
    setSearchedTerm(searchTerm?.trim() ?? "");
    setQuery("");
  }, []);
  const hoverNodeById = useCallback((id: string | null) => {
    setHoveredId((currentId) => currentId === id ? currentId : id);
  }, []);

  function submitSearch() {
    const suggestion = suggestions[0];
    if (suggestion) {
      focusNodeById(suggestion.node.id, query);
    }
  }

  const graphNodes = useMemo<Node<FocusGraphNodeData>[]>(() => visibleNodes.map((node) => ({
    id: node.id,
    type: "focus",
    position: nodePositions.get(node.id) ?? FOCUS_CENTER,
    data: {
      ...node,
      isFocus: node.id === focusId,
      isSoft: Boolean((focusId && node.id !== focusId && !directIds.has(node.id)) || (hoveredId && node.id !== hoveredId && !visibleRelations.some((relation) => (
        (relation.from === hoveredId && relation.to === node.id) || (relation.to === hoveredId && relation.from === node.id)
      )))),
      onFocus: focusNodeById,
      onHover: hoverNodeById,
    },
  })), [directIds, focusId, focusNodeById, hoveredId, hoverNodeById, nodePositions, visibleNodes, visibleRelations]);
  const graphEdges = useMemo<Edge<FocusEdgeData>[]>(() => visibleRelations.map((relation) => ({
    id: relation.id,
    source: relation.from,
    target: relation.to,
    type: "focus",
    data: {
      label: relation.label,
      relation: relation.label,
      strength: relation.strength,
      isActive: Boolean(hoveredId && (relation.from === hoveredId || relation.to === hoveredId)),
      showLabel: Boolean(hoveredId && (relation.from === hoveredId || relation.to === hoveredId)),
    },
  })), [hoveredId, visibleRelations]);
  const rawDirectConnections = focusId
    ? getRelationIds(focusId).map((id) => focusData.nodes.get(id)).filter((node): node is FocusNode => Boolean(node))
    : visibleNodes;
  const connectionLabels = new Set<string>(focusNode ? [normalize(focusNode.label)] : []);
  const directConnections = rawDirectConnections.filter((node) => {
    const label = normalize(node.label);
    if (connectionLabels.has(label)) return false;
    connectionLabels.add(label);
    return true;
  });
  const groupedConnections = (focusId ? directConnections : visibleNodes).reduce<Partial<Record<FocusKind, FocusNode[]>>>((groups, node) => {
    (groups[node.kind] ??= []).push(node);
    return groups;
  }, {});
  const groupOrder: FocusKind[] = ["word", "meaning", "letter", "scripture", "symbol"];
  const furtherConnections = visibleNodes.filter((node) => node.id !== focusId && !directIds.has(node.id));
  const groupedFurtherConnections = furtherConnections.reduce<Partial<Record<FocusKind, FocusNode[]>>>((groups, node) => {
    (groups[node.kind] ??= []).push(node);
    return groups;
  }, {});
  const traceNodes = focusTrace.map((id) => focusData.nodes.get(id)).filter((node): node is FocusNode => Boolean(node));

  return (
    <section className="symbol-focus-net min-h-screen px-5 pb-16 pt-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <div className="symbol-focus-search">
              <p className="symbol-kicker text-cyan-soft">Symbolnetz</p>
              <h1 className="mt-3 font-serif text-4xl italic text-foreground-strong md:text-6xl">Freier Bedeutungsraum</h1>
              <p className="symbol-copy mt-4 max-w-2xl text-lg">
                Suche ein Wort, ein Zeichen oder eine Bibelstelle.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 md:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch();
                }}
              >
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="symbol-focus-search__input"
                  placeholder="majim, אור, Genesis 1,2, Licht …"
                  aria-label="Symbolnetz durchsuchen"
                />
                <button type="submit" className="symbol-focus-search__button">Fokussieren</button>
              </form>

              {traceNodes.length ? (
                <nav className="symbol-focus-trace" aria-label="Zuletzt berührte Zeichen">
                  <span>Zuletzt berührte Zeichen</span>
                  {traceNodes.map((node, index) => (
                    <span key={`${node.id}-${index}`}>
                      {index ? <i aria-hidden="true">·</i> : null}
                      <button type="button" onClick={() => focusNodeById(node.id)}>{node.label}</button>
                    </span>
                  ))}
                </nav>
              ) : null}

              <div className="symbol-focus-tabs" aria-label="Raumportale">
                {MAIN_SYMBOL_IDS.map((symbolId) => {
                  const node = focusData.nodes.get(symbolId);
                  return node ? (
                    <button
                      key={symbolId}
                      type="button"
                      className={focusId === symbolId ? "is-active" : ""}
                      onClick={() => focusNodeById(symbolId)}
                    >
                      {node.hebrew ? <span lang="he" dir="rtl">{node.hebrew}</span> : null}
                      {node.label}
                    </button>
                  ) : null;
                })}
              </div>
            </div>

            {query.trim() ? (
              <div className="symbol-focus-results" aria-label="Suchergebnisse">
                <p className="symbol-focus-results__query">Gesucht: <strong>{query.trim()}</strong></p>
                {suggestions.length ? suggestions.map(({ node }, index) => (
                  <button key={node.id} type="button" onClick={() => focusNodeById(node.id, query)}>
                    <span>{KIND_LABELS[node.kind]}</span>
                    <strong>{node.label}</strong>
                    <i>{node.transliteration ?? node.detail}</i>
                    {index === 0 ? <em>stärkster Bezug</em> : null}
                  </button>
                )) : (
                  <div className="symbol-focus-empty">
                    <strong>Dieses Zeichen ist im Archiv noch nicht geöffnet.</strong>
                    <span>Versuche Wasser, Licht, Ruach, Wort, Tiefe oder Brot.</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="symbol-focus-mobile md:hidden">
              <div className={`symbol-focus-card symbol-focus-card--${focusNode?.kind ?? "start"}`}>
                <p>{focusNode ? KIND_LABELS[focusNode.kind] : "Start"}</p>
                {focusNode?.hebrew ? <b lang="he" dir="rtl">{focusNode.hebrew}</b> : null}
                <h2>{focusNode?.label ?? "Suche oder berühre ein Zeichen"}</h2>
                {focusNode?.transliteration ? <i>{focusNode.transliteration}</i> : null}
                <span>{focusNode?.summary ?? "Fünf Räume warten als freie Zugänge. Keine Reihenfolge, kein vorgezeichneter Weg."}</span>
              </div>
              {groupOrder.map((kind) => groupedConnections[kind]?.length ? (
                <section className="symbol-focus-mobile__group" key={kind}>
                  <h3>{KIND_GROUP_LABELS[kind]}</h3>
                  <div className="symbol-focus-mobile__connections">
                    {groupedConnections[kind]!.slice(0, MAX_GROUP_ENTRIES).map((node) => (
                      <button key={node.id} type="button" onClick={() => focusNodeById(node.id)}>
                        <span>{node.hebrew ?? KIND_LABELS[node.kind]}</span>
                        <strong>{node.label}</strong>
                        <i>{node.transliteration ?? node.detail}</i>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null)}
              {focusNode ? (
                <div className="symbol-focus-mobile__actions">
                  {focusNode.codexHref ? <Link href={focusNode.codexHref}>Im Codex öffnen</Link> : null}
                  {focusNode.roomHref ? <Link href={focusNode.roomHref}>{focusNode.label}-Raum betreten</Link> : null}
                </div>
              ) : null}
            </div>

            {isDesktop ? <div className="symbol-focus-toolbar">
              <span>
                {searchedTerm ? <>Gesucht: <strong>{searchedTerm}</strong> · Fokus: <strong>{focusNode?.label}</strong></> : focusNode ? `${focusNode.label}-Fokus` : "Startfokus"}
              </span>
              <div aria-label="Beziehungstiefe">
                {(["direct", "near", "deep"] as const).map((value) => (
                  <button key={value} type="button" className={depth === value ? "is-active" : ""} onClick={() => setDepth(value)}>
                    {FOCUS_DEPTH_LABELS[value]}
                  </button>
                ))}
              </div>
            </div> : null}

            {isDesktop ? <div className="symbol-focus-graph">
              {focusId && depth !== "direct" ? (
                <div className="symbol-focus-cluster-labels" aria-hidden="true">
                  <span className="is-meaning">Bedeutungsfelder</span>
                  <span className="is-word">Wörter</span>
                  <span className="is-scripture">Schriftanker</span>
                  <span className="is-letter">Buchstaben</span>
                  <span className="is-symbol">Räume</span>
                </div>
              ) : null}
              <ReactFlow
                key={`${focusId ?? "start"}-${depth}`}
                nodes={graphNodes}
                edges={graphEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                proOptions={reactFlowOptions}
                fitView
                fitViewOptions={fitViewOptions}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={false}
                preventScrolling={false}
              />
            </div> : null}
          </div>

          <aside className="symbol-focus-inspector">
            <p className="symbol-kicker text-cyan-soft">{focusNode ? "Fokus" : "Erster Blick"}</p>
            <h2>{focusNode?.label ?? "Berühre ein Zeichen"}</h2>
            {searchedTerm ? <p className="symbol-focus-inspector__searched">Gesucht: {searchedTerm}</p> : null}
            {focusNode?.hebrew ? <div className="symbol-focus-inspector__hebrew" lang="he" dir="rtl">{focusNode.hebrew}</div> : null}
            {focusNode?.transliteration ? <p className="symbol-focus-inspector__transliteration">{focusNode.transliteration}</p> : null}
            <p className="symbol-focus-inspector__type">{focusNode ? KIND_LABELS[focusNode.kind] : "Symbolnetz"}</p>
            <p className="symbol-copy mt-5">{focusNode?.summary ?? "Fünf ruhige Portale öffnen das Netz. Suche oder wähle frei einen Raum."}</p>
            {focusNode ? <p className="symbol-focus-inspector__essence">Dieses Zeichen öffnet ein Bedeutungsfeld von {focusNode.detail.toLocaleLowerCase("de-DE")}.</p> : null}
            {directConnections.length ? (
              <div className="symbol-focus-inspector__connections">
                {groupOrder.map((kind) => groupedConnections[kind]?.length ? (
                  <section key={kind}>
                    <p>{KIND_GROUP_LABELS[kind]}</p>
                    {groupedConnections[kind]!.slice(0, MAX_GROUP_ENTRIES).map((node) => (
                      <button key={node.id} type="button" onClick={() => focusNodeById(node.id)}>
                        <span>{node.hebrew ?? node.transliteration ?? KIND_LABELS[node.kind]}</span>
                        {node.label}
                      </button>
                    ))}
                  </section>
                ) : null)}
              </div>
            ) : null}
            {focusNode && furtherConnections.length ? (
              <div className="symbol-focus-inspector__further">
                <p>{depth === "deep" ? "Tiefe Resonanzen" : "Nahe Verbindungen"}</p>
                {groupOrder.map((kind) => groupedFurtherConnections[kind]?.length ? (
                  <section key={kind}>
                    <span>{KIND_GROUP_LABELS[kind]}</span>
                    {groupedFurtherConnections[kind]!.slice(0, 4).map((node) => (
                      <button key={node.id} type="button" onClick={() => focusNodeById(node.id)}>{node.label}</button>
                    ))}
                  </section>
                ) : null)}
              </div>
            ) : null}

            <div className="symbol-focus-inspector__actions">
              <span>Codex-Schwelle</span>
              {focusNode?.codexHref ? <Link href={focusNode.codexHref}>Im Codex öffnen <i>↗</i></Link> : <Link href="/codex">Zum Codex <i>↗</i></Link>}
              {focusNode?.roomHref ? <><span>Raum-Schwelle</span><Link href={focusNode.roomHref}>{focusNode.label}-Raum betreten <i>→</i></Link></> : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
