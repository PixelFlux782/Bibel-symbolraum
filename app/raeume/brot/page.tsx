import { breadEngineData } from "@/components/rooms/bread/breadEngineData";
import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Brotraum",
  description: "Ein Symbolraum zu \u05dc\u05d7\u05dd / Lechem / Brot.",
};

export default async function BrotRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const initialStateId = resolveRoomInitialStateId({
    searchParams: await searchParams,
    toSymbolSlug: "brot",
    validStateIds: breadEngineData.states.map((state) => state.id),
  });

  return <SymbolEngineRoom data={breadEngineData} initialStateId={initialStateId} />;
}
