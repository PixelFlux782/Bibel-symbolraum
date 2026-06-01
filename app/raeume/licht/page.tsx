import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { lightEngineData } from "@/components/rooms/light/lightEngineData";

export const metadata = {
  title: "Lichtraum",
  description: "Ein minimaler Symbolraum zu \u05d0\u05d5\u05e8 / Or / Licht.",
};

export default function LichtRaumPage() {
  return <SymbolEngineRoom data={lightEngineData} />;
}
