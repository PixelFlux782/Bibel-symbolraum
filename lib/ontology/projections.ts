import type { ResonanceConnection, ResonanceType } from "../resonance";
import { ontologyEntities, ontologyRelations, sortOntologyRelations } from "./registry";
import { ONTOLOGY_RELATION_TYPES } from "./types";
import type { OntologyEntity, OntologyRelation, OntologyRelationType } from "./types";

const PROJECTABLE_SYMBOL_NETWORK_RELATION_TYPES = new Set<OntologyRelationType>([
  "is_expression_of",
  "is_threshold_to",
  "opens_into",
  "contrasts_with",
  "contains_pattern",
  "reveals",
  "emerges_from",
  "shares_letter",
  "shares_number",
  "appears_in_story",
  "structures_journey",
  "passes_through",
]);

const SYMMETRIC_RESONANCE_TYPES = new Set<ResonanceType>([
  "hebrew",
  "number",
  "shared_letter",
  "gematria",
  "polarity",
]);

type EntityReferenceSet = ReadonlySet<string> | readonly (OntologyEntity | string)[];

type ProjectionOptions = {
  entityReferences?: EntityReferenceSet;
};

export type OntologyWayProjection = {
  id: string;
  title: string;
  summary: string;
  movementSteps: string[];
  href: string;
  carrierIds: string[];
  carrierRelationIds: string[];
  targetCoreIds: string[];
  targetRelationIds: string[];
};

function normalizeEntityReferences(entityReferences?: EntityReferenceSet): ReadonlySet<string> | undefined {
  if (!entityReferences) return undefined;
  if ("has" in entityReferences && typeof entityReferences.has === "function") return entityReferences;

  const entityReferenceList = entityReferences as readonly (OntologyEntity | string)[];
  return new Set(entityReferenceList.map((entityOrId) => typeof entityOrId === "string" ? entityOrId : entityOrId.id));
}

function hasValidProjectionEndpoints(
  relation: OntologyRelation,
  entityIds: ReadonlySet<string> | undefined,
) {
  if (!relation.sourceId.trim() || !relation.targetId.trim()) return false;
  if (!entityIds) return true;

  return entityIds.has(relation.sourceId) && entityIds.has(relation.targetId);
}

export function mapOntologyRelationToResonanceType(
  type: OntologyRelationType,
): ResonanceType {
  switch (type) {
    case "shares_letter":
      return "hebrew";
    case "shares_number":
      return "number";
    case "appears_in_story":
      return "story";
    case "contains_pattern":
    case "fulfills_pattern_of":
      return "pattern";
    case "contrasts_with":
    case "opposes":
    case "has_polarity":
      return "polarity";
    case "is_threshold_to":
    case "opens_into":
      return "threshold";
    case "is_expression_of":
      return "expression";
    case "reveals":
      return "revelation";
    case "structures_journey":
    case "passes_through":
    case "tests":
      return "journey";
    default:
      return "meaning";
  }
}

export function shouldProjectOntologyRelationToSymbolNetwork(
  relation: OntologyRelation,
): boolean {
  const strength = relation.strength;
  const normalizedStrength = typeof strength === "number" && strength > 1
    ? strength / 100
    : strength;

  return (
    typeof normalizedStrength === "number"
    && normalizedStrength >= 0.7
    && PROJECTABLE_SYMBOL_NETWORK_RELATION_TYPES.has(relation.type)
  );
}

export function deriveResonanceConnectionFromOntologyRelation(
  relation: OntologyRelation,
  options: ProjectionOptions = {},
): ResonanceConnection | null {
  const entityIds = normalizeEntityReferences(options.entityReferences);

  if (!relation.shortResonance.trim()) return null;
  if (!hasValidProjectionEndpoints(relation, entityIds)) return null;

  return {
    id: `ontology-${relation.id}`,
    sourceId: relation.sourceId,
    targetId: relation.targetId,
    resonanceType: mapOntologyRelationToResonanceType(relation.type),
    title: relation.title,
    shortResonance: relation.shortResonance,
    explanation: relation.explanation,
    strength: relation.strength ?? 0,
    scriptureAnchors: relation.scriptureAnchors ?? [],
    hebrewAnchors: relation.hebrewAnchors ?? [],
    sourceRelationId: relation.id,
    derivedFromOntology: true,
  };
}

export function deriveResonanceConnectionsFromOntology(
  relations: OntologyRelation[],
  options: ProjectionOptions = {},
): ResonanceConnection[] {
  return relations.flatMap((relation) => {
    if (!shouldProjectOntologyRelationToSymbolNetwork(relation)) return [];

    const connection = deriveResonanceConnectionFromOntologyRelation(relation, options);
    return connection ? [connection] : [];
  });
}

