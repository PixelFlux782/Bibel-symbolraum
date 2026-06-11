export type SymbolHierarchyLevel =
  | "cosmic_frame"
  | "archetype"
  | "symbol"
  | "story_anchor"
  | "verse_anchor"
  | "meta";

export type SymbolZoomLevel = "overview" | "focus" | "detail" | "deep";

export type SymbolHierarchyEntry = {
  id: string;
  title: string;
  level: SymbolHierarchyLevel;
  parentId?: string;
  clusterId?: string;
  visibleAtZoom: SymbolZoomLevel[];
  role: string;
  summary: string;
  relatedSymbolIds: string[];
};

export const SYMBOL_HIERARCHY_LEVELS: SymbolHierarchyLevel[] = [
  "cosmic_frame",
  "archetype",
  "symbol",
  "story_anchor",
  "verse_anchor",
  "meta",
];

export const SYMBOL_ZOOM_LEVELS: SymbolZoomLevel[] = [
  "overview",
  "focus",
  "detail",
  "deep",
];

export const SYMBOL_HIERARCHY: SymbolHierarchyEntry[] = [
  {
    id: "himmel",
    title: "Himmel",
    level: "cosmic_frame",
    clusterId: "creation-frame",
    visibleAtZoom: ["overview", "focus"],
    role: "Kosmischer Hintergrundraum fuer Hoehe, Weite, Ordnung und Gottesnaehe.",
    summary: "Himmel rahmt das Symbolnetz als grosser Deutungscontainer oberhalb einzelner Archetypen.",
    relatedSymbolIds: ["erde", "licht"],
  },
  {
    id: "erde",
    title: "Erde",
    level: "cosmic_frame",
    clusterId: "creation-frame",
    visibleAtZoom: ["overview", "focus"],
    role: "Kosmischer Hintergrundraum fuer Grund, Schoepfung, Ort und Leiblichkeit.",
    summary: "Erde rahmt das Symbolnetz als tragender Deutungscontainer fuer konkrete Lebensraeume.",
    relatedSymbolIds: ["himmel", "wasser", "baum"],
  },
  {
    id: "wasser",
    title: "Wasser",
    level: "archetype",
    clusterId: "creation-elements",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Hauptsymbol fuer Tiefe, Leben, Reinigung, Grenze und Uebergang.",
    summary: "Wasser bleibt ein tragender Archetyp, unter dem spaeter Quelle, Meer, Brunnen oder Fluss liegen koennen.",
    relatedSymbolIds: ["licht", "brot", "wueste", "erde"],
  },
  {
    id: "quelle",
    title: "Quelle",
    level: "symbol",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["detail"],
    role: "Unterraum von Wasser.",
    summary: "Ursprung des Wassers.",
    relatedSymbolIds: ["wasser"],
  },
  {
    id: "brunnen",
    title: "Brunnen",
    level: "symbol",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["detail"],
    role: "Unterraum von Wasser.",
    summary: "Verborgene Tiefe.",
    relatedSymbolIds: ["wasser"],
  },
  {
    id: "meer",
    title: "Meer",
    level: "symbol",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["detail"],
    role: "Unterraum von Wasser.",
    summary: "Unbegrenzte Weite.",
    relatedSymbolIds: ["wasser"],
  },
  {
    id: "fluss",
    title: "Fluss",
    level: "symbol",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["detail"],
    role: "Unterraum von Wasser.",
    summary: "Bewegung des Lebens.",
    relatedSymbolIds: ["wasser"],
  },
  {
    id: "tau",
    title: "Tau",
    level: "symbol",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["detail"],
    role: "Unterraum von Wasser.",
    summary: "Wasser des Himmels.",
    relatedSymbolIds: ["wasser"],
  },
  {
    id: "schoepfung-wasser",
    title: "Wasser der Schöpfung",
    level: "story_anchor",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["deep"],
    role: "Biblischer Tiefenpunkt von Wasser.",
    summary: "Der Geist schwebt ueber den Wassern.",
    relatedSymbolIds: ["wasser", "genesis-1-2"],
  },
  {
    id: "schilfmeer",
    title: "Schilfmeer",
    level: "story_anchor",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["deep"],
    role: "Biblischer Tiefenpunkt von Wasser.",
    summary: "Das Wasser wird zum Durchgang.",
    relatedSymbolIds: ["wasser"],
  },
  {
    id: "felswasser",
    title: "Wasser aus dem Felsen",
    level: "story_anchor",
    parentId: "wasser",
    clusterId: "wasser",
    visibleAtZoom: ["deep"],
    role: "Biblischer Tiefenpunkt von Wasser.",
    summary: "In der Wueste wird der Fels zur Quelle.",
    relatedSymbolIds: ["wasser", "wueste"],
  },
  {
    id: "genesis-1-2",
    title: "Genesis 1:2",
    level: "verse_anchor",
    parentId: "schoepfung-wasser",
    clusterId: "wasser",
    visibleAtZoom: ["deep"],
    role: "Versanker fuer Wasser der Schoepfung.",
    summary: "Wasser als Ur-Tiefe der Schöpfung.",
    relatedSymbolIds: ["wasser", "schoepfung-wasser"],
  },
  {
    id: "licht",
    title: "Licht",
    level: "archetype",
    clusterId: "creation-elements",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Hauptsymbol fuer Klarheit, Offenbarung, Orientierung und Schoepfungsanfang.",
    summary: "Licht bleibt ein tragender Archetyp fuer Sichtbarwerden, Erkenntnis und fuehrende Helle.",
    relatedSymbolIds: ["wasser", "feuer", "himmel", "brot"],
  },
  {
    id: "feuer",
    title: "Feuer",
    level: "archetype",
    clusterId: "presence-and-transformation",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Hauptsymbol fuer Gegenwart, Ruf, Fuehrung, Laeuterung und Verwandlung.",
    summary: "Feuer bleibt ein tragender Archetyp fuer brennende Gegenwart und verwandelnde Energie.",
    relatedSymbolIds: ["licht", "wueste", "berg"],
  },
  {
    id: "wueste",
    title: "Wüste",
    level: "archetype",
    clusterId: "journey-and-testing",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Hauptsymbol fuer Reduktion, Pruefung, Mangel, Stille und Hoeren.",
    summary: "Wueste bleibt ein tragender Archetyp fuer Leere, Wegstrecke und empfangene Versorgung.",
    relatedSymbolIds: ["wasser", "brot", "feuer", "weg"],
  },
  {
    id: "brot",
    title: "Brot",
    level: "archetype",
    clusterId: "provision-and-life",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Hauptsymbol fuer Nahrung, Gabe, Alltag, Teilung und Gemeinschaft.",
    summary: "Brot bleibt ein tragender Archetyp fuer Versorgung, Tischgemeinschaft und taegliche Gabe.",
    relatedSymbolIds: ["wasser", "licht", "wueste", "haus"],
  },
  {
    id: "baum",
    title: "Baum",
    level: "archetype",
    clusterId: "life-and-growth",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Vorbereiteter Archetyp fuer Wurzel, Wachstum, Frucht und Verbindung von Erde und Himmel.",
    summary: "Baum ist als spaeteres Hauptsymbol vorbereitet, wird durch diese Registry aber nicht sichtbar geschaltet.",
    relatedSymbolIds: ["wasser", "licht", "erde", "himmel"],
  },
  {
    id: "berg",
    title: "Berg",
    level: "archetype",
    clusterId: "encounter-and-height",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Vorbereiteter Archetyp fuer Erhebung, Schwelle, Gottesbegegnung und hoeheren Blick.",
    summary: "Berg ist als spaeteres Hauptsymbol vorbereitet, wird durch diese Registry aber nicht sichtbar geschaltet.",
    relatedSymbolIds: ["feuer", "weg", "himmel"],
  },
  {
    id: "weg",
    title: "Weg",
    level: "archetype",
    clusterId: "journey-and-testing",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Vorbereiteter Archetyp fuer Richtung, Entscheidung, Reise und Nachfolge.",
    summary: "Weg ist als spaeteres Hauptsymbol vorbereitet, wird durch diese Registry aber nicht sichtbar geschaltet.",
    relatedSymbolIds: ["wueste", "berg", "licht"],
  },
  {
    id: "haus",
    title: "Haus",
    level: "archetype",
    clusterId: "dwelling-and-community",
    visibleAtZoom: ["overview", "focus", "detail"],
    role: "Vorbereiteter Archetyp fuer Wohnen, Schutz, Zugehoerigkeit und Gemeinschaft.",
    summary: "Haus ist als spaeteres Hauptsymbol vorbereitet, wird durch diese Registry aber nicht sichtbar geschaltet.",
    relatedSymbolIds: ["brot", "erde"],
  },
  {
    id: "wort",
    title: "Wort",
    level: "meta",
    clusterId: "resonance-meta",
    visibleAtZoom: ["detail", "deep"],
    role: "Meta- und Resonanzknoten fuer Sprache, Ruf, Bedeutung und Offenbarung.",
    summary: "Wort bleibt kein Hauptsymbol, weil es eher Beziehungen deutet und Resonanzen buendelt, als einen eigenen Symbolraum zu tragen.",
    relatedSymbolIds: ["licht", "wueste"],
  },
];

const hierarchyById = new Map(SYMBOL_HIERARCHY.map((entry) => [entry.id, entry]));

export function getHierarchyEntry(id: string) {
  return hierarchyById.get(id);
}

export function getEntriesByLevel(level: SymbolHierarchyLevel) {
  return SYMBOL_HIERARCHY.filter((entry) => entry.level === level);
}

export function getVisibleEntriesForZoom(zoomLevel: SymbolZoomLevel) {
  return SYMBOL_HIERARCHY.filter((entry) => entry.visibleAtZoom.includes(zoomLevel));
}

export function getChildrenOf(parentId: string) {
  return SYMBOL_HIERARCHY.filter((entry) => entry.parentId === parentId);
}

export function isTopLevelSymbol(id: string) {
  return getHierarchyEntry(id)?.level === "archetype";
}

export function isMetaNode(id: string) {
  return getHierarchyEntry(id)?.level === "meta";
}
