import type {
  BiblicalMeaningLink,
  BiblicalReference,
  HebrewMeaningLink,
  MeaningField,
  MeaningNode,
  MeaningRelation,
  SymbolMeaningLink,
} from "@/types/meaningGraph";
import type { HebrewSymbolMapping, HebrewWord } from "@/types/hebrew";

import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { symbolHebrewMappings } from "@/lib/hebrew/symbolHebrewMappings";
import { SYMBOLS, SYMBOL_NETWORK } from "@/lib/symbols";

import { biblicalReferences } from "./biblicalReferences";
import { biblicalMeaningLinks, hebrewMeaningLinks, symbolMeaningLinks } from "./meaningMappings";
import { meaningNodes, meaningFields } from "./meaningNodes";
import { meaningRelations } from "./meaningRelations";

type RelationAwareMapping = {
  id: string;
  nodeIds: string[];
  relationIds?: string[];
};

export interface MeaningGraphValidationResult {
  errors: string[];
  warnings: string[];
  stats: {
    nodes: number;
    relations: number;
    mappings: number;
  };
}

export interface MeaningGraphValidationData {
  nodes: MeaningNode[];
  relations: MeaningRelation[];
  fields: MeaningField[];
  hebrewLinks: HebrewMeaningLink[];
  symbolLinks: SymbolMeaningLink[];
  biblicalLinks: BiblicalMeaningLink[];
  hebrewWords: HebrewWord[];
  symbolSlugs: string[];
  biblicalReferences: BiblicalReference[];
  availableBiblicalReferences: string[];
  symbolHebrewMappings: HebrewSymbolMapping[];
}

const defaultData: MeaningGraphValidationData = {
  nodes: meaningNodes,
  relations: meaningRelations,
  fields: meaningFields,
  hebrewLinks: hebrewMeaningLinks,
  symbolLinks: symbolMeaningLinks,
  biblicalLinks: biblicalMeaningLinks,
  hebrewWords,
  symbolSlugs: Array.from(new Set([...SYMBOL_NETWORK.map((symbol) => symbol.id), ...SYMBOLS.map((symbol) => symbol.slug)])),
  biblicalReferences,
  availableBiblicalReferences: Array.from(new Set([
    ...SYMBOL_NETWORK.flatMap((symbol) => symbol.scriptureReferences?.map((entry) => entry.reference) ?? []),
    ...SYMBOLS.flatMap((symbol) => symbol.bibleReferences),
    ...hebrewWords.flatMap((word) => word.biblicalReferences.map((entry) => entry.reference)),
  ])),
  symbolHebrewMappings,
};

function findDuplicateIds(items: { id: string }[], label: string): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }

    seen.add(item.id);
  }

  return Array.from(duplicates, (id) => `${label}: doppelte ID "${id}".`);
}

function validateMappingReferences(
  mappings: RelationAwareMapping[],
  label: string,
  nodeIds: Set<string>,
  relationIds: Set<string>,
): string[] {
  const errors: string[] = [];

  for (const mapping of mappings) {
    for (const nodeId of mapping.nodeIds) {
      if (!nodeIds.has(nodeId)) {
        errors.push(`${label} "${mapping.id}" referenziert den unbekannten MeaningNode "${nodeId}".`);
      }
    }

    for (const relationId of mapping.relationIds ?? []) {
      if (!relationIds.has(relationId)) {
        errors.push(`${label} "${mapping.id}" referenziert die unbekannte MeaningRelation "${relationId}".`);
      }
    }
  }

  return errors;
}

function findCycles(relations: MeaningRelation[], nodeIds: Set<string>): string[] {
  const adjacency = new Map<string, string[]>();
  const warnings = new Set<string>();

  function normalizeCycle(cycle: string[]): string {
    const nodes = cycle.slice(0, -1);
    const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)]);
    const normalized = rotations.map((rotation) => [...rotation, rotation[0]].join(" -> ")).sort()[0];

    return `Zyklus im Bedeutungsgraphen: ${normalized}.`;
  }

  for (const relation of relations) {
    if (!nodeIds.has(relation.fromNodeId) || !nodeIds.has(relation.toNodeId)) {
      continue;
    }

    adjacency.set(relation.fromNodeId, [...(adjacency.get(relation.fromNodeId) ?? []), relation.toNodeId]);
  }

  function visit(nodeId: string, path: string[], pathIndexes: Map<string, number>) {
    const cycleStart = pathIndexes.get(nodeId);

    if (cycleStart !== undefined) {
      warnings.add(normalizeCycle([...path.slice(cycleStart), nodeId]));
      return;
    }

    const nextPath = [...path, nodeId];
    const nextIndexes = new Map(pathIndexes).set(nodeId, path.length);

    for (const targetId of adjacency.get(nodeId) ?? []) {
      visit(targetId, nextPath, nextIndexes);
    }
  }

  for (const nodeId of nodeIds) {
    visit(nodeId, [], new Map());
  }

  return Array.from(warnings);
}

function hasSharedNodeIds(left: string[], right: string[]): boolean {
  const leftIds = new Set(left);
  return right.some((nodeId) => leftIds.has(nodeId));
}

