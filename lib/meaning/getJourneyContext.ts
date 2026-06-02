import { getJourneyEntryTarget } from "@/lib/meaning/journeyEntryTargets";
import { getMeaningJourney } from "@/lib/meaning/meaningJourneys";
import type { JourneyContext, JourneyRouteHint } from "@/types/journeyContext";

const journeyAliases: Record<string, string> = {
  schoepfung: "creation",
  reinigung: "purification",
  offenbarung: "revelation",
  "weg-durch-die-wueste": "wilderness-path",
};

function resolveJourneyId(journeyId: string): string {
  return journeyAliases[journeyId] ?? journeyId;
}

export function getJourneyContext({
  journeyId,
  fromSymbolSlug,
  toSymbolSlug,
}: JourneyRouteHint): JourneyContext | null {
  const resolvedJourneyId = resolveJourneyId(journeyId);
  const journey = getMeaningJourney(resolvedJourneyId);

  if (!journey || !journey.symbolPath.includes(toSymbolSlug)) {
    return null;
  }

  const target = getJourneyEntryTarget(resolvedJourneyId, toSymbolSlug);

  return {
    journeyId: journey.id,
    fromSymbolSlug,
    toSymbolSlug,
    suggestedStateId: target?.suggestedStateId,
    meaningNodeIds: target?.meaningNodeIds ?? journey.meaningNodePath,
    biblicalReferenceIds: target?.biblicalReferenceIds ?? journey.biblicalReferences,
    bridgeText: target?.bridgeText ?? journey.description,
  };
}
