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
];

export const symbolMeaningLinks: SymbolMeaningLink[] = [
  {
    id: "symbol-water",
    symbolId: "wasser",
    label: "Wasser",
    aliases: ["water"],
    nodeIds: ["depth", "transition", "purification"],
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
