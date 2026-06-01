import type { MeaningField, MeaningNode } from "@/types/meaningGraph";

export const meaningNodes: MeaningNode[] = [
  {
    id: "depth",
    label: "Tiefe",
    description: "Ein Raum unterhalb des unmittelbar Sichtbaren.",
  },
  {
    id: "chaos",
    label: "Chaos",
    description: "Ein noch ungeordneter Raum vor Unterscheidung und Gestalt.",
  },
  {
    id: "birth",
    label: "Geburt",
    description: "Das Hervortreten eines neuen Anfangs.",
  },
  {
    id: "transition",
    label: "Uebergang",
    description: "Eine Schwelle zwischen einem bisherigen und einem neuen Zustand.",
  },
  {
    id: "purification",
    label: "Reinigung",
    description: "Eine Bewegung der Klaerung und Erneuerung.",
  },
  {
    id: "life",
    label: "Leben",
    description: "Lebendigkeit, Wachstum und tragende Versorgung.",
  },
  {
    id: "hiddenness",
    label: "Verborgenheit",
    description: "Eine Wirklichkeit, die gegenwaertig ist, ohne ganz sichtbar zu sein.",
  },
];

export const meaningFields: MeaningField[] = [
  {
    id: "water",
    label: "Wasser",
    description: "Archetypische Bedeutungsraeume, die sich im Symbol Wasser verdichten.",
    nodeIds: meaningNodes.map((node) => node.id),
  },
];
