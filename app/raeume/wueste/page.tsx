import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { wuesteEngineData } from "@/components/rooms/wueste/wuesteEngineData";
import {
  resolveRoomInitialStateId,
  resolveSymbolNetworkRoomContext,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Wuestenraum",
  description: "Ein Symbolraum zu \u05de\u05d3\u05d1\u05e8 / Midbar / Wueste.",
};

export default async function WuesteRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "wueste",
    validStateIds: wuesteEngineData.states.map((state) => state.id),
  });
  const symbolNetworkContext = resolveSymbolNetworkRoomContext(resolvedSearchParams, "wueste");

  return <SymbolEngineRoom data={wuesteEngineData} initialStateId={initialStateId} symbolNetworkContext={symbolNetworkContext} />;
}
