export type {
  OntologyEntity,
  OntologyEntityDomain,
  OntologyEntityType,
  OntologyFirstMention,
  OntologyNeighbor,
  OntologyPolarity,
  OntologyRegistry,
  OntologyRelation,
  OntologyRelationType,
  OntologyValidationResult,
} from "./types";

export {
  ONTOLOGY_ENTITY_DOMAINS,
  ONTOLOGY_RELATION_TYPES,
} from "./types";

export {
  ONTOLOGY_RELATION_LABELS,
  getOntologyEntityTitle,
  getOntologyEntitiesByTag,
  getOntologyDisplayText,
  getOntologyEntity,
  getOntologyNeighbors,
  getOntologyRelationLabel,
  getOntologyRelationMarkerLabel,
  getOntologyRegistry,
  getOntologyRelationsByType,
  getOntologyRelationsForEntity,
  normalizeOntologyStrength,
  ontologyEntities,
  ontologyRelations,
  shouldShowOntologyExplanation,
  sortOntologyRelations,
} from "./registry";

export {
  deriveResonanceConnectionFromOntologyRelation,
  deriveResonanceConnectionsFromOntology,
  mapOntologyRelationToResonanceType,
  mergeResonanceConnections,
  shouldProjectOntologyRelationToSymbolNetwork,
  validateOntologyProjection,
} from "./projections";

export { validateOntology } from "./validateOntology";
