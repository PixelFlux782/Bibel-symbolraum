import FireRoom from "@/components/rooms/fire/FireRoom";
import { fireEngineData } from "@/components/rooms/fire/fireEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";
import { resolveRoomContext } from "@/lib/rooms/roomContext";

export const metadata = {
  title: "Feuer-Raum",
  description: "Ein Symbolraum zu \u05d0\u05e9 / Esch / Feuer.",
};

export default async function FeuerRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "feuer",
    validStateIds: fireEngineData.states.map((state) => state.id),
  });
  const roomContext = resolveRoomContext(resolvedSearchParams, "feuer");

  return <FireRoom initialStateId={initialStateId} roomContext={roomContext} />;
}
