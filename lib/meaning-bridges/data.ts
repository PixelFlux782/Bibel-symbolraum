import type { MeaningBridge } from "./types";

/**
 * Initial bridge data set.
 * These bridges represent semantic pathways between symbols and concepts.
 */
export const meaningBridgesData: MeaningBridge[] = [
  {
    id: "bridge-chaos-licht",
    sourceId: "genesis-1-2",
    targetId: "genesis-1-3",
    title: "Vom Chaos zum Licht",
    summary:
      "Über den Wassern ruht die Möglichkeit.\nIm Licht wird sie sichtbar.",
    meaningFields: ["depth", "revelation", "light"],
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
    tags: ["genesis", "creation", "cosmic-order"],
    hebrewConnections: [
      {
        hebrewWordId: "majim",
        hebrew: "מים",
        transliteration: "majim",
        meaning: "Wasser - Urgrund",
      },
      {
        hebrewWordId: "or",
        hebrew: "אור",
        transliteration: "or",
        meaning: "Licht - Offenbarung",
      },
    ],
  },

  {
    id: "bridge-wasser-licht",
    sourceId: "majim",
    targetId: "or",
    title: "Von der Tiefe zur Offenbarung",
    summary: "Die Tiefe empfängt.\nDas Licht offenbart.",
    meaningFields: ["depth", "revelation"],
    scriptureAnchors: ["genesis-1-2", "genesis-1-3"],
    tags: ["water", "light", "transformation"],
    hebrewConnections: [
      {
        hebrewWordId: "majim",
        hebrew: "מים",
        transliteration: "majim",
        meaning: "Wasser - Empfängnis",
      },
      {
        hebrewWordId: "or",
        hebrew: "אור",
        transliteration: "or",
        meaning: "Licht - Sichtbarkeit",
      },
    ],
  },

  {
    id: "bridge-wueste-feuer",
    sourceId: "midbar",
    targetId: "esch",
    title: "Von der Leere zur Verwandlung",
    summary:
      "In der Leere wird sichtbar,\nwas zuvor verborgen war.",
    meaningFields: ["transformation", "revelation"],
    tags: ["desert", "fire", "testing"],
    hebrewConnections: [
      {
        hebrewWordId: "midbar",
        hebrew: "מדבר",
        transliteration: "midbar",
        meaning: "Wüste - Leere",
      },
      {
        hebrewWordId: "esch",
        hebrew: "אש",
        transliteration: "esch",
        meaning: "Feuer - Verwandlung",
      },
    ],
  },

  {
    id: "bridge-feuer-licht",
    sourceId: "esch",
    targetId: "or",
    title: "Vom Verzehren zum Sichtbarwerden",
    summary: "Das Feuer verwandelt.\nDas Licht macht sichtbar.",
    meaningFields: ["transformation", "revelation"],
    tags: ["fire", "light", "transformation"],
    hebrewConnections: [
      {
        hebrewWordId: "esch",
        hebrew: "אש",
        transliteration: "esch",
        meaning: "Feuer - Kraft",
      },
      {
        hebrewWordId: "or",
        hebrew: "אור",
        transliteration: "or",
        meaning: "Licht - Sichtbarkeit",
      },
    ],
  },
];
