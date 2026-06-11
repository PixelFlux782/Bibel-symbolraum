import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { waterEngineData } from "@/components/rooms/water/waterEngineData";
import {
  resolveRoomInitialStateId,
  resolveSymbolNetworkRoomContext,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Wasser-Raum",
  description: "Ein cineastischer Symbolraum zu \u05de\u05d9\u05dd / Majim / Wasser.",
};

export default async function WasserRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "wasser",
    validStateIds: waterEngineData.states.map((state) => state.id),
  });
  const symbolNetworkContext = resolveSymbolNetworkRoomContext(resolvedSearchParams, "wasser");

  return <SymbolEngineRoom data={waterEngineData} initialStateId={initialStateId} symbolNetworkContext={symbolNetworkContext} />;
}
