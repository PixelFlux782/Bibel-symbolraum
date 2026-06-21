import type { ResonanceJourney } from "./types";

export const resonanceJourneys: ResonanceJourney[] = [
  {
    id: "journey-wasser-wueste-brot",
    title: "Vom Ursprung zur Erfüllung",
    summary: "Wasser ist Ursprung.\nDie Wüste ist der Weg.\nDas Brot ist die Erfüllung.",
    nodePath: ["majim", "midbar", "lechem"],
    connectionIds: [
      "resonance-majim-midbar",
      "resonance-majim-lechem",
      "resonance-midbar-lechem",
    ],
    scriptureAnchors: ["exodus-14", "manna", "psalm-104"],
  },
  {
    id: "journey-licht-feuer-wort",
    title: "Von der Offenbarung zur Stimme",
    summary: "Licht macht sichtbar.\nFeuer verwandelt.\nDas Wort ruft.",
    nodePath: ["or", "esch", "davar"],
    connectionIds: [
      "resonance-or-esch",
      "resonance-esch-davar",
      "resonance-or-davar",
    ],
    scriptureAnchors: ["genesis-1-3", "exodus-3-2", "john-1-1"],
  },
  {
    id: "davar-qol-or",
    title: "Vom Wort zum Licht",
    summary: "Das Wort wird Stimme.\nDie Stimme wird Licht.",
    nodePath: ["davar", "qol", "or"],
    connectionIds: [
      "resonance-davar-qol",
      "resonance-qol-or",
    ],
    scriptureAnchors: ["genesis-1-3"],
  },
  {
    id: "tehom-davar-qol-or",
    title: "Von der Tiefe zum Licht",
    summary: "Die Tiefe birgt das Wort.\nDas Wort wird Stimme.\nDie Stimme wird Licht.",
    nodePath: ["tehom", "davar", "qol", "or"],
    connectionIds: [
      "resonance-tehom-davar",
      "resonance-davar-qol",
      "resonance-qol-or",
    ],
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
  },
  {
    id: "tehom-ruach-davar-qol-or",
    title: "Vom Ursprung zum Licht",
    summary: "Die Tiefe wird bewegt.\nDas Wort wird getragen.\nDie Stimme wird hoerbar.\nDas Licht erscheint.",
    nodePath: ["tehom", "ruach", "davar", "qol", "or"],
    connectionIds: [
      "resonance-tehom-ruach",
      "resonance-ruach-davar",
      "resonance-davar-qol",
      "resonance-qol-or",
    ],
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
  },
];

export function getResonanceJourney(id: string): ResonanceJourney | undefined {
  return resonanceJourneys.find((journey) => journey.id === id);
}

export function getJourneysForNode(nodeId: string): ResonanceJourney[] {
  return resonanceJourneys.filter((journey) => journey.nodePath.includes(nodeId));
}
