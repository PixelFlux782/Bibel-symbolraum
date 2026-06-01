import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { wuesteEngineData } from "@/components/rooms/wueste/wuesteEngineData";

export const metadata = {
  title: "Wuestenraum",
  description: "Ein Symbolraum zu \u05de\u05d3\u05d1\u05e8 / Midbar / Wueste.",
};

export default function WuesteRaumPage() {
  return <SymbolEngineRoom data={wuesteEngineData} />;
}
