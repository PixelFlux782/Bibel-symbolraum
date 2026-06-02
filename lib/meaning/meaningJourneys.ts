import type { MeaningJourney } from "@/types/meaningGraph";

export const meaningJourneys: MeaningJourney[] = [
  {
    id: "creation",
    title: "Schoepfung",
    description: "Aus der noch verborgenen Tiefe des Wassers tritt Licht hervor und macht Schoepfung sichtbar.",
    symbolPath: ["wasser", "licht"],
    meaningNodePath: ["depth", "revelation"],
    biblicalReferences: ["genesis-1-2", "genesis-1-3"],
  },
  {
    id: "purification",
    title: "Reinigung",
    description: "Wasser klaert und Feuer verwandelt: Reinigung wird als Weg durch zwei elementare Symbolraeume lesbar.",
    symbolPath: ["wasser", "feuer"],
    meaningNodePath: ["purification", "transformation"],
    biblicalReferences: ["matthew-3-13-17", "malachi-3-2-3"],
  },
  {
    id: "revelation",
    title: "Offenbarung",
    description: "Feuer macht Gegenwart erfahrbar; Licht laesst das zuvor Verborgene hervortreten.",
    symbolPath: ["feuer", "licht"],
    meaningNodePath: ["presence", "revelation"],
    biblicalReferences: ["exodus-3-2", "exodus-13-21", "john-1-4-5"],
  },
  {
    id: "wilderness-path",
    title: "Weg durch die Wueste",
    description: "Der Weg fuehrt vom Wasser durch die Wueste in sichtbare Orientierung und weiter zur Gegenwart des Feuers.",
    symbolPath: ["wasser", "wueste", "licht", "feuer"],
    meaningNodePath: ["transition", "desert", "guidance", "presence"],
    biblicalReferences: ["exodus-14", "exodus-wilderness", "deuteronomy-8", "exodus-13-21"],
  },
];

export function getMeaningJourney(id: string): MeaningJourney | undefined {
  return meaningJourneys.find((journey) => journey.id === id);
}
