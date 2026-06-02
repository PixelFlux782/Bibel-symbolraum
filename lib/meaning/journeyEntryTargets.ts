import type { JourneyEntryTarget } from "@/types/journeyContext";

export const journeyEntryTargets: JourneyEntryTarget[] = [
  {
    journeyId: "creation",
    toSymbolSlug: "wasser",
    suggestedStateId: "before-order",
    meaningNodeIds: ["depth"],
    biblicalReferenceIds: ["genesis-1-2"],
  },
  {
    journeyId: "creation",
    toSymbolSlug: "licht",
    suggestedStateId: "let-there-be-light",
    meaningNodeIds: ["revelation"],
    biblicalReferenceIds: ["genesis-1-3"],
    bridgeText: "Aus der noch verborgenen Tiefe des Wassers tritt Licht hervor und macht Schoepfung sichtbar.",
  },
  {
    journeyId: "purification",
    toSymbolSlug: "wasser",
    suggestedStateId: "cleansing",
    meaningNodeIds: ["purification"],
    biblicalReferenceIds: ["matthew-3-13-17"],
  },
  {
    journeyId: "purification",
    toSymbolSlug: "feuer",
    suggestedStateId: "refining-fire",
    meaningNodeIds: ["purification", "transformation"],
    biblicalReferenceIds: ["malachi-3-2-3"],
    bridgeText: "Wasser klaert und Feuer verwandelt: Reinigung wird als Weg durch zwei elementare Symbolraeume lesbar.",
  },
  {
    journeyId: "revelation",
    toSymbolSlug: "feuer",
    suggestedStateId: "burning-bush",
    meaningNodeIds: ["presence"],
    biblicalReferenceIds: ["exodus-3-2"],
  },
  {
    journeyId: "revelation",
    toSymbolSlug: "licht",
    suggestedStateId: "let-there-be-light",
    meaningNodeIds: ["presence", "revelation"],
    biblicalReferenceIds: ["exodus-13-21", "john-1-4-5"],
    bridgeText: "Feuer macht Gegenwart erfahrbar; Licht laesst das zuvor Verborgene hervortreten.",
  },
  {
    journeyId: "wilderness-path",
    toSymbolSlug: "wasser",
    suggestedStateId: "source",
    meaningNodeIds: ["transition"],
    biblicalReferenceIds: ["exodus-14"],
  },
  {
    journeyId: "wilderness-path",
    toSymbolSlug: "wueste",
    suggestedStateId: "guidance",
    meaningNodeIds: ["desert", "guidance"],
    biblicalReferenceIds: ["exodus-wilderness", "deuteronomy-8", "exodus-13-21"],
    bridgeText: "In der Wueste wird aus dem Weg durch den Mangel eine Suche nach Fuehrung.",
  },
  {
    journeyId: "wilderness-path",
    toSymbolSlug: "licht",
    suggestedStateId: "light-on-the-way",
    meaningNodeIds: ["guidance", "presence"],
    biblicalReferenceIds: ["exodus-13-21"],
    bridgeText: "Licht wird in der Wueste zur Fuehrung.",
  },
  {
    journeyId: "wilderness-path",
    toSymbolSlug: "feuer",
    suggestedStateId: "pillar-of-fire",
    meaningNodeIds: ["guidance", "presence"],
    biblicalReferenceIds: ["exodus-13-21"],
    bridgeText: "Die Feuersaeule verbindet die dunkle Weite mit tragender Gegenwart.",
  },
];

export function getJourneyEntryTarget(
  journeyId: string,
  toSymbolSlug: string,
): JourneyEntryTarget | undefined {
  return journeyEntryTargets.find(
    (target) => target.journeyId === journeyId && target.toSymbolSlug === toSymbolSlug,
  );
}
