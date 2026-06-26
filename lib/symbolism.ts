export type NodeID = string;

export type NodeType =
  | "core-symbol"
  | "hebrew-word"
  | "hebrew-letter"
  | "natural-symbol"
  | "ritual-symbol"
  | "spiritual-symbol"
  | "place-symbol"
  | "material-symbol"
  | "scripture";

export type MeaningLayer =
  | "surface"
  | "biblical"
  | "hebrew"
  | "letter"
  | "spiritual"
  | "existential"
  | "visual";

export type RelationType =
  | "contains"
  | "unfolds-into"
  | "letter-of"
  | "scene-of"
  | "transforms"
  | "contrasts"
  | "reveals"
  | "moves-over"
  | "breaks-through"
  | "feeds"
  | "opens-path";

export type MeaningQuality =
  | "origin"
  | "depth"
  | "chaos"
  | "birth"
  | "transition"
  | "purification"
  | "hidden-source"
  | "lack"
  | "revelation"
  | "life"
  | "impulse"
  | "movement"
  | "resistance";

export type EmotionalTone =
  | "still"
  | "deep"
  | "tender"
  | "awe"
  | "tension"
  | "hope"
  | "thirst"
  | "release"
  | "awakening";

export type VisualMaterial =
  | "dark-water"
  | "mist-glass"
  | "gold-thread"
  | "cyan-light"
  | "black-stone"
  | "desert-dust"
  | "deep-space"
  | "script-light";

export type MotionStyle =
  | "breathing"
  | "slow-current"
  | "hovering"
  | "ripple"
  | "emerging"
  | "parting"
  | "stillness"
  | "spark";

export type CameraBehavior =
  | "centered"
  | "descend"
  | "orbit-slow"
  | "draw-near"
  | "wide-threshold"
  | "reveal";

export type VisualTraits = {
  material: VisualMaterial;
  accent: "gold" | "cyan" | "shadow" | "stone" | "sand";
  glow: number;
  opacity: number;
  motion: MotionStyle;
};

export type ExperienceTraits = {
  camera: CameraBehavior;
  tone: EmotionalTone;
  tempo: "very-slow" | "slow" | "measured";
  depth: number;
};

export type SymbolNode = {
  id: NodeID;
  type: NodeType;
  label: string;
  hebrew?: string;
  transliteration?: string;
  gematria?: number;
  shortMeaning: string;
  importance: number;
  depthLevel: number;
  visuals: VisualTraits;
  experience: ExperienceTraits;
  roomHref?: string;
};

export type MeaningEdge = {
  source: NodeID;
  target: NodeID;
  relation: RelationType;
  weight: number;
  layer: MeaningLayer;
  meaningQuality: MeaningQuality;
  emotionalTone: EmotionalTone;
  visualBehavior: MotionStyle;
  explanation: string;
};

export type SymbolGraph = {
  id: string;
  title: string;
  centerId: NodeID;
  nodes: SymbolNode[];
  edges: MeaningEdge[];
  primaryPaths: Record<NodeID, NodeID[]>;
};

const waterVisuals: VisualTraits = {
  material: "dark-water",
  accent: "cyan",
  glow: 1,
  opacity: 1,
  motion: "slow-current",
};

const deepExperience: ExperienceTraits = {
  camera: "centered",
  tone: "deep",
  tempo: "very-slow",
  depth: 1,
};

