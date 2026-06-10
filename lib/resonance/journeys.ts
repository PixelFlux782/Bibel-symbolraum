import type { ResonanceJourney } from "./types";

export const resonanceJourneys: ResonanceJourney[] = [
  {
    id: "journey-wasser-wueste-brot",
    title: "Vom Ursprung zur Erfüllung",
    summary: "Wasser ist Ursprung.\nDie Wüste ist der Weg.\nDas Brot ist die Erfüllung.",
    nodePath: ["wasser", "wueste", "brot"],
    connectionIds: [
      "resonance-wasser-wueste",
      "resonance-wasser-brot",
      "resonance-wueste-brot",
    ],
    scriptureAnchors: ["exodus-14", "manna", "psalm-104"],
  },
];

export function getResonanceJourney(id: string): ResonanceJourney | undefined {
  return resonanceJourneys.find((journey) => journey.id === id);
}

export function getJourneysForNode(nodeId: string): ResonanceJourney[] {
  return resonanceJourneys.filter((journey) => journey.nodePath.includes(nodeId));
}
