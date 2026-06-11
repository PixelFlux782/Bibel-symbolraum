import { breadEngineData } from "@/components/rooms/bread/breadEngineData";
import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import {
  resolveRoomInitialStateId,
  resolveSymbolNetworkRoomContext,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Brot-Raum",
  description: "Ein Symbolraum zu \u05dc\u05d7\u05dd / Lechem / Brot.",
};

export default async function BrotRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "brot",
    validStateIds: breadEngineData.states.map((state) => state.id),
  });
  const symbolNetworkContext = resolveSymbolNetworkRoomContext(resolvedSearchParams, "brot");

  return <SymbolEngineRoom data={breadEngineData} initialStateId={initialStateId} symbolNetworkContext={symbolNetworkContext} />;
}
