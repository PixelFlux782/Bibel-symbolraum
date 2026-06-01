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
  {
    id: "light-revelation",
    fromNodeId: "light",
    toNodeId: "revelation",
    description: "Licht macht Offenbarung als Hervortreten des Sichtbaren erfahrbar.",
  },
  {
    id: "revelation-awareness",
    fromNodeId: "revelation",
    toNodeId: "awareness",
    description: "Was sichtbar wird, kann zu innerem Bewusstsein werden.",
  },
  {
    id: "revelation-life",
    fromNodeId: "revelation",
    toNodeId: "life",
    description: "Offenbarung kann Leben als tragende Gegenwart sichtbar machen.",
  },
  {
    id: "light-guidance",
    fromNodeId: "light",
    toNodeId: "guidance",
    description: "Licht zeigt eine Richtung fuer den naechsten Schritt.",
  },
  {
    id: "fire-presence",
    fromNodeId: "fire",
    toNodeId: "presence",
    description: "Feuer kann Gegenwart als wirksame Naehe erfahrbar machen.",
  },
  {
    id: "presence-calling",
    fromNodeId: "presence",
    toNodeId: "calling",
    description: "Erfahrene Gegenwart kann als persoenlicher Ruf in Bewegung setzen.",
  },
  {
    id: "fire-transformation",
    fromNodeId: "fire",
    toNodeId: "transformation",
    description: "Feuer macht Verwandlung als sichtbare Veraenderung der Gestalt erfahrbar.",
  },
  {
    id: "transformation-purification",
    fromNodeId: "transformation",
    toNodeId: "purification",
    description: "Verwandlung kann als Laeuterung und Reinigung erfahren werden.",
  },
];
