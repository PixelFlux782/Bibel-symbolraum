import { breadEngineData } from "@/components/rooms/bread/breadEngineData";
import BreadRoom from "@/components/rooms/bread/BreadRoom";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";
import { resolveRoomContext } from "@/lib/rooms/roomContext";

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
  const roomContext = resolveRoomContext(resolvedSearchParams, "brot");

  return <BreadRoom initialStateId={initialStateId} roomContext={roomContext} />;
}
