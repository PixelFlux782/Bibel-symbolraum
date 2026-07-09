import WaterRoom from "@/components/rooms/water/WaterRoom";
import { waterEngineData } from "@/components/rooms/water/waterEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";
import { resolveRoomContext } from "@/lib/rooms/roomContext";

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
  const roomContext = resolveRoomContext(resolvedSearchParams, "wasser");

  return <WaterRoom initialStateId={initialStateId} roomContext={roomContext} />;
}
