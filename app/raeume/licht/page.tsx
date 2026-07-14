import LightRoom from "@/components/rooms/light/LightRoom";
import { lightEngineData } from "@/components/rooms/light/lightEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";
import { resolveRoomContext } from "@/lib/rooms/roomContext";

export const metadata = {
  title: "Licht-Raum",
  description: "Ein minimaler Symbolraum zu \u05d0\u05d5\u05e8 / Or / Licht.",
};

export default async function LichtRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialStateId = resolveRoomInitialStateId({
    searchParams: resolvedSearchParams,
    toSymbolSlug: "licht",
    validStateIds: lightEngineData.states.map((state) => state.id),
  });
  const roomContext = resolveRoomContext(resolvedSearchParams, "licht");

  return <LightRoom initialStateId={initialStateId} roomContext={roomContext} />;
}
