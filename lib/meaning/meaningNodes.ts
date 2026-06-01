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
  {
    id: "light",
    label: "Licht",
    description: "Sichtbarkeit, die Konturen hervortreten und Unterscheidung moeglich werden laesst.",
  },
  {
    id: "revelation",
    label: "Offenbarung",
    description: "Das Hervortreten dessen, was zuvor verborgen oder noch nicht lesbar war.",
  },
  {
    id: "awareness",
    label: "Bewusstsein",
    description: "Innere Wahrnehmung, in der Sichtbarkeit zu Erkenntnis werden kann.",
  },
  {
    id: "guidance",
    label: "Orientierung",
    description: "Eine sichtbare Richtung fuer den naechsten Schritt.",
  },
  {
    id: "fire",
    label: "Feuer",
    description: "Eine wirksame Energie, die glimmt, leuchtet und Gestalt veraendert.",
  },
  {
    id: "transformation",
    label: "Verwandlung",
    description: "Eine Bewegung, in der etwas eine neue Gestalt gewinnt.",
  },
  {
    id: "presence",
    label: "Gegenwart",
    description: "Eine tragende Naehe, die im Augenblick erfahrbar wird.",
  },
  {
    id: "calling",
    label: "Ruf",
    description: "Eine persoenliche Ansprache, die in Bewegung und Verantwortung fuehrt.",
  },
];

export const meaningFields: MeaningField[] = [
  {
    id: "water",
    label: "Wasser",
    description: "Archetypische Bedeutungsraeume, die sich im Symbol Wasser verdichten.",
    nodeIds: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness"],
  },
  {
    id: "light",
    label: "Licht",
    description: "Archetypische Bedeutungsraeume, die sich im Symbol Licht verdichten.",
    nodeIds: ["light", "revelation", "awareness", "guidance", "life"],
  },
  {
    id: "fire",
    label: "Feuer",
    description: "Archetypische Bedeutungsraeume, die sich im Symbol Feuer verdichten.",
    nodeIds: ["fire", "transformation", "presence", "purification", "calling"],
  },
];