export function validateMeaningGraph(
  overrides: Partial<MeaningGraphValidationData> = {},
): MeaningGraphValidationResult {
  const data = { ...defaultData, ...overrides };
  const errors = [
    ...findDuplicateIds(data.nodes, "MeaningNode"),
    ...findDuplicateIds(data.relations, "MeaningRelation"),
    ...findDuplicateIds(data.fields, "MeaningField"),
    ...findDuplicateIds(data.hebrewLinks, "HebrewMeaningLink"),
    ...findDuplicateIds(data.symbolLinks, "SymbolMeaningLink"),
    ...findDuplicateIds(data.biblicalLinks, "BiblicalMeaningLink"),
    ...findDuplicateIds(data.biblicalReferences, "BiblicalReference"),
  ];
  const warnings: string[] = [];
  const nodeIds = new Set<string>(data.nodes.map((node) => node.id));
  const relationIds = new Set(data.relations.map((relation) => relation.id));
  const wordIds = new Set(data.hebrewWords.map((word) => word.id));
  const symbolSlugs = new Set(data.symbolSlugs);
  const biblicalReferenceIds = new Set(data.biblicalReferences.map((reference) => reference.id));
  const availableBiblicalReferences = new Set(data.availableBiblicalReferences);
  const mappings: RelationAwareMapping[] = [
    ...data.fields,
    ...data.hebrewLinks,
    ...data.symbolLinks,
    ...data.biblicalLinks,
  ];

  errors.push(...validateMappingReferences(data.fields, "MeaningField", nodeIds, relationIds));
  errors.push(...validateMappingReferences(data.hebrewLinks, "HebrewMeaningLink", nodeIds, relationIds));
  errors.push(...validateMappingReferences(data.symbolLinks, "SymbolMeaningLink", nodeIds, relationIds));
  errors.push(...validateMappingReferences(data.biblicalLinks, "BiblicalMeaningLink", nodeIds, relationIds));

  for (const relation of data.relations) {
    if (!nodeIds.has(relation.fromNodeId)) {
      errors.push(`MeaningRelation "${relation.id}" referenziert den unbekannten MeaningNode "${relation.fromNodeId}".`);
    }

    if (!nodeIds.has(relation.toNodeId)) {
      errors.push(`MeaningRelation "${relation.id}" referenziert den unbekannten MeaningNode "${relation.toNodeId}".`);
    }
  }

  for (const link of data.hebrewLinks) {
    if (!wordIds.has(link.hebrewWordId)) {
      errors.push(`HebrewMeaningLink "${link.id}" referenziert das unbekannte HebrewWord "${link.hebrewWordId}".`);
    }
  }

  for (const link of data.symbolLinks) {
    if (!symbolSlugs.has(link.symbolId)) {
      errors.push(`SymbolMeaningLink "${link.id}" referenziert den unbekannten Symbol-Slug "${link.symbolId}".`);
    }

    if (link.nodeIds.length < 2) {
      warnings.push(`Meaning Profile fuer Symbol-Slug "${link.symbolId}" benoetigt mindestens 2 MeaningNodes.`);
    }
  }

  for (const link of data.biblicalLinks) {
    if (!biblicalReferenceIds.has(link.biblicalReferenceId)) {
      errors.push(`BiblicalMeaningLink "${link.id}" referenziert die unbekannte BiblicalReference-ID "${link.biblicalReferenceId}".`);
    }
  }

  for (const reference of data.biblicalReferences) {
    if (!availableBiblicalReferences.has(reference.reference)) {
      errors.push(`BiblicalReference "${reference.id}" referenziert den unbekannten Bibelstellen-Eintrag "${reference.reference}".`);
    }
  }

  warnings.push(...findCycles(data.relations, nodeIds));

  const usedNodeIds = new Set(mappings.flatMap((mapping) => mapping.nodeIds));

  for (const relation of data.relations) {
    usedNodeIds.add(relation.fromNodeId);
    usedNodeIds.add(relation.toNodeId);
  }

  for (const node of data.nodes) {
    if (!usedNodeIds.has(node.id)) {
      warnings.push(`MeaningNode "${node.id}" ist verwaist.`);
    }
  }

  for (const mapping of data.symbolHebrewMappings) {
    const symbolLink = data.symbolLinks.find(
      (link) => link.symbolId === mapping.symbolSlug || link.aliases?.includes(mapping.symbolSlug),
    );

    if (!symbolLink) {
      continue;
    }

    for (const hebrewWordId of mapping.hebrewWordIds) {
      const hebrewLink = data.hebrewLinks.find((link) => link.hebrewWordId === hebrewWordId);

      if (hebrewLink && !hasSharedNodeIds(hebrewLink.nodeIds, symbolLink.nodeIds)) {
        warnings.push(`HebrewWord "${hebrewWordId}" und Symbol-Slug "${mapping.symbolSlug}" besitzen keine gemeinsamen MeaningNodes.`);
      }
    }
  }

  return {
    errors,
    warnings,
    stats: {
      nodes: data.nodes.length,
      relations: data.relations.length,
      mappings: data.hebrewLinks.length + data.symbolLinks.length + data.biblicalLinks.length,
    },
  };
}
