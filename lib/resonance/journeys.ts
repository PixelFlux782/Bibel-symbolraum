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
  {
    id: "journey-licht-feuer-wort",
    title: "Von der Offenbarung zur Stimme",
    summary: "Licht macht sichtbar.\nFeuer verwandelt.\nDas Wort ruft.",
    nodePath: ["licht", "feuer", "wort"],
    connectionIds: [
      "resonance-licht-feuer",
      "resonance-feuer-wort",
      "resonance-licht-wort",
    ],
    scriptureAnchors: ["genesis-1-3", "exodus-3-2", "john-1-1"],
  },
];

export function getResonanceJourney(id: string): ResonanceJourney | undefined {
  return resonanceJourneys.find((journey) => journey.id === id);
}

export function getJourneysForNode(nodeId: string): ResonanceJourney[] {
  return resonanceJourneys.filter((journey) => journey.nodePath.includes(nodeId));
}
