import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { fireEngineData } from "@/components/rooms/fire/fireEngineData";
import {
  resolveRoomInitialStateId,
  resolveSymbolNetworkRoomContext,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Feuer-Raum",
  description: "Ein Symbolraum zu \u05d0\u05e9 / Esh / Feuer.",
};

export default async function FeuerRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "feuer",
    validStateIds: fireEngineData.states.map((state) => state.id),
  });
  const symbolNetworkContext = resolveSymbolNetworkRoomContext(resolvedSearchParams, "feuer");

  return <SymbolEngineRoom data={fireEngineData} initialStateId={initialStateId} symbolNetworkContext={symbolNetworkContext} />;
}
