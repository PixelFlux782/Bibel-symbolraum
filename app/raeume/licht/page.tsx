import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { lightEngineData } from "@/components/rooms/light/lightEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Lichtraum",
  description: "Ein minimaler Symbolraum zu \u05d0\u05d5\u05e8 / Or / Licht.",
};

export default async function LichtRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const initialStateId = resolveRoomInitialStateId({
    searchParams: await searchParams,
    toSymbolSlug: "licht",
    validStateIds: lightEngineData.states.map((state) => state.id),
  });

  return <SymbolEngineRoom data={lightEngineData} initialStateId={initialStateId} />;
}
