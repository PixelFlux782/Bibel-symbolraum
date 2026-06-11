import type { ResonanceConnection, ResonanceRegistry } from "./types";

export const resonanceConnections: ResonanceConnection[] = [
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
  {
    id: "resonance-licht-feuer",
    sourceId: "licht",
    targetId: "feuer",
    resonanceType: "meaning",
    title: "Licht und Feuer",
    shortResonance: "Licht offenbart. Feuer verwandelt.",
    explanation: "Licht macht sichtbar, was verborgen war. Feuer führt das Sichtbare durch Wandlung.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-feuer-wort",
    sourceId: "feuer",
    targetId: "wort",
    resonanceType: "story",
    title: "Feuer und Wort",
    shortResonance: "Im Feuer wird das Wort hörbar.",
    explanation: "Am Dornbusch erscheint das Feuer nicht als Vernichtung, sondern als Ort der Stimme.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
  },
  {
    id: "resonance-licht-wort",
    sourceId: "licht",
    targetId: "wort",
    resonanceType: "meaning",
    title: "Licht und Wort",
    shortResonance: "Das Wort spricht. Das Licht macht sichtbar.",
    explanation: "In der Schöpfung steht das Wort am Anfang der Sichtbarkeit.",
    strength: 1,
    scriptureAnchors: [],
    hebrewAnchors: [],
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
