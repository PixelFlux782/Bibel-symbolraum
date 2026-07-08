import type {
  BiblicalMeaningLink,
  HebrewMeaningLink,
  MeaningNodeId,
  MeaningProfile,
  SymbolMeaningLink,
} from "@/types/meaningGraph";

import { biblicalReferences } from "./biblicalReferences";
import { meaningNodes } from "./meaningNodes";
import { meaningRelations } from "./meaningRelations";

export const hebrewMeaningLinks: HebrewMeaningLink[] = [
  {
    id: "hebrew-bereschit",
    hebrewWordId: "bereschit",
    hebrew: "\u05d1\u05e8\u05d0\u05e9\u05d9\u05ea",
    transliteration: "bereschit",
    nodeIds: ["birth", "hiddenness", "revelation", "word"],
  },
  {
    id: "hebrew-majim",
    hebrewWordId: "majim",
    hebrew: "\u05de\u05d9\u05dd",
    transliteration: "majim",
    nodeIds: ["origin", "depth", "birth", "transition", "purification", "life", "hiddenness"],
  },
  {
    id: "hebrew-or",
    hebrewWordId: "or",
    hebrew: "\u05d0\u05d5\u05e8",
    transliteration: "or",
    nodeIds: ["light", "revelation", "awareness", "knowledge", "order", "guidance", "life"],
  },
  {
    id: "hebrew-esh",
    hebrewWordId: "esch",
    hebrew: "\u05d0\u05e9",
    transliteration: "esch",
    nodeIds: ["fire", "transformation", "presence", "purification", "calling", "revelation"],
  },
  {
    id: "hebrew-midbar",
    hebrewWordId: "midbar",
    hebrew: "\u05de\u05d3\u05d1\u05e8",
    transliteration: "midbar",
    nodeIds: ["desert", "lack", "testing", "voice", "path", "dependence", "trust", "word", "revelation"],
  },
  {
    id: "hebrew-lechem",
    hebrewWordId: "lechem",
    hebrew: "\u05dc\u05d7\u05dd",
    transliteration: "lechem",
    nodeIds: ["nourishment", "gift", "community", "breaking", "life", "word"],
  },
  {
    id: "hebrew-tehom",
    hebrewWordId: "tehom",
    hebrew: "\u05ea\u05d4\u05d5\u05dd",
    transliteration: "tehom",
    nodeIds: ["origin", "depth", "hiddenness", "chaos", "birth", "revelation"],
  },
  {
    id: "hebrew-ruach",
    hebrewWordId: "ruach",
    hebrew: "\u05e8\u05d5\u05d7",
    transliteration: "ruach",
    nodeIds: ["breath", "presence", "life", "transition", "revelation", "voice", "word", "light"],
  },
  {
    id: "hebrew-davar",
    hebrewWordId: "davar",
    hebrew: "\u05d3\u05d1\u05e8",
    transliteration: "davar",
    nodeIds: ["word", "order", "revelation", "guidance", "calling", "presence", "light", "nourishment"],
  },
  {
    id: "hebrew-qol",
    hebrewWordId: "qol",
    hebrew: "\u05e7\u05d5\u05dc",
    transliteration: "qol",
    nodeIds: ["voice", "word", "revelation", "calling", "guidance", "presence", "awareness", "path"],
  },
  {
    id: "hebrew-elohim",
    hebrewWordId: "elohim",
    hebrew: "\u05d0\u05dc\u05d4\u05d9\u05dd",
    transliteration: "elohim",
    nodeIds: ["presence", "hiddenness", "revelation", "word", "light"],
  },
  {
    id: "hebrew-tohu",
    hebrewWordId: "tohu",
    hebrew: "\u05ea\u05d4\u05d5",
    transliteration: "tohu",
    nodeIds: ["chaos", "hiddenness", "desert", "transition"],
  },
  {
    id: "hebrew-vohu",
    hebrewWordId: "vohu",
    hebrew: "\u05d5\u05d1\u05d4\u05d5",
    transliteration: "vohu",
    nodeIds: ["chaos", "hiddenness", "lack", "transition"],
  },
  {
    id: "hebrew-choschech",
    hebrewWordId: "choschech",
    hebrew: "\u05d7\u05e9\u05da",
    transliteration: "choschech",
    nodeIds: ["hiddenness", "chaos", "revelation", "light"],
  },
  {
    id: "hebrew-merachefet",
    hebrewWordId: "merachefet",
    hebrew: "\u05de\u05e8\u05d7\u05e4\u05ea",
    transliteration: "merachefet",
    nodeIds: ["presence", "life", "hiddenness", "transition", "birth"],
  },
  {
    id: "hebrew-amar",
    hebrewWordId: "amar",
    hebrew: "\u05d0\u05de\u05e8",
    transliteration: "amar",
    nodeIds: ["word", "voice", "revelation", "calling", "light"],
  },
  {
    id: "hebrew-haja",
    hebrewWordId: "haja",
    hebrew: "\u05d4\u05d9\u05d4",
    transliteration: "haja",
    nodeIds: ["presence", "transition", "revelation", "hiddenness"],
  },
  {
    id: "hebrew-wajehi",
    hebrewWordId: "wajehi",
    hebrew: "\u05d5\u05d9\u05d4\u05d9",
    transliteration: "wajehi",
    nodeIds: ["transition", "revelation", "light", "word"],
  },
  {
    id: "hebrew-tov",
    hebrewWordId: "tov",
    hebrew: "\u05d8\u05d5\u05d1",
    transliteration: "tov",
    nodeIds: ["goodness", "light", "awareness", "revelation", "life", "guidance"],
  },
  {
    id: "hebrew-raah",
    hebrewWordId: "raah",
    hebrew: "\u05e8\u05d0\u05d4",
    transliteration: "raah",
    nodeIds: ["awareness", "light", "revelation", "guidance", "goodness"],
  },
  {
    id: "hebrew-bara",
    hebrewWordId: "bara",
    hebrew: "\u05d1\u05e8\u05d0",
    transliteration: "bara",
    nodeIds: ["revelation", "word", "light", "hiddenness", "birth"],
  },
  {
    id: "hebrew-schamajim",
    hebrewWordId: "schamajim",
    hebrew: "\u05e9\u05de\u05d9\u05dd",
    transliteration: "schamajim",
    nodeIds: ["light", "revelation", "guidance", "depth", "hiddenness"],
  },
  {
    id: "hebrew-erez",
    hebrewWordId: "erez",
    hebrew: "\u05d0\u05e8\u05e5",
    transliteration: "erez",
    nodeIds: ["life", "nourishment", "path", "guidance"],
  },
  {
    id: "hebrew-adam",
    hebrewWordId: "adam",
    hebrew: "\u05d0\u05d3\u05dd",
    transliteration: "adam",
    nodeIds: ["life", "presence", "birth", "word"],
  },
  {
    id: "hebrew-chava",
    hebrewWordId: "chava",
    hebrew: "\u05d7\u05d5\u05d4",
    transliteration: "chava",
    nodeIds: ["life", "birth", "community", "presence"],
  },
  {
    id: "hebrew-gan",
    hebrewWordId: "gan",
    hebrew: "\u05d2\u05df",
    transliteration: "gan",
    nodeIds: ["life", "presence", "nourishment", "gift", "hiddenness"],
  },
  {
    id: "hebrew-nahar",
    hebrewWordId: "nahar",
    hebrew: "\u05e0\u05d4\u05e8",
    transliteration: "nahar",
    nodeIds: ["life", "transition", "path", "nourishment"],
  },
  {
    id: "hebrew-mikwe",
    hebrewWordId: "mikwe",
    hebrew: "\u05de\u05e7\u05d5\u05d4",
    transliteration: "mikwe",
    nodeIds: ["purification", "transition", "birth", "depth"],
  },
  {
    id: "hebrew-jordan",
    hebrewWordId: "jordan",
    hebrew: "\u05d9\u05e8\u05d3\u05df",
    transliteration: "jarden",
    nodeIds: ["transition", "purification", "birth", "revelation", "path"],
  },
  {
    id: "hebrew-jam",
    hebrewWordId: "jam",
    hebrew: "\u05d9\u05dd",
    transliteration: "jam",
    nodeIds: ["depth", "chaos", "transition", "hiddenness"],
  },
  {
    id: "hebrew-panim",
    hebrewWordId: "panim",
    hebrew: "\u05e4\u05e0\u05d9\u05dd",
    transliteration: "panim",
    nodeIds: ["presence", "light", "revelation", "awareness"],
  },
  {
    id: "hebrew-kavod",
    hebrewWordId: "kavod",
    hebrew: "\u05db\u05d1\u05d5\u05d3",
    transliteration: "kavod",
    nodeIds: ["presence", "light", "revelation", "fire"],
  },
  {
    id: "hebrew-chokma",
    hebrewWordId: "chokma",
    hebrew: "\u05d7\u05db\u05de\u05d4",
    transliteration: "chokma",
    nodeIds: ["awareness", "guidance", "word", "light", "life"],
  },
  {
    id: "hebrew-bina",
    hebrewWordId: "bina",
    hebrew: "\u05d1\u05d9\u05e0\u05d4",
    transliteration: "bina",
    nodeIds: ["awareness", "word", "voice", "guidance"],
  },
  {
    id: "hebrew-mizbeach",
    hebrewWordId: "mizbeach",
    hebrew: "\u05de\u05d6\u05d1\u05d7",
    transliteration: "mizbeach",
    nodeIds: ["fire", "gift", "presence", "transformation"],
  },
  {
    id: "hebrew-korban",
    hebrewWordId: "korban",
    hebrew: "\u05e7\u05e8\u05d1\u05df",
    transliteration: "korban",
    nodeIds: ["gift", "presence", "community", "transformation"],
  },
  {
    id: "hebrew-derech",
    hebrewWordId: "derech",
    hebrew: "\u05d3\u05e8\u05da",
    transliteration: "derech",
    nodeIds: ["path", "guidance", "testing", "trust", "transition"],
  },
  {
    id: "hebrew-nes",
    hebrewWordId: "nes",
    hebrew: "\u05e0\u05e1",
    transliteration: "nes",
    nodeIds: ["guidance", "revelation", "trust", "path"],
  },
  {
    id: "hebrew-sinai",
    hebrewWordId: "sinai",
    hebrew: "\u05e1\u05d9\u05e0\u05d9",
    transliteration: "sinai",
    nodeIds: ["desert", "revelation", "fire", "voice", "word", "presence"],
  },
  {
    id: "hebrew-manna",
    hebrewWordId: "manna",
    hebrew: "\u05de\u05df",
    transliteration: "man",
    nodeIds: ["nourishment", "gift", "desert", "dependence", "trust"],
  },
  {
    id: "hebrew-dagan",
    hebrewWordId: "dagan",
    hebrew: "\u05d3\u05d2\u05df",
    transliteration: "dagan",
    nodeIds: ["nourishment", "life", "hiddenness", "gift"],
  },
  {
    id: "hebrew-shever",
    hebrewWordId: "shever",
    hebrew: "\u05e9\u05d1\u05e8",
    transliteration: "shever",
    nodeIds: ["breaking", "lack", "nourishment", "community", "transformation"],
  },
  {
    id: "hebrew-seudah",
    hebrewWordId: "seudah",
    hebrew: "\u05e1\u05e2\u05d5\u05d3\u05d4",
    transliteration: "seudah",
    nodeIds: ["community", "nourishment", "gift", "breaking"],
  },
  {
    id: "hebrew-noach",
    hebrewWordId: "noach",
    hebrew: "\u05e0\u05d7",
    transliteration: "noach",
    nodeIds: ["transition", "life", "hiddenness", "birth", "trust"],
  },
  {
    id: "hebrew-tahor",
    hebrewWordId: "tahor",
    hebrew: "\u05d8\u05d4\u05d5\u05e8",
    transliteration: "tahor",
    nodeIds: ["purification", "light", "revelation", "community"],
  },
];

