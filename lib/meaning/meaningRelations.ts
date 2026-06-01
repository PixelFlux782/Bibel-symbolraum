import type { MeaningRelation } from "@/types/meaningGraph";

export const meaningRelations: MeaningRelation[] = [
  {
    id: "depth-birth",
    fromNodeId: "depth",
    toNodeId: "birth",
    description: "Aus der Tiefe kann ein neuer Anfang hervortreten.",
  },
  {
    id: "birth-life",
    fromNodeId: "birth",
    toNodeId: "life",
    description: "Geburt oeffnet den Raum fuer Leben.",
  },
  {
    id: "chaos-transition",
    fromNodeId: "chaos",
    toNodeId: "transition",
    description: "Das Ungeordnete kann zur Schwelle einer neuen Ordnung werden.",
  },
  {
    id: "transition-purification",
    fromNodeId: "transition",
    toNodeId: "purification",
    description: "Der Uebergang kann als Reinigung und Erneuerung erfahren werden.",
  },
];
