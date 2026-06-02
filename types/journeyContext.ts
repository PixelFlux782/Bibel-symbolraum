import type { MeaningNodeId } from "@/types/meaningGraph";

export interface JourneyContext {
  journeyId: string;
  fromSymbolSlug?: string;
  toSymbolSlug: string;
  suggestedStateId?: string;
  meaningNodeIds?: MeaningNodeId[];
  biblicalReferenceIds?: string[];
  bridgeText?: string;
}

export interface JourneyEntryTarget {
  journeyId: string;
  toSymbolSlug: string;
  suggestedStateId: string;
  meaningNodeIds?: MeaningNodeId[];
  biblicalReferenceIds?: string[];
  bridgeText?: string;
}

export interface JourneyRouteHint {
  journeyId: string;
  fromSymbolSlug?: string;
  toSymbolSlug: string;
}
