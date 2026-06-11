import { getHierarchyEntry } from "@/lib/symbols/hierarchy";

import { ontologyEntities, ontologyRelations } from "./registry";
import type { OntologyEntity, OntologyRelation, OntologyValidationResult } from "./types";

function duplicateEntityIds(entities: OntologyEntity[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const entity of entities) {
    if (seen.has(entity.id)) {
      duplicates.add(entity.id);
    }

    seen.add(entity.id);
  }

  return Array.from(duplicates, (id) => `OntologyEntity: doppelte ID "${id}".`);
}

function duplicateRelationIds(relations: OntologyRelation[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const relation of relations) {
    if (seen.has(relation.id)) {
      duplicates.add(relation.id);
    }

    seen.add(relation.id);
  }

  return Array.from(duplicates, (id) => `OntologyRelation: doppelte ID "${id}".`);
}

export function validateOntology(
  entities: OntologyEntity[] = ontologyEntities,
  relations: OntologyRelation[] = ontologyRelations,
): OntologyValidationResult {
  const errors = [...duplicateEntityIds(entities), ...duplicateRelationIds(relations)];
  const warnings: string[] = [];
  const entityIds = new Set(entities.map((entity) => entity.id));
  const externalTargets = new Set<string>();

  for (const entity of entities) {
    if (!entity.id.trim()) {
      errors.push("OntologyEntity benoetigt eine id.");
    }

    if (!entity.title.trim()) {
      errors.push(`OntologyEntity "${entity.id}" benoetigt einen title.`);
    }

    if (entity.primaryHierarchyId && !getHierarchyEntry(entity.primaryHierarchyId)) {
      warnings.push(`OntologyEntity "${entity.id}" referenziert einen externen primaryHierarchyId "${entity.primaryHierarchyId}".`);
    }
  }

  for (const relation of relations) {
    if (!relation.sourceId.trim()) {
      errors.push(`OntologyRelation "${relation.id}" benoetigt eine sourceId.`);
    }

    if (!relation.targetId.trim()) {
      errors.push(`OntologyRelation "${relation.id}" benoetigt eine targetId.`);
    }

    if (relation.sourceId && !entityIds.has(relation.sourceId)) {
      errors.push(`OntologyRelation "${relation.id}" referenziert eine unbekannte interne sourceId "${relation.sourceId}".`);
    }

    if (relation.targetId && !entityIds.has(relation.targetId)) {
      externalTargets.add(relation.targetId);
      warnings.push(`OntologyRelation "${relation.id}" nutzt externes target "${relation.targetId}".`);
    }

    if (!relation.title.trim()) {
      errors.push(`OntologyRelation "${relation.id}" benoetigt einen title.`);
    }
  }

  return {
    errors,
    warnings,
    stats: {
      entities: entities.length,
      relations: relations.length,
      externalTargets: externalTargets.size,
    },
  };
}