function getConnectionKey(connection: ResonanceConnection) {
  const ids = SYMMETRIC_RESONANCE_TYPES.has(connection.resonanceType)
    ? [connection.sourceId, connection.targetId].sort()
    : [connection.sourceId, connection.targetId];

  return `${ids[0]}:${ids[1]}:${connection.resonanceType}`;
}

export function mergeResonanceConnections(
  manualConnections: ResonanceConnection[],
  ontologyConnections: ResonanceConnection[],
): ResonanceConnection[] {
  const knownConnectionKeys = new Set(manualConnections.map(getConnectionKey));
  const mergedConnections = [...manualConnections];

  for (const connection of ontologyConnections) {
    const connectionKey = getConnectionKey(connection);

    if (!knownConnectionKeys.has(connectionKey)) {
      knownConnectionKeys.add(connectionKey);
      mergedConnections.push(connection);
    }
  }

  return mergedConnections;
}

export function validateOntologyProjection(
  relations: OntologyRelation[],
  entities: OntologyEntity[] = [],
): string[] {
  const warnings: string[] = [];
  const entityIds = entities.length ? new Set(entities.map((entity) => entity.id)) : undefined;

  for (const relationType of ONTOLOGY_RELATION_TYPES) {
    mapOntologyRelationToResonanceType(relationType);
  }

  for (const relation of relations) {
    if (!shouldProjectOntologyRelationToSymbolNetwork(relation)) continue;

    if (!hasValidProjectionEndpoints(relation, entityIds)) {
      warnings.push(`WARN: Projectable ontology relation "${relation.id}" has invalid source or target.`);
    }
  }

  return warnings;
}

function isPatternEntity(entity: OntologyEntity) {
  return entity.domain === "pattern";
}

function toWayProjection(pattern: OntologyEntity): OntologyWayProjection {
  const carryingRelations = sortOntologyRelations(ontologyRelations)
    .filter((relation) => relation.type === "contains_pattern" && relation.targetId === pattern.id);
  const targetRelations = sortOntologyRelations(ontologyRelations)
    .filter((relation) => relation.type === "opens_into" && relation.sourceId === pattern.id);

  return {
    id: pattern.id,
    title: pattern.title,
    summary: pattern.summary,
    movementSteps: pattern.movementSteps ?? [],
    href: `/codex/${pattern.id}`,
    carrierIds: carryingRelations.map((relation) => relation.sourceId),
    carrierRelationIds: carryingRelations.map((relation) => relation.id),
    targetCoreIds: targetRelations.map((relation) => relation.targetId),
    targetRelationIds: targetRelations.map((relation) => relation.id),
  };
}

function uniqueWayProjections(patterns: OntologyEntity[]) {
  const seen = new Set<string>();

  return patterns
    .filter(isPatternEntity)
    .filter((pattern) => {
      if (seen.has(pattern.id)) return false;
      seen.add(pattern.id);
      return true;
    })
    .map(toWayProjection);
}

export function getPatternsForEntity(entityId: string): OntologyWayProjection[] {
  const directPatternIds = sortOntologyRelations(ontologyRelations)
    .filter((relation) => relation.type === "contains_pattern" && relation.sourceId === entityId)
    .map((relation) => relation.targetId);
  const entity = ontologyEntities.find((candidate) => candidate.id === entityId);
  const tagPatternIds = entity
    ? ontologyEntities
        .filter(isPatternEntity)
        .filter((pattern) => pattern.tags.some((tag) => entity.tags.includes(tag)))
        .map((pattern) => pattern.id)
    : [];

  return uniqueWayProjections(
    [...directPatternIds, ...tagPatternIds]
      .map((patternId) => ontologyEntities.find((candidate) => candidate.id === patternId))
      .filter((pattern): pattern is OntologyEntity => Boolean(pattern)),
  );
}

export function getPatternsLeadingToCore(coreId: string): OntologyWayProjection[] {
  const patternIds = sortOntologyRelations(ontologyRelations)
    .filter((relation) => relation.type === "opens_into" && relation.targetId === coreId)
    .map((relation) => relation.sourceId);

  return uniqueWayProjections(
    patternIds
      .map((patternId) => ontologyEntities.find((candidate) => candidate.id === patternId))
      .filter((pattern): pattern is OntologyEntity => Boolean(pattern)),
  );
}

export function getPrimaryWayForEntity(entityId: string): OntologyWayProjection | null {
  return getPatternsForEntity(entityId)[0] ?? null;
}

export function getTargetCoresForPattern(patternId: string) {
  return sortOntologyRelations(ontologyRelations)
    .filter((relation) => relation.type === "opens_into" && relation.sourceId === patternId)
    .map((relation) => ({
      relation,
      entity: ontologyEntities.find((candidate) => candidate.id === relation.targetId),
    }))
    .filter((item): item is { relation: OntologyRelation; entity: OntologyEntity } => Boolean(item.entity));
}
