import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { wuesteEngineData } from "@/components/rooms/wueste/wuesteEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Wuestenraum",
  description: "Ein Symbolraum zu \u05de\u05d3\u05d1\u05e8 / Midbar / Wueste.",
};

export default async function WuesteRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const initialStateId = resolveRoomInitialStateId({
    searchParams: await searchParams,
    toSymbolSlug: "wueste",
    validStateIds: wuesteEngineData.states.map((state) => state.id),
  });

  return <SymbolEngineRoom data={wuesteEngineData} initialStateId={initialStateId} />;
}
