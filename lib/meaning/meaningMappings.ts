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
    id: "hebrew-majim",
    hebrewWordId: "majim",
    hebrew: "\u05de\u05d9\u05dd",
    transliteration: "majim",
    nodeIds: ["depth", "birth", "hiddenness"],
  },
  {
    id: "hebrew-or",
    hebrewWordId: "or",
    hebrew: "\u05d0\u05d5\u05e8",
    transliteration: "or",
    nodeIds: ["light", "revelation", "awareness"],
  },
  {
    id: "hebrew-esh",
    hebrewWordId: "esh",
    hebrew: "\u05d0\u05e9",
    transliteration: "esch",
    nodeIds: ["fire", "transformation", "presence", "purification", "calling"],
  },
];

export const symbolMeaningLinks: SymbolMeaningLink[] = [
  {
    id: "symbol-water",
    symbolId: "wasser",
    label: "Wasser",
    aliases: ["water"],
    nodeIds: ["depth", "transition", "purification"],
  },
  {
    id: "symbol-light",
    symbolId: "licht",
    label: "Licht",
    aliases: ["light"],
    nodeIds: ["light", "revelation", "guidance"],
  },
  {
    id: "symbol-fire",
    symbolId: "feuer",
    label: "Feuer",
    aliases: ["fire"],
    nodeIds: ["fire", "transformation", "presence", "purification", "calling"],
  },
];

export const biblicalMeaningLinks: BiblicalMeaningLink[] = [
  {
    id: "biblical-genesis-1",
    biblicalReferenceId: "genesis-1-2",
    label: "Genesis 1",
    nodeIds: ["chaos", "depth"],
  },
  {
    id: "biblical-exodus-14",
    biblicalReferenceId: "exodus-14",
    label: "Exodus 14",
    nodeIds: ["transition"],
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
    nodeIds: ["revelation", "life"],
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
    label: "Feuersaeule",
    nodeIds: ["fire", "presence", "guidance"],
  },
  {
    id: "biblical-malachi-3",
    biblicalReferenceId: "malachi-3-2-3",
    label: "Laeuterndes Feuer",
    aliases: ["Maleachi 3"],
    nodeIds: ["fire", "transformation", "purification"],
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
