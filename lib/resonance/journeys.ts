import type { ResonanceJourney } from "./types";

export const resonanceJourneys: ResonanceJourney[] = [
  {
    id: "journey-genesis-ursprungspfad",
    title: "Genesis Ursprungspfad",
    summary: "Der Ursprung wird gesetzt.\nDie Tiefe wird bewegt.\nWasser und Ruach tragen das Wort.\nLicht macht sichtbar.",
    nodePath: ["genesis-1-1", "genesis-1-2", "tehom", "wasser", "ruach", "amar", "genesis-1-3", "or", "licht"],
    connectionIds: [
      "resonance-genesis-1-1-genesis-1-2",
      "resonance-genesis-1-2-tehom",
      "resonance-genesis-1-2-wasser",
      "resonance-tehom-ruach",
      "resonance-genesis-1-2-genesis-1-3",
      "resonance-amar-or",
      "resonance-genesis-1-3-or",
      "resonance-genesis-1-3-licht",
    ],
    scriptureAnchors: ["genesis-1-1", "genesis-1-2", "genesis-1-3"],
  },
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
    summary: "Die Tiefe wird bewegt.\nDas Wort wird getragen.\nDie Stimme wird hörbar.\nDas Licht erscheint.",
    nodePath: ["tehom", "ruach", "davar", "qol", "or"],
    connectionIds: [
      "resonance-tehom-ruach",
      "resonance-ruach-davar",
      "resonance-davar-qol",
      "resonance-qol-or",
    ],
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
  },
  {
    id: "journey-hebraeische-schoepfung",
    title: "Hebräische Schöpfung",
    summary: "Bereschit öffnet.\nBara ruft.\nTehom wird bewegt.\nSchamajim und Erez werden Raum.\nOr macht sichtbar.",
    nodePath: ["bereschit", "bara", "tehom", "ruach", "schamajim", "or", "erez"],
    connectionIds: [
      "resonance-bereschit-tehom",
      "resonance-phase36a-bara-schamajim",
      "resonance-tehom-ruach",
      "resonance-ruach-or",
      "resonance-phase36a-schamajim-majim",
      "resonance-phase36a-bara-erez",
    ],
    scriptureAnchors: ["genesis-1-1", "genesis-1-2", "genesis-1-3"],
  },
  {
    id: "journey-wasser-resonanznetz",
    title: "Wasser Resonanznetz",
    summary: "Majim trägt Tiefe.\nTehom wird von Ruach bewegt.\nJordan und Mikwe machen Wasser zur Schwelle.\nTahor führt ins Licht.",
    nodePath: ["majim", "tehom", "ruach", "schamajim", "nahar", "jordan", "mikwe", "tahor", "or"],
    connectionIds: [
      "resonance-tehom-majim",
      "resonance-tehom-ruach",
      "resonance-majim-ruach",
      "resonance-phase36a-schamajim-majim",
      "resonance-phase36a-nahar-jordan",
      "resonance-phase36a-jordan-mikwe",
      "resonance-phase36a-mikwe-tahor",
      "resonance-phase36a-tahor-or",
    ],
    scriptureAnchors: ["genesis-1-2", "exodus-14", "matthew-3-13-17"],
  },
  {
    id: "journey-wueste-sinai-stimme",
    title: "Wüste, Sinai, Stimme",
    summary: "Midbar wird Derech.\nNes sammelt Orientierung.\nSinai lässt Qol hören.\nKavod erscheint in Feuer.",
    nodePath: ["midbar", "derech", "nes", "sinai", "qol", "kavod"],
    connectionIds: [
      "resonance-phase36a-midbar-derech",
      "resonance-phase36a-derech-nes",
      "resonance-phase36a-derech-sinai",
      "resonance-phase36a-sinai-qol",
      "resonance-phase36a-kavod-sinai",
    ],
    scriptureAnchors: ["deuteronomy-8", "exodus-17", "exodus-19", "exodus-24"],
  },
  {
    id: "journey-brot-korn-mahl",
    title: "Brot, Korn, Mahl",
    summary: "Lechem wird Manna im Mangel.\nDagan wächst verborgen.\nShever bricht.\nSeudah teilt.",
    nodePath: ["lechem", "manna", "dagan", "shever", "seudah"],
    connectionIds: [
      "resonance-phase36a-lechem-manna",
      "resonance-phase36a-manna-dagan",
      "resonance-phase36a-dagan-shever",
      "resonance-phase36a-shever-seudah",
    ],
    scriptureAnchors: ["exodus-16", "deuteronomy-8", "genesis-42"],
  },
];

export function getResonanceJourney(id: string): ResonanceJourney | undefined {
  return resonanceJourneys.find((journey) => journey.id === id);
}

export function getJourneysForNode(nodeId: string): ResonanceJourney[] {
  return resonanceJourneys.filter((journey) => journey.nodePath.includes(nodeId));
}
