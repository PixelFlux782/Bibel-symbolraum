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
    label: "Übergang",
    description: "Eine Schwelle zwischen einem bisherigen und einem neuen Zustand.",
  },
  {
    id: "purification",
    label: "Reinigung",
    description: "Eine Bewegung der Klärung und Erneuerung.",
  },
  {
    id: "life",
    label: "Leben",
    description: "Lebendigkeit, Wachstum und tragende Versorgung.",
  },
  {
    id: "goodness",
    label: "Guete",
    description: "Stimmige, lebensfaehige Qualitaet, die als tragende Ordnung erkannt wird.",
  },
  {
    id: "hiddenness",
    label: "Verborgenheit",
    description: "Eine Wirklichkeit, die gegenwärtig ist, ohne ganz sichtbar zu sein.",
  },
  {
    id: "light",
    label: "Licht",
    description: "Sichtbarkeit, die Konturen hervortreten und Unterscheidung möglich werden lässt.",
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
    description: "Eine sichtbare Richtung im gegenwärtigen Dunkel.",
  },
  {
    id: "fire",
    label: "Feuer",
    description: "Eine wirksame Energie, die glimmt, leuchtet und Gestalt verändert.",
  },
  {
    id: "transformation",
    label: "Verwandlung",
    description: "Eine Bewegung, in der etwas eine neue Gestalt gewinnt.",
  },
  {
    id: "presence",
    label: "Gegenwart",
    description: "Eine tragende Nähe, die im Augenblick erfahrbar wird.",
  },
  {
    id: "calling",
    label: "Ruf",
    description: "Eine persönliche Ansprache, die in Bewegung und Verantwortung führt.",
  },
  {
    id: "desert",
    label: "Wüste",
    description: "Ein leerer Raum, in dem Sicherheiten schwinden und eine Spur neu sichtbar werden kann.",
  },
  {
    id: "lack",
    label: "Mangel",
    description: "Das spürbare Fehlen dessen, was sonst selbstverständlich trägt.",
  },
  {
    id: "testing",
    label: "Prüfung",
    description: "Eine Erfahrung, in der Verborgenes hervortritt und Vertrauen Gestalt gewinnen kann.",
  },
  {
    id: "dependence",
    label: "Abhängigkeit",
    description: "Die Einsicht, dass Leben nicht allein aus eigener Verfügbarkeit getragen wird.",
  },
  {
    id: "trust",
    label: "Vertrauen",
    description: "Eine innere Ausrichtung, die auch ohne vollständige Sicherheit einer leisen Spur vertraut.",
  },
  {
    id: "voice",
    label: "Stimme",
    description: "Eine leise Ansprache, die in der Stille hörbar werden kann.",
  },
  {
    id: "word",
    label: "Wort",
    description: "Gesprochener Sinn, der Orientierung gibt, ohne die ganze Zukunft vorwegzunehmen.",
  },
  {
    id: "path",
    label: "Weg",
    description: "Eine begehbare Richtung durch einen noch nicht vollständig sichtbaren Raum.",
  },
  {
    id: "nourishment",
    label: "Nahrung",
    description: "Versorgung, die Leben erhält und Stärkung für den Weg schenkt.",
  },
  {
    id: "gift",
    label: "Gabe",
    description: "Empfangene Versorgung, die sich nicht allein eigener Verfügbarkeit verdankt.",
  },
  {
    id: "community",
    label: "Gemeinschaft",
    description: "Geteiltes Leben, das am gemeinsamen Tisch Beziehung sichtbar macht.",
  },
  {
    id: "breaking",
    label: "Brechen",
    description: "Eine Bewegung des Teilens, in der aus Nahrung eine gemeinsame Gabe wird.",
  },
];

export const meaningFields: MeaningField[] = [
  {
    id: "water",
    label: "Wasser",
    description: "Archetypische Bedeutungsräume, die sich im Symbol Wasser verdichten.",
    nodeIds: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness"],
  },
  {
    id: "light",
    label: "Licht",
    description: "Archetypische Bedeutungsräume, die sich im Symbol Licht verdichten.",
    nodeIds: ["light", "revelation", "awareness", "guidance", "life", "goodness"],
  },
  {
    id: "fire",
    label: "Feuer",
    description: "Archetypische Bedeutungsräume, die sich im Symbol Feuer verdichten.",
    nodeIds: ["fire", "transformation", "presence", "purification", "calling"],
  },
  {
    id: "desert",
    label: "Wüste",
    description: "Archetypische Bedeutungsräume, die sich im Symbol Wüste verdichten.",
    nodeIds: ["desert", "lack", "testing", "dependence", "trust", "voice", "word", "path", "transition", "guidance", "hiddenness", "revelation"],
  },
  {
    id: "bread",
    label: "Brot",
    description: "Archetypische Bedeutungsräume, die sich im Symbol Brot verdichten.",
    nodeIds: ["nourishment", "gift", "community", "breaking", "life", "word"],
  },
];
