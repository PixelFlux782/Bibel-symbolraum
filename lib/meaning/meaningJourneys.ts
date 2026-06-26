import type { MeaningJourney } from "@/types/meaningGraph";

export const meaningJourneys: MeaningJourney[] = [
  {
    id: "creation",
    title: "Schöpfung",
    description: "Aus der noch verborgenen Tiefe des Wassers tritt Licht hervor und macht Schöpfung sichtbar.",
    symbolPath: ["wasser", "licht"],
    meaningNodePath: ["depth", "revelation"],
    biblicalReferences: ["genesis-1-2", "genesis-1-3"],
  },
  {
    id: "purification",
    title: "Reinigung",
    description: "Wasser klärt und Feuer verwandelt: Reinigung wird als Weg durch zwei elementare Symbolräume lesbar.",
    symbolPath: ["wasser", "feuer"],
    meaningNodePath: ["purification", "transformation"],
    biblicalReferences: ["matthew-3-13-17", "malachi-3-2-3"],
  },
  {
    id: "revelation",
    title: "Offenbarung",
    description: "Feuer macht Gegenwart erfahrbar; Licht lässt das zuvor Verborgene hervortreten.",
    symbolPath: ["feuer", "licht"],
    meaningNodePath: ["presence", "revelation"],
    biblicalReferences: ["exodus-3-2", "exodus-13-21", "john-1-4-5"],
  },
  {
    id: "wilderness-path",
    title: "Weg durch die Wüste",
    description: "Der Weg führt vom Wasser durch die Wüste in sichtbare Orientierung und weiter zur Gegenwart des Feuers.",
    symbolPath: ["wasser", "wueste", "licht", "feuer"],
    meaningNodePath: ["transition", "desert", "guidance", "presence"],
    biblicalReferences: ["exodus-14", "exodus-wilderness", "deuteronomy-8", "exodus-13-21"],
  },
  {
    id: "bread-path",
    title: "Weg zum Brot",
    description: "Wasser trägt Wachstum, Licht lässt reifen, Feuer verwandelt und in der Wüste wird Brot als Gabe für den Weg sichtbar.",
    symbolPath: ["wasser", "licht", "feuer", "wueste", "brot"],
    meaningNodePath: ["life", "revelation", "transformation", "lack", "gift", "nourishment"],
    biblicalReferences: ["mark-4-26-29", "exodus-16-4", "deuteronomy-8-3", "john-6-35"],
  },
  {
    id: "davar-qol-or",
    title: "Vom Wort zum Licht",
    description: "Das Wort wird Stimme. Die Stimme wird Licht.",
    symbolPath: ["davar", "qol", "or"],
    meaningNodePath: ["word", "voice", "light"],
    biblicalReferences: ["genesis-1-3"],
  },
  {
    id: "tehom-davar-qol-or",
    title: "Von der Tiefe zum Licht",
    description: "Die Tiefe birgt das Wort. Das Wort wird Stimme. Die Stimme wird Licht.",
    symbolPath: ["tehom", "davar", "qol", "or"],
    meaningNodePath: ["depth", "word", "voice", "light"],
    biblicalReferences: ["genesis-1-2", "genesis-1-3"],
  },
  {
    id: "tehom-ruach-davar-qol-or",
    title: "Vom Ursprung zum Licht",
    description: "Die Tiefe wird bewegt. Das Wort wird getragen. Die Stimme wird hörbar. Das Licht erscheint.",
    symbolPath: ["tehom", "ruach", "davar", "qol", "or"],
    meaningNodePath: ["depth", "presence", "word", "voice", "light"],
    biblicalReferences: ["genesis-1-2", "genesis-1-3"],
  },
];

export function getMeaningJourney(id: string): MeaningJourney | undefined {
  return meaningJourneys.find((journey) => journey.id === id);
}
