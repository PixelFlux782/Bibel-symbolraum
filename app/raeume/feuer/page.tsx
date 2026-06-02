import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { fireEngineData } from "@/components/rooms/fire/fireEngineData";
import {
  resolveRoomInitialStateId,
  type RoomSearchParams,
} from "@/lib/meaning/resolveRoomInitialStateId";

export const metadata = {
  title: "Feuerraum",
  description: "Ein Symbolraum zu \u05d0\u05e9 / Esh / Feuer.",
};

export default async function FeuerRaumPage({ searchParams }: { searchParams: RoomSearchParams }) {
  const initialStateId = resolveRoomInitialStateId({
    searchParams: await searchParams,
    toSymbolSlug: "feuer",
    validStateIds: fireEngineData.states.map((state) => state.id),
  });

  return <SymbolEngineRoom data={fireEngineData} initialStateId={initialStateId} />;
}
