import WildernessRoom from "@/components/rooms/wueste/WildernessRoom";
import { wuesteEngineData } from "@/components/rooms/wueste/wuesteEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";
import { resolveRoomContext } from "@/lib/rooms/roomContext";

export const metadata = {
  title: "Wüstenraum",
  description: "Ein Symbolraum zu \u05de\u05d3\u05d1\u05e8 / Midbar / Wüste.",
};

export default async function WuesteRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "wueste",
    validStateIds: wuesteEngineData.states.map((state) => state.id),
  });
  const roomContext = resolveRoomContext(resolvedSearchParams, "wueste");

  return <WildernessRoom initialStateId={initialStateId} roomContext={roomContext} />;
}