export const waterSymbolGraph: SymbolGraph = {
  id: "water-symbol-engine",
  title: "Water Symbol Engine",
  centerId: "water",
  nodes: [
    {
      id: "water",
      type: "core-symbol",
      label: "Wasser",
      hebrew: "מים",
      transliteration: "Majim",
      gematria: 90,
      shortMeaning: "Zentraler Hub: Tiefe, Leben, Reinigung, Grenze, Übergang und neue Geburt.",
      importance: 1,
      depthLevel: 0,
      visuals: waterVisuals,
      experience: deepExperience,
      roomHref: "/raeume/wasser",
    },
    {
      id: "mayim",
      type: "hebrew-word",
      label: "Majim",
      hebrew: "מים",
      transliteration: "Majim",
      gematria: 90,
      shortMeaning: "Die hebräische Tiefenebene des Wassers: offene Tiefe, göttlicher Impuls und geschlossene Tiefe.",
      importance: 0.96,
      depthLevel: 1,
      visuals: { material: "script-light", accent: "gold", glow: 0.88, opacity: 0.92, motion: "breathing" },
      experience: { camera: "descend", tone: "awe", tempo: "very-slow", depth: 0.95 },
    },
    {
      id: "mem",
      type: "hebrew-letter",
      label: "Mem",
      hebrew: "מ",
      transliteration: "Mem",
      gematria: 40,
      shortMeaning: "Tiefe, Wasser, Mutterschoß, Chaos und Geburt.",
      importance: 0.9,
      depthLevel: 2,
      visuals: { material: "dark-water", accent: "cyan", glow: 0.82, opacity: 0.88, motion: "breathing" },
      experience: { camera: "draw-near", tone: "deep", tempo: "very-slow", depth: 0.92 },
    },
    {
      id: "yod",
      type: "hebrew-letter",
      label: "Yod",
      hebrew: "י",
      transliteration: "Yod",
      gematria: 10,
      shortMeaning: "Punkt, Same und göttlicher Impuls in der Mitte der Tiefe.",
      importance: 0.82,
      depthLevel: 2,
      visuals: { material: "gold-thread", accent: "gold", glow: 0.9, opacity: 0.9, motion: "spark" },
      experience: { camera: "reveal", tone: "awakening", tempo: "slow", depth: 0.7 },
    },
    {
      id: "sea",
      type: "natural-symbol",
      label: "Meer",
      hebrew: "ים",
      transliteration: "Jam",
      gematria: 50,
      shortMeaning: "Chaos, Grenze und Übergang: die große Wasserfläche, die zum Durchzug werden kann.",
      importance: 0.88,
      depthLevel: 1,
      visuals: { material: "dark-water", accent: "cyan", glow: 0.72, opacity: 0.86, motion: "parting" },
      experience: { camera: "wide-threshold", tone: "tension", tempo: "slow", depth: 0.84 },
    },
    {
      id: "well",
      type: "natural-symbol",
      label: "Brunnen",
      shortMeaning: "Verborgenes Wasser unter der Oberfläche: Tiefe, Begegnung und innerer Vorrat.",
      importance: 0.74,
      depthLevel: 1,
      visuals: { material: "mist-glass", accent: "cyan", glow: 0.58, opacity: 0.8, motion: "stillness" },
      experience: { camera: "descend", tone: "still", tempo: "very-slow", depth: 0.78 },
    },
    {
      id: "spring",
      type: "natural-symbol",
      label: "Quelle",
      shortMeaning: "Verborgene Quelle, die hervortritt: Ursprung, Gabe und lebendiges Wasser.",
      importance: 0.82,
      depthLevel: 1,
      visuals: { material: "cyan-light", accent: "cyan", glow: 0.82, opacity: 0.86, motion: "emerging" },
      experience: { camera: "draw-near", tone: "hope", tempo: "slow", depth: 0.72 },
    },
    {
      id: "baptism",
      type: "ritual-symbol",
      label: "Taufe",
      shortMeaning: "Reinigung, Untertauchen und neue Geburt.",
      importance: 0.86,
      depthLevel: 1,
      visuals: { material: "mist-glass", accent: "gold", glow: 0.74, opacity: 0.86, motion: "ripple" },
      experience: { camera: "descend", tone: "release", tempo: "slow", depth: 0.8 },
    },
    {
      id: "spirit",
      type: "spiritual-symbol",
      label: "Geist",
      hebrew: "רוח",
      transliteration: "Ruach",
      shortMeaning: "Atem, Wind und Bewegung über den Wassern.",
      importance: 0.88,
      depthLevel: 1,
      visuals: { material: "cyan-light", accent: "cyan", glow: 0.86, opacity: 0.84, motion: "hovering" },
      experience: { camera: "orbit-slow", tone: "awakening", tempo: "very-slow", depth: 0.78 },
    },
    {
      id: "desert",
      type: "place-symbol",
      label: "Wüste",
      hebrew: "מדבר",
      transliteration: "Midbar",
      shortMeaning: "Mangel, Durst und Suche: der Raum, in dem Wasser zur Gabe wird.",
      importance: 0.7,
      depthLevel: 1,
      visuals: { material: "desert-dust", accent: "sand", glow: 0.34, opacity: 0.72, motion: "stillness" },
      experience: { camera: "wide-threshold", tone: "thirst", tempo: "measured", depth: 0.62 },
    },
    {
      id: "rock",
      type: "material-symbol",
      label: "Fels",
      hebrew: "צור",
      transliteration: "Zur",
      shortMeaning: "Härte und Widerstand, aus dem unerwartet Wasser hervorbricht.",
      importance: 0.72,
      depthLevel: 1,
      visuals: { material: "black-stone", accent: "stone", glow: 0.44, opacity: 0.78, motion: "stillness" },
      experience: { camera: "draw-near", tone: "tension", tempo: "measured", depth: 0.66 },
    },
    {
      id: "light",
      type: "spiritual-symbol",
      label: "Licht",
      hebrew: "אור",
      transliteration: "Or",
      shortMeaning: "Offenbarung über der Tiefe: Licht macht sichtbar, was Wasser verbirgt.",
      importance: 0.76,
      depthLevel: 1,
      visuals: { material: "gold-thread", accent: "gold", glow: 0.88, opacity: 0.9, motion: "spark" },
      experience: { camera: "reveal", tone: "awakening", tempo: "slow", depth: 0.64 },
    },
    {
      id: "genesis-1-2",
      type: "scripture",
      label: "Genesis 1,2",
      shortMeaning: "Der Geist Gottes schwebt über den Wassern: Anfang, Tiefe und noch ungeformte Schöpfung.",
      importance: 0.9,
      depthLevel: 2,
      visuals: { material: "deep-space", accent: "cyan", glow: 0.72, opacity: 0.82, motion: "hovering" },
      experience: { camera: "descend", tone: "awe", tempo: "very-slow", depth: 0.94 },
    },
    {
      id: "exodus-14",
      type: "scripture",
      label: "Exodus 14",
      shortMeaning: "Das Meer wird zur Schwelle: Wasser als Grenze, Durchzug und Befreiung.",
      importance: 0.84,
      depthLevel: 2,
      visuals: { material: "dark-water", accent: "gold", glow: 0.7, opacity: 0.84, motion: "parting" },
      experience: { camera: "wide-threshold", tone: "hope", tempo: "slow", depth: 0.86 },
    },
  ],
  edges: [
    {
      source: "water",
      target: "mayim",
      relation: "contains",
      weight: 0.98,
      layer: "hebrew",
      meaningQuality: "depth",
      emotionalTone: "deep",
      visualBehavior: "breathing",
      explanation: "Wasser öffnet sich in מים als hebräische Tiefenebene: Schrift, Klang und Deutung werden eins.",
    },
    {
      source: "mayim",
      target: "mem",
      relation: "letter-of",
      weight: 0.94,
      layer: "letter",
      meaningQuality: "birth",
      emotionalTone: "deep",
      visualBehavior: "breathing",
      explanation: "Mem trägt die Deutung von Tiefe, Wasser, Mutterschoß, Chaos und Geburt in das Wort hinein.",
    },
    {
      source: "mayim",
      target: "yod",
      relation: "letter-of",
      weight: 0.86,
      layer: "letter",
      meaningQuality: "impulse",
      emotionalTone: "awakening",
      visualBehavior: "spark",
      explanation: "Yod steht im Inneren des Wortes als Punkt, Same und göttlicher Impuls.",
    },
    {
      source: "water",
      target: "sea",
      relation: "unfolds-into",
      weight: 0.9,
      layer: "biblical",
      meaningQuality: "chaos",
      emotionalTone: "tension",
      visualBehavior: "parting",
      explanation: "Im Meer wird Wasser zur großen Tiefe: Chaos, Grenze und möglicher Übergang.",
    },
    {
      source: "water",
      target: "well",
      relation: "contains",
      weight: 0.74,
      layer: "existential",
      meaningQuality: "hidden-source",
      emotionalTone: "still",
      visualBehavior: "stillness",
      explanation: "Der Brunnen zeigt Wasser als verborgenen Vorrat unter der sichtbaren Oberfläche.",
    },
    {
      source: "water",
      target: "spring",
      relation: "unfolds-into",
      weight: 0.84,
      layer: "existential",
      meaningQuality: "life",
      emotionalTone: "hope",
      visualBehavior: "emerging",
      explanation: "Die Quelle macht Wasser als Ursprung, Gabe und hervortretendes Leben sichtbar.",
    },
    {
      source: "water",
      target: "baptism",
      relation: "transforms",
      weight: 0.92,
      layer: "spiritual",
      meaningQuality: "purification",
      emotionalTone: "release",
      visualBehavior: "ripple",
      explanation: "Taufe verdichtet Wasser zu Reinigung, Untertauchen und neuer Geburt.",
    },
    {
      source: "water",
      target: "spirit",
      relation: "moves-over",
      weight: 0.88,
      layer: "biblical",
      meaningQuality: "movement",
      emotionalTone: "awakening",
      visualBehavior: "hovering",
      explanation: "Ruach ist die unsichtbare Bewegung über den Wassern, bevor feste Ordnung entsteht.",
    },
    {
      source: "water",
      target: "desert",
      relation: "contrasts",
      weight: 0.72,
      layer: "existential",
      meaningQuality: "lack",
      emotionalTone: "thirst",
      visualBehavior: "stillness",
      explanation: "Die Wüste macht Wasser durch Mangel, Durst und Suche kostbar.",
    },
    {
      source: "water",
      target: "rock",
      relation: "breaks-through",
      weight: 0.76,
      layer: "biblical",
      meaningQuality: "resistance",
      emotionalTone: "hope",
      visualBehavior: "emerging",
      explanation: "Der Fels zeigt Härte, aus der Wasser unerwartet hervorbricht.",
    },
    {
      source: "water",
      target: "light",
      relation: "reveals",
      weight: 0.7,
      layer: "visual",
      meaningQuality: "revelation",
      emotionalTone: "awakening",
      visualBehavior: "spark",
      explanation: "Licht fällt über die Tiefe und offenbart, was Wasser zunächst verbirgt.",
    },
    {
      source: "water",
      target: "genesis-1-2",
      relation: "scene-of",
      weight: 0.94,
      layer: "biblical",
      meaningQuality: "origin",
      emotionalTone: "awe",
      visualBehavior: "hovering",
      explanation: "Genesis 1,2 ist der biblische Anfangsraum: Geist, Wasser und Urtiefe stehen zusammen.",
    },
    {
      source: "water",
      target: "exodus-14",
      relation: "scene-of",
      weight: 0.88,
      layer: "biblical",
      meaningQuality: "transition",
      emotionalTone: "hope",
      visualBehavior: "parting",
      explanation: "Exodus 14 zeigt Wasser als Grenze, die zum Weg der Befreiung wird.",
    },
    {
      source: "sea",
      target: "exodus-14",
      relation: "opens-path",
      weight: 0.9,
      layer: "biblical",
      meaningQuality: "transition",
      emotionalTone: "hope",
      visualBehavior: "parting",
      explanation: "Das Meer im Exodus ist nicht nur Gefahr, sondern der Ort des Durchgangs.",
    },
    {
      source: "spirit",
      target: "genesis-1-2",
      relation: "moves-over",
      weight: 0.92,
      layer: "biblical",
      meaningQuality: "movement",
      emotionalTone: "awe",
      visualBehavior: "hovering",
      explanation: "Der Geist schwebt über den Wassern und macht Bewegung vor der Form sichtbar.",
    },
    {
      source: "desert",
      target: "rock",
      relation: "breaks-through",
      weight: 0.78,
      layer: "biblical",
      meaningQuality: "lack",
      emotionalTone: "thirst",
      visualBehavior: "emerging",
      explanation: "In der Wüste wird der Fels zum Ort, an dem Wasser im Mangel hervortritt.",
    },
    {
      source: "well",
      target: "spring",
      relation: "feeds",
      weight: 0.68,
      layer: "existential",
      meaningQuality: "hidden-source",
      emotionalTone: "tender",
      visualBehavior: "emerging",
      explanation: "Brunnen und Quelle teilen das Motiv verborgenen Wassers, das zur Gabe wird.",
    },
    {
      source: "light",
      target: "genesis-1-2",
      relation: "reveals",
      weight: 0.7,
      layer: "biblical",
      meaningQuality: "revelation",
      emotionalTone: "awakening",
      visualBehavior: "spark",
      explanation: "Licht steht als kommende Offenbarung über der noch dunklen Tiefe.",
    },
  ],
  primaryPaths: {
    water: ["water", "mayim", "mem", "yod", "genesis-1-2", "spirit", "exodus-14"],
    mayim: ["mayim", "water", "genesis-1-2", "spirit"],
    mem: ["mem", "mayim", "water", "genesis-1-2"],
    yod: ["yod", "mayim", "water", "light"],
    sea: ["sea", "water", "exodus-14", "desert"],
    well: ["well", "water", "spring"],
    spring: ["spring", "water", "well", "desert"],
    baptism: ["baptism", "water", "spirit", "light"],
    spirit: ["spirit", "genesis-1-2", "water", "baptism"],
    desert: ["desert", "water", "rock", "exodus-14"],
    rock: ["rock", "desert", "water", "spring"],
    light: ["light", "water", "genesis-1-2"],
    "genesis-1-2": ["genesis-1-2", "spirit", "water", "mayim"],
    "exodus-14": ["exodus-14", "sea", "water", "desert"],
  },
};

