import { getJourneyContext } from "@/lib/meaning/getJourneyContext";

export type RoomSearchParams = Promise<Record<string, string | string[] | undefined>>;

type ResolveRoomInitialStateIdOptions = {
  searchParams: Awaited<RoomSearchParams>;
  toSymbolSlug: string;
  validStateIds: string[];
};

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

export function resolveRoomInitialStateId({
  searchParams,
  toSymbolSlug,
  validStateIds,
}: ResolveRoomInitialStateIdOptions): string | undefined {
  const stateId = getSingleSearchParam(searchParams.state);

  if (stateId && validStateIds.includes(stateId)) {
    return stateId;
  }

  const journeyId = getSingleSearchParam(searchParams.journey);

  if (!journeyId) {
    return undefined;
  }

  const journeyContext = getJourneyContext({
    journeyId,
    fromSymbolSlug: getSingleSearchParam(searchParams.from),
    toSymbolSlug,
  });
  const suggestedStateId = journeyContext?.suggestedStateId;

  return suggestedStateId && validStateIds.includes(suggestedStateId) ? suggestedStateId : undefined;
}
