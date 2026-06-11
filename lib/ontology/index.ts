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
  getOntologyEntitiesByTag,
  getOntologyDisplayText,
  getOntologyEntity,
  getOntologyNeighbors,
  getOntologyRegistry,
  getOntologyRelationsByType,
  getOntologyRelationsForEntity,
  ontologyEntities,
  ontologyRelations,
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