export function getNodeById(graph: SymbolGraph, id: NodeID) {
  return graph.nodes.find((node) => node.id === id);
}

export function getEdgesForNode(graph: SymbolGraph, nodeId: NodeID) {
  return graph.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
}

export function getConnectedNodes(graph: SymbolGraph, nodeId: NodeID) {
  return getEdgesForNode(graph, nodeId)
    .map((edge) => getNodeById(graph, edge.source === nodeId ? edge.target : edge.source))
    .filter((node): node is SymbolNode => Boolean(node));
}

export function getPrimaryPath(graph: SymbolGraph, startId: NodeID) {
  const explicitPath = graph.primaryPaths[startId];

  if (!explicitPath) {
    return [];
  }

  return explicitPath
    .map((id) => getNodeById(graph, id))
    .filter((node): node is SymbolNode => Boolean(node));
}

export function getNodesByDepth(graph: SymbolGraph, depthLevel: number) {
  return graph.nodes.filter((node) => node.depthLevel === depthLevel);
}

export function getStrongestConnections(graph: SymbolGraph, nodeId: NodeID, minWeight = 0.75) {
  return getEdgesForNode(graph, nodeId)
    .filter((edge) => edge.weight >= minWeight)
    .sort((a, b) => b.weight - a.weight);
}

export function getMostImportantRelation(graph: SymbolGraph, nodeId: NodeID) {
  return getStrongestConnections(graph, nodeId, 0)[0];
}
