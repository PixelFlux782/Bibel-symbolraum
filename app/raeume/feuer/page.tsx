import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { fireEngineData } from "@/components/rooms/fire/fireEngineData";

export const metadata = {
  title: "Feuerraum",
  description: "Ein Symbolraum zu \u05d0\u05e9 / Esh / Feuer.",
};

export default function FeuerRaumPage() {
  return <SymbolEngineRoom data={fireEngineData} />;
}
