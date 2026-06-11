import { getJourneyContext } from "@/lib/meaning/getJourneyContext";

export type RoomSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type SymbolNetworkRoomLens = "overview" | "meaning" | "hebrew" | "gematria" | "story";
export type SymbolNetworkRoomContext = {
  from: "symbolnetz";
  symbol: string;
  lens: SymbolNetworkRoomLens;
  path?: string;
};

type ResolveRoomInitialStateIdOptions = {
  searchParams: Awaited<RoomSearchParams>;
  toSymbolSlug: string;
  validStateIds: string[];
};

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function normalizeSymbolNetworkRoomLens(value: string | undefined): SymbolNetworkRoomLens {
  if (value === "meaning" || value === "hebrew" || value === "gematria" || value === "story") {
    return value;
  }

  return "overview";
}

export function resolveSymbolNetworkRoomContext(
  searchParams: Awaited<RoomSearchParams>,
  fallbackSymbolSlug: string,
): SymbolNetworkRoomContext | undefined {
  if (getSingleSearchParam(searchParams.from) !== "symbolnetz") {
    return undefined;
  }

  return {
    from: "symbolnetz",
    symbol: getSingleSearchParam(searchParams.symbol) ?? fallbackSymbolSlug,
    lens: normalizeSymbolNetworkRoomLens(getSingleSearchParam(searchParams.lens)),
    path: getSingleSearchParam(searchParams.path),
  };
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
