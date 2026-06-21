import type { ResonanceConnection, ResonanceRegistry } from "./types";

export const resonanceConnections: ResonanceConnection[] = [
  {
    id: "resonance-tehom-majim",
    sourceId: "tehom",
    targetId: "majim",
    resonanceType: "meaning",
    title: "Tiefe vor dem Wasser",
    shortResonance: "Wasser traegt jetzt Ursprung und Tiefe.",
    explanation: "Tehom ist nicht einfach Wasser, sondern die uranfaengliche Tiefe, aus der das Wasserfeld seine Ursprungsschwere empfaengt.",
    strength: 0.96,
    scriptureAnchors: ["genesis-1-2"],
    hebrewAnchors: ["\u05ea\u05d4\u05d5\u05dd", "\u05de\u05d9\u05dd"],
  },
  {
    id: "resonance-tehom-davar",
    sourceId: "tehom",
    targetId: "davar",
    resonanceType: "expression",
    title: "Aus Tiefe wird Wort",
    shortResonance: "Aus der Verborgenheit erhebt sich Davar.",
    explanation: "Tehom bildet den verborgenen Ursprungsraum; Davar ist das Wort, das aus diesem Raum Richtung und Wirklichkeit hervorbringt.",
    strength: 0.95,
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
    hebrewAnchors: ["\u05ea\u05d4\u05d5\u05dd", "\u05d3\u05d1\u05e8"],
  },
  {
    id: "resonance-tehom-ruach",
    sourceId: "tehom",
    targetId: "ruach",
    resonanceType: "meaning",
    title: "Tiefe wird bewegt",
    shortResonance: "Ruach beruehrt die Tiefe vor dem Wort.",
    explanation: "Tehom bleibt nicht statische Tiefe: Ruach markiert die unsichtbare Bewegung ueber dem Ursprung.",
    strength: 0.97,
    scriptureAnchors: ["genesis-1-2"],
    hebrewAnchors: ["\u05ea\u05d4\u05d5\u05dd", "\u05e8\u05d5\u05d7"],
  },
  {
    id: "resonance-majim-ruach",
    sourceId: "majim",
    targetId: "ruach",
    resonanceType: "meaning",
    title: "Geist ueber den Wassern",
    shortResonance: "Majim wird vom Atem der Ruach beruehrt.",
    explanation: "Genesis 1,2 verbindet die Wasser des Anfangs mit der Ruach, die ueber ihnen schwebt.",
    strength: 0.98,
    scriptureAnchors: ["genesis-1-2"],
    hebrewAnchors: ["\u05de\u05d9\u05dd", "\u05e8\u05d5\u05d7"],
  },
  {
    id: "resonance-ruach-davar",
    sourceId: "ruach",
    targetId: "davar",
    resonanceType: "expression",
    title: "Atem traegt Wort",
    shortResonance: "Davar bewegt sich durch Ruach.",
    explanation: "Ruach ist die unsichtbare Atem- und Geistbruecke, durch die Davar vom verborgenen Ursprung in die Sprache treten kann.",
    strength: 0.93,
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
    hebrewAnchors: ["\u05e8\u05d5\u05d7", "\u05d3\u05d1\u05e8"],
  },
  {
    id: "resonance-ruach-qol",
    sourceId: "ruach",
    targetId: "qol",
    resonanceType: "expression",
    title: "Atem wird Stimme",
    shortResonance: "Ruach gibt Qol bewegte Gegenwart.",
    explanation: "Qol wird hoerbar, weil Stimme Atem braucht; Ruach verbindet Atem, Geist und Bewegung.",
    strength: 0.92,
    scriptureAnchors: [],
    hebrewAnchors: ["\u05e8\u05d5\u05d7", "\u05e7\u05d5\u05dc"],
  },
  {
    id: "resonance-ruach-or",
    sourceId: "ruach",
    targetId: "or",
    resonanceType: "revelation",
    title: "Bewegung oeffnet Licht",
    shortResonance: "Die Bewegung des Geistes oeffnet zur Sichtbarkeit.",
    explanation: "Ruach steht vor dem ausgesprochenen Licht als Bewegung, die Offenbarung vorbereitet.",
    strength: 0.9,
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
    hebrewAnchors: ["\u05e8\u05d5\u05d7", "\u05d0\u05d5\u05e8"],
  },
  {
    id: "resonance-tehom-midbar",
    sourceId: "tehom",
    targetId: "midbar",
    resonanceType: "meaning",
    title: "Tiefe im leeren Raum",
    shortResonance: "Tehom hallt im Midbar nach.",
    explanation: "Midbar traegt die Leere, in der das Wort hoerbar wird; Tehom traegt die verborgene Tiefe vor diesem Hervortreten.",
    strength: 0.86,
    scriptureAnchors: [],
    hebrewAnchors: ["\u05ea\u05d4\u05d5\u05dd", "\u05de\u05d3\u05d1\u05e8"],
  },
  {
    id: "resonance-tehom-or",
    sourceId: "tehom",
    targetId: "or",
    resonanceType: "revelation",
    title: "Vor dem Licht",
    shortResonance: "Die Tiefe geht dem Licht voraus.",
    explanation: "Bevor Or sichtbar wird, steht Tehom als verborgener Anfangsraum der Offenbarung.",
    strength: 0.94,
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
    hebrewAnchors: ["\u05ea\u05d4\u05d5\u05dd", "\u05d0\u05d5\u05e8"],
  },
  {
    id: "resonance-majim-midbar",
    sourceId: "majim",
    targetId: "midbar",
    resonanceType: "story",
    title: "Weg der Prüfung",
    shortResonance: "Erst die Leere zeigt, wonach die Tiefe sucht.",
    explanation: "",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-majim-lechem",
    sourceId: "majim",
    targetId: "lechem",
    resonanceType: "meaning",
    title: "Von der Quelle zur Nahrung",
    shortResonance: "Was aus der Tiefe kommt, wird zur Gabe.",
    explanation: "",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-midbar-lechem",
    sourceId: "midbar",
    targetId: "lechem",
    resonanceType: "story",
    title: "Manna",
    shortResonance: "Im Mangel wird Versorgung als Gabe sichtbar.",
    explanation: "",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-or-esch",
    sourceId: "or",
    targetId: "esch",
    resonanceType: "meaning",
    title: "Licht und Feuer",
    shortResonance: "Licht offenbart. Feuer verwandelt.",
    explanation: "Licht macht sichtbar, was verborgen war. Feuer führt das Sichtbare durch Wandlung.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-esch-davar",
    sourceId: "esch",
    targetId: "davar",
    resonanceType: "story",
    title: "Feuer und Wort",
    shortResonance: "Im Feuer wird das Wort hörbar.",
    explanation: "Am Dornbusch erscheint das Feuer nicht als Vernichtung, sondern als Ort der Stimme.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-or-davar",
    sourceId: "or",
    targetId: "davar",
    resonanceType: "meaning",
    title: "Licht und Wort",
    shortResonance: "Das Wort spricht. Das Licht macht sichtbar.",
    explanation: "In der Schöpfung steht das Wort am Anfang der Sichtbarkeit.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-davar-qol",
    sourceId: "davar",
    targetId: "qol",
    resonanceType: "expression",
    title: "Wort wird Stimme",
    shortResonance: "Das Wort wird hoerbar.",
    explanation: "Davar beschreibt das Wort; Qol beschreibt das Wort, das als Stimme in den Raum tritt.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: ["\u05d3\u05d1\u05e8", "\u05e7\u05d5\u05dc"],
  },
  {
    id: "resonance-qol-or",
    sourceId: "qol",
    targetId: "or",
    resonanceType: "revelation",
    title: "Stimme fuehrt zum Licht",
    shortResonance: "Die Stimme oeffnet Sichtbarkeit.",
    explanation: "Qol fuehrt vom gehoerten Ruf zur sichtbaren Orientierung von Or.",
    strength: 0.95,
    scriptureAnchors: ["genesis-1-3"],
    hebrewAnchors: ["\u05e7\u05d5\u05dc", "\u05d0\u05d5\u05e8"],
  },
  {
    id: "resonance-qol-midbar",
    sourceId: "qol",
    targetId: "midbar",
    resonanceType: "story",
    title: "Stimme in der Wueste",
    shortResonance: "Im leeren Raum wird die Stimme hoerbar.",
    explanation: "Midbar ist nicht nur Ort des Mangels; die Wueste wird zum Raum des Hoerens.",
    strength: 0.9,
    scriptureAnchors: [],
    hebrewAnchors: ["\u05e7\u05d5\u05dc", "\u05de\u05d3\u05d1\u05e8"],
  },
  {
    id: "resonance-midbar-davar",
    sourceId: "midbar",
    targetId: "davar",
    resonanceType: "expression",
    title: "Wort in der Wueste",
    shortResonance: "Im Midbar wird Davar empfangbar.",
    explanation: "Der reduzierte Raum des Midbar oeffnet die Wahrnehmung fuer Davar als Wort, das Richtung gibt.",
    strength: 0.86,
    scriptureAnchors: [],
    hebrewAnchors: ["\u05de\u05d3\u05d1\u05e8", "\u05d3\u05d1\u05e8"],
  },
];

