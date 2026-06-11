import { getHierarchyEntry } from "@/lib/symbols/hierarchy";

import { ontologyEntities, ontologyRelations } from "./registry";
import { ONTOLOGY_ENTITY_DOMAINS, ONTOLOGY_RELATION_TYPES } from "./types";
import type { OntologyEntity, OntologyRelation, OntologyValidationResult } from "./types";

const symbolicEntityTypes = new Set<OntologyEntity["type"]>(["archetype", "symbol"]);
const archetypalRoleEntityTypes = new Set<OntologyEntity["type"]>(["archetype", "symbol", "concept"]);
const validEntityDomains = new Set<string>(ONTOLOGY_ENTITY_DOMAINS);
const validRelationTypes = new Set<string>(ONTOLOGY_RELATION_TYPES);

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
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const externalTargets = new Set<string>();
  const outgoingResonatesWithCounts = new Map<string, number>();

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

    if (entity.domain && !validEntityDomains.has(entity.domain)) {
      errors.push(`ERROR: Entity "${entity.id}" has invalid domain "${entity.domain}".`);
    }

    if (!entity.domain) {
      warnings.push(`WARN: Entity "${entity.id}" has no domain.`);
    }

    if ("aliases" in entity && entity.aliases !== undefined) {
      if (!Array.isArray(entity.aliases)) {
        errors.push(`ERROR: Entity "${entity.id}" has invalid aliases.`);
      } else {
        const normalizedAliases = entity.aliases.map((alias) => alias.trim().toLocaleLowerCase("de"));
        const uniqueAliases = new Set(normalizedAliases);

        if (uniqueAliases.size !== normalizedAliases.length) {
          warnings.push(`WARN: Entity "${entity.id}" has duplicate aliases.`);
        }
      }
    }

    if (
      entity.gematria !== undefined &&
      (typeof entity.gematria !== "number" || !Number.isFinite(entity.gematria) || entity.gematria <= 0)
    ) {
      errors.push(`ERROR: Entity "${entity.id}" has invalid gematria.`);
    }

    if (
      entity.firstMention &&
      (!entity.firstMention.ref?.trim() || !entity.firstMention.role?.trim())
    ) {
      errors.push(`ERROR: Entity "${entity.id}" has incomplete firstMention.`);
    }

    if (entity.polarity && !entity.polarity.axis?.trim()) {
      errors.push(`ERROR: Entity "${entity.id}" has polarity without axis.`);
    }

    if (archetypalRoleEntityTypes.has(entity.type) && !entity.archetypalRole?.trim()) {
      warnings.push(`WARN: Entity "${entity.id}" has no archetypalRole.`);
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

    if (!validRelationTypes.has(relation.type)) {
      errors.push(`OntologyRelation "${relation.id}" nutzt unbekannten type "${relation.type}".`);
    }

    if (!relation.title.trim()) {
      errors.push(`OntologyRelation "${relation.id}" benoetigt einen title.`);
    }

    if (!relation.shortResonance.trim()) {
      errors.push(`OntologyRelation "${relation.id}" benoetigt eine shortResonance.`);
    }

    if ("strength" in relation && relation.strength === undefined) {
      errors.push(`OntologyRelation "${relation.id}" benoetigt eine strength, wenn das Feld vorhanden ist.`);
    }

    if (relation.type === "resonates_with") {
      outgoingResonatesWithCounts.set(
        relation.sourceId,
        (outgoingResonatesWithCounts.get(relation.sourceId) ?? 0) + 1,
      );
    }

    if (relation.type === "belongs_to") {
      const source = entitiesById.get(relation.sourceId);
      const target = entitiesById.get(relation.targetId);

      if (source && target && symbolicEntityTypes.has(source.type) && symbolicEntityTypes.has(target.type)) {
        warnings.push(`"${relation.sourceId} belongs_to ${relation.targetId}" may be hierarchical, not ontological. Consider is_expression_of.`);
      }
    }

    if (relation.type === "opposes") {
      warnings.push(`OntologyRelation "${relation.id}": "opposes" is a hard opposition. Consider contrasts_with for symbolic polarity.`);
    }

    if (relation.type === "fulfills") {
      warnings.push(`OntologyRelation "${relation.id}": For biblical pattern fulfillment, prefer fulfills_pattern_of.`);
    }

    if (
      typeof relation.strength === "number" &&
      relation.strength >= 80 &&
      !relation.scriptureAnchors?.length &&
      !relation.hebrewAnchors?.length
    ) {
      warnings.push(`OntologyRelation "${relation.id}": Strong relation has no scripture or hebrew anchor.`);
    }
  }

  outgoingResonatesWithCounts.forEach((count, entityId) => {
    if (count > 3) {
      warnings.push(`Entity "${entityId}" uses many generic resonates_with relations. Consider more precise relation types.`);
    }
  });

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
