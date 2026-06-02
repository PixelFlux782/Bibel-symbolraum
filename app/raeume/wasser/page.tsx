import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { waterEngineData } from "@/components/rooms/water/waterEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Wasserraum",
  description: "Ein cineastischer Symbolraum zu \u05de\u05d9\u05dd / Majim / Wasser.",
};

export default async function WasserRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const initialStateId = resolveRoomInitialStateId({
    searchParams: await searchParams,
    toSymbolSlug: "wasser",
    validStateIds: waterEngineData.states.map((state) => state.id),
  });

  return <SymbolEngineRoom data={waterEngineData} initialStateId={initialStateId} />;
}