let registry: ResonanceRegistry | null = null;

function createRegistry(): ResonanceRegistry {
  const byId = new Map<string, ResonanceConnection>();
  const bySource = new Map<string, ResonanceConnection[]>();
  const byTarget = new Map<string, ResonanceConnection[]>();

  resonanceConnections.forEach((connection) => {
    byId.set(connection.id, connection);

    const sourceConnections = bySource.get(connection.sourceId) ?? [];
    sourceConnections.push(connection);
    bySource.set(connection.sourceId, sourceConnections);

    const targetConnections = byTarget.get(connection.targetId) ?? [];
    targetConnections.push(connection);
    byTarget.set(connection.targetId, targetConnections);
  });

  return {
    connections: resonanceConnections,
    byId,
    bySource,
    byTarget,
  };
}

export function getResonanceRegistry(): ResonanceRegistry {
  registry ??= createRegistry();
  return registry;
}

export function getAllResonanceConnections(): ResonanceConnection[] {
  return getResonanceRegistry().connections;
}

export function getResonanceConnectionById(id: string): ResonanceConnection | undefined {
  return getResonanceRegistry().byId.get(id);
}

export function getResonanceConnectionsFromSource(sourceId: string): ResonanceConnection[] {
  return getResonanceRegistry().bySource.get(sourceId) ?? [];
}

export function getResonanceConnectionsToTarget(targetId: string): ResonanceConnection[] {
  return getResonanceRegistry().byTarget.get(targetId) ?? [];
}

export function getResonanceConnectionsForNode(nodeId: string): ResonanceConnection[] {
  const registry = getResonanceRegistry();
  return [
    ...(registry.bySource.get(nodeId) ?? []),
    ...(registry.byTarget.get(nodeId) ?? []),
  ];
}
