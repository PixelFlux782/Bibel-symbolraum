import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { waterEngineData } from "@/components/rooms/water/waterEngineData";

export const metadata = {
  title: "Wasserraum",
  description: "Ein cineastischer Symbolraum zu \u05de\u05d9\u05dd / Majim / Wasser.",
};

export default function WasserRaumPage() {
  return <SymbolEngineRoom data={waterEngineData} />;
}