export const symbolMeaningLinks: SymbolMeaningLink[] = [
  {
    id: "symbol-water",
    symbolId: "wasser",
    label: "Wasser",
    aliases: ["water"],
    nodeIds: ["depth", "transition", "purification", "life"],
  },
  {
    id: "symbol-light",
    symbolId: "licht",
    label: "Licht",
    aliases: ["light"],
    nodeIds: ["light", "revelation", "guidance", "knowledge"],
  },
  {
    id: "symbol-fire",
    symbolId: "feuer",
    label: "Feuer",
    aliases: ["fire"],
    nodeIds: ["fire", "transformation", "presence", "purification", "calling"],
  },
  {
    id: "symbol-desert",
    symbolId: "wueste",
    label: "Wüste",
    aliases: ["w\u00fcste", "desert"],
    nodeIds: ["desert", "testing", "dependence", "transition", "guidance", "voice", "word"],
  },
  {
    id: "symbol-bread",
    symbolId: "brot",
    label: "Brot",
    aliases: ["bread"],
    nodeIds: ["nourishment", "gift", "community", "breaking", "life", "word"],
  },
];

export const biblicalMeaningLinks: BiblicalMeaningLink[] = [
  {
    id: "biblical-genesis-1-1",
    biblicalReferenceId: "genesis-1-1",
    label: "Genesis 1 Anfang",
    nodeIds: ["birth", "hiddenness", "revelation", "word", "guidance", "life"],
  },
  {
    id: "biblical-genesis-1",
    biblicalReferenceId: "genesis-1-2",
    label: "Genesis 1",
    nodeIds: ["chaos", "depth", "hiddenness", "presence", "transition", "word"],
  },
  {
    id: "biblical-exodus-14",
    biblicalReferenceId: "exodus-14",
    label: "Exodus 14",
    nodeIds: ["transition", "guidance", "life", "trust"],
  },
  {
    id: "biblical-baptism",
    biblicalReferenceId: "matthew-3-13-17",
    label: "Taufe",
    aliases: ["baptism"],
    nodeIds: ["purification", "life"],
  },
  {
    id: "biblical-genesis-1-light",
    biblicalReferenceId: "genesis-1-3",
    label: "Genesis 1 Licht",
    aliases: ["Genesis 1"],
    nodeIds: ["light", "word", "revelation", "guidance", "awareness", "transition"],
  },
  {
    id: "biblical-genesis-1-4",
    biblicalReferenceId: "genesis-1-4",
    label: "Genesis 1,4",
    aliases: ["Gott sah das Licht", "Licht gut"],
    nodeIds: ["light", "awareness", "goodness", "revelation", "guidance", "life"],
  },
  {
    id: "biblical-john-1",
    biblicalReferenceId: "john-1-4-5",
    label: "Johannes 1",
    nodeIds: ["light", "revelation"],
  },
  {
    id: "biblical-exodus-3-fire",
    biblicalReferenceId: "exodus-3-2",
    label: "Brennender Dornbusch",
    aliases: ["Dornbusch"],
    nodeIds: ["fire", "presence", "calling"],
  },
  {
    id: "biblical-exodus-13-fire",
    biblicalReferenceId: "exodus-13-21",
    label: "Feuersäule",
    nodeIds: ["fire", "presence", "guidance"],
  },
  {
    id: "biblical-malachi-3",
    biblicalReferenceId: "malachi-3-2-3",
    label: "Läuterndes Feuer",
    aliases: ["Maleachi 3"],
    nodeIds: ["fire", "transformation", "purification"],
  },
  {
    id: "biblical-exodus-wilderness",
    biblicalReferenceId: "exodus-wilderness",
    label: "Israel in der Wüste",
    nodeIds: ["desert", "lack", "dependence", "guidance"],
  },
  {
    id: "biblical-deuteronomy-8",
    biblicalReferenceId: "deuteronomy-8",
    label: "Deuteronomium 8",
    nodeIds: ["desert", "testing", "dependence", "trust"],
  },
  {
    id: "biblical-matthew-4",
    biblicalReferenceId: "matthew-4",
    label: "Matthaeus 4",
    nodeIds: ["desert", "testing", "trust"],
  },
  {
    id: "biblical-mark-4-grain",
    biblicalReferenceId: "mark-4-26-29",
    label: "Das verborgene Korn",
    nodeIds: ["hiddenness", "life", "nourishment"],
  },
  {
    id: "biblical-exodus-16-manna",
    biblicalReferenceId: "exodus-16-4",
    label: "Manna in der Wüste",
    nodeIds: ["desert", "lack", "gift", "nourishment"],
  },
  {
    id: "biblical-deuteronomy-8-bread",
    biblicalReferenceId: "deuteronomy-8-3",
    label: "Nicht vom Brot allein",
    nodeIds: ["nourishment", "word", "life"],
  },
  {
    id: "biblical-luke-24-breaking",
    biblicalReferenceId: "luke-24-30-31",
    label: "Brechen des Brotes",
    nodeIds: ["breaking", "community", "revelation"],
  },
  {
    id: "biblical-john-6-bread",
    biblicalReferenceId: "john-6-35",
    label: "Brot des Lebens",
    nodeIds: ["nourishment", "life", "word"],
  },
];

function matches(query: string, values: string[]): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase("de");

  return values.some(
    (value) => value.toLocaleLowerCase("de") === normalizedQuery,
  );
}

export function getMeaningProfile(query?: string): MeaningProfile {
  const origin = {
    hebrew: query
      ? hebrewMeaningLinks.filter((link) =>
          matches(query, [link.hebrewWordId, link.hebrew, link.transliteration]),
        )
      : hebrewMeaningLinks,
    symbols: query
      ? symbolMeaningLinks.filter((link) =>
          matches(query, [link.symbolId, link.label, ...(link.aliases ?? [])]),
        )
      : symbolMeaningLinks,
    biblical: query
      ? biblicalMeaningLinks.filter((link) =>
          matches(query, [
            link.biblicalReferenceId,
            link.label,
            ...(link.aliases ?? []),
            ...biblicalReferences
              .filter((reference) => reference.id === link.biblicalReferenceId)
              .flatMap((reference) => [
                reference.reference,
                reference.label,
                ...(reference.aliases ?? []),
              ]),
          ]),
        )
      : biblicalMeaningLinks,
  };
  const nodeIds = new Set<MeaningNodeId>([
    ...origin.hebrew.flatMap((link) => link.nodeIds),
    ...origin.symbols.flatMap((link) => link.nodeIds),
    ...origin.biblical.flatMap((link) => link.nodeIds),
  ]);

  return {
    nodes: meaningNodes.filter((node) => nodeIds.has(node.id)),
    relations: meaningRelations.filter(
      (relation) =>
        nodeIds.has(relation.fromNodeId) && nodeIds.has(relation.toNodeId),
    ),
    origin,
  };
}
